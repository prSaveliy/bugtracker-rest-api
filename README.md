# BugTracker REST API

A **Bug Tracker** application built with **Node.js** and **TypeScript**, featuring an asynchronous HTTP server and real-time updates via **WebSockets**.  
The project includes a minimal client-side UI with **Tailwind CSS** and live DOM updates, plus a fully tested HTTP API.


## Features

- Asynchronous HTTP server (plain Node.js)
- Real-time updates using WebSockets
- HTTP API covered with Jest + Supertest tests
- WebSocket behavior tested manually via Postman
- Client-side UI with Tailwind CSS

---

## Installation

**Clone the repository:**

```bash
git clone https://github.com/prSaveliy/bugtracker-rest-api.git
cd bugtracker-rest-api
```

**Install dependencies:**
```bash
npm install
```

**Configure TypeScript:**

```bash
npx tsc
npx tsc --watch
```

**Configure Tailwind CLI**

```bash
npx tailwindcss -i ./src/public/style.css -o ./src/public/output.css --watch
```

**Running the client server:**

```bash
python -m http.server 5000
```

**Running the backend server:**

```bash
cd src
tsx server.ts
```
Access the app: http://localhost:5000/src/public/index.html
