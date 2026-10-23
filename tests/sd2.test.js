import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const source = readFileSync(new URL('../experimental/sd2.js', import.meta.url), 'utf8');
function load() {
  const store = new Map([['neonDefense2_test', '{"progress":1}']]);
  const storage = {
    getItem: key => store.has(key) ? store.get(key) : null,
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: key => store.delete(key),
    key: i => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  const window = { localStorage: storage };
  vm.runInNewContext(source, { window, localStorage: storage, console });
  return { SD2: window.SD2, window, store };
}
describe('Stage Director V2 isolated budget rules', () => {
  it('defines 15 finite positive budgets and nonzero intervals', () => {
    const { SD2 } = load();
    for (let level = 1; level <= 15; level++) {
      expect(SD2.budgetOf(level)).toBeGreaterThan(0);
      expect(Number.isFinite(SD2.intervalOf(level))).toBe(true);
      expect(SD2.intervalOf(level)).toBeGreaterThan(0);
    }
  });
  it('applies gradual mid schedule starting at zero', () => {
    const { SD2, window } = load();
    const applied = [];
    SD2.bind({
      now: () => 0, galaxyId: () => 'aurora', spawnEnemy: () => null,
      pickColor: () => 'red', countAlive: () => 0,
      applyUpgradeProfile: p => applied.push(p),
    });
    SD2.cfg.schedule.enabled = true;
    window.SD2_DEBUG = { active: true, profile: 'mid' };
    for (let level = 1; level <= 15; level++) SD2.startLevel(level);
    expect(applied.map(p => p.damage)).toEqual([0,0,1,1,1,1,2,2,2,3,3,3,4,4,4]);
    expect(applied.every(p => p.damage === p.rate && p.rate === p.range)).toBe(true);
  });
});
