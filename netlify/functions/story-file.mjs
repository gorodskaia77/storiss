import { getStore } from "@netlify/blobs";

const store = getStore("story-assets");

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("Missing key", { status: 400 });
  }

  try {
    const { data, metadata } = await store.getWithMetadata(key, {
      type: "arrayBuffer",
    });

    if (!data) {
      return new Response("File not found", { status: 404 });
    }

    const fileName = metadata?.fileName || "story.png";
    const contentType = metadata?.contentType || "image/png";

    return new Response(data, {
      status: 200,
      headers: {
        "content-type": contentType,
        "content-disposition": `attachment; filename="${fileName.replace(/"/g, "")}"`,
        "access-control-allow-origin": "https://web.telegram.org",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Failed to read story asset", error);
    return new Response("Failed to read file", { status: 500 });
  }
};
