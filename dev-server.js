/**
 * Local dev server: static files plus the /api functions.
 *
 * Vercel runs the files in /api for you in production. Locally, `npx serve`
 * only serves static files, and `vercel dev` needs the CLI and a login. This is
 * neither -- about eighty lines of node, no dependencies, so anyone on the team
 * can run the whole app with one command.
 *
 *   ANTHROPIC_API_KEY=sk-parley-... node dev-server.js
 */

import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));

/**
 * Load .env.local, overriding anything already in the environment.
 *
 * Node's own --env-file deliberately lets existing environment variables win.
 * That is the wrong way round here: a developer machine may well already have
 * ANTHROPIC_BASE_URL pointing at Anthropic, which would silently send a Parley
 * key to the wrong host and come back as "invalid x-api-key" with no clue why.
 * The file is this project's own configuration, so the file wins.
 */
function loadEnvLocal() {
  let raw;
  try {
    raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
  } catch {
    return; // no file is fine
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip matching quotes if present.
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
loadEnvLocal();

const PORT = Number(process.env.PORT) || 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8',
};

/** Give a node response the few Vercel helpers our handlers actually use. */
function asVercelResponse(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => {
    res.setHeader('content-type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
    return res;
  };
  return res;
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return undefined;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // --- API routes --------------------------------------------------------
  if (url.pathname.startsWith('/api/')) {
    const name = url.pathname.slice('/api/'.length).replace(/\.js$/, '');
    if (!/^[a-z0-9-]+$/i.test(name)) {
      return asVercelResponse(res).status(404).json({ error: 'No such function.' });
    }
    try {
      const mod = await import(new URL(`./api/${name}.js`, import.meta.url).href);
      req.body = await readBody(req);
      const started = Date.now();
      await mod.default(req, asVercelResponse(res));
      console.log(`  ${req.method} ${url.pathname} -> ${res.statusCode} (${Date.now() - started}ms)`);
    } catch (error) {
      if (res.headersSent) return;
      // A missing file means a missing route, not a server fault -- and the
      // module-not-found message carries the full filesystem path, which should
      // not go out over the wire.
      if (error.code === 'ERR_MODULE_NOT_FOUND') {
        console.error(`  ${req.method} ${url.pathname} -> 404 (no api/${name}.js)`);
        return asVercelResponse(res).status(404).json({ error: 'No such function.' });
      }
      console.error(`  ${req.method} ${url.pathname} failed:`, error.message);
      asVercelResponse(res).status(500).json({ error: 'Function threw. See server logs.' });
    }
    return;
  }

  // --- Static files ------------------------------------------------------
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';

  // Keep requests inside the project directory.
  const resolved = join(ROOT, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
  if (!resolved.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  try {
    const file = await readFile(resolved);
    res.setHeader('content-type', MIME[extname(resolved)] ?? 'application/octet-stream');
    res.end(file);
  } catch {
    res.statusCode = 404;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end('Not found');
  }
});

server.listen(PORT, () => {
  const key = process.env.ANTHROPIC_API_KEY;
  // Plain ASCII only: the Windows console mangles arrows and em dashes.
  console.log(`\n  Four Pillars  ->  http://localhost:${PORT}/korean-saju/`);
  console.log(`  All psychics  ->  http://localhost:${PORT}\n`);

  // The written reading needs a key. Say plainly which state we are in, so
  // nobody has to guess why the tiger never finishes writing.
  if (!key) {
    console.log('  READINGS: OFF - no key found.');
    console.log('            Open .env.local, paste your key, then restart.\n');
  } else if (key.includes('PASTE_YOUR_KEY') || key.includes('replace-me')) {
    console.log('  READINGS: OFF - .env.local still has the placeholder in it.');
    console.log('            Replace PASTE_YOUR_KEY_HERE with your real key, then restart.\n');
  } else {
    const host = (process.env.ANTHROPIC_BASE_URL || 'api.anthropic.com').replace(/^https?:\/\//, '');
    console.log(`  READINGS: ON - using ${host}\n`);
  }
});
