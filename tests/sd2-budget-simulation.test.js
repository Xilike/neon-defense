import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../experimental/sd2.js', import.meta.url), 'utf8');

function run(seed) {
  let state = seed >>> 0;
  const random = () => ((state = (Math.imul(1664525, state) + 1013904223) >>> 0) / 4294967296);
  const store = new Map([['neonDefense2_test', 'production-sentinel'], ['neon_sd2_save', 'sd2-sentinel']]);
  const storage = {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key),
    key: i => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  const window = { localStorage: storage };
  const math = Object.create(Math);
  math.random = random;
  vm.runInNewContext(source, { window, localStorage: storage, Math: math, console });
  const { SD2 } = window;
  let clock = 0;
  let spawned = [];
  SD2.bind({
    now: () => clock,
    galaxyId: () => 'aurora',
    spawnEnemy: type => {
      const e = { type, hp: 100 };
      spawned.push(e);
      return e;
    },
    pickColor: () => 'cyan',
    countAlive: () => 0, // Test-only instant removal; not a combat simulation.
    applyUpgradeProfile: () => {},
  });
  SD2.cfg.schedule.enabled = true;
  window.SD2_DEBUG = { active: true, profile: 'mid' };
  const levels = [];
  for (let level = 1; level <= 15; level++) {
    spawned = [];
    clock = level * 10000;
    SD2.startLevel(level);
    const budget = SD2.budgetOf(level);
    const interval = SD2.intervalOf(level);
    const maxSteps = Math.ceil(budget) * 100 + 100;
    let steps = 0;
    // Advance enough virtual time for every eligible spawn without any actual browser wait.
    while (steps++ < maxSteps) {
      clock += Math.max(1, interval * 2);
      SD2.tick();
      const report = SD2.report().levels.find(x => x.level === level);
      if (report && report.tBudgetDone != null) break;
    }
    levels.push({ level, budget, spawned: spawned.map(e => e.type), report: SD2.report().levels.find(x => x.level === level) });
  }
  return { levels, store };
}

describe('Stage Director V2 deterministic spawn-budget simulation', () => {
  it.each([1, 42, 2026, 987654])('never exceeds budget and terminates for seed %i', seed => {
    const { levels, store } = run(seed);
    expect(levels).toHaveLength(15);
    for (const { level, budget, spawned, report } of levels) {
      expect(spawned.length, 'level ' + level).toBeGreaterThan(0);
      const costs = { NORMAL: 1, RUNNER: 1.5, SPLITTER: 2.5, TANK: 3, SHIELDED: 4 };
      const spent = spawned.reduce((total, type) => total + costs[type], 0);
      expect(spent, 'level ' + level).toBeLessThanOrEqual(budget + 1e-9);
      expect(report?.tBudgetDone, 'level ' + level).not.toBeNull();
    }
    expect(store.get('neonDefense2_test')).toBe('production-sentinel');
    expect(store.get('neon_sd2_save')).toBe('sd2-sentinel');
  });
  it('repeats identical enemy order for identical random seed', () => {
    expect(run(13579).levels.map(x => x.spawned)).toEqual(run(13579).levels.map(x => x.spawned));
  });
});
