import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Analytical pressure estimate, NOT a game-engine combat simulation.
// All constants are extracted from the GitHub development-branch source at the time of authoring;
// source drift is checked below to prevent silent calibration changes.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sd2source = readFileSync(new URL('../experimental/sd2.js', import.meta.url), 'utf8');
const enemy = {
  NORMAL: { hp: 80, speed: .045, breach: 8 },
  RUNNER: { hp: 60, speed: .080, breach: 10 },
  SPLITTER: { hp: 130, speed: .045, breach: 12 },
  TANK: { hp: 300, speed: .031, breach: 20 },
  SHIELDED: { hp: 220, speed: .036, breach: 16 },
};
const weights = [
  [85,15,0,0,0],[70,30,0,0,0],[55,45,0,0,0],
  [60,25,0,15,0],[45,25,0,30,0],[35,25,0,40,0],
  [35,20,25,20,0],[30,20,30,20,0],[25,20,35,20,0],
  [30,20,10,25,15],[25,20,15,20,20],[20,20,15,20,25],
  [20,20,20,20,20],[15,25,20,20,20],[15,20,20,20,25],
];
const types = Object.keys(enemy);
const costs = { NORMAL:1,RUNNER:1.5,SPLITTER:2.5,TANK:3,SHIELDED:4 };
const cfg = (() => {
  const sandbox = { window: {}, console };
  vm.runInNewContext(sd2source, sandbox);
  return sandbox.window.SD2;
})();
function estimate(level, profile='mid') {
  const upgrade = Math.min(6,Math.round(6*(level-1)/14*({new:.4,mid:.7,adv:1}[profile])));
  const dps = 14*Math.pow(1.12,upgrade)*Math.min(20,2.8*Math.pow(1.08,upgrade));
  const w = weights[level-1];
  const total = w.reduce((a,b)=>a+b,0);
  const avgHp = w.reduce((sum,p,i)=>sum+p*enemy[types[i]].hp,0)/total;
  const avgCost = w.reduce((sum,p,i)=>sum+p*costs[types[i]],0)/total;
  const interval = cfg.intervalOf(level);
  const demandDps = avgHp/interval;
  return {level,upgrade,dps:+dps.toFixed(2),interval:+interval.toFixed(2),avgHp:+avgHp.toFixed(1),demandDps:+demandDps.toFixed(2),pressure:+(demandDps/dps).toFixed(2),estimatedEnemies:Math.round(cfg.budgetOf(level)/avgCost)};
}
describe('SD2 source-calibrated pressure indicators (not actual breach outcomes)',()=>{
  it('matches the baseline electric weapon parameters',()=>{
    expect(html).toMatch(/ELECTRIC:\s*\{[^\n]*dmg:\s*14,\s*rate:\s*2\.8/);
    expect(html).toMatch(/d\.dmg \* Math\.pow\(1\.12, u\.eDmg\)/);
    expect(html).toMatch(/d\.rate \* Math\.pow\(1\.08, u\.eRate\)/);
  });
  it('matches enemy HP reference values',()=>{
    for(const [type,stats] of Object.entries(enemy)){
      const line = html.split('\n').find(x=>new RegExp('^\\s*'+type+':\\s*\\{\\s*hp:').test(x));
      expect(line,'Missing enemy '+type).toBeTruthy();
      expect(line).toMatch(new RegExp('hp:\\s*'+stats.hp+'\\b'));
    }
  });
  it('produces finite 15-level indicators for each debug profile',()=>{
    for(const profile of ['new','mid','adv']) for(let level=1;level<=15;level++){
      const x=estimate(level,profile);
      expect(x.dps).toBeGreaterThan(0);
      expect(x.pressure).toBeGreaterThan(0);
      expect(x.estimatedEnemies).toBeGreaterThan(0);
    }
  });
  it('reports an explicit mid difficulty diagnostic without pretending to simulate kills',()=>{
    const rows=Array.from({length:15},(_,i)=>estimate(i+1));
    console.log('SD2 analytical pressure mid:',JSON.stringify(rows));
    expect(rows[0].upgrade).toBe(0);
    expect(rows[14].upgrade).toBe(4);
  });
});
