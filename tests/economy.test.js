import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const context={};vm.runInNewContext(readFileSync('economy.js','utf8'),context);
const economy=context.NeonEconomy;
describe('central economy',()=>{
 it('keeps preview unlocks cheap and production independent',()=>{
  expect(economy.test.weapons.LASER).toBe(10);expect(economy.production.weapons.LASER).toBe(500);
  for(const p of Object.values(economy)){
   expect(Object.isFrozen(p)).toBe(true);
   expect(Object.values(p.galaxies).every((v,i,a)=>v>0&&(i===0||v>a[i-1]))).toBe(true);
   for(let i=0;i<8;i++){expect(p.upgCost(i)).toBeGreaterThan(0);expect(p.craftUpgCost(i)).toBeGreaterThan(0);}
  }
 });
 it('uses production-safe defaults with no query-string profile override',()=>{
  const source=readFileSync('runtime-config.js','utf8');
  expect(source).toContain("profile:'production'");expect(source).toContain('debug:false');
 });
});
