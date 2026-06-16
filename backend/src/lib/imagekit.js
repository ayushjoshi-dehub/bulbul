import ImageKit from "@imagekit/nodejs";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

export function hasImageKitConfig() {
  return Boolean(
    process.env.IMAGEKIT_PUBLIC_KEY &&
    process.env.IMAGEKIT_PRIVATE_KEY &&
    process.env.IMAGEKIT_URL_ENDPOINT
  );
}

// create safe filename
function createFilename(originalname = "upload") {
  const safeName = originalname
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  return `${Date.now()}-${safeName}`;
}

export async function uploadChatMedia(file) {
  const filename = createFilename(file.originalname);

  const result = await imagekit.upload({
    file: file.buffer.toString("base64"), // ✅ correct way
    fileName: filename,
    folder: "/chat",
  });

  return result.url;
}

export default imagekit;