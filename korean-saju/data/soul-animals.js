/**
 * Soul animals for all sixty day pillars.
 *
 * Lines come from 60_day_pillars_soul_animal_art_direction.xlsx, in exact
 * sexagenary order, so the array index equals the engine's cycleIndex and
 * n === cycleIndex + 1.
 *
 * The artwork is spread across two sprite sheets with different grids. Cell
 * rectangles below were measured off the images by scanning for the white
 * gutter lines, not assumed from the grid size -- neither sheet divides evenly,
 * and guessing lands every crop low enough to drag the next row's caption into
 * frame.
 *
 * GENERATED. If a cell shows the wrong animal, correct its {sheet, row, col}
 * here; nothing else in the app needs to change.
 */

/**
 * Exact pixel spans of each cell, per sheet: the content between gutters.
 * `rows` and `cols` are [start, end] pairs, inclusive.
 */
export const SHEETS = {
  1: {
    url: new URL('../assets/soul-animals.png', import.meta.url).href,
    width: 1536,
    height: 1024,
    cols: [[0,189],[192,381],[385,574],[578,766],[770,958],[962,1151],[1155,1343],[1347,1535]],
    // The last row's span runs to the image edge, but its artwork is the same
    // height as the others -- the sheet just has dead space below it.
    rows: [[0,189],[192,383],[386,575],[579,769],[772,962]],
  },
  2: {
    url: new URL('../assets/soul-animals-2.png', import.meta.url).href,
    width: 1536,
    height: 1024,
    cols: [[0,220],[225,437],[443,656],[662,876],[881,1099],[1104,1317],[1323,1535]],
    rows: [[0,339],[345,664],[670,1023]],
  },
};

/**
 * The whole cell is shown, caption and all.
 *
 * Earlier versions trimmed the painted pillar name off the top, on the grounds
 * that the app is English-only. That cost scenery at every edge and never
 * looked right: these are complete paintings, and cropping into them to hide
 * two characters in a corner spoiled the composition they were drawn with.
 * The caption is part of the artwork now.
 */

export const SOUL_ANIMALS = [
  { n: 1, hanja: "甲子", name: "Gapja", animal: "Rat",
    art: { sheet: 1, row: 0, col: 0 },
    line: "A clever rat beneath a winter tree by deep water — watchful, resourceful, and quietly resilient." },
  { n: 2, hanja: "乙丑", name: "Eulchuk", animal: "Ox",
    art: { sheet: 1, row: 0, col: 1 },
    line: "A steadfast ox beside a sprout breaking frozen ground — patient, grounded, and built to endure." },
  { n: 3, hanja: "丙寅", name: "Byeongin", animal: "Tiger",
    art: { sheet: 2, row: 0, col: 0 },
    line: "A fiery tiger striding through the first light of spring — bold, restless, and born to begin." },
  { n: 4, hanja: "丁卯", name: "Jeongmyo", animal: "Rabbit",
    art: { sheet: 2, row: 0, col: 1 },
    line: "A gentle rabbit glowing among spring blossoms — perceptive, warm, and quietly magnetic." },
  { n: 5, hanja: "戊辰", name: "Mujin", animal: "Dragon",
    art: { sheet: 1, row: 3, col: 0 },
    line: "A dragon wrapped around a rain-washed spring mountain — commanding, protective, and larger than life." },
  { n: 6, hanja: "己巳", name: "Gisa", animal: "Snake",
    art: { sheet: 1, row: 3, col: 1 },
    line: "A poised snake moving through a fertile early-summer field — observant, adaptable, and quietly ambitious." },
  { n: 7, hanja: "庚午", name: "Gyeongo", animal: "Horse",
    art: { sheet: 1, row: 0, col: 6 },
    line: "A steel-hearted horse beneath the blazing summer sun — fierce, decisive, and impossible to tame." },
  { n: 8, hanja: "辛未", name: "Sinmi", animal: "Sheep",
    art: { sheet: 1, row: 3, col: 4 },
    line: "A graceful sheep beside a jewel emerging from warm earth — refined, gentle, and stronger than it looks." },
  { n: 9, hanja: "壬申", name: "Imsin", animal: "Monkey",
    art: { sheet: 1, row: 1, col: 5 },
    line: "A quick-witted monkey above a rushing autumn torrent — curious, daring, and always finding a way." },
  { n: 10, hanja: "癸酉", name: "Gyeyu", animal: "Rooster",
    art: { sheet: 1, row: 1, col: 7 },
    line: "A radiant rooster among dew-bright autumn grasses — precise, polished, and keenly aware." },
  { n: 11, hanja: "甲戌", name: "Gapsul", animal: "Dog",
    art: { sheet: 1, row: 2, col: 0 },
    line: "A loyal dog beneath a lone late-autumn tree — steadfast, principled, and unshaken by hard seasons." },
  { n: 12, hanja: "乙亥", name: "Eulhae", animal: "Pig",
    art: { sheet: 1, row: 2, col: 1 },
    line: "A gentle pig threading through reeds at winter’s edge — flexible, intuitive, and quietly persistent." },
  { n: 13, hanja: "丙子", name: "Byeongja", animal: "Rat",
    art: { sheet: 1, row: 2, col: 2 },
    line: "A bright-eyed rat facing sunrise over frozen water — spirited, ingenious, and drawn to possibility." },
  { n: 14, hanja: "丁丑", name: "Jeongchuk", animal: "Ox",
    art: { sheet: 1, row: 4, col: 3 },
    line: "A calm ox guarding a small flame in the winter dark — dependable, tender, and quietly strong." },
  { n: 15, hanja: "戊寅", name: "Muin", animal: "Tiger",
    art: { sheet: 1, row: 2, col: 7 },
    line: "A mountain tiger watching spring awaken below — grounded, self-possessed, and naturally authoritative." },
  { n: 16, hanja: "己卯", name: "Gimyo", animal: "Rabbit",
    art: { sheet: 2, row: 0, col: 2 },
    line: "A nurturing rabbit tending the first flowers of spring — gentle, practical, and quietly abundant." },
  { n: 17, hanja: "庚辰", name: "Gyeongjin", animal: "Dragon",
    art: { sheet: 1, row: 3, col: 2 },
    line: "A dragon guarding hidden metal beneath rain-dark earth — formidable, disciplined, and built for pressure." },
  { n: 18, hanja: "辛巳", name: "Sinsa", animal: "Snake",
    art: { sheet: 1, row: 1, col: 3 },
    line: "A jeweled snake gleaming in early-summer sun — elegant, discerning, and sharply self-aware." },
  { n: 19, hanja: "壬午", name: "Imo", animal: "Horse",
    art: { sheet: 1, row: 1, col: 4 },
    line: "A free-running horse crossing a great summer river — expansive, fearless, and driven by momentum." },
  { n: 20, hanja: "癸未", name: "Gyemi", animal: "Sheep",
    art: { sheet: 1, row: 1, col: 6 },
    line: "A soft-hearted sheep beneath a life-giving summer rain — receptive, generous, and quietly restorative." },
  { n: 21, hanja: "甲申", name: "Gapsin", animal: "Monkey",
    art: { sheet: 2, row: 0, col: 3 },
    line: "A nimble monkey among towering trees and hard stone — inventive, competitive, and tested into strength." },
  { n: 22, hanja: "乙酉", name: "Eulyu", animal: "Rooster",
    art: { sheet: 1, row: 4, col: 2 },
    line: "A graceful rooster among autumn flowers — polished, resilient, and beautifully exacting." },
  { n: 23, hanja: "丙戌", name: "Byeongsul", animal: "Dog",
    art: { sheet: 2, row: 0, col: 4 },
    line: "A noble dog beneath the last great sun of autumn — proud, loyal, and radiant even in retreat." },
  { n: 24, hanja: "丁亥", name: "Jeonghae", animal: "Pig",
    art: { sheet: 1, row: 4, col: 4 },
    line: "A warm-hearted pig beside a winter river lit by a single flame — intuitive, compassionate, and quietly luminous." },
  { n: 25, hanja: "戊子", name: "Muja", animal: "Rat",
    art: { sheet: 1, row: 2, col: 6 },
    line: "A small rat beneath a mountain holding deep winter waters — strategic, steady, and stronger beneath the surface." },
  { n: 26, hanja: "己丑", name: "Gichuk", animal: "Ox",
    art: { sheet: 1, row: 4, col: 5 },
    line: "A patient ox standing over earth waiting for spring — practical, loyal, and slow to give up." },
  { n: 27, hanja: "庚寅", name: "Gyeongin", animal: "Tiger",
    art: { sheet: 2, row: 0, col: 5 },
    line: "A fierce tiger pushing through the first hard forest of spring — disciplined, courageous, and ready for resistance." },
  { n: 28, hanja: "辛卯", name: "Sinmyo", animal: "Rabbit",
    art: { sheet: 1, row: 1, col: 2 },
    line: "A luminous rabbit among jeweled spring dew — refined, sensitive, and effortlessly charming." },
  { n: 29, hanja: "壬辰", name: "Imjin", animal: "Dragon",
    art: { sheet: 2, row: 0, col: 6 },
    line: "A storm-born dragon rising from a river swollen with spring — visionary, powerful, and impossible to contain." },
  { n: 30, hanja: "癸巳", name: "Gyesa", animal: "Snake",
    art: { sheet: 1, row: 3, col: 7 },
    line: "A watchful snake curled beside a clear summer spring — subtle, intuitive, and quietly penetrating." },
  { n: 31, hanja: "甲午", name: "Gapo", animal: "Horse",
    art: { sheet: 1, row: 4, col: 0 },
    line: "A proud horse beneath a towering summer tree — confident, generous, and built to stand tall." },
  { n: 32, hanja: "乙未", name: "Eulmi", animal: "Sheep",
    art: { sheet: 1, row: 4, col: 1 },
    line: "A gentle sheep resting in a sea of late-summer grass — flexible, sociable, and quietly content." },
  { n: 33, hanja: "丙申", name: "Byeongsin", animal: "Monkey",
    art: { sheet: 2, row: 1, col: 0 },
    line: "A bright monkey surveying the first cliffs of autumn — bold-minded, clever, and hungry for the next horizon." },
  { n: 34, hanja: "丁酉", name: "Jeongyu", animal: "Rooster",
    art: { sheet: 1, row: 2, col: 5 },
    line: "A poised rooster glowing like a jewel on an autumn night — discerning, charismatic, and meticulous." },
  { n: 35, hanja: "戊戌", name: "Musul", animal: "Dog",
    art: { sheet: 2, row: 1, col: 1 },
    line: "A steadfast dog atop a chain of dry autumn mountains — stoic, protective, and almost impossible to move." },
  { n: 36, hanja: "己亥", name: "Gihae", animal: "Pig",
    art: { sheet: 1, row: 4, col: 7 },
    line: "A grounded pig walking winter-wet fields — practical, receptive, and always preparing for what comes next." },
  { n: 37, hanja: "庚子", name: "Gyeongja", animal: "Rat",
    art: { sheet: 1, row: 1, col: 0 },
    line: "A sharp-eyed rat beside steel-dark water under winter ice — analytical, resilient, and cool under pressure." },
  { n: 38, hanja: "辛丑", name: "Sinchuk", animal: "Ox",
    art: { sheet: 1, row: 1, col: 1 },
    line: "A quiet ox beside a jewel hidden in thawing earth — reserved, exacting, and rich in hidden value." },
  { n: 39, hanja: "壬寅", name: "Imin", animal: "Tiger",
    art: { sheet: 2, row: 1, col: 2 },
    line: "A wild tiger racing beside the first great thaw — adventurous, independent, and powered by change." },
  { n: 40, hanja: "癸卯", name: "Gyemyo", animal: "Rabbit",
    art: { sheet: 2, row: 1, col: 3 },
    line: "A tender rabbit beneath a soft spring rain — intuitive, empathetic, and gifted at helping things grow." },
  { n: 41, hanja: "甲辰", name: "Gapjin", animal: "Dragon",
    art: { sheet: 1, row: 0, col: 2 },
    line: "A dragon winding around a great tree rooted in wet spring earth — ambitious, enduring, and made to grow big." },
  { n: 42, hanja: "乙巳", name: "Eulsa", animal: "Snake",
    art: { sheet: 1, row: 0, col: 3 },
    line: "A graceful snake weaving through early-summer vines — adaptable, persuasive, and quietly captivating." },
  { n: 43, hanja: "丙午", name: "Byeongo", animal: "Horse",
    art: { sheet: 2, row: 1, col: 4 },
    line: "A blazing horse charging beneath the summer sun — passionate, fearless, and impossible to overlook." },
  { n: 44, hanja: "丁未", name: "Jeongmi", animal: "Sheep",
    art: { sheet: 1, row: 2, col: 4 },
    line: "A gentle sheep glowing over a late-summer field — warm, devoted, and happiest creating comfort." },
  { n: 45, hanja: "戊申", name: "Musin", animal: "Monkey",
    art: { sheet: 1, row: 0, col: 5 },
    line: "A clever monkey perched on a mountain rich with hidden ore — strategic, self-reliant, and built for difficult terrain." },
  { n: 46, hanja: "己酉", name: "Giyu", animal: "Rooster",
    art: { sheet: 2, row: 1, col: 5 },
    line: "A proud rooster walking through a field heavy with harvest — capable, orderly, and naturally productive." },
  { n: 47, hanja: "庚戌", name: "Gyeongsul", animal: "Dog",
    art: { sheet: 1, row: 3, col: 3 },
    line: "A vigilant dog among iron-hard late-autumn cliffs — uncompromising, loyal, and forged by adversity." },
  { n: 48, hanja: "辛亥", name: "Sinhae", animal: "Pig",
    art: { sheet: 2, row: 1, col: 6 },
    line: "A gentle pig beside a jewel washed clean by winter water — sincere, perceptive, and quietly refined." },
  { n: 49, hanja: "壬子", name: "Imja", animal: "Rat",
    art: { sheet: 1, row: 3, col: 6 },
    line: "A tiny rat before an endless winter sea — imaginative, adaptable, and at home with the unknown." },
  { n: 50, hanja: "癸丑", name: "Gyechuk", animal: "Ox",
    art: { sheet: 2, row: 2, col: 0 },
    line: "A calm ox beside a spring flowing beneath winter ice — patient, intuitive, and quietly gathering strength." },
  { n: 51, hanja: "甲寅", name: "Gapin", animal: "Tiger",
    art: { sheet: 2, row: 2, col: 1 },
    line: "A fearless tiger beneath a tree surging into spring — ambitious, upright, and born to rise." },
  { n: 52, hanja: "乙卯", name: "Eulmyo", animal: "Rabbit",
    art: { sheet: 2, row: 2, col: 2 },
    line: "A lively rabbit racing through spring in full bloom — sociable, creative, and endlessly renewing." },
  { n: 53, hanja: "丙辰", name: "Byeongjin", animal: "Dragon",
    art: { sheet: 1, row: 2, col: 3 },
    line: "A radiant dragon breaking through clouds over rain-fed spring earth — confident, generous, and made to illuminate." },
  { n: 54, hanja: "丁巳", name: "Jeongsa", animal: "Snake",
    art: { sheet: 2, row: 2, col: 3 },
    line: "A glowing snake rising from the heat of early summer — magnetic, focused, and intense beneath a polished surface." },
  { n: 55, hanja: "戊午", name: "Muo", animal: "Horse",
    art: { sheet: 1, row: 0, col: 4 },
    line: "A proud horse standing like a mountain beneath the summer sun — dependable, commanding, and immovable once decided." },
  { n: 56, hanja: "己未", name: "Gimi", animal: "Sheep",
    art: { sheet: 2, row: 2, col: 4 },
    line: "A contented sheep nestled in the richest earth of late summer — nurturing, steady, and quietly prosperous." },
  { n: 57, hanja: "庚申", name: "Gyeongsin", animal: "Monkey",
    art: { sheet: 1, row: 0, col: 7 },
    line: "A daring monkey clinging to an iron cliff in early autumn — sharp, competitive, and fearless under pressure." },
  { n: 58, hanja: "辛酉", name: "Sinyu", animal: "Rooster",
    art: { sheet: 2, row: 2, col: 5 },
    line: "A brilliant rooster gleaming in the clear heart of autumn — exacting, stylish, and born to stand out." },
  { n: 59, hanja: "壬戌", name: "Imsul", animal: "Dog",
    art: { sheet: 1, row: 3, col: 5 },
    line: "A solitary dog following a river through the dry end of autumn — independent, loyal, and always moving beneath the surface." },
  { n: 60, hanja: "癸亥", name: "Gyehae", animal: "Pig",
    art: { sheet: 2, row: 2, col: 6 },
    line: "A dreamy pig curled beside the deep waters of early winter — intuitive, gentle, and drawn to hidden depths." },
];

/**
 * The soul animal for a day pillar, with the CSS values needed to crop its
 * cell out of the right sheet.
 *
 * @param {number} cycleIndex 0-59, the pillar's place in the sexagenary cycle
 */
export function soulAnimal(cycleIndex) {
  const entry = SOUL_ANIMALS[cycleIndex];
  if (!entry) return null;
  if (!entry.art) return { ...entry, hasArt: false, crop: null };

  const sheet = SHEETS[entry.art.sheet];
  const [x0, x1] = sheet.cols[entry.art.col];
  const [y0, y1] = sheet.rows[entry.art.row];

  const viewW = x1 - x0 + 1;
  const viewH = y1 - y0 + 1;

  return {
    ...entry,
    hasArt: true,
    crop: {
      url: sheet.url,
      /** background-size, as a percentage of the frame. */
      sizeX: (sheet.width / viewW) * 100,
      sizeY: (sheet.height / viewH) * 100,
      /** background-position, as a percentage. */
      posX: (x0 / (sheet.width - viewW)) * 100,
      posY: (y0 / (sheet.height - viewH)) * 100,
      /** The frame matches the cell's shape, so nothing is squashed. */
      aspect: viewW / viewH,
    },
  };
}

/** Pillars still waiting on artwork. Empty once every cell is drawn. */
export const MISSING_ART = SOUL_ANIMALS.filter((a) => !a.art).map((a) => a.hanja);
