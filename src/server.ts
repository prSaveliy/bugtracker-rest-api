import { createServer, IncomingMessage, ServerResponse } from "node:http";

import type { PromiseResolveFunction, Bugs, ServeOptions, Headers, Response } from "./types.js";
import { router } from "./router.js";
import { dumpData, loadData } from "./handleData.js";
import "./handlers.js";

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

  start(port: number) {
    this.server.listen(port, () => {
      console.log(`Listening on port ${port}`);
    })
  }

  getBugs(): Response {
    return {};
  }
  waitForChanges(wait: number) {}
  async updated() {}
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
      if (err.status !== null && typeof err.status === 'number') return err;
      else return { status: 500, body: String(err) };
    });
  if (!resolved) return next(res);
  else {
    const { status = 200, body, headers = defaultHeaders } = await resolved;
    res.writeHead(status, headers);
    res.end(body);
  }
}

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

Server.prototype.waitForChanges = function(wait: number): Promise<any> {
  return new Promise(resolve => {
    this.waiting.push(resolve);
    setTimeout(() => {
      if (!this.waiting.includes(resolve)) return;
      this.waiting = this.waiting.filter(rslv => rslv !== resolve);
      resolve({ status: 304 });
    }, 1000 * wait);
  });
};

Server.prototype.updated = async function() {
  this.version++;
  const bugs = this.getBugs();
  this.waiting.forEach(resolve => resolve(bugs));
  this.waiting = [];
  await dumpData(this.bugs);
};

(async () => {
  const bugs = await loadData();
  new Server(bugs).start(8000);
})();