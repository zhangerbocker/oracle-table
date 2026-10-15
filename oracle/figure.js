// The coin-tossing oracle, plus the coin markup. The drawing is two layers: her body
// (img/oracle-figure.webp, with the robe painted in behind her hands) and her sleeves and
// cupped hands (img/oracle-arms.webp), which shake and flick the coins on their own.
// The SVG on top shares the drawing's 808 × 1161 coordinates and holds the parts that change:
// closed eyelids for blinking, the surprised mouth, and the "!" bubble.

const SKIN = "#FDE8CF";
const INK = "#2B2420";

export const FIGURE_HTML = `
<div class="oracle-fig" id="fig">
  <div class="fig-breathe">
    <img src="img/oracle-figure.webp" alt="" width="540" height="776" draggable="false">
    <img class="fig-arms" id="fig-arms" src="img/oracle-arms.webp" alt="" width="220" height="119" draggable="false">
    <svg class="fig-overlay" viewBox="0 0 808 1161" aria-hidden="true">
      <g id="fig-lids" opacity="0">
        <ellipse cx="296" cy="494" rx="45" ry="47" fill="${SKIN}"/>
        <ellipse cx="513" cy="490" rx="45" ry="47" fill="${SKIN}"/>
        <path d="M258 494 Q296 522 334 494 M475 490 Q513 518 551 490" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
      </g>
      <g id="fig-gasp" opacity="0">
        <ellipse cx="406" cy="565" rx="48" ry="24" fill="${SKIN}"/>
        <ellipse cx="406" cy="568" rx="15" ry="19" fill="#5A2E26" stroke="${INK}" stroke-width="5"/>
      </g>
      <g id="fig-bubble" opacity="0">
        <g transform="translate(655 70) scale(3.4) translate(-214 -40)">
          <path d="M214 58 q0 -18 18 -18 h8 q18 0 18 18 v4 q0 18 -18 18 h-10 l-10 10 l2 -11 q-8 -4 -8 -17 Z" class="c-bubble"/>
          <text x="236" y="70" text-anchor="middle" class="c-bubble-text">!</text>
        </g>
      </g>
    </svg>
  </div>
</div>`;

export function coinHTML(i) {
  return `
<div class="coin" data-i="${i}">
  <div class="coin-spin">
    <div class="coin-face coin-heads" lang="zh-Hans"><span>通</span><span>宝</span><i></i></div>
    <div class="coin-face coin-tails"><i></i></div>
  </div>
</div>`;
}
