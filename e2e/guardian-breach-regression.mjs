import { chromium } from '@playwright/test';

// Explicit localhost-only isolated SD2 Preview test.
// Start a local server on port 4213 for the patched preview directory first.
const base=process.env.SD2_PREVIEW_URL;
if(!base||!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(base))throw new Error('localhost SD2_PREVIEW_URL required');
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'?sd2debug=mid&schedule=1');
 await page.click('#btnStart');
 const result=await page.evaluate(()=>{
  if(S.phase==='transit')confirmEnterGalaxy();
  S.baseHP=1000;
  const e=SD2.authorized('guardian',()=>spawnEnemy('BOSS',pick(G.enemy.colors)));
  if(!e)throw new Error('guardian spawn failed');
  e.stageBoss=true;
  breachBase(e);
  return {phase:S.phase,hp:S.baseHP,reason:SD2.report().levels.at(-1)?.defeat?.reason,title:document.getElementById('endTitle').textContent,save:SD2.debug.verify().ok};
 });
 console.log(JSON.stringify({result,errors}));
 if(result.phase!=='over'||result.hp<=0||result.reason!=='guardianBreached'||result.title!=='GUARDIAN BREACHED'||!result.save||errors.length)process.exitCode=1;
}finally{await browser.close()}
