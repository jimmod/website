/**
 * content.js — jimmod.com
 *
 * All user-facing text lives here.
 * Edit this file to update dialogue, quests, stats tooltips, etc.
 * No game logic here — just data.
 */

// ── BOOT SCREEN ──────────────────────────────────────────────
// Messages shown during the loading bar, keyed by progress %.
const BOOT_MESSAGES = [
  [10,  'CHECKING SAVE DATA...'],
  [25,  'LOADING HERO STATS...'],
  [42,  'COMPILING KOTLIN...'],
  [58,  'DEPLOYING TO DEVICE...'],
  [70,  'FINDING GOOD VIBES...'],
  [85,  'WATERING FAMILY PLANT...'],
  [95,  'ALMOST THERE...'],
  [100, 'HERO DATA LOADED!'],
];

// ── TALK DIALOGUE ────────────────────────────────────────────
// Cycles through in order each time [ TALK ] is pressed.
// Format: ["SPEAKER_NAME", "Message text.\nSecond line."]
const TALK_LINES = [
  ["JIM", "Hey! Welcome to my little corner of the internet.\nMake yourself at home. Don't break anything."],
  ["JIM", "20+ years of writing code and I still get excited\nwhen something compiles on the first try. Rare drops."],
  ["JIM", "I build things to make the world a little better.\nGaming recharges me, family keeps me grounded — both fuel the mission."],
  ["JIM", "I started coding as a teen. Best decision I ever made.\nWell... second best. First was marrying up. 😄"],
  ["JIM", "Android development is my craft. Kotlin is my spell book.\nJava is my ancient tome I still respect."],
  ["JIM", "The secret to 20+ years? Keep learning.\nEvery year there's something new to be bad at first."],
  ["JIM", "Be good. Be fair. Work hard. Love your family — and everyone else too.\nWe're all in the same party. That's the whole strategy guide."],
  ["JIM", "*looks at your code*\n...have you tried turning it off and on again?"],
  ["SYSTEM", "JIM has no more wisdom to share at this time.\nTry again after he's had more coffee."],
];

// ── INSPECT DIALOGUE ─────────────────────────────────────────
// Cycles through in order each time [ INSPECT ] is pressed.
// Third-person NPC description style.
const INSPECT_LINES = [
  "A seasoned engineer. He smells faintly of coffee\nand fresh compile warnings.",
  "His keyboard is worn in all the right places.\n'CTRL', 'Z', and 'S' are nearly invisible.",
  "Level 42. Class: Coding Wizard.\nSpecial ability: Debugging by intuition.",
  "He carries a battered controller wherever he goes.\nIt is his lucky charm.",
  "Passive trait: FOREVER LEARNER\n↳ Skill cap: undefined",
  "Status: Online\nMood: Curious\nHP: Full\nLast saved: Unknown",
];

// ── HERO CLICK MESSAGES ──────────────────────────────────────
// Random message shown when clicking the hero avatar.
const CLICK_MESSAGES = [
  'OUCH!', '+1 KARMA', 'HEY!', '...', 'WHAT?',
  'RUDE!', 'FINE!', '(ノ°Д°）ノ', '¯\\_(ツ)_/¯',
];
