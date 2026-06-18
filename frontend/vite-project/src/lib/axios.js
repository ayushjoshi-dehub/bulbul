import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true,
});

let getTokenFn = null;

// Store the getToken function for use in interceptors
export const setTokenGetter = (getToken) => {
  getTokenFn = getToken;
  console.log("✅ Token getter configured");
};

// Add request interceptor to attach token
axiosInstance.interceptors.request.use(
  async (config) => {
    if (getTokenFn) {
      try {
        const token = await getTokenFn();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log("✅ Auth token attached");
        } else {
          console.warn("⚠️ getToken() returned empty token");
        }
      } catch (error) {
        console.error("❌ Error getting Clerk token:", error);
      }
    } else {
      console.warn("⚠️ Token getter not initialized");
    }
    return config;
  },
  (error) => Promise.reject(error)
);