import { IncomingMessage } from "node:http";

import { router } from "./router.js";
import { Server } from "./server.js";
import { validateBug, validateComment } from "./validation.js";

import type { BugData, CommentData } from "./types.js";

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

async function parseRequestJSON<T>(req: IncomingMessage): Promise<T> {
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
    let body: BugData;
    try {
      body = await parseRequestJSON<BugData>(req);
    } catch(err) {
      console.log(err);
      return {
        status: 400,
        body: "Invalid JSON."
      }
    }
    const isValidated = validateBug(body);
    if (!isValidated) {
      return {
        status: 400,
        body: "Bad bug data."
      };
    }
    context.bugs[+id] = {
      id: +id,
      author: body.author,
      title: body.title,
      description: body.description,
      status: "open",
      comments: []
    };
    await context.updated();
    return { status: 204 };
} });

router.add({
  method: "DELETE", 
  url: urlRegExp, 
  handler: async (context: Server, id: string, req: IncomingMessage) => {
  if (Object.hasOwn(context.bugs, +id)) {
    delete context.bugs[+id];
    await context.updated();
  }
  return { status: 204 };
} });

router.add({ 
  method: "POST", 
  url: /^\/bugs\/(\d+)\/comments/, 
  handler: async (context: Server, id: string, req: IncomingMessage) => {
    let commentData: CommentData;
    try {
      commentData = await parseRequestJSON<CommentData>(req);
    } catch {
      return {
        status: 400,
        body: "Invalid JSON."
      }
    }
    const isValidated = validateComment(commentData);
    if (!isValidated) {
      return {
        status: 400,
        body: "Bad comment data."
      };
    }
    if (Object.hasOwn(context.bugs, +id)) {
      context.bugs[+id].comments.push(commentData);
      if (context.bugs[+id].status === "open") {
        context.bugs[+id].status = "in-progress";
      }
      await context.updated();
      return { status: 204 };
    } else {
      return {
        status: 404,
        body: `Bug with id: ${+id} not found.`
      };
    }
} });