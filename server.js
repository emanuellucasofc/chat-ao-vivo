const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let onlineCount = 0;

function broadcastOnline() {
  io.emit("online", onlineCount);
}

io.on("connection", (socket) => {
  onlineCount++;
  broadcastOnline();

  console.log("Usuário conectado:", socket.id);

  socket.on("join", (name) => {
    socket.data.name = name;
    socket.broadcast.emit("system", `${name} entrou no chat`);
  });

  socket.on("chatMessage", (msg) => {
    const name = socket.data.name || "Anônimo";
    io.emit("message", { name, msg });
  });

  socket.on("disconnect", () => {
    const name = socket.data.name;
    if (name) {
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
