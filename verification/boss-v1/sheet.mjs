import fs from'node:fs';import path from'node:path';import http from'node:http';import assert from'node:assert/strict';import{createRequire}from'node:module';
const root=path.resolve(import.meta.dirname,'../..'),out=import.meta.dirname;
const{chromium}=createRequire(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright/package.json')('playwright');
const lambda=(await import('/workspace/scratch/c9705fbd8663/browser-deps/node_modules/@sparticuz/chromium/build/index.js')).default;
const server=http.createServer((req,res)=>{let f=path.join(root,'releases',new URL(req.url,'http://local').pathname);if(fs.existsSync(f)&&fs.statSync(f).isDirectory())f=path.join(f,'index.html');if(!f.startsWith(path.join(root,'releases'))||!fs.existsSync(f)){res.writeHead(404).end();return;}res.setHeader('content-type',f.endsWith('.js')?'application/javascript':'text/html; charset=utf-8');res.end(fs.readFileSync(f));});await new Promise(r=>server.listen(4199,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:'/tmp/chromium',args:lambda.args.filter(a=>a!=='--single-process'),headless:true});const report={};
async function open(build){const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await context.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:4199/')?r.continue():r.abort());await context.addInitScript(()=>window.requestAnimationFrame=()=>0);const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('http://127.0.0.1:4199/'+build+'/');await page.waitForFunction(()=>typeof SAVE!=='undefined');return{page,context,errors};}
try{
 const v=await open('boss-v1-lab');
 // Show all ten supplied families at gameplay scale in a local QA contact sheet.
 await v.page.evaluate(()=>{clearField();cv.width=1000;cv.height=720;ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#060b20';ctx.fillRect(0,0,1000,720);GALAXIES.forEach((g,i)=>{G=g;galaxyProgress(g.id).combatLevel=5;const p={x:100+(i%5)*200,y:105+Math.floor(i/5)*340,s:1},e={id:100+i,hue:HUES[g.enemy.colors[0]],wob:.8,stageBoss:true,hp:75,maxhp:100};drawEnemyBody(e,p,35);drawOrbHealthRing(e,p,35);ctx.fillStyle='#b5e7ff';ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillText(g.name,p.x,p.y+85);});});
 fs.writeFileSync(path.join(out,'boss-sheet.png'),Buffer.from(await v.page.evaluate(()=>cv.toDataURL('image/png').split(',')[1]),'base64'));
await v.context.close();
}finally{await browser.close();server.close();}
