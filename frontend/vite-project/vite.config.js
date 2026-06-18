import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // important for docker + LAN
    port: 5173,
    strictPort: true,
  },
});