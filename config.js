window.GAME_CONFIG = {
  canvas: {
    // 画布宽度。
    width: 480,
    // 画布高度。
    height: 700,
  },
  levels: {
    // 开发者测试时指定起始关卡，正式开局保持 1。
    startLevel: 1,
    // 是否在切关时显示提示。
    showLevelMessage: true,
    // 关卡配置列表，共 3 关，每关约 5 分钟。
    items: [
      {
        // 第一关名称。
        name: "第一关",
        // 当前关卡持续时间，单位秒。
        durationSec: 120,
        // 当前关卡的基础难度系数。
        baseDifficulty: 0.1,
        // 刷怪间隔倍率，越大越容易。
        spawnIntervalMultiplier: 1.12,
        // 敌机整体速度倍率。
        enemySpeedMultiplier: 0.92,
        // boss 血量倍率。
        bossHpMultiplier: 0.92,
        // boss 开火冷却倍率，越大越容易。
        bossFireCooldownMultiplier: 1.08,
        // 特殊敌机出现概率倍率。
        specialEnemyChanceMultiplier: 0.8,
      },
      {
        // 第二关名称。
        name: "第二关",
        // 当前关卡持续时间，单位秒。
        durationSec: 180,
        // 当前关卡的基础难度系数。
        baseDifficulty: 0.45,
        // 刷怪间隔倍率。
        spawnIntervalMultiplier: 1,
        // 敌机整体速度倍率。
        enemySpeedMultiplier: 1,
        // boss 血量倍率。
        bossHpMultiplier: 1,
        // boss 开火冷却倍率。
        bossFireCooldownMultiplier: 1,
        // 特殊敌机出现概率倍率。
        specialEnemyChanceMultiplier: 1,
        // 第二关中的炸弹机密集时段配置。
        bomberRush: {
          // 密集时段开始时间，基于本关内经过秒数。
          startSec: 30,
          // 密集时段持续时间。
          durationSec: 60,
          // 密集时段内炸弹机额外出现权重。
          bomberChanceMultiplier: 3.4,
          // 密集时段内整体刷怪加速倍率。
          spawnIntervalMultiplier: 0.72,
        },
        // 第二关末尾的突袭机密集时段配置。
        assaultRush: {
          // 密集时段开始时间，基于本关内经过秒数。
          startSec: 100,
          // 密集时段持续时间。
          durationSec: 60,
          // 密集时段内突袭机额外出现权重。
          assaultChanceMultiplier: 3.4,
          // 密集时段内整体刷怪加速倍率。
          spawnIntervalMultiplier: 0.72,
        },
        // 第二关末尾的陨石带配置。
        meteorBelt: {
          // 陨石带开始时间，基于本关内经过秒数。
          startSec: 140,
          // 陨石带持续时间。
          durationSec: 40,
          // 陨石生成间隔，低于第三关开头的陨石带密度。
          spawnInterval: 1.2,
        },
      },
      {
        // 第三关名称。
        name: "第三关",
        // 当前关卡持续时间，单位秒。
        durationSec: 300,
        // 当前关卡的基础难度系数。
        baseDifficulty: 0.82,
        // 刷怪间隔倍率，越小越难。
        spawnIntervalMultiplier: 0.84,
        // 敌机整体速度倍率。
        enemySpeedMultiplier: 1.14,
        // boss 血量倍率。
        bossHpMultiplier: 1.18,
        // boss 开火冷却倍率，越小越难。
        bossFireCooldownMultiplier: 0.9,
        // 特殊敌机出现概率倍率。
        specialEnemyChanceMultiplier: 1.18,
        // 第三关中的炸弹机和突袭机混合高峰配置。
        mixedRush: {
          // 混合高峰开始时间，基于本关内经过秒数。
          startSec: 100,
          // 混合高峰持续时间。
          durationSec: 60,
          // 高峰内炸弹机额外出现权重。
          bomberChanceMultiplier: 2.8,
          // 高峰内突袭机额外出现权重。
          assaultChanceMultiplier: 2.8,
          // 高峰内整体刷怪加速倍率。
          spawnIntervalMultiplier: 0.65,
        },
        // 第三关中的陨石带配置。
        meteorBelt: {
          // 陨石带开始时间，基于本关内经过秒数。
          startSec: 10,
          // 陨石带持续时间。
          durationSec: 70,
          // 陨石生成间隔。
          spawnInterval: 0.75,
        },
        // 第三关终局大 boss 配置。
        finalBoss: {
          // 终局大 boss 出现时间，基于本关内经过秒数。
          spawnSec: 200,
          // 大 boss 出场后是否取消本关时间限制。
          timeLimitDisabledAfterSpawn: true,
          // 大 boss 在场时的杂兵刷怪倍率，越大越稀疏。
          finalPhaseMinionSpawnMultiplier: 1.9,
          // 大 boss 出场后 HUD 是否切换为关底战状态。
          showBossPhaseInHud: true,
          // 大 boss 基础生命值。
          baseHp: 150,
          // 大 boss 体积倍率，相对普通 boss 略大。
          sizeMultiplier: 1.5,
          // 大 boss 入场速度。
          entrySpeed: 76,
          // 大 boss 常态巡航横向速度。
          cruiseSpeed: 96,
          // 大 boss 贴顶时的基准高度。
          anchorY: 34,
          // 大 boss 发射普通重炮前的冷却范围下限。
          chargeCooldownMin: 2.3,
          // 大 boss 发射普通重炮前的冷却范围上限。
          chargeCooldownMax: 3.6,
          // 大 boss 重炮满蓄力时间。
          chargeTime: 1.55,
          // 低于该蓄力比例时视为普通重炮。
          chargedThreshold: 0.7,
          // 普通重炮对玩家造成的伤害。
          normalShotDamage: 2,
          // 蓄力重炮对玩家造成的伤害。
          chargedShotDamage: 3,
          // 普通重炮飞行速度。
          normalShotSpeed: 250,
          // 蓄力重炮飞行速度。
          chargedShotSpeed: 320,
          // 冲刺触发的基础概率，每秒近似判定一次。
          dashChancePerSecond: 0.08,
          // 冲刺速度。
          dashSpeed: 600,
          // 冲刺后离场再入场等待时间下限。
          reentryDelayMin: 0.9,
          // 冲刺后离场再入场等待时间上限。
          reentryDelayMax: 1.5,
          // 召唤补给机的冷却范围下限。
          summonCooldownMin: 8,
          // 召唤补给机的冷却范围上限。
          summonCooldownMax: 12,
          // 大 boss 速射弹基础发射间隔。
          rapidCooldown: 0.72,
          // 大 boss 扩散弹基础发射间隔。
          spreadCooldown: 1.8,
          // 大 boss 被击毁后形成的黑洞配置。
          blackHole: {
            // 黑洞初始可见半径。
            radius: 28,
            // 黑洞开始吸引玩家的半径。
            attractRadius: 118,
            // 玩家被完全吞没并结算胜利的半径。
            consumeRadius: 16,
            // 黑洞吸引玩家时的基础拉力。
            pullStrength: 340,
            // 吸入时沿切线的卷入强度。
            swirlStrength: 160,
          },
          // 二阶段配置。
          phaseTwo: {
            // 二阶段触发血量比例。
            triggerHpRatio: 0.35,
            // 二阶段模式说明，便于开发者识别。
            mode: "all_round_enrage",
            // 二阶段重炮冷却倍率，越小越频繁。
            chargeCooldownMultiplier: 0.74,
            // 二阶段更容易发出高蓄力重炮的偏置。
            chargedBias: 0.18,
            // 二阶段冲刺概率倍率。
            dashChanceMultiplier: 1.8,
            // 二阶段冲刺速度。
            dashSpeed: 760,
            // 二阶段召唤补给机冷却倍率。
            summonCooldownMultiplier: 0.68,
            // 二阶段速射弹发射间隔倍率。
            rapidCooldownMultiplier: 0.72,
            // 二阶段扩散弹发射间隔倍率。
            spreadCooldownMultiplier: 0.7,
            // 二阶段杂兵刷怪倍率，仍保持少量但略增压。
            finalPhaseMinionSpawnMultiplier: 1.45,
          },
        },
      },
    ],
  },
  player: {
    // 玩家移动速度。
    speed: 280,
    // 玩家机体尺寸。
    width: 46,
    height: 54,
    // 玩家受击后的无敌时间。
    invulnerableTime: 1.1,
    // 玩家命中盒相对机体的缩放。
    hitbox: { x: 0.28, y: 0.18, width: 0.44, height: 0.6 },
    // 机身倾斜对子弹偏角的影响系数。
    shotBankFactor: 0.62,
  },
  bullets: {
    // 默认单发子弹速度。
    baseSpeed: 460,
    // 基础单发射击间隔。
    baseFireInterval: 0.22,
  },
  enemies: {
    // 普通敌机速度范围下限。
    minSpeed: 110,
    // 普通敌机速度范围上限。
    maxSpeed: 220,
    // boss 入场速度。
    bossEntrySpeed: 70,
    // boss 横向移动速度。
    bossHorizontalSpeed: 90,
    // 炸弹机爆炸基础半径。
    bomberBlastRadius: 170,
    // 补给机治疗圈半径。
    supplyAuraRadius: 112,
    // 补给机每秒治疗量。
    supplyHealPerSecond: 1.5,
    // 突袭机尾迹存活时间。
    assaultTrailLife: 0.85,
    // 突袭机尾迹碰撞半径。
    assaultTrailRadius: 18,
    // 终局大 boss 冲刺尾迹存活时间，适当拉长便于观察。
    finalBossTrailLife: 0.5,
    // 终局大 boss 冲刺尾迹碰撞半径，比突袭机更宽。
    finalBossTrailRadius: 30,
    // 炸弹机基础血量。
    bomberHp: 6,
    // 突袭机基础血量。
    assaultHp: 2,
    // 突袭机基础速度。
    assaultBaseSpeed: 380,
    // 难度提升后突袭机额外速度。
    assaultDifficultySpeed: 180,
    boss: {
      // boss 初始血量。
      baseHp: 18,
      // boss 随分数成长的血量步进。
      hpStep: 4,
      // 触发血量成长的分数间隔。
      hpScoreStep: 170,
    },
    meteor: {
      // 陨石初始生命值。
      hp: 3,
      // 陨石最小尺寸。
      minSize: 34,
      // 陨石最大尺寸。
      maxSize: 74,
      // 陨石最小下落速度。
      minSpeedY: 45,
      // 陨石最大下落速度。
      maxSpeedY: 105,
      // 陨石横向漂移最大速度。
      driftX: 42,
      // 陨石与飞机碰撞时双方损失的生命值。
      collisionDamage: 1,
    },
  },
  drops: {
    // 普通特殊敌机掉落概率。
    chance: 0.35,
    // 掉落物存在时间。
    life: 5,
    // 命中终局大 boss 时触发掉落的概率。
    finalBossHitChance: 0.04,
    // 命中终局大 boss 掉落的最短间隔，避免高频子弹刷满屏。
    finalBossHitCooldown: 0.9,
  },
  heavy: {
    // 重炮蓄力满值时间。
    chargeTime: 1.6,
    // 满蓄力后自动发射等待时间。
    autoReleaseDelay: 3,
    // 穿透重炮点燃持续时间。
    burnDuration: 5,
    // 穿透重炮每秒灼烧伤害。
    burnDamagePerSecond: 1.25,
  },
  stars: {
    // 背景星星数量。
    count: 40,
  },
  weapons: {
    basic: {
      // 默认武器标签。
      label: "单发∞",
      // 默认子弹颜色。
      color: "#dff8ff",
      // 默认子弹尺寸。
      width: 6,
      height: 18,
      // 默认子弹生成偏移。
      offsetX: -3,
      offsetY: -12,
    },
    rapid: {
      // 速射标签。
      label: "H-速射",
      // 速射冷却。
      cooldown: 0.18,
      // 单次补弹数量。
      ammoGain: 10,
      // 实际补弹数量围绕 ammoGain 的波动范围。
      ammoVariance: 3,
      // 子弹颜色。
      color: "#8ce7ff",
      // 子弹尺寸。
      width: 4,
      height: 14,
      // 相对基础速度增量。
      speedOffset: 20,
    },
    spread: {
      // 扩散标签。
      label: "J-扩散",
      // 扩散冷却。
      cooldown: 0.3,
      // 单次补弹数量。
      ammoGain: 10,
      // 实际补弹数量围绕 ammoGain 的波动范围。
      ammoVariance: 3,
      // 子弹颜色。
      color: "#ffd36b",
      // 中央弹尺寸。
      centerWidth: 6,
      centerHeight: 18,
      // 侧弹尺寸。
      sideWidth: 6,
      sideHeight: 14,
      // 侧弹横向速度。
      sideVelocity: 280,
      // 侧弹相对偏角。
      sideAngle: 0.85,
      // 侧弹相对速度减量。
      sideSpeedOffset: 70,
    },
    heavy: {
      // 重炮标签。
      label: "K-重炮",
      // 重炮冷却。
      cooldown: 0.22,
      // 单次补弹数量。
      ammoGain: 3,
      // 实际补弹数量围绕 ammoGain 的波动范围。
      ammoVariance: 1,
    },
    cluster: {
      // 集束导弹标签。
      label: "M-集束导弹",
      // 单次启动冷却。
      cooldown: 5.8,
      // 单次补弹数量。
      ammoGain: 1,
      // 连续发射时的间隔。
      fireInterval: 0.28,
    },
  },
  initialAmmo: {
    // 开局速射弹药。
    rapid: 5,
    // 开局扩散弹药。
    spread: 5,
    // 开局重炮弹药。
    heavy: 3,
    // 开局集束导弹数量。
    cluster: 0,
  },
  assets: {
    // 玩家飞机贴图。
    player: "./assets/player-plane.svg",
    // 普通敌机贴图。
    enemy: "./assets/enemy-plane.svg",
    // 突袭机贴图。
    assault: "./assets/assault-plane.svg",
    // 补给机贴图。
    supply: "./assets/supply-plane.svg",
    // 炸弹机贴图。
    bomber: "./assets/bomber-plane.svg",
    // boss 贴图。
    boss: "./assets/boss-plane.svg",
    // 第三关终局大 boss 贴图。
    finalBoss: "./assets/final-boss.svg",
    // 第三关终局大 boss 二阶段贴图。
    finalBossPhaseTwo: "./assets/final-boss-phase-two.svg",
    // 终局大 boss 被击毁后生成的黑洞贴图。
    blackHole: "./assets/black-hole.svg",
    // 生命掉落贴图。
    dropLife: "./assets/drop-life.svg",
    // H 弹药掉落贴图。
    dropRapid: "./assets/drop-rapid.svg",
    // J 弹药掉落贴图。
    dropSpread: "./assets/drop-spread.svg",
    // K 弹药掉落贴图。
    dropHeavy: "./assets/drop-heavy.svg",
    // M 导弹掉落贴图。
    dropCluster: "./assets/drop-cluster.svg",
    // 满生命陨石贴图。
    meteor3: "./assets/meteor-hp3.svg",
    // 受损一次的陨石贴图。
    meteor2: "./assets/meteor-hp2.svg",
    // 残血陨石贴图。
    meteor1: "./assets/meteor-hp1.svg",
  },
};
