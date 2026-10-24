import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4191,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4191/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4191/'+build+'/?test=1&sd2debug=adv&schedule=1');await page.waitForFunction(()=>typeof SAVE!=='undefined'&&typeof ND_CAMPAIGN!=='undefined');return{page,context,errors};}
try{
 const {page,context,errors}=await open('campaign-v3-lab');
 await page.locator('#labTools summary').tap();
 await page.locator('#labGalaxy').selectOption('singularity');await page.locator('#labLevel').fill('1');await page.locator('#labLoadout').tap();
 assert(await page.evaluate(()=>G.id==='singularity'&&SAVE.up.eDmg===186));
 // Regression: select an earlier stage and press setup directly, WITHOUT Go.
 await page.locator('#labGalaxy').selectOption('jade');await page.locator('#labLevel').fill('25');
 assert((await page.locator('#labLoadout').textContent()).includes('JADE · Lv.25'));
 await page.locator('#labLoadout').tap();
 report.selectedSetup=await page.evaluate(()=>({galaxy:G.id,level:galaxyLevel(G.id),matches:labEquipmentCode(SAVE)===labEquipmentCode(ND_CAMPAIGN.recommended(25,2)),source:SAVE.labLoadout,craft:SAVE.craft.up.dmg,info:document.getElementById('labEquipment').textContent}));
 assert.equal(report.selectedSetup.galaxy,'jade');assert.equal(report.selectedSetup.level,25);assert(report.selectedSetup.matches);assert.deepEqual(report.selectedSetup.source,{galaxy:'jade',level:25});
 const gear=await page.evaluate(()=>labEquipmentCode(SAVE));
 await page.locator('#labGalaxy').selectOption('bloodmoon');await page.locator('#labLevel').fill('1');await page.locator('#labGo').tap();
 assert.equal(await page.evaluate(()=>labEquipmentCode(SAVE)),gear);assert.deepEqual(await page.evaluate(()=>SAVE.labLoadout),{galaxy:'jade',level:25});report.jumpKeepsGearAndProvenance=true;
 await page.reload();await page.waitForFunction(()=>typeof SAVE!=='undefined');assert.deepEqual(await page.evaluate(()=>SAVE.labLoadout),{galaxy:'jade',level:25});report.provenanceSurvivesReload=true;
 await page.locator('#labTools summary').tap();
 const changed=await page.evaluate(()=>{SAVE.up.eDmg++;persist();renderPlayerProgress();return document.getElementById('labEquipment').textContent.includes('عُدّل بعد التجهيز');});assert(changed);report.modifiedEquipmentMarked=true;
 await page.locator('#labFunds').check();await page.locator('#labGalaxy').selectOption('indigo');await page.locator('#labLevel').fill('30');await page.locator('#labLoadout').tap();await page.locator('#labFunds').uncheck();
 assert(await page.evaluate(()=>G.id==='indigo'&&galaxyLevel(G.id)===30&&SAVE.econ.avail===ND_CAMPAIGN.recommended(30,3).wallet&&labEquipmentCode(SAVE)===labEquipmentCode(ND_CAMPAIGN.recommended(30,3))));report.presetWithUnlimitedWalletSafe=true;
 // Invalid input clamps to the selected galaxy's true final level.
 await page.locator('#labGalaxy').selectOption('aurora');await page.locator('#labLevel').fill('60');await page.locator('#labLoadout').tap();assert(await page.evaluate(()=>G.id==='aurora'&&galaxyLevel(G.id)===15&&SAVE.labLoadout.level===15));report.selectionClampsToGalaxy=true;
 assert.deepEqual(errors,[]);await context.close();report.passed=true;
 fs.writeFileSync(path.join(out,'lab-selection-results.json'),JSON.stringify(report,null,2)+'\n');console.log('LAB SELECTION PASS',JSON.stringify(report));
}finally{await browser.close();server.close();}
