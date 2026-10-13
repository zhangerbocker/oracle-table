/**
 * A disk cache for readings.
 *
 * The same birth moment always produces the same chart, so it should always
 * produce the same reading — there is no reason to pay for it twice. During
 * development especially, the same test birthday gets entered dozens of times.
 *
 * Only used where the filesystem is writable. On Vercel it is not (outside
 * /tmp), so there the CDN Cache-Control header on the response does this job
 * instead and this quietly does nothing.
 */

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(fileURLToPath(new URL('..', import.meta.url)), '.cache', 'readings');

/**
 * Readings do not change, but the prompt does — bump this whenever the prompt
 * or the output schema changes, so stale readings written by the old wording
 * are ignored rather than served.
 *
 * v2: plain-language rewrite, no jargon, themes lost their evidence field.
 * v3: added strengths, career split into body/fits/avoid, marked phrases.
 */
const VERSION = 'v3';

let writable = null; // unknown until the first attempt

/** A stable key for a chart payload. Same chart in, same filename out. */
export function cacheKey(payload, model) {
  return createHash('sha256')
    .update(VERSION)
    .update('\u0000')
    .update(model)
    .update('\u0000')
    .update(JSON.stringify(payload))
    .digest('hex')
    .slice(0, 32);
}

/** A previously stored reading, or null. Never throws. */
export async function readCached(key) {
  if (writable === false) return null;
  try {
    return JSON.parse(await readFile(join(DIR, `${key}.json`), 'utf8'));
  } catch {
    return null;
  }
}

/** Store a reading. Never throws — a cache miss is better than a failed request. */
export async function writeCached(key, reading) {
  if (writable === false) return;
  try {
    await mkdir(DIR, { recursive: true });
    await writeFile(join(DIR, `${key}.json`), JSON.stringify(reading), 'utf8');
    writable = true;
  } catch {
    // Read-only filesystem (Vercel). Stop trying.
    writable = false;
  }
}
