const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const a={},b={};vm.runInNewContext(fs.readFileSync('releases/families-v2-lab/campaign.js','utf8'),a);vm.runInNewContext(fs.readFileSync('releases/boss-v1-lab/campaign.js','utf8'),b);
const old=a.ND_CAMPAIGN,next=b.ND_CAMPAIGN;assert.equal(JSON.stringify(old.config),JSON.stringify(next.config));assert.equal(JSON.stringify(old.rules),JSON.stringify(next.rules));
for(let i=0;i<375;i++){
 const before={...old.tables[i]},after={...next.tables[i]};
 delete before.guardianBattleSeconds;delete after.guardianBattleSeconds;
 assert.equal(JSON.stringify(before),JSON.stringify(after),'Non-guardian-timer change at '+i);
 assert(Number.isFinite(next.tables[i].guardianBattleSeconds)&&next.tables[i].guardianBattleSeconds>=18);
}
for(const f of ['balance.js','levels.js','runtime-config.js','manifest.webmanifest','vercel.json'])assert(fs.readFileSync('releases/families-v2-lab/'+f).equals(fs.readFileSync('releases/boss-v1-lab/'+f)),f);
const report={passed:true,stages:375,unchanged:['prices','weapon stats','craft stats','normal enemies','boss HP','rewards','reference loadouts','save keys','stage order','targeting and input'],changed:['stage guardian painter','fixed referenceEnd guardian siege window with 1.2s animation/projectile allowance']};
fs.writeFileSync('verification/boss-v1/contracts-results.json',JSON.stringify(report,null,2)+'\n');console.log(report);
