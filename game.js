/* ============================================================
   JIMMOD.COM — Game Logic
   Boot sequence, sprite animation, interactions, easter eggs
   ============================================================ */

// ── SPRITE DISPLAY SETUP ────────────────────────────────────
// We display the hero sprite as a CSS-animated <div> with the
// sprite sheet as background, cropped to just the first idle frame.
// The generated sheet is 1024x1024 with:
//   Row 0: 4 idle frames  → each frame is 1024/4 = 256px wide, ~256px tall
//   Row 1: 8 walk frames  → each 128px wide
//   Row 2: attack frames
// We show frame 0 of idle row and apply CSS animation for life.

let heroSprite;  // the <div> hero display element
let currentAnim = 'idle'; // track state for shake/glow effects

function setupHeroSprite() {
  // Replace the canvas with a styled div for the sprite
  const wrap = document.getElementById('hero-sprite-wrap');
  const canvas = document.getElementById('hero-canvas');

  heroSprite = document.createElement('div');
  heroSprite.id = 'hero-sprite-div';
  heroSprite.style.cssText = `
    width: 96px;
    height: 96px;
    background-image: url('hero_idle.png');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    image-rendering: pixelated;
    animation: hero-bob 1.2s ease-in-out infinite;
    filter: drop-shadow(0 4px 8px rgba(78,205,196,0.4));
  `;

  // Add CSS keyframe for bob animation
  if (!document.getElementById('hero-anim-style')) {
    const style = document.createElement('style');
    style.id = 'hero-anim-style';
    style.textContent = `
      @keyframes hero-bob {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-5px); }
      }
      @keyframes hero-shake {
        0%, 100% { transform: translateX(0) rotate(0); }
        20%       { transform: translateX(-5px) rotate(-3deg); }
        40%       { transform: translateX(5px) rotate(3deg); }
        60%       { transform: translateX(-4px) rotate(-2deg); }
        80%       { transform: translateX(4px) rotate(2deg); }
      }
      @keyframes hero-glow {
        0%, 100% { filter: drop-shadow(0 4px 8px rgba(78,205,196,0.4)); }
        50%       { filter: drop-shadow(0 0 20px rgba(78,205,196,0.9)) brightness(1.3); }
      }
    `;
    document.head.appendChild(style);
  }

  wrap.replaceChild(heroSprite, canvas);

  // Verify image loads; if not, fall back to drawn canvas
  const testImg = new Image();
  testImg.onload = () => { /* sprite loaded fine */ };
  testImg.onerror = () => {
    // Fallback: use a pixel-art canvas
    heroSprite.style.display = 'none';
    const c = document.createElement('canvas');
    c.width = 96; c.height = 96;
    c.style.cssText = 'animation: hero-bob 1.2s ease-in-out infinite; image-rendering: pixelated;';
    wrap.appendChild(c);
    const ctx = c.getContext('2d');
    drawFallbackHero(ctx);
  };
  testImg.src = 'hero_sprite.png';
}

// Minimal pixel-art fallback
function drawFallbackHero(ctx) {
  // Hoodie body
  ctx.fillStyle = '#2d3561';
  ctx.fillRect(28, 36, 40, 44);
  // Head
  ctx.fillStyle = '#c8a07a';
  ctx.fillRect(30, 12, 36, 28);
  // Hair
  ctx.fillStyle = '#4a2c0a';
  ctx.fillRect(28, 10, 40, 10);
  // Glasses
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(32, 22, 10, 7);
  ctx.fillRect(54, 22, 10, 7);
  ctx.fillStyle = '#4ecdc4';
  ctx.fillRect(32, 22, 10, 2);
  ctx.fillRect(54, 22, 10, 2);
  // Hoodie pocket
  ctx.fillStyle = '#1e2440';
  ctx.fillRect(36, 58, 24, 14);
  // Legs
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(30, 80, 16, 14);
  ctx.fillRect(50, 80, 16, 14);
  // Keyboard (weapon)
  ctx.fillStyle = '#555';
  ctx.fillRect(70, 44, 22, 10);
  ctx.fillStyle = '#4ecdc4';
  ctx.fillRect(72, 46, 4, 2);
  ctx.fillRect(78, 46, 4, 2);
  ctx.fillRect(84, 46, 4, 2);
}

// ── BOOT SEQUENCE ───────────────────────────────────────────
let bootDone = false;
let bootReady = false; // waiting for keypress

function runBoot() {
  const bar     = document.getElementById('boot-bar');
  const pct     = document.getElementById('boot-percent');
  const press   = document.getElementById('boot-press');

  let progress = 0;
  const msgs = [
    [10,  'CHECKING SAVE DATA...'],
    [25,  'LOADING HERO STATS...'],
    [42,  'COMPILING KOTLIN...'],
    [58,  'DEPLOYING TO DEVICE...'],
    [70,  'FINDING GOOD VIBES...'],
    [85,  'WATERING FAMILY PLANT...'],
    [95,  'ALMOST THERE...'],
    [100, 'HERO DATA LOADED!'],
  ];
  let msgIdx = 0;

  const label = document.querySelector('.boot-bar-label');

  const interval = setInterval(() => {
    progress += Math.random() * 3 + 0.5;
    if (progress > 100) progress = 100;

    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';

    if (msgIdx < msgs.length && progress >= msgs[msgIdx][0]) {
      label.textContent = msgs[msgIdx][1];
      msgIdx++;
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        press.style.display = 'block';
        bootReady = true;
      }, 600);
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
    setTimeout(() => onGameStart(), 100);
  }, 800);
}

document.addEventListener('keydown', proceedToGame);
document.addEventListener('click', (e) => {
  if (bootReady && !bootDone) proceedToGame();
});

// ── GAME START ──────────────────────────────────────────────
function onGameStart() {
  setupHeroSprite();

  initStars();
  animateLevelCount();
  animateExpBar();
  initTooltips();
  loadSave();
  checkKonami();

  // Animate stat bars in
  setTimeout(() => {
    document.querySelectorAll('.stat-bar').forEach(bar => {
      const target = bar.style.width;
      bar.style.width = '0%';
      setTimeout(() => { bar.style.width = target; }, 50);
    });
  }, 100);

  // Hero click
  document.getElementById('hero-sprite-wrap').addEventListener('click', onHeroClick);
}

// ── STAR FIELD ──────────────────────────────────────────────
let stars = [];
function initStars() {
  const canvas = document.getElementById('star-canvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  stars = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.5 + 0.3,
    a: Math.random(),
    speed: Math.random() * 0.3 + 0.05,
    dir: Math.random() > 0.5 ? 1 : -1,
  }));

  function drawStars() {
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
  }
  drawStars();

  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ── LEVEL COUNT ANIMATION ────────────────────────────────────
function animateLevelCount() {
  const el  = document.getElementById('lvl-count');
  const max = 42; // the answer
  let n = 1;
  const iv = setInterval(() => {
    n += 1;
    el.textContent = n;
    if (n >= max) { clearInterval(iv); el.textContent = max; }
  }, 40);
}

// ── EXP BAR ANIMATION ────────────────────────────────────────
function animateExpBar() {
  const bar = document.getElementById('exp-bar');
  setTimeout(() => { bar.style.width = '78%'; }, 300);
}

// ── TOOLTIPS ─────────────────────────────────────────────────
function initTooltips() {
  const tooltip = document.getElementById('tooltip');
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('mousemove', (e) => {
      tooltip.textContent = el.dataset.tooltip;
      tooltip.classList.add('visible');
      tooltip.style.left = (e.clientX + 12) + 'px';
      tooltip.style.top  = (e.clientY - 8) + 'px';
    });
    el.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  });
}

// ── HERO CLICK ──────────────────────────────────────────────
let clickCount = 0;
function onHeroClick(e) {
  clickCount++;

  // Shake the sprite
  if (heroSprite) {
    heroSprite.style.animation = 'hero-shake 0.4s ease';
    setTimeout(() => { heroSprite.style.animation = 'hero-bob 1.2s ease-in-out infinite'; }, 400);
  }

  // Float a damage number
  const msgs = ['OUCH!', '+1 KARMA', 'HEY!', '...', 'WHAT?', 'RUDE!', 'FINE!', '(ノ°Д°）ノ', '¯\\_(ツ)_/¯'];
  spawnFloatNum(e.clientX, e.clientY, msgs[Math.floor(Math.random() * msgs.length)]);

  // Brief glow on attack
  if (heroSprite) {
    setTimeout(() => {
      heroSprite.style.animation = 'hero-glow 0.4s ease';
      setTimeout(() => { heroSprite.style.animation = 'hero-bob 1.2s ease-in-out infinite'; }, 800);
    }, 400);
  }

  // Special: at 5 clicks
  if (clickCount === 5) {
    showAchievement('BUTTON MASHER', 'You clicked Jim 5 times.\nHe is unimpressed but curious.');
  }
  if (clickCount === 10) {
    showDialogue('JIM', 'OK ok I get it. You like clicking things.\nMaybe try making your OWN website instead? 😄');
  }
}

function spawnFloatNum(x, y, text) {
  const el = document.createElement('div');
  el.className = 'float-num';
  el.textContent = text;
  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

// ── TALK DIALOGUE ────────────────────────────────────────────
const TALK_LINES = [
  ["JIM", "Hey! Welcome to my little corner of the internet.\nMake yourself at home. Don't break anything."],
  ["JIM", "20+ years of writing code and I still get excited\nwhen something compiles on the first try. Rare drops."],
  ["JIM", "Gaming is my recharge. Family is my main quest.\nEverything else is a side mission."],
  ["JIM", "I started coding as a teen. Best decision I ever made.\nWell... second best. First was marrying up. 😄"],
  ["JIM", "Android development is my craft. Kotlin is my spell book.\nJava is my ancient tome I still respect."],
  ["JIM", "The secret to 20+ years? Keep learning.\nEvery year there's something new to be bad at first."],
  ["JIM", "Be good. Work hard. Play games. Love your family.\nThat's the whole strategy guide, honestly."],
  ["JIM", "*looks at your code*\n...have you tried turning it off and on again?"],
  ["SYSTEM", "JIM has no more wisdom to share at this time.\nTry again after he's had more coffee."],
];
let talkIdx = 0;

function talkToHero() {
  const line = TALK_LINES[talkIdx % TALK_LINES.length];
  showDialogue(line[0], line[1]);
  talkIdx++;
  currentAnim = 'walk';
  frameIndex  = 0;
  setTimeout(() => { currentAnim = 'idle'; frameIndex = 0; }, 1200);
}

// ── INSPECT ──────────────────────────────────────────────────
const INSPECT_LINES = [
  "A seasoned engineer. He smells faintly of coffee\nand fresh compile warnings.",
  "His keyboard is worn in all the right places.\n'CTRL', 'Z', and 'S' are nearly invisible.",
  "Level 42. Class: Android Wizard.\nSpecial ability: Debugging by intuition.",
  "He carries a battered controller wherever he goes.\nIt is his lucky charm.",
  "Passive trait: FOREVER LEARNER\n↳ Skill cap: undefined",
  "Status: Online\nMood: Curious\nHP: Full\nLast saved: Unknown",
];
let inspectIdx = 0;

function inspectHero() {
  showDialogue('INSPECT', INSPECT_LINES[inspectIdx % INSPECT_LINES.length]);
  inspectIdx++;
}

// ── DIALOGUE SYSTEM ──────────────────────────────────────────
function showDialogue(speaker, text) {
  const box  = document.getElementById('dialogue-box');
  const spkr = document.getElementById('dialogue-speaker');
  const txt  = document.getElementById('dialogue-text');

  spkr.textContent = speaker;
  txt.textContent  = '';
  box.classList.remove('hidden');

  // Typewriter effect
  let i = 0;
  const iv = setInterval(() => {
    txt.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(iv);
  }, 22);
}

function closeDialogue() {
  document.getElementById('dialogue-box').classList.add('hidden');
}

// ── SAVE GAME ────────────────────────────────────────────────
function saveGame() {
  const now = new Date().toLocaleString();
  localStorage.setItem('jimmod_save', JSON.stringify({
    visitCount: (getVisitCount() + 1),
    lastVisit: now,
    talkIdx,
    inspectIdx,
    clickCount,
  }));
  document.getElementById('save-label').textContent = 'SAVED ' + now.slice(0,10);
  showAchievement('GAME SAVED', 'Your progress has been recorded\nin the cloud of Jim\'s localStorage.');
}

function loadSave() {
  const raw = localStorage.getItem('jimmod_save');
  if (!raw) return;
  try {
    const save = JSON.parse(raw);
    talkIdx     = save.talkIdx    || 0;
    inspectIdx  = save.inspectIdx || 0;
    clickCount  = save.clickCount || 0;
    const vc    = (save.visitCount || 0) + 1;
    localStorage.setItem('jimmod_save', JSON.stringify({ ...save, visitCount: vc, lastVisit: new Date().toLocaleString() }));
    document.getElementById('save-label').textContent = 'SAVE #' + vc;
    if (vc >= 5) {
      setTimeout(() => showAchievement('REGULAR VISITOR', 'You\'ve been here ' + vc + ' times.\nYou might like it here.'), 2000);
    }
  } catch(e) {}
}

function getVisitCount() {
  try {
    const raw = localStorage.getItem('jimmod_save');
    return raw ? (JSON.parse(raw).visitCount || 0) : 0;
  } catch { return 0; }
}

// ── ACHIEVEMENT TOAST ────────────────────────────────────────
let achTimeout;
function showAchievement(title, sub) {
  const toast = document.getElementById('achievement-toast');
  const subEl = document.getElementById('ach-sub-text');
  subEl.textContent = sub;
  document.querySelector('.ach-title').textContent = '🏆 ' + title;
  toast.classList.remove('hidden');
  clearTimeout(achTimeout);
  achTimeout = setTimeout(() => toast.classList.add('hidden'), 4000);
}

// ── KONAMI CODE ──────────────────────────────────────────────
function checkKonami() {
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kIdx = 0;
  document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[kIdx]) {
      kIdx++;
      if (kIdx === KONAMI.length) {
        kIdx = 0;
        activateKonami();
      }
    } else {
      kIdx = 0;
    }
  });
}

function activateKonami() {
  showAchievement('KONAMI CODE!', 'You found the secret!\n+30 lives. +infinite respect.');
  document.body.style.transition = 'filter 1s';
  document.body.style.filter = 'hue-rotate(180deg) saturate(2)';
  setTimeout(() => {
    document.body.style.filter = '';
  }, 3000);
  showDialogue('SYSTEM', '▸ CHEAT CODE ACTIVATED!\n  +30 Lives\n  +Infinite Respect\n  Coffee Refilled\n  Family Proud\n  Level: LEGENDARY');
}

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  runBoot();
});
