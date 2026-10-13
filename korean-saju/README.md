# Psychics

Three psychic readings under one roof — a Korean Four Pillars reading, a Chinese
zodiac reading, and a Sorting Hat — behind a single selection screen.

Built by Haemin, Mrunali and Grace for the AI Builder Space proseminar.

## Run it

```bash
npx serve .
```

Open the printed URL. No install, no build step, no framework — plain ES modules.

```bash
npm test
```

Runs the 사주 engine checks (solar terms, pillar derivation, timezone history).

## Layout

```
index.html              the unified app
shell/
  shell.js              selection screen + mount/unmount + hash routing
  shell.css             shell styles (owns html/body)
  registry.js           ← the one file the whole team edits
korean-saju/            Haemin — complete
  index.html            standalone page, for working on it alone
  saju-page.js          the descriptor + UI
  saju.css              scoped styles
  engine/               the 만세력 — pure, framework-free, no DOM
  test/validate.js      engine checks
chinese-zodiac/         placeholder — see PSYCHIC_CONTRACT.md
harry-potter/           placeholder — see PSYCHIC_CONTRACT.md
PSYCHIC_CONTRACT.md     how to plug a psychic into the shell
```

Each psychic can be developed in isolation (`/korean-saju/` opens on its own)
and appears in the shell without any change to the shell itself.

---

## The Korean psychic: 사주팔자

This is a real 만세력 (Ten Thousand Year Calendar), not a lookup table.

A 사주 chart is eight characters — four pillars of two characters each —
describing the exact moment of birth. Getting them right is an astronomy
problem, and most quick implementations get it wrong in three specific places:

**The year does not turn on 1 January.** It turns at 입춘, the start of spring,
which falls around 4 February. It does not turn at lunar new year either, which
is the more common mistake. Someone born on 20 January 2024 has a 癸卯 chart, not
a 甲辰 one.

**The month does not follow the calendar.** A 사주 month begins the instant the
sun's apparent ecliptic longitude crosses a multiple of 15° — one of the twelve
절기. The engine computes the sun's position directly (Meeus, *Astronomical
Algorithms* ch. 25, plus a ΔT correction for the drift between terrestrial and
universal time) and solves for the crossing by Newton iteration.

**The hour is solar, not clock.** Seoul keeps UTC+9, which is the 135°E meridian,
but Seoul sits at 127°E — so the sun there runs about 32 minutes behind the wall
clock. Births between roughly 01:00 and 01:32 fall into the previous 시주. The
engine converts to true solar time before assigning the hour pillar, and will
also apply the equation of time on request.

It also handles the fact that Korean clocks have changed: UTC+8:30 for most of
the 1950s, and summer time as recently as 1988. Birthplace offsets come from IANA
timezone data via `Intl`, so historical shifts are handled for every city in the
list, not just Korean ones.

### From chart to reading

The eight characters are only the input. The reading comes from:

- **오행 balance** — the five elements, counted across all eight characters *and*
  the 지장간 (the stems hidden inside each branch), with the month branch
  weighted more heavily because the season you were born into dominates.
- **십신** — the ten relationships every other character has to your 일간 (day
  stem), which the tradition treats as "you".
- **신강/신약** — whether the chart supports or outnumbers your day master, which
  determines what the whole reading advises.
- **용신** — the element the chart is reaching for, derived from the above.
- **세운** — the current year's pillar read against your day master, which is
  where the forward-looking part of the fortune comes from.

Every branch is deterministic. The same birth moment always produces the same
reading; a different one produces a different reading. Nothing is random.

### Accuracy

The day pillar's absolute phase is pinned against two independently published
reference dates 357 years apart (1949-10-01 = 甲子, 1592-12-31 = 甲申). Solar
term times are accurate to within a few minutes across 1900–2100, which is finer
than any birth time anyone actually remembers — and when a birth lands within two
hours of a 절기 boundary, the reading says so rather than pretending to certainty.

### Honest limits

- 대운 (the ten-year luck cycles) are not implemented. They need the subject's
  sex to determine direction, which the brief puts out of scope.
- 신살 (the auxiliary star system) and 공망 are not implemented.
- The 야자시/조자시 question — whether the day pillar rolls over at 23:00 or at
  midnight — is a genuine disagreement between schools. The engine defaults to
  midnight (the more common Korean convention) and takes
  `{ dayBoundary: 'eleven' }` to switch.
- It is a fortune telling app. Please do not reorganise your life around it.
