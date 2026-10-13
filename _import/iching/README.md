# The Three Coins Oracle

Hold a question in mind, toss three coins six times, and the lines you cast form one of the 64
hexagrams of the I Ching. An AI (Claude) then reads it back in plain, relatable language, and you
can ask follow-up questions. For reflection and fun, not fortune-telling advice.

Plain HTML, CSS and JavaScript with **no dependencies**. Node 20 or later.

## What's here

```
oracle/              the page: open it at /oracle/
  index.html         markup, plus <meta name="oracle-api"> saying where the API lives
  app.js             the casting animation, the reading, follow-ups
  cast.js            the coin-toss maths, shared by the page and the API
  hexagrams.js       all 64 hexagrams, trigrams and line positions (original text)
  chibi.svg.js       the little character and the coins
  style.css          the ink-and-paper look (colour tokens at the top)
api/oracle.js        POST /api/oracle: asks Claude for the reading (Vercel-style handler)
dev.js               local server: the page plus the API
test/                tests for the casting logic (npm test)
```

## Run it locally

1. Copy `.env.example` to `.env.local` and add **one** key:
   - `PARLEY_API_KEY`: an MIT Parley key (used first if set), or
   - `ANTHROPIC_API_KEY`: an Anthropic API key.

   With no key, everything still works and each reading uses the built-in text.
2. `npm start`
3. Open <http://localhost:3000/oracle/>.

`.env.local` is git-ignored, so your key can't end up on GitHub.

## Put it in another app

The oracle is two pieces: the static `oracle/` folder and the `api/oracle.js` endpoint.

- **The page.** Serve the `oracle/` folder at any path. It only uses relative links, so it works
  under `/oracle/`, `/tools/i-ching/` or wherever you put it.
- **The API.** `api/oracle.js` exports a `(req, res)` handler. On Vercel, a file at `api/oracle.js`
  becomes `POST /api/oracle` automatically. On an Express or Node server, mount it yourself:

  ```js
  const oracle = require('./api/oracle.js');
  app.post('/api/oracle', express.json(), oracle);
  ```

  It reads `oracle/cast.js` and `oracle/hexagrams.js` from `../oracle/`, so keep both folders side by side
  (on Vercel, `vercel.json` already bundles them).
- **Different API path?** Change `<meta name="oracle-api" content="/api/oracle">` in
  `oracle/index.html`.
- **Matching your app's look.** The colours, fonts and dark mode are CSS variables at the top of
  `oracle/style.css`.

## Settings

| Variable | What it does |
|---|---|
| `PARLEY_API_KEY` | MIT Parley key. Used first if set. |
| `ANTHROPIC_API_KEY` | Anthropic API key. Used if there's no Parley key. |
| `ORACLE_MODEL` | The model id. Default `claude-sonnet-4-6`. |
| `PARLEY_MODEL` | With a Parley key only, the model to use when `ORACLE_MODEL` is unset. |

The API limits each visitor to 15 readings per 10 minutes and the whole server to 150 per hour, so a
public page can't run up a big bill. These counters live in memory, per server instance. Change
`PER_VISITOR` and `OVERALL` at the top of `api/oracle.js` to adjust them.

## How it works

The page sends only the question and the six line values (6 to 9). The API recomputes the
hexagrams itself with the same `cast.js`, so nobody can tell the model which hexagram they "got",
and it never sends the API key to the browser. If the AI is unavailable, the page shows the built-in
reading instead.

## Deploy

Push to a Vercel project, then add `PARLEY_API_KEY` or `ANTHROPIC_API_KEY` under Project → Settings
→ Environment Variables, and redeploy. The home page redirects to `/oracle/`.
