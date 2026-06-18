import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  socketUserId: null,
  hasSyncedUsers: false,
  lastSocketEvent: null,
  typingUsers: {},

  syncUser: async () => {
    const res = await axiosInstance.post("/auth/sync");
    return res.data.user;
  },

  syncAllUsers: async () => {
    const res = await axiosInstance.post("/auth/sync-all");
    set({ hasSyncedUsers: true });
    return res.data;
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      await get().syncUser();

      if (!get().hasSyncedUsers) {
        try {
          await get().syncAllUsers();
        } catch (syncError) {
          console.warn("Clerk roster sync failed, continuing with existing Mongo users.", syncError.message);
        }
      }

      const res = await axiosInstance.get("/auth/check");
      const user = res.data.user;

      set({ authUser: user });
      get().connectSocket(user);
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Error in checkAuth:", error);
      }
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  clearAuth: () => {
    set({ authUser: null, isCheckingAuth: false });
    get().disconnectSocket();
    set({ hasSyncedUsers: false, lastSocketEvent: null });
  },

  connectSocket: (user) => {
    if (!user?._id) return;

    const userId = String(user._id);
    const prevSocket = get().socket;
    const prevUserId = get().socketUserId;

    if (prevSocket && prevUserId === userId) {
      if (!prevSocket.connected) {
        prevSocket.connect();
      }
      return;
    }

    if (prevSocket) {
      prevSocket.off();
      prevSocket.disconnect();
    }

    const newSocket = io(BASE_URL, {
      auth: { userId },
      transports: ["websocket"],
      reconnection: true,
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("friendRequestReceived", (payload) => {
      toast.success(`${payload.requesterName || "Someone"} sent you a friend request`);
      set({
        lastSocketEvent: {
          type: "friend-request",
          payload,
          timestamp: Date.now(),
        },
      });
    });

    newSocket.on("friendRequestAccepted", (payload) => {
      toast.success(`${payload.accepterName || "Someone"} accepted your request`);
      set({
        lastSocketEvent: {
          type: "friend-request-accepted",
          payload,
          timestamp: Date.now(),
        },
      });
    });

    newSocket.on("newMessage", (payload) => {
      toast.success(`New message from ${payload.senderName || "someone"}`);
      set({
        lastSocketEvent: {
          type: "new-message",
          payload,
          timestamp: Date.now(),
        },
      });
    });

    newSocket.on("typingStatus", (payload) => {
      const senderId = String(payload?.senderId || "");
      if (!senderId) return;

      set((state) => {
        const nextTypingUsers = { ...state.typingUsers };

        if (payload.isTyping) {
          nextTypingUsers[senderId] = {
            isTyping: true,
            timestamp: Date.now(),
          };
        } else {
          delete nextTypingUsers[senderId];
        }

        return { typingUsers: nextTypingUsers };
      });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    set({ socket: newSocket, socketUserId: userId });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.off();
      socket.disconnect();
    }

    set({ socket: null, socketUserId: null, onlineUsers: [], lastSocketEvent: null, typingUsers: {} });
  },
}));
