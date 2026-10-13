/**
 * The words. Everything a reading can say, keyed by what the chart computed.
 *
 * Nothing here is random. Each block is selected by an actual property of the
 * chart, which is why two people born a day apart get different readings and
 * the same person always gets the same one.
 */

// ---------------------------------------------------------------------------
// 일간 (Day Master) -- the headline archetype. This is "you".
// ---------------------------------------------------------------------------

export const DAY_MASTERS = {
  0: { // 갑 甲 Yang Wood
    title: 'The Great Tree',
    image: 'An old pine on a ridge line. It does not move for weather.',
    essence:
      'You grow in one direction: up. You pick a thing worth doing and you do it for years, ' +
      'which is why people underestimate you early and rely on you later.',
    strengths: ['Principled to the point of inconvenience', 'Plays long games without noticing', 'Others shelter under you'],
    shadow: ['Does not bend, so sometimes snaps', 'Mistakes stubbornness for integrity', 'Slow to admit a direction was wrong'],
    atBest: 'the person everyone quietly organises themselves around',
    atWorst: 'rooted so firmly you cannot step aside when you should',
  },
  1: { // 을 乙 Yin Wood
    title: 'The Climbing Vine',
    image: 'Ivy on a stone wall. It got to the top without ever lifting anything.',
    essence:
      'You survive by bending. Where others force a door, you find the gap beside it — ' +
      'which looks like luck from outside and is actually the most underrated kind of skill.',
    strengths: ['Adapts faster than the situation changes', 'Reads a room instantly', 'Quietly indestructible'],
    shadow: ['Leans on whatever is nearest', 'Avoids the confrontation that would settle it', 'Shapes itself to others until the shape sticks'],
    atBest: 'the one who is still standing when the rigid things have fallen',
    atWorst: 'so accommodating that nobody, including you, knows what you want',
  },
  2: { // 병 丙 Yang Fire
    title: 'The Midday Sun',
    image: 'Noon in July. No shadows anywhere. Nothing hidden.',
    essence:
      'You cannot enter a room quietly and have stopped trying. You give warmth away freely ' +
      'and are genuinely confused by people who hoard it.',
    strengths: ['Generous without keeping score', 'Impossible to ignore', 'Lifts the mood of whole groups'],
    shadow: ['Burns people who stand too close', 'No talent whatsoever for secrecy', 'Needs an audience more than admits'],
    atBest: 'the reason a room feels better than it did an hour ago',
    atWorst: 'scorching the ground you meant to grow things in',
  },
  3: { // 정 丁 Yin Fire
    title: 'The Lamp in the Window',
    image: 'One candle in a dark house. Small, deliberate, and visible for miles.',
    essence:
      'You do not light up everything — you light up one thing properly. Your attention is a ' +
      'resource you spend carefully, and the people who receive it never forget it.',
    strengths: ['Focused warmth that actually lands', 'Sees what others miss in the dark', 'Loyal in a way that costs you something'],
    shadow: ['Flickers when the room changes', 'Burns the wick down for people who did not ask', 'Broods in private and calls it thinking'],
    atBest: 'the steady light somebody navigates home by',
    atWorst: 'guttering out because you never once protected the flame',
  },
  4: { // 무 戊 Yang Earth
    title: 'The Mountain',
    image: 'A ridge that was there before the road and will be there after.',
    essence:
      'You are the thing other people lean on, usually without being asked and often without ' +
      'being thanked. Chaos arrives, you absorb it, and the week continues.',
    strengths: ['Unshakeable under pressure', 'Keeps promises made years ago', 'Shelters people who need it'],
    shadow: ['Moves at geological speed', 'Carries weight silently until it cracks', 'Confuses not-reacting with being fine'],
    atBest: 'the fixed point in everyone else\'s moving map',
    atWorst: 'immovable about something that stopped mattering a decade ago',
  },
  5: { // 기 己 Yin Earth
    title: 'The Tilled Field',
    image: 'Dark soil in spring. Everything that grows here grew because of it.',
    essence:
      'You make other people possible. Your instinct in any situation is to find what it needs ' +
      'and provide it, which is enormously valuable and almost never on anyone\'s list of credits.',
    strengths: ['Nurtures without making it a performance', 'Endlessly patient with slow growth', 'Makes other people better at their thing'],
    shadow: ['Takes on everything and resents it later', 'Boundaries written in pencil', 'Gives until there is nothing left to give from'],
    atBest: 'the ground a whole garden stands in',
    atWorst: 'so busy feeding others that nothing of yours ever gets planted',
  },
  6: { // 경 庚 Yang Metal
    title: 'The Unsheathed Blade',
    image: 'Raw ore and a forge. Not beautiful yet. Extremely effective.',
    essence:
      'You cut. Where other people see a complicated situation you see the one thing that is ' +
      'actually wrong, and you say it out loud, usually before deciding whether to.',
    strengths: ['Decisive when everyone else is dithering', 'Honest to a fault, and the fault is worth it', 'Strong sense of what is simply not acceptable'],
    shadow: ['Cuts things that were load-bearing', 'Bluntness lands harder than you intend', 'Mistakes every problem for something to attack'],
    atBest: 'the one willing to say the true thing nobody else will',
    atWorst: 'leaving a trail of accurate statements and damaged people',
  },
  7: { // 신 辛 Yin Metal
    title: 'The Polished Jewel',
    image: 'A cut stone under good light. Every facet is deliberate.',
    essence:
      'You have taste, and it is not decoration — it is a form of judgement. You notice the ' +
      'flaw in the thing everyone else called finished, and you are usually right.',
    strengths: ['Precision others cannot be bothered with', 'Genuine aesthetic authority', 'Refines rough work into finished work'],
    shadow: ['Criticism arrives before encouragement', 'Thin-skinned about your own flaws', 'Polishes long past the point of return'],
    atBest: 'the reason the finished thing is actually good',
    atWorst: 'so sharp about imperfection that nobody shows you anything unfinished',
  },
  8: { // 임 壬 Yang Water
    title: 'The Open Sea',
    image: 'Deep water with no visible bottom and weather moving across it.',
    essence:
      'You are wider than you let on. You move around obstacles rather than through them, carry ' +
      'more beneath the surface than above it, and get restless the moment a space is fully known.',
    strengths: ['Adapts to any container without losing itself', 'Depth that keeps revealing more', 'Sees how far-apart things connect'],
    shadow: ['Hard to pin down, including by yourself', 'Floods when unchecked', 'Leaves before a thing is finished'],
    atBest: 'the one who finds the route nobody had mapped',
    atWorst: 'so fluid that nothing you started holds its shape',
  },
  9: { // 계 癸 Yin Water
    title: 'The Quiet Rain',
    image: 'Mist at dawn. It gets into everything without anyone hearing it arrive.',
    essence:
      'You work by seepage, not force. You notice the undercurrent in a conversation while ' +
      'others are still handling the words, and you change things without ever appearing to push.',
    strengths: ['Perceptive to the point of unnerving', 'Influence that leaves no fingerprints', 'Reaches places force cannot'],
    shadow: ['Withholds until the moment has passed', 'Moods arrive like weather fronts', 'Indirect when directness would have worked'],
    atBest: 'the one who understood the situation before anyone explained it',
    atWorst: 'so diffuse you never land anywhere long enough to matter',
  },
};

// ---------------------------------------------------------------------------
// 신강 / 신약 -- how well supported you are
// ---------------------------------------------------------------------------

export const STRENGTH_READINGS = {
  'very-strong': {
    label: 'Very Strong (신강)',
    summary:
      'Your chart is stacked in your own favour. Your element shows up everywhere, and so do the ' +
      'things that feed it. You have more force available than most situations require.',
    meaning:
      'This is not a problem until it is. Abundant self-energy makes you resilient and hard to ' +
      'knock off course, but it also means you push when you could ask, and keep pushing after ' +
      'the door has opened. Your work is not to gather more strength. It is to find somewhere to put it.',
    advice: 'Spend yourself on something. Build, give, create, take responsibility for people. Strength that never leaves the house turns into pressure.',
  },
  strong: {
    label: 'Strong (신강)',
    summary:
      'You have solid backing — your own element plus enough support behind it to hold a position ' +
      'under pressure.',
    meaning:
      'You recover from setbacks faster than you give yourself credit for, and you can carry other ' +
      'people without it hollowing you out. The risk is subtler than outright domination: you may ' +
      'simply not notice when you have stopped listening, because proceeding alone has always worked.',
    advice: 'Look for the outlet. The best years of a strong chart are the ones where the strength is pointed at something outside yourself.',
  },
  weak: {
    label: 'Weak (신약)',
    summary:
      'Your chart asks more of you than it hands you. The elements around your day master mostly ' +
      'want something from it rather than feed it.',
    meaning:
      '"Weak" is a terrible translation. It does not mean fragile — it means you run on support ' +
      'rather than reserves, so environment matters enormously. In the right room with the right ' +
      'people you outperform far stronger charts. In the wrong one you drain fast and blame yourself for it.',
    advice: 'Be deliberate about who and what you spend time near. You are not low on capability; you are high on context-sensitivity.',
  },
  'very-weak': {
    label: 'Very Weak (신약)',
    summary:
      'Your day master is heavily outnumbered. Nearly everything in the chart is pulling at it, ' +
      'and very little is feeding it.',
    meaning:
      'Charts like this belong to people who are far more adaptable than they are given credit ' +
      'for — you have had to read every room you were ever in. The classical texts are oddly ' +
      'encouraging here: a day master this outnumbered often does best by stopping the fight ' +
      'entirely and flowing with the dominant force rather than resisting it.',
    advice: 'Stop trying to be the strongest thing in the room. Attach to something larger and let its momentum carry you — that is a strategy, not a defeat.',
  },
};

// ---------------------------------------------------------------------------
// 오행 -- what an abundance or an absence does to you
// ---------------------------------------------------------------------------

export const ELEMENT_DOMINANT = {
  wood: {
    headline: 'Wood runs this chart',
    text: 'Growth, expansion, and the itch to begin. You start more than you finish, and the starting is not the problem — it is genuinely how you find out what is worth continuing. Expect a life with a lot of first chapters in it.',
  },
  fire: {
    headline: 'Fire runs this chart',
    text: 'Visibility, momentum, and heat. You are expressive by default and people read your state off your face whether you want that or not. You move fast when lit and crash hard when the fuel runs out — pacing is the whole game for you.',
  },
  earth: {
    headline: 'Earth runs this chart',
    text: 'Stability, accumulation, and the long middle. You are the one who stays, maintains, and remembers. Change for its own sake does nothing for you, which is a strength right up until the ground you are standing on needs to move.',
  },
  metal: {
    headline: 'Metal runs this chart',
    text: 'Structure, judgement, and the clean edge. You have standards and they are not negotiable. You cut away what does not belong, which makes you excellent at finishing things and occasionally brutal about what gets left behind.',
  },
  water: {
    headline: 'Water runs this chart',
    text: 'Depth, movement, and intelligence that works underneath. You adapt, you absorb, and you understand far more than you announce. The risk is never stopping long enough for any of it to take a fixed shape.',
  },
};

export const ELEMENT_MISSING = {
  wood: 'With no Wood, beginnings are hard for you. You can maintain and finish, but the blank page is genuinely worse for you than for other people. Borrow momentum: start things with other people rather than alone.',
  fire: 'With no Fire, you under-signal. You feel things at full intensity and broadcast them at about ten percent, so people routinely read you as uninterested when you are the opposite. Say the enthusiastic thing out loud.',
  earth: 'With no Earth, you lack ballast. Ideas and feelings move through you quickly and nothing quite settles. Routines will feel like a cage and function like a keel — build a few anyway.',
  metal: 'With no Metal, endings are hard. You keep things past their usefulness, including commitments and people, because cutting feels like failure. It is not. It is maintenance.',
  water: 'With no Water, you act before you reflect. You are decisive and often right, but you skip the step where you ask what the situation actually is. Build in the pause; it costs you less than the corrections do.',
};

// ---------------------------------------------------------------------------
// 십신 -- how you move through the world
// ---------------------------------------------------------------------------

export const TEN_GOD_READINGS = {
  bigyeon: {
    headline: 'Peer energy (비견)',
    text: 'You operate as an equal among equals. Independence is the organising principle of your life — you would rather do it yourself than negotiate it, and you instinctively resist being managed. Partnership works for you; hierarchy does not.',
  },
  geopjae: {
    headline: 'Rival energy (겁재)',
    text: 'You are driven by comparison, which is more useful than it sounds. You move fastest when someone is beside you doing the same thing, and competition sharpens rather than stresses you. Watch the version of this that turns friends into scoreboards.',
  },
  siksin: {
    headline: 'Creator energy (식신)',
    text: 'You express by making. There is a steady output in you — food, work, ideas, care — that flows without strain, and you are happiest when it has somewhere to go. Pleasure is not a distraction for you; it is the fuel line.',
  },
  sanggwan: {
    headline: 'Performer energy (상관)',
    text: 'You are brilliant and you are not going to be quiet about it. You see through authority instinctively and say the unauthorised thing. This is where originality lives in a chart — and also where you talk yourself out of rooms you wanted to be in.',
  },
  pyeonjae: {
    headline: 'Venture energy (편재)',
    text: 'You see opportunity everywhere and money as something that moves rather than something you hold. Generous, opportunistic in the good sense, allergic to the slow accumulation route. You will do well in anything with upside and poorly in anything with a fixed salary and a long ladder.',
  },
  jeongjae: {
    headline: 'Steady-wealth energy (정재)',
    text: 'You build by increments and you do not lose what you build. Careful with resources, realistic about returns, suspicious of anything that promises to be fast. Unglamorous and extremely effective over a twenty-year window.',
  },
  pyeongwan: {
    headline: 'Challenger energy (편관)',
    text: 'You are at your best under pressure and oddly flat without it. Crisis clarifies you. You take on fights other people step around, and the question that defines your life is whether you choose the pressure or just keep accepting whatever arrives.',
  },
  jeonggwan: {
    headline: 'Officer energy (정관)',
    text: 'You have an internal sense of how things ought to be done and you hold yourself to it before anyone else. Responsibility finds you early. Structure suits you — the risk is mistaking the rules for the point.',
  },
  pyeonin: {
    headline: 'Unorthodox mentor energy (편인)',
    text: 'You learn sideways. Formal instruction bores you and you absorb things obliquely, deeply, and at your own angle — which makes you original and occasionally unintelligible. Strong intuition, unusual expertise, a tendency to overthink in private.',
  },
  jeongin: {
    headline: 'Nurturer energy (정인)',
    text: 'You are supported, and you support. Learning comes naturally, care comes naturally, and you have a settled quality that other people borrow from. The shadow is comfort: resources this reliable can quietly become a reason never to leave.',
  },
};

// ---------------------------------------------------------------------------
// 용신 -- the balancing element, and what to actually do about it
// ---------------------------------------------------------------------------

export const USEFUL_ELEMENT = {
  wood: {
    seek: 'Growth and beginnings',
    text: 'Wood is the element your chart is reaching for. Start things. Learn something with no obvious payoff. Put yourself near green and growing places, and near people at an earlier stage than you — their momentum is the thing you are short of.',
    directions: 'East', season: 'Spring', colours: 'Green, teal',
  },
  fire: {
    seek: 'Warmth and visibility',
    text: 'Fire is the element your chart is reaching for. Be seen. Say the thing in the meeting. Spend time in sunlight and around people with heat in them. Your instinct will be to wait until you are ready; the balance comes from going slightly before that.',
    directions: 'South', season: 'Summer', colours: 'Red, orange',
  },
  earth: {
    seek: 'Ground and routine',
    text: 'Earth is the element your chart is reaching for. Build a floor under yourself — regular hours, a place that is yours, commitments that repeat. It will feel like constraint and function as stability. Slow, boring consistency is medicine for this chart.',
    directions: 'Centre', season: 'Late summer', colours: 'Ochre, brown, sand',
  },
  metal: {
    seek: 'Structure and endings',
    text: 'Metal is the element your chart is reaching for. Finish things. Cut what has gone past usefulness. Impose order on one area of your life and let the relief of it teach you. Decisions, clean edges, and the willingness to say no.',
    directions: 'West', season: 'Autumn', colours: 'White, grey, silver',
  },
  water: {
    seek: 'Depth and stillness',
    text: 'Water is the element your chart is reaching for. Slow down and go under. Study, reflect, be near actual water, protect your sleep. You are rewarded here for the pause before the move, which is precisely the thing your chart will not do on its own.',
    directions: 'North', season: 'Winter', colours: 'Black, deep blue',
  },
};

// ---------------------------------------------------------------------------
// 세운 -- the year ahead, by how it relates to your day master
// ---------------------------------------------------------------------------

export const ANNUAL_READINGS = {
  bigyeon: 'A year of standing on your own. Support thins out, not as punishment but because you are meant to carry it yourself this time. Collaborations between equals go well; anything where you are waiting for permission does not.',
  geopjae: 'A competitive year. Someone else will be doing your thing, visibly, and it will sting usefully. Guard resources — this is a classic year for lending what you do not get back. Sharpened by rivalry, depleted by comparison.',
  siksin: 'An unusually generative year. Things you make land well and the output feels easy rather than forced. Good for starting creative work, good for your health, good for enjoying yourself without it costing anything later.',
  sanggwan: 'A year of saying it out loud. Brilliant, unruly, and faintly dangerous to your standing with authority. Enormous creative range available — just be deliberate about which bridges are load-bearing before you set anything alight.',
  pyeonjae: 'An opportunistic year. Money and chances move around you more than usual, and the skill required is selection, not effort. Say yes to fewer, larger things. Windfalls arrive and leave at the same speed.',
  jeongjae: 'A year of steady accumulation. Unspectacular and genuinely good: income stabilises, effort converts to result at a fair rate, and commitments made now hold. Not the year for the dramatic bet.',
  pyeongwan: 'A demanding year. Pressure arrives from outside and does not negotiate — deadlines, obligations, people who need you. You are more capable under this than you expect, but protect your sleep and do not take on the optional fight.',
  jeonggwan: 'A year of structure and recognition. Responsibility is offered, and taking it is usually right. Good for formal steps: titles, contracts, commitments, anything that wants your name on it. Play it straight; the shortcuts show this year.',
  pyeonin: 'An inward year. Attention turns to study, thinking, and the obliquely useful. Less visible output, more actual development. Resist the pull toward isolating entirely — this energy overthinks beautifully and alone.',
  jeongin: 'A supported year. Help arrives, often unasked, from mentors, family, or institutions. Good for learning and for recovery. The quiet risk is comfort: this is a year that will let you coast if you ask it to.',
};

// ---------------------------------------------------------------------------
// 월령 -- the season you were born into
// ---------------------------------------------------------------------------

export const SEASON_NOTES = {
  wood:  'born into the growing season, when everything is reaching outward',
  fire:  'born into the height of the year, when everything is at full output',
  earth: 'born into a turning point between seasons, when things settle before they change',
  metal: 'born into the harvest, when things are gathered, judged, and cut back',
  water: 'born into the still season, when everything is held and nothing is spent',
};
