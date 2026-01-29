import { createServer, IncomingMessage, ServerResponse } from "node:http";

import type { PromiseResolveFunction, Bugs, ServeOptions, Headers, Response } from "./types.js";

import { Router } from "./router.js";

const router = new Router();

export class Server {
  public version: number;
  public waiting: PromiseResolveFunction[];
  private server;

  constructor(public bugs: Bugs) {
    this.version = 0;
    this.waiting = [];

    this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const serveParams: ServeOptions = {
        context: this,
        req,
        res,
        next: notFound
      };
      serveFromRouter(serveParams);
    })
  }

  getBugs(): Response {
    return {};
  }
  waitForChanges(wait: number) {}
  updated() {}
}

function notFound(res: ServerResponse) {
  res.writeHead(404, "Not found.");
  res.end("<h1>Not found.</h1>");
}

const defaultHeaders: Headers = {
  "Content-Type": "text/plain"
};

async function serveFromRouter({ context, req, res, next }: ServeOptions) {
  const resolved = await router.resolve(req, context)
    .catch(err => {
      if (err.status !== null && err.status === 'number') return err;
      else return { status: 500, body: String(err) };
    });
  if (!resolved) return next(res);
  else {
    const { status = 200, body, headers = defaultHeaders } = await resolved;
    res.writeHead(status, headers);
    res.end(body);
  }
}

const urlRegExp: RegExp = /^\/bugs\/(\d+)$/; 

router.add({
  method: "GET",
  url: urlRegExp,
  handler: async (context: Server, id: string, req: IncomingMessage) => {
  if (Object.hasOwn(context.bugs, +id)) {
    return {
      body: JSON.stringify(context.bugs[+id]),
      headers: {
        "Content-Type": "application/json"
      }
    };
  } else {
    return {
      status: 404,
      body: `Bug with id: ${+id} not found.`
    };
  }
} });

async function parseRequestJSON(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    })
    req.on("error", err => reject(err));
  })
}

router.add({
  method: "PUT", 
  url: urlRegExp, 
  handler: async (context: Server, id: string, req: IncomingMessage) => {
  let body: any;
  parseRequestJSON(req)
    .then(data => {body = data})
    .catch(err => {
      return {
        status: 400,
        body: "Invalid JSON."
      }
    });
  if (
    !body ||
    typeof body.id !== 'number' ||
    typeof body.title !== 'string' ||
    typeof body.description !== 'string'
  ) {
    return {
      status: 400,
      body: "Bad bug data."
    };
  }
  context.bugs[+id] = {
    id: +id,
    title: body.title,
    description: body.description,
    status: "open",
    comments: []
  };
  context.updated();
  return { status: 204 };
} });

router.add({
  method: "DELETE", 
  url: urlRegExp, 
  handler: async (context: Server, id: string, req: IncomingMessage) => {
  if (Object.hasOwn(context.bugs, +id)) {
    delete context.bugs[+id];
    context.updated();
  }
  return { status: 204 };
} });

router.add({ 
  method: "POST", 
  url: /^\/bugs\/(\d+)\/comments/, 
  handler: async (context: Server, id: string, req: IncomingMessage) => {
    let commentData: any;
    parseRequestJSON(req)
      .then(data => {commentData = data})
      .catch(err => {
        return {
          status: 400,
          body: "Invalid JSON."
        }
      })
    if (
      !commentData ||
      commentData.author !== 'string' ||
      commentData.message !== 'string'
    ) {
      return {
        status: 400,
        body: "Bad comment data."
      }
    }
    if (Object.hasOwn(context.bugs, +id)) {
      context.bugs[+id].comments.push(commentData);
      if (context.bugs[+id].status === "open") {
        context.bugs[+id].status = "in-progress";
      }
      context.updated();
      return { status: 204 };
    } else {
      return {
        status: 404,
        body: `Bug with id: ${+id} not found.`
      };
    }
} });

Server.prototype.getBugs = function () {
  const bugs = Object.keys(this.bugs).map(id => this.bugs[+id]);
  return {
    body: JSON.stringify(bugs),
    headers: {
      "Content-Type": "application/json",
      "ETag": `${this.version}`,
      "Cache-Control": "no-store"
    }
  };
};

router.add({ 
  method: "GET", 
  url: /^\/bugs$/, 
  handler: async (context: Server, id: string, req: IncomingMessage) => {
    let version;
    let wait;
    if (req.headers["if-none-match"]) {
      version = /"(.*)"/.exec(req.headers["if-none-match"]);
    }
    if (req.headers["prefer"] && typeof req.headers["prefer"] === 'string') {
      wait = /\bwait=(\d+)/.exec(req.headers["prefer"])
    }

    if (!version || +version[1] !== context.version) {
      return context.getBugs();
    } else if (!wait) {
      return { status: 304 };
    } else {
      return context.waitForChanges(+wait[1]);
    }
} });

Server.prototype.waitForChanges = function(wait: number): Promise<any> {
  return new Promise(resolve => {
    this.waiting.push(resolve);
    setTimeout(() => {
      if (!this.waiting.includes(resolve)) return;
      this.waiting.filter(rslv => rslv !== resolve);
      return { status: 304 };
    }, 1000 * wait);
  });
};

Server.prototype.updated = function() {
  this.version++;
  const bugs = this.getBugs();
  this.waiting.forEach(resolve => resolve(bugs));
  this.waiting = [];
};