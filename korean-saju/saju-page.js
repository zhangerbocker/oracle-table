/**
 * Four Pillars — three screens: enter your details, wait with the tiger,
 * then read what the chart says.
 *
 * This module is the integration contract. It exports a descriptor with a
 * `mount(container)` function and touches nothing outside its own root.
 * See PSYCHIC_CONTRACT.md.
 *
 * The audience reads English only, so no Korean appears anywhere in the
 * interface. The eight characters themselves stay as glyphs — they are the
 * chart, not prose — and every one of them is captioned in English.
 */

import { computeLocal, generateNarrative } from './engine/narrative.js';
import { buildBirth, PLACES, PLACE_GROUPS, formatOffset, detectPlace } from './engine/places.js';
import { ELEMENT_INFO, ELEMENTS } from './engine/constants.js';
import { branchTenGod, tenGod } from './engine/analysis.js';
import { soulAnimal } from './data/soul-animals.js';
import { dokkaebiSvg } from './data/dokkaebi.js';
import { describeBalance, describeStrength, chartScore } from './data/chart-notes.js';

const PILLAR_LABELS = { year: 'Year', month: 'Month', day: 'Day', hour: 'Hour' };

const DUFFY_URL = new URL('../Duffy_image.webp', import.meta.url).href;

/** Where the letter sits on the tiger's tongue, measured off the image. */
const LETTER_BOX = { left: 43.26, top: 74.61, width: 13.36, height: 12.43 };

// ---------------------------------------------------------------------------
// Minimal DOM helper
// ---------------------------------------------------------------------------

function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'style') node.setAttribute('style', value);
    else if (key === 'html') node.innerHTML = value;
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key in node && key !== 'list') node[key] = value;
    else node.setAttribute(key, value);
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

const elementStyle = (element) => `--saju-el:${ELEMENT_INFO[element].color}`;

/**
 * Render text that may contain **marked phrases**.
 *
 * The reading marks its most important phrase per field so the page can
 * highlight it — long paragraphs of unbroken prose are hard to scan. Parsed
 * into real text and <strong> nodes rather than assigned as innerHTML, so
 * nothing the model writes can inject markup.
 */
function richText(text) {
  if (text == null) return [];
  // Odd indices are the captured groups, i.e. the marked phrases.
  return String(text).split(/\*\*(.+?)\*\*/g).map((part, i) => {
    if (!part) return null;
    return i % 2 === 1 ? el('mark', { class: 'saju__mark' }, part) : document.createTextNode(part);
  }).filter(Boolean);
}

/** A paragraph of reading prose, with its marked phrase highlighted. */
const body = (text, extra = '') =>
  el('p', { class: `saju__body${extra ? ' ' + extra : ''}` }, richText(text));

/** Dokkaebi masks, scattered behind everything as ward-off decoration. */
function backdrop() {
  const spots = [
    'saju__dok--tl', 'saju__dok--tr', 'saju__dok--bl', 'saju__dok--br', 'saju__dok--mid',
  ];
  return el('div', { class: 'saju__backdrop', 'aria-hidden': 'true' },
    spots.map((spot, i) =>
      el('div', { class: `saju__dok ${spot}`, html: dokkaebiSvg({ id: `dok${i}` }) })));
}

// ---------------------------------------------------------------------------
// SCREEN 1 — details
// ---------------------------------------------------------------------------

function buildFormScreen(onSubmit) {
  const dateInput = el('input', {
    class: 'saju__input', type: 'date', id: 'saju-date',
    min: '1900-01-01', max: '2100-12-31', value: '1992-02-20',
  });
  const timeInput = el('input', { class: 'saju__input', type: 'time', id: 'saju-time', value: '20:50' });

  const placeSelect = el('select', { class: 'saju__select', id: 'saju-place' },
    PLACE_GROUPS.map((group) =>
      el('optgroup', { label: group },
        PLACES.filter((p) => p.group === group).map((p) =>
          el('option', { value: p.id }, `${p.name}, ${p.country}`)))));
  placeSelect.value = detectPlace('seoul');

  // Sex is needed for one thing only: the ten-year cycles run forward for a
  // yang-year man or a yin-year woman, and backward for the other two. The
  // tradition has no third branch here, so this defaults rather than forcing
  // a choice nobody should have to make to read a fortune.
  let sex = 'female';
  const segButtons = [['female', 'Female'], ['male', 'Male']].map(([value, label]) =>
    el('button', {
      class: 'saju__seg', type: 'button', 'aria-pressed': String(value === sex),
      onClick(event) {
        sex = value;
        for (const b of segButtons) b.setAttribute('aria-pressed', String(b === event.currentTarget));
      },
    }, label));

  const timeField = el('div', { class: 'saju__field' },
    el('label', { class: 'saju__label', for: 'saju-time' }, 'Birth time'),
    timeInput);

  const unknownBox = el('input', { type: 'checkbox', id: 'saju-unknown' });
  unknownBox.addEventListener('change', () => {
    timeInput.disabled = unknownBox.checked;
    timeField.classList.toggle('saju__field--disabled', unknownBox.checked);
  });

  const error = el('p', { class: 'saju__error', hidden: true, role: 'alert' });

  const form = el('form', { class: 'saju__panel', novalidate: true },
    el('h2', { class: 'saju__panel-title' }, 'Your birth moment'),
    el('p', { class: 'saju__panel-note' },
      'The hour matters as much as the day — it is a quarter of the chart. ' +
      'Birthplace converts your clock time into true solar time.'),
    el('div', { class: 'saju__fields' },
      el('div', { class: 'saju__field' },
        el('label', { class: 'saju__label', for: 'saju-date' }, 'Birth date'),
        dateInput),
      timeField,
      el('div', { class: 'saju__field saju__field--wide' },
        el('label', { class: 'saju__label', for: 'saju-place' }, 'Birthplace'),
        placeSelect),
      el('div', { class: 'saju__field saju__field--wide' },
        el('span', { class: 'saju__label' }, 'Sex · sets the direction of your life chapters'),
        el('div', { class: 'saju__segmented' }, segButtons))),
    el('label', { class: 'saju__check', for: 'saju-unknown' },
      unknownBox, el('span', {}, "I don't know my birth time")),
    error,
    el('button', { class: 'saju__submit', type: 'submit' }, 'Check my reading'));

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    error.hidden = true;
    const fail = (message) => { error.textContent = message; error.hidden = false; };

    if (!dateInput.value) return fail('Please enter your birth date.');
    const year = Number(dateInput.value.slice(0, 4));
    if (!(year >= 1900 && year <= 2100)) return fail('This almanac covers births from 1900 to 2100.');
    if (!unknownBox.checked && !timeInput.value) {
      return fail('Enter a birth time, or tick "I don\'t know my birth time".');
    }

    onSubmit({
      date: dateInput.value,
      time: timeInput.value,
      placeId: placeSelect.value,
      timeUnknown: unknownBox.checked,
      sex,
    });
  });

  return el('div', { class: 'saju__screen' },
    el('div', { class: 'saju__hero' },
      el('p', { class: 'saju__eyebrow' }, 'The Korean Birth Chart'),
      el('h1', { class: 'saju__title' }, 'FOUR', el('br', {}), 'PILLARS'),
      el('p', { class: 'saju__lede' },
        'The exact moment you were born assigns you eight characters — two each ' +
        'for the year, month, day and hour. Korean fortune-telling has read them ' +
        'for centuries as the shape of a whole life: what you are made of, what you ' +
        'keep repeating, and what the years ahead are likely to ask of you.'),
      el('p', { class: 'saju__lede saju__lede--small' },
        'Yours are worked out here from real astronomy — the sun’s actual ' +
        'position and the true solar time at your birthplace. Not a birthday quiz.')),
    form);
}

// ---------------------------------------------------------------------------
// SCREEN 2 — the tiger holds your letter
// ---------------------------------------------------------------------------

/**
 * How long a reading usually takes. Used only to drive the countdown — the
 * screen unlocks on the actual response, never on the timer.
 */
const ESTIMATED_SECONDS = 18;

/**
 * The waiting screen.
 *
 * The letter on the tiger's tongue only unlocks when the *written reading* has
 * arrived. The chart alone is not enough: opening the letter to a half-empty
 * page would make the wait feel pointless.
 *
 * If the reading fails, the letter stays shut and a separate escape hatch
 * appears, so nobody is trapped on this screen.
 */
function buildWaitScreen({ onOpen, onRetry, onSkip }) {
  const letter = el('button', {
    class: 'saju__letter',
    type: 'button',
    disabled: true,
    'aria-label': 'Your reading is still being written',
    style: `left:${LETTER_BOX.left}%;top:${LETTER_BOX.top}%;` +
           `width:${LETTER_BOX.width}%;height:${LETTER_BOX.height}%`,
    onClick: onOpen,
  });

  const status = el('p', { class: 'saju__wait-status', role: 'status' }, 'Writing your reading…');
  const countdown = el('p', { class: 'saju__wait-count' });
  const bar = el('div', { class: 'saju__wait-bar-fill' });
  const hint = el('p', { class: 'saju__wait-hint' }, 'The tiger is still working.');
  const recovery = el('div', { class: 'saju__wait-recovery', hidden: true });

  const screen = el('div', { class: 'saju__screen saju__wait' },
    el('div', { class: 'saju__duffy' },
      el('img', { class: 'saju__duffy-img', src: DUFFY_URL, alt: '', loading: 'eager' }),
      letter),
    status,
    el('div', { class: 'saju__wait-bar' }, bar),
    countdown,
    hint,
    recovery);

  // Countdown. It is an estimate, so it stops at zero and says so rather than
  // going negative or pretending to be finished.
  let started = Date.now();
  let timer = setInterval(tick, 200);
  tick();

  function tick() {
    const elapsed = (Date.now() - started) / 1000;
    const left = Math.max(0, ESTIMATED_SECONDS - elapsed);
    bar.style.width = `${Math.min(97, (elapsed / ESTIMATED_SECONDS) * 100)}%`;
    countdown.textContent = left > 0
      ? `about ${Math.ceil(left)} second${Math.ceil(left) === 1 ? '' : 's'} left`
      : 'any moment now…';
  }

  const stopTimer = () => { clearInterval(timer); timer = null; };

  return {
    node: screen,
    ready() {
      stopTimer();
      screen.classList.add('saju__wait--ready');
      bar.style.width = '100%';
      letter.disabled = false;
      letter.setAttribute('aria-label', 'Open your reading');
      status.textContent = 'Your reading is ready.';
      countdown.textContent = '';
      hint.textContent = 'Take the letter from the tiger.';
      letter.focus({ preventScroll: true });
    },
    failed(note) {
      stopTimer();
      screen.classList.add('saju__wait--failed');
      bar.style.width = '100%';
      status.textContent = 'The tiger could not finish writing.';
      countdown.textContent = '';
      hint.textContent = note || 'The reading service did not answer.';
      recovery.hidden = false;
      recovery.replaceChildren(
        el('button', { class: 'saju__retry', type: 'button', onClick: onRetry }, 'Try again'),
        el('button', { class: 'saju__skip', type: 'button', onClick: onSkip },
          'Show my chart without the reading'));
    },
    restart() {
      recovery.hidden = true;
      screen.classList.remove('saju__wait--failed');
      status.textContent = 'Writing your reading…';
      hint.textContent = 'The tiger is still working.';
      stopTimer();
      started = Date.now();
      timer = setInterval(tick, 200);
      tick();
    },
    dispose: stopTimer,
  };
}

// ---------------------------------------------------------------------------
// SCREEN 3 — the reading
// ---------------------------------------------------------------------------

function renderSoulAnimal(soul, chart) {
  const frame = soul.hasArt
    ? el('div', {
        class: 'saju__soul-frame',
        role: 'img',
        'aria-label': `${soul.animal}, the soul animal of the ${soul.name} day pillar`,
        style:
          `--sprite:url("${soul.crop.url}");` +
          `--sprite-x:${soul.crop.posX.toFixed(4)}%;--sprite-y:${soul.crop.posY.toFixed(4)}%;` +
          `--sprite-w:${soul.crop.sizeX.toFixed(4)}%;--sprite-h:${soul.crop.sizeY.toFixed(4)}%;` +
          `--sprite-aspect:${soul.crop.aspect.toFixed(4)}`,
      })
    : el('div', { class: 'saju__soul-frame saju__soul-frame--pending' },
        el('span', {}, animalEmoji(soul.animal)));

  return el('section', { class: 'saju__panel saju__soul' },
    el('p', { class: 'saju__soul-eyebrow' }, 'Your soul animal'),
    frame,
    el('h2', { class: 'saju__soul-animal' }, soul.animal),
    el('p', { class: 'saju__soul-name' }, `${soul.name} · Day Pillar ${soul.n} of 60`),
    el('p', { class: 'saju__soul-line' }, soul.line));
}

const ANIMAL_EMOJI = {
  Rat: '\u{1F401}', Ox: '\u{1F402}', Tiger: '\u{1F405}', Rabbit: '\u{1F407}',
  Dragon: '\u{1F409}', Snake: '\u{1F40D}', Horse: '\u{1F40E}', Sheep: '\u{1F411}',
  Goat: '\u{1F411}', Monkey: '\u{1F412}', Rooster: '\u{1F413}', Dog: '\u{1F415}',
  Pig: '\u{1F416}',
};
const animalEmoji = (name) => ANIMAL_EMOJI[name] ?? '✨';

/**
 * Who you are, and the chart that says so — one section.
 *
 * This was three panels (who you are / the characters / the elements) and the
 * split made the reader do the joining. Now the claim comes first, the eight
 * characters sit underneath it as the evidence, and the elements follow.
 */
function renderChart(chart, analysis, identity, prose) {
  const { balance } = analysis;
  const visibleCount = chart.pillars.hour ? 8 : 6;

  const cards = ['year', 'month', 'day', 'hour'].map((kind) => {
    const pillar = chart.pillars[kind];
    if (!pillar) {
      return el('div', { class: 'saju__pillar' },
        el('div', { class: 'saju__pillar-kind' }, PILLAR_LABELS[kind]),
        el('span', { class: 'saju__char' }, '—'),
        el('span', { class: 'saju__char' }, '—'),
        el('div', { class: 'saju__pillar-sub' }, 'unknown'));
    }
    const stage = analysis.stages[kind].forDayMaster;
    const stemGod = kind === 'day' ? null : tenGod(chart.dayMasterIndex, pillar.stemIndex);
    const branchGod = branchTenGod(chart.dayMasterIndex, pillar.branchIndex);

    return el('div', {
      class: `saju__pillar${kind === 'day' ? ' saju__pillar--day' : ''}`,
      // The relationship names and life stage live in the tooltip now. On the
      // card they were four words of jargon per column that explained nothing.
      title: kind === 'day'
        ? `Your day master — this pillar is you. Life stage: ${stage.en}.`
        : `${stemGod.en} over ${branchGod.en}. Life stage: ${stage.en} — ${stage.note}.`,
    },
      el('div', { class: 'saju__pillar-kind' }, kind === 'day' ? 'Day · you' : PILLAR_LABELS[kind]),
      el('span', { class: 'saju__char', style: elementStyle(pillar.stem.element) }, pillar.stem.hanja),
      el('span', { class: 'saju__char', style: elementStyle(pillar.branch.element) }, pillar.branch.hanja),
      el('div', { class: 'saju__pillar-sub' },
        `${pillar.stem.yin ? 'Yin' : 'Yang'} ${ELEMENT_INFO[pillar.stem.element].en}`),
      el('div', { class: 'saju__pillar-sub' }, pillar.branch.animal));
  });

  const rows = ELEMENTS.map((element) => {
    const info = ELEMENT_INFO[element];
    const count = balance.simple[element];
    const percent = balance.percent[element];
    const fill = el('div', { class: 'saju__bar-fill' });
    requestAnimationFrame(() => { fill.style.width = `${Math.min(100, percent * 2.4)}%`; });

    return el('div', {
      class: `saju__bar-row${count === 0 ? ' saju__bar-row--zero' : ''}`,
      style: elementStyle(element),
      title: `${count} of ${visibleCount} characters · ${percent.toFixed(0)}% with hidden stems counted`,
    },
      el('div', { class: 'saju__bar-name' }, info.en),
      el('div', { class: 'saju__bar-track' }, fill),
      el('div', { class: 'saju__bar-value' }, String(count)));
  });

  const score = chartScore(balance, analysis.strength);

  return el('section', { class: 'saju__panel' },
    el('h2', { class: 'saju__panel-title' }, 'Who the chart says you are'),

    // The score is computed, not written by the reader, so it is the same
    // number every time for the same birth moment.
    el('div', { class: `saju__score saju__score--${score.tone}` },
      el('div', { class: 'saju__score-ring' },
        el('span', { class: 'saju__score-num' }, String(score.score)),
        el('span', { class: 'saju__score-out' }, '/ 100')),
      el('div', { class: 'saju__score-text' },
        el('div', { class: 'saju__score-label' }, score.label),
        el('p', { class: 'saju__score-note' }, score.note),
        el('p', { class: 'saju__score-caveat' },
          'Scores how evenly your chart is balanced — not how good your life will be. ' +
          'A tilted chart is not a worse one; it is a more specialised one.'))),

    identity ? body(identity, 'saju__chart-lead') : null,

    el('div', { class: 'saju__chart-divider' },
      el('span', {}, 'The eight characters')),
    el('p', { class: 'saju__panel-note saju__panel-note--centred' },
      `Born in the ${chart.pillars.month.branch.animal} month of the ` +
      `${chart.pillars.year.branch.animal} year. Hover any pillar for more.`),
    el('div', { class: 'saju__pillars' }, cards),

    el('div', { class: 'saju__chart-divider' },
      el('span', {}, 'What they add up to')),
    el('div', { class: 'saju__balance' }, rows),

    // Always present, computed, never guessed — so the chart still means
    // something when the written reading is unavailable.
    el('p', { class: 'saju__body saju__chart-summary' },
      describeBalance(balance, visibleCount)),
    el('p', { class: 'saju__body saju__chart-summary' },
      describeStrength(analysis.strength, chart.dayMaster.element)),

    prose ? body(prose, 'saju__chart-prose') : null);
}

function renderStrengths(text) {
  return el('section', { class: 'saju__panel saju__panel--good' },
    el('h2', { class: 'saju__panel-title' }, 'What you have going for you'),
    el('p', { class: 'saju__panel-note' }, 'What this chart is genuinely good at.'),
    body(text));
}

function renderThemes(themes) {
  return el('section', { class: 'saju__panel' },
    el('h2', { class: 'saju__panel-title' }, 'Patterns you keep repeating'),
    el('p', { class: 'saju__panel-note' },
      'The same situations come back until they are dealt with. These are the ones ' +
      'your chart keeps setting up.'),
    themes.map((theme, i) =>
      el('div', { class: 'saju__theme' },
        el('div', { class: 'saju__theme-no' }, String(i + 1).padStart(2, '0')),
        el('h3', { class: 'saju__theme-title' }, theme.title),
        body(theme.body))));
}

function renderCareer(career) {
  // Tolerate the old shape, in case a cached reading predates the change.
  if (typeof career === 'string') {
    return el('section', { class: 'saju__panel' },
      el('h2', { class: 'saju__panel-title' }, 'Work & money'),
      body(career));
  }

  const list = (items, kind) => el('ul', { class: `saju__jobs saju__jobs--${kind}` },
    items.map((item) => el('li', {}, richText(item))));

  return el('section', { class: 'saju__panel' },
    el('h2', { class: 'saju__panel-title' }, 'Work & money'),
    career.body ? body(career.body) : null,
    career.fits?.length
      ? el('div', { class: 'saju__jobs-group' },
          el('div', { class: 'saju__jobs-head saju__jobs-head--fit' }, 'Work that fits you'),
          list(career.fits, 'fit'))
      : null,
    career.avoid?.length
      ? el('div', { class: 'saju__jobs-group' },
          el('div', { class: 'saju__jobs-head saju__jobs-head--avoid' }, 'Work to avoid'),
          list(career.avoid, 'avoid'))
      : null);
}

/** A collapsed section — native <details>, so it works without JS. */
function collapsible(title, ...content) {
  return el('details', { class: 'saju__more' },
    el('summary', {}, el('span', {}, title), el('span', { class: 'saju__more-hint' }, 'Read')),
    el('div', { class: 'saju__more-body' }, content));
}

function renderAdvice(advice) {
  return el('div', {},
    el('section', { class: 'saju__panel' },
      el('h2', { class: 'saju__panel-title' }, 'What to do with this'),
      el('div', { class: 'saju__advice' },
        el('div', { class: 'saju__advice-item', style: '--saju-accent:var(--saju-red)' },
          el('div', { class: 'saju__advice-label' }, 'Stop'),
          body(advice.stop)),
        el('div', { class: 'saju__advice-item', style: '--saju-accent:var(--saju-wood)' },
          el('div', { class: 'saju__advice-label' }, 'Keep'),
          body(advice.keep)))),
    el('div', { class: 'saju__truth' }, el('p', {}, richText(advice.truth))));
}

function renderReading(reading) {
  // `identity` and `elements` are rendered inside the chart section, not here.
  return el('div', {},
    reading.strengths ? renderStrengths(reading.strengths) : null,
    reading.themes?.length ? renderThemes(reading.themes) : null,
    reading.career ? renderCareer(reading.career) : null,
    reading.love ? collapsible('Love', body(reading.love)) : null,
    reading.family ? collapsible('Family', body(reading.family)) : null,
    reading.chapters
      ? collapsible('Your life chapters',
          chapter('The arc', reading.chapters.summary),
          chapter('Right now', reading.chapters.now),
          chapter('What comes next', reading.chapters.next))
      : null,
    reading.advice ? renderAdvice(reading.advice) : null);
}

function chapter(label, text) {
  if (!text) return null;
  return el('div', { class: 'saju__chapter' },
    el('div', { class: 'saju__chapter-label' }, label),
    body(text));
}

function renderNotes(chart, context) {
  const notes = [];
  if (chart.timing.timeUnknown) {
    notes.push('No birth time was given, so the Hour pillar is missing — a quarter of the chart.');
  }
  if (Math.abs(chart.timing.correctionMinutes) >= 1) {
    const mins = Math.round(chart.timing.correctionMinutes);
    notes.push(
      `Clock ${pad(chart.timing.clockTime.hour)}:${pad(chart.timing.clockTime.minute)} became solar ` +
      `${pad(chart.timing.solarTime.hour)}:${pad(chart.timing.solarTime.minute)} — the sun at your ` +
      `birthplace runs ${Math.abs(mins)} minutes ${mins < 0 ? 'behind' : 'ahead of'} the clock.`);
  }
  if (chart.solarTerm.nearBoundary) {
    const mins = Math.round(Math.min(chart.solarTerm.minutesSinceOpening, chart.solarTerm.minutesUntilNext));
    notes.push(
      `You were born within ${mins} minutes of a solar-term boundary, where the Month pillar ` +
      'changes. An hour’s error in your recorded time would move this chart into the ' +
      'neighbouring month.');
  }
  notes.push(
    `Cast for ${context.place.name}, ${context.place.country} ` +
    `(${formatOffset(context.utcOffset)} on that date).`);

  return el('section', { class: 'saju__panel saju__notes' },
    el('h2', { class: 'saju__panel-title' }, 'How this was calculated'),
    notes.map((note) => el('div', { class: 'saju__note' }, note)));
}

const pad = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------------------
// Mount
// ---------------------------------------------------------------------------

export function mount(container) {
  const root = el('div', { class: 'saju' });
  const shell = el('div', { class: 'saju__shell' });
  root.append(backdrop(), shell);
  container.append(root);

  let inFlight = null;

  const showForm = () => {
    if (inFlight) { inFlight.abort(); inFlight = null; }
    shell.replaceChildren(buildFormScreen(startReading));
    window.scrollTo({ top: 0 });
  };

  function startReading(input) {
    let context;
    try {
      context = buildBirth(input);
    } catch (error) {
      console.error('[korean-saju] could not resolve birthplace', error);
      return;
    }

    // The chart is computed locally and is ready immediately; only the written
    // interpretation needs the network. The tiger covers that wait.
    const { chart, analysis } = computeLocal(context.birth, input.sex);
    const soul = soulAnimal(chart.pillars.day.cycle);

    let reading = null;

    const wait = buildWaitScreen({
      // The letter only ever opens a complete reading.
      onOpen: () => {
        if (!reading) return;
        wait.dispose();
        showResults(chart, analysis, soul, context, reading);
      },
      onRetry: () => { wait.restart(); fetchReading(); },
      // An escape hatch, not the main path: the chart on its own is still real.
      onSkip: () => { wait.dispose(); showResults(chart, analysis, soul, context, null); },
    });

    shell.replaceChildren(wait.node);
    window.scrollTo({ top: 0 });
    fetchReading();

    function fetchReading() {
      const controller = new AbortController();
      inFlight = controller;

      generateNarrative(context.birth, {
        sex: input.sex,
        imageryText: { description: soul.line },
        signal: controller.signal,
      })
        .then((result) => {
          if (controller.signal.aborted) return;
          reading = result.reading;
          wait.ready();
        })
        .catch((error) => {
          if (controller.signal.aborted) return;
          console.error('[korean-saju] reading failed', error);
          wait.failed(error?.status === 429
            ? 'Too many readings from here in the last hour. Your chart is still ready below.'
            : null);
        })
        .finally(() => { if (inFlight === controller) inFlight = null; });
    }
  }

  function showResults(chart, analysis, soul, context, reading) {
    shell.replaceChildren(el('div', { class: 'saju__screen' },
      el('button', { class: 'saju__back', type: 'button', onClick: showForm },
        el('span', {}, '←'), ' Start over'),
      renderSoulAnimal(soul, chart),
      renderChart(chart, analysis, reading?.identity ?? null, reading?.elements ?? null),
      reading
        ? renderReading(reading)
        : el('section', { class: 'saju__panel saju__loading' },
            el('p', {}, 'The written reading could not be generated.'),
            el('small', {}, 'Your chart above is correct and complete — only the ' +
              'interpretation needs the reading service.')),
      renderNotes(chart, context),
      el('p', { class: 'saju__footer' },
        'Calculated from real astronomy — the 24 solar terms by the sun’s ',
        'ecliptic longitude, true solar time, and the sixty-pillar cycle.',
        el('br', {}),
        'For entertainment. Please do not reorganise your life around it.')));
    window.scrollTo({ top: 0 });
  }

  showForm();

  return {
    unmount() {
      if (inFlight) inFlight.abort();
      root.remove();
    },
  };
}

/** The descriptor the combined app consumes. See PSYCHIC_CONTRACT.md. */
export const koreanSaju = {
  id: 'korean-saju',
  name: 'Four Pillars',
  tagline: 'Korean birth-chart reading from the exact moment you were born',
  accent: '#ffab2e',
  stylesheet: new URL('./saju.css', import.meta.url).href,
  mount,
};

export default koreanSaju;
