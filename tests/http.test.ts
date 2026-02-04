import request from "supertest";

import { Server } from "../src/server.js";
import { Bugs, BugData, CommentData } from "../src/types.js";

describe("Server HTTP requests", () => {
  let app: Server;
  const mockBugs: Bugs = {
      1: {
        id: 1,
        author: "Aldous",
        title: "Time Limit Exceeded",
        description: "Time Limit Exceeded",
        status: "open",
        comments: []
      },
      2: {
        id: 2,
        author: "Oscar",
        title: "Type Error",
        description: "TypeError: list indices must be integers or slices, not str",
        status: "in-progress",
        comments: [{
          author: "Dorian",
          message: "Try making the indices of type 'number'"
        }]
      }
    };

  describe("GET /bugs/:id", () => {
    /*
      return info if the bug with this id exists
      return 404 if doesn't exist
      return 404 if id is not a number
    */

    beforeAll(() => {
      app = new Server(mockBugs);
      app.start(0);
    });

    afterAll(() => {
      app.wss.close();
      app.close();
    });

    test("return 200 if the bug with this id exists", async () => {
      const response = await request(app.httpServer).get("/bugs/1");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toBe("application/json");

      const body = JSON.parse(response.text);
      expect(body).toEqual(mockBugs[1]);
    });

    test("return 404 if the bug with this id doesn't exist", async () => {
      const response = await request(app.httpServer).get("/bugs/3");

      expect(response.status).toBe(404);
    });

    test("return 404 if id is not a number", async () => {
      const response = await request(app.httpServer).get("/bugs/notanumber");

      expect(response.status).toBe(404);
    });
  });

  describe("DELETE /bugs/:id", () => {
    /*
      return 204 and delete if the bug with the id exists
      return 204 if the bug with the id doesn't exist
      return 404 if id is not a number
    */
    let freshMockBugs: Bugs;

    beforeEach(() => {
      freshMockBugs = structuredClone(mockBugs);
      app = new Server(freshMockBugs, "tests/testData.json");
      app.start(0);
    });

    afterEach(() => {
      app.wss.close();
      app.close();
    });

    test("return 204 if the bug with the id exists", async () => {
      const response = await request(app.httpServer).delete("/bugs/1");

      expect(response.status).toBe(204);
      expect(freshMockBugs).toEqual({ 2: { ...freshMockBugs[2] } });
    });

    test("return 204 if the bug with the id doesn't exist", async () => {
      const response = await request(app.httpServer).delete("/bugs/3");

      expect(response.status).toBe(204);
    });

    test("return 404 if id is not a number", async () => {
      const response = await request(app.httpServer).delete("/bugs/notanumber");

      expect(response.status).toBe(404);
    });
  });

  describe("PUT /bugs/:id", () => {
    /*
      return 204 and put if the bug with the id doesn't exist
      return 204 and put if the bug with the id exists
      return 400 if the data wasn't validated
    */
    let freshMockBugs: Bugs;
    const mockSendData: BugData = {
      author: "George",
      title: "Type Error",
      description: "TypeError: list indices must be integers or slices, not str"
    };

    beforeEach(() => {
      freshMockBugs = {};
      app = new Server(freshMockBugs, "tests/testData.json");
      app.start(0);
    });

    afterEach(() => {
      app.wss.close();
      app.close();
    });

    test("return 204 and put if the bug with the id doesn't exist", async () => {
      const response = await request(app.httpServer)
        .put("/bugs/1")
        .send(JSON.stringify(mockSendData))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(204);
      expect(freshMockBugs).toEqual({
        1: {
          id: 1,
          ...mockSendData,
          status: "open",
          comments: []
        }
      });
    });

    test("return 204 and put if the bug with the id exists", async () => {
      app.bugs = {
        1: {
          id: 1,
          ...mockSendData,
          status: "open",
          comments: []
        }
      };
      
      const response = await request(app.httpServer)
        .put("/bugs/1")
        .send({
          author: "Michael",
          title: "Type Error",
          description: "TypeError: list indices must be integers or slices, not str"
        })
        .set("Content-Type", "application/json");
      
      expect(response.status).toBe(204);
      expect(app.bugs[1].author).toBe("Michael");
    });

    test("return 400 if the data wasn't validated", async () => {
      const response1 = await request(app.httpServer)
        .put("/bugs/1")
        .send({
          author: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          title: "Type Error",
          description: "TypeError: list indices must be integers or slices, not str"
        })
        .set("Content-Type", "application/json");

      expect(response1.status).toBe(400);
      expect(response1.text).toBe("Bad bug data.");

      const response2 = await request(app.httpServer)
        .put("/bugs/1")
        .send({
          author: "George",
          title: 123,
          description: "TypeError: list indices must be integers or slices, not str"
        })
        .set("Content-Type", "application/json");

      expect(response2.status).toBe(400);
      expect(response2.text).toBe("Bad bug data.");
    });
  });

  describe("POST /bugs/:id/comments", () => {
    /*
      return 204 and post if the bug with the id exists and bug status = "in-progress"
      return 404 if the bug with the id doesn't exist
      return 400 if the data wasn't validated
    */
    let freshMockBugs: Bugs;

    beforeEach(() => {
      freshMockBugs = structuredClone(mockBugs);
      app = new Server(freshMockBugs, "tests/testData.json");
      app.start(0);
    });

    afterEach(() => {
      app.wss.close();
      app.close();
    });
    
    test("return 204 and post if the bug with the id exists and bug status = 'in-progress'", async () => {
      const MockCommentSendData: CommentData = {
        author: "Will",
        message: "Try doing this..."
      };

      const response = await request(app.httpServer)
        .post("/bugs/1/comments")
        .send(JSON.stringify(MockCommentSendData))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(204);
      expect(app.bugs[1].comments[0]).toEqual(MockCommentSendData);
      expect(app.bugs[1].status).toBe("in-progress");
    });

    test("return 404 if the bug with the id doesn't exist", async () => {
      const MockCommentSendData: CommentData = {
        author: "Will",
        message: "Try doing this..."
      };

      const response = await request(app.httpServer)
        .post("/bugs/3/comments")
        .send(JSON.stringify(MockCommentSendData))
        .set("Content-Type", "application/json");

      expect(response.status).toBe(404);
    });

    test("return 400 if the data wasn't validated", async () => {
      const response1 = await request(app.httpServer)
        .post("/bugs/3/comments")
        .send(JSON.stringify({
          author: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          message: "Try doing this..."
        }))
        .set("Content-Type", "application/json");

      expect(response1.status).toBe(400);
      expect(response1.text).toBe("Bad comment data.");

      const response2 = await request(app.httpServer)
        .post("/bugs/3/comments")
        .send(JSON.stringify({
          author: true,
          message: "Try doing this..."
        }))
        .set("Content-Type", "application/json");

      expect(response2.status).toBe(400);
      expect(response2.text).toBe("Bad comment data.");
    });
  });

  describe("HTTP Method Not Allowed", () => {
    /*
      return 405 if method is not allowed 
    */

    beforeEach(() => {
      app = new Server({}, "tests/testData.json");
      app.start(0);
    });

    afterEach(() => {
      app.wss.close();
      app.close();
    });

    test("return 405 if method is not allowed", async () => {
      const response = await request(app.httpServer)
        .mkcol("/bugs/1")
        .send({})
        .set("Content-Type", "application/json");

      expect(response.status).toBe(405);
    });
  });
});