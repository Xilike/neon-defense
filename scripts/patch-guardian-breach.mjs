// Apply only to the isolated SD2 Preview runtime, never to production.
// Usage: node scripts/patch-guardian-breach.mjs /path/to/preview/index.html
import {readFileSync,writeFileSync} from 'node:fs';
const path=process.argv[2];
if(!path)throw new Error('Explicit preview index.html path required');
let s=readFileSync(path,'utf8');
if(!s.includes('SD2.bind({'))throw new Error('Not an integrated SD2 preview');
const changes=[
  ["  pKill(enemies, e);\n  if (S.baseHP <= 0) gameOver();\n}","  pKill(enemies, e);\n  if (S.baseHP <= 0) gameOver();\n  else if (e.stageBoss && SD2.isActive()) gameOver('guardianBreached');\n}"],
  ["function gameOver() {\n  if(SD2.isActive())SD2.onDefeat('baseDestroyed');","function gameOver(reason = 'baseDestroyed') {\n  if(SD2.isActive())SD2.onDefeat(reason);"],
  ["document.getElementById('endTitle').textContent = 'BASE DESTROYED';","document.getElementById('endTitle').textContent = reason === 'guardianBreached' ? 'GUARDIAN BREACHED' : 'BASE DESTROYED';"]
];
for(const [before,after] of changes){
 if(s.includes(after))continue;
 if(s.split(before).length!==2)throw new Error('Expected exactly one source match for: '+before.slice(0,50));
 s=s.replace(before,after);
}
writeFileSync(path,s);
console.log('Guardian breach progression fix applied:',path);
