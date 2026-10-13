# The Oracle Table

Three readers share one candlelit table. Pick one and come closer:

| Seat | Reader | Kept by | Page | API |
|---|---|---|---|---|
| Left | **The Sorting Hat**: your birthday's zodiac sign picks your house and wand | Mrunali | `/sorting-hat/` | `POST /api/prophecy` |
| Centre | **The Three Coins Oracle** (易经): toss three coins six times, read the hexagram | Grace | `/oracle/` | `POST /api/oracle` |
| Right | **The Four Pillars** (사주팔자): a real 만세력 birth chart, read by a blue tiger | Haemin | `/korean-saju/` | `POST /api/reading` |

The landing page (`index.html`, `table.css`, `table.js`) is the table. Each reader is its own
self-contained page, so none of them can break another's styles. The history of all three
original repos is kept in this one.

## Run it

```bash
npm install
npm start      # http://localhost:3000/
npm test       # I Ching + Sorting Hat tests, then the saju engine checks
```

Needs Node 22 or later. Without keys every page still works: the I Ching and the Sorting Hat
fall back to their built-in text, and the Four Pillars shows the chart without the written reading.

## Keys: one Parley key per reader

Copy `.env.example` to `.env.local` for local runs. On Vercel, add the same names under
Project Settings → Environment Variables. Each key feeds only its own reader:

| Variable | Reader | Model override (optional) |
|---|---|---|
| `ORACLE_PARLEY_API_KEY` | Three Coins Oracle | `ORACLE_MODEL` (default `claude-sonnet-4-6`) |
| `SORTING_HAT_PARLEY_API_KEY` | Sorting Hat | `SORTING_HAT_MODEL` (default `claude-sonnet-5-5`) |
| `SAJU_PARLEY_API_KEY` | Four Pillars | `READING_MODEL` (default `claude-sonnet-5`) |

All three go to MIT's Parley gateway (`https://parley.api.mit.edu`). A plain `ANTHROPIC_API_KEY`
also works as a fallback for any reader whose own key is missing.

## Deploy

Import the repo into Vercel with the Framework preset set to **Other**. Leave the build command
and output directory empty; `vercel.json` configures the three functions and keeps
`lib/`, `test/`, `dev.js` and the package files private.

## Layout

```
index.html table.css table.js   the table (landing page)
oracle/                         Three Coins Oracle page
sorting-hat/                    Sorting Hat page
korean-saju/                    Four Pillars page, engine and art (see korean-saju/README.md)
api/oracle.js                   I Ching reading
api/prophecy.js + lib/          Sorting Hat prophecy
api/reading.js _prompt.js _cache.js   Four Pillars reading
dev.js                          local server for everything
test/                           I Ching and Sorting Hat tests
```

Fan-made and for entertainment only. The Sorting Hat is not affiliated with Warner Bros. or J.K. Rowling.
