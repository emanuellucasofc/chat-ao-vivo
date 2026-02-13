const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  maxHttpBufferSize: 1e8
});

app.use(express.static(path.join(__dirname, "public")));

let onlineCount = 0;
let activeUsers = new Set();

function broadcastOnline() {
  io.emit("online", onlineCount);
}

io.on("connection", (socket) => {
  onlineCount++;
  broadcastOnline();

  socket.on("join", (name, callback) => {
    name = name.trim();

    if (name.length < 2 || name.length > 20) {
      return callback({ error: "Nome inválido." });
    }

    if (activeUsers.has(name)) {
      return callback({ error: "Nome já está em uso." });
    }

    socket.data.name = name;
    activeUsers.add(name);

    socket.broadcast.emit("system", `${name} entrou no chat`);
    callback({ success: true });
  });

  socket.on("chatMessage", (data) => {
    const name = socket.data.name;
    if (!name) return;

    io.emit("message", {
      name,
      msg: data.msg,
      type: data.type || "text"
    });
  });

  socket.on("disconnect", () => {
    const name = socket.data.name;
    if (name) {
      activeUsers.delete(name);
      io.emit("system", `${name} saiu do chat`);
    }

    onlineCount = Math.max(0, onlineCount - 1);
    broadcastOnline();
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log("Servidor rodando na porta", PORT);
});
