import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { hasImageKitConfig, uploadChatMedia } from "../lib/imagekit.js";
import { emitToUser } from "../lib/socket.js";

export async function getUsersForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const currentUser = await User.findById(loggedInUserId).lean();
    if (!currentUser) {
      return res.status(404).json({ message: "User profile not found" });
    }

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } })
      .select("-clerkId")
      .lean();

    const friends = new Set(currentUser.friends?.map((id) => String(id)) || []);
    const outgoingRequests = new Set(currentUser.outgoingRequests?.map((id) => String(id)) || []);
    const incomingRequests = new Set(currentUser.incomingRequests?.map((id) => String(id)) || []);

    const usersWithStatus = filteredUsers.map((user) => {
      const userId = String(user._id);
      let relationStatus = "none";

      if (friends.has(userId)) relationStatus = "friends";
      else if (outgoingRequests.has(userId)) relationStatus = "outgoing";
      else if (incomingRequests.has(userId)) relationStatus = "incoming";

      return { ...user, relationStatus };
    });

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendFriendRequest(req, res) {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    if (String(targetUserId) === String(currentUserId)) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyFriends = currentUser.friends?.some((id) => String(id) === String(targetUserId));
    const alreadyRequested = currentUser.outgoingRequests?.some((id) => String(id) === String(targetUserId));
    const alreadyIncoming = targetUser.incomingRequests?.some((id) => String(id) === String(currentUserId));

    if (alreadyFriends || alreadyRequested || alreadyIncoming) {
      return res.status(400).json({ message: "Request already exists or you are already connected" });
    }

    await Promise.all([
      User.updateOne(
        { _id: currentUserId },
        { $addToSet: { outgoingRequests: targetUserId } },
      ),
      User.updateOne(
        { _id: targetUserId },
        { $addToSet: { incomingRequests: currentUserId } },
      ),
    ]);

    emitToUser(targetUserId, "friendRequestReceived", {
      type: "friend-request",
      requesterId: String(currentUserId),
      requesterName: currentUser.fullName,
      requesterUsername: currentUser.username,
    });

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error in sendFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function acceptFriendRequest(req, res) {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(targetUserId),
    ]);

    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const hasIncoming = currentUser.incomingRequests?.some((id) => String(id) === String(targetUserId));
    if (!hasIncoming) {
      return res.status(400).json({ message: "No pending request found" });
    }

    await Promise.all([
      User.updateOne(
        { _id: currentUserId },
        {
          $pull: { incomingRequests: targetUserId },
          $addToSet: { friends: targetUserId },
        },
      ),
      User.updateOne(
        { _id: targetUserId },
        {
          $pull: { outgoingRequests: currentUserId },
          $addToSet: { friends: currentUserId },
        },
      ),
    ]);

    emitToUser(targetUserId, "friendRequestAccepted", {
      type: "friend-request-accepted",
      accepterId: String(currentUserId),
      accepterName: currentUser.fullName,
      accepterUsername: currentUser.username,
    });

    emitToUser(currentUserId, "friendRequestAccepted", {
      type: "friend-request-accepted",
      accepterId: String(currentUserId),
      accepterName: currentUser.fullName,
      accepterUsername: currentUser.username,
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptFriendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConversationsForSidebar(req, res) {
  try {
    const loggedInUserId = req.user._id;

    const conversations = await Message.aggregate([
      {
        $addFields: {
          senderParticipant: { $ifNull: ["$senderId", "$sender"] },
        },
      },
      {
        $match: {
          $or: [
            { senderParticipant: loggedInUserId },
            { receiverId: loggedInUserId },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderParticipant", loggedInUserId] },
              "$receiverId",
              "$senderParticipant",
            ],
          },
          lastMessageAt: { $max: "$createdAt" },
        },
      },
      { $sort: { lastMessageAt: -1 } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $replaceRoot: { newRoot: { $first: "$user" } } },
      { $project: { clerkId: 0 } },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error in getConversationsForSidebar:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getMessages(req, res) {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { sender: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
        { sender: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { text, audioDuration } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl = "";
    let audioUrl = "";
    let videoUrl = "";

    if (req.file) {
      const isAudioFile = req.file.mimetype.startsWith("audio/");
      const isMediaConfigured = hasImageKitConfig();

      try {
        if (!isMediaConfigured && !isAudioFile) {
          return res.status(500).json({ message: "Media upload is not configured" });
        }

        if (isMediaConfigured && !isAudioFile) {
          const url = await uploadChatMedia(req.file);
          if (req.file.mimetype.startsWith("video/")) {
            videoUrl = url;
          } else {
            imageUrl = url;
          }
        } else if (isMediaConfigured && isAudioFile) {
          const url = await uploadChatMedia(req.file);
          audioUrl = url;
        } else {
          if (isAudioFile) {
            audioUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
          }
        }
      } catch (uploadError) {
        console.warn("Media upload failed, using fallback storage:", uploadError?.message || uploadError);
        if (isAudioFile) {
          audioUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        } else {
          throw uploadError;
        }
      }
    }

    if (req.file?.mimetype.startsWith("audio/") && !audioUrl) {
      const fallbackBase64 = req.file.buffer.toString("base64");
      audioUrl = `data:${req.file.mimetype};base64,${fallbackBase64}`;
    }

    const newMessage = await Message.create({
      senderId,
      sender: senderId,
      receiverId,
      text: text || "",
      image: imageUrl,
      audio: audioUrl,
      audioDuration: audioDuration ? Number(audioDuration) : null,
      video: videoUrl,
      vedio: videoUrl,
    });

    emitToUser(receiverId, "newMessage", {
      ...newMessage.toObject(),
      senderName: req.user.fullName,
      receiverName: (await User.findById(receiverId).select("fullName").lean())?.fullName || "",
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
