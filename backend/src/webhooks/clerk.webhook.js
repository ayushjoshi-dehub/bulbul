import express from "express";
import User from "../models/user.model.js";
import { Webhook } from "svix";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const signingSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;

    if (!signingSecret) {
      return res.status(503).json({
        error: "Webhook signing secret is not configured."
      });
    }

    // Clerk webhook expects RAW body
    const payload = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    const headers = req.headers;

    const wh = new Webhook(signingSecret);

    const evt = wh.verify(payload, headers);

    if (evt.type === "user.created" || evt.type === "user.updated") {
      const u = evt.data;

      const email =
        u.email_addresses?.find(
          (e) => e.id === u.primary_email_address_id
        )?.email_address ??
        u.email_addresses?.[0]?.email_address;

      const fullName =
        [u.first_name, u.last_name]
          .filter(Boolean)
          .join(" ") ||
        u.username ||
        email?.split("@")[0];

      await User.findOneAndUpdate(
        { clerkId: u.id },
        {
          email,
          fullName,
          clerkId: u.id,
          profilePic: u.image_url
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
    }

    if (evt.type === "user.deleted") {
      if (evt.data.id) {
        await User.findOneAndDelete({ clerkId: evt.data.id });
      }
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Clerk webhook error:", error);
    return res.status(400).json({
      error: "Webhook verification failed"
    });
  }
});

export default router;
