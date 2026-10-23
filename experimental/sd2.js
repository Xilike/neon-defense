/* =====================================================================
   sd2.js — Stage Director V2 (Aurora) — نسخة تجريبية مستقلة
   ---------------------------------------------------------------------
   الملف ده مش بيعرّف أي دالة بديلة للعبة. كل اللي محتاجه من اللعبة بيدخل
   من SD2.bind({...}) وبيرمي خطأ واضح لو ناقص حاجة مطلوبة.

   نقاط الربط (كلها أسطر قليلة في index.html بتاع النسخة التجريبية):

   0. أول الملف: <script src="sd2.js"></script> وبعده SD2.bind({...}) (تحت).
      و SAVE_KEY = 'neon_sd2_save' في النسخة التجريبية فقط.
   1. Director.update(): خليه يشغّل تحديثات التهديد وإصلاح القاعدة زي ما هي، وغلّف
      مصادر الظهور القديمة (spawnOne / التعويض / التوقيت / الأحداث الجماعية) بـ:
        if (SD2.isActive()) SD2.tick(); else { ...المنطق القديم... }
   2. أول spawnEnemy(type,...):   SD2.guardSpawn(type);
   3. كود تقسيم الـ Splitter:      const c = SD2.spawnChild(childType, () => spawnEnemy(childType,color,lane,t0), parent);
   4. لما الـ Guardian يتولد:      SD2.onGuardianSpawn(e);
   5. killEnemy() جوه if(!e.rewarded) بعد addCoins:  SD2.onKill(e, coins);
   6. منطق خصم S.baseHP لما عدو يوصل:  SD2.onBreach(e, dmg);
   7. onStageBossDefeated(): احفظ doneLevel قبل تحديث gp.cleared ثم:
        SD2.onGuardianDefeated(e, doneLevel, nextLevel (أو null لو آخر زعيم));
   8. بداية Aurora (أو تحميلها): SD2.startLevel(currentLevel);
   8b. عند Game Over (القاعدة خلصت): SD2.onDefeat('baseDestroyed');
   9. persist(): if (typeof SD2_DEBUG !== 'undefined' && SD2_DEBUG.active) return;
   ===================================================================== */
(function (global) {
  'use strict';

  /* ---------------------------- الإعدادات ---------------------------- */
  const CFG = {
    enabled: true,
    galaxy: 'aurora',            // لازم يطابق G.id
    levels: 15,
    maxAlive: 12,                // سقف الأعداء الأحياء (آيفون رأسي)
    childAllowance: 6,           // زيادة مسموحة لأبناء الـ Splitter
    stageDuration: 125,           // ثواني — مدة توزيع ميزانية المستوى
    firstSpawnDelay: 1,
    jitter: 0.2,                 // ±20% على فاصل الظهور عشان ما يبقاش إيقاع ثابت
    baseBudget: 25,
    growth: 1.10,
    keys: { main: 'neonDefense2_test', sd2: 'neon_sd2_save', log: 'SD2_LOG' },

    // أسماء الأنواع لازم تطابق مفاتيح ENEMY_DEF في اللعبة (راجعها)
    order: ['NORMAL', 'RUNNER', 'SPLITTER', 'TANK', 'SHIELDED'],
    costs:   { NORMAL: 1, RUNNER: 1.5, SPLITTER: 2.5, TANK: 3, SHIELDED: 4 },
    rewards: { NORMAL: 9, RUNNER: 13, SPLITTER: 14, TANK: 27, SHIELDED: 25 },

    // أوزان الظهور لكل مستوى: [NORMAL, RUNNER, SPLITTER, TANK, SHIELDED]
    weights: {
      1: [85, 15, 0, 0, 0],   2: [70, 30, 0, 0, 0],   3: [55, 45, 0, 0, 0],      // First Contact
      4: [60, 25, 0, 15, 0],  5: [45, 25, 0, 30, 0],  6: [35, 25, 0, 40, 0],     // Armored Assault
      7: [35, 20, 25, 20, 0], 8: [30, 20, 30, 20, 0], 9: [25, 20, 35, 20, 0],    // Splitter Invasion
      10: [30, 20, 10, 25, 15], 11: [25, 20, 15, 20, 20], 12: [20, 20, 15, 20, 25], // Shield Formation
      13: [20, 20, 20, 20, 20], 14: [15, 25, 20, 20, 20],                        // Chaos Protocol
      15: [15, 20, 20, 20, 25]                                                   // Overlord escorts
    },
    stageNames: ['First Contact', 'Armored Assault', 'Splitter Invasion', 'Shield Formation', 'Chaos Protocol', 'Aurora Overlord'],

    // بروفايلات الـ Debug: مستويات الترقيات (من سقف 6). تطبيقها بيتم عبر adapter.applyUpgradeProfile
    // جدول ترقيات متدرج (اختياري): يتطبق عند بداية كل مستوى في Debug ويفضل مقفول أثناءه
    schedule: { enabled: false, cap: 6, span: 14, f: { new: 0.4, mid: 0.7, adv: 1.0 } },
    profiles: {
      new: { label: 'جديد',  weapon: 'electric', damage: 0, rate: 0, range: 0, baseHP: 0 },
      mid: { label: 'متوسط', weapon: 'electric', damage: 3, rate: 3, range: 3, baseHP: 3 },
      adv: { label: 'متقدم', weapon: 'electric', damage: 6, rate: 6, range: 6, baseHP: 6 }
    }
  };

  /* ------------------------ الربط مع اللعبة ------------------------- */
  const REQUIRED = ['now', 'galaxyId', 'spawnEnemy', 'pickColor', 'countAlive'];
  const OPTIONAL = ['hpOf', 'getEffectiveDPS', 'expectedArrival', 'getTotalCoins', 'applyUpgradeProfile', 'getUpgradeLevels', 'lockPurchases', 'onBudgetDone'];
  let ad = null;

  function bind(adapter) {
    const missing = REQUIRED.filter(k => typeof adapter[k] !== 'function');
    if (missing.length) throw new Error('SD2.bind: missing adapter functions: ' + missing.join(', '));
    ad = adapter;
    return true;
  }
  const need = () => { if (!ad) throw new Error('SD2: call SD2.bind() first'); };
  const hpOf = e => (ad.hpOf ? ad.hpOf(e) : (e.maxhp != null ? e.maxhp : e.maxHP));

  /* ------------------------ جدول الميزانية -------------------------- */
  function sawFactor(L) {
    if (L === CFG.levels) return 1.3;
    const p = L % 3;
    if (p === 1) return L === 1 ? 0.8 : 0.7;  // أول مستوى، أو راحة بعد Guardian
    return p === 2 ? 1.0 : 1.2;
  }
  const budgetOf = L => Math.round(CFG.baseBudget * Math.pow(CFG.growth, L - 1) * sawFactor(L));
  const weightsOf = L => CFG.weights[Math.min(Math.max(L, 1), CFG.levels)];
  function avgCost(L) {
    const w = weightsOf(L); let s = 0, c = 0;
    CFG.order.forEach((t, i) => { s += w[i]; c += w[i] * CFG.costs[t]; });
    return c / s;
  }
  const stageName = L => CFG.stageNames[L === 15 ? 5 : L >= 13 ? 4 : Math.floor((L - 1) / 3)];
  const intervalOf = L => CFG.stageDuration / (budgetOf(L) / avgCost(L));

  /* --------------------------- حالة الظهور -------------------------- */
  const ST = { level: 0, spent: 0, budget: 0, closed: false, readyFired: false, nextSpawn: 0, last: [], allow: false, source: null };

  function authorized(source, cb) {
    const pa = ST.allow, ps = ST.source;
    ST.allow = true; ST.source = source;
    try { return cb(); } finally { ST.allow = pa; ST.source = ps; }
  }

  function pickType(L, remaining) {
    const w = weightsOf(L);
    const cand = [];
    CFG.order.forEach((t, i) => { if (w[i] > 0 && CFG.costs[t] <= remaining + 1e-9) cand.push([t, w[i]]); });
    if (!cand.length) return null;
    // قاعدة الملل: لو آخر نوعين متطابقين، استبعد النوع ده من المرشحين (لو في بديل)
    let pool = cand;
    if (ST.last.length === 2 && ST.last[0] === ST.last[1]) {
      const alt = cand.filter(c => c[0] !== ST.last[0]);
      if (alt.length) pool = alt;
    }
    let sum = 0; pool.forEach(c => sum += c[1]);
    let r = Math.random() * sum;
    for (const c of pool) { r -= c[1]; if (r <= 0) return c[0]; }
    return pool[0][0];
  }

  /* ------------------------------ Logger ----------------------------- */
  const DATA = {};
  const cats = () => ({ budget: 0, splitChild: 0, guardian: 0 });
  function newLevel(L) {
    const prev = DATA[L];
    return {
      level: L, stage: stageName(L), attempt: prev ? prev.attempt + 1 : 1,
      budget: budgetOf(L), spent: 0, sumCost: 0, t0: ad.now(), t1: null,
      spawned: cats(), killed: cats(), breached: cats(),
      byType: { spawned: {}, killed: {}, breached: {} },
      coins: { enemies: 0, splitChild: 0, boss: 0 },
      hp: { enemies: 0, splitChild: 0, guardian: 0 },
      survival: { sum: 0, n: 0 }, arrival: { sum: 0, n: 0 },
      maxAlive: 0, hpLost: 0,
      econStart: ad.getTotalCoins ? ad.getTotalCoins() : null, econEnd: null,
      effDPS: null, dpsStart: ad.getEffectiveDPS ? ad.getEffectiveDPS() : null,
      upgradesStart: ad.getUpgradeLevels ? JSON.stringify(ad.getUpgradeLevels()) : null, upgradesEnd: null,
      debugAtStart: !!(global.SD2_DEBUG && global.SD2_DEBUG.active), profile: global.SD2_DEBUG ? global.SD2_DEBUG.profile : null,
      guardianAt: null,
      tBudgetDone: null, tCleared: null, tGuardian: null, v: { dupDeath: 0, unauthorized: 0, orphan: 0 }
    };
  }
  const bump = (o, k) => { o[k] = (o[k] || 0) + 1; };
  const cur = () => DATA[ST.level];

  function tag(e, type, cat, L) {
    e.spawnLevel = L; e.sd2cat = cat; e.sd2type = type; e.spawnTime = ad.now(); e.sd2done = false;
    const d = DATA[L]; if (!d) return;
    d.spawned[cat]++; bump(d.byType.spawned, type);
    const hp = hpOf(e) || 0;
    if (cat === 'guardian') d.hp.guardian = hp; else d.hp[cat === 'splitChild' ? 'splitChild' : 'enemies'] += hp;
    if (ad.expectedArrival && cat !== 'guardian') { d.arrival.sum += ad.expectedArrival(type); d.arrival.n++; }
  }

  function finish(e, kind, coins, dmg) {
    if (!e.sd2cat) { const d = cur(); if (d) d.v.orphan++; return null; }
    const d = DATA[e.spawnLevel]; if (!d) return null;
    if (e.sd2done) { d.v.dupDeath++; return null; }   // نفس العدو اتسجل مرتين (مكافأة/وفاة مكررة)
    e.sd2done = true;
    d[kind][e.sd2cat]++; bump(d.byType[kind], e.sd2type);
    if (e.sd2cat !== 'guardian') { d.survival.sum += ad.now() - e.spawnTime; d.survival.n++; }
    if (kind === 'killed') {
      const k = e.sd2cat === 'guardian' ? 'boss' : e.sd2cat === 'splitChild' ? 'splitChild' : 'enemies';
      d.coins[k] += coins || 0;
    } else d.hpLost += dmg || 0;
    return d;
  }

  const aliveOf = (d, c) => d.spawned[c] - d.killed[c] - d.breached[c];
  const aliveLevel = d => aliveOf(d, 'budget') + aliveOf(d, 'splitChild');

  function saveLog() { try { localStorage.setItem(CFG.keys.log, JSON.stringify(DATA)); } catch (e) {} }

  /* ------------------------------ الواجهة العامة --------------------- */
  const SD2 = {
    cfg: CFG, bind, budgetOf, avgCost, intervalOf, authorized,
    isActive() { need(); return CFG.enabled && ad.galaxyId() === CFG.galaxy; },

    startLevel(L) {
      need();
      ST.scheduleN = null;
      const sc = CFG.schedule, dbg = global.SD2_DEBUG;
      if (dbg && dbg.active && sc.enabled && ad.applyUpgradeProfile && sc.f[dbg.profile] != null) {
        // لازم يتطبق قبل newLevel عشان dpsStart يتسجل بعد الترقيات
        const n = Math.min(sc.cap, Math.round(sc.cap * (L - 1) / sc.span * sc.f[dbg.profile]));
        ad.applyUpgradeProfile({ weapon: 'electric', damage: n, rate: n, range: n, baseHP: n, scheduled: true, level: L });
        ST.scheduleN = n;
      }
      ST.level = L; ST.budget = budgetOf(L); ST.spent = 0; ST.closed = false; ST.readyFired = false; ST.last = [];
      ST.nextSpawn = ad.now() + CFG.firstSpawnDelay;
      DATA[L] = newLevel(L);
      DATA[L].scheduleN = ST.scheduleN != null ? ST.scheduleN : null;
    },

    tick() {                                   // يتنادى كل فريم من Director.update()
      need(); const d = cur(); if (!d) return;
      const alive = ad.countAlive();
      if (alive > d.maxAlive) d.maxAlive = alive;
      if (ST.closed) {
        if (!ST.readyFired && aliveLevel(d) === 0) { ST.readyFired = true; d.tCleared = ad.now(); if (ad.onBudgetDone) ad.onBudgetDone(ST.level); }
        return;
      }
      const now = ad.now();
      if (now < ST.nextSpawn || alive >= CFG.maxAlive) return;
      const type = pickType(ST.level, ST.budget - ST.spent);
      if (!type) { ST.closed = true; if (d.tBudgetDone == null) d.tBudgetDone = now; return; }          // الباقي أقل من أرخص نوع
      const e = authorized('budget', () => ad.spawnEnemy(type, ad.pickColor()));
      if (!e) return;
      ST.spent += CFG.costs[type]; d.spent = ST.spent; d.sumCost += CFG.costs[type];
      console.assert(ST.spent <= ST.budget + 1e-9, 'SD2: budget exceeded');
      ST.last.unshift(type); ST.last.length = Math.min(ST.last.length, 2);
      tag(e, type, 'budget', ST.level);
      const j = 1 + (Math.random() * 2 - 1) * CFG.jitter;
      ST.nextSpawn = now + intervalOf(ST.level) * j;
      if (ST.budget - ST.spent < Math.min(...CFG.order.filter((t, i) => weightsOf(ST.level)[i] > 0).map(t => CFG.costs[t])) - 1e-9) { ST.closed = true; if (d.tBudgetDone == null) d.tBudgetDone = now; }
    },

    guardSpawn(type) {                         // أول spawnEnemy — تشخيص فقط، مش بيمنع
      if (!ad || !CFG.enabled || ad.galaxyId() !== CFG.galaxy) return;
      if (ST.allow || type === 'BOSS') return;
      const d = cur(); if (d) d.v.unauthorized++;
      console.warn('SD2: unauthorized spawn', type, ST.source, new Error().stack);
    },

    spawnChild(childType, factory, parent) {   // أبناء الـ Splitter: من غير خصم ميزانية
      need();
      const c = authorized('splitChild', factory);
      if (c && parent && parent.spawnLevel != null) {
        tag(c, childType, 'splitChild', parent.spawnLevel);
        c.isSplitChild = true;
        const d = DATA[parent.spawnLevel];
        if (d && ad.countAlive() > CFG.maxAlive + CFG.childAllowance) d.v.overCap = (d.v.overCap || 0) + 1;
      }
      return c;
    },

    onGuardianSpawn(e) {
      need();
      const dd = DATA[e.spawnLevel != null ? e.spawnLevel : ST.level];
      if (dd && dd.tGuardian == null) {
        dd.tGuardian = ad.now();
        dd.guardianAt = { budgetDone: ST.closed, spent: ST.spent, budget: ST.budget, aliveLevelEnemies: aliveLevel(dd), budgetDoneTime: dd.tBudgetDone, clearedTime: dd.tCleared };
      }
      tag(e, 'BOSS', 'guardian', e.spawnLevel != null ? e.spawnLevel : ST.level); },
    onKill(e, coins) { need(); finish(e, 'killed', coins); },
    onBreach(e, dmg) { need(); finish(e, 'breached', 0, dmg); },

    onGuardianDefeated(e, doneLevel, nextLevel) {   // doneLevel لازم يتحفظ قبل تحديث gp.cleared
      need();
      const L = e && e.spawnLevel != null ? e.spawnLevel : doneLevel;
      const d = DATA[L];
      if (d) {
        d.t1 = ad.now();
        d.econEnd = ad.getTotalCoins ? ad.getTotalCoins() : null;
        d.effDPS = ad.getEffectiveDPS ? ad.getEffectiveDPS() : null;
        d.upgradesEnd = ad.getUpgradeLevels ? JSON.stringify(ad.getUpgradeLevels()) : null;
      }
      saveLog();
      if (nextLevel != null) SD2.startLevel(nextLevel);
    },

    onDefeat(reason) {                         // يتنادى لما القاعدة تخلص (Game Over) — بيسجل نقطة الخسارة
      need(); const d = cur(); if (!d) return;
      d.t1 = ad.now();
      d.effDPS = ad.getEffectiveDPS ? ad.getEffectiveDPS() : null;
      d.upgradesEnd = ad.getUpgradeLevels ? JSON.stringify(ad.getUpgradeLevels()) : null;
      d.defeat = { reason: reason || null, atSec: +(d.t1 - d.t0).toFixed(1), spent: d.spent, budget: d.budget, hpLost: d.hpLost, alive: aliveLevel(d), guardianSpawned: d.tGuardian != null };
      saveLog();
    },
    isReadyForGuardian() { const d = cur(); return !!(d && ST.closed && aliveLevel(d) === 0); },
    state() { return JSON.parse(JSON.stringify(ST)); },

    /* ------------------------- التقرير والتصدير ----------------------- */
    summarize(d) {
      const alive = {}, conserve = {};
      ['budget', 'splitChild', 'guardian'].forEach(c => {
        alive[c] = aliveOf(d, c);
        conserve[c] = d.spawned[c] === d.killed[c] + alive[c] + d.breached[c] && alive[c] >= 0;
      });
      const totalHP = d.hp.enemies + d.hp.splitChild;
      const avgSurv = d.survival.n ? d.survival.sum / d.survival.n : null;
      const avgArr = d.arrival.n ? d.arrival.sum / d.arrival.n : null;
      const ph = (a, b) => (a != null && b != null) ? +(b - a).toFixed(1) : null;
      const phases = { spawnPhase: ph(d.t0, d.tBudgetDone), clearPhase: ph(d.tBudgetDone, d.tCleared), guardianPhase: ph(d.tGuardian, d.t1), totalDuration: ph(d.t0, d.t1) };
      const dpsAvg = (d.dpsStart != null && d.effDPS != null) ? (d.dpsStart + d.effDPS) / 2 : (d.effDPS != null ? d.effDPS : d.dpsStart);
      const spawnDur = d.tBudgetDone != null ? d.tBudgetDone - d.t0 : null;
      const clearDur = d.tCleared != null ? d.tCleared - d.t0 : null;
      const R_legacy = (d.effDPS && avgArr) ? +(totalHP / (d.effDPS * avgArr)).toFixed(3) : null;   // الصيغة القديمة للمقارنة فقط
      const R = (dpsAvg && spawnDur) ? +(totalHP / (dpsAvg * spawnDur)).toFixed(3) : null;          // الأساسي: مدة توزيع الميزانية
      const R_planned = dpsAvg ? +(totalHP / (dpsAvg * CFG.stageDuration)).toFixed(3) : null;   // بمدة 60ث المخططة (مش المتأثرة بسقف 12)
      const R_clear = (dpsAvg && clearDur) ? +(totalHP / (dpsAvg * clearDur)).toFixed(3) : null;    // لحد تنظيف آخر عدو
      const upgradesChanged = (d.upgradesStart != null && d.upgradesEnd != null) ? d.upgradesStart !== d.upgradesEnd : null;
      const ga = d.guardianAt;
      const defeat = d.defeat || null;
      const coinsAll = d.coins.enemies + d.coins.splitChild + d.coins.boss;
      const pct = x => coinsAll ? +(100 * x / coinsAll).toFixed(1) : null;
      const coinsShare = { enemiesPct: pct(d.coins.enemies), splitChildPct: pct(d.coins.splitChild), bossPct: pct(d.coins.boss) };
      const econDelta = (d.econStart != null && d.econEnd != null) ? d.econEnd - d.econStart : null;
      const hard = CFG.maxAlive + CFG.childAllowance;
      const warnings = [];
      if (d.maxAlive > CFG.maxAlive) warnings.push('maxAlive ' + d.maxAlive + ' > ' + CFG.maxAlive + ' (أبناء/زعيم)');
      if (d.maxAlive > hard) warnings.push('تجاوز السقف الصلب ' + hard);
      if (d.v.unauthorized) warnings.push('ظهور غير مصرح: ' + d.v.unauthorized);
      if (d.v.orphan) warnings.push('أعداء بدون spawnLevel: ' + d.v.orphan);
      if (!d.debugAtStart) warnings.push('المستوى اتلعب خارج Debug — مش للمقارنة بين البروفايلات');
      if (d.debugAtStart && upgradesChanged) warnings.push('الترقيات اتغيّرت أثناء المستوى في Debug — المقارنة مش عادلة');
      if (defeat) warnings.push('خسارة في المستوى ' + d.level + ' عند ' + defeat.atSec + 'ث');
      if (d.v.dupDeath) warnings.push('تسجيل مكرر للموت/المكافأة: ' + d.v.dupDeath);
      return {
        level: d.level, stage: d.stage, attempt: d.attempt, budget: d.budget, spent: d.spent,
        duration: d.t1 != null ? +(d.t1 - d.t0).toFixed(1) : null,
        spawned: d.spawned, killed: d.killed, breached: d.breached, alive,
        byType: d.byType, coins: d.coins, coinsTotal: coinsAll, econDelta,
        hp: { totalEnemyHP: totalHP, guardianHP: d.hp.guardian },
        avgSurvival: avgSurv, avgExpectedArrival: avgArr, dpsStart: d.dpsStart, dpsEnd: d.effDPS, R, R_planned, R_clear, R_legacy, phases, scheduleN: d.scheduleN, defeat, coinsShare,
        tBudgetDone: spawnDur != null ? +spawnDur.toFixed(1) : null,
        upgrades: { start: d.upgradesStart ? JSON.parse(d.upgradesStart) : null, end: d.upgradesEnd ? JSON.parse(d.upgradesEnd) : null, changedDuringLevel: upgradesChanged },
        profile: d.profile, debugAtStart: d.debugAtStart, guardianAt: ga,
        hpLost: d.hpLost, maxAlive: d.maxAlive, warnings,
        checks: {
          budgetNotExceeded: d.spent <= d.budget + 1e-9,
          costSumEqualsSpent: Math.abs(d.sumCost - d.spent) < 1e-9,
          conservation: conserve,
          noDuplicateRewards: d.v.dupDeath === 0,
          noUnauthorizedSpawns: d.v.unauthorized === 0,
          noOrphans: d.v.orphan === 0,
          withinHardCap: d.maxAlive <= hard,
          debugActive: d.debugAtStart,
          noUpgradeChangeInDebug: (d.debugAtStart && upgradesChanged != null) ? !upgradesChanged : 'n/a',
          guardianAfterBudget: ga ? (ga.budgetDone === true && ga.aliveLevelEnemies === 0) : 'n/a',
          guardianAfterClear: (d.tGuardian != null && d.tCleared != null) ? d.tGuardian >= d.tCleared : 'n/a',
          coinsMatchEcon: econDelta == null ? 'n/a' : Math.round(coinsAll) === Math.round(econDelta)
        }
      };
    },

    report() {
      const levels = Object.keys(DATA).map(Number).sort((a, b) => a - b).map(L => SD2.summarize(DATA[L]));
      return {
        generatedAt: new Date().toISOString(), profile: global.SD2_DEBUG ? global.SD2_DEBUG.profile : null,
        debug: !!(global.SD2_DEBUG && global.SD2_DEBUG.active),
        config: { maxAlive: CFG.maxAlive, stageDuration: CFG.stageDuration, costs: CFG.costs, rewards: CFG.rewards },
        plannedBudgets: Array.from({ length: CFG.levels }, (_, i) => ({ level: i + 1, budget: budgetOf(i + 1), interval: +intervalOf(i + 1).toFixed(2) })),
        levels, saveIsolation: SD2.debug.verify(),
        debugChecks: { active: !!(global.SD2_DEBUG && global.SD2_DEBUG.active), profile: global.SD2_DEBUG ? global.SD2_DEBUG.profile : null, enteredAt: SD2.debug.enteredAt || null, purchasesLocked: !!(ad && ad.lockPurchases) }
      };
    },

    exportJSON() {
      saveLog();
      const json = JSON.stringify(SD2.report(), null, 2);
      try {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
        a.download = 'sd2-report-' + Date.now() + '.json';
        document.body.appendChild(a); a.click(); a.remove();
      } catch (e) {}
      if (navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
      return json;
    }
  };

  /* --------------------------- Debug Profiles ------------------------ */
  global.SD2_DEBUG = global.SD2_DEBUG || { active: false, profile: 'new' };
  let snap = null;
  const rawKeys = () => Object.keys(localStorage).filter(k => k !== CFG.keys.log && k !== 'neonDefense_panelCollapsed_v1').sort().join();
  const takeSnap = () => ({ main: localStorage.getItem(CFG.keys.main), sd2: localStorage.getItem(CFG.keys.sd2), keys: rawKeys() });

  SD2.debug = {
    enter(name) {
      need();
      const p = CFG.profiles[name];
      if (!p) throw new Error('SD2.debug: unknown profile ' + name);
      if (!ad.applyUpgradeProfile) throw new Error('SD2.debug: adapter.applyUpgradeProfile مطلوب (بيطبّق الترقيات على نسخة SAVE مؤقتة في الذاكرة)');
      global.SD2_DEBUG.active = true;          // لازم يحصل قبل أي تعديل عشان persist() يقف
      global.SD2_DEBUG.profile = name;
      snap = takeSnap();
      ad.applyUpgradeProfile(p);
      if (ad.lockPurchases) ad.lockPurchases(true);   // يمنع الشراء اليدوي أثناء الاختبار (لو متوفر)
      SD2.debug.enteredAt = new Date().toISOString();
      SD2.debug.mountUI();
    },
    exit() { location.reload(); },             // أنضف من محاولة إرجاع القيم يدويًا
    verify() {
      if (!snap) return { checked: false };
      const now = takeSnap(), diffs = [];
      if (now.main !== snap.main) diffs.push(CFG.keys.main + ' اتغيّر');
      if (now.sd2 !== snap.sd2) diffs.push(CFG.keys.sd2 + ' اتغيّر');
      if (now.keys !== snap.keys) diffs.push('قائمة مفاتيح localStorage اتغيّرت');
      return { checked: true, ok: diffs.length === 0, diffs };
    },
    mountUI() {
      if (document.getElementById('sd2-ui')) return;
      const box = document.createElement('div');
      box.id = 'sd2-ui';
      box.style.cssText = 'position:fixed;left:0;right:0;top:0;z-index:99999;display:flex;gap:8px;align-items:center;justify-content:center;padding:4px 8px;background:#b00020;color:#fff;font:12px sans-serif;direction:rtl';
      box.innerHTML = '<span>DEBUG — لا يُحفظ (' + global.SD2_DEBUG.profile + ')</span>';
      const mk = (t, f) => { const b = document.createElement('button'); b.textContent = t; b.style.cssText = 'font:12px sans-serif;padding:2px 8px'; b.onclick = f; box.appendChild(b); };
      mk('Export JSON', () => SD2.exportJSON());
      mk('خروج', () => SD2.debug.exit());
      document.body.appendChild(box);
    }
  };

  global.SD2 = SD2;
})(typeof window !== 'undefined' ? window : globalThis);

