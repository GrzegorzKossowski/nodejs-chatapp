const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const totalClients = document.getElementById("totalClients");
const firstName = document.getElementById("firstName");
const sendBtn = document.getElementById("sendBtn");
let isTyping = false;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat-message", {
      message: input.value,
      id: socket.id,
      name: firstName.value || "Anonymous",
    });
    input.value = "";
    input.focus();
    sendBtn.setAttribute("disabled", "true");
  }
});

let typingTimeout = 0;
input.addEventListener("input", function (e) {
  sendBtn.setAttribute("disabled", "true");
  if (this.value.length != 0) {
    sendBtn.removeAttribute("disabled");
  }
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing", {
      id: socket.id,
      name: firstName.value || "Anonymous",
    });
  }

  clearTimeout(typingTimeout);
  // Wyślij "stopTyping" po 1 sekundzie bez wpisywania
  typingTimeout = setTimeout(() => {
    socket.emit("stopTyping", {
      id: socket.id,
      name: firstName.value || "Anonymous",
    });
    isTyping = false;
  }, 5000);
});

input.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendBtn.click();
  }
});

socket.on("client-total", (data) => {
  totalClients.textContent = data;
});

socket.on("chat-message", (data) => {
  const element = document.getElementById(data.id);
  if (element) element.remove();
  const currentDate = new Date();
  const stamp = document.createElement("small");
  stamp.classList.add("italic");
  stamp.textContent = `${data.name ?? "Anonymous"} - ${formatDate(
    currentDate
  )}`;

  const stampContainer = document.createElement("div");
  stampContainer.classList.add("post-timestamp");
  stampContainer.appendChild(stamp);

  const item = document.createElement("div");
  if (data.id === socket.id) {
    item.classList.add("message", "outgoing");
  } else {
    item.classList.add("message", "incoming");
  }
  item.append(data.message, stampContainer);
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on("userTyping", (data) => {
  const item = document.createElement("div");
  item.id = data.id;
  item.classList.add("message", "incoming");
  item.textContent = `${data.name} is typing...`;
  messages.appendChild(item);
  messages.scrollTo(0, messages.scrollHeight);
});

socket.on("userStopTyping", (data) => {
  const element = document.getElementById(data.id);
  if (element) element.remove();
});

function formatDate(date) {
  const day = date.getDate();
  const monthNames = [
    "sty",
    "lut",
    "mar",
    "kwi",
    "maj",
    "cze",
    "lip",
    "sie",
    "wrz",
    "paź",
    "lis",
    "gru",
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day} ${month} ${year} - ${hours}:${minutes}.${seconds}`;
}
