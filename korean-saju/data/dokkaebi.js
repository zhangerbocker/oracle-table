/**
 * A dokkaebi mask, drawn as SVG.
 *
 * Modelled on 귀면와 — the goblin-face roof-end tiles that guard Korean temple
 * eaves. Traditionally it faces outward to turn away bad luck, which makes it
 * the right thing to put in the background of a fortune-telling page.
 *
 * Drawn rather than photographed on purpose: it scales to any size, weighs a
 * few kilobytes, tints to whatever the palette says, and carries no licence.
 *
 * Everything is mirrored around x = 0, so the viewBox is centred and only one
 * side of each feature has to be described.
 */

/** One half of a feature, mirrored. `d` should be written for the right side. */
const mirrored = (d, attrs = '') =>
  `<path d="${d}" ${attrs}/><path d="${d}" transform="scale(-1,1)" ${attrs}/>`;

/**
 * @param {object} [options]
 * @param {string} [options.id] Unique id, needed when more than one is on a page.
 * @returns {string} SVG markup
 */
export function dokkaebiSvg({ id = 'dok' } = {}) {
  const stroke = `fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`;
  const solid = `fill="currentColor"`;

  return `
<svg viewBox="-260 -250 520 500" xmlns="http://www.w3.org/2000/svg"
     role="presentation" focusable="false" aria-hidden="true">
  <g id="${id}">

    <!-- outer mane: curling flames down each side -->
    ${mirrored('M150 -150 C208 -176 236 -126 206 -92 C190 -74 160 -78 156 -98 C153 -113 170 -122 180 -112', stroke)}
    ${mirrored('M186 -56 C244 -72 262 -16 226 10 C206 24 178 14 180 -6 C182 -21 200 -26 208 -15', stroke)}
    ${mirrored('M196 48 C252 48 254 108 214 124 C192 133 168 118 175 100 C180 86 199 85 204 97', stroke)}
    ${mirrored('M150 140 C196 164 182 218 142 220 C120 221 104 203 115 189 C124 177 141 182 142 194', stroke)}

    <!-- horns -->
    ${mirrored('M44 -168 C58 -214 96 -238 128 -232 C104 -214 92 -186 86 -158', stroke)}
    <path d="M0 -196 C-16 -232 -8 -246 0 -248 C8 -246 16 -232 0 -196Z" ${solid}/>

    <!-- crown ridge above the brow -->
    ${mirrored('M10 -160 C34 -166 54 -152 60 -132', stroke)}
    ${mirrored('M26 -128 C40 -138 54 -132 58 -120', stroke)}

    <!-- brow / head outline -->
    <path d="M0 -156 C84 -156 146 -104 150 -34 C154 36 120 96 72 128
             C44 147 20 152 0 152 C-20 152 -44 147 -72 128
             C-120 96 -154 36 -150 -34 C-146 -104 -84 -156 0 -156Z" ${stroke}/>

    <!-- heavy brows -->
    ${mirrored('M30 -92 C62 -110 102 -100 116 -70', stroke)}

    <!-- eyes: the ringed stare these tiles are known for -->
    ${mirrored('M78 -34 m-42 0 a42 42 0 1 0 84 0 a42 42 0 1 0 -84 0', stroke)}
    ${mirrored('M78 -34 m-17 0 a17 17 0 1 0 34 0 a17 17 0 1 0 -34 0', solid)}

    <!-- snout -->
    <path d="M0 -70 C16 -70 26 -54 26 -30 C26 -8 18 6 0 6 C-18 6 -26 -8 -26 -30
             C-26 -54 -16 -70 0 -70Z" ${stroke}/>
    ${mirrored('M11 -16 m-9 0 a9 7 0 1 0 18 0 a9 7 0 1 0 -18 0', solid)}

    <!-- mouth -->
    <path d="M0 26 C-56 26 -104 34 -120 46 C-104 112 -56 146 0 146
             C56 146 104 112 120 46 C104 34 56 26 0 26Z" ${stroke}/>

    <!-- tusks -->
    ${mirrored('M98 40 C106 66 100 92 86 104 C84 80 86 56 92 38', solid)}
    <!-- upper teeth, a small grid -->
    ${mirrored('M18 32 L18 76', stroke)}
    <path d="M-52 32 L52 32 M-52 54 L52 54 M-52 76 L52 76" ${stroke}/>
    ${mirrored('M52 34 L52 74', stroke)}
    <!-- lower lip -->
    <path d="M-66 104 C-40 122 40 122 66 104" ${stroke}/>

    <!-- whisker flourishes at the jaw -->
    ${mirrored('M126 56 C160 50 176 70 166 86', stroke)}
    ${mirrored('M112 118 C140 126 148 150 134 162', stroke)}
  </g>
</svg>`.trim();
}

/** The same mask as a data URI, for use as a CSS background-image. */
export function dokkaebiDataUri(colour = '%23ffffff') {
  const svg = dokkaebiSvg().replace(/currentColor/g, colour).replace(/\s+/g, ' ');
  return `url("data:image/svg+xml,${encodeURIComponent(svg).replace(/'/g, '%27')}")`;
}
