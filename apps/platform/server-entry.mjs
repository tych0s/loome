// Production entry: static client assets + the TanStack Start fetch handler.
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { serve } from "srvx";
import server from "./dist/server/server.js";

const CLIENT_DIR = fileURLToPath(new URL("./dist/client", import.meta.url));
const MIME = {
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".json": "application/json",
  ".woff2": "font/woff2",
};

async function tryStatic(url) {
  const pathname = decodeURIComponent(new URL(url).pathname);
  if (pathname.includes("..")) return null;
  const file = join(CLIENT_DIR, normalize(pathname));
  try {
    const stats = await stat(file);
    if (!stats.isFile()) return null;
    const body = await readFile(file);
    return new Response(body, {
      headers: {
        "content-type": MIME[extname(file)] ?? "application/octet-stream",
        "cache-control": pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=300",
      },
    });
  } catch {
    return null;
  }
}

const port = Number(process.env.PORT ?? 3400);
serve({
  fetch: async (request) =>
    (await tryStatic(request.url)) ?? server.fetch(request),
  port,
  hostname: "0.0.0.0",
});
console.log(`loome-platform listening on :${port}`);
