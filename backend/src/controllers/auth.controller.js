import { getAuth } from "@clerk/express";
import { createClerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/user.model.js";

const clerkClient = process.env.CLERK_SECRET_KEY
  ? createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  : null;

function buildUsername(email, givenName, familyName, preferredUsername = "") {
  const base =
    preferredUsername ||
    [givenName, familyName].filter(Boolean).join(" ") ||
    email?.split("@")[0] ||
    "user";

  return (
    base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18) || "user"
  );
}

function buildFallbackEmail(clerkId) {
  return `user-${clerkId}@clerk.local`;
}

function buildFallbackProfile(clerkId) {
  return {
    id: clerkId,
    firstName: "",
    lastName: "",
    username: "",
    imageUrl: "",
    emailAddress: buildFallbackEmail(clerkId),
  };
}

async function getClerkUserProfile(clerkId) {
  if (!clerkClient) {
    return null;
  }

  try {
    return await clerkClient.users.getUser(clerkId);
  } catch (error) {
    console.error(`Failed to load Clerk user ${clerkId}:`, error?.message || error);
    return null;
  }
}

async function createUniqueUsername({ email, givenName, familyName, clerkId, preferredUsername }) {
  const base = buildUsername(email, givenName, familyName, preferredUsername);
  let candidate = base;
  let suffix = 1;

  while (await User.exists({ username: candidate, clerkId: { $ne: clerkId } })) {
    candidate = `${base}${suffix}`;
    suffix += 1;
  }

  return candidate;
}

async function resolveEmail({ clerkId, email }) {
  const normalized = email?.trim().toLowerCase();
  if (normalized) {
    const collision = await User.findOne({ email: normalized, clerkId: { $ne: clerkId } }).lean();
    if (!collision) {
      return normalized;
    }
  }

  return buildFallbackEmail(clerkId);
}

async function upsertUserFromClerkProfile(clerkProfile, clerkId) {
  const emailAddress =
    clerkProfile.emailAddress ||
    clerkProfile.emailAddresses?.find((item) => item.id === clerkProfile.primaryEmailAddressId)?.emailAddress ||
    clerkProfile.emailAddresses?.[0]?.emailAddress ||
    buildFallbackEmail(clerkId);

  const fullName =
    [clerkProfile.firstName, clerkProfile.lastName].filter(Boolean).join(" ") ||
    clerkProfile.username ||
    emailAddress.split("@")[0] ||
    "User";

  const profilePic = clerkProfile.imageUrl || clerkProfile.profileImageUrl || "";
  const username = await createUniqueUsername({
    email: emailAddress,
    givenName: clerkProfile.firstName,
    familyName: clerkProfile.lastName,
    clerkId,
    preferredUsername: clerkProfile.username,
  });
  const email = await resolveEmail({ clerkId, email: emailAddress });

  const existing = await User.findOne({ clerkId });
  if (existing) {
    existing.email = email;
    existing.fullName = fullName;
    existing.profilePic = profilePic || existing.profilePic || "";
    if (!existing.username) {
      existing.username = username;
    }
    await existing.save();
    return existing;
  }

  return User.create({
    clerkId,
    email,
    fullName,
    username,
    profilePic,
  });
}

export async function checkAuth(req, res) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json({ user: req.user });
}

export async function syncAllClerkUsers(req, res) {
  try {
    if (!clerkClient) {
      const existingUsers = await User.find({}).select("-clerkId").lean();
      return res.status(200).json({
        message: "Clerk secret key not configured; returned existing Mongo users.",
        users: existingUsers,
        synced: 0,
      });
    }

    const clerkUsers = await clerkClient.users.getUserList({ limit: 200 });
    const users = Array.isArray(clerkUsers) ? clerkUsers : clerkUsers?.data || [];

    const results = {
      synced: 0,
      failed: [],
    };

    for (const clerkUser of users) {
      try {
        await upsertUserFromClerkProfile(clerkUser, clerkUser.id);
        results.synced += 1;
      } catch (error) {
        console.error(`Failed to sync Clerk user ${clerkUser.id}:`, error);
        results.failed.push(clerkUser.id);
      }
    }

    return res.status(200).json({
      message: "Clerk users synced successfully",
      synced: results.synced,
      failed: results.failed.length,
    });
  } catch (error) {
    console.error("Error in syncAllClerkUsers:", error);
    return res.status(500).json({
      message: "Failed to sync Clerk users",
      error: error?.message || "Unknown error",
    });
  }
}

export async function syncUser(req, res) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const clerkProfile = (await getClerkUserProfile(userId)) || buildFallbackProfile(userId);
    const user = await upsertUserFromClerkProfile(clerkProfile, userId);

    console.log("User synced successfully:", userId);
    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in syncUser:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
