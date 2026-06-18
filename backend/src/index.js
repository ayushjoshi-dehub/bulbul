import express from "express";
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import fs from "fs";
import path from "path";

import clerkWebhook from "./webhooks/clerk.webhook.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import job from "./lib/cron.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 5001;
const DEFAULT_FRONTEND_URLS = ["http://localhost:5173", "http://localhost:5174"];
const FRONTEND_URLS = [
  process.env.FRONTEND_URL,
  ...DEFAULT_FRONTEND_URLS,
].filter(Boolean);
const publicDir = path.join(process.cwd(), "public");

// Clerk webhook route must come BEFORE express.json()
app.use(
  "/api/webhooks/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhook
);

app.use(clerkMiddleware());
app.use(express.json());

app.use(
  cors({
    origin: FRONTEND_URLS,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));

  // Express 5 catch-all
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

server.listen(PORT, async () => {
  try {
    await connectDB();

    console.log(`Server running on port ${PORT}`);

    if (process.env.NODE_ENV === "production") {
      job.start();
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
});
