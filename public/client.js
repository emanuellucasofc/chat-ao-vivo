const socket = io();

const myName = localStorage.getItem("chat_name");
if (!myName) window.location.href = "/";

document.getElementById("me").textContent = `Você: ${myName}`;

socket.emit("join", myName);

const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const onlineSpan = document.getElementById("online");

function addSystem(text) {
  const div = document.createElement("div");
  div.className = "system";
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addMessage({ name, msg }) {
  const bubble = document.createElement("div");
  const isMine = name === myName;

  bubble.className = `bubble ${isMine ? "mine" : "other"}`;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = isMine ? "Você" : name;

  const body = document.createElement("div");
  body.textContent = msg;

  bubble.appendChild(meta);
  bubble.appendChild(body);

  messagesDiv.appendChild(bubble);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

socket.on("system", addSystem);
socket.on("message", addMessage);

socket.on("online", (count) => {
  onlineSpan.textContent = `${count} online`;
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = messageInput.value.trim();
  if (!msg) return;
  socket.emit("chatMessage", msg);
  messageInput.value = "";
  messageInput.focus();
});
