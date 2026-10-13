/**
 * The one file the whole team edits together.
 *
 * Each psychic lives in its own folder and exports a descriptor. Adding one to
 * the app means adding one import and one array entry here -- nothing else in
 * the shell needs to know anything about how a psychic works internally.
 *
 * Descriptor shape (see PSYCHIC_CONTRACT.md):
 *   {
 *     id:         string    unique slug, used in the URL hash
 *     name:       string    short display name
 *     nameKo?:    string    optional secondary script shown under the name
 *     tagline:    string    one line for the selection card
 *     accent:     string    CSS colour for the card
 *     stylesheet: string    absolute URL to the psychic's own CSS
 *     mount(container) -> { unmount() }
 *   }
 */

import { koreanSaju } from '../korean-saju/saju-page.js';
import { chineseZodiac } from '../chinese-zodiac/zodiac-page.js';
import { sortingHat } from '../harry-potter/sorting-page.js';

export const PSYCHICS = [
  koreanSaju,
  chineseZodiac,
  sortingHat,
];

export function findPsychic(id) {
  return PSYCHICS.find((p) => p.id === id) ?? null;
}
