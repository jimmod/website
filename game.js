/**
 * game.js — jimmod.com
 *
 * Game logic: boot sequence, sprite animation, interactions,
 * dialogue system, save/load, easter eggs.
 *
 * Content (dialogue, messages) lives in content.js.
 * Styles live in style.css.
 */

// ── SPRITE ───────────────────────────────────────────────────
let heroSprite; // the <img> element swapped between frames

function setupHeroSprite() {
  const wrap = document.getElementById('hero-sprite-wrap');
  const canvas = document.getElementById('hero-canvas');

  heroSprite = document.createElement('img');
  heroSprite.id = 'hero-sprite-div';
  heroSprite.src = 'hero_f1.png';
  heroSprite.style.cssText = `
    width: 120px; height: 120px;
    object-fit: contain;
    image-rendering: pixelated;
    display: block;
    animation: hero-bob 1.8s ease-in-out infinite;
    filter: drop-shadow(0 6px 12px rgba(78,205,196,0.5));
  `;

  // Inject sprite keyframes once (kept in JS to stay co-located with sprite logic)
  if (!document.getElementById('hero-anim-style')) {
    const style = document.createElement('style');
    style.id = 'hero-anim-style';
    style.textContent = `
      @keyframes hero-bob {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-7px); }
      }
      @keyframes hero-shake {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        20%       { transform: translateX(-5px) rotate(-3deg); }
        40%       { transform: translateX(5px)  rotate(3deg); }
        60%       { transform: translateX(-4px) rotate(-2deg); }
        80%       { transform: translateX(4px)  rotate(2deg); }
      }
    `;
    document.head.appendChild(style);
  }

  wrap.replaceChild(heroSprite, canvas);

  // Alternate between 2 idle frames every 400ms
  const frames = ['hero_f1.png', 'hero_f2.png'];
  let fi = 0;
  setInterval(() => {
    fi = (fi + 1) % frames.length;
    heroSprite.src = frames[fi];
  }, 400);
}

// ── BOOT SEQUENCE ────────────────────────────────────────────
let bootDone = false;
let bootReady = false;

function runBoot() {
  const bar = document.getElementById('boot-bar');
  const pct = document.getElementById('boot-percent');
  const press = document.getElementById('boot-press');
  const label = document.querySelector('.boot-bar-label');

  let progress = 0;
  let msgIdx = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 3 + 0.5;
    if (progress > 100) progress = 100;

    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';

    if (msgIdx < BOOT_MESSAGES.length && progress >= BOOT_MESSAGES[msgIdx][0]) {
      label.textContent = BOOT_MESSAGES[msgIdx][1];
      msgIdx++;
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => { press.style.display = 'block'; bootReady = true; }, 600);
    }
  }, 60);
}

function proceedToGame() {
  if (!bootReady || bootDone) return;
  bootDone = true;

  const bootScreen = document.getElementById('boot-screen');
  bootScreen.style.opacity = '0';
  setTimeout(() => {
    bootScreen.style.display = 'none';
    const gameScreen = document.getElementById('game-screen');
    gameScreen.classList.remove('hidden');
    setTimeout(onGameStart, 100);
  }, 800);
}

document.addEventListener('keydown', proceedToGame);
document.addEventListener('click', () => { if (bootReady && !bootDone) proceedToGame(); });

// ── GAME START ───────────────────────────────────────────────
function onGameStart() {
  setupHeroSprite();
  initStars();
  animateLevelCount();
  animateExpBar();
  initTooltips();
  loadSave();
  checkKonami();

  // Animate all stat bars in from 0
  setTimeout(() => {
    document.querySelectorAll('.stat-bar').forEach(bar => {
      const target = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = target; }, 50);
    });
  }, 100);

  document.getElementById('hero-sprite-wrap').addEventListener('click', onHeroClick);
}

// ── STAR FIELD ───────────────────────────────────────────────
function initStars() {
  const canvas = document.getElementById('star-canvas');
  const ctx = canvas.getContext('2d');

  const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    a: Math.random(),
    speed: Math.random() * 0.3 + 0.05,
    dir: Math.random() > 0.5 ? 1 : -1,
  }));

  (function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.a += s.speed * 0.015 * s.dir;
      if (s.a > 1 || s.a < 0) s.dir *= -1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.fill();
    });
    requestAnimationFrame(drawStars);
  })();
}

// ── LEVEL COUNT ANIMATION ────────────────────────────────────
function animateLevelCount() {
  const el = document.getElementById('lvl-count');
  const max = 42; // The answer to life, the universe, and everything
  let n = 1;
  const iv = setInterval(() => {
    n += 1;
    el.textContent = n;
    if (n >= max) { clearInterval(iv); el.textContent = max; }
  }, 40);
}

// ── EXP BAR ANIMATION ────────────────────────────────────────
function animateExpBar() {
  setTimeout(() => { document.getElementById('exp-bar').style.width = '78%'; }, 300);
}

// ── TOOLTIPS ─────────────────────────────────────────────────
function initTooltips() {
  const tooltip = document.getElementById('tooltip');
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mousemove', e => {
      tooltip.textContent = el.dataset.tooltip;
      tooltip.classList.add('visible');
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top = (e.clientY - 8) + 'px';
    });
    el.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });
}

// ── HERO CLICK ───────────────────────────────────────────────
let clickCount = 0;

function onHeroClick(e) {
  clickCount++;

  // Shake sprite then return to bob
  heroSprite.style.animation = 'hero-shake 0.4s ease';
  setTimeout(() => { heroSprite.style.animation = 'hero-bob 1.8s ease-in-out infinite'; }, 450);

  // Random float message from content.js
  spawnFloatNum(e.clientX, e.clientY, CLICK_MESSAGES[Math.floor(Math.random() * CLICK_MESSAGES.length)]);

  // EXP bar pulses to show "XP gained"
  pulseExpBar();

  // Milestone reactions
  if (clickCount === 5) showAchievement('BUTTON MASHER', 'You clicked Jim 5 times.\nHe is unimpressed but curious.');
  if (clickCount === 10) showDialogue('JIM', 'OK ok I get it. You like clicking things.\nMaybe try making your OWN website instead? 😄');
}

function spawnFloatNum(x, y, text) {
  const el = document.createElement('div');
  el.className = 'float-num';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ── EXP BAR PULSE ────────────────────────────────────────────
let expPulsing = false;

function pulseExpBar() {
  if (expPulsing) return;
  expPulsing = true;
  const bar = document.getElementById('exp-bar');
  const orig = bar.style.width || '78%';
  bar.style.transition = 'width 0.15s ease';
  bar.style.width = '100%';
  bar.style.boxShadow = '0 0 16px var(--gold)';
  setTimeout(() => {
    bar.style.transition = 'width 0.6s ease';
    bar.style.width = orig;
    bar.style.boxShadow = '';
    setTimeout(() => { expPulsing = false; }, 700);
  }, 300);
}

// ── TALK ─────────────────────────────────────────────────────
let talkIdx = 0;

function talkToHero() {
  const [speaker, text] = TALK_LINES[talkIdx % TALK_LINES.length];
  showDialogue(speaker, text);
  talkIdx++;
}

// ── INSPECT ──────────────────────────────────────────────────
let inspectIdx = 0;

function inspectHero() {
  showDialogue('INSPECT', INSPECT_LINES[inspectIdx % INSPECT_LINES.length]);
  inspectIdx++;
}

// ── DIALOGUE SYSTEM ──────────────────────────────────────────
let dialogueInterval = null;

function showDialogue(speaker, text) {
  const box  = document.getElementById('dialogue-box');
  const spkr = document.getElementById('dialogue-speaker');
  const txt  = document.getElementById('dialogue-text');

  if (dialogueInterval) {
    clearInterval(dialogueInterval);
    dialogueInterval = null;
  }

  spkr.textContent = speaker;
  txt.textContent  = '';
  box.classList.remove('hidden');

  // Typewriter effect
  let i = 0;
  dialogueInterval = setInterval(() => {
    txt.textContent += text[i++];
    if (i >= text.length) {
      clearInterval(dialogueInterval);
      dialogueInterval = null;
    }
  }, 22);
}

function closeDialogue() {
  if (dialogueInterval) {
    clearInterval(dialogueInterval);
    dialogueInterval = null;
  }
  document.getElementById('dialogue-box').classList.add('hidden');
}

// ── TAB NAVIGATION ───────────────────────────────────────────
function switchTab(tabId) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('tab-' + tabId).classList.add('active');
  // Future: show/hide tab content panels here
}

// ── SAVE / LOAD ──────────────────────────────────────────────
const SAVE_KEY = 'jimmod_save';

function saveGame() {
  const now = new Date().toLocaleString();
  const data = { visitCount: getVisitCount() + 1, lastVisit: now, talkIdx, inspectIdx, clickCount };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  document.getElementById('save-label').textContent = 'SAVED ' + now.slice(0, 10);
  showAchievement('GAME SAVED', "Your progress has been recorded\nin the cloud of Jim's localStorage.");
}

function loadSave() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const save = JSON.parse(raw);
    talkIdx = save.talkIdx || 0;
    inspectIdx = save.inspectIdx || 0;
    clickCount = save.clickCount || 0;
    const vc = (save.visitCount || 0) + 1;
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...save, visitCount: vc, lastVisit: new Date().toLocaleString() }));
    document.getElementById('save-label').textContent = 'SAVE #' + vc;
    if (vc >= 5) setTimeout(() => showAchievement('REGULAR VISITOR', `You've been here ${vc} times.\nYou might like it here.`), 2000);
  } catch (e) { /* corrupted save — ignore */ }
}

function getVisitCount() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY))?.visitCount || 0; }
  catch { return 0; }
}

// ── ACHIEVEMENT TOAST ────────────────────────────────────────
let achTimeout;

function showAchievement(title, sub) {
  document.querySelector('.ach-title').textContent = '🏆 ' + title;
  document.getElementById('ach-sub-text').textContent = sub;
  const toast = document.getElementById('achievement-toast');
  toast.classList.remove('hidden');
  clearTimeout(achTimeout);
  achTimeout = setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ── KONAMI CODE ──────────────────────────────────────────────
function checkKonami() {
  const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let idx = 0;
  document.addEventListener('keydown', e => {
    idx = (e.key === CODE[idx]) ? idx + 1 : 0;
    if (idx === CODE.length) { idx = 0; activateKonami(); }
  });
}

function activateKonami() {
  showAchievement('KONAMI CODE!', 'You found the secret!\n+30 lives. +infinite respect.');
  document.body.style.transition = 'filter 1s';
  document.body.style.filter = 'hue-rotate(180deg) saturate(2)';
  setTimeout(() => { document.body.style.filter = ''; }, 3000);
  showDialogue('SYSTEM', '▸ CHEAT CODE ACTIVATED!\n  +30 Lives\n  +Infinite Respect\n  Coffee Refilled\n  Family Proud\n  Level: LEGENDARY');
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', runBoot);
