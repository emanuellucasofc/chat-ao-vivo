const socket = io();

const myName = localStorage.getItem("chat_name");
if (!myName) window.location.href = "/";

document.getElementById("me").textContent = `Você: ${myName}`;

socket.emit("join", myName, (response) => {
  if (response.error) {
    alert(response.error);
    localStorage.removeItem("chat_name");
    window.location.href = "/";
  }
});

const messagesDiv = document.getElementById("messages");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const onlineSpan = document.getElementById("online");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPanel = document.getElementById("emojiPanel");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");

function addSystem(text) {
  const div = document.createElement("div");
  div.className = "system";
  div.textContent = text;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function addMessage({ name, msg, type }) {
  const bubble = document.createElement("div");
  bubble.className = `bubble ${name === myName ? "mine" : "other"}`;

  if (type === "image") {
    const img = document.createElement("img");
    img.src = msg;
    img.className = "chat-img";
    bubble.appendChild(img);
  } else {
    bubble.textContent = `${name}: ${msg}`;
  }

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

  const isImageLink = msg.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  socket.emit("chatMessage", {
    msg,
    type: isImageLink ? "image" : "text"
  });

  messageInput.value = "";
});

emojiBtn.onclick = () => {
  emojiPanel.style.display =
    emojiPanel.style.display === "block" ? "none" : "block";
};

emojiPanel.querySelectorAll("span").forEach((emoji) => {
  emoji.onclick = () => {
    messageInput.value += emoji.textContent;
    emojiPanel.style.display = "none";
    messageInput.focus();
  };
});

uploadBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("chatMessage", {
      msg: reader.result,
      type: "image"
    });
  };
  reader.readAsDataURL(file);
};
