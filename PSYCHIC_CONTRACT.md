# The psychic contract

**Read this before you start building your page.** It is short, and following it
means the merge at the end of the sprint is a ten-minute job instead of an
evening.

The brief lists this as an open risk: *"how the three psychics will plug into a
shared interface without feeling like three fully separate experiences."* This
document is the answer.

---

## The one rule

Your psychic is a folder that exports a **descriptor**. The shell imports it and
calls `mount()`. That is the entire interface between your work and everyone
else's.

```js
export const myPsychic = {
  id:         'chinese-zodiac',   // unique slug, becomes the URL (#chinese-zodiac)
  name:       'Chinese Zodiac',   // short display name on the selection card
  nameKo:     '생초',              // optional second line, omit if you like
  tagline:    'One line for the card',
  accent:     '#d4573f',          // your colour, used on the card
  stylesheet: new URL('./zodiac.css', import.meta.url).href,  // or null
  mount,                          // see below
};
```

And `mount`:

```js
export function mount(container) {
  // Build your page inside `container`. Do whatever you want in here.
  const root = document.createElement('div');
  root.className = 'zodiac';
  container.append(root);

  // ... your whole psychic ...

  return {
    unmount() { root.remove(); },   // called when the user goes back
  };
}
```

That is it. There is a working copy of exactly this in
`chinese-zodiac/zodiac-page.js` and `harry-potter/sorting-page.js` — start by
replacing the insides of `mount()` and leaving the descriptor alone.

---

## To add your psychic to the app

One import, one array entry, in `shell/registry.js`:

```js
import { chineseZodiac } from '../chinese-zodiac/zodiac-page.js';

export const PSYCHICS = [
  koreanSaju,
  chineseZodiac,   // <- yours
  sortingHat,
];
```

Then delete `comingSoon: true` from your descriptor so the "In progress" badge
disappears. Nothing else in the shell needs to change, ever.

---

## Three things that will break the merge if you skip them

### 1. Scope every CSS class and custom property

Three stylesheets load into one page. If two of us write `.card` or `--accent`,
they fight, and the bug shows up only after we combine — the worst possible time
to find it.

Pick a prefix and use it on **everything**:

| Who | Prefix | Example |
|---|---|---|
| Korean Four Pillars | `.saju` / `--saju-*` | `.saju__pillar`, `--saju-gold` |
| Chinese Zodiac | `.zodiac` / `--zodiac-*` | `.zodiac__wheel` |
| Sorting Hat | `.hat` / `--hat-*` | `.hat__question` |

### 2. Never style `html`, `body`, or a bare element

```css
/* NO -- this leaks into the other two psychics */
body { background: black; }
h1 { color: gold; }
button { border: none; }

/* YES -- scoped, cannot leak */
.zodiac { background: black; }
.zodiac__title { color: gold; }
.zodiac__btn { border: none; }
```

The shell owns `html` and `body`. If you need a full-bleed background, put it on
your own root element with `min-height: 100vh`.

### 3. Clean up in `unmount()`

If you add a `setInterval`, a `window` listener, or an audio element, remove it
in `unmount()`. Otherwise it keeps running after the user switches psychics, and
the symptom (mystery lag, sounds from the wrong page) is miserable to track down.

```js
return {
  unmount() {
    clearInterval(timer);
    window.removeEventListener('resize', onResize);
    root.remove();
  },
};
```

---

## Things you do *not* have to agree with anyone about

Deliberately: these are yours.

- How your page looks, as long as it is scoped
- Whether you use a form, a quiz, a wheel, or an animation
- How your fortune logic works
- Whether you write it in one file or twenty
- Whether you use a library (keep it to a CDN `<script type="module">` import so
  there is still no build step)

---

## No build step

Everything is plain ES modules. There is no npm install, no bundler, no
framework. To run the app:

```bash
npx serve .
```

…then open the printed URL. That is the whole setup, on any machine.

**If the team later moves to React/Vite:** the descriptor pattern survives it.
`mount(container)` becomes a component, and the registry becomes a route table.
Nothing about how you structure your psychic internally has to change.

---

## Checklist before you push

- [ ] Descriptor exported with a unique `id`
- [ ] `mount()` returns an object with `unmount()`
- [ ] Every CSS class starts with your prefix
- [ ] No `html`, `body`, or bare element selectors anywhere in your CSS
- [ ] Page works at 375px wide (check for horizontal scroll)
- [ ] At least three distinct outcomes, per the brief
- [ ] Added to `shell/registry.js` and `comingSoon` removed
