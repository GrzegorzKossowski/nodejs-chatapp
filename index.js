// import dotenv from "dotenv";
// dotenv.config();
import path from "path";
import express from "express";
import { Server } from "socket.io";

const port = process.env.PORT || 8080;
const __dirname = path.resolve();

const app = express();
app.use(express.static(path.join(__dirname, "public")));

// Obsługa wszystkich innych tras - przekierowanie do index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(port, () => {
  console.log(
    `\nServer running in ${process.env.NODE_ENV} mode on ${port}\n`
  );
});

let socketConnected = new Set();
const io = new Server(server);
io.on("connection", onConnected);

function onConnected(socket) {
  // add users count
  socketConnected.add(socket.id);
  io.emit("client-total", socketConnected.size);
  // delete users count
  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
    socketConnected.delete(socket.id);
    io.emit("client-total", socketConnected.size);
  });

  socket.on("chat-message", (data) => {
    io.emit("chat-message", data);
  });

  // Odbieranie sygnału "typing" od klienta
  socket.on("typing", (data) => {
    console.log("typing");
    // Emitowanie sygnału "userTyping" do wszystkich innych użytkowników
    socket.broadcast.emit("userTyping", data);
  });

  socket.on("stopTyping", (data) => {
    // Emitowanie sygnału do zatrzymania komunikatu o pisaniu
    console.log("stopTyping");
    socket.broadcast.emit("userStopTyping", data);
  });
}
