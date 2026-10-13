import { HOUSES, QUESTIONS, THINKING_LINES, WAND_SHOP_URL } from "./data.js";
import { parseBirthDate, getZodiac, sort, fallbackReading } from "./sorting.js";
import { wandSVG } from "./wand-art.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const MIN_THINKING_MS = reducedMotion ? 800 : 3200;
const PROPHECY_TIMEOUT_MS = 25_000;

const state = {
  birth: null,
  answers: [], // [{ house, text }]
  questionIndex: 0,
};

const $ = (id) => document.getElementById(id);

// ---------- Screens ----------

function show(screenId) {
  for (const screen of document.querySelectorAll(".screen")) {
    screen.classList.toggle("is-active", screen.id === screenId);
  }
  window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  const heading = $(screenId).querySelector("h1, h2");
  heading?.setAttribute("tabindex", "-1");
  heading?.focus({ preventScroll: true });
}

for (const button of document.querySelectorAll("[data-go]")) {
  button.addEventListener("click", () => show(button.dataset.go));
}

// ---------- Birth date ----------

const birthInput = $("birth-date");
const birthError = $("birth-error");
const signPreview = $("sign-preview");

function todayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now - offset).toISOString().slice(0, 10);
}
birthInput.max = todayISO();

function validateBirth() {
  const birth = parseBirthDate(birthInput.value);
  if (!birth) return { error: "The Hat needs a full birth date (day, month, and year)." };
  if (birthInput.value > todayISO()) return { error: "Born in the future? Even the Hat can't sort a time-traveller." };
  if (birth.year < 1900) return { error: "That's older than most portraits in the castle. Please check the year." };
  return { birth };
}

birthInput.addEventListener("input", () => {
  birthError.textContent = "";
  const birth = parseBirthDate(birthInput.value);
  if (!birth) {
    signPreview.textContent = "";
    return;
  }
  const sign = getZodiac(birth.month, birth.day);
  signPreview.textContent = `✨ Ah, a ${sign.symbol} ${sign.name}. Interesting…`;
});

$("birth-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const { birth, error } = validateBirth();
  if (error) {
    birthError.textContent = error;
    birthInput.focus();
    return;
  }
  state.birth = birth;
  state.answers = [];
  if (event.submitter?.value === "quiz") startQuiz();
  else runSorting();
});

// ---------- Quiz ----------

function startQuiz() {
  state.answers = [];
  state.questionIndex = 0;
  renderQuestion();
  show("screen-quiz");
}

function renderQuestion() {
  const question = QUESTIONS[state.questionIndex];
  $("quiz-progress").textContent = `Question ${state.questionIndex + 1} of ${QUESTIONS.length}`;
  $("quiz-title").textContent = question.prompt;

  const options = $("quiz-options");
  options.replaceChildren(
    ...shuffle(question.options).map((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.textContent = option.text;
      button.addEventListener("click", () => answer(option));
      return button;
    }),
  );
  options.querySelector("button")?.focus({ preventScroll: true });
}

function answer(option) {
  const { prompt } = QUESTIONS[state.questionIndex];
  state.answers.push({ house: option.house, text: `${prompt} → ${option.text}` });
  state.questionIndex += 1;
  if (state.questionIndex < QUESTIONS.length) {
    renderQuestion();
    $("screen-quiz").style.animation = "none";
    void $("screen-quiz").offsetWidth; // restart the fade-in
    $("screen-quiz").style.animation = "";
  } else {
    runSorting();
  }
}

$("quiz-skip").addEventListener("click", runSorting);

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---------- Sorting ----------

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchProphecy(result) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROPHECY_TIMEOUT_MS);
  try {
    const response = await fetch("/api/prophecy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        sign: result.sign.name,
        house: result.house,
        wand: {
          wood: result.wand.wood,
          core: result.wand.core,
          length: result.wand.length,
          flexibility: result.wand.flexibility,
        },
        answers: state.answers.map((a) => a.text),
      }),
    });
    const data = await response.json();
    if (!data.fallback && data.prophecy) return { ...data, fromHat: true };
  } catch {
    // Offline, timed out, or no server: fall through to the built-in reading.
  } finally {
    clearTimeout(timer);
  }
  return { ...fallbackReading(result), fromHat: false };
}

function startThinkingLines() {
  const line = $("thinking-line");
  const lines = shuffle(THINKING_LINES);
  let i = 0;
  line.textContent = lines[0];
  const interval = setInterval(() => {
    line.classList.add("is-fading");
    setTimeout(() => {
      i = (i + 1) % lines.length;
      line.textContent = lines[i];
      line.classList.remove("is-fading");
    }, 400);
  }, 2200);
  return () => clearInterval(interval);
}

async function runSorting() {
  delete document.body.dataset.house;
  show("screen-sorting");
  const stopLines = startThinkingLines();

  const result = sort(state.birth, state.answers.map((a) => a.house));
  const [reading] = await Promise.all([fetchProphecy(result), wait(MIN_THINKING_MS)]);

  stopLines();
  renderResult(result, reading);
}

// ---------- Result ----------

function renderResult({ sign, house, certain, wand }, reading) {
  document.body.dataset.house = house;

  $("result-confidence").textContent = certain
    ? "The Hat has looked deep into your mind, and it is certain…"
    : "The stars suggest you belong in…";
  $("result-crest").textContent = HOUSES[house].crest;
  $("result-house").textContent = house.toUpperCase() + "!";
  $("result-tagline").textContent = HOUSES[house].tagline;
  $("result-sign").textContent = `${sign.symbol} ${sign.name} · ${sign.element} sign`;
  $("result-title").textContent = reading.title;
  $("result-prophecy").textContent = reading.prophecy;
  $("result-wand").textContent = `${wand.length} ${wand.wood}, ${wand.core} core, ${wand.flexibility}`;
  $("result-wand-lore").textContent = reading.wandLore;
  $("result-wand-art").innerHTML = wandSVG(wand); // built only from our own data tables
  $("result-shop").href = WAND_SHOP_URL;
  $("result-source").textContent = reading.fromHat
    ? "Prophecy freshly spoken by the Hat (with a little help from Claude)."
    : "Prophecy read from the Hat's ancient book of fortunes.";

  $("retake-quiz").textContent = certain ? "Retake the questions" : "Answer the questions for a truer sorting";
  show("screen-result");
}

$("again").addEventListener("click", () => {
  delete document.body.dataset.house;
  state.birth = null;
  state.answers = [];
  $("birth-form").reset();
  signPreview.textContent = "";
  birthError.textContent = "";
  show("screen-birth");
});

$("retake-quiz").addEventListener("click", () => {
  delete document.body.dataset.house;
  startQuiz();
});
