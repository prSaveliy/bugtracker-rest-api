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

type Update = "PUT" | "DELETE" | "POST" | "PATCH";

type WSMessage = { type: "init", updateType?: Update, version: number, bugs: Bugs } |
                 { type: "update", updateType?: Update, version: number, bugs: Bugs }

type BugsArray = {
    [x: number]: BugFields;
}[];

type ScrollPositionObject = {
  [id: number]: number
}

export type { Route, Bugs, BugFields, ServeOptions, Headers, Response, BugData, CommentData, WSMessage, BugsArray, Update, ScrollPositionObject };