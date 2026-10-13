// All the "magical knowledge" the Sorting Hat draws on.
// Tweak these tables to change how people get sorted.

export const HOUSES = {
  Gryffindor: {
    crest: "🦁",
    traits: "courage, daring, and a heart that runs toward trouble",
    tagline: "Where the bold of heart belong",
  },
  Hufflepuff: {
    crest: "🦡",
    traits: "loyalty, patience, and a kindness that never keeps score",
    tagline: "Where the steadfast and true belong",
  },
  Ravenclaw: {
    crest: "🦅",
    traits: "wit, curiosity, and a mind that collects wonders",
    tagline: "Where the curious and clever belong",
  },
  Slytherin: {
    crest: "🐍",
    traits: "ambition, resourcefulness, and a quiet, deep determination",
    tagline: "Where the ambitious and cunning belong",
  },
};

// `start` is the first [month, day] of each sign (month is 1-12).
// `weights` are the base house scores the stars give before any quiz answers.
export const SIGNS = [
  { name: "Capricorn",   symbol: "♑", start: [12, 22], element: "Earth", traits: "disciplined, patient, and quietly ambitious", weights: { Hufflepuff: 3, Slytherin: 2 } },
  { name: "Aquarius",    symbol: "♒", start: [1, 20],  element: "Air",   traits: "original, independent, and endlessly inventive", weights: { Ravenclaw: 4, Gryffindor: 1 } },
  { name: "Pisces",      symbol: "♓", start: [2, 19],  element: "Water", traits: "intuitive, dreamy, and deeply perceptive", weights: { Slytherin: 3, Hufflepuff: 2 } },
  { name: "Aries",       symbol: "♈", start: [3, 21],  element: "Fire",  traits: "fearless, energetic, and first through any door", weights: { Gryffindor: 3, Slytherin: 1 } },
  { name: "Taurus",      symbol: "♉", start: [4, 20],  element: "Earth", traits: "steady, loyal, and stubbornly devoted", weights: { Hufflepuff: 3, Slytherin: 1 } },
  { name: "Gemini",      symbol: "♊", start: [5, 21],  element: "Air",   traits: "quick-witted, curious, and wonderfully talkative", weights: { Ravenclaw: 3, Gryffindor: 1 } },
  { name: "Cancer",      symbol: "♋", start: [6, 21],  element: "Water", traits: "protective, intuitive, and fiercely loyal", weights: { Slytherin: 3, Hufflepuff: 2 } },
  { name: "Leo",         symbol: "♌", start: [7, 23],  element: "Fire",  traits: "radiant, generous, and born to lead", weights: { Gryffindor: 4, Slytherin: 1 } },
  { name: "Virgo",       symbol: "♍", start: [8, 23],  element: "Earth", traits: "meticulous, thoughtful, and quietly brilliant", weights: { Hufflepuff: 3, Ravenclaw: 2 } },
  { name: "Libra",       symbol: "♎", start: [9, 23],  element: "Air",   traits: "charming, fair-minded, and drawn to beauty", weights: { Ravenclaw: 3, Hufflepuff: 1 } },
  { name: "Scorpio",     symbol: "♏", start: [10, 23], element: "Water", traits: "intense, magnetic, and impossible to fool", weights: { Slytherin: 4, Gryffindor: 1 } },
  { name: "Sagittarius", symbol: "♐", start: [11, 22], element: "Fire",  traits: "adventurous, optimistic, and always chasing horizons", weights: { Gryffindor: 3, Ravenclaw: 1 } },
];

export const WAND_WOODS = {
  Aries:       { wood: "Hawthorn",    lore: "a wood of contradictions that thrives in a restless, brave hand" },
  Taurus:      { wood: "Oak",         lore: "strong and enduring, it never abandons its owner" },
  Gemini:      { wood: "Hazel",       lore: "sensitive and clever, it reacts to its owner's every mood" },
  Cancer:      { wood: "Alder",       lore: "unyielding yet helpful, it favors those who protect others" },
  Leo:         { wood: "Holly",       lore: "a guardian wood that suits a fiery, big-hearted spirit" },
  Virgo:       { wood: "Cedar",       lore: "a wood of strong character that rewards perception and precision" },
  Libra:       { wood: "Rowan",       lore: "a clear-headed wood that leans toward fairness and protection" },
  Scorpio:     { wood: "Blackthorn",  lore: "a warrior's wood that grows loyal only after trials" },
  Sagittarius: { wood: "Ash",         lore: "a wood that clings to one owner and loves a long journey" },
  Capricorn:   { wood: "Yew",         lore: "an ancient wood said to grant its owner power over endings and beginnings" },
  Aquarius:    { wood: "Larch",       lore: "a wood that draws out hidden talents its owner didn't know they had" },
  Pisces:      { wood: "Willow",      lore: "a wood for healers and dreamers who sense more than they say" },
};

export const WAND_CORES = {
  "phoenix feather":   "the rarest core, capable of the greatest range of magic",
  "dragon heartstring": "a core of raw power that learns quickly and loves bold spells",
  "unicorn hair":      "the most faithful core, steady and hard to turn to dark magic",
};

export const FLEXIBILITY_BY_ELEMENT = {
  Fire: "rigid",
  Earth: "sturdy",
  Air: "swishy",
  Water: "supple",
};

// Answer variety (how many different houses you picked) shapes the wand's flexibility.
export const FLEXIBILITY_BY_VARIETY = ["unyielding", "solid", "pleasantly springy", "remarkably supple"];

// ---------- Wand illustration ----------

export const WOOD_COLORS = {
  Hawthorn: "#8a5a3b",
  Oak: "#7a5230",
  Hazel: "#a0713f",
  Alder: "#b0623a",
  Holly: "#e0d2b4",
  Cedar: "#a4553a",
  Rowan: "#6b3a2a",
  Blackthorn: "#3a2c27",
  Ash: "#c9b48a",
  Yew: "#8b3f2b",
  Larch: "#c68a4f",
  Willow: "#d8c49a",
};

// Glow color at the wand tip.
export const CORE_GLOWS = {
  "phoenix feather": "#ffb347",
  "dragon heartstring": "#ff5a4e",
  "unicorn hair": "#e8f1ff",
};

// How much the wand bends in the picture (pixels).
export const FLEX_BEND = {
  unyielding: 0,
  rigid: 0,
  solid: 2,
  sturdy: 2,
  "pleasantly springy": 5,
  swishy: 7,
  supple: 8,
  "remarkably supple": 10,
};

export const WAND_SHOP_URL = "https://harrypottershop.com/collections/wands";

export const QUESTIONS = [
  {
    prompt: "You find a locked door in the castle that wasn't there yesterday. You…",
    options: [
      { text: "Blast it open. Whatever's inside, I can handle it.", house: "Gryffindor" },
      { text: "Go fetch my friends. Discoveries are better shared.", house: "Hufflepuff" },
      { text: "Study the lock. There must be a riddle or pattern.", house: "Ravenclaw" },
      { text: "Remember the spot, and come back when no one's around.", house: "Slytherin" },
    ],
  },
  {
    prompt: "Which would you hate most to be called?",
    options: [
      { text: "Cowardly", house: "Gryffindor" },
      { text: "Selfish", house: "Hufflepuff" },
      { text: "Ignorant", house: "Ravenclaw" },
      { text: "Ordinary", house: "Slytherin" },
    ],
  },
  {
    prompt: "Pick a class to take first:",
    options: [
      { text: "Defensive spellwork & dueling", house: "Gryffindor" },
      { text: "Magical plants & creature care", house: "Hufflepuff" },
      { text: "Ancient runes & stargazing", house: "Ravenclaw" },
      { text: "Potion-brewing (the advanced kind)", house: "Slytherin" },
    ],
  },
  {
    prompt: "A friend is about to break a school rule. You…",
    options: [
      { text: "Join in. Rules are more like guidelines.", house: "Gryffindor" },
      { text: "Stick by them, and make sure nobody gets hurt.", house: "Hufflepuff" },
      { text: "Point out the three flaws in their plan.", house: "Ravenclaw" },
      { text: "Help, but make sure there's something in it for you.", house: "Slytherin" },
    ],
  },
  {
    prompt: "Choose a path through the enchanted forest:",
    options: [
      { text: "The dark one, where something is howling", house: "Gryffindor" },
      { text: "The sunny glade, where the creatures are friendly", house: "Hufflepuff" },
      { text: "The one lined with glowing, whispering trees", house: "Ravenclaw" },
      { text: "The silver path that leads to the hidden treasure", house: "Slytherin" },
    ],
  },
];

export const THINKING_LINES = [
  "Hmm… difficult. Very difficult…",
  "I see a great deal of starlight in you…",
  "Plenty of nerve, and not a bad mind, either…",
  "Your stars are whispering… let me listen…",
  "Ah, the wands are stirring in their boxes…",
  "Yes… yes, I think I know just the place…",
];

// Used when the Claude-written prophecy isn't available (no API key, offline, etc.).
export const FALLBACK = {
  titles: {
    Gryffindor: "The Brave {sign}",
    Hufflepuff: "The Loyal {sign}",
    Ravenclaw: "The Curious {sign}",
    Slytherin: "The Ambitious {sign}",
  },
  prophecies: {
    Gryffindor:
      "Oh, {aSign}! I felt your energy the second I landed on your head. You're {traits}. If there's a dark corridor, you're already halfway down it. That's Gryffindor all over. Here's my prediction: this year you'll do something brave before you've had time to think. Afterwards you'll say \"I totally planned that.\" You didn't.",
    Hufflepuff:
      "Ah, {aSign}! You're {traits}. You're the friend everyone calls when things go wrong. You also always have snacks. That's pure Hufflepuff. Here's my prediction: someone you helped ages ago will pay you back in a big way this year. Probably with even better snacks.",
    Ravenclaw:
      "Ooh, {aSign}! Your brain is so busy I can hear it humming. You're {traits}. You never stop at the first answer. You always want to know why. That's Ravenclaw through and through. Here's my prediction: you'll solve a puzzle this year that has everyone else stumped. Try not to look too smug. Okay, a little smug is fine.",
    Slytherin:
      "Well, well, {aSign}. You're {traits}. You've always got a plan, and usually a backup plan too. That's classic Slytherin. Here's my prediction: a big chance is heading your way this year. When it shows up, you'll be ready. Everyone else will wonder how you saw it coming.",
  },
  wandLore:
    "This {flexibility} {woodLower} wand with a {core} core picked you because it loves {element} signs like you.",
};
