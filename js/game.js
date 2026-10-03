/* =========================================================================
   THE SECRET JOURNAL — game logic
   -------------------------------------------------------------------------
   Flow is driven by one explicit state machine (see STATES / TRANSITIONS).
   Every multi-step animation is a readable async sequence built from
   `wait()` and Web Animations — no nested setTimeout chains.

   Click handlers only act in the state that expects that click, and the
   state changes synchronously at the start of each handler, so a double
   click can never start two animations or skip a step.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     STATE MACHINE
     --------------------------------------------------------------------- */
  const STATES = {
    INTRO: "INTRO",
    JOURNAL_CLOSED: "JOURNAL_CLOSED",
    UNLOCKING: "UNLOCKING",
    OPENING: "OPENING",
    QUESTION_WRITING: "QUESTION_WRITING",
    AWAITING_ANSWER: "AWAITING_ANSWER",
    WRONG_FEEDBACK: "WRONG_FEEDBACK",
    CORRECT_FEEDBACK: "CORRECT_FEEDBACK",
    STAMPING: "STAMPING",
    PAGE_TRANSITION: "PAGE_TRANSITION",
    FINAL_IDENTITY_INTRO: "FINAL_IDENTITY_INTRO",
    FINAL_IDENTITY_QUESTION: "FINAL_IDENTITY_QUESTION",
    IDENTITY_CONFIRMATION: "IDENTITY_CONFIRMATION",
    FINAL_STAMP: "FINAL_STAMP",
    MEMORY_SPREAD: "MEMORY_SPREAD",      // photos appearing one by one
    MEMORY_READY: "MEMORY_READY",        // waiting for the reader to turn the page
    FINAL_SPREAD: "FINAL_SPREAD",        // wish + certificate appearing
    COMPLETE: "COMPLETE"                 // everything shown, return tag active
  };

  // Which states may follow which. A wrong move is logged, which makes
  // timing bugs visible in the console instead of silently glitching.
  const TRANSITIONS = {
    INTRO:                   ["JOURNAL_CLOSED"],
    JOURNAL_CLOSED:          ["UNLOCKING"],
    UNLOCKING:               ["OPENING"],
    OPENING:                 ["QUESTION_WRITING"],
    QUESTION_WRITING:        ["AWAITING_ANSWER", "FINAL_IDENTITY_QUESTION"],
    AWAITING_ANSWER:         ["WRONG_FEEDBACK", "CORRECT_FEEDBACK"],
    WRONG_FEEDBACK:          ["AWAITING_ANSWER"],
    CORRECT_FEEDBACK:        ["STAMPING"],
    STAMPING:                ["PAGE_TRANSITION"],
    PAGE_TRANSITION:         ["QUESTION_WRITING", "FINAL_IDENTITY_INTRO", "MEMORY_SPREAD", "FINAL_SPREAD"],
    FINAL_IDENTITY_INTRO:    ["QUESTION_WRITING"],
    FINAL_IDENTITY_QUESTION: ["IDENTITY_CONFIRMATION"],
    IDENTITY_CONFIRMATION:   ["FINAL_STAMP"],
    FINAL_STAMP:             ["PAGE_TRANSITION"],
    MEMORY_SPREAD:           ["MEMORY_READY"],
    MEMORY_READY:            ["PAGE_TRANSITION"],
    FINAL_SPREAD:            ["COMPLETE"],
    COMPLETE:                ["JOURNAL_CLOSED"]
  };

  let state = STATES.INTRO;

  function setState(next) {
    if (!TRANSITIONS[state].includes(next)) {
      console.warn(`[journal] unexpected transition ${state} → ${next}`);
    }
    state = next;
    stageEl.dataset.state = next;
  }

  /* ---------------------------------------------------------------------
     RUN DATA
     --------------------------------------------------------------------- */
  let trials = [];       // the questions picked for this run
  let trialIndex = 0;    // 0 … trialCount-1

  /* ---------------------------------------------------------------------
     DOM
     --------------------------------------------------------------------- */
  const $ = (id) => document.getElementById(id);
  const stageEl        = $("stage");
  const journalEl      = $("journal");
  const closedBtn      = $("journal-closed");
  const hintEl         = $("hint");
  const questionArea   = $("question-area");
  const questionTextEl = $("question-text");
  const finalHeadingEl = $("final-heading");
  const feedbackEl     = $("feedback-area");
  const stampsEl       = $("progress-stamps");
  const answerBtns     = Array.from(document.querySelectorAll(".answer"));
  const ownerStampEl   = $("owner-stamp");
  const pageFlipEl     = $("page-flip");
  const artEl          = $("journal-art");
  const oldArtEl       = $("journal-art-old");
  const memoryPhotos   = Array.from(document.querySelectorAll(".memory-photo"));
  const memoryNextTab  = $("memory-next-tab");
  const memoryNextArea = $("memory-next-area");
  const certificateImg = $("certificate-img");
  const wishLines      = ["wish-opening", "wish-body", "wish-accent", "wish-closing"].map($);
  const returnTag      = $("btn-return");

  // Journal artwork for each spread. All three share one size (1672×941),
  // so every % coordinate in the CSS applies to whichever is showing.
  const SPREAD_ART = {
    quiz:   "assets/ui/Open_Journal.png",
    memory: "assets/ui/Memory_Journal.png",
    final:  "assets/ui/Final_Journal.png"
  };
  let currentSpread = "quiz";

  const reducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Centres of the 8 slots, measured from Open_Journal.png (% of journal).
  const STAMP_SLOT_POSITIONS = [
    [58.52, 15.85], [61.51, 15.52], [64.51, 15.32], [67.47, 15.14],
    [70.47, 15.10], [73.47, 15.05], [76.45, 15.09], [79.47, 15.10]
  ];

  /* ---------------------------------------------------------------------
     SMALL HELPERS
     --------------------------------------------------------------------- */
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, reducedMotion ? Math.min(ms, 150) : ms));

  const escapeHtml = (text) =>
    text.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

  const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Runs a Web Animation and resolves when it finishes.
  function animate(el, keyframes, options) {
    const anim = el.animate(keyframes, { fill: "forwards", ...options });
    return anim.finished.catch(() => {}); // cancelled animations resolve too
  }

  /* ---------------------------------------------------------------------
     SOUND — optional; a missing file or autoplay block is silently ignored
     --------------------------------------------------------------------- */
  function playSound(id, volume = 0.5) {
    const el = $(id);
    if (!el) return;
    try {
      el.volume = volume;
      el.currentTime = 0;
      const p = el.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* never let audio break the game */ }
  }

  /* ---------------------------------------------------------------------
     TEXT FITTING
     Shrinks the font (in cqw of the journal) until the text fits its box
     and uses at most `maxLines` lines. Because everything is in cqw, the
     result stays correct when the window is resized — no refit needed.
     --------------------------------------------------------------------- */
  function fitText(textEl, boxEl, { max, min, maxLines }) {
    let size = max;
    const fits = () => {
      const tooTall = boxEl.scrollHeight > boxEl.clientHeight + 1;
      const tooWide = boxEl.scrollWidth > boxEl.clientWidth + 1;
      if (tooTall || tooWide) return false;
      if (!maxLines) return true;
      const lineHeightPx = parseFloat(getComputedStyle(textEl).lineHeight);
      const lines = Math.round(contentHeight(textEl) / lineHeightPx);
      return lines <= maxLines;
    };
    textEl.style.fontSize = size + "cqw";
    while (size > min && !fits()) {
      size = Math.round((size - 0.05) * 100) / 100;
      textEl.style.fontSize = size + "cqw";
    }
    return fits(); // false = still too long even at the minimum size
  }

  // Height of the text itself (not its box), measured with a Range so it
  // works for flex boxes whose own height is fixed.
  function contentHeight(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    return range.getBoundingClientRect().height;
  }

  /* ---------------------------------------------------------------------
     "THE JOURNAL WRITES ITSELF"
     The text is split into words; each word is uncovered left-to-right
     with a clip-path, one after another, at a speed proportional to its
     length — so it reads as a pen moving along the line, not as typing.
     --------------------------------------------------------------------- */
  function prepareInk(el, text) {
    el.textContent = "";
    const words = [];
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(" "));
      } else {
        const span = document.createElement("span");
        span.className = "ink-word";
        span.textContent = part;
        el.appendChild(span);
        words.push(span);
      }
    });
    return words;
  }

  async function writeInk(words, totalMs) {
    if (reducedMotion) {
      words.forEach((w) => w.classList.add("written"));
      return;
    }
    const totalChars = words.reduce((n, w) => n + w.textContent.length, 0) || 1;
    let delay = 0;
    const runs = words.map((word) => {
      const duration = Math.max(70, (word.textContent.length / totalChars) * totalMs);
      const run = animate(
        word,
        [{ clipPath: "inset(-25% 100% -25% -8%)" }, { clipPath: "inset(-25% -8% -25% -8%)" }],
        { duration, delay, easing: "cubic-bezier(0.35, 0.1, 0.55, 1)" }
      ).then(() => word.classList.add("written"));
      delay += duration + 25; // tiny pen lift between words
      return run;
    });
    await Promise.all(runs);
  }

  // Writing time grows with length but stays inside the 1.1–1.9 s window.
  const writingTimeFor = (text) => Math.min(1900, Math.max(1100, text.length * 30));

  /* ---------------------------------------------------------------------
     PAGE CONTENT
     --------------------------------------------------------------------- */
  // Fits each answer to its card, then gives all four the smallest of
  // those sizes so the spread looks even rather than mixing type sizes.
  const ANSWER_FIT = { max: 2.3, min: 1.1, maxLines: 3 };

  function setAnswers(answers) {
    const textEls = answerBtns.map((btn, i) => {
      btn.className = `zone answer answer-${i + 1} is-locked`;
      btn.setAttribute("aria-label", `${"ABCD"[i]}: ${answers[i]}`);
      const textEl = btn.querySelector(".answer-text");
      textEl.textContent = answers[i];
      const fitted = fitText(textEl, textEl, ANSWER_FIT);
      if (!fitted) {
        console.warn(`[journal] answer is too long for its card (over ${ANSWER_FIT.maxLines} lines): "${answers[i]}"`);
      }
      return textEl;
    });
    const smallest = Math.min(...textEls.map((el) => parseFloat(el.style.fontSize)));
    textEls.forEach((el) => { el.style.fontSize = smallest + "cqw"; });
  }

  async function revealAnswers() {
    journalEl.classList.add("answers-visible");
    if (!reducedMotion) {
      await Promise.all(answerBtns.map((btn, i) =>
        animate(btn, [
          { opacity: 0, transform: "translateY(0.25cqw)", filter: "blur(1.5px)" },
          { opacity: 1, transform: "translateY(0)",       filter: "blur(0)" }
        ], { duration: 420, delay: i * 90, easing: "ease-out", fill: "none" })
      ));
    }
  }

  function setAnswersLocked(locked) {
    answerBtns.forEach((btn) => btn.classList.toggle("is-locked", locked));
  }

  function showFeedback(text) {
    feedbackEl.textContent = text;
    feedbackEl.classList.add("visible");
  }

  function hideFeedback() {
    feedbackEl.classList.remove("visible");
  }

  // Fades out everything written on the spread before a page turn.
  async function clearSpread() {
    hideFeedback();
    const fading = [questionArea, ...answerBtns].map((el) =>
      animate(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: "forwards" })
    );
    await Promise.all(fading);
    journalEl.classList.remove("answers-visible");
    questionTextEl.textContent = "";
    finalHeadingEl.textContent = "";
    finalHeadingEl.classList.remove("visible");
    [questionArea, ...answerBtns].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  }

  /* ---------------------------------------------------------------------
     STAMPS
     --------------------------------------------------------------------- */
  function buildStampSlots() {
    stampsEl.innerHTML = "";
    STAMP_SLOT_POSITIONS.forEach(([x, y], i) => {
      const slot = document.createElement("div");
      slot.className = "stamp-slot";
      slot.style.left = x + "%";
      slot.style.top = y + "%";
      // Each real stamp lands at a slightly different angle.
      slot.style.setProperty("--tilt", `${(Math.random() * 16 - 8).toFixed(1)}deg`);
      slot.innerHTML = `<div class="stamp-ink">${buildStampSVG(GAME_CONFIG.stampOrder[i])}</div>`;
      stampsEl.appendChild(slot);
    });
  }

  async function stampSlot(index) {
    const slot = stampsEl.children[index];
    if (!slot) return;
    const ink = slot.querySelector(".stamp-ink");
    const tilt = slot.style.getPropertyValue("--tilt");
    slot.classList.add("stamped");
    playSound("sfx-stamp", 0.45);
    if (reducedMotion) return;
    // Downward impact → small squash → settle. No particles, no shake.
    await animate(ink, [
      { opacity: 0,    transform: `rotate(${tilt}) scale(1.7)` },
      { opacity: 0.95, transform: `rotate(${tilt}) scale(0.92, 0.86)`, offset: 0.6 },
      { opacity: 0.92, transform: `rotate(${tilt}) scale(1)` }
    ], { duration: 380, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "none" });
  }

  /* ---------------------------------------------------------------------
     SPREADS & PAGE TURN
     --------------------------------------------------------------------- */
  const absoluteUrl = (path) => new URL(path, document.baseURI).href;

  function setSpread(name) {
    currentSpread = name;
    journalEl.dataset.spread = name;
    artEl.src = SPREAD_ART[name];
  }

  // The right page lifts and swings over the spine. With `toSpread` the
  // page reveals a different spread: the new artwork appears under the
  // lifting sheet, the old left page is held in place until the sheet
  // lands on it, and the sheet's back shows the new left page.
  async function turnPage(toSpread = currentSpread) {
    playSound("sfx-page-turn", 0.4);
    const fromSpread = currentSpread;
    const changesSpread = toSpread !== fromSpread;

    if (reducedMotion) {
      if (changesSpread) setSpread(toSpread);
      return;
    }

    pageFlipEl.style.setProperty("--front-art", `url("${absoluteUrl(SPREAD_ART[fromSpread])}")`);
    pageFlipEl.style.setProperty("--back-art",  `url("${absoluteUrl(SPREAD_ART[toSpread])}")`);
    if (changesSpread) {
      oldArtEl.src = SPREAD_ART[fromSpread];
      oldArtEl.style.visibility = "visible";
      setSpread(toSpread);
    }
    pageFlipEl.style.visibility = "visible";
    // Shadow on both faces peaks mid-turn, when the sheet stands upright.
    const faces = pageFlipEl.querySelectorAll(".page-face");
    const shading = Array.from(faces).map((face) =>
      animate(face, [{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }],
        { duration: 720, fill: "none", pseudoElement: "::after" })
    );
    await Promise.all([
      animate(pageFlipEl, [
        { transform: "perspective(2600px) rotateY(0deg)" },
        { transform: "perspective(2600px) rotateY(-95deg)", offset: 0.5 },
        { transform: "perspective(2600px) rotateY(-180deg)" }
      ], { duration: 720, easing: "cubic-bezier(0.45, 0.05, 0.4, 1)", fill: "none" }),
      ...shading
    ]);
    pageFlipEl.style.visibility = "hidden";
    oldArtEl.style.visibility = "hidden";
  }

  // Fetches and decodes the later spreads up front, so no page turn ever
  // waits on a 2 MB image.
  function preloadSpreadArt() {
    [SPREAD_ART.memory, SPREAD_ART.final, certificateImg.src, ...memoryPhotos.map((p) => p.src)]
      .forEach((src) => {
        const img = new Image();
        img.src = src;
        if (img.decode) img.decode().catch(() => {});
      });
  }

  // Scales the whole wish down together (keeping its proportions) until it
  // fits the left-page safe area in both height and width. Lines never
  // wrap on their own — they break only where questions.js has \n.
  function fitWish() {
    const box = $("final-wish");
    let scale = 1;
    const overflows = () =>
      box.scrollHeight > box.clientHeight + 1 ||
      wishLines.some((line) => line.scrollWidth > box.clientWidth + 1);
    box.style.setProperty("--wish-scale", scale);
    while (scale > 0.5 && overflows()) {
      scale = Math.round((scale - 0.02) * 100) / 100;
      box.style.setProperty("--wish-scale", scale);
    }
    if (overflows()) console.warn("[journal] the final wish is too long for the page");
  }

  // Quiet reveal used across the finale: fade in with a tiny rise or
  // scale, then leave the element visible via its .is-revealed class.
  // `to` must match the element's resting CSS transform.
  async function reveal(el, { from = "translateY(5px)", to = "none", duration = 550 } = {}) {
    el.classList.add("is-revealed");
    if (reducedMotion) return;
    await animate(el, [
      { opacity: 0, transform: from },
      { opacity: 1, transform: to }
    ], { duration, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)", fill: "none" });
  }

  /* ---------------------------------------------------------------------
     SEQUENCES
     --------------------------------------------------------------------- */

  // INTRO → JOURNAL_CLOSED
  async function playIntro() {
    if (!reducedMotion) {
      await animate(closedBtn, [
        { opacity: 0, transform: "translateY(-2%) scale(1.04)" },
        { opacity: 1, transform: "translateY(0) scale(1)" }
      ], { duration: 700, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)", fill: "none" });
    }
    setState(STATES.JOURNAL_CLOSED);
    await wait(1400);
    if (state === STATES.JOURNAL_CLOSED) hintEl.classList.add("visible");
  }

  // JOURNAL_CLOSED → UNLOCKING → OPENING → first question
  async function openJournal() {
    if (state !== STATES.JOURNAL_CLOSED) return;
    setState(STATES.UNLOCKING);
    hintEl.classList.remove("visible");
    closedBtn.classList.add("is-busy");

    // Lock clicks: a quick glint and a tiny nudge of the whole book.
    playSound("sfx-unlock", 0.55);
    const glint = closedBtn.querySelector(".lock-glint");
    glint.style.animation = "none";
    if (!reducedMotion) {
      await Promise.all([
        animate(glint, [
          { opacity: 0,   transform: "translate(-50%, -50%) scale(0.4)" },
          { opacity: 1,   transform: "translate(-50%, -50%) scale(1.2)", offset: 0.4 },
          { opacity: 0,   transform: "translate(-50%, -50%) scale(1.5)" }
        ], { duration: 420, fill: "none" }),
        animate(closedBtn, [
          { transform: "rotate(0deg)" }, { transform: "rotate(-0.8deg)" },
          { transform: "rotate(0.5deg)" }, { transform: "rotate(0deg)" }
        ], { duration: 320, fill: "none" })
      ]);
    }

    // The book slides so its spine sits where the open spread's spine will
    // be, then the cover swings open around it while the spread fades in.
    setState(STATES.OPENING);
    playSound("sfx-open", 0.45);
    if (reducedMotion) {
      showOpenSpread();
    } else {
      const coverSwing = animate(closedBtn, [
        { opacity: 1, transform: "translateX(0) perspective(2200px) rotateY(0deg)" },
        { opacity: 1, transform: "translateX(38.9%) perspective(2200px) rotateY(0deg)", offset: 0.35 },
        { opacity: 1, transform: "translateX(38.9%) perspective(2200px) rotateY(-55deg)", offset: 0.7 },
        { opacity: 0, transform: "translateX(38.9%) perspective(2200px) rotateY(-110deg)" }
      ], { duration: 1150, easing: "cubic-bezier(0.4, 0, 0.3, 1)" });
      await wait(400);          // slide finished — cover starts to lift
      showOpenSpread();
      await coverSwing;
    }
    closedBtn.hidden = true;

    trials = shuffle(QUESTION_BANK).slice(0, GAME_CONFIG.trialCount);
    trialIndex = 0;
    await wait(250);
    askQuestion(trials[0]);
  }

  function showOpenSpread() {
    journalEl.classList.add("is-open");
    stageEl.classList.add("journal-is-open");
  }

  // QUESTION_WRITING → AWAITING_ANSWER (or FINAL_IDENTITY_QUESTION)
  async function askQuestion(q, { isFinal = false } = {}) {
    setState(STATES.QUESTION_WRITING);
    questionArea.style.opacity = "";

    const words = prepareInk(questionTextEl, q.question);
    if (!fitText(questionTextEl, questionArea, { max: isFinal ? 2.4 : 2.9, min: 1.3 })) {
      console.warn(`[journal] question is too long for the page: "${q.question}"`);
    }

    setAnswers(q.answers);
    await wait(300);                      // blank page for a beat
    playSound("sfx-writing", 0.3);
    await writeInk(words, writingTimeFor(q.question));
    await wait(200);
    await revealAnswers();

    setAnswersLocked(false);
    setState(isFinal ? STATES.FINAL_IDENTITY_QUESTION : STATES.AWAITING_ANSWER);
  }

  function onAnswerClick(index) {
    if (state === STATES.AWAITING_ANSWER) handleTrialAnswer(index);
    else if (state === STATES.FINAL_IDENTITY_QUESTION) handleFinalAnswer(index);
  }

  // Regular trial: wrong = gentle retry, right = stamp + page turn.
  async function handleTrialAnswer(index) {
    const btn = answerBtns[index];
    const q = trials[trialIndex];

    if (index !== q.correct) {
      setState(STATES.WRONG_FEEDBACK);
      setAnswersLocked(true);
      btn.classList.add("is-wrong");
      playSound("sfx-wrong", 0.3);
      showFeedback(pickRandom(JOURNAL_REPLIES.wrong));
      await wait(420);
      btn.classList.remove("is-wrong");
      setAnswersLocked(false);
      setState(STATES.AWAITING_ANSWER);
      return;
    }

    setState(STATES.CORRECT_FEEDBACK);
    setAnswersLocked(true);
    btn.classList.add("is-correct", "show-check");
    playSound("sfx-correct", 0.4);
    showFeedback(pickRandom(JOURNAL_REPLIES.correct));
    await wait(450);

    setState(STATES.STAMPING);
    await stampSlot(trialIndex);
    await wait(650);

    setState(STATES.PAGE_TRANSITION);
    const wasLastTrial = trialIndex === trials.length - 1;
    if (wasLastTrial) await wait(700);    // all 8 stamps — it looks finished…
    await clearSpread();
    await turnPage();

    trialIndex++;
    if (wasLastTrial) startFinalIdentityCheck();
    else askQuestion(trials[trialIndex]);
  }

  // FINAL_IDENTITY_INTRO → question with the fuchsia heading
  async function startFinalIdentityCheck() {
    setState(STATES.FINAL_IDENTITY_INTRO);
    questionArea.style.opacity = "";
    finalHeadingEl.classList.add("visible");
    const headingWords = prepareInk(finalHeadingEl, FINAL_QUESTION.heading);
    await wait(300);
    await writeInk(headingWords, 700);
    await wait(500);
    askQuestion(FINAL_QUESTION, { isFinal: true });
  }

  // Any answer is right: comic pause → all four ticks → OWNER CONFIRMED.
  async function handleFinalAnswer(index) {
    setState(STATES.IDENTITY_CONFIRMATION);
    setAnswersLocked(true);
    answerBtns[index].classList.add("is-correct");
    await wait(650);

    for (const btn of answerBtns) {
      btn.classList.add("is-correct", "show-check");
      playSound("sfx-correct", 0.25);
      await wait(170);
    }
    await wait(250);
    showFeedback(FINAL_QUESTION.revealLine);
    await wait(1300);

    setState(STATES.FINAL_STAMP);
    // One word per line keeps the stamp compact: OWNER / CONFIRMED.
    $("owner-stamp-text").innerHTML = FINAL_QUESTION.stampText
      .split(/\s+/).map(escapeHtml).join("<br>");
    playSound("sfx-final-stamp", 0.55);
    await animate(ownerStampEl, [
      { opacity: 0,    transform: "translate(-50%, -50%) rotate(-9deg) scale(1.6)" },
      { opacity: 0.95, transform: "translate(-50%, -50%) rotate(-10deg) scale(0.95)", offset: 0.6 },
      { opacity: 0.92, transform: "translate(-50%, -50%) rotate(-9deg) scale(1)" }
    ], { duration: reducedMotion ? 1 : 520, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" });
    await wait(900);                      // let IDENTITY CONFIRMED land

    setState(STATES.PAGE_TRANSITION);
    await Promise.all([
      clearSpread(),
      animate(ownerStampEl, [{ opacity: 0.92 }, { opacity: 0 }], { duration: 250 })
    ]);
    await turnPage("memory");
    ownerStampEl.getAnimations().forEach((a) => a.cancel());
    showMemorySpread();
  }

  /* ---------------------------------------------------------------------
     FINALE — memory spread → final spread
     --------------------------------------------------------------------- */

  // MEMORY_SPREAD: the spread opens empty, then her three photos appear
  // one after another; after a pause the "ДАЛІ" tab invites the turn.
  async function showMemorySpread() {
    setState(STATES.MEMORY_SPREAD);
    await wait(450);
    for (const photo of memoryPhotos) {
      await reveal(photo, { from: "scale(0.96)", duration: 700 });
      await wait(400);
    }
    await wait(2200);                     // time to actually look at them
    setState(STATES.MEMORY_READY);
    memoryNextTab.classList.add("visible");
  }

  // MEMORY_READY → final spread (tab or anywhere on the right page).
  async function turnToFinalSpread() {
    if (state !== STATES.MEMORY_READY) return;
    setState(STATES.PAGE_TRANSITION);
    memoryNextTab.classList.remove("visible");
    await turnPage("final");
    showFinalSpread();
  }

  // FINAL_SPREAD: the wish is written in four beats on the left page; the
  // certificate appears after the first beat as the journal's last
  // surprise; the return tag follows the final line.
  async function showFinalSpread() {
    setState(STATES.FINAL_SPREAD);
    fitWish();                            // the spread is visible now, so it can be measured
    const startedAt = performance.now();
    const at = (ms) => wait(Math.max(0, ms - (performance.now() - startedAt)));
    const [opening, body, accent, closing] = wishLines;

    await at(500);  reveal(opening);
    await at(1150); reveal(certificateImg, { from: "scale(0.96)", duration: 800 });
    await at(1500); reveal(body);
    await at(3000); reveal(accent, { duration: 650 });
    await at(3700); await reveal(closing);
    await wait(1000);
    await reveal(returnTag, {
      from: "translate(-50%, -50%) translateY(5px)",
      to:   "translate(-50%, -50%)",      // the tag's CSS centring transform
      duration: 500
    });

    setState(STATES.COMPLETE);
    returnTag.focus({ preventScroll: true });
  }

  /* ---------------------------------------------------------------------
     RETURN TO MAP
     If GAME_CONFIG.returnUrl is set, leave for that page (the hub).
     Otherwise keep the existing behaviour: close the journal and put it
     back on the table, ready for another run.
     --------------------------------------------------------------------- */
  function returnToJourney() {
    if (state !== STATES.COMPLETE) return;
    if (GAME_CONFIG.returnUrl) {
      window.location.href = GAME_CONFIG.returnUrl;
      return;
    }
    // Clear the finale so a new run starts from a clean quiz spread.
    setSpread("quiz");
    [...memoryPhotos, certificateImg, ...wishLines, returnTag]
      .forEach((el) => el.classList.remove("is-revealed"));
    memoryNextTab.classList.remove("visible");

    journalEl.classList.remove("is-open", "answers-visible");
    stageEl.classList.remove("journal-is-open");
    hideFeedback();
    buildStampSlots();
    closedBtn.hidden = false;
    closedBtn.classList.remove("is-busy");
    closedBtn.getAnimations().forEach((a) => a.cancel());
    closedBtn.querySelector(".lock-glint").style.animation = "";
    setState(STATES.JOURNAL_CLOSED);
  }

  /* ---------------------------------------------------------------------
     BOOT
     --------------------------------------------------------------------- */
  function init() {
    // Open index.html?debug to see every safe zone outlined.
    if (/[?&]debug\b/.test(location.search)) stageEl.classList.add("debug");
    buildStampSlots();
    closedBtn.addEventListener("click", openJournal);
    answerBtns.forEach((btn) =>
      btn.addEventListener("click", () => onAnswerClick(Number(btn.dataset.index)))
    );
    returnTag.addEventListener("click", returnToJourney);
    memoryNextTab.addEventListener("click", turnToFinalSpread);
    memoryNextArea.addEventListener("click", turnToFinalSpread);

    // Texts of the finale come from questions.js.
    const { wish } = FINAL_SCENE;
    [wish.opening, wish.body, wish.accent, wish.closing]
      .forEach((text, i) => { wishLines[i].textContent = text; });
    $("memory-next-label").textContent = FINAL_SCENE.nextPageLabel;
    $("return-label").textContent = FINAL_SCENE.returnLabel;
    preloadSpreadArt();

    // Wait for the handwriting font so the first fitText() measures the
    // real glyphs, not the fallback font.
    const fontsReady = document.fonts
      ? Promise.all([document.fonts.load('700 20px "Caveat"'), document.fonts.load('500 20px "Cormorant"')])
      : Promise.resolve();
    fontsReady.catch(() => {}).finally(playIntro);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
