const express = require("express");
const bodyParser = require("body-parser");
const { Server } = require("socket.io");

// Create a Socket.io server attached to the HTTP server
const io = new Server({
  cors: true,
});

// Create an Express application
const app = express();

// MiddleWares
app.use(bodyParser.json());

const emailToSocketMapping = new Map();
const socketToEmailMapping = new Map();

// Set up a connection event listener for Socket.io
io.on("connection", (socket) => {
  console.log("A user connected");

  // Set up an event listener for messages from the client
  socket.on("join-room", (msg) => {
    const { email, roomId } = msg;
    console.log("Message received: " + JSON.stringify(msg));
    emailToSocketMapping.set(email, socket.id);
    socketToEmailMapping.set(socket.id, email);
    socket.join(roomId);
    socket.emit("joined-room", { roomId }); // Navigate to Room (New Page on Frontend)
    io.to(roomId).emit("user-joined", { email }); // Broadcast the message to connected client to create Offer and emit event
  });

  socket.on("call-user", (msg) => {
    // email is the person been called.
    const { email, offer } = msg;
    const from = socketToEmailMapping.get(socket.id);
    const socketId = emailToSocketMapping.get(email);
    socket.to(socketId).emit("call-incoming", { from, offer });
  });

  socket.on("call-accepted", (msg) => {
    const { from, ans } = msg;
    const socketId = emailToSocketMapping.get(from);
    socket.to(socketId).emit("call-accepted", { ans });
  });

  socket.on("negotiation-needed", (msg) => {
    console.log("negotiation-needed");
    const { offer, to } = msg;
    const socketId = emailToSocketMapping.get(to);
    const from = socketToEmailMapping.get(socket.id);
    socket.to(socketId).emit("negotiation-needed", { from, offer });
  });

  socket.on("negotiation-done", (msg) => {
    console.log("negotiation-done");

    const { to, ans } = msg;
    socket.to(to).emit("negotiation-final", { from: socket.id, ans });
  });

  // Set up a disconnection event listener
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Define the port to listen on
const PORT = process.env.PORT || 8000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

io.listen(4000);
