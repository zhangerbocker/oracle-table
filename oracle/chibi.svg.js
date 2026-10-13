// Inline SVG for the coin-tossing character, plus the coin markup.
// Colors come from CSS variables in style.css so dark mode just works.

export const CHIBI_SVG = `
<svg class="chibi" viewBox="0 0 320 260" aria-hidden="true">
  <ellipse cx="160" cy="238" rx="138" ry="13" class="c-mat"/>
  <ellipse cx="160" cy="216" rx="66" ry="13" class="c-cushion"/>
  <g id="chibi-body">
    <path d="M116 214 Q112 170 140 152 L180 152 Q208 170 204 214 Z" class="c-robe"/>
    <path d="M146 152 L160 178 L174 152" class="c-collar"/>
    <g id="chibi-head">
      <circle cx="160" cy="58" r="14" class="c-hair"/>
      <path d="M150 50 L172 44" class="c-pin"/>
      <circle cx="174" cy="43.5" r="3" class="c-pin-bead"/>
      <circle cx="160" cy="106" r="40" class="c-skin"/>
      <path d="M120 108 Q118 66 160 64 Q202 66 200 108 Q194 92 178 86 Q170 96 152 92 Q138 90 132 84 Q122 94 120 108 Z" class="c-hair"/>
      <g id="chibi-eyes">
        <ellipse cx="146" cy="114" rx="4" ry="5" class="c-ink"/>
        <ellipse cx="174" cy="114" rx="4" ry="5" class="c-ink"/>
        <circle cx="147.4" cy="112.2" r="1.3" class="c-shine"/>
        <circle cx="175.4" cy="112.2" r="1.3" class="c-shine"/>
      </g>
      <ellipse cx="136" cy="124" rx="7" ry="4" class="c-blush"/>
      <ellipse cx="184" cy="124" rx="7" ry="4" class="c-blush"/>
      <path id="chibi-smile" d="M154 127 Q160 133 166 127" class="c-mouth"/>
      <ellipse id="chibi-gasp" cx="160" cy="130" rx="3.4" ry="4.4" class="c-ink" opacity="0"/>
    </g>
    <g id="chibi-arms">
      <path d="M137 158 Q120 180 148 194 L156 187 Q141 178 147 164 Z" class="c-robe c-sleeve"/>
      <path d="M183 158 Q200 180 172 194 L164 187 Q179 178 173 164 Z" class="c-robe c-sleeve"/>
      <ellipse cx="160" cy="191" rx="14" ry="9" class="c-skin"/>
      <path d="M150 189 Q160 195 170 189" class="c-hand-line"/>
    </g>
  </g>
  <g id="chibi-bubble" opacity="0">
    <path d="M214 58 q0 -18 18 -18 h8 q18 0 18 18 v4 q0 18 -18 18 h-10 l-10 10 l2 -11 q-8 -4 -8 -17 Z" class="c-bubble"/>
    <text x="236" y="70" text-anchor="middle" class="c-bubble-text">!</text>
  </g>
</svg>`;

export function coinHTML(i) {
  return `
<div class="coin" data-i="${i}">
  <div class="coin-spin">
    <div class="coin-face coin-heads" lang="zh-Hans"><span>通</span><span>宝</span><i></i></div>
    <div class="coin-face coin-tails"><i></i></div>
  </div>
</div>`;
}
