import { IncomingMessage, ServerResponse } from "node:http";

import { Server } from "./server.js";

// Router types
type Route = {
  method: string,
  url: RegExp,
  handler: (context: Server, urlItem: string, req: IncomingMessage) => Promise<Response | void>
};

// Server types
type Headers = Record<string, string>;

type Response = {
  status?: number,
  body?: string,
  headers?: Headers
};

type BugFields = {
  id: number,
  author: string,
  title: string,
  description: string,
  status: "open" | "in-progress" | "closed",
  comments: CommentData[]
};

type Bugs = Record<number, BugFields>;

type ServeOptions = {
  context: Server;
  req: IncomingMessage;
  res: ServerResponse;
  next: (res: ServerResponse) => void;
};

type BugData = {
  author: string,
  title: string,
  description: string
};

type CommentData = {
  author: string,
  message: string
};

type WSMessage = { type: "init", version: number, bugs: BugFields[] } |
                 { type: "update", version: number, bugs: BugFields[] }

export type { Route, Bugs, ServeOptions, Headers, Response, BugData, CommentData, WSMessage };