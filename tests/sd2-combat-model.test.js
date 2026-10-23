import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Controlled combat approximation: real SD2 spawning, real dev-branch enemy
// HP/speed/breach constants and electric DPS formula. Simplifications:
// one electric turret, instant damage application, no range/aim/projectiles,
// color bonus, shield cycling, slow, split children, boss or adaptive scaling.
// Do NOT use these outcomes as proof of actual game difficulty.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sd2 = readFileSync(new URL('../experimental/sd2.js', import.meta.url), 'utf8');
const types = ['NORMAL','RUNNER','SPLITTER','TANK','SHIELDED'];
function numberFromLine(type, field) {
  const line = html.split('\n').find(x => new RegExp('^\\s*'+type+':\\s*\\{\\s*hp:').test(x));
  if (!line) throw new Error('Missing source definition: '+type);
  const match = line.match(new RegExp('\\b'+field+':\\s*([0-9.]+)'));
  if (!match) throw new Error('Missing '+type+'.'+field);
  return Number(match[1]);
}
const enemies = Object.fromEntries(types.map(t => [t, Object.fromEntries(['hp','speed','breach'].map(k => [k,numberFromLine(t,k)]))]));
function simulate(seed, profile='mid', dpsFactor=1) {
  let rng = seed >>> 0;
  const random = () => ((rng = (Math.imul(rng,1664525)+1013904223)>>>0)/4294967296);
  const math = Object.create(Math); math.random = random;
  const storageMap = new Map([['neonDefense2_test','original'],['neon_sd2_save','original-sd2']]);
  const localStorage = {getItem:k=>storageMap.get(k)??null,setItem:(k,v)=>storageMap.set(k,String(v)),removeItem:k=>storageMap.delete(k),key:i=>[...storageMap.keys()][i],get length(){return storageMap.size;}};
  const window = {localStorage};
  vm.runInNewContext(sd2,{window,localStorage,Math:math,console});
  const director = window.SD2;
  let time=0, active=[], upgrade=0, health=120, breaches=0, kills=0;
  const rows=[];
  director.bind({
    now:()=>time, galaxyId:()=> 'aurora', pickColor:()=> 'cyan',
    countAlive:()=>active.length,
    spawnEnemy:type=>{
      const spec=enemies[type];if(!spec)throw new Error('unknown type '+type);
      const e={type,hp:spec.hp,remaining:1/spec.speed};
      active.push(e);return e;
    },
    applyUpgradeProfile:p=>{upgrade=p.damage;},
    getEffectiveDPS:()=>14*2.8*Math.pow(1.10,2*upgrade),
  });
  director.cfg.schedule.enabled=true;
  window.SD2_DEBUG={active:true,profile};
  const dt=.1;
  for(let level=1;level<=15;level++){
    health=120+25*upgrade;
    active=[];breaches=0;kills=0;
    director.startLevel(level);
    const budget=director.budgetOf(level);
    const start=time;
    // Each stage is independent; no boss, healing or upgrades purchased mid-stage.
    let finished=false;
    for(let step=0;step<18000;step++){
      time+=dt;
      director.tick();
      // Single turret, focus fire on closest target; continuous deterministic DPS.
      let damage=14*2.8*Math.pow(1.10,2*upgrade)*dpsFactor*dt;
      for(const e of active)e.remaining-=dt;
      active.sort((a,b)=>a.remaining-b.remaining);
      while(damage>0&&active.length){
        const target=active[0];
        const dealt=Math.min(damage,target.hp);
        target.hp-=dealt;damage-=dealt;
        if(target.hp<=1e-8){active.shift();kills++;}
        else break;
      }
      for(let i=active.length-1;i>=0;i--)if(active[i].remaining<=0){
        health-=enemies[active[i].type].breach;
        breaches++;active.splice(i,1);
      }
      const row=director.report().levels.find(x=>x.level===level);
      if(row?.tBudgetDone!=null && active.length===0){finished=true;break;}
    }
    rows.push({level,upgrade,budget,kills,breaches,health,defeated:health<=0,finished,duration:+(time-start).toFixed(1)});
    time+=100;
  }
  return {rows,storageMap};
}
describe('controlled SD2 combat model (NOT browser gameplay)',()=>{
  it.each([1,42,2026])('completes all 15 stages with finite combat outputs, seed %i',seed=>{
    const {rows,storageMap}=simulate(seed);
    expect(rows).toHaveLength(15);
    for(const r of rows){
      expect(r.finished,'level '+r.level).toBe(true);
      expect(r.kills+r.breaches,'level '+r.level).toBeGreaterThan(0);
      expect(Number.isFinite(r.health)).toBe(true);
    }
    expect(storageMap.get('neonDefense2_test')).toBe('original');
    expect(storageMap.get('neon_sd2_save')).toBe('original-sd2');
  });
  it('is repeatable for the same random seed',()=>{
    expect(simulate(1234).rows).toEqual(simulate(1234).rows);
  });
  it('greater weapon DPS never increases total breaches in this controlled model',()=>{
    const low=simulate(314159,'mid',.75).rows.reduce((n,r)=>n+r.breaches,0);
    const high=simulate(314159,'mid',1.5).rows.reduce((n,r)=>n+r.breaches,0);
    expect(high).toBeLessThanOrEqual(low);
  });
  it('prints per-stage breaches and HP for diagnosis',()=>{
    console.log('CONTROLLED_COMBAT_MODEL_mid_seed42',JSON.stringify(simulate(42).rows));
  });
});
