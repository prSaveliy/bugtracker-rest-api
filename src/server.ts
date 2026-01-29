import { createServer, IncomingMessage, ServerResponse } from "node:http";

import type { PromiseResolveFunction, Bugs, ServeOptions, Headers } from "./types.js";

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

router.add({method: "GET", url: urlRegExp, handler: async (context: Server, id: string, req: IncomingMessage) => {
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

router.add({method: "PUT", url: urlRegExp, handler: async (context: Server, id: string, req: IncomingMessage) => {
  let body: any;
  parseRequestJSON(req)
    .then(data => body = data)
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
    description: body.desctiption,
    status: "open",
    comments: []
  };
  return { status: 204 };
} })