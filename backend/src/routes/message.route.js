import express from "express";
import {
  acceptFriendRequest,
  getConversationsForSidebar,
  getMessages,
  getUsersForSidebar,
  sendFriendRequest,
  sendMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.use(protectRoute);

router.get("/users", getUsersForSidebar);
router.get("/conversations", getConversationsForSidebar);
router.post("/request/:id", sendFriendRequest);
router.post("/accept/:id", acceptFriendRequest);
router.get("/:id", getMessages);
router.post("/send/:id", upload.single("media"), sendMessage);

export default router;