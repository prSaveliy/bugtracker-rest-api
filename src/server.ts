import { createServer, IncomingMessage, ServerResponse } from "node:http";

import { WebSocketServer, WebSocket } from "ws";

import type { Bugs, ServeOptions, Headers, WSMessage } from "./types.js";
import { router } from "./router.js";
import { dumpData, loadData } from "./handleData.js";
import "./handlers.js";

export class Server {
  public version: number;
  private server;
  public wss: WebSocketServer;

  constructor(public bugs: Bugs) {
    this.version = 0;

    this.server = createServer((req: IncomingMessage, res: ServerResponse) => {
      const serveParams: ServeOptions = {
        context: this,
        req,
        res,
        next: notFound
      };
      serveFromRouter(serveParams);
    })

    this.wss = new WebSocketServer({
      server: this.server,
      path: "/bugs"
    });

    this.wss.on("connection", ws => {
      console.log("ws connected");

      const response: WSMessage = {
        type: "init",
        version: this.version,
        bugs: Object.values(this.bugs)
      };

      ws.send(JSON.stringify(response));

      ws.on("close", () => {
        console.log("ws disconnected");
      })
    });
  }

  start(port: number): void {
    this.server.listen(port, () => {
      console.log(`Listening on port ${port}`);
    });
  }

  async updated() {
    this.version++;

    const response: WSMessage = {
      type: "update",
      version: this.version,
      bugs: Object.values(this.bugs)
    }

    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(response));
      }
    })

    await dumpData(this.bugs);
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

(async () => {
  const bugs = await loadData();
  new Server(bugs).start(8000);
})();