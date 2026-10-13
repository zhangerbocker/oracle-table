# The Psychic Sorting Hat 🎩

A fun, fan-made website. Enter your birthday, and the "Sorting Hat" reads your zodiac sign to sort you into a house and pick your wand. You can also answer five optional personality questions for a "truer" sorting. A personalized prophecy is written by Claude. If no API key is set, the site uses built-in fortunes instead.

## Run it

Requires Node 22+.

```bash
npm install
cp .env.example .env   # then paste your ANTHROPIC_API_KEY into .env (optional)
npm start
```

Open http://localhost:3000.

Run the sorting-logic tests with `npm test`.

## Deploy to Vercel

The site deploys as static files (`public/`) plus one serverless function (`api/prophecy.js`). No build step is needed.

1. Import the GitHub repo at https://vercel.com/new (Framework preset: **Other**, leave the build settings empty; `vercel.json` sets the output folder).
2. In **Settings → Environment Variables**, add `ANTHROPIC_API_KEY` (and `ANTHROPIC_BASE_URL` if you use a proxy), then redeploy.

Without a key, the deployed site still works and uses the built-in fortunes.

## How the sorting works

All sorting runs in the browser (`public/sorting.js`), and the birth date never leaves the page.

1. **Zodiac → base house scores** (`SIGNS` in `public/data.js`). Each sign's element sets its default house: Fire → Gryffindor, Earth → Hufflepuff, Air → Ravenclaw, Water → Slytherin. Each sign also adds a little weight to a second house.
2. **Optional quiz.** Each answer adds +2 to one house, so a full quiz can overrule the stars. Ties go to the sign's favorite house.
3. **Wand:**
   - *Wood* comes from your sign.
   - *Core* comes from your house.
   - *Length* (9″–14¾″) comes from your birth day.
   - *Flexibility* comes from how varied your quiz answers were, or from your element if you skipped the quiz.
4. **Prophecy.** The browser sends only the sign, house, wand, and quiz answers to `POST /api/prophecy`. The server asks Claude (`claude-sonnet-5-5`) for a short JSON reading (title, prophecy, wand lore). If that fails for any reason, the page uses the templates in `FALLBACK`.

To change who goes where, edit the tables in `public/data.js`.

## Files

| File | What it does |
|---|---|
| `server.js` | Local dev server: static files and `/api/prophecy` |
| `api/prophecy.js` | The same endpoint as a Vercel serverless function |
| `lib/prophecy.js` | Claude prompt, validation, and rate limiting, shared by both |
| `public/wand-art.js` | Draws the wand picture as SVG |
| `public/index.html` | The single page and its screens |
| `public/styles.css` | Starry, candle-lit theme and house colors |
| `public/data.js` | Signs, houses, wands, quiz questions, fallback fortunes |
| `public/sorting.js` | Pure sorting logic, no DOM |
| `public/app.js` | Screen flow, animations, API call |
| `test/sorting.test.js` | Tests for zodiac boundaries, scoring, and wands |

---

*Fan-made for fun. Not affiliated with Warner Bros. or J.K. Rowling.*
