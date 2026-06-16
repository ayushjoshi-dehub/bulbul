import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

const io = new Server(server, { cors: { origin: [allowedOrigin] } });

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// online users map = { userId: socketId }
const userSocketMap = {};
//socket.io only works with socket ids, so we need to map user ids to socket ids to know who is online 
// and send messages in realtime to the right users. 
// This is a simple in-memory map, but in production you might want to use a more robust solution like Redis for scalability and persistence.
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() sends event to everyone - broadcast
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // socket.on is used to listen for events
  socket.on("disconnect", () => {
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };