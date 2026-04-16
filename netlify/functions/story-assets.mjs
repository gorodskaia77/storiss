import crypto from "node:crypto";
import { getStore } from "@netlify/blobs";

const store = getStore("story-assets");

function sanitizeFileName(input = "story.png") {
  const ext = ".png";
  const base = input
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "story";

  return `${base}${ext}`;
}

export default async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: "Missing file upload" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const arrayBuffer = await file.arrayBuffer();

    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: "Empty file body" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const requestedName = sanitizeFileName(file.name || "story.png");
    const key = `${Date.now()}-${crypto.randomUUID()}-${requestedName}`;

    await store.set(key, new Uint8Array(arrayBuffer), {
      metadata: {
        contentType: "image/png",
        fileName: requestedName,
      },
    });

    const origin = new URL(req.url).origin;
    const fileUrl = `${origin}/.netlify/functions/story-file?key=${encodeURIComponent(key)}`;

    return new Response(
      JSON.stringify({
        ok: true,
        key,
        fileName: requestedName,
        fileUrl,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Failed to store story asset", error);
    return new Response(JSON.stringify({ error: "Failed to store file" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
