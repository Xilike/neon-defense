import {execFileSync} from 'node:child_process';
import {chromium} from '@playwright/test';
execFileSync(process.execPath,['scripts/build.mjs'],{env:{...process.env,NEON_ENV:'production',VERCEL_ENV:'production'},stdio:'inherit'});
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.CHROMIUM_EXECUTABLE_PATH}:{})});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/?debug=1&economy=test&sd2debug=adv');
 const result=await page.evaluate(()=>({profile:NEON_BUILD.profile,debug:NEON_BUILD.debug,api:typeof window.__ND,debugButton:!!document.getElementById('dgGold'),price:NeonEconomy[NEON_BUILD.profile].weapons.LASER}));
 if(result.profile!=='production'||result.debug||result.api!=='undefined'||result.debugButton||result.price!==500||errors.length) throw new Error(JSON.stringify({result,errors}));
 await page.locator('#btnStart').click();
 await page.waitForFunction(()=>document.getElementById('ovTransit').classList.contains('hidden'),null,{timeout:5000}).catch(()=>{});
 if(errors.length)throw new Error(errors.join('\n'));
 console.log('Production build isolation verified:',JSON.stringify(result));
} finally {await browser.close();execFileSync(process.execPath,['scripts/build-preview.mjs'],{stdio:'inherit'});}
