import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const defaultOrigins = ["http://localhost:5173", "http://localhost:5174"];
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)
  .concat(defaultOrigins);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const userSocketMap = new Map();
const socketUserMap = new Map();

function getUserIdFromSocket(socket) {
  return socket.handshake.auth?.userId || socket.handshake.query.userId || null;
}

function getOnlineUsers() {
  return Array.from(userSocketMap.keys());
}

function registerSocket(userId, socketId) {
  const key = String(userId);
  const sockets = userSocketMap.get(key) ?? new Set();
  sockets.add(socketId);
  userSocketMap.set(key, sockets);
  socketUserMap.set(socketId, key);
}

function unregisterSocket(socketId) {
  const userId = socketUserMap.get(socketId);
  if (!userId) return;

  const sockets = userSocketMap.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      userSocketMap.delete(userId);
    }
  }

  socketUserMap.delete(socketId);
}

function emitToUser(userId, event, payload) {
  io.to(String(userId)).emit(event, payload);
}

function getReceiverSocketIds(userId) {
  return Array.from(userSocketMap.get(String(userId)) ?? []);
}

function emitTypingStatus({ senderId, receiverId, isTyping }) {
  if (!senderId || !receiverId) return;

  emitToUser(receiverId, "typingStatus", {
    senderId: String(senderId),
    receiverId: String(receiverId),
    isTyping: Boolean(isTyping),
  });
}

io.on("connection", (socket) => {
  const userId = getUserIdFromSocket(socket);

  if (!userId) {
    socket.disconnect(true);
    return;
  }

  socket.data.userId = String(userId);
  socket.join(String(userId));
  registerSocket(userId, socket.id);

  socket.on("typingStatus", ({ receiverId, isTyping }) => {
    if (!receiverId) return;

    emitTypingStatus({
      senderId: userId,
      receiverId,
      isTyping,
    });
  });

  io.emit("getOnlineUsers", getOnlineUsers());

  socket.on("disconnect", () => {
    unregisterSocket(socket.id);
    io.emit("getOnlineUsers", getOnlineUsers());
  });
});

export { app, server, io, getReceiverSocketIds, emitToUser, emitTypingStatus };
