import http from "node:http";
import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { handleProphecy } from "./lib/prophecy.js";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

// Load .env so it wins over variables already set in the shell (e.g. an
// ANTHROPIC_BASE_URL exported by another tool). `node --env-file` won't override.
try {
  Object.assign(process.env, parseEnv(readFileSync(path.join(ROOT_DIR, ".env"), "utf8")));
} catch (err) {
  if (err.code !== "ENOENT") throw err;
  console.log("No .env file found; prophecies will use the built-in fortunes unless a key is set.");
}

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

// ---------- HTTP ----------

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function readBody(req, limit = 16_000) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) break; // lib/prophecy.js rejects oversized bodies
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const filePath = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);

  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    const type = CONTENT_TYPES[path.extname(filePath)] ?? "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === "/api/prophecy") {
      if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });
      const { status, body } = await handleProphecy(await readBody(req), req.socket.remoteAddress);
      return sendJson(res, status, body);
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405).end();
      return;
    }
    await serveStatic(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.writeHead(500).end("Server error");
  }
});

server.listen(PORT, () => {
  console.log(`🎩 The Sorting Hat is listening at http://localhost:${PORT}`);
});
