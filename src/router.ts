import { IncomingMessage } from "node:http";

import type { Route } from "./types.js"
import type { Server } from "./server.js";

async function methodNotAllowed(req: IncomingMessage) {
  return {
    status: 405,
    body: `Method ${req.method} not allowed.`
  };
}

export class Router {
  public routes: Route[] = []

  add(path: Route) {
    this.routes.push(path);
  }

  async resolve(req: IncomingMessage, context: Server) {
    const url = req.url || "/"
    const { pathname } = new URL(url, "http://d");
    for (let { method, url, handler } of this.routes) {
      const match = url.exec(pathname);
      if (!this.routes.some(route => route.method === req.method)) {
        return methodNotAllowed(req);
      } else if (!match || method !== req.method) continue;
      else {
        const urlItem = match[1];
        return handler(context, urlItem, req);
      }
    }
  }
}

export const router = new Router();