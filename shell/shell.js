/**
 * The unified shell.
 *
 * Renders the selection screen, mounts whichever psychic the user picks, and
 * unmounts it when they go back. It knows nothing about any psychic beyond the
 * descriptor contract -- which is the whole point: three people can build three
 * very different pages and this file never has to change.
 */

import { PSYCHICS, findPsychic } from './registry.js';

const loadedStylesheets = new Set();

/** Pull in a psychic's stylesheet the first time it is needed. */
function ensureStylesheet(href) {
  if (!href || loadedStylesheets.has(href)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.append(link);
  loadedStylesheets.add(href);
}

export function startShell(container) {
  const root = document.createElement('div');
  root.className = 'psy';
  container.append(root);

  /** @type {{unmount: () => void} | null} */
  let active = null;

  function clear() {
    if (active) {
      active.unmount();
      active = null;
    }
    root.replaceChildren();
  }

  // -- selection screen ---------------------------------------------------

  function showHome() {
    clear();
    document.title = 'Psychics';

    const cards = PSYCHICS.map((psychic, index) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = `psy__card${psychic.comingSoon ? ' psy__card--soon' : ''}`;
      card.style.setProperty('--accent', psychic.accent ?? '#d9ae5f');
      card.addEventListener('click', () => {
        location.hash = psychic.id;
      });

      const parts = [];
      if (psychic.comingSoon) {
        parts.push(tag('span', 'psy__card-badge', 'In progress'));
      }
      parts.push(tag('div', 'psy__card-index', String(index + 1).padStart(2, '0')));
      parts.push(tag('h2', 'psy__card-name', psychic.name));
      if (psychic.nameKo) parts.push(tag('p', 'psy__card-ko', psychic.nameKo));
      parts.push(tag('p', 'psy__card-tagline', psychic.tagline));
      parts.push(tag('div', 'psy__card-go', 'Begin →'));
      card.append(...parts);
      return card;
    });

    const home = tag('div', 'psy__home');
    const inner = tag('div', 'psy__home-inner');
    const hero = tag('div', 'psy__hero');
    hero.append(
      tag('p', 'psy__eyebrow', 'Three readings, one door'),
      tag('h1', 'psy__wordmark', 'Psychics'),
      tag('p', 'psy__lede',
        'Pick a tradition. Each one asks for something different about you, ' +
        'and each one has its own idea of what the answer means.'),
    );

    const grid = tag('div', 'psy__cards');
    grid.append(...cards);

    inner.append(hero, grid, tag('div', 'psy__home-footer',
      'Built by Haemin, Mrunali and Grace · for entertainment only'));
    home.append(inner);
    root.append(home);
  }

  // -- a single psychic ---------------------------------------------------

  function showPsychic(psychic) {
    clear();
    document.title = `${psychic.name} · Psychics`;
    ensureStylesheet(psychic.stylesheet);

    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'psy__back';
    back.append(tag('span', '', '←'), document.createTextNode('All psychics'));
    back.addEventListener('click', () => { location.hash = ''; });

    const stage = tag('div', 'psy__stage');
    root.append(back, stage);

    try {
      active = psychic.mount(stage) ?? null;
    } catch (error) {
      console.error(`[shell] "${psychic.id}" failed to mount`, error);
      stage.append(tag('div', 'psy__home',
        `This psychic could not be summoned. Check the console for details.`));
    }

    window.scrollTo({ top: 0 });
  }

  // -- routing ------------------------------------------------------------

  function route() {
    const id = location.hash.replace(/^#/, '');
    const psychic = id ? findPsychic(id) : null;
    if (psychic) showPsychic(psychic);
    else showHome();
  }

  window.addEventListener('hashchange', route);
  route();
}

function tag(name, className, text) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
