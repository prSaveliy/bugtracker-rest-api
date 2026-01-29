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

type PromiseResolveFunction = (value: Response) => void;

type BugFields = {
  id: number,
  title: string,
  description: string,
  status: "open" | "in-progress" | "closed",
  comments: string[]
};

type Bugs = Record<number, BugFields>;

type ServeOptions = {
  context: Server;
  req: IncomingMessage;
  res: ServerResponse;
  next: (res: ServerResponse) => void;
};

export { Route, PromiseResolveFunction, Bugs, ServeOptions, Headers, Response };