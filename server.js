const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3001", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    socket.on("join", (room) => {
      if (typeof room === "string" && room.length < 100) socket.join(room);
    });
    socket.on("leave", (room) => {
      if (typeof room === "string") socket.leave(room);
    });
  });

  // Exposed so API route handlers (same Node process) can emit events.
  global.__vetraIo = io;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`\n  Vetra Food rodando em http://${hostname}:${port}\n`);
    });
});
