/**
 * Chinese Zodiac psychic -- PLACEHOLDER.
 *
 * This file exists so the shell has something real to mount while the page is
 * being built. It is also the template: whoever owns this psychic can replace
 * the body of `mount()` entirely, as long as the exported descriptor at the
 * bottom keeps its shape. See PSYCHIC_CONTRACT.md.
 *
 * Deliberately standalone -- it imports nothing from korean-saju or the shell,
 * so you can rewrite this folder however you like without breaking anything.
 */

/**
 * @param {HTMLElement} container
 * @returns {{unmount: () => void}}
 */
export function mount(container) {
  const root = document.createElement('div');
  root.className = 'psy-stub';
  root.style.setProperty('--stub-glow', '#3a1f28');
  root.style.setProperty('--stub-accent', '#d4573f');

  const inner = document.createElement('div');
  inner.className = 'psy-stub__inner';
  inner.innerHTML = '';

  const glyph = document.createElement('div');
  glyph.className = 'psy-stub__glyph';
  glyph.textContent = '生肖';

  const title = document.createElement('h1');
  title.className = 'psy-stub__title';
  title.textContent = 'Chinese Zodiac';

  const owner = document.createElement('p');
  owner.className = 'psy-stub__owner';
  owner.textContent = 'Under construction';

  const body = document.createElement('p');
  body.className = 'psy-stub__body';
  body.textContent =
    'This psychic is still being built. The shell already knows how to mount it, ' +
    'so dropping in the real page is a matter of replacing one function — ' +
    'no changes needed anywhere else in the app.';

  const file = document.createElement('code');
  file.className = 'psy-stub__file';
  file.textContent = 'chinese-zodiac/zodiac-page.js';

  inner.append(glyph, title, owner, body, file);
  root.append(inner);
  container.append(root);

  return {
    unmount() {
      root.remove();
    },
  };
}

/** The descriptor the shell consumes. Keep this shape. */
export const chineseZodiac = {
  id: 'chinese-zodiac',
  name: 'Chinese Zodiac',
  nameKo: '生肖',
  tagline: 'Twelve animals, sixty years, and the one you were born under',
  accent: '#d4573f',
  stylesheet: null, // point this at your own CSS file when you have one
  comingSoon: true,
  mount,
};

export default chineseZodiac;
