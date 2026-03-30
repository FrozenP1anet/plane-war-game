const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const weaponEl = document.getElementById("weapon");
const ammoEl = document.getElementById("ammo");
const levelEl = document.getElementById("level");
const eventNameEl = document.getElementById("eventName");
const weaponRackEl = document.getElementById("weaponRack");
const stageEl = document.getElementById("stage");
const panelEl = document.getElementById("panel");
const hudEl = document.getElementById("hud");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlayTitle");
const messageEl = document.getElementById("message");
const resultsPanelEl = document.getElementById("resultsPanel");
const resultSummaryEl = document.getElementById("resultSummary");
const resultStatsEl = document.getElementById("resultStats");
const restartButton = document.getElementById("restartButton");
const menuButton = document.getElementById("menuButton");
const controlsEl = document.getElementById("controls");
const menuScreenEl = document.getElementById("menuScreen");
const menuMainEl = document.getElementById("menuMain");
const settingsViewEl = document.getElementById("settingsView");
const helpViewEl = document.getElementById("helpView");
const campaignButton = document.getElementById("campaignButton");
const endlessButton = document.getElementById("endlessButton");
const settingsButton = document.getElementById("settingsButton");
const helpButton = document.getElementById("helpButton");
const settingsBackButton = document.getElementById("settingsBackButton");
const helpBackButton = document.getElementById("helpBackButton");
const difficultySlider = document.getElementById("difficultySlider");
const difficultyValueEl = document.getElementById("difficultyValue");
const touchButtons = document.querySelectorAll("[data-control]");
const fireButtons = document.querySelectorAll("[data-fire]");

const CONFIG = window.GAME_CONFIG;
const GAME_WIDTH = CONFIG.canvas.width;
const GAME_HEIGHT = CONFIG.canvas.height;
const PLAYER_SPEED = CONFIG.player.speed;
const PLAYER_BULLET_SPEED = CONFIG.bullets.baseSpeed;
const ENEMY_MIN_SPEED = CONFIG.enemies.minSpeed;
const ENEMY_MAX_SPEED = CONFIG.enemies.maxSpeed;
const PLAYER_INVULNERABLE_TIME = CONFIG.player.invulnerableTime;
const BASE_FIRE_INTERVAL = CONFIG.bullets.baseFireInterval;
const STAR_COUNT = CONFIG.stars.count;
const DROP_CHANCE = CONFIG.drops.chance;
const DROP_LIFE = CONFIG.drops.life;
const FINAL_BOSS_HIT_DROP_CHANCE = CONFIG.drops.finalBossHitChance ?? 0;
const FINAL_BOSS_HIT_DROP_COOLDOWN = CONFIG.drops.finalBossHitCooldown ?? 0;
const BOSS_ENTRY_SPEED = CONFIG.enemies.bossEntrySpeed;
const BOSS_HORIZONTAL_SPEED = CONFIG.enemies.bossHorizontalSpeed;
const BOMBER_BLAST_RADIUS = CONFIG.enemies.bomberBlastRadius;
const HEAVY_CHARGE_TIME = CONFIG.heavy.chargeTime;
const PLAYER_HITBOX = CONFIG.player.hitbox;
const SUPPLY_AURA_RADIUS = CONFIG.enemies.supplyAuraRadius;
const SUPPLY_HEAL_PER_SECOND = CONFIG.enemies.supplyHealPerSecond;
const HEAVY_BURN_DURATION = CONFIG.heavy.burnDuration;
const HEAVY_BURN_DAMAGE_PER_SECOND = CONFIG.heavy.burnDamagePerSecond;
const PLAYER_SHOT_BANK_FACTOR = CONFIG.player.shotBankFactor;
const HEAVY_AUTO_RELEASE_DELAY = CONFIG.heavy.autoReleaseDelay;
const ASSAULT_TRAIL_LIFE = CONFIG.enemies.assaultTrailLife;
const ASSAULT_TRAIL_RADIUS = CONFIG.enemies.assaultTrailRadius;
const FINAL_BOSS_TRAIL_LIFE = CONFIG.enemies.finalBossTrailLife;
const FINAL_BOSS_TRAIL_RADIUS = CONFIG.enemies.finalBossTrailRadius;
const LEVELS = CONFIG.levels.items;
const START_LEVEL_INDEX = clamp(CONFIG.levels.startLevel - 1, 0, LEVELS.length - 1);
const FINAL_BOSS_CONFIG = LEVELS[LEVELS.length - 1].finalBoss || null;
const SETTINGS_STORAGE_KEY = "plane-war-settings-v1";

const ENDLESS_LEVEL = {
  name: "无尽模式",
  durationSec: Number.POSITIVE_INFINITY,
  baseDifficulty: 0.28,
  spawnIntervalMultiplier: 1,
  enemySpeedMultiplier: 1,
  bossHpMultiplier: 1.06,
  bossFireCooldownMultiplier: 0.96,
  specialEnemyChanceMultiplier: 1.02,
};

const ENDLESS_STAGE_DURATION = 45;
const ENDLESS_EVENTS = [
  {
    name: "突袭风暴",
    description: "突袭机会在侧翼高速切入。",
    warningColor: "#8ef1ad",
    spawnIntervalMultiplier: 0.82,
    assaultChanceMultiplier: 3.2,
  },
  {
    name: "轰炸走廊",
    description: "炸弹机编队压境，爆炸区域更密集。",
    warningColor: "#f3b2ff",
    spawnIntervalMultiplier: 0.88,
    bomberChanceMultiplier: 3.1,
  },
  {
    name: "陨石暴雨",
    description: "大量陨石落下，战场变窄。",
    warningColor: "#d3c1a7",
    spawnIntervalMultiplier: 1.04,
    forceMeteor: true,
    meteorSpawnInterval: 0.58,
  },
  {
    name: "补给争夺",
    description: "补给机和掉落增多，适合补充弹药。",
    warningColor: "#ffe18f",
    spawnIntervalMultiplier: 0.94,
    supplyChanceMultiplier: 3.2,
    dropChanceBonus: 0.18,
  },
  {
    name: "火力试炼",
    description: "敌机密度上升，突袭与轰炸混编出现。",
    warningColor: "#ffb28c",
    spawnIntervalMultiplier: 0.72,
    assaultChanceMultiplier: 1.8,
    bomberChanceMultiplier: 1.8,
  },
];

const WEAPON_HUD_META = {
  basic: { icon: "A", name: "单发", ammo: "∞" },
  rapid: { icon: "H", name: "速射" },
  spread: { icon: "J", name: "扩散" },
  heavy: { icon: "K", name: "重炮" },
  cluster: { icon: "M", name: "导弹" },
};

const BOSS_ATTACK_MODES = [
  { key: "sniper", name: "狙击模式", color: "#ffd29a", cooldown: 1.95 },
  { key: "spread", name: "扇扫模式", color: "#ff9b87", cooldown: 1.55 },
  { key: "burst", name: "连射模式", color: "#c8b6ff", cooldown: 1.18 },
];

function syncCanvasResolution() {
  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  const pixelWidth = Math.round(GAME_WIDTH * dpr);
  const pixelHeight = Math.round(GAME_HEIGHT * dpr);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;
}

syncCanvasResolution();

const IMAGES = loadImages(CONFIG.assets);

const WEAPONS = {
  basic: {
    label: CONFIG.weapons.basic.label,
    fireInterval: BASE_FIRE_INTERVAL,
    sound: "basicShot",
    shoot(player) {
      return [
        createPlayerBullet(
          player.x + player.width / 2 + CONFIG.weapons.basic.offsetX,
          player.y + CONFIG.weapons.basic.offsetY,
          CONFIG.weapons.basic.width,
          CONFIG.weapons.basic.height,
          0,
          PLAYER_BULLET_SPEED,
          1,
          CONFIG.weapons.basic.color
        ),
      ];
    },
  },
  rapid: {
    label: CONFIG.weapons.rapid.label,
    cooldown: CONFIG.weapons.rapid.cooldown,
    ammoGain: CONFIG.weapons.rapid.ammoGain,
    ammoVariance: CONFIG.weapons.rapid.ammoVariance,
    sound: "rapidShot",
    shoot(player) {
      return [
        createPlayerBullet(player.x + player.width * 0.3 - 2, player.y - 10, CONFIG.weapons.rapid.width, CONFIG.weapons.rapid.height, 0, PLAYER_BULLET_SPEED + CONFIG.weapons.rapid.speedOffset, 1, CONFIG.weapons.rapid.color),
        createPlayerBullet(player.x + player.width * 0.7 - 2, player.y - 10, CONFIG.weapons.rapid.width, CONFIG.weapons.rapid.height, 0, PLAYER_BULLET_SPEED + CONFIG.weapons.rapid.speedOffset, 1, CONFIG.weapons.rapid.color),
      ];
    },
  },
  spread: {
    label: CONFIG.weapons.spread.label,
    cooldown: CONFIG.weapons.spread.cooldown,
    ammoGain: CONFIG.weapons.spread.ammoGain,
    ammoVariance: CONFIG.weapons.spread.ammoVariance,
    sound: "spreadShot",
    shoot(player) {
      const centerX = player.x + player.width / 2 - 3;
      const topY = player.y - 12;
      return [
        createPlayerBullet(centerX - 12, topY, CONFIG.weapons.spread.sideWidth, CONFIG.weapons.spread.sideHeight, -CONFIG.weapons.spread.sideVelocity, PLAYER_BULLET_SPEED - CONFIG.weapons.spread.sideSpeedOffset, 1, CONFIG.weapons.spread.color, -CONFIG.weapons.spread.sideAngle),
        createPlayerBullet(centerX, topY - 6, CONFIG.weapons.spread.centerWidth, CONFIG.weapons.spread.centerHeight, 0, PLAYER_BULLET_SPEED, 1, CONFIG.weapons.spread.color),
        createPlayerBullet(centerX + 12, topY, CONFIG.weapons.spread.sideWidth, CONFIG.weapons.spread.sideHeight, CONFIG.weapons.spread.sideVelocity, PLAYER_BULLET_SPEED - CONFIG.weapons.spread.sideSpeedOffset, 1, CONFIG.weapons.spread.color, CONFIG.weapons.spread.sideAngle),
      ];
    },
  },
  heavy: {
    label: CONFIG.weapons.heavy.label,
    cooldown: CONFIG.weapons.heavy.cooldown,
    ammoGain: CONFIG.weapons.heavy.ammoGain,
    ammoVariance: CONFIG.weapons.heavy.ammoVariance,
    sound: "heavyShot",
  },
  cluster: {
    label: CONFIG.weapons.cluster.label,
    cooldown: CONFIG.weapons.cluster.cooldown,
    ammoGain: CONFIG.weapons.cluster.ammoGain,
    sound: "clusterShot",
  },
};

const DROP_TYPES = {
  life: { imageKey: "dropLife", color: "#69f0ae" },
  rapid: { imageKey: "dropRapid", color: "#7ddcff" },
  spread: { imageKey: "dropSpread", color: "#ffd166" },
  heavy: { imageKey: "dropHeavy", color: "#ff9f80" },
  cluster: { imageKey: "dropCluster", color: "#9ec5ff" },
};

const keys = new Set();
const touchState = { left: false, right: false, up: false, down: false };
const stars = Array.from({ length: STAR_COUNT }, () => ({
  x: Math.random() * GAME_WIDTH,
  y: Math.random() * GAME_HEIGHT,
  size: Math.random() * 2 + 1,
  speed: Math.random() * 80 + 30,
}));

const audioState = {
  ctx: null,
  enabled: false,
};

const appState = {
  screen: "menu",
  menuView: "main",
  difficultyScale: 1,
  lastMode: "campaign",
};

let state = null;
let lastTime = 0;
let flashMessage = "";
let flashMessageTimer = 0;
let lastHudScore = "";
let lastHudLives = "";
let lastHudWeapon = "";
let lastHudAmmo = "";
let lastHudLevel = "";
let lastHudEvent = "";
let lastWeaponRack = "";

function loadImages(entries) {
  const images = {};
  for (const [key, src] of Object.entries(entries)) {
    const image = new Image();
    image.src = src;
    images[key] = image;
  }
  return images;
}

function loadAppSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw);
    if (typeof parsed.difficultyScale === "number") {
      appState.difficultyScale = clamp(parsed.difficultyScale, 0.7, 1.6);
    }
  } catch {}
}

function saveAppSettings() {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
      difficultyScale: appState.difficultyScale,
    }));
  } catch {}
}

function updateDifficultyUi() {
  difficultySlider.value = String(appState.difficultyScale);
  difficultyValueEl.textContent = `${appState.difficultyScale.toFixed(1)}x`;
}

function isEndlessMode() {
  return state?.gameMode === "endless";
}

function getCurrentEndlessStage() {
  return Math.max(1, Math.floor((state?.runningTime ?? 0) / ENDLESS_STAGE_DURATION) + 1);
}

function getCurrentEndlessEvent() {
  if (!isEndlessMode()) {
    return null;
  }
  return ENDLESS_EVENTS[(getCurrentEndlessStage() - 1) % ENDLESS_EVENTS.length];
}

function pushWarning(message, color = "#ffd29a", duration = 1.3) {
  state.warningText = message;
  state.warningColor = color;
  state.warningTimer = duration;
}

function addScreenShake(power, duration = 0.18) {
  state.screenShakeTime = Math.max(state.screenShakeTime, duration);
  state.screenShakePower = Math.max(state.screenShakePower, power);
}

function getResultCards() {
  const accuracy = state.stats.shotsFired > 0
    ? `${Math.round((state.stats.shotsHit / state.stats.shotsFired) * 100)}%`
    : "0%";
  return [
    { label: "击毁数量", value: String(state.stats.enemiesDestroyed) },
    { label: "命中率", value: accuracy },
    { label: "拾取补给", value: String(state.stats.pickups) },
    { label: "承受伤害", value: String(state.stats.damageTaken) },
    { label: "击坠 Boss", value: String(state.stats.bossesDefeated) },
    { label: "生存时间", value: formatCountdown(state.runningTime) },
  ];
}

function renderResultCards(cards) {
  resultStatsEl.innerHTML = cards.map((card) => (
    `<div class="result-card"><span class="result-label">${card.label}</span><strong class="result-value">${card.value}</strong></div>`
  )).join("");
}

function renderWeaponRack() {
  const currentType = state.heavyCharging
    ? "heavy"
    : state.currentWeaponLabel.includes("H-") ? "rapid"
      : state.currentWeaponLabel.includes("J-") ? "spread"
        : state.currentWeaponLabel.includes("K-") ? "heavy"
          : state.currentWeaponLabel.includes("M-") ? "cluster"
            : "basic";
  const cooldownText = (type) => state.specialCooldowns[type] > 0 ? `${state.specialCooldowns[type].toFixed(1)}s` : "就绪";
  const rack = ["basic", "rapid", "spread", "heavy", "cluster"].map((type) => {
    const meta = WEAPON_HUD_META[type];
    const ammo = type === "basic" ? meta.ammo : state.ammo[type];
    const status = type === "basic" ? "自动" : cooldownText(type);
    return `<div class="weapon-chip weapon-${type} ${currentType === type ? "is-active" : ""}">
      <div class="weapon-chip-head">
        <span class="weapon-icon">${meta.icon}</span>
        <span class="weapon-name">${meta.name}</span>
      </div>
      <div class="weapon-chip-meta">
        <strong class="weapon-ammo">${ammo}</strong>
        <span class="weapon-state">${status}</span>
      </div>
    </div>`;
  }).join("");
  if (rack !== lastWeaponRack) {
    weaponRackEl.innerHTML = rack;
    lastWeaponRack = rack;
  }
}

function switchMenuView(view) {
  appState.menuView = view;
  menuMainEl.classList.toggle("hidden", view !== "main");
  settingsViewEl.classList.toggle("hidden", view !== "settings");
  helpViewEl.classList.toggle("hidden", view !== "help");
}

function showMenu(view = "main") {
  appState.screen = "menu";
  state.running = false;
  state.paused = false;
  hideOverlay();
  stageEl.classList.add("menu-layout");
  panelEl.classList.add("menu-shell");
  menuScreenEl.classList.remove("hidden");
  hudEl.classList.add("hidden");
  weaponRackEl.classList.add("hidden");
  controlsEl.classList.add("hidden");
  switchMenuView(view);
}

function hideMenu() {
  appState.screen = "game";
  stageEl.classList.remove("menu-layout");
  panelEl.classList.remove("menu-shell");
  menuScreenEl.classList.add("hidden");
  hudEl.classList.remove("hidden");
  weaponRackEl.classList.remove("hidden");
  controlsEl.classList.remove("hidden");
}

function ensureAudio() {
  if (audioState.ctx) {
    if (audioState.ctx.state === "suspended") {
      audioState.ctx.resume();
    }
    audioState.enabled = true;
    return;
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return;
  }

  audioState.ctx = new AudioCtor();
  audioState.enabled = true;
}

function playTone({ type = "sine", frequency = 440, duration = 0.08, gain = 0.04, attack = 0.003, slideTo = null }) {
  if (!audioState.enabled || !audioState.ctx) {
    return;
  }

  const now = audioState.ctx.currentTime;
  const oscillator = audioState.ctx.createOscillator();
  const gainNode = audioState.ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (slideTo !== null) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), now + duration);
  }

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.linearRampToValueAtTime(gain, now + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioState.ctx.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.03);
}

function playSound(name) {
  switch (name) {
    case "basicShot":
      break;
    case "rapidShot":
      playTone({ type: "square", frequency: 760, slideTo: 590, duration: 0.035, gain: 0.018 });
      break;
    case "spreadShot":
      playTone({ type: "triangle", frequency: 440, slideTo: 320, duration: 0.08, gain: 0.03 });
      break;
    case "heavyShot":
      playTone({ type: "sawtooth", frequency: 220, slideTo: 150, duration: 0.14, gain: 0.05 });
      break;
    case "heavyImpact":
      playTone({ type: "sawtooth", frequency: 140, slideTo: 70, duration: 0.18, gain: 0.07 });
      playTone({ type: "square", frequency: 520, slideTo: 220, duration: 0.09, gain: 0.035 });
      break;
    case "heavyChargeLow":
      playTone({ type: "triangle", frequency: 180, slideTo: 210, duration: 0.08, gain: 0.025 });
      break;
    case "heavyChargeMid":
      playTone({ type: "triangle", frequency: 230, slideTo: 300, duration: 0.09, gain: 0.03 });
      break;
    case "heavyChargeHigh":
      playTone({ type: "sawtooth", frequency: 320, slideTo: 480, duration: 0.1, gain: 0.04 });
      break;
    case "clusterShot":
      playTone({ type: "square", frequency: 980, slideTo: 680, duration: 0.06, gain: 0.03 });
      playTone({ type: "triangle", frequency: 420, slideTo: 260, duration: 0.1, gain: 0.02 });
      break;
    case "assaultWarn":
      playTone({ type: "sawtooth", frequency: 220, slideTo: 310, duration: 0.22, gain: 0.07 });
      playTone({ type: "square", frequency: 120, slideTo: 160, duration: 0.28, gain: 0.05 });
      break;
    case "bomberDrone":
      playTone({ type: "sawtooth", frequency: 96, slideTo: 70, duration: 0.52, gain: 0.07 });
      playTone({ type: "triangle", frequency: 148, slideTo: 112, duration: 0.46, gain: 0.045 });
      break;
    case "playerHit":
      playTone({ type: "square", frequency: 980, slideTo: 660, duration: 0.06, gain: 0.04 });
      playTone({ type: "triangle", frequency: 280, slideTo: 190, duration: 0.16, gain: 0.05 });
      break;
    case "pickup":
      playTone({ type: "triangle", frequency: 620, slideTo: 980, duration: 0.1, gain: 0.04 });
      break;
    case "hit":
      playTone({ type: "sawtooth", frequency: 180, slideTo: 90, duration: 0.12, gain: 0.05 });
      break;
    case "explode":
      playTone({ type: "sawtooth", frequency: 200, slideTo: 60, duration: 0.18, gain: 0.06 });
      playTone({ type: "triangle", frequency: 320, slideTo: 120, duration: 0.12, gain: 0.03 });
      break;
    case "spawn":
      playTone({ type: "triangle", frequency: 260, slideTo: 180, duration: 0.08, gain: 0.03 });
      break;
    case "finalBossAlarm":
      playTone({ type: "square", frequency: 180, slideTo: 140, duration: 0.45, gain: 0.08 });
      playTone({ type: "sawtooth", frequency: 440, slideTo: 260, duration: 0.28, gain: 0.05 });
      break;
    case "finalBossShot":
      playTone({ type: "sawtooth", frequency: 150, slideTo: 90, duration: 0.22, gain: 0.08 });
      playTone({ type: "triangle", frequency: 320, slideTo: 180, duration: 0.18, gain: 0.045 });
      break;
    case "finalBossChargedShot":
      playTone({ type: "sawtooth", frequency: 120, slideTo: 60, duration: 0.34, gain: 0.1 });
      playTone({ type: "square", frequency: 480, slideTo: 180, duration: 0.24, gain: 0.06 });
      break;
    case "phaseShift":
      playTone({ type: "triangle", frequency: 240, slideTo: 520, duration: 0.22, gain: 0.06 });
      playTone({ type: "sawtooth", frequency: 130, slideTo: 70, duration: 0.32, gain: 0.05 });
      break;
    case "victory":
      playTone({ type: "triangle", frequency: 392, slideTo: 523, duration: 0.18, gain: 0.05 });
      playTone({ type: "triangle", frequency: 523, slideTo: 659, duration: 0.22, gain: 0.055 });
      playTone({ type: "sine", frequency: 784, slideTo: 1046, duration: 0.32, gain: 0.045 });
      break;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function getInsetRect(entity, insetX, insetY = insetX) {
  return {
    x: entity.x + insetX,
    y: entity.y + insetY,
    width: Math.max(2, entity.width - insetX * 2),
    height: Math.max(2, entity.height - insetY * 2),
  };
}

function getRelativeRect(entity, box) {
  return {
    x: entity.x + entity.width * box.x,
    y: entity.y + entity.height * box.y,
    width: entity.width * box.width,
    height: entity.height * box.height,
  };
}

function isEnemyFullyVisible(enemy) {
  return (
    enemy.x >= 0 &&
    enemy.y >= 0 &&
    enemy.x + enemy.width <= GAME_WIDTH &&
    enemy.y + enemy.height <= GAME_HEIGHT
  );
}

function getPlayerHitbox() {
  return getRelativeRect(state.player, PLAYER_HITBOX);
}

function getEnemyBulletHitbox(bullet) {
  if (bullet.kind === "finalBossHeavy") {
    return getRelativeRect(bullet, { x: 0.18, y: 0.12, width: 0.64, height: 0.76 });
  }
  return getRelativeRect(bullet, { x: 0.22, y: 0.12, width: 0.56, height: 0.72 });
}

function getEnemyCollisionHitbox(enemy) {
  if (enemy.type === "finalBoss") {
    return getRelativeRect(enemy, { x: 0.19, y: 0.14, width: 0.62, height: 0.66 });
  }
  if (enemy.type === "boss") {
    return getRelativeRect(enemy, { x: 0.22, y: 0.18, width: 0.56, height: 0.58 });
  }
  if (enemy.type === "assault") {
    return getRelativeRect(enemy, { x: 0.22, y: 0.16, width: 0.56, height: 0.56 });
  }
  if (enemy.type === "supply") {
    return getRelativeRect(enemy, { x: 0.24, y: 0.2, width: 0.52, height: 0.54 });
  }
  if (enemy.type === "bomber") {
    return getRelativeRect(enemy, { x: 0.2, y: 0.18, width: 0.6, height: 0.58 });
  }
  return getRelativeRect(enemy, { x: 0.22, y: 0.18, width: 0.56, height: 0.58 });
}

function intersectsAssaultEnemy(enemy, playerHitbox) {
  const enemyCenter = {
    x: enemy.x + enemy.width / 2,
    y: enemy.y + enemy.height / 2,
  };
  const playerCenter = {
    x: playerHitbox.x + playerHitbox.width / 2,
    y: playerHitbox.y + playerHitbox.height / 2,
  };
  return distanceBetween(enemyCenter, playerCenter) <= Math.min(enemy.width, enemy.height) * 0.24 + Math.min(playerHitbox.width, playerHitbox.height) * 0.28;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomIntBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function getAmmoPickupAmount(type) {
  const weapon = WEAPONS[type];
  const variance = weapon.ammoVariance ?? 0;
  return randomIntBetween(Math.max(1, weapon.ammoGain - variance), weapon.ammoGain + variance);
}

function getPlayerAimAngle(extraAngle = 0) {
  return state.playerBank * PLAYER_SHOT_BANK_FACTOR + extraAngle;
}

function createPlayerBullet(x, y, width, height, vx, speed, damage, color, extraAngle = 0) {
  const angle = getPlayerAimAngle(extraAngle);
  const rotatedVx = vx * Math.cos(angle) - speed * Math.sin(angle);
  const rotatedVy = vx * Math.sin(angle) + speed * Math.cos(angle);
  return { owner: "player", x, y, width, height, vx: rotatedVx, vy: -rotatedVy, damage, color, angle };
}

function createHeavyBullet(player, chargeRatio) {
  const power = clamp(chargeRatio, 0.15, 1);
  const width = 12 + power * 8;
  const height = 28 + power * 16;
  const speed = 360 + power * 280;
  const damage = 2 + power * 6;
  const penetrating = power >= 0.85;
  const angle = getPlayerAimAngle();
  const velocityX = Math.sin(angle) * speed;
  const velocityY = -Math.cos(angle) * speed;
  return {
    owner: "player",
    kind: "heavy",
    x: player.x + player.width / 2 - width / 2,
    y: player.y - height + 4,
    width,
    height,
    vx: velocityX,
    vy: velocityY,
    damage,
    color: penetrating ? "#fff2c9" : "#ffb08a",
    speed,
    chargeRatio: power,
    penetrating,
    hitIds: [],
    angle,
  };
}

function createHomingMissile(x, y, targetId) {
  return {
    owner: "player",
    kind: "homing",
    x,
    y,
    width: 10,
    height: 20,
    vx: 0,
    vy: -260,
    damage: 3,
    color: "#a8caff",
    targetId,
    speed: 420,
    turnRate: 5.2,
  };
}

function createEnemyBullet(x, y, width, height, vx, vy, damage, color) {
  return { owner: "enemy", x, y, width, height, vx, vy, damage, color };
}

function createFinalBossHeavyBullet(enemy, chargeRatio) {
  const threshold = FINAL_BOSS_CONFIG.chargedThreshold;
  const charged = chargeRatio >= threshold;
  const power = clamp(chargeRatio, 0.15, 1);
  const width = 12 + power * 8;
  const height = 28 + power * 16;
  const originX = enemy.x + enemy.width / 2 - width / 2;
  const originY = enemy.y + enemy.height - 8;
  const dx = state.player.x + state.player.width / 2 - (enemy.x + enemy.width / 2);
  const dy = state.player.y + state.player.height / 2 - originY;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const speed = 360 + power * 280;
  const vx = (dx / length) * speed;
  const vy = (dy / length) * speed;
  return {
    owner: "enemy",
    kind: "finalBossHeavy",
    x: originX,
    y: originY,
    width,
    height,
    vx,
    vy,
    damage: charged ? FINAL_BOSS_CONFIG.chargedShotDamage : FINAL_BOSS_CONFIG.normalShotDamage,
    color: charged ? "#fff2c9" : "#ffb08a",
    chargeRatio,
    charged,
  };
}

function fireFinalBossRapid(enemy) {
  const centerX = enemy.x + enemy.width / 2;
  const originY = enemy.y + enemy.height - 12;
  const playerCenterX = state.player.x + state.player.width / 2;
  const playerCenterY = state.player.y + state.player.height / 2;
  const aimDx = playerCenterX - centerX;
  const aimDy = playerCenterY - originY;
  const length = Math.max(Math.hypot(aimDx, aimDy), 1);
  const speed = PLAYER_BULLET_SPEED + CONFIG.weapons.rapid.speedOffset;
  const vx = (aimDx / length) * speed;
  const vy = (aimDy / length) * speed;
  state.enemyBullets.push(
    createEnemyBullet(centerX - 18, originY, CONFIG.weapons.rapid.width, CONFIG.weapons.rapid.height, vx, vy, 1, CONFIG.weapons.rapid.color),
    createEnemyBullet(centerX + 14, originY, CONFIG.weapons.rapid.width, CONFIG.weapons.rapid.height, vx, vy, 1, CONFIG.weapons.rapid.color)
  );
  playSound("rapidShot");
}

function fireFinalBossSpread(enemy) {
  const centerX = enemy.x + enemy.width / 2;
  const originY = enemy.y + enemy.height - 14;
  const targetX = state.player.x + state.player.width / 2;
  const targetY = state.player.y + state.player.height / 2;
  const dx = targetX - centerX;
  const dy = targetY - originY;
  const baseAngle = Math.atan2(dy, dx);
  const spread = CONFIG.weapons.spread.sideAngle;
  const centerSpeed = PLAYER_BULLET_SPEED;
  const sideSpeed = PLAYER_BULLET_SPEED - CONFIG.weapons.spread.sideSpeedOffset;
  const bullets = [
    { angle: baseAngle - spread, width: CONFIG.weapons.spread.sideWidth, height: CONFIG.weapons.spread.sideHeight, speed: sideSpeed },
    { angle: baseAngle, width: CONFIG.weapons.spread.centerWidth, height: CONFIG.weapons.spread.centerHeight, speed: centerSpeed },
    { angle: baseAngle + spread, width: CONFIG.weapons.spread.sideWidth, height: CONFIG.weapons.spread.sideHeight, speed: sideSpeed },
  ];
  for (const bullet of bullets) {
    state.enemyBullets.push(
      createEnemyBullet(
        centerX - bullet.width / 2,
        originY,
        bullet.width,
        bullet.height,
        Math.cos(bullet.angle) * bullet.speed,
        Math.sin(bullet.angle) * bullet.speed,
        1,
        CONFIG.weapons.spread.color
      )
    );
  }
  playSound("spreadShot");
}

function createInitialState(mode = appState.lastMode) {
  return {
    player: {
      width: CONFIG.player.width,
      height: CONFIG.player.height,
      x: GAME_WIDTH / 2 - CONFIG.player.width / 2,
      y: GAME_HEIGHT - 88,
    },
    nextEnemyId: 1,
    bullets: [],
    enemyBullets: [],
    enemies: [],
    meteors: [],
    explosions: [],
    blastRings: [],
    assaultTrails: [],
    drops: [],
    score: 0,
    runningTime: 0,
    lives: 3,
    maxLives: 3,
    playerDestroyed: false,
    playerDeathTimer: 0,
    baseFireCooldown: 0,
    specialCooldowns: { rapid: 0, spread: 0, heavy: 0, cluster: 0 },
    ammo: { ...CONFIG.initialAmmo },
    currentWeaponLabel: WEAPONS.basic.label,
    activeSpecial: null,
    heavyCharging: false,
    heavyChargeTime: 0,
    heavyChargeStage: -1,
    heavyChargePulse: 0,
    heavyFullTimer: 0,
    clusterBurstTimer: 0,
    clusterShotTimer: 0,
    meteorCooldown: 0,
    enemyCooldown: 1.1,
    nextBossScore: 150,
    gameMode: mode,
    difficultyScale: appState.difficultyScale,
    running: false,
    gameOver: false,
    paused: false,
    playerInvulnerable: 0,
    playerBank: 0,
    playerPitch: 0,
    currentLevelIndex: mode === "campaign" ? START_LEVEL_INDEX : 0,
    announcedLevelIndex: mode === "campaign" ? START_LEVEL_INDEX : 0,
    finalBossSpawned: false,
    finalBossDefeated: false,
    finalBossPhaseActive: false,
    finalBossPhaseTwoTriggered: false,
    finalBossSpawnWarningShown: false,
    victory: false,
    finalBossHudHp: null,
    victoryPending: false,
    blackHole: null,
    endlessStage: 1,
    screenShakeTime: 0,
    screenShakePower: 0,
    damageFlash: 0,
    hitFlash: 0,
    warningText: "",
    warningColor: "#ffd29a",
    warningTimer: 0,
    stats: {
      shotsFired: 0,
      shotsHit: 0,
      enemiesDestroyed: 0,
      bossesDefeated: 0,
      pickups: 0,
      damageTaken: 0,
    },
  };
}

function resetGame() {
  state = createInitialState(appState.lastMode);
  updateHud();
  hideOverlay();
}

function startGame() {
  ensureAudio();
  if (state.gameOver) {
    state = createInitialState(state.gameMode || appState.lastMode);
  }

  state.running = true;
  state.paused = false;
  state.gameOver = false;
  hideOverlay();
  hideMenu();
  restartButton.textContent = "重新开始";
  updateHud();
}

function startMode(mode) {
  appState.lastMode = mode;
  state = createInitialState(mode);
  startGame();
}

function endGame() {
  state.running = false;
  state.gameOver = true;
  state.victory = false;
  const summary = isEndlessMode()
    ? `你在无尽模式中坚持到了第 ${state.endlessStage} 阶段。`
    : `本次任务已结束，记录已写入战报。`;
  showOverlay(`最终得分 ${state.score}`, "任务失败", summary, getResultCards());
  restartButton.textContent = "重新开始";
}

function endVictory() {
  state.running = false;
  state.gameOver = true;
  state.victory = true;
  showFlashMessage("终局目标已击落");
  showOverlay(`最终得分 ${state.score}`, "任务完成", "你完成了第三关终局战并穿过黑洞完成撤离。", getResultCards());
  restartButton.textContent = "重新开始";
}

function spawnVictoryBlackHole(x, y) {
  const config = FINAL_BOSS_CONFIG.blackHole;
  for (const enemy of state.enemies) {
    if (enemy.type === "finalBoss") {
      continue;
    }
    createExplosion(
      enemy.x + enemy.width / 2,
      enemy.y + enemy.height / 2,
      enemy.width * 0.8,
      enemy.type === "boss" ? "#cfbaff" : enemy.type === "assault" ? "#9ef0ac" : enemy.type === "supply" ? "#ffe18f" : enemy.type === "bomber" ? "#e6a6ff" : "#ffb28c"
    );
  }
  for (const meteor of state.meteors) {
    createExplosion(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, meteor.width * 0.7, "#b8aaa0");
  }
  state.finalBossPhaseActive = false;
  state.finalBossDefeated = true;
  state.finalBossHudHp = null;
  state.victoryPending = true;
  state.blackHole = {
    x,
    y,
    radius: config.radius,
    attractRadius: config.attractRadius,
    consumeRadius: config.consumeRadius,
    pullStrength: config.pullStrength,
    swirlStrength: config.swirlStrength,
    time: 0,
    sucking: false,
  };
  state.enemies = [];
  state.enemyBullets = [];
  state.bullets = [];
  state.meteors = [];
  state.drops = [];
  state.activeSpecial = null;
  state.heavyCharging = false;
  state.clusterBurstTimer = 0;
  state.clusterShotTimer = 0;
  state.currentWeaponLabel = "黑洞坍缩";
  showFlashMessage("黑洞形成，靠近后将被吸入");
}

function showOverlay(message, title = "飞机大战", summary = "", stats = []) {
  overlayTitleEl.textContent = title;
  messageEl.textContent = message;
  resultSummaryEl.textContent = summary;
  resultsPanelEl.classList.toggle("hidden", !summary && stats.length === 0);
  renderResultCards(stats);
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

function showFlashMessage(message) {
  flashMessage = message;
  flashMessageTimer = 1.2;
}

function updateHud() {
  const scoreText = String(state.score);
  const livesText = String(state.lives);
  const weaponText = state.currentWeaponLabel;
  const ammoText = `H:${state.ammo.rapid} J:${state.ammo.spread} K:${state.ammo.heavy} M:${state.ammo.cluster}`;
  const currentLevel = getCurrentLevel();
  const currentEvent = getCurrentEndlessEvent();
  const levelText = isFinalBossPhaseActive() && currentLevel.finalBoss?.showBossPhaseInHud
    ? `${currentLevel.name} 关底战`
    : Number.isFinite(currentLevel.durationSec)
      ? `${currentLevel.name} ${formatCountdown(Math.max(0, currentLevel.durationSec - getLevelElapsedTime()))}`
      : `${currentLevel.name} 无时间限制`;
  const eventText = isEndlessMode()
    ? `阶段 ${state.endlessStage} · ${currentEvent?.name ?? "标准战区"}`
    : state.enemies.some((enemy) => enemy.type === "boss")
      ? `Boss · ${state.enemies.find((enemy) => enemy.type === "boss")?.attackModeName ?? "压制"}`
      : isFinalBossPhaseActive()
        ? "终局交战中"
        : "标准战区";

  if (scoreText !== lastHudScore) {
    scoreEl.textContent = scoreText;
    lastHudScore = scoreText;
  }
  if (livesText !== lastHudLives) {
    livesEl.textContent = livesText;
    lastHudLives = livesText;
  }
  if (weaponText !== lastHudWeapon) {
    weaponEl.textContent = weaponText;
    lastHudWeapon = weaponText;
  }
  if (ammoText !== lastHudAmmo) {
    ammoEl.textContent = ammoText;
    lastHudAmmo = ammoText;
  }
  if (levelText !== lastHudLevel) {
    levelEl.textContent = levelText;
    lastHudLevel = levelText;
  }
  if (eventText !== lastHudEvent) {
    eventNameEl.textContent = eventText;
    lastHudEvent = eventText;
  }
  renderWeaponRack();
}

function getDifficultyLevel() {
  const level = getCurrentLevel();
  const scoreFactor = state.score / 220;
  const levelElapsed = getLevelElapsedTime();
  const survivalFactor = isEndlessMode() ? levelElapsed / 18 : levelElapsed / 24;
  const scaledDifficulty = (level.baseDifficulty + scoreFactor * 0.35 + survivalFactor * 0.25) * state.difficultyScale;
  return Math.min(isEndlessMode() ? 1.7 : 1.15, scaledDifficulty);
}

function getCurrentDropChance() {
  const event = getCurrentEndlessEvent();
  return clamp(DROP_CHANCE + (event?.dropChanceBonus ?? 0), 0, 0.85);
}

function getCurrentLevelIndex() {
  if (isEndlessMode()) {
    return 0;
  }
  let elapsed = state.runningTime;
  let index = START_LEVEL_INDEX;
  while (index < LEVELS.length - 1 && elapsed >= LEVELS[index].durationSec) {
    elapsed -= LEVELS[index].durationSec;
    index += 1;
  }
  return index;
}

function getCurrentLevel() {
  if (isEndlessMode()) {
    return ENDLESS_LEVEL;
  }
  return LEVELS[getCurrentLevelIndex()];
}

function getLevelElapsedTime() {
  if (isEndlessMode()) {
    return state.runningTime;
  }
  let elapsed = state.runningTime;
  let index = START_LEVEL_INDEX;
  while (index < LEVELS.length - 1 && elapsed >= LEVELS[index].durationSec) {
    elapsed -= LEVELS[index].durationSec;
    index += 1;
  }
  return elapsed;
}

function getFinalBoss() {
  return state.enemies.find((enemy) => enemy.type === "finalBoss") || null;
}

function isFinalBossPhaseActive() {
  return Boolean(state.finalBossPhaseActive && !state.finalBossDefeated);
}

function shouldSpawnFinalBoss() {
  if (isEndlessMode()) {
    return false;
  }
  const level = getCurrentLevel();
  return Boolean(
    FINAL_BOSS_CONFIG &&
    level.finalBoss &&
    getCurrentLevelIndex() === LEVELS.length - 1 &&
    !state.finalBossSpawned &&
    getLevelElapsedTime() >= level.finalBoss.spawnSec
  );
}

function updateFinalBossHudHp(delta) {
  const boss = getFinalBoss();
  if (!boss) {
    state.finalBossHudHp = null;
    return;
  }
  if (state.finalBossHudHp === null) {
    state.finalBossHudHp = boss.hp;
    return;
  }
  const followSpeed = boss.phaseTwo ? 18 : 10;
  state.finalBossHudHp += (boss.hp - state.finalBossHudHp) * Math.min(1, delta * followSpeed);
}

function updateVictoryBlackHole(delta) {
  if (!state.victoryPending || !state.blackHole || state.playerDestroyed) {
    return;
  }

  const hole = state.blackHole;
  hole.time += delta;

  const playerCenterX = state.player.x + state.player.width / 2;
  const playerCenterY = state.player.y + state.player.height / 2;
  const dx = hole.x - playerCenterX;
  const dy = hole.y - playerCenterY;
  const distance = Math.max(Math.hypot(dx, dy), 0.001);

  if (distance <= hole.attractRadius || hole.sucking) {
    hole.sucking = true;
    const pullRatio = clamp(1 - distance / hole.attractRadius, 0.15, 1);
    const radialSpeed = hole.pullStrength * (0.45 + pullRatio);
    const tangentX = -dy / distance;
    const tangentY = dx / distance;
    const moveX = (dx / distance) * radialSpeed + tangentX * hole.swirlStrength * pullRatio;
    const moveY = (dy / distance) * radialSpeed + tangentY * hole.swirlStrength * pullRatio;
    state.player.x = clamp(state.player.x + moveX * delta, 0, GAME_WIDTH - state.player.width);
    state.player.y = clamp(state.player.y + moveY * delta, 0, GAME_HEIGHT - state.player.height);
    state.playerBank += ((dx / distance) * 0.26 - state.playerBank) * Math.min(1, delta * 8);
    state.playerPitch += ((dy / distance) * 0.08 - state.playerPitch) * Math.min(1, delta * 6);
  }

  if (distance <= hole.consumeRadius) {
    playSound("victory");
    endVictory();
  }
}

function formatCountdown(seconds) {
  const totalSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainSeconds = totalSeconds % 60;
  return `${minutes}:${String(remainSeconds).padStart(2, "0")}`;
}

function isBomberRushActive() {
  const level = getCurrentLevel();
  if (!level.bomberRush) {
    return false;
  }
  const elapsed = getLevelElapsedTime();
  return elapsed >= level.bomberRush.startSec && elapsed <= level.bomberRush.startSec + level.bomberRush.durationSec;
}

function isAssaultRushActive() {
  const level = getCurrentLevel();
  if (!level.assaultRush) {
    return false;
  }
  const elapsed = getLevelElapsedTime();
  return elapsed >= level.assaultRush.startSec && elapsed <= level.assaultRush.startSec + level.assaultRush.durationSec;
}

function isMeteorBeltActive() {
  const level = getCurrentLevel();
  if (isEndlessMode()) {
    return Boolean(getCurrentEndlessEvent()?.forceMeteor);
  }
  if (!level.meteorBelt) {
    return false;
  }
  const elapsed = getLevelElapsedTime();
  return elapsed >= level.meteorBelt.startSec && elapsed <= level.meteorBelt.startSec + level.meteorBelt.durationSec;
}

function isMixedRushActive() {
  const level = getCurrentLevel();
  if (!level.mixedRush) {
    return false;
  }
  const elapsed = getLevelElapsedTime();
  return elapsed >= level.mixedRush.startSec && elapsed <= level.mixedRush.startSec + level.mixedRush.durationSec;
}

function getEnemySpawnInterval() {
  let interval = (1.78 - getDifficultyLevel() * 0.4) * getCurrentLevel().spawnIntervalMultiplier;
  const endlessEvent = getCurrentEndlessEvent();
  if (endlessEvent) {
    interval *= endlessEvent.spawnIntervalMultiplier ?? 1;
  }
  if (isBomberRushActive()) {
    interval *= getCurrentLevel().bomberRush.spawnIntervalMultiplier;
  }
  if (isAssaultRushActive()) {
    interval *= getCurrentLevel().assaultRush.spawnIntervalMultiplier;
  }
  if (isMixedRushActive()) {
    interval *= getCurrentLevel().mixedRush.spawnIntervalMultiplier;
  }
  if (isFinalBossPhaseActive()) {
    const finalBoss = getFinalBoss();
    const multiplier = finalBoss?.phaseTwo
      ? getCurrentLevel().finalBoss.phaseTwo.finalPhaseMinionSpawnMultiplier
      : getCurrentLevel().finalBoss.finalPhaseMinionSpawnMultiplier;
    interval *= multiplier;
  }
  if (state && state.enemies.some((enemy) => enemy.type === "boss")) {
    interval += 0.95;
  }
  return interval;
}

function getMeteorSpawnInterval() {
  const event = getCurrentEndlessEvent();
  if (isEndlessMode() && event?.forceMeteor) {
    return event.meteorSpawnInterval ?? 0.65;
  }
  return getCurrentLevel().meteorBelt.spawnInterval;
}

function getMeteorImageKey(hp) {
  return hp >= 3 ? "meteor3" : hp === 2 ? "meteor2" : "meteor1";
}

function getEnemySpeedRange() {
  const difficulty = getDifficultyLevel();
  const level = getCurrentLevel();
  return {
    min: (ENEMY_MIN_SPEED - 40 + difficulty * 80) * level.enemySpeedMultiplier,
    max: (ENEMY_MAX_SPEED - 70 + difficulty * 130) * level.enemySpeedMultiplier,
  };
}

function setActiveSpecial(type, enabled) {
  if (!enabled) {
    if (state.activeSpecial === type) {
      state.activeSpecial = null;
    }
    return;
  }

  state.activeSpecial = type;
}

function recordShotsFired(count) {
  state.stats.shotsFired += count;
}

function spawnBaseBullet() {
  const bullets = WEAPONS.basic.shoot(state.player);
  state.bullets.push(...bullets);
  recordShotsFired(bullets.length);
  if (!state.heavyCharging) {
    state.currentWeaponLabel = state.activeSpecial ? WEAPONS[state.activeSpecial].label : WEAPONS.basic.label;
  }
  playSound(WEAPONS.basic.sound);
}

function fireSpecialWeapon(type) {
  if (!state.running || state.paused || state.gameOver || state.activeSpecial !== type) {
    return;
  }

  const config = WEAPONS[type];
  if (type === "cluster") {
    fireClusterMissiles();
    return;
  }
  if (type === "heavy") {
    return;
  }
  if (state.ammo[type] <= 0) {
    showFlashMessage(`${config.label} 弹药不足`);
    state.activeSpecial = null;
    return;
  }

  if (state.specialCooldowns[type] > 0) {
    return;
  }

  const bullets = config.shoot(state.player);
  state.bullets.push(...bullets);
  recordShotsFired(bullets.length);
  state.specialCooldowns[type] = config.cooldown;
  state.ammo[type] -= 1;
  state.currentWeaponLabel = config.label;
  playSound(config.sound);
  updateHud();

  if (state.ammo[type] <= 0) {
    state.activeSpecial = null;
  }
}

function beginHeavyCharge() {
  if (!state.running || state.paused || state.gameOver || state.playerDestroyed) {
    return;
  }
  if (state.ammo.heavy <= 0) {
    showFlashMessage("K-重炮弹药不足");
    return;
  }
  if (state.specialCooldowns.heavy > 0 || state.heavyCharging) {
    return;
  }

  state.activeSpecial = "heavy";
  state.heavyCharging = true;
  state.heavyChargeTime = 0;
  state.heavyChargeStage = -1;
  state.heavyChargePulse = 0;
  state.heavyFullTimer = 0;
  state.currentWeaponLabel = "K-重炮蓄力 0%";
}

function releaseHeavyCharge() {
  if (!state.heavyCharging) {
    return;
  }

  const chargeRatio = clamp(state.heavyChargeTime / HEAVY_CHARGE_TIME, 0.15, 1);
  state.bullets.push(createHeavyBullet(state.player, chargeRatio));
  recordShotsFired(1);
  state.specialCooldowns.heavy = WEAPONS.heavy.cooldown;
  state.ammo.heavy -= 1;
  state.heavyCharging = false;
  state.heavyChargeTime = 0;
  state.heavyChargeStage = -1;
  state.heavyChargePulse = 0;
  state.heavyFullTimer = 0;
  state.activeSpecial = null;
  state.currentWeaponLabel = chargeRatio >= 0.85 ? "K-贯穿重炮" : "K-重炮";
  playSound(WEAPONS.heavy.sound);
  updateHud();
}

function fireClusterMissiles() {
  if (state.ammo.cluster <= 0) {
    showFlashMessage("M-集束导弹不足");
    if (state.activeSpecial === "cluster") {
      state.activeSpecial = null;
    }
    return;
  }

  if (state.specialCooldowns.cluster > 0) {
    return;
  }

  state.specialCooldowns.cluster = WEAPONS.cluster.cooldown;
  state.clusterBurstTimer = 5;
  state.clusterShotTimer = 0;
  state.ammo.cluster -= 1;
  state.currentWeaponLabel = WEAPONS.cluster.label;
  showFlashMessage("M-集束导弹启动");
  updateHud();

  if (state.ammo.cluster <= 0 && state.activeSpecial === "cluster") {
    state.activeSpecial = null;
  }
  state.activeSpecial = null;
}

function emitClusterMissiles() {
  const targets = state.enemies.filter((enemy) => enemy.y < GAME_HEIGHT && enemy.y + enemy.height > 0);
  if (targets.length === 0) {
    return;
  }

  const originX = state.player.x + state.player.width / 2 - 5;
  const originY = state.player.y - 14;
  const limit = Math.min(targets.length, 4);

  for (let index = 0; index < limit; index += 1) {
    const target = targets[index];
    state.bullets.push(createHomingMissile(originX + (index - (limit - 1) / 2) * 8, originY + index * 3, target.id));
  }
  recordShotsFired(limit);
  playSound(WEAPONS.cluster.sound);
}

function createBasicEnemy() {
  const speedRange = getEnemySpeedRange();
  return {
    id: state.nextEnemyId++,
    type: "enemy",
    hp: 1,
    maxHp: 1,
    width: 46,
    height: 54,
    x: randomBetween(12, GAME_WIDTH - 58),
    y: -64,
    speed: randomBetween(speedRange.min, speedRange.max),
    scoreValue: 10,
    imageKey: "enemy",
  };
}

function createAssaultEnemy() {
  const fromLeft = Math.random() > 0.5;
  const speed = (CONFIG.enemies.assaultBaseSpeed + getDifficultyLevel() * CONFIG.enemies.assaultDifficultySpeed) * getCurrentLevel().enemySpeedMultiplier;
  const startX = fromLeft ? -44 : GAME_WIDTH + 6;
  const startY = randomBetween(50, 180);
  const targetX = state.player.x + state.player.width / 2;
  const targetY = state.player.y + state.player.height / 2;
  const dx = targetX - startX;
  const dy = targetY - startY;
  const length = Math.max(Math.hypot(dx, dy), 1);
  const vx = (dx / length) * speed;
  const vy = (dy / length) * speed;
  const visibleX = fromLeft ? -38 : GAME_WIDTH;
  const timeUntilVisible = Math.max(0, (visibleX - startX) / Math.max(Math.abs(vx), 1));
  return {
    id: state.nextEnemyId++,
    type: "assault",
    hp: CONFIG.enemies.assaultHp,
    maxHp: CONFIG.enemies.assaultHp,
    width: 38,
    height: 44,
    x: startX,
    y: startY,
    targetX,
    targetY,
    angle: Math.atan2(dy, dx) + Math.PI / 2,
    vx,
    vy,
    warningTimer: Math.max(0, timeUntilVisible - 0.5),
    warningPlayed: false,
    scoreValue: 18,
    imageKey: "assault",
  };
}

function createSupplyEnemy() {
  return {
    id: state.nextEnemyId++,
    type: "supply",
    hp: 7,
    maxHp: 7,
    width: 58,
    height: 64,
    x: randomBetween(30, GAME_WIDTH - 88),
    y: 12,
    vx: Math.random() > 0.5 ? 90 : -90,
    auraRadius: SUPPLY_AURA_RADIUS,
    healPerSecond: SUPPLY_HEAL_PER_SECOND,
    scoreValue: 40,
    imageKey: "supply",
  };
}

function getSeparatedSpawnX(width, minX, maxX, avoidType) {
  const candidates = Array.from({ length: 8 }, () => randomBetween(minX, maxX));
  let bestX = candidates[0];
  let bestDistance = -1;

  for (const candidateX of candidates) {
    let nearest = Infinity;
    for (const enemy of state.enemies) {
      if (enemy.type !== avoidType) {
        continue;
      }
      const gap = Math.abs((candidateX + width / 2) - (enemy.x + enemy.width / 2));
      nearest = Math.min(nearest, gap);
    }
    if (nearest > bestDistance) {
      bestDistance = nearest;
      bestX = candidateX;
    }
  }

  return bestX;
}

function createBomberEnemy() {
  const width = 64;
  return {
    id: state.nextEnemyId++,
    type: "bomber",
    hp: CONFIG.enemies.bomberHp,
    maxHp: CONFIG.enemies.bomberHp,
    width,
    height: 64,
    x: getSeparatedSpawnX(width, 24, GAME_WIDTH - 88, "bomber"),
    y: -72,
    speed: (70 + getDifficultyLevel() * 50) * getCurrentLevel().enemySpeedMultiplier,
    soundPlayed: false,
    scoreValue: 30,
    blastRadius: BOMBER_BLAST_RADIUS,
    imageKey: "bomber",
  };
}

function createFinalBoss() {
  const width = Math.round(126 * FINAL_BOSS_CONFIG.sizeMultiplier);
  const height = Math.round(116 * FINAL_BOSS_CONFIG.sizeMultiplier);
  return {
    id: state.nextEnemyId++,
    type: "finalBoss",
    hp: FINAL_BOSS_CONFIG.baseHp,
    maxHp: FINAL_BOSS_CONFIG.baseHp,
    width,
    height,
    x: GAME_WIDTH / 2 - width / 2,
    y: -height - 20,
    speed: FINAL_BOSS_CONFIG.entrySpeed,
    vx: FINAL_BOSS_CONFIG.cruiseSpeed,
    vy: 0,
    anchorY: FINAL_BOSS_CONFIG.anchorY,
    chargeCooldown: randomBetween(FINAL_BOSS_CONFIG.chargeCooldownMin, FINAL_BOSS_CONFIG.chargeCooldownMax),
    chargeTimer: 0,
    chargeGoal: 0,
    rapidCooldown: FINAL_BOSS_CONFIG.rapidCooldown,
    spreadCooldown: FINAL_BOSS_CONFIG.spreadCooldown,
    summonCooldown: randomBetween(FINAL_BOSS_CONFIG.summonCooldownMin, FINAL_BOSS_CONFIG.summonCooldownMax),
    hitDropCooldown: 0,
    dashChanceTimer: 1,
    dashWarningTimer: 0,
    reentryTimer: 0,
    mode: "entry",
    phaseTwo: false,
    scoreValue: 800,
    imageKey: "finalBoss",
  };
}

function createMeteor() {
  const size = randomBetween(CONFIG.enemies.meteor.minSize, CONFIG.enemies.meteor.maxSize);
  return {
    id: state.nextEnemyId++,
    type: "meteor",
    hp: CONFIG.enemies.meteor.hp,
    maxHp: CONFIG.enemies.meteor.hp,
    width: size,
    height: size,
    x: randomBetween(14, GAME_WIDTH - size - 14),
    y: -size - randomBetween(10, 50),
    vx: randomBetween(-CONFIG.enemies.meteor.driftX, CONFIG.enemies.meteor.driftX),
    vy: randomBetween(CONFIG.enemies.meteor.minSpeedY, CONFIG.enemies.meteor.maxSpeedY),
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-1.2, 1.2),
    imageKey: getMeteorImageKey(CONFIG.enemies.meteor.hp),
  };
}

function spawnRegularEnemy() {
  const difficulty = getDifficultyLevel();
  const level = getCurrentLevel();
  const endlessEvent = getCurrentEndlessEvent();
  const roll = Math.random();
  const bomberRushActive = isBomberRushActive();
  const assaultRushActive = isAssaultRushActive();
  const mixedRushActive = isMixedRushActive();
  const finalBossPhase = isFinalBossPhaseActive();
  const assaultMultiplier = endlessEvent?.assaultChanceMultiplier ?? 1;
  const bomberMultiplier = endlessEvent?.bomberChanceMultiplier ?? 1;
  const supplyMultiplier = endlessEvent?.supplyChanceMultiplier ?? 1;
  let enemy;

  if (mixedRushActive && difficulty > 0.2) {
    const bomberThreshold = Math.min(0.46, 0.18 * level.specialEnemyChanceMultiplier * level.mixedRush.bomberChanceMultiplier * bomberMultiplier);
    const assaultThreshold = Math.min(0.82, bomberThreshold + 0.18 * level.specialEnemyChanceMultiplier * level.mixedRush.assaultChanceMultiplier * assaultMultiplier);
    if (roll < bomberThreshold) {
      enemy = createBomberEnemy();
    } else if (roll < assaultThreshold) {
      enemy = createAssaultEnemy();
    }
  }

  if (!enemy && assaultRushActive && difficulty > 0.18 && roll < Math.min(0.82, 0.18 * level.specialEnemyChanceMultiplier * level.assaultRush.assaultChanceMultiplier * assaultMultiplier)) {
    enemy = createAssaultEnemy();
  } else if (!enemy && bomberRushActive && difficulty > 0.2 && roll < Math.min(0.78, 0.24 * level.specialEnemyChanceMultiplier * level.bomberRush.bomberChanceMultiplier * bomberMultiplier)) {
    enemy = createBomberEnemy();
  } else if (!enemy && difficulty > 0.18 && roll < 0.18 * level.specialEnemyChanceMultiplier * assaultMultiplier) {
    enemy = createAssaultEnemy();
  } else if (!enemy && difficulty > 0.32 && roll < 0.24 * level.specialEnemyChanceMultiplier * bomberMultiplier) {
    enemy = createBomberEnemy();
  } else if (!enemy && !finalBossPhase && difficulty > 0.46 && !state.enemies.some((item) => item.type === "supply") && roll < 0.28 * level.specialEnemyChanceMultiplier * supplyMultiplier) {
    enemy = createSupplyEnemy();
  } else if (!enemy) {
    enemy = createBasicEnemy();
  }

  if (enemy.type === "assault" && enemy.warningTimer <= 0) {
    playSound("assaultWarn");
    enemy.warningPlayed = true;
  }
  if (enemy.type === "bomber") {
    playSound("bomberDrone");
    enemy.soundPlayed = true;
  }

  state.enemies.push(enemy);
}

function spawnBoss() {
  const attackMode = BOSS_ATTACK_MODES[(state.stats.bossesDefeated + Math.floor(state.score / 220)) % BOSS_ATTACK_MODES.length];
  const bossHp = Math.round(
    (CONFIG.enemies.boss.baseHp + Math.floor(state.score / CONFIG.enemies.boss.hpScoreStep) * CONFIG.enemies.boss.hpStep) *
    getCurrentLevel().bossHpMultiplier *
    (0.88 + state.difficultyScale * 0.12)
  );
  state.enemies.push({
    id: state.nextEnemyId++,
    type: "boss",
    hp: bossHp,
    maxHp: bossHp,
    width: 126,
    height: 116,
    x: GAME_WIDTH / 2 - 63,
    y: -120,
    speed: BOSS_ENTRY_SPEED,
    vx: BOSS_HORIZONTAL_SPEED,
    fireCooldown: 0.8,
    attackMode: attackMode.key,
    attackModeName: attackMode.name,
    attackModeColor: attackMode.color,
    scoreValue: 150,
    imageKey: "boss",
  });
  state.nextBossScore += 220;
  pushWarning(`普通 Boss 进入${attackMode.name}`, attackMode.color, 1.6);
  showFlashMessage(`Boss：${attackMode.name}`);
  playSound("spawn");
}

function spawnFinalBoss() {
  state.enemies = state.enemies.filter((enemy) => enemy.type !== "boss");
  const boss = createFinalBoss();
  state.enemies.push(boss);
  state.finalBossHudHp = boss.hp;
  state.finalBossSpawned = true;
  state.finalBossPhaseActive = true;
  state.finalBossPhaseTwoTriggered = false;
  showFlashMessage("终局大 boss 接近");
  playSound("finalBossAlarm");
}

function maybeSpawnDrop(x, y, forceDrop = false) {
  if (!forceDrop) {
    return;
  }

  const roll = Math.random();
  const type = roll < 0.34 ? "life" : roll < 0.54 ? "rapid" : roll < 0.77 ? "spread" : "heavy";
  const meta = DROP_TYPES[type];
  state.drops.push({
    type,
    color: meta.color,
    imageKey: meta.imageKey,
    x: x - 13,
    y: y - 13,
    width: 26,
    height: 26,
    vy: 110,
    life: DROP_LIFE,
    maxLife: DROP_LIFE,
  });
}

function spawnDropByType(type, x, y) {
  const meta = DROP_TYPES[type];
  const size = type === "cluster" ? 28 : 26;
  state.drops.push({
    type,
    color: meta.color,
    imageKey: meta.imageKey,
    x: x - size / 2,
    y: y - size / 2,
    width: size,
    height: size,
    vy: 110,
    life: DROP_LIFE,
    maxLife: DROP_LIFE,
  });
}

function maybeSpawnBossDrop(x, y) {
  const dropTypes = [];
  if (Math.random() < 0.24) {
    dropTypes.push("cluster");
  } else {
    const ordinaryRoll = Math.random();
    dropTypes.push(ordinaryRoll < 0.34 ? "life" : ordinaryRoll < 0.54 ? "rapid" : ordinaryRoll < 0.77 ? "spread" : "heavy");
  }

  if (Math.random() < 0.3) {
    const extraRoll = Math.random();
    dropTypes.push(extraRoll < 0.34 ? "life" : extraRoll < 0.54 ? "rapid" : extraRoll < 0.77 ? "spread" : "heavy");
  }

  dropTypes.forEach((type, index) => {
    spawnDropByType(type, x + (index - (dropTypes.length - 1) / 2) * 22, y);
  });
}

function maybeSpawnFinalBossHitDrop(enemy) {
  if (enemy.type !== "finalBoss" || FINAL_BOSS_HIT_DROP_CHANCE <= 0 || enemy.hitDropCooldown > 0) {
    return;
  }
  if (Math.random() > FINAL_BOSS_HIT_DROP_CHANCE) {
    return;
  }
  enemy.hitDropCooldown = FINAL_BOSS_HIT_DROP_COOLDOWN;
  const roll = Math.random();
  const type = roll < 0.32 ? "life" : roll < 0.54 ? "rapid" : roll < 0.78 ? "spread" : "heavy";
  spawnDropByType(type, enemy.x + enemy.width / 2, enemy.y + enemy.height * 0.7);
}

function createExplosion(x, y, size, color) {
  const count = Math.max(10, Math.floor(size / 3));
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + randomBetween(-0.2, 0.2);
    const speed = randomBetween(45, 160);
    const life = randomBetween(0.25, 0.55);
    state.explosions.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: randomBetween(2, 5),
      life,
      maxLife: life,
      color,
    });
  }
}

function createBlastRing(x, y, radius, color) {
  state.blastRings.push({
    x,
    y,
    radius,
    life: 0.55,
    maxLife: 0.55,
    color,
  });
}

function explodeBomber(enemy) {
  const center = {
    x: enemy.x + enemy.width / 2,
    y: enemy.y + enemy.height / 2,
  };

  createExplosion(center.x, center.y, enemy.blastRadius * 0.8, "#f0b0ff");
  createBlastRing(center.x, center.y, enemy.blastRadius, "rgba(210, 140, 255, 0.35)");
  playSound("explode");

  const survivors = [];
  const chainedBombers = [];
  for (const other of state.enemies) {
    if (other === enemy) {
      continue;
    }

    if (other.type === "finalBoss") {
      survivors.push(other);
      continue;
    }

    const otherCenter = {
      x: other.x + other.width / 2,
      y: other.y + other.height / 2,
    };

    if (distanceBetween(center, otherCenter) <= enemy.blastRadius) {
      destroyEnemy(other, true, false);
      if (other.type === "bomber") {
        chainedBombers.push(other);
      }
      continue;
    }

    survivors.push(other);
  }
  state.enemies = survivors;

  for (const chained of chainedBombers) {
    explodeBomber(chained);
  }

  const playerCenter = {
    x: state.player.x + state.player.width / 2,
    y: state.player.y + state.player.height / 2,
  };

  if (distanceBetween(center, playerCenter) <= enemy.blastRadius) {
    damagePlayer(1);
  }
}

function destroyEnemy(enemy, skipDrop = false, triggerBomberBlast = true) {
  if (enemy.type === "finalBoss") {
    state.finalBossDefeated = true;
    state.finalBossPhaseActive = false;
  }
  state.stats.enemiesDestroyed += 1;
  if (enemy.type === "boss" || enemy.type === "finalBoss") {
    state.stats.bossesDefeated += 1;
  }
  state.score += enemy.scoreValue;
  addScreenShake(enemy.type === "finalBoss" ? 8 : enemy.type === "boss" ? 5 : 2.4, enemy.type === "finalBoss" ? 0.42 : 0.16);
  createExplosion(
    enemy.x + enemy.width / 2,
    enemy.y + enemy.height / 2,
    enemy.width,
    enemy.type === "finalBoss" ? "#7bffbf" : enemy.type === "boss" ? "#cfbaff" : enemy.type === "assault" ? "#9ef0ac" : enemy.type === "supply" ? "#ffe18f" : enemy.type === "bomber" ? "#e6a6ff" : "#ffb28c"
  );
  if (enemy.type === "finalBoss") {
    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width * 1.2, "#9ef7d0");
    createBlastRing(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width * 0.7, "rgba(132, 255, 194, 0.6)");
  }

  if (!skipDrop) {
    const dropX = enemy.x + enemy.width / 2;
    const dropY = enemy.y + enemy.height / 2;
    if (enemy.type === "finalBoss") {
      maybeSpawnBossDrop(dropX, dropY);
      if (Math.random() < 0.3) {
        maybeSpawnBossDrop(dropX + 26, dropY + 8);
      }
    } else if (enemy.type === "boss") {
      maybeSpawnBossDrop(dropX, dropY);
    } else {
      const isSpecial = enemy.type === "assault" || enemy.type === "supply" || enemy.type === "bomber";
      const canDrop = isSpecial ? Math.random() <= getCurrentDropChance() : enemy.type === "enemy" && Math.random() < 0.1;
      maybeSpawnDrop(dropX, dropY, canDrop);
    }
  }

  playSound("explode");

  if (enemy.type === "bomber" && triggerBomberBlast) {
    explodeBomber(enemy);
  }

  if (enemy.type === "finalBoss") {
    spawnVictoryBlackHole(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
  }
}

function getMoveVector() {
  const left = keys.has("ArrowLeft") || keys.has("KeyA") || touchState.left;
  const right = keys.has("ArrowRight") || keys.has("KeyD") || touchState.right;
  const up = keys.has("ArrowUp") || keys.has("KeyW") || touchState.up;
  const down = keys.has("ArrowDown") || keys.has("KeyS") || touchState.down;
  return { x: Number(right) - Number(left), y: Number(down) - Number(up) };
}

function updateHeavyCharge(delta) {
  if (!state.heavyCharging) {
    return;
  }

  state.heavyChargeTime = Math.min(state.heavyChargeTime + delta, HEAVY_CHARGE_TIME);
  const ratio = clamp(state.heavyChargeTime / HEAVY_CHARGE_TIME, 0, 1);
  if (ratio >= 1) {
    state.heavyFullTimer += delta;
    if (state.heavyFullTimer >= HEAVY_AUTO_RELEASE_DELAY) {
      releaseHeavyCharge();
      return;
    }
  } else {
    state.heavyFullTimer = 0;
  }
  const stage = ratio < 0.4 ? 0 : ratio < 0.85 ? 1 : 2;
  if (stage !== state.heavyChargeStage) {
    playSound(stage === 0 ? "heavyChargeLow" : stage === 1 ? "heavyChargeMid" : "heavyChargeHigh");
    state.heavyChargeStage = stage;
    state.heavyChargePulse = ratio < 0.4 ? 0.42 : ratio < 0.85 ? 0.28 : 0.15;
  }

  state.heavyChargePulse -= delta;
  const pulseInterval = ratio < 0.4 ? 0.42 : ratio < 0.85 ? 0.28 : 0.15;
  if (state.heavyChargePulse <= 0) {
    playSound(stage === 0 ? "heavyChargeLow" : stage === 1 ? "heavyChargeMid" : "heavyChargeHigh");
    state.heavyChargePulse = pulseInterval;
  }
  state.currentWeaponLabel = ratio >= 1 ? "K-蓄力 100%" : `K-蓄力 ${Math.round(ratio * 100)}%`;
}

function updateStars(delta) {
  for (const star of stars) {
    star.y += star.speed * delta;
    if (star.y > GAME_HEIGHT) {
      star.y = -star.size;
      star.x = Math.random() * GAME_WIDTH;
    }
  }
}

function updateExplosions(delta) {
  for (const spark of state.explosions) {
    spark.x += spark.vx * delta;
    spark.y += spark.vy * delta;
    spark.life -= delta;
    spark.radius = Math.max(spark.radius - delta * 3.5, 0);
  }
  state.explosions = state.explosions.filter((spark) => spark.life > 0 && spark.radius > 0);

  for (const ring of state.blastRings) {
    ring.life -= delta;
  }
  state.blastRings = state.blastRings.filter((ring) => ring.life > 0);

  for (const trail of state.assaultTrails) {
    trail.life -= delta;
  }
  state.assaultTrails = state.assaultTrails.filter((trail) => trail.life > 0);
}

function applySupplyHealing(delta) {
  const suppliers = state.enemies.filter((enemy) => enemy.type === "supply");
  if (suppliers.length === 0) {
    return;
  }

  for (const supplier of suppliers) {
    const center = {
      x: supplier.x + supplier.width / 2,
      y: supplier.y + supplier.height / 2,
    };
    for (const enemy of state.enemies) {
      if (enemy.hp >= enemy.maxHp) {
        continue;
      }
      const enemyCenter = {
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
      };
      if (distanceBetween(center, enemyCenter) <= supplier.auraRadius) {
        enemy.hp = Math.min(enemy.maxHp, enemy.hp + supplier.healPerSecond * delta);
      }
    }
  }
}

function updateMeteors(delta) {
  for (const meteor of state.meteors) {
    meteor.x += meteor.vx * delta;
    meteor.y += meteor.vy * delta;
    meteor.rotation += meteor.rotationSpeed * delta;
    if (meteor.x <= 8 || meteor.x + meteor.width >= GAME_WIDTH - 8) {
      meteor.vx *= -1;
      meteor.x = clamp(meteor.x, 8, GAME_WIDTH - meteor.width - 8);
    }
  }

  state.meteors = state.meteors.filter((meteor) => meteor.y <= GAME_HEIGHT + meteor.height + 30 && meteor.hp > 0);
}

function damageMeteor(meteor, amount) {
  meteor.hp -= amount;
  if (meteor.hp > 0) {
    meteor.imageKey = getMeteorImageKey(meteor.hp);
    createExplosion(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, meteor.width * 0.26, "#b8aaa0");
    createBlastRing(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, meteor.width * 0.14, "rgba(214, 196, 180, 0.35)");
    return false;
  }

  createExplosion(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2, meteor.width * 0.7, "#b8aaa0");
  meteor.hp = 0;
  return true;
}

function damageEnemyByMeteor(enemy, amount) {
  if (enemy.type === "finalBoss") {
    createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width * 0.18, "#b8aaa0");
    return false;
  }
  enemy.hp -= amount;
  if (enemy.hp > 0) {
    return false;
  }
  destroyEnemy(enemy, true, enemy.type !== "bomber");
  return true;
}

function updateDrops(delta) {
  for (const drop of state.drops) {
    drop.y += drop.vy * delta;
    drop.life -= delta;
  }

  const remaining = [];
  for (const drop of state.drops) {
    if (drop.y > GAME_HEIGHT + 30 || drop.life <= 0) {
      continue;
    }

    if (intersects(drop, state.player)) {
      state.stats.pickups += 1;
      if (drop.type === "life") {
        state.lives = Math.min(state.maxLives, state.lives + 1);
        showFlashMessage("生命 +1");
      } else if (drop.type === "cluster") {
        state.ammo.cluster += WEAPONS.cluster.ammoGain;
        showFlashMessage("M-集束导弹 +1");
      } else {
        const ammoGain = getAmmoPickupAmount(drop.type);
        state.ammo[drop.type] += ammoGain;
        showFlashMessage(`${WEAPONS[drop.type].label} +${ammoGain}`);
      }
      playSound("pickup");
      updateHud();
      continue;
    }

    remaining.push(drop);
  }

  state.drops = remaining;
}

function damagePlayer(amount) {
  if (state.playerInvulnerable > 0 || state.gameOver || state.playerDestroyed) {
    return;
  }

  state.lives -= amount;
  state.stats.damageTaken += amount;
  state.playerInvulnerable = PLAYER_INVULNERABLE_TIME;
  state.damageFlash = Math.min(1, state.damageFlash + 0.75);
  addScreenShake(5.5, 0.25);
  playSound("playerHit");
  showFlashMessage(`机体受损 -${amount}`);
  pushWarning("机体受损，立即规避", "#ff8b8b", 1.1);
  updateHud();

  if (state.lives <= 0) {
    createExplosion(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, state.player.width + 20, "#ffd7a3");
    createExplosion(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, state.player.width + 34, "#ff9468");
    playSound("explode");
    state.playerDestroyed = true;
    state.playerDeathTimer = 0.8;
  }
}

function destroyPlayerImmediately() {
  if (state.gameOver || state.playerDestroyed) {
    return;
  }
  state.playerInvulnerable = 0;
  state.lives = 0;
  state.stats.damageTaken += 1;
  state.damageFlash = 1;
  addScreenShake(8, 0.32);
  playSound("playerHit");
  showFlashMessage("机体被击毁");
  updateHud();
  createExplosion(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, state.player.width + 24, "#ffd7a3");
  createExplosion(state.player.x + state.player.width / 2, state.player.y + state.player.height / 2, state.player.width + 38, "#ff9468");
  playSound("explode");
  state.playerDestroyed = true;
  state.playerDeathTimer = 0.8;
}

function updatePlayerBullets(delta) {
  for (const bullet of state.bullets) {
    if (bullet.kind === "homing") {
      const target = state.enemies.find((enemy) => enemy.id === bullet.targetId);
      if (target) {
        const targetX = target.x + target.width / 2 - bullet.width / 2;
        const targetY = target.y + target.height / 2 - bullet.height / 2;
        const desiredX = targetX - bullet.x;
        const desiredY = targetY - bullet.y;
        const length = Math.max(Math.hypot(desiredX, desiredY), 1);
        const desiredVx = (desiredX / length) * bullet.speed;
        const desiredVy = (desiredY / length) * bullet.speed;
        bullet.vx += (desiredVx - bullet.vx) * bullet.turnRate * delta;
        bullet.vy += (desiredVy - bullet.vy) * bullet.turnRate * delta;
      }
    }

    bullet.x += bullet.vx * delta;
    bullet.y += bullet.vy * delta;
  }

  state.bullets = state.bullets.filter((bullet) => (
    bullet.y + bullet.height >= -30 &&
    bullet.x + bullet.width >= -30 &&
    bullet.x <= GAME_WIDTH + 30
  ));
}

function updateEnemyBullets(delta) {
  for (const bullet of state.enemyBullets) {
    bullet.x += bullet.vx * delta;
    bullet.y += bullet.vy * delta;
  }

  state.enemyBullets = state.enemyBullets.filter((bullet) => (
    bullet.y <= GAME_HEIGHT + 30 &&
    bullet.x + bullet.width >= -30 &&
    bullet.x <= GAME_WIDTH + 30
  ));
}

function resetFinalBossChargeCooldown(enemy) {
  const multiplier = enemy.phaseTwo ? FINAL_BOSS_CONFIG.phaseTwo.chargeCooldownMultiplier : 1;
  enemy.chargeCooldown = randomBetween(FINAL_BOSS_CONFIG.chargeCooldownMin, FINAL_BOSS_CONFIG.chargeCooldownMax) * multiplier;
}

function resetFinalBossSummonCooldown(enemy) {
  const multiplier = enemy.phaseTwo ? FINAL_BOSS_CONFIG.phaseTwo.summonCooldownMultiplier : 1;
  enemy.summonCooldown = randomBetween(FINAL_BOSS_CONFIG.summonCooldownMin, FINAL_BOSS_CONFIG.summonCooldownMax) * multiplier;
}

function getFinalBossRapidCooldown(enemy) {
  return FINAL_BOSS_CONFIG.rapidCooldown * (enemy.phaseTwo ? FINAL_BOSS_CONFIG.phaseTwo.rapidCooldownMultiplier : 1);
}

function getFinalBossSpreadCooldown(enemy) {
  return FINAL_BOSS_CONFIG.spreadCooldown * (enemy.phaseTwo ? FINAL_BOSS_CONFIG.phaseTwo.spreadCooldownMultiplier : 1);
}

function summonFinalBossSupply(enemy) {
  const supply = createSupplyEnemy();
  supply.x = clamp(enemy.x + enemy.width / 2 - supply.width / 2 + randomBetween(-48, 48), 18, GAME_WIDTH - supply.width - 18);
  supply.y = Math.max(10, enemy.y + enemy.height * 0.2);
  state.enemies.push(supply);
}

function beginFinalBossDash(enemy) {
  const dx = state.player.x + state.player.width / 2 - (enemy.x + enemy.width / 2);
  const dy = state.player.y + state.player.height / 2 - (enemy.y + enemy.height / 2);
  const length = Math.max(Math.hypot(dx, dy), 1);
  const dashSpeed = enemy.phaseTwo ? FINAL_BOSS_CONFIG.phaseTwo.dashSpeed : FINAL_BOSS_CONFIG.dashSpeed;
  enemy.vx = (dx / length) * dashSpeed;
  enemy.vy = (dy / length) * dashSpeed;
  enemy.mode = "dash";
}

function reenterFinalBoss(enemy) {
  const sideRoll = Math.random();
  if (sideRoll < 0.33) {
    enemy.x = -enemy.width - 12;
    enemy.y = randomBetween(50, 180);
  } else if (sideRoll < 0.66) {
    enemy.x = GAME_WIDTH + 12;
    enemy.y = randomBetween(50, 180);
  } else {
    enemy.x = randomBetween(28, GAME_WIDTH - enemy.width - 28);
    enemy.y = -enemy.height - 16;
  }
  const targetX = clamp(state.player.x + state.player.width / 2 - enemy.width / 2, 20, GAME_WIDTH - enemy.width - 20);
  const targetY = FINAL_BOSS_CONFIG.anchorY;
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const length = Math.max(Math.hypot(dx, dy), 1);
  enemy.vx = (dx / length) * FINAL_BOSS_CONFIG.entrySpeed * 1.45;
  enemy.vy = (dy / length) * FINAL_BOSS_CONFIG.entrySpeed * 1.45;
  enemy.mode = "reentry";
}

function fireBossPattern(enemy, difficulty, level) {
  const centerX = enemy.x + enemy.width / 2;
  const originY = enemy.y + enemy.height - 8;
  const dx = state.player.x + state.player.width / 2 - centerX;
  const dy = state.player.y + state.player.height / 2 - originY;
  const length = Math.max(Math.hypot(dx, dy), 1);

  if (enemy.attackMode === "sniper") {
    const speed = 390 + difficulty * 70;
    state.enemyBullets.push(
      createEnemyBullet(centerX - 5, originY - 2, 10, 22, (dx / length) * speed, (dy / length) * speed, 2, "#ffd7a3")
    );
    pushWarning("Boss 狙击锁定", enemy.attackModeColor, 0.8);
    addScreenShake(3.4, 0.12);
    enemy.fireCooldown = BOSS_ATTACK_MODES[0].cooldown * level.bossFireCooldownMultiplier;
    return;
  }

  if (enemy.attackMode === "spread") {
    const speed = 228 + difficulty * 22;
    for (const angleOffset of [-0.5, -0.22, 0, 0.22, 0.5]) {
      const baseAngle = Math.atan2(dy, dx) + angleOffset;
      state.enemyBullets.push(
        createEnemyBullet(centerX - 3, originY, 7, 14, Math.cos(baseAngle) * speed, Math.sin(baseAngle) * speed, 1, "#ff8f7d")
      );
    }
    enemy.fireCooldown = BOSS_ATTACK_MODES[1].cooldown * level.bossFireCooldownMultiplier;
    return;
  }

  if (!enemy.burstShotsLeft || enemy.burstShotsLeft <= 0) {
    enemy.burstShotsLeft = 3;
  }
  const burstSpread = enemy.burstShotsLeft === 3 ? 0.14 : enemy.burstShotsLeft === 2 ? -0.08 : 0.08;
  const baseAngle = Math.atan2(dy, dx) + burstSpread;
  const speed = 245 + difficulty * 24;
  state.enemyBullets.push(
    createEnemyBullet(centerX - 4, originY, 8, 16, Math.cos(baseAngle) * speed, Math.sin(baseAngle) * speed, 1, "#c6b4ff")
  );
  enemy.burstShotsLeft -= 1;
  enemy.fireCooldown = enemy.burstShotsLeft > 0 ? 0.18 : BOSS_ATTACK_MODES[2].cooldown * level.bossFireCooldownMultiplier;
  if (enemy.burstShotsLeft <= 0) {
    enemy.burstShotsLeft = 0;
  }
}

function updateEnemies(delta) {
  const difficulty = getDifficultyLevel();
  const level = getCurrentLevel();
  const survivors = [];
  const pendingBomberBlasts = [];
  const boss = getFinalBoss() || state.enemies.find((enemy) => enemy.type === "boss");

  for (const enemy of state.enemies) {
    if (enemy.burnTime > 0) {
      enemy.burnTime = Math.max(enemy.burnTime - delta, 0);
      enemy.hp -= enemy.burnDamage * delta;
      if (enemy.hp <= 0) {
        destroyEnemy(enemy, false, enemy.type !== "bomber");
        if (enemy.type === "bomber") {
          pendingBomberBlasts.push(enemy);
        }
        continue;
      }
    }

    if (enemy.type === "boss") {
      if (enemy.y < 56) {
        enemy.y += enemy.speed * delta;
      } else {
        enemy.x += enemy.vx * delta;
        if (enemy.x <= 14 || enemy.x + enemy.width >= GAME_WIDTH - 14) {
          enemy.vx *= -1;
          enemy.x = clamp(enemy.x, 14, GAME_WIDTH - enemy.width - 14);
        }
      }

      enemy.fireCooldown -= delta;
      if (enemy.fireCooldown <= 0) {
        fireBossPattern(enemy, difficulty, level);
      }
      survivors.push(enemy);
      continue;
    }

    if (enemy.type === "finalBoss") {
      enemy.hitDropCooldown = Math.max(0, enemy.hitDropCooldown - delta);
      if (!enemy.phaseTwo && enemy.hp / enemy.maxHp <= FINAL_BOSS_CONFIG.phaseTwo.triggerHpRatio) {
        state.finalBossHudHp = enemy.hp;
        enemy.phaseTwo = true;
        enemy.imageKey = "finalBossPhaseTwo";
        state.finalBossPhaseTwoTriggered = true;
        enemy.hp = Math.max(enemy.hp, enemy.maxHp * 0.8);
        showFlashMessage("终局大 boss 二阶段");
        playSound("phaseShift");
      }

      if (enemy.mode === "entry") {
        enemy.y += enemy.speed * delta;
        if (enemy.y >= enemy.anchorY) {
          enemy.y = enemy.anchorY;
          enemy.mode = "cruise";
          enemy.vx = FINAL_BOSS_CONFIG.cruiseSpeed;
          enemy.vy = 0;
        }
      } else if (enemy.mode === "cruise") {
        enemy.x += enemy.vx * delta;
        if (enemy.x <= 10 || enemy.x + enemy.width >= GAME_WIDTH - 10) {
          enemy.vx *= -1;
          enemy.x = clamp(enemy.x, 10, GAME_WIDTH - enemy.width - 10);
        }

        enemy.chargeCooldown -= delta;
        enemy.rapidCooldown -= delta;
        enemy.spreadCooldown -= delta;
        enemy.summonCooldown -= delta;
        enemy.dashChanceTimer -= delta;

        if (enemy.summonCooldown <= 0 && !state.enemies.some((item) => item.type === "supply")) {
          summonFinalBossSupply(enemy);
          resetFinalBossSummonCooldown(enemy);
        }

        if (enemy.chargeCooldown <= 0) {
          enemy.mode = "charging";
          enemy.chargeTimer = 0;
          const bias = enemy.phaseTwo ? FINAL_BOSS_CONFIG.phaseTwo.chargedBias : 0;
          enemy.chargeGoal = clamp(randomBetween(0.38 + bias, 1), 0.35, 1);
        } else if (enemy.spreadCooldown <= 0) {
          fireFinalBossSpread(enemy);
          enemy.spreadCooldown = getFinalBossSpreadCooldown(enemy);
        } else if (enemy.rapidCooldown <= 0) {
          fireFinalBossRapid(enemy);
          enemy.rapidCooldown = getFinalBossRapidCooldown(enemy);
        } else if (enemy.dashChanceTimer <= 0) {
          const chance = FINAL_BOSS_CONFIG.dashChancePerSecond * (enemy.phaseTwo ? FINAL_BOSS_CONFIG.phaseTwo.dashChanceMultiplier : 1);
          enemy.dashChanceTimer = 1;
          if (Math.random() < chance) {
            enemy.mode = "dashWarn";
            enemy.dashWarningTimer = 0.45;
            showFlashMessage("终局大 boss 冲刺预警");
            pushWarning("终局大 Boss 冲刺预警", "#ff9f80", 1);
            playSound("finalBossAlarm");
          }
        }
      } else if (enemy.mode === "charging") {
        enemy.chargeTimer += delta;
        enemy.x += enemy.vx * delta * 0.18;
        if (enemy.x <= 10 || enemy.x + enemy.width >= GAME_WIDTH - 10) {
          enemy.vx *= -1;
          enemy.x = clamp(enemy.x, 10, GAME_WIDTH - enemy.width - 10);
        }
        const ratio = clamp(enemy.chargeTimer / FINAL_BOSS_CONFIG.chargeTime, 0, 1);
        if (ratio >= enemy.chargeGoal) {
          const bullet = createFinalBossHeavyBullet(enemy, ratio);
          state.enemyBullets.push(bullet);
          playSound(bullet.charged ? "finalBossChargedShot" : "finalBossShot");
          enemy.mode = "cruise";
          resetFinalBossChargeCooldown(enemy);
          enemy.rapidCooldown = Math.max(enemy.rapidCooldown, getFinalBossRapidCooldown(enemy) * 0.84);
          enemy.spreadCooldown = Math.max(enemy.spreadCooldown, getFinalBossSpreadCooldown(enemy) * 0.64);
        }
      } else if (enemy.mode === "dashWarn") {
        enemy.dashWarningTimer -= delta;
        if (enemy.dashWarningTimer <= 0) {
          beginFinalBossDash(enemy);
        }
      } else if (enemy.mode === "dash") {
        state.assaultTrails.push({
          kind: "finalBoss",
          phaseTwo: enemy.phaseTwo,
          x: enemy.x + enemy.width / 2,
          y: enemy.y + enemy.height / 2,
          radius: FINAL_BOSS_TRAIL_RADIUS,
          life: FINAL_BOSS_TRAIL_LIFE,
          maxLife: FINAL_BOSS_TRAIL_LIFE,
        });
        enemy.x += enemy.vx * delta;
        enemy.y += enemy.vy * delta;
        if (enemy.y > GAME_HEIGHT + enemy.height + 20 || enemy.x < -enemy.width - 40 || enemy.x > GAME_WIDTH + 40) {
          enemy.mode = "offscreen";
          enemy.reentryTimer = randomBetween(FINAL_BOSS_CONFIG.reentryDelayMin, FINAL_BOSS_CONFIG.reentryDelayMax);
        }
      } else if (enemy.mode === "offscreen") {
        enemy.reentryTimer -= delta;
        if (enemy.reentryTimer <= 0) {
          reenterFinalBoss(enemy);
        }
      } else if (enemy.mode === "reentry") {
        enemy.x += enemy.vx * delta;
        enemy.y += enemy.vy * delta;
        const arrived = Math.abs(enemy.y - enemy.anchorY) < 8 && enemy.y <= enemy.anchorY + 8;
        if (arrived) {
          enemy.y = enemy.anchorY;
          enemy.mode = "cruise";
          enemy.vx = (enemy.x + enemy.width / 2 > GAME_WIDTH / 2 ? -1 : 1) * FINAL_BOSS_CONFIG.cruiseSpeed;
          enemy.vy = 0;
          resetFinalBossChargeCooldown(enemy);
          enemy.rapidCooldown = getFinalBossRapidCooldown(enemy);
          enemy.spreadCooldown = getFinalBossSpreadCooldown(enemy);
        }
      }

      const aircraftSurvivors = [];
      for (const other of survivors) {
        if (intersects(getEnemyCollisionHitbox(enemy), getEnemyCollisionHitbox(other))) {
          destroyEnemy(other, true, other.type !== "bomber");
          continue;
        }
        aircraftSurvivors.push(other);
      }
      survivors.length = 0;
      survivors.push(...aircraftSurvivors);
      survivors.push(enemy);
      continue;
    }

    if (enemy.type === "assault") {
      enemy.warningTimer -= delta;
      if (!enemy.warningPlayed && enemy.warningTimer <= 0) {
        playSound("assaultWarn");
        enemy.warningPlayed = true;
      }
      state.assaultTrails.push({
        kind: "assault",
        x: enemy.x + enemy.width / 2,
        y: enemy.y + enemy.height / 2,
        radius: ASSAULT_TRAIL_RADIUS,
        life: ASSAULT_TRAIL_LIFE,
        maxLife: ASSAULT_TRAIL_LIFE,
      });
      enemy.x += enemy.vx * delta;
      enemy.y += enemy.vy * delta;
      survivors.push(enemy);
      continue;
    }

    if (enemy.type === "supply") {
      if (boss) {
        const targetX = boss.x + boss.width / 2 - enemy.width / 2;
        const targetY = Math.min(boss.y + boss.height + 26, 128);
        enemy.x += (targetX - enemy.x) * Math.min(1, delta * 2.8);
        enemy.y += (targetY - enemy.y) * Math.min(1, delta * 2.4);
        enemy.x = clamp(enemy.x, 10, GAME_WIDTH - enemy.width - 10);
      } else {
        enemy.x += enemy.vx * delta;
        if (enemy.x <= 8 || enemy.x + enemy.width >= GAME_WIDTH - 8) {
          enemy.vx *= -1;
        }
      }
      survivors.push(enemy);
      continue;
    }

    if (enemy.type === "bomber") {
      if (!enemy.soundPlayed) {
        playSound("bomberDrone");
        enemy.soundPlayed = true;
      }
      enemy.y += enemy.speed * delta;
      survivors.push(enemy);
      continue;
    }

    enemy.y += enemy.speed * delta;
    survivors.push(enemy);
  }

  state.enemies = survivors;

  applySupplyHealing(delta);

  for (const bomber of pendingBomberBlasts) {
    explodeBomber(bomber);
  }
}

function resolveBulletHits() {
  const remainingMeteors = [];
  for (const meteor of state.meteors) {
    let destroyed = false;
    for (const bullet of state.bullets) {
      if (!intersects(meteor, bullet)) {
        continue;
      }

      destroyed = damageMeteor(meteor, bullet.damage);
      state.stats.shotsHit += 1;
      if (!bullet.penetrating) {
        bullet.y = -200;
        bullet.x = -200;
      }
      if (destroyed) {
        break;
      }
    }

    if (!destroyed) {
      remainingMeteors.push(meteor);
    }
  }
  state.meteors = remainingMeteors;

  const nextEnemies = [];
  const pendingBomberBlasts = [];

  for (const enemy of state.enemies) {
    let destroyed = false;
    const hittable = isEnemyFullyVisible(enemy);

    for (const bullet of state.bullets) {
      if (bullet.penetrating && bullet.hitIds && bullet.hitIds.includes(enemy.id)) {
        continue;
      }
      if (!hittable || !intersects(enemy, bullet)) {
        continue;
      }

      enemy.hp -= bullet.damage;
      state.stats.shotsHit += 1;
      createBlastRing(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, Math.max(10, enemy.width * 0.14), "rgba(255,255,255,0.18)");
      if (enemy.type === "finalBoss") {
        maybeSpawnFinalBossHitDrop(enemy);
        pushWarning("终局大 Boss 受创", enemy.phaseTwo ? "#ff8b8b" : "#9bffcb", 0.55);
      }
      if (bullet.penetrating) {
        bullet.hitIds.push(enemy.id);
        enemy.burnTime = HEAVY_BURN_DURATION;
        enemy.burnDamage = HEAVY_BURN_DAMAGE_PER_SECOND;
        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width * 0.55, "#ffb66e");
        createBlastRing(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width * 0.4, "rgba(255, 185, 92, 0.45)");
        addScreenShake(3.4, 0.12);
        playSound("heavyImpact");
      }
      if (!bullet.penetrating) {
        bullet.y = -200;
        bullet.x = -200;
      }

      if (enemy.hp <= 0) {
        destroyEnemy(enemy, false, enemy.type !== "bomber");
        if (enemy.type === "bomber") {
          pendingBomberBlasts.push(enemy);
        }
        destroyed = true;
        break;
      }
    }

    if (!destroyed) {
      nextEnemies.push(enemy);
    }
  }

  state.enemies = nextEnemies;

  if (state.victoryPending) {
    state.enemies = [];
    state.meteors = [];
    return;
  }

  for (const bomber of pendingBomberBlasts) {
    explodeBomber(bomber);
  }
}

function resolvePlayerHits() {
  const pendingBomberBlasts = [];
  const playerHitbox = getPlayerHitbox();
  const playerCenter = {
    x: playerHitbox.x + playerHitbox.width / 2,
    y: playerHitbox.y + playerHitbox.height / 2,
  };

  for (const enemyBullet of state.enemyBullets) {
    if (intersects(getEnemyBulletHitbox(enemyBullet), playerHitbox)) {
      enemyBullet.y = GAME_HEIGHT + 100;
      enemyBullet.x = -100;
      damagePlayer(enemyBullet.damage);
      if (state.gameOver) {
        return;
      }
    }
  }

  for (const trail of state.assaultTrails) {
    const hitRadius = trail.radius * clamp(trail.life / trail.maxLife, 0.3, 1);
    if (distanceBetween(playerCenter, trail) <= hitRadius + Math.min(playerHitbox.width, playerHitbox.height) * 0.22) {
      trail.life = 0;
      damagePlayer(1);
      if (state.gameOver) {
        return;
      }
      break;
    }
  }

  const remainingMeteors = [];
  for (const meteor of state.meteors) {
    if (intersects(meteor, playerHitbox)) {
      damageMeteor(meteor, CONFIG.enemies.meteor.collisionDamage);
      damagePlayer(CONFIG.enemies.meteor.collisionDamage);
      if (state.gameOver) {
        return;
      }
      if (meteor.hp > 0) {
        remainingMeteors.push(meteor);
      }
      continue;
    }
    remainingMeteors.push(meteor);
  }
  state.meteors = remainingMeteors;

  const survivors = [];
  for (const enemy of state.enemies) {
    const collided = enemy.type === "assault"
      ? intersectsAssaultEnemy(enemy, playerHitbox)
      : intersects(getEnemyCollisionHitbox(enemy), playerHitbox);

    if (collided) {
      if (enemy.type === "finalBoss") {
        createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width * 0.42, "#ffb28c");
        destroyPlayerImmediately();
        if (state.gameOver) {
          return;
        }
        survivors.push(enemy);
        continue;
      }

      createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.width, "#ffb28c");
      damagePlayer(enemy.type === "bomber" ? 2 : 1);
      if (enemy.type === "bomber") {
        pendingBomberBlasts.push(enemy);
      }
      if (state.gameOver) {
        return;
      }
      continue;
    }

    const outOfBounds =
      (enemy.type === "assault" && (enemy.x < -80 || enemy.x > GAME_WIDTH + 80 || enemy.y > GAME_HEIGHT + 40)) ||
      (enemy.type === "finalBoss" && enemy.mode !== "offscreen" && enemy.mode !== "reentry" && enemy.y > GAME_HEIGHT + enemy.height + 20) ||
      (enemy.type !== "assault" && enemy.type !== "finalBoss" && enemy.y > GAME_HEIGHT + 20);

    if (outOfBounds) {
      continue;
    }

    survivors.push(enemy);
  }

  state.enemies = survivors;

  const meteorSurvivors = [];
  const enemySurvivors = [];
  for (const enemy of state.enemies) {
    let enemyDestroyed = false;
    for (const meteor of state.meteors) {
      if (!intersects(getEnemyCollisionHitbox(enemy), meteor)) {
        continue;
      }

      const meteorDestroyed = damageMeteor(meteor, CONFIG.enemies.meteor.collisionDamage);
      enemyDestroyed = damageEnemyByMeteor(enemy, CONFIG.enemies.meteor.collisionDamage);
      if (meteorDestroyed) {
        meteor.hp = 0;
      }
      if (enemyDestroyed) {
        break;
      }
    }
    if (!enemyDestroyed) {
      enemySurvivors.push(enemy);
    }
  }
  for (const meteor of state.meteors) {
    if (meteor.hp > 0) {
      meteorSurvivors.push(meteor);
    }
  }
  state.enemies = enemySurvivors;
  state.meteors = meteorSurvivors;

  for (const bomber of pendingBomberBlasts) {
    explodeBomber(bomber);
  }
}

function updateGame(delta) {
  updateStars(delta);
  updateExplosions(delta);
  flashMessageTimer = Math.max(flashMessageTimer - delta, 0);
  if (state) {
    state.warningTimer = Math.max(state.warningTimer - delta, 0);
    state.damageFlash = Math.max(state.damageFlash - delta * 1.4, 0);
    state.hitFlash = Math.max(state.hitFlash - delta * 2.4, 0);
    state.screenShakeTime = Math.max(state.screenShakeTime - delta, 0);
    state.screenShakePower += (0 - state.screenShakePower) * Math.min(1, delta * 10);
  }

  if (!state.running || state.paused || state.gameOver) {
    return;
  }

  state.runningTime += delta;
  if (isEndlessMode()) {
    const nextStage = getCurrentEndlessStage();
    if (nextStage !== state.endlessStage) {
      state.endlessStage = nextStage;
      const event = getCurrentEndlessEvent();
      showFlashMessage(`无尽第 ${nextStage} 阶段`);
      pushWarning(`阶段 ${nextStage}：${event?.name ?? "标准战区"}`, event?.warningColor ?? "#ffd29a", 1.8);
      state.nextBossScore = Math.max(state.nextBossScore - 80, state.score + 120);
    }
  }
  const nextLevelIndex = getCurrentLevelIndex();
  if (!isEndlessMode() && nextLevelIndex !== state.currentLevelIndex) {
    state.currentLevelIndex = nextLevelIndex;
    if (CONFIG.levels.showLevelMessage) {
      showFlashMessage(`${getCurrentLevel().name} 开始`);
    }
  }
  if (
    !isEndlessMode() &&
    FINAL_BOSS_CONFIG &&
    getCurrentLevelIndex() === LEVELS.length - 1 &&
    !state.finalBossSpawnWarningShown &&
    !state.finalBossSpawned &&
    getLevelElapsedTime() >= FINAL_BOSS_CONFIG.spawnSec - 3
  ) {
    state.finalBossSpawnWarningShown = true;
    showFlashMessage("警报：终局目标接近");
    playSound("finalBossAlarm");
  }
  if (shouldSpawnFinalBoss()) {
    spawnFinalBoss();
  }
  const move = getMoveVector();
  if (!state.playerDestroyed) {
    state.player.x = clamp(state.player.x + move.x * PLAYER_SPEED * delta, 0, GAME_WIDTH - state.player.width);
    state.player.y = clamp(state.player.y + move.y * PLAYER_SPEED * delta, 0, GAME_HEIGHT - state.player.height);
  }
  const targetBank = move.x * 0.18;
  const targetPitch = move.y < 0 ? -0.12 : move.y > 0 ? 0.08 : 0;
  state.playerBank += (targetBank - state.playerBank) * Math.min(1, delta * 9);
  state.playerPitch += (targetPitch - state.playerPitch) * Math.min(1, delta * 7);

  state.baseFireCooldown -= delta;
  state.enemyCooldown -= delta;
  state.playerInvulnerable = Math.max(state.playerInvulnerable - delta, 0);
  state.clusterBurstTimer = Math.max(state.clusterBurstTimer - delta, 0);
  state.clusterShotTimer = Math.max(state.clusterShotTimer - delta, 0);
  state.meteorCooldown = Math.max(state.meteorCooldown - delta, 0);
  if (state.playerDestroyed) {
    state.playerDeathTimer -= delta;
    if (state.playerDeathTimer <= 0) {
      endGame();
      return;
    }
  }

  for (const type of ["rapid", "spread", "heavy", "cluster"]) {
    state.specialCooldowns[type] = Math.max(state.specialCooldowns[type] - delta, 0);
  }

  updateHeavyCharge(delta);

  if (state.activeSpecial && state.activeSpecial !== "heavy") {
    fireSpecialWeapon(state.activeSpecial);
  }

  if (state.clusterBurstTimer > 0 && state.clusterShotTimer <= 0 && !state.playerDestroyed) {
    emitClusterMissiles();
    state.clusterShotTimer = CONFIG.weapons.cluster.fireInterval;
    state.currentWeaponLabel = WEAPONS.cluster.label;
  }

  if (!state.playerDestroyed && state.baseFireCooldown <= 0) {
    spawnBaseBullet();
    state.baseFireCooldown = WEAPONS.basic.fireInterval;
  }

  if (state.victoryPending) {
    updatePlayerBullets(delta);
    updateVictoryBlackHole(delta);
    if (!state.activeSpecial && !state.heavyCharging) {
      state.currentWeaponLabel = WEAPONS.basic.label;
    }
    updateHud();
    return;
  }

  if (state.enemyCooldown <= 0) {
    const hasBoss = state.enemies.some((enemy) => enemy.type === "boss" || enemy.type === "finalBoss");
    if (!isFinalBossPhaseActive() && !hasBoss && state.score >= state.nextBossScore) {
      spawnBoss();
    } else {
      spawnRegularEnemy();
    }
    state.enemyCooldown = getEnemySpawnInterval() + 0.18;
  }

  if (isMeteorBeltActive() && state.meteorCooldown <= 0) {
    state.meteors.push(createMeteor());
    state.meteorCooldown = getMeteorSpawnInterval();
  }

  updatePlayerBullets(delta);
  updateEnemyBullets(delta);
  updateEnemies(delta);
  updateFinalBossHudHp(delta);
  updateMeteors(delta);
  updateDrops(delta);
  resolveBulletHits();
  resolvePlayerHits();

  if (!state.activeSpecial && !state.heavyCharging) {
    state.currentWeaponLabel = WEAPONS.basic.label;
  }
  updateHud();
}

function drawBackground() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = "#08131f";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  for (const star of stars) {
    ctx.fillStyle = "rgba(189, 230, 255, 0.8)";
    ctx.fillRect(star.x, star.y, star.size, star.size);
  }
}

function drawEntityImage(image, x, y, width, height, fallbackColor) {
  if (image && image.complete) {
    ctx.drawImage(image, x, y, width, height);
    return;
  }
  ctx.fillStyle = fallbackColor;
  ctx.fillRect(x, y, width, height);
}

function drawRotatedEntityImage(image, x, y, width, height, angle, fallbackColor) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  drawEntityImage(image, -width / 2, -height / 2, width, height, fallbackColor);
  ctx.restore();
}

function drawPlayer() {
  const { player } = state;
  if (state.playerDestroyed) {
    return;
  }
  ctx.save();
  if (state.playerInvulnerable > 0) {
    ctx.globalAlpha = 0.55 + Math.sin(performance.now() / 90) * 0.15;
  }
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
  ctx.rotate(state.playerBank);
  ctx.transform(1, 0, 0, 1 - state.playerPitch, 0, 0);
  drawEntityImage(IMAGES.player, -player.width / 2, -player.height / 2, player.width, player.height, "#8adfff");

  if (state.lives <= 2) {
    const smokeCount = state.lives === 2 ? 6 : 10;
    for (let index = 0; index < smokeCount; index += 1) {
      const drift = Math.sin(performance.now() / 280 + index * 0.7) * 10;
      const offsetX = -player.width * 0.2 + drift;
      const offsetY = -player.height * 0.34 + Math.sin(performance.now() / 220 + index) * 6;
      ctx.fillStyle = `rgba(55, 55, 55, ${state.lives === 2 ? 0.32 : 0.42})`;
      ctx.beginPath();
      ctx.arc(offsetX, offsetY - index * 7, 6 + index * 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(135, 135, 135, ${state.lives === 2 ? 0.12 : 0.18})`;
      ctx.beginPath();
      ctx.arc(offsetX + 5, offsetY - index * 7 - 3, 4 + index * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (state.lives === 1) {
    for (let index = 0; index < 6; index += 1) {
      const baseX = index * 3 - 6;
      const baseY = -player.height * 0.26 + Math.sin(performance.now() / 120 + index) * 5;
      ctx.fillStyle = "rgba(255, 212, 106, 0.96)";
      ctx.beginPath();
      ctx.moveTo(baseX, baseY + 18);
      ctx.bezierCurveTo(baseX + 1, baseY + 6, baseX + 5, baseY + 4, baseX + 7, baseY - 6);
      ctx.bezierCurveTo(baseX + 10, baseY + 3, baseX + 13, baseY + 7, baseX + 14, baseY + 18);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255, 110, 56, 0.94)";
      ctx.beginPath();
      ctx.moveTo(baseX + 3, baseY + 16);
      ctx.bezierCurveTo(baseX + 4, baseY + 7, baseX + 6, baseY + 5, baseX + 7, baseY + 1);
      ctx.bezierCurveTo(baseX + 9, baseY + 5, baseX + 10, baseY + 7, baseX + 11, baseY + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "rgba(255, 244, 188, 0.9)";
      ctx.beginPath();
      ctx.moveTo(baseX + 5, baseY + 12);
      ctx.bezierCurveTo(baseX + 6, baseY + 8, baseX + 7, baseY + 7, baseX + 7, baseY + 5);
      ctx.bezierCurveTo(baseX + 8, baseY + 7, baseX + 9, baseY + 8, baseX + 9, baseY + 12);
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawBullets() {
  for (const bullet of state.bullets) {
    if (bullet.kind === "homing") {
      const angle = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
      ctx.save();
      ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
      ctx.rotate(angle);
      ctx.shadowBlur = 10;
      ctx.shadowColor = "rgba(118, 204, 255, 0.8)";
      ctx.fillStyle = "#79d8ff";
      ctx.beginPath();
      ctx.moveTo(0, -bullet.height / 2 - 2);
      ctx.lineTo(bullet.width * 0.42, -bullet.height * 0.05);
      ctx.lineTo(bullet.width * 0.34, bullet.height * 0.26);
      ctx.lineTo(0, bullet.height / 2);
      ctx.lineTo(-bullet.width * 0.34, bullet.height * 0.26);
      ctx.lineTo(-bullet.width * 0.42, -bullet.height * 0.05);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#0f3f63";
      ctx.fillRect(-2, -bullet.height * 0.2, 4, bullet.height * 0.45);
      ctx.fillStyle = "#a9f0ff";
      ctx.fillRect(-bullet.width * 0.55, 1, bullet.width * 1.1, 3);
      ctx.fillStyle = "#2f8cff";
      ctx.fillRect(-bullet.width * 0.64, -1, bullet.width * 0.22, bullet.height * 0.26);
      ctx.fillRect(bullet.width * 0.42, -1, bullet.width * 0.22, bullet.height * 0.26);
      ctx.fillStyle = "#ffb784";
      ctx.beginPath();
      ctx.moveTo(-4, bullet.height / 2 - 2);
      ctx.lineTo(0, bullet.height / 2 + 10);
      ctx.lineTo(4, bullet.height / 2 - 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }
    if (bullet.kind === "heavy") {
      const glow = 10 + bullet.chargeRatio * 12;
      const angle = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
      ctx.save();
      ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
      ctx.rotate(angle);
      ctx.shadowBlur = glow;
      ctx.shadowColor = bullet.penetrating ? "rgba(255, 236, 166, 0.95)" : "rgba(255, 151, 112, 0.9)";
      ctx.fillStyle = bullet.penetrating ? "#fff7dc" : "#ffd2b8";
      ctx.beginPath();
      ctx.moveTo(0, -bullet.height / 2);
      ctx.lineTo(bullet.width / 2, -bullet.height * 0.14);
      ctx.lineTo(bullet.width * 0.26, bullet.height / 2);
      ctx.lineTo(-bullet.width * 0.26, bullet.height / 2);
      ctx.lineTo(-bullet.width / 2, -bullet.height * 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = bullet.penetrating ? "#ffe27c" : "#ff7f63";
      ctx.fillRect(-bullet.width * 0.14, -bullet.height / 2 + 2, bullet.width * 0.28, bullet.height - 5);
      if (bullet.penetrating) {
        ctx.strokeStyle = "rgba(255, 235, 156, 0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -bullet.height / 2 - 10);
        ctx.lineTo(0, bullet.height / 2 + 10);
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }

    if (Math.abs(bullet.vx) > 4) {
      const angle = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
      ctx.save();
      ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
      ctx.rotate(angle);
      ctx.fillStyle = bullet.color;
      ctx.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
      ctx.restore();
      continue;
    }

    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function drawHeavyChargeBar() {
  if (!state.heavyCharging || state.playerDestroyed) {
    return;
  }

  const ratio = clamp(state.heavyChargeTime / HEAVY_CHARGE_TIME, 0, 1);
  const barWidth = 74;
  const barHeight = 8;
  const x = state.player.x + state.player.width / 2 - barWidth / 2;
  const y = state.player.y + state.player.height + 12;
  const fill = ratio >= 1 ? "#ff5252" : ratio >= 0.85 ? "#ffe27c" : ratio >= 0.45 ? "#ffb572" : "#7ec8ff";

  ctx.fillStyle = "rgba(4, 10, 18, 0.7)";
  ctx.fillRect(x, y, barWidth, barHeight);
  ctx.fillStyle = fill;
  ctx.fillRect(x + 1, y + 1, (barWidth - 2) * ratio, barHeight - 2);
  ctx.strokeStyle = ratio >= 1 ? "#ffd0d0" : ratio >= 0.85 ? "#fff4ba" : "#d8e5ef";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, barWidth, barHeight);
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    if (enemy.type === "supply") {
      const auraAlpha = 0.12 + Math.sin(performance.now() / 220) * 0.03;
      ctx.save();
      ctx.fillStyle = `rgba(255, 227, 120, ${auraAlpha})`;
      ctx.strokeStyle = "rgba(255, 232, 154, 0.32)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.auraRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    if (enemy.type === "assault") {
      drawRotatedEntityImage(IMAGES[enemy.imageKey], enemy.x, enemy.y, enemy.width, enemy.height, enemy.angle, "#59d67a");
    } else {
      if (enemy.type === "finalBoss") {
        ctx.save();
        if (enemy.phaseTwo) {
          ctx.shadowBlur = 22;
          ctx.shadowColor = "rgba(255, 102, 102, 0.82)";
        } else if (enemy.mode === "charging") {
          ctx.shadowBlur = 18;
          ctx.shadowColor = "rgba(255, 196, 138, 0.6)";
        }
        drawRotatedEntityImage(IMAGES[enemy.imageKey], enemy.x, enemy.y, enemy.width, enemy.height, Math.PI, "#66cf8f");
        ctx.restore();
        if (enemy.mode === "charging") {
          const ratio = clamp(enemy.chargeTimer / FINAL_BOSS_CONFIG.chargeTime, 0, 1);
          ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
          ctx.fillRect(enemy.x + 12, enemy.y + enemy.height + 8, enemy.width - 24, 6);
          ctx.fillStyle = ratio >= FINAL_BOSS_CONFIG.chargedThreshold ? "#ff8872" : "#ffd29a";
          ctx.fillRect(enemy.x + 13, enemy.y + enemy.height + 9, (enemy.width - 26) * ratio, 4);
        }
      } else {
      drawRotatedEntityImage(IMAGES[enemy.imageKey], enemy.x, enemy.y, enemy.width, enemy.height, Math.PI, "#f47f7f");
      }
    }

    if (enemy.burnTime > 0) {
      ctx.save();
      ctx.globalAlpha = 0.58 + Math.sin(performance.now() / 70) * 0.18;
      ctx.shadowBlur = 14;
      ctx.shadowColor = "rgba(255, 132, 68, 0.85)";
      ctx.fillStyle = "rgba(255, 128, 82, 0.96)";
      for (let index = 0; index < 6; index += 1) {
        const flameX = enemy.x + enemy.width * (0.22 + index * 0.12);
        const flameY = enemy.y + enemy.height * (0.24 + (index % 2) * 0.11);
        ctx.beginPath();
        ctx.moveTo(flameX, flameY + 14);
        ctx.quadraticCurveTo(flameX - 6, flameY + 3, flameX, flameY - 12);
        ctx.quadraticCurveTo(flameX + 6, flameY + 3, flameX, flameY + 14);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 224, 130, 0.92)";
        ctx.beginPath();
        ctx.moveTo(flameX, flameY + 9);
        ctx.quadraticCurveTo(flameX - 3, flameY + 1, flameX, flameY - 7);
        ctx.quadraticCurveTo(flameX + 3, flameY + 1, flameX, flameY + 9);
        ctx.fill();
        ctx.fillStyle = "rgba(255, 128, 82, 0.96)";
      }
      ctx.fillStyle = "rgba(62, 62, 62, 0.3)";
      for (let index = 0; index < 4; index += 1) {
        const smokeX = enemy.x + enemy.width * (0.34 + index * 0.12);
        const smokeY = enemy.y + enemy.height * 0.15 - index * 6;
        ctx.beginPath();
        ctx.arc(smokeX, smokeY, 6 + index * 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (enemy.maxHp > 1) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(enemy.x + 8, enemy.y - 8, enemy.width - 16, 5);
      ctx.fillStyle =
        enemy.type === "finalBoss" ? (enemy.phaseTwo ? "#ff6767" : "#7cffb0") :
        enemy.type === "boss" ? "#ff8d7a" :
        enemy.type === "assault" ? "#b8ffb8" :
        enemy.type === "supply" ? "#ffe16d" :
        enemy.type === "bomber" ? "#d28cff" : "#7ee2ff";
      ctx.fillRect(enemy.x + 8, enemy.y - 8, (enemy.width - 16) * clamp(enemy.hp / enemy.maxHp, 0, 1), 5);
    }
  }
}

function drawMeteors() {
  for (const meteor of state.meteors) {
    ctx.save();
    ctx.translate(meteor.x + meteor.width / 2, meteor.y + meteor.height / 2);
    ctx.rotate(meteor.rotation);
    drawEntityImage(IMAGES[meteor.imageKey], -meteor.width / 2, -meteor.height / 2, meteor.width, meteor.height, "#8b7d76");
    ctx.restore();
  }
}

function drawEnemyBullets() {
  for (const bullet of state.enemyBullets) {
    if (bullet.kind === "finalBossHeavy") {
      const angle = Math.atan2(bullet.vy, bullet.vx) + Math.PI / 2;
      ctx.save();
      ctx.translate(bullet.x + bullet.width / 2, bullet.y + bullet.height / 2);
      ctx.rotate(angle);
      const glow = 10 + bullet.chargeRatio * 12;
      ctx.shadowBlur = glow;
      ctx.shadowColor = bullet.charged ? "rgba(255, 236, 166, 0.95)" : "rgba(255, 151, 112, 0.9)";
      ctx.fillStyle = bullet.charged ? "#fff7dc" : "#ffd2b8";
      ctx.beginPath();
      ctx.moveTo(0, -bullet.height / 2);
      ctx.lineTo(bullet.width / 2, -bullet.height * 0.14);
      ctx.lineTo(bullet.width * 0.26, bullet.height / 2);
      ctx.lineTo(-bullet.width * 0.26, bullet.height / 2);
      ctx.lineTo(-bullet.width / 2, -bullet.height * 0.14);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = bullet.charged ? "#ffe27c" : "#ff7f63";
      ctx.fillRect(-bullet.width * 0.14, -bullet.height / 2 + 2, bullet.width * 0.28, bullet.height - 5);
      if (bullet.charged) {
        ctx.strokeStyle = "rgba(255, 235, 156, 0.95)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -bullet.height / 2 - 10);
        ctx.lineTo(0, bullet.height / 2 + 10);
        ctx.stroke();
      }
      ctx.restore();
      continue;
    }
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function drawBlackHole() {
  if (!state.blackHole) {
    return;
  }

  const hole = state.blackHole;
  const pulse = 1 + Math.sin(hole.time * 7) * 0.08;

  ctx.save();
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = "rgba(132, 126, 255, 0.36)";
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.attractRadius * (0.92 + Math.sin(hole.time * 3.2) * 0.03), 0, Math.PI * 2);
  ctx.fill();
  if (IMAGES.blackHole?.complete) {
    const size = hole.radius * 4.2 * pulse;
    ctx.globalAlpha = 0.92;
    ctx.drawImage(IMAGES.blackHole, hole.x - size / 2, hole.y - size / 2, size, size);
  } else {
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = "rgba(20, 18, 35, 0.96)";
    ctx.beginPath();
    ctx.arc(hole.x, hole.y, hole.radius * pulse, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = "rgba(162, 164, 255, 0.7)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.radius * (1.38 + Math.sin(hole.time * 5) * 0.06), 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = "rgba(94, 218, 255, 0.5)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.radius * (1.86 + Math.cos(hole.time * 4.2) * 0.08), hole.time * 3.5, hole.time * 3.5 + Math.PI * 1.4);
  ctx.stroke();
  ctx.restore();
}

function drawFinalBossHud() {
  const enemy = getFinalBoss();
  if (!enemy) {
    return;
  }

  const barWidth = GAME_WIDTH - 56;
  const x = 28;
  const y = 96;
  const hudHp = state.finalBossHudHp ?? enemy.hp;
  const hpRatio = clamp(hudHp / enemy.maxHp, 0, 1);

  ctx.fillStyle = "rgba(5, 12, 18, 0.72)";
  ctx.fillRect(x, y, barWidth, 14);
  ctx.fillStyle = enemy.phaseTwo ? "#ff6666" : "#9bffcb";
  ctx.fillRect(x + 2, y + 2, (barWidth - 4) * hpRatio, 10);
  ctx.strokeStyle = enemy.phaseTwo ? "#ffd0d0" : "#c7f7d6";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, 14);
  ctx.fillStyle = enemy.phaseTwo ? "#ffe6e6" : "#e8f7ef";
  ctx.font = "bold 13px Segoe UI";
  ctx.textAlign = "left";
  ctx.fillText(enemy.phaseTwo ? "终局大 boss 二阶段" : "终局大 boss", x, y - 8);
}

function drawBossHud() {
  const enemy = state.enemies.find((item) => item.type === "boss");
  if (!enemy) {
    return;
  }

  const barWidth = GAME_WIDTH - 96;
  const x = 48;
  const y = 92;
  const hpRatio = clamp(enemy.hp / enemy.maxHp, 0, 1);
  ctx.fillStyle = "rgba(5, 12, 18, 0.68)";
  ctx.fillRect(x, y, barWidth, 10);
  ctx.fillStyle = enemy.attackModeColor ?? "#ff8d7a";
  ctx.fillRect(x + 2, y + 2, (barWidth - 4) * hpRatio, 6);
  ctx.strokeStyle = "rgba(255, 230, 218, 0.85)";
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, barWidth, 10);
  ctx.fillStyle = "#fbe6dc";
  ctx.font = "bold 12px Segoe UI";
  ctx.textAlign = "left";
  ctx.fillText(`普通 Boss · ${enemy.attackModeName}`, x, y - 8);
}

function drawDrops() {
  for (const drop of state.drops) {
    const lifeRatio = clamp(drop.life / drop.maxLife, 0, 1);
    let alpha = 1;
    if (lifeRatio < 0.45) {
      const blinkProgress = 1 - lifeRatio / 0.45;
      const blinkSpeed = 6 + blinkProgress * 18;
      alpha = 0.35 + 0.65 * Math.abs(Math.sin(performance.now() / 1000 * blinkSpeed));
    }

    ctx.save();
    ctx.globalAlpha = alpha;
    drawEntityImage(IMAGES[drop.imageKey], drop.x, drop.y, drop.width, drop.height, drop.color);
    ctx.restore();
  }
}

function drawExplosions() {
  for (const trail of state.assaultTrails) {
    const alpha = clamp(trail.life / trail.maxLife, 0, 1);
    const isFinalBossTrail = trail.kind === "finalBoss";
    const isPhaseTwoFinalBossTrail = isFinalBossTrail && trail.phaseTwo;
    ctx.globalAlpha = alpha * (isFinalBossTrail ? 0.42 : 0.22);
    ctx.fillStyle = isFinalBossTrail
      ? (isPhaseTwoFinalBossTrail ? "rgba(255, 88, 88, 0.8)" : "rgba(124, 255, 182, 0.74)")
      : "rgba(122, 255, 144, 0.45)";
    ctx.beginPath();
    ctx.arc(trail.x, trail.y, trail.radius * (0.7 + (1 - alpha) * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha * (isFinalBossTrail ? 0.28 : 0.16);
    ctx.fillStyle = isFinalBossTrail
      ? (isPhaseTwoFinalBossTrail ? "rgba(255, 180, 136, 0.9)" : "rgba(255, 224, 136, 0.84)")
      : "rgba(255, 186, 92, 0.52)";
    ctx.beginPath();
    ctx.arc(trail.x, trail.y, trail.radius * (isFinalBossTrail ? 0.54 : 0.42), 0, Math.PI * 2);
    ctx.fill();
    if (isFinalBossTrail) {
      ctx.globalAlpha = alpha * 0.2;
      ctx.strokeStyle = isPhaseTwoFinalBossTrail ? "rgba(255, 210, 210, 0.92)" : "rgba(208, 255, 229, 0.86)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, trail.radius * 0.88, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  for (const ring of state.blastRings) {
    const progress = 1 - ring.life / ring.maxLife;
    ctx.globalAlpha = clamp(ring.life / ring.maxLife, 0, 1) * 0.8;
    ctx.strokeStyle = ring.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius * (0.82 + progress * 0.18), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "rgba(210, 140, 255, 0.12)";
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const spark of state.explosions) {
    ctx.globalAlpha = clamp(spark.life / spark.maxLife, 0, 1);
    ctx.fillStyle = spark.color;
    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFlashMessage() {
  if (flashMessageTimer <= 0 || !flashMessage) {
    return;
  }

  ctx.fillStyle = "rgba(5, 11, 18, 0.6)";
  ctx.fillRect(42, 54, GAME_WIDTH - 84, 34);
  ctx.fillStyle = "#e8f3fb";
  ctx.font = "bold 16px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(flashMessage, GAME_WIDTH / 2, 71);
}

function drawWarningBanner() {
  if (state.warningTimer <= 0 || !state.warningText) {
    return;
  }

  ctx.fillStyle = "rgba(5, 11, 18, 0.62)";
  ctx.fillRect(26, 116, GAME_WIDTH - 52, 30);
  ctx.strokeStyle = state.warningColor;
  ctx.lineWidth = 2;
  ctx.strokeRect(26, 116, GAME_WIDTH - 52, 30);
  ctx.fillStyle = state.warningColor;
  ctx.font = "bold 14px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(state.warningText, GAME_WIDTH / 2, 131);
}

function drawCombatFeedback() {
  if (state.damageFlash > 0) {
    ctx.fillStyle = `rgba(255, 82, 82, ${state.damageFlash * 0.18})`;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  }
}

function drawPauseLabel() {
  if (!state.paused || state.gameOver || !state.running) {
    return;
  }

  ctx.fillStyle = "rgba(5, 11, 18, 0.55)";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = "#d7e5ef";
  ctx.font = "bold 28px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("已暂停", GAME_WIDTH / 2, GAME_HEIGHT / 2);
}

function render() {
  const shakeX = state.screenShakeTime > 0 ? randomBetween(-state.screenShakePower, state.screenShakePower) : 0;
  const shakeY = state.screenShakeTime > 0 ? randomBetween(-state.screenShakePower, state.screenShakePower) : 0;
  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawBackground();
  drawBlackHole();
  drawDrops();
  drawBullets();
  drawEnemyBullets();
  drawMeteors();
  drawEnemies();
  drawBossHud();
  drawFinalBossHud();
  drawPlayer();
  drawHeavyChargeBar();
  drawExplosions();
  ctx.restore();
  drawCombatFeedback();
  drawFlashMessage();
  drawWarningBanner();
  drawPauseLabel();
}

function gameLoop(timestamp) {
  if (!lastTime) {
    lastTime = timestamp;
  }

  const delta = Math.min((timestamp - lastTime) / 1000, 0.033);
  lastTime = timestamp;

  updateGame(delta);
  render();
  requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (!state.running || state.gameOver) {
    return;
  }

  state.paused = !state.paused;
  if (state.paused) {
    showOverlay("已暂停，按空格继续。");
    restartButton.textContent = "继续游戏";
  } else {
    hideOverlay();
    restartButton.textContent = "重新开始";
  }
}

function handleSpecialDown(type) {
  ensureAudio();
  if (!state.running && !state.gameOver) {
    startGame();
  }
  if (state.heavyCharging && type !== "heavy") {
    return;
  }
  if (type === "heavy") {
    beginHeavyCharge();
    return;
  }
  setActiveSpecial(type, true);
  fireSpecialWeapon(type);
}

function handleSpecialUp(type) {
  if (type === "heavy") {
    releaseHeavyCharge();
    return;
  }
  setActiveSpecial(type, false);
}

window.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
    event.preventDefault();
  }

  if (event.code === "KeyH") {
    handleSpecialDown("rapid");
    return;
  }

  if (event.code === "KeyJ") {
    handleSpecialDown("spread");
    return;
  }

  if (event.code === "KeyK") {
    handleSpecialDown("heavy");
    return;
  }

  if (event.code === "KeyM") {
    handleSpecialDown("cluster");
    return;
  }

  if (event.code === "Space") {
    ensureAudio();
    if (!state.running || state.gameOver) {
      startGame();
    } else {
      togglePause();
    }
    return;
  }

  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  if (event.code === "KeyH") {
    handleSpecialUp("rapid");
    return;
  }

  if (event.code === "KeyJ") {
    handleSpecialUp("spread");
    return;
  }

  if (event.code === "KeyK") {
    handleSpecialUp("heavy");
    return;
  }

  if (event.code === "KeyM") {
    handleSpecialUp("cluster");
    return;
  }

  keys.delete(event.code);
});

window.addEventListener("resize", () => {
  syncCanvasResolution();
  render();
});

restartButton.addEventListener("click", () => {
  ensureAudio();
  if (!state.running || state.gameOver) {
    state = createInitialState();
    startGame();
    return;
  }

  if (state.paused) {
    togglePause();
    return;
  }

  state = createInitialState();
  startGame();
});

menuButton.addEventListener("click", () => {
  state = createInitialState(appState.lastMode);
  updateHud();
  showMenu("main");
});

campaignButton.addEventListener("click", () => {
  ensureAudio();
  startMode("campaign");
});

endlessButton.addEventListener("click", () => {
  ensureAudio();
  startMode("endless");
  showFlashMessage("无尽模式开始");
});

settingsButton.addEventListener("click", () => {
  updateDifficultyUi();
  showMenu("settings");
});

helpButton.addEventListener("click", () => {
  showMenu("help");
});

settingsBackButton.addEventListener("click", () => {
  showMenu("main");
});

helpBackButton.addEventListener("click", () => {
  showMenu("main");
});

difficultySlider.addEventListener("input", (event) => {
  const nextValue = clamp(Number(event.target.value), 0.7, 1.6);
  appState.difficultyScale = nextValue;
  if (state) {
    state.difficultyScale = nextValue;
  }
  updateDifficultyUi();
  saveAppSettings();
});

for (const button of touchButtons) {
  const control = button.dataset.control;

  const activate = (event) => {
    event.preventDefault();
    ensureAudio();
    touchState[control] = true;
    if (!state.running && !state.gameOver) {
      startGame();
    }
  };

  const deactivate = (event) => {
    event.preventDefault();
    touchState[control] = false;
  };

  button.addEventListener("touchstart", activate, { passive: false });
  button.addEventListener("touchend", deactivate, { passive: false });
  button.addEventListener("touchcancel", deactivate, { passive: false });
  button.addEventListener("mousedown", activate);
  button.addEventListener("mouseup", deactivate);
  button.addEventListener("mouseleave", deactivate);
}

for (const button of fireButtons) {
  const fireType = button.dataset.fire;

  const activate = (event) => {
    event.preventDefault();
    handleSpecialDown(fireType);
  };

  const deactivate = (event) => {
    event.preventDefault();
    handleSpecialUp(fireType);
  };

  button.addEventListener("mousedown", activate);
  button.addEventListener("mouseup", deactivate);
  button.addEventListener("mouseleave", deactivate);
  button.addEventListener("touchstart", activate, { passive: false });
  button.addEventListener("touchend", deactivate, { passive: false });
  button.addEventListener("touchcancel", deactivate, { passive: false });
}

loadAppSettings();
updateDifficultyUi();
resetGame();
showMenu("main");
render();
requestAnimationFrame(gameLoop);
