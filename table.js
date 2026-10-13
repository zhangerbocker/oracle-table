// The Oracle Table: lights whichever reader you lean toward, and moves in on the one
// you choose before handing you to its page.

const scene = document.getElementById('scene');
const plates = [...document.querySelectorAll('.plate')];
const seats = [...scene.querySelectorAll('.seat')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

function setActive(id) {
  if (scene.classList.contains('is-approaching')) return;
  if (id) scene.dataset.active = id;
  else delete scene.dataset.active;
  for (const plate of plates) plate.classList.toggle('is-active', plate.dataset.seat === id);
}

function approach(plate, event) {
  if (event.defaultPrevented || event.button > 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (reduceMotion.matches) return; // plain navigation
  event.preventDefault();
  setActive(plate.dataset.seat);
  scene.dataset.target = plate.dataset.seat;
  scene.classList.add('is-approaching');
  setTimeout(() => { location.href = plate.href; }, 600);
}

for (const plate of plates) {
  plate.addEventListener('pointerenter', () => setActive(plate.dataset.seat));
  plate.addEventListener('pointerleave', () => setActive(null));
  plate.addEventListener('focus', () => setActive(plate.dataset.seat));
  plate.addEventListener('blur', () => setActive(null));
  plate.addEventListener('click', (event) => approach(plate, event));
}

// The drawn seats answer to the pointer too; the plates stay the keyboard path.
for (const seat of seats) {
  const plate = plates.find((p) => p.dataset.seat === seat.dataset.seat);
  seat.addEventListener('pointerenter', () => setActive(seat.dataset.seat));
  seat.addEventListener('pointerleave', () => setActive(null));
  seat.addEventListener('click', () => plate.click());
}

// Coming back with the browser's back button restores the page mid-zoom; reset it.
addEventListener('pageshow', () => {
  scene.classList.remove('is-approaching');
  delete scene.dataset.target;
  setActive(null);
});

