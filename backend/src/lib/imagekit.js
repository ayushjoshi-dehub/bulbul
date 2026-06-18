import ImageKit from "@imagekit/nodejs";

let imagekit = null;

export function hasImageKitConfig() {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
      process.env.IMAGEKIT_PRIVATE_KEY &&
      process.env.IMAGEKIT_URL_ENDPOINT
  );
}

function getImageKitClient() {
  if (!hasImageKitConfig()) {
    return null;
  }

  if (!imagekit) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  }

  return imagekit;
}

function createFilename(originalname = "upload") {
  const safeName = originalname
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  return `${Date.now()}-${safeName}`;
}

export async function uploadChatMedia(file) {
  const client = getImageKitClient();

  if (!client) {
    throw new Error("ImageKit is not configured");
  }

  const filename = createFilename(file.originalname);
  const result = await client.upload({
    file: file.buffer.toString("base64"),
    fileName: filename,
    folder: "/chat",
  });

  return result.url;
}

export default imagekit;
