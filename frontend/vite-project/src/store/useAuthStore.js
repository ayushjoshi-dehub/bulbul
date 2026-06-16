import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    set({ isCheckingAuth: true });

    try {
      const res = await axiosInstance.get("/auth/check");
      const user = res.data.user; // ✅ fixed: was res.data

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
    get().disconnectSocket(); // disconnectSocket handles onlineUsers reset
  },

  connectSocket: (user) => {
    if (!user || get().socket?.connected) return;

    const socket = io(BASE_URL, { query: { userId: user._id } });
    set({ socket });

    socket.off("getOnlineUsers"); // ✅ prevent duplicate listeners
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null, onlineUsers: [] }); // ✅ reset onlineUsers on disconnect
  },
}));