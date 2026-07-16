/* =========================================================================
   A SPECIAL DELIVERY — script.js
   -------------------------------------------------------------------------
   Everything personal to YOUR letter lives in the CONFIG object below.
   Edit CONFIG, save, and the whole site updates — no need to touch
   anything under the "ENGINE" section unless you want to change behavior.
   ========================================================================= */

const CONFIG = {
  // ---- THE POSTMAN (Scene 2) --------------------------------------------
  speechArrive:  "Hey! I have a special delivery for you.",
  speechLilies:  "These lilies are for you.",
  speechEnvelope: "And this letter comes straight from someone's heart.",

  // ---- THE LETTER (Scene 4) ----------------------------------------------
  letterGreeting: "To my little princess,",
  // Use \n\n for a paragraph break. Replace this with your real letter.
  letterBody:
    "PLACEHOLDER — paste your real letter here. Write it exactly the " +
    "way you'd say it out loud to her. Two or three honest paragraphs " +
    "will always beat a perfect one.\n\n" +
    "This is where the typewriter effect plays, letter by letter, so " +
    "keep paragraphs reasonably short so it doesn't feel like it's " +
    "taking forever to read on her phone.",
  letterSignoff: "Yours, always & forever",

  // ---- SINCE OUR PATHS CROSSED (Scene 5) -----------------------------------
  metSince: new Date("2023-04-19T00:00:00"),
  timerCaption:
    "This is how long I've loved you, and I've never regretted a single second of it.",

  // ---- ONE MORE THING (Scene 6) ------------------------------------------
  playlistUrl: "https://open.spotify.com/",   // <-- your Spotify playlist link
  tiktokUrl: "https://www.tiktok.com/",       // <-- your TikTok link
  finalNote:
    "PLACEHOLDER — a short final note, a P.S., an inside joke, " +
    "whatever you want the last tap to reveal.",

  // ---- BEHAVIOR -----------------------------------------------------------
  vibrationEnabled: true,     // gentle vibration on key moments (Android only)
  typewriterSpeedMs: 26,      // lower = faster typing
  petalCount: 16,             // how many petals fall at once
  musicFadeOutMs: 1400,       // how long the fade-out takes once the letter finishes
};

/* =========================================================================
   ENGINE — scene machine, animations, timers. Shouldn't need edits.
   ========================================================================= */

(() => {
  "use strict";

  const scenes = Array.from(document.querySelectorAll(".scene"));
  let current = 0;
  let petalsStarted = false;
  let timerStarted = false;
  let audioUnlocked = false;

  const $ = (id) => document.getElementById(id);
  const music = $("bg-music");
  const musicToggle = $("music-toggle");
  const petalsLayer = $("petals");
  const keptLilies = $("kept-lilies");

  function buzz(ms = 150) {
    if (!CONFIG.vibrationEnabled) return;
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) { /* ignore */ }
    }
  }

  function showScene(index) {
    current = index;
    scenes.forEach((s) => {
      s.classList.toggle("scene--active", Number(s.dataset.scene) === index);
    });
    onSceneEnter(index);
  }

  function nextScene() { showScene(current + 1); }

  // ---- petals ------------------------------------------------------------
  function startPetals() {
    if (petalsStarted) return;
    petalsStarted = true;
    for (let i = 0; i < CONFIG.petalCount; i++) {
      addPetal(i * (14000 / CONFIG.petalCount));
    }
  }

  function addPetal(delayMs = 0) {
    const petal = document.createElement("div");
    petal.className = "petal";
    const left = Math.random() * 100;
    const duration = 9 + Math.random() * 6;
    const size = 10 + Math.random() * 10;
    const delay = delayMs / 1000 + Math.random() * 2;
    petal.style.left = left + "vw";
    petal.style.width = size + "px";
    petal.style.height = size * 1.4 + "px";
    petal.style.animationDuration = duration + "s";
    petal.style.animationDelay = delay + "s";
    petalsLayer.appendChild(petal);
  }

  // ---- typewriter ----------------------------------------------------------
  function typewriter(el, text, speed, onDone) {
    el.textContent = "";
    const caret = document.createElement("span");
    caret.className = "caret";
    el.appendChild(caret);
    let i = 0;
    function tick() {
      if (i < text.length) {
        caret.insertAdjacentText("beforebegin", text[i]);
        i++;
        setTimeout(tick, speed);
      } else {
        caret.remove();
        if (onDone) onDone();
      }
    }
    tick();
  }

  // ---- since-our-paths-crossed timer ---------------------------------------
  function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    const els = {
      years: $("t-years"), months: $("t-months"), days: $("t-days"),
      hours: $("t-hours"), minutes: $("t-minutes"), seconds: $("t-seconds"),
    };

    function update() {
      const now = new Date();
      let diff = Math.max(0, now - CONFIG.metSince) / 1000; // seconds

      const years = Math.floor(diff / (365.25 * 86400));
      diff -= years * 365.25 * 86400;
      const months = Math.floor(diff / (30.44 * 86400));
      diff -= months * 30.44 * 86400;
      const days = Math.floor(diff / 86400);
      diff -= days * 86400;
      const hours = Math.floor(diff / 3600);
      diff -= hours * 3600;
      const minutes = Math.floor(diff / 60);
      diff -= minutes * 60;
      const seconds = Math.floor(diff);

      els.years.textContent = years;
      els.months.textContent = months;
      els.days.textContent = days;
      els.hours.textContent = hours;
      els.minutes.textContent = minutes;
      els.seconds.textContent = seconds;
    }

    update();
    setInterval(update, 1000);
  }

  // ---- music: plays once, starting when the envelope opens ------------------
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    // Silent play+pause on the first real tap so later programmatic
    // play() calls are allowed by mobile browsers' autoplay policies.
    music.play().then(() => {
      music.pause();
      music.currentTime = 0;
    }).catch(() => { /* no music.mp3 yet, or browser blocked it — fine */ });
  }

  function playMusicOnce() {
    music.currentTime = 0;
    music.volume = 1;
    music.play().then(() => {
      musicToggle.hidden = false;
      musicToggle.classList.add("music-toggle--playing");
    }).catch(() => { /* music.mp3 missing or still blocked — fine, story continues */ });
  }

  function fadeOutMusic(duration) {
    if (music.paused) return;
    const steps = 24;
    const startVol = music.volume;
    let i = 0;
    const iv = setInterval(() => {
      i++;
      music.volume = Math.max(0, startVol * (1 - i / steps));
      if (i >= steps) {
        clearInterval(iv);
        music.pause();
        music.currentTime = 0;
        music.volume = 1;
        musicToggle.classList.remove("music-toggle--playing");
      }
    }, duration / steps);
  }

  musicToggle.addEventListener("click", () => {
    if (music.paused) {
      music.play().catch(() => {});
      musicToggle.classList.add("music-toggle--playing");
      musicToggle.setAttribute("aria-label", "Mute music");
    } else {
      music.pause();
      musicToggle.classList.remove("music-toggle--playing");
      musicToggle.setAttribute("aria-label", "Play music");
    }
  });

  // ---- per-scene setup -------------------------------------------------------
  function onSceneEnter(index) {
    switch (index) {
      case 1: // welcome — auto-advance
        setTimeout(() => { if (current === 1) nextScene(); }, 3200);
        break;

      case 2: // postman walks in, then waits for taps
        setupPostmanScene();
        break;

      case 3: { // envelope, alone on screen
        buzz(120);
        setupEnvelope();
        break;
      }

      case 4: { // letter — music starts now, stops the moment it's done being read
        $("letter-greeting").textContent = CONFIG.letterGreeting;
        const bodyEl = $("letter-body");
        const signoff = $("letter-signoff");
        const afterBtn = $("after-letter-btn");
        signoff.classList.remove("letter-signoff--show");
        afterBtn.hidden = true;
        playMusicOnce();
        typewriter(bodyEl, CONFIG.letterBody, CONFIG.typewriterSpeedMs, () => {
          signoff.textContent = CONFIG.letterSignoff;
          signoff.classList.add("letter-signoff--show");
          afterBtn.hidden = false;
          fadeOutMusic(CONFIG.musicFadeOutMs);
        });
        break;
      }

      case 5: // since our paths crossed
        $("timer-caption").textContent = CONFIG.timerCaption;
        startTimer();
        break;

      case 6: // one more thing
        $("playlist-link").href = CONFIG.playlistUrl;
        $("tiktok-link").href = CONFIG.tiktokUrl;
        $("final-note-text").textContent = CONFIG.finalNote;
        break;

      case 7: // ending
        break;
    }
  }

  // ---- postman interaction: walk in -> give lilies -> give envelope -> wave -> leave
  function setupPostmanScene() {
    const wrap = $("postman-wrap");
    const hit = $("postman-hit");
    const bubble = $("speech-bubble");
    const bubbleText = $("speech-text");
    const prompt = $("postman-prompt");
    const heldLilies = $("postman-lilies");

    let stage = "walking"; // walking -> greeted -> lilies-given -> envelope-given -> leaving

    wrap.classList.add("postman-wrap--walking-in");
    bubbleText.textContent = "";
    bubble.classList.remove("speech-bubble--show", "speech-bubble--hide");
    prompt.style.visibility = "hidden";
    hit.disabled = true;

    setTimeout(() => {
      if (current !== 2) return;
      buzz(120);
      bubbleText.textContent = CONFIG.speechArrive;
      bubble.classList.add("speech-bubble--show");
      prompt.style.visibility = "visible";
      hit.disabled = false;
      stage = "greeted";
    }, 3400);

    hit.onclick = () => {
      if (stage === "greeted") {
        stage = "lilies-given";
        buzz(160);
        wrap.classList.add("postman--smile");
        bubbleText.textContent = CONFIG.speechLilies;
        heldLilies.classList.add("postman-lilies--given");
        keptLilies.classList.add("kept-lilies--show");
        prompt.textContent = "Tap him again";
        setTimeout(() => { if (current === 2) wrap.classList.remove("postman--smile"); }, 900);

      } else if (stage === "lilies-given") {
        stage = "envelope-given";
        buzz(160);
        wrap.classList.add("postman--smile");
        bubbleText.textContent = CONFIG.speechEnvelope;
        wrap.classList.add("postman--envelope-given");
        prompt.style.visibility = "hidden";
        hit.disabled = true;

        // he waves, then walks off screen, then we move on
        setTimeout(() => {
          if (current !== 2) return;
          wrap.classList.remove("postman--smile");
          bubble.classList.remove("speech-bubble--show");
          bubble.classList.add("speech-bubble--hide");
          wrap.classList.add("postman--waving");
        }, 1300);

        setTimeout(() => {
          if (current !== 2) return;
          wrap.classList.remove("postman--waving");
          wrap.classList.add("postman-wrap--walking-out");
        }, 3000);

        setTimeout(() => {
          if (current === 2) nextScene();
        }, 5600);
      }
    };
  }

  // ---- envelope interaction ---------------------------------------------------
  function setupEnvelope() {
    const hit = $("envelope-hit");
    const envelope = $("envelope");
    let stage = 0; // 0 = idle, 1 = zoomed, 2 = opened

    function handler() {
      if (stage === 0) {
        stage = 1;
        hit.classList.add("envelope-hit--zoom");
        setTimeout(() => {
          stage = 2;
          buzz(200);
          envelope.classList.add("envelope--open");
          setTimeout(() => { if (current === 3) nextScene(); }, 750);
        }, 650);
      }
    }

    hit.onclick = handler;
  }

  // ---- global "next" buttons ---------------------------------------------------
  document.querySelectorAll("[data-next]").forEach((btn) => {
    btn.addEventListener("click", () => {
      unlockAudio();
      nextScene();
    });
  });

  // ---- final note modal -----------------------------------------------------
  $("final-note-btn").addEventListener("click", () => { $("final-note-modal").hidden = false; });
  $("final-note-close").addEventListener("click", () => { $("final-note-modal").hidden = true; });

  // ---- restart ----------------------------------------------------------------
  $("restart-btn").addEventListener("click", () => {
    music.pause();
    music.currentTime = 0;
    music.volume = 1;
    musicToggle.hidden = true;
    musicToggle.classList.remove("music-toggle--playing");

    const wrap = $("postman-wrap");
    wrap.className = "postman-wrap";
    $("postman-hit").disabled = true;
    $("speech-bubble").classList.remove("speech-bubble--show", "speech-bubble--hide");
    $("postman-lilies").classList.remove("postman-lilies--given");
    keptLilies.classList.remove("kept-lilies--show");

    const envHit = $("envelope-hit");
    envHit.classList.remove("envelope-hit--zoom");
    $("envelope").classList.remove("envelope--open");

    showScene(0);
  });

  // ---- init ---------------------------------------------------------------------
  showScene(0);
})();
