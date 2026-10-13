/**
 * Core reference tables for 사주팔자 (Four Pillars of Destiny).
 *
 * Everything here is pure data. No DOM, no framework, no imports -- this file
 * and its siblings run unchanged in a browser, in Node, or inside React.
 */

// ---------------------------------------------------------------------------
// 오행 (Five Elements)
// ---------------------------------------------------------------------------

export const ELEMENTS = ['wood', 'fire', 'earth', 'metal', 'water'];

export const ELEMENT_INFO = {
  wood:  { ko: '목', hanja: '木', en: 'Wood',  color: '#4a9d6e', glyph: '🌲' },
  fire:  { ko: '화', hanja: '火', en: 'Fire',  color: '#d4573f', glyph: '🔥' },
  earth: { ko: '토', hanja: '土', en: 'Earth', color: '#b8883f', glyph: '⛰️' },
  metal: { ko: '금', hanja: '金', en: 'Metal', color: '#8f94a3', glyph: '⚔️' },
  water: { ko: '수', hanja: '水', en: 'Water', color: '#3f6fa8', glyph: '🌊' },
};

/** 상생 (generating cycle): wood feeds fire, fire makes earth, and so on. */
export const GENERATES = {
  wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
};

/** 상극 (controlling cycle): wood breaks earth, earth dams water, and so on. */
export const CONTROLS = {
  wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood',
};

/** Inverse lookups, handy when asking "what feeds me?" / "what controls me?" */
export const GENERATED_BY = Object.fromEntries(
  Object.entries(GENERATES).map(([from, to]) => [to, from]),
);
export const CONTROLLED_BY = Object.fromEntries(
  Object.entries(CONTROLS).map(([from, to]) => [to, from]),
);

// ---------------------------------------------------------------------------
// 천간 (Ten Heavenly Stems)
// ---------------------------------------------------------------------------

/** Index 0-9. Even indices are 양 (yang), odd are 음 (yin). */
export const STEMS = [
  { ko: '갑', hanja: '甲', element: 'wood',  yin: false, en: 'Gap' },
  { ko: '을', hanja: '乙', element: 'wood',  yin: true,  en: 'Eul' },
  { ko: '병', hanja: '丙', element: 'fire',  yin: false, en: 'Byeong' },
  { ko: '정', hanja: '丁', element: 'fire',  yin: true,  en: 'Jeong' },
  { ko: '무', hanja: '戊', element: 'earth', yin: false, en: 'Mu' },
  { ko: '기', hanja: '己', element: 'earth', yin: true,  en: 'Gi' },
  { ko: '경', hanja: '庚', element: 'metal', yin: false, en: 'Gyeong' },
  { ko: '신', hanja: '辛', element: 'metal', yin: true,  en: 'Sin' },
  { ko: '임', hanja: '壬', element: 'water', yin: false, en: 'Im' },
  { ko: '계', hanja: '癸', element: 'water', yin: true,  en: 'Gye' },
];

// ---------------------------------------------------------------------------
// 지지 (Twelve Earthly Branches)
// ---------------------------------------------------------------------------

/**
 * Index 0-11 starting at 자 (Rat). `yin` follows positional polarity
 * (자인진오신술 = yang, 축묘사미유해 = yin), which is what 십신 derivation uses.
 */
export const BRANCHES = [
  { ko: '자', hanja: '子', element: 'water', yin: false, animal: 'Rat',     en: 'Ja' },
  { ko: '축', hanja: '丑', element: 'earth', yin: true,  animal: 'Ox',      en: 'Chuk' },
  { ko: '인', hanja: '寅', element: 'wood',  yin: false, animal: 'Tiger',   en: 'In' },
  { ko: '묘', hanja: '卯', element: 'wood',  yin: true,  animal: 'Rabbit',  en: 'Myo' },
  { ko: '진', hanja: '辰', element: 'earth', yin: false, animal: 'Dragon',  en: 'Jin' },
  { ko: '사', hanja: '巳', element: 'fire',  yin: true,  animal: 'Snake',   en: 'Sa' },
  { ko: '오', hanja: '午', element: 'fire',  yin: false, animal: 'Horse',   en: 'O' },
  { ko: '미', hanja: '未', element: 'earth', yin: true,  animal: 'Goat',    en: 'Mi' },
  { ko: '신', hanja: '申', element: 'metal', yin: false, animal: 'Monkey',  en: 'Sin' },
  { ko: '유', hanja: '酉', element: 'metal', yin: true,  animal: 'Rooster', en: 'Yu' },
  { ko: '술', hanja: '戌', element: 'earth', yin: false, animal: 'Dog',     en: 'Sul' },
  { ko: '해', hanja: '亥', element: 'water', yin: true,  animal: 'Pig',     en: 'Hae' },
];

/**
 * 지장간 (hidden stems). Each branch secretly holds one to three stems,
 * weighted by how many days of the solar month they govern (월률분야).
 * Weights are normalised to sum to 1 per branch.
 *
 * The last entry of each branch is the 본기 (principal stem) -- the one that
 * actually represents the branch's own character.
 */
export const HIDDEN_STEMS = {
  0:  [{ stem: 8, days: 10 }, { stem: 9, days: 20 }],                          // 子: 壬 癸
  1:  [{ stem: 9, days: 9 }, { stem: 7, days: 3 }, { stem: 5, days: 18 }],     // 丑: 癸 辛 己
  2:  [{ stem: 4, days: 7 }, { stem: 2, days: 7 }, { stem: 0, days: 16 }],     // 寅: 戊 丙 甲
  3:  [{ stem: 0, days: 10 }, { stem: 1, days: 20 }],                          // 卯: 甲 乙
  4:  [{ stem: 1, days: 9 }, { stem: 9, days: 3 }, { stem: 4, days: 18 }],     // 辰: 乙 癸 戊
  5:  [{ stem: 4, days: 7 }, { stem: 6, days: 7 }, { stem: 2, days: 16 }],     // 巳: 戊 庚 丙
  6:  [{ stem: 2, days: 10 }, { stem: 5, days: 9 }, { stem: 3, days: 11 }],    // 午: 丙 己 丁
  7:  [{ stem: 3, days: 9 }, { stem: 1, days: 3 }, { stem: 5, days: 18 }],     // 未: 丁 乙 己
  8:  [{ stem: 4, days: 7 }, { stem: 8, days: 7 }, { stem: 6, days: 16 }],     // 申: 戊 壬 庚
  9:  [{ stem: 6, days: 10 }, { stem: 7, days: 20 }],                          // 酉: 庚 辛
  10: [{ stem: 7, days: 9 }, { stem: 3, days: 3 }, { stem: 4, days: 18 }],     // 戌: 辛 丁 戊
  11: [{ stem: 4, days: 7 }, { stem: 0, days: 7 }, { stem: 8, days: 16 }],     // 亥: 戊 甲 壬
};

/** The 본기 (principal hidden stem) of each branch. */
export const PRINCIPAL_STEM = Object.fromEntries(
  Object.entries(HIDDEN_STEMS).map(([b, list]) => [Number(b), list[list.length - 1].stem]),
);

// ---------------------------------------------------------------------------
// 십신 (Ten Gods)
// ---------------------------------------------------------------------------

/**
 * The ten relationships another stem can have to your 일간 (day stem).
 * `group` collapses the pairs into the five functional families that
 * strength analysis cares about.
 */
export const TEN_GODS = {
  bigyeon:   { ko: '비견', hanja: '比肩', en: 'Peer',             group: 'self' },
  geopjae:   { ko: '겁재', hanja: '劫財', en: 'Rival',            group: 'self' },
  siksin:    { ko: '식신', hanja: '食神', en: 'Creator',          group: 'output' },
  sanggwan:  { ko: '상관', hanja: '傷官', en: 'Performer',        group: 'output' },
  pyeonjae:  { ko: '편재', hanja: '偏財', en: 'Venture Wealth',   group: 'wealth' },
  jeongjae:  { ko: '정재', hanja: '正財', en: 'Steady Wealth',    group: 'wealth' },
  pyeongwan: { ko: '편관', hanja: '偏官', en: 'Challenger',       group: 'authority' },
  jeonggwan: { ko: '정관', hanja: '正官', en: 'Officer',          group: 'authority' },
  pyeonin:   { ko: '편인', hanja: '偏印', en: 'Unorthodox Mentor', group: 'resource' },
  jeongin:   { ko: '정인', hanja: '正印', en: 'Nurturer',         group: 'resource' },
};

// ---------------------------------------------------------------------------
// 납음오행 (Sound Elements) -- the 물상, or image, of each pillar
// ---------------------------------------------------------------------------

/**
 * Every pair of adjacent 갑자 shares a poetic nature-image: not just "metal"
 * but "gold in the sea", not just "fire" but "fire in the furnace". Thirty
 * images cover all sixty pillars.
 *
 * This is the traditional source for a 일주's 물상, and it is what the soul
 * animal artwork is keyed to. Indexed by `Math.floor(cycleIndex / 2)`.
 *
 * Verified against a published 만세력: 丙子 = 간하수, 壬辰 = 장류수, 辛未 = 노방토.
 */
export const NAYEUM = [
  { ko: '해중금', hanja: '海中金', en: 'Gold in the Sea',        element: 'metal' },
  { ko: '노중화', hanja: '爐中火', en: 'Fire in the Furnace',    element: 'fire' },
  { ko: '대림목', hanja: '大林木', en: 'Timber of the Great Forest', element: 'wood' },
  { ko: '노방토', hanja: '路傍土', en: 'Earth by the Roadside',  element: 'earth' },
  { ko: '검봉금', hanja: '劍鋒金', en: 'Metal of the Sword Edge', element: 'metal' },
  { ko: '산두화', hanja: '山頭火', en: 'Fire on the Mountaintop', element: 'fire' },
  { ko: '간하수', hanja: '澗下水', en: 'Water Under the Bridge', element: 'water' },
  { ko: '성두토', hanja: '城頭土', en: 'Earth of the City Wall', element: 'earth' },
  { ko: '백랍금', hanja: '白蠟金', en: 'White Wax Metal',        element: 'metal' },
  { ko: '양류목', hanja: '楊柳木', en: 'Wood of the Willow',     element: 'wood' },
  { ko: '천중수', hanja: '泉中水', en: 'Water in the Spring',    element: 'water' },
  { ko: '옥상토', hanja: '屋上土', en: 'Earth on the Rooftop',   element: 'earth' },
  { ko: '벽력화', hanja: '霹靂火', en: 'Fire of the Thunderbolt', element: 'fire' },
  { ko: '송백목', hanja: '松柏木', en: 'Wood of Pine and Cypress', element: 'wood' },
  { ko: '장류수', hanja: '長流水', en: 'Long-Flowing Water',     element: 'water' },
  { ko: '사중금', hanja: '沙中金', en: 'Gold in the Sand',       element: 'metal' },
  { ko: '산하화', hanja: '山下火', en: 'Fire at the Foot of the Hill', element: 'fire' },
  { ko: '평지목', hanja: '平地木', en: 'Wood of the Open Plain', element: 'wood' },
  { ko: '벽상토', hanja: '壁上土', en: 'Earth on the Wall',      element: 'earth' },
  { ko: '금박금', hanja: '金箔金', en: 'Gold Leaf',              element: 'metal' },
  { ko: '복등화', hanja: '覆燈火', en: 'Fire of the Covered Lamp', element: 'fire' },
  { ko: '천하수', hanja: '天河水', en: 'Water of the Milky Way', element: 'water' },
  { ko: '대역토', hanja: '大驛土', en: 'Earth of the Great Highway', element: 'earth' },
  { ko: '차천금', hanja: '釵釧金', en: 'Gold of the Hairpin',    element: 'metal' },
  { ko: '상자목', hanja: '桑柘木', en: 'Wood of the Mulberry',   element: 'wood' },
  { ko: '대계수', hanja: '大溪水', en: 'Water of the Great Stream', element: 'water' },
  { ko: '사중토', hanja: '沙中土', en: 'Earth in the Sand',      element: 'earth' },
  { ko: '천상화', hanja: '天上火', en: 'Fire of the Heavens',    element: 'fire' },
  { ko: '석류목', hanja: '石榴木', en: 'Wood of the Pomegranate', element: 'wood' },
  { ko: '대해수', hanja: '大海水', en: 'Water of the Open Ocean', element: 'water' },
];

/**
 * The 물상 of a pillar, plus the filename its artwork should use.
 * @param {number} cycleIndex Position in the 60갑자 cycle, 0-59
 */
export function imagery(cycleIndex) {
  const nayeum = NAYEUM[Math.floor(cycleIndex / 2)];
  const stem = STEMS[cycleIndex % 10];
  const branch = BRANCHES[cycleIndex % 12];
  return {
    ...nayeum,
    animal: branch.animal,
    pillar: { ko: stem.ko + branch.ko, hanja: stem.hanja + branch.hanja },
    /** Stable asset name, e.g. "byeongin-nojunghwa" for 丙寅. */
    slug: `${stem.en}${branch.en}`.toLowerCase() + '-' + romanise(nayeum.ko),
  };
}

/** Rough romanisation, only used to build stable asset filenames. */
function romanise(korean) {
  const MAP = {
    해: 'hae', 중: 'jung', 금: 'geum', 노: 'no', 화: 'hwa', 대: 'dae', 림: 'rim',
    목: 'mok', 방: 'bang', 토: 'to', 검: 'geom', 봉: 'bong', 산: 'san', 두: 'du',
    간: 'gan', 하: 'ha', 수: 'su', 성: 'seong', 백: 'baek', 랍: 'rap', 양: 'yang',
    류: 'ryu', 천: 'cheon', 옥: 'ok', 상: 'sang', 벽: 'byeok', 력: 'ryeok',
    송: 'song', 장: 'jang', 사: 'sa', 평: 'pyeong', 지: 'ji', 박: 'bak',
    복: 'bok', 등: 'deung', 역: 'yeok', 차: 'cha', 자: 'ja', 계: 'gye', 석: 'seok',
  };
  return [...korean].map((ch) => MAP[ch] ?? ch).join('');
}

// ---------------------------------------------------------------------------
// 십이운성 (Twelve Life Stages)
// ---------------------------------------------------------------------------

/**
 * The twelve stages a stem passes through across the branches -- a whole life
 * cycle from conception to dissolution and back. Each pillar lands on one,
 * which says what phase of its own life that part of the chart is in.
 *
 * The English names are deliberately plain: this is the one piece of 사주
 * vocabulary that translates without losing anything.
 */
export const LIFE_STAGES = [
  { ko: '장생', hanja: '長生', en: 'Birth',       note: 'new, promising, not yet proven' },
  { ko: '목욕', hanja: '沐浴', en: 'Bathing',     note: 'raw and unsteady, finding itself' },
  { ko: '관대', hanja: '冠帶', en: 'Coming of Age', note: 'ready, ambitious, slightly untested' },
  { ko: '건록', hanja: '建祿', en: 'Establishment', note: 'competent and self-sustaining' },
  { ko: '제왕', hanja: '帝旺', en: 'Peak',        note: 'maximum strength, nowhere higher to go' },
  { ko: '쇠',   hanja: '衰',   en: 'Decline',     note: 'past the peak, wiser for it' },
  { ko: '병',   hanja: '病',   en: 'Illness',     note: 'weakening, in need of care' },
  { ko: '사',   hanja: '死',   en: 'Death',       note: 'spent, with nothing left to give' },
  { ko: '묘',   hanja: '墓',   en: 'Tomb',        note: 'stored away, dormant but preserved' },
  { ko: '절',   hanja: '絶',   en: 'Severance',   note: 'cut off entirely, the lowest point' },
  { ko: '태',   hanja: '胎',   en: 'Conception',  note: 'newly begun, invisible, full of potential' },
  { ko: '양',   hanja: '養',   en: 'Nurture',     note: 'quietly growing, protected' },
];

/**
 * The branch where each stem's 장생 (Birth) stage falls.
 * Yang stems then advance forward through the branches; yin stems run backward.
 */
const LIFE_STAGE_ORIGIN = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3]; // 甲乙丙丁戊己庚辛壬癸

/** Which of the twelve stages `stemIndex` is in when it sits on `branchIndex`. */
export function lifeStage(stemIndex, branchIndex) {
  const origin = LIFE_STAGE_ORIGIN[stemIndex];
  const direction = STEMS[stemIndex].yin ? -1 : 1;
  const step = mod((branchIndex - origin) * direction, 12);
  return { index: step, ...LIFE_STAGES[step] };
}

// ---------------------------------------------------------------------------
// 공망 (Void / Emptiness)
// ---------------------------------------------------------------------------

/**
 * Every ten-pillar 순 (decade of the sexagenary cycle) uses ten of the twelve
 * branches, so two are left over. Those two are 공망 -- "empty" -- and anything
 * in the chart that lands on them is held to be weakened or unreachable.
 *
 * @param {number} cycleIndex Position in the 60갑자 cycle, 0-59
 * @returns {number[]} The two void branch indices
 */
export function voidBranches(cycleIndex) {
  const decadeStartBranch = mod(Math.floor(cycleIndex / 10) * 10, 12);
  return [mod(decadeStartBranch + 10, 12), mod(decadeStartBranch + 11, 12)];
}

// ---------------------------------------------------------------------------
// 절기 (Solar Terms)
// ---------------------------------------------------------------------------

/**
 * The twelve 절 (month-opening solar terms). A 사주 month begins the *instant*
 * the sun reaches the listed ecliptic longitude -- not on the 1st, and not at
 * lunar new year. `branch` is the Earthly Branch that month carries.
 *
 * Listed in calendar order starting from 입춘, which also opens the 사주 year.
 */
export const MONTH_TERMS = [
  { ko: '입춘', hanja: '立春', en: 'Start of Spring',  longitude: 315, branch: 2 },  // 寅
  { ko: '경칩', hanja: '驚蟄', en: 'Waking of Insects', longitude: 345, branch: 3 }, // 卯
  { ko: '청명', hanja: '清明', en: 'Clear and Bright',  longitude: 15,  branch: 4 },  // 辰
  { ko: '입하', hanja: '立夏', en: 'Start of Summer',  longitude: 45,  branch: 5 },  // 巳
  { ko: '망종', hanja: '芒種', en: 'Grain in Ear',     longitude: 75,  branch: 6 },  // 午
  { ko: '소서', hanja: '小暑', en: 'Minor Heat',       longitude: 105, branch: 7 },  // 未
  { ko: '입추', hanja: '立秋', en: 'Start of Autumn',  longitude: 135, branch: 8 },  // 申
  { ko: '백로', hanja: '白露', en: 'White Dew',        longitude: 165, branch: 9 },  // 酉
  { ko: '한로', hanja: '寒露', en: 'Cold Dew',         longitude: 195, branch: 10 }, // 戌
  { ko: '입동', hanja: '立冬', en: 'Start of Winter',  longitude: 225, branch: 11 }, // 亥
  { ko: '대설', hanja: '大雪', en: 'Major Snow',       longitude: 255, branch: 0 },  // 子
  { ko: '소한', hanja: '小寒', en: 'Minor Cold',       longitude: 285, branch: 1 },  // 丑
];

// ---------------------------------------------------------------------------
// 둔법 (stem-derivation rules)
// ---------------------------------------------------------------------------

/**
 * 오호둔 (五虎遁): the stem of the first month (寅月) given the year stem.
 * Indexed by yearStem % 5 -> 갑기=丙, 을경=戊, 병신=庚, 정임=壬, 무계=甲.
 */
export const FIRST_MONTH_STEM = [2, 4, 6, 8, 0];

/**
 * 오서둔 (五鼠遁): the stem of the 子 hour given the day stem.
 * Indexed by dayStem % 5 -> 갑기=甲, 을경=丙, 병신=戊, 정임=庚, 무계=壬.
 */
export const FIRST_HOUR_STEM = [0, 2, 4, 6, 8];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** JS `%` keeps the sign of the dividend; 사주 math wants a true modulus. */
export function mod(n, m) {
  return ((n % m) + m) % m;
}

/** Format a stem+branch pair the way a 만세력 would print it: 갑자 (甲子). */
export function pillarLabel(stemIndex, branchIndex) {
  const s = STEMS[stemIndex];
  const b = BRANCHES[branchIndex];
  return { ko: s.ko + b.ko, hanja: s.hanja + b.hanja };
}

/** Position in the 60갑자 (sexagenary) cycle for a stem/branch pair, 0-59. */
export function sexagenaryIndex(stemIndex, branchIndex) {
  for (let i = 0; i < 60; i++) {
    if (i % 10 === stemIndex && i % 12 === branchIndex) return i;
  }
  return -1; // unreachable for valid pairs
}
