// Draws a wand as an inline SVG from its properties:
// wood → color, length → drawn length, flexibility → curve, core → tip glow.
import { WOOD_COLORS, CORE_GLOWS, FLEX_BEND } from "./data.js";

const WIDTH = 440;
const HEIGHT = 90;
const MID_Y = 48;
const START_X = 22;
const HANDLE_END = 0.3; // fraction of the wand that is handle
const STEPS = 48;
let drawCount = 0; // unique gradient ids, so several wands can share a page

/** Shift a #rrggbb color toward white (amount > 0) or black (amount < 0). */
function shade(hex, amount) {
  const target = amount > 0 ? 255 : 0;
  const mix = Math.abs(amount);
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `#${channels
    .map((c) => Math.round(c + (target - c) * mix).toString(16).padStart(2, "0"))
    .join("")}`;
}

function halfWidth(t) {
  if (t < 0.04) return 10.5; // pommel
  if (t < HANDLE_END) return 8.6 - t * 3;
  return 6.6 - ((t - HANDLE_END) / (1 - HANDLE_END)) * 4.4; // taper to the tip
}

function outline(points) {
  const top = points.map(({ x, y, w }) => `${x.toFixed(1)},${(y - w).toFixed(1)}`);
  const bottom = points.map(({ x, y, w }) => `${x.toFixed(1)},${(y + w).toFixed(1)}`).reverse();
  return `M${top.join(" L")} L${bottom.join(" L")} Z`;
}

export function wandSVG(wand) {
  const wood = WOOD_COLORS[wand.wood] ?? "#8a5a3b";
  const glow = CORE_GLOWS[wand.core] ?? "#ffd27a";
  const bend = FLEX_BEND[wand.flexibility] ?? 3;

  // 9″ → 250px, 14¾″ → 380px
  const length = 250 + ((wand.inches - 9) / 5.75) * 130;

  const points = Array.from({ length: STEPS + 1 }, (_, i) => {
    const t = i / STEPS;
    return {
      t,
      x: START_X + t * length,
      y: MID_Y - bend * Math.sin(Math.PI * t) - bend * 0.6 * t,
      w: halfWidth(t),
    };
  });
  const handle = points.filter((p) => p.t <= HANDLE_END + 0.001);
  const tip = points[points.length - 1];
  const ringAt = (t) => points[Math.round(t * STEPS)];
  const rings = [0.04, 0.17, HANDLE_END].map(ringAt);
  const grain = points
    .filter((p) => p.t > HANDLE_END && p.t < 0.95)
    .map((p) => `${p.x.toFixed(1)},${(p.y - p.w * 0.35).toFixed(1)}`)
    .join(" ");

  const id = `wand${++drawCount}`;
  const label = `Illustration of your ${wand.length} ${wand.wood.toLowerCase()} wand with a ${wand.core} core`;

  return `
<svg class="wand-art" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="${id}-wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shade(wood, 0.35)}"/>
      <stop offset="0.45" stop-color="${wood}"/>
      <stop offset="1" stop-color="${shade(wood, -0.45)}"/>
    </linearGradient>
    <linearGradient id="${id}-handle" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shade(wood, 0.1)}"/>
      <stop offset="0.45" stop-color="${shade(wood, -0.25)}"/>
      <stop offset="1" stop-color="${shade(wood, -0.6)}"/>
    </linearGradient>
    <radialGradient id="${id}-glow">
      <stop offset="0" stop-color="#fff" stop-opacity="1"/>
      <stop offset="0.25" stop-color="${glow}" stop-opacity="0.9"/>
      <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <g class="wand-glow" style="transform-origin: ${tip.x.toFixed(1)}px ${tip.y.toFixed(1)}px">
    <circle cx="${tip.x.toFixed(1)}" cy="${tip.y.toFixed(1)}" r="22" fill="url(#${id}-glow)"/>
  </g>

  <path d="${outline(points)}" fill="url(#${id}-wood)" stroke="${shade(wood, -0.6)}" stroke-width="0.8"/>
  <polyline points="${grain}" fill="none" stroke="${shade(wood, 0.5)}" stroke-width="0.8" stroke-opacity="0.45" stroke-linecap="round"/>
  <path d="${outline(handle)}" fill="url(#${id}-handle)" stroke="${shade(wood, -0.65)}" stroke-width="0.8"/>
  ${rings
    .map(
      (p) =>
        `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="1.6" ry="${(p.w + 0.8).toFixed(1)}" fill="${shade(wood, -0.55)}"/>`,
    )
    .join("\n  ")}

  <g class="wand-sparkles" fill="${glow}">
    <circle cx="${(tip.x + 14).toFixed(1)}" cy="${(tip.y - 12).toFixed(1)}" r="1.8"/>
    <circle cx="${(tip.x + 22).toFixed(1)}" cy="${(tip.y + 6).toFixed(1)}" r="1.3"/>
    <circle cx="${(tip.x + 6).toFixed(1)}" cy="${(tip.y + 15).toFixed(1)}" r="1.1"/>
  </g>
</svg>`;
}
