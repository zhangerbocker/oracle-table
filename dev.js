// dev.js — local server for the Oracle Table. Node 22 or later.
// Serves the table at / and each oracle's page, routes the three POST APIs to their
// handlers in api/, and answers 404 for everything that must stay private.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MAX_BODY = 128 * 1024; // bytes; an I Ching question with follow-ups, or a saju chart

// ---------- .env.local, read line by line ----------

function loadEnvLocal() {
  let text;
  try { text = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8'); } catch (_) { return; }
  for (const raw of text.replace(/^﻿/, '').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 1) continue;
    const name = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(name in process.env)) process.env[name] = value;
  }
}

loadEnvLocal();
// Imported after .env.local is read, so each handler sees its key.
const HANDLERS = {
  '/api/oracle': (await import('./api/oracle.js')).default,
  '/api/reading': (await import('./api/reading.js')).default,
  '/api/prophecy': webHandler((await import('./api/prophecy.js')).POST),
};

// ---------- static files ----------

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const BLOCKED_DIRS = new Set(['api', 'test', 'lib', 'node_modules']);
const BLOCKED_FILES = new Set(['dev.js', 'package.json', 'package-lock.json', 'vercel.json']);
const BLOCKED_NESTED = ['korean-saju/test', 'korean-saju/prompts'];

function notFound(res) {
  res.statusCode = 404;
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.end('Not found');
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

// Tested on the raw request URL, lower-cased, before any decoding or normalising.
function rawUrlIsForbidden(rawUrl) {
  const lower = rawUrl.toLowerCase();
  if (lower.includes('..') || lower.includes('%2e') || lower.includes(':')) return true;
  const pathOnly = lower.split('?')[0].split('#')[0];
  if (pathOnly === '/api' || pathOnly.startsWith('/api/')) return true;
  for (const dir of ['/test', '/lib', ...BLOCKED_NESTED.map((d) => '/' + d)]) {
    if (pathOnly === dir || pathOnly.startsWith(dir + '/')) return true;
  }
  if (pathOnly === '/dev.js') return true;
  if (pathOnly === '/package.json' || pathOnly === '/package-lock.json' || pathOnly === '/vercel.json') return true;
  for (const segment of pathOnly.split('/')) {
    if (segment.startsWith('.')) return true; // dotfiles, including every .env file
  }
  return false;
}

// Checked again after decoding, so a differently spelled path cannot reach the same files.
function decodedPathIsForbidden(relative) {
  const segments = relative.split(/[\\/]+/).filter(Boolean);
  if (!segments.length) return false;
  if (segments.some((s) => s.startsWith('.'))) return true;
  if (BLOCKED_DIRS.has(segments[0].toLowerCase())) return true;
  if (segments.length === 1 && BLOCKED_FILES.has(segments[0].toLowerCase())) return true;
  const joined = segments.join('/').toLowerCase();
  if (BLOCKED_NESTED.some((d) => joined === d || joined.startsWith(d + '/'))) return true;
  return false;
}

function serveStatic(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('allow', 'GET, HEAD');
    res.end();
    return;
  }
  let pathname;
  try { pathname = decodeURIComponent(req.url.split('?')[0].split('#')[0]); } catch (_) { return notFound(res); }
  if (pathname.includes('\0')) return notFound(res);
  if (pathname === '') pathname = '/';
  if (pathname.endsWith('/')) pathname += 'index.html'; // folders serve their index.html, like Vercel

  const filePath = path.resolve(ROOT, '.' + pathname);
  const relative = path.relative(ROOT, filePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return notFound(res);
  if (decodedPathIsForbidden(relative)) return notFound(res);

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) { // /oracle -> /oracle/
      res.statusCode = 308;
      res.setHeader('location', encodeURI(pathname + '/'));
      return res.end();
    }
    if (err || !stat.isFile()) return notFound(res);
    res.statusCode = 200;
    res.setHeader('content-type', TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
    res.setHeader('content-length', stat.size);
    if (req.method === 'HEAD') return res.end();
    const stream = fs.createReadStream(filePath);
    stream.on('error', () => { if (!res.headersSent) notFound(res); else res.destroy(); });
    stream.pipe(res);
  });
}

// ---------- shims for the Vercel-style handlers ----------

// The saju handler uses Vercel's res.status(...).json(...) helpers.
function addVercelHelpers(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { json(res, res.statusCode, body); return res; };
}

// The Sorting Hat's handler is Web-style: POST(Request) -> Response.
function webHandler(post) {
  return async (req, res) => {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? '');
    const request = new Request('http://localhost' + req.url, {
      method: 'POST',
      headers: { 'content-type': req.headers['content-type'] || 'application/json',
        'x-forwarded-for': req.socket.remoteAddress || '' },
      body: raw,
    });
    const response = await post(request);
    res.statusCode = response.status;
    response.headers.forEach((value, name) => res.setHeader(name, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  };
}

function apiShim(req, res, handler) {
  addVercelHelpers(res);
  const declared = Number(req.headers['content-length'] || 0);
  if (declared > MAX_BODY) return refuseOversized(req, res);

  const chunks = [];
  let size = 0;
  let refused = false;
  req.on('data', (chunk) => {
    if (refused) return; // keep draining so the client can read the reply
    size += chunk.length;
    if (size > MAX_BODY) { refused = true; chunks.length = 0; return refuseOversized(req, res); }
    chunks.push(chunk);
  });
  req.on('end', () => {
    if (refused) return;
    const raw = Buffer.concat(chunks).toString('utf8');
    req.body = raw;
    if (raw) { try { req.body = JSON.parse(raw); } catch (_) { req.body = raw; } }
    Promise.resolve()
      .then(() => handler(req, res))
      .catch(() => { if (!res.headersSent) json(res, 502, { error: 'the oracle did not answer' }); else res.end(); });
  });
  req.on('error', () => { if (!res.headersSent) json(res, 400, { error: 'bad request body' }); });
}

function refuseOversized(req, res) {
  if (res.headersSent) return;
  // Send the 400 now, but only close once the client has finished sending (or after ten
  // seconds), so the reply is readable instead of being lost to a reset mid-upload.
  const body = JSON.stringify({ error: 'request body too large' });
  res.statusCode = 400;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('content-length', Buffer.byteLength(body));
  res.write(body);
  const timer = setTimeout(() => req.destroy(), 10000);
  const finish = () => { clearTimeout(timer); if (!res.writableEnded) res.end(); };
  req.on('end', finish);
  req.on('close', finish);
  req.resume(); // discard the rest of the body
}

// ---------- server ----------

const server = http.createServer((req, res) => {
  const rawPath = req.url.split('?')[0];
  if (req.method === 'POST' && HANDLERS[rawPath]) return apiShim(req, res, HANDLERS[rawPath]);
  if (rawUrlIsForbidden(req.url)) return notFound(res);
  serveStatic(req, res);
});

server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) return;
  socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');
});

const requestedPort = process.env.PORT ? Number(process.env.PORT) : null;
let port = requestedPort || 3000;
let fellBackTo3001 = false;

function start() {
  server.listen(port);
}

server.on('listening', () => {
  const env = process.env;
  const has = (...names) => (names.some((n) => env[n]) ? 'key found' : 'no key');
  console.log(
    'The Oracle Table: http://localhost:' + port + '/' +
    (fellBackTo3001 ? '  (port 3000 was busy, using 3001)' : '') + '\n' +
    '  I Ching      /oracle/       ' + has('ORACLE_PARLEY_API_KEY', 'PARLEY_API_KEY', 'ANTHROPIC_API_KEY') + '\n' +
    '  Sorting Hat  /sorting-hat/  ' + has('SORTING_HAT_PARLEY_API_KEY', 'ANTHROPIC_API_KEY') + '\n' +
    '  Saju         /korean-saju/  ' + has('SAJU_PARLEY_API_KEY', 'ANTHROPIC_API_KEY') + '\n' +
    'Oracles without a key use their built-in text; keys go in .env.local (see .env.example).'
  );
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && requestedPort === null && port === 3000) {
    port = 3001;
    fellBackTo3001 = true;
    return start();
  }
  console.error('Could not start: port ' + port + ' ' + (err.code === 'EADDRINUSE' ? 'is busy' : 'failed'));
  process.exit(1);
});

start();
