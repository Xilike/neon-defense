from pathlib import Path
import shutil,json,hashlib,re
root=Path(__file__).resolve().parent.parent
source=root/'releases/events-v2.1'
s=(source/'index.html').read_text()
def replace(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b)
replace('<script src="levels.js"></script>','<script src="campaign.js"></script>\n<script src="levels.js"></script>')
replace("v2.1 Gold Courier · progress saves locally","v3.0 Campaign · progress saves locally")
replace("const SAVE_KEY = TEST_BUILD?'neonDefense_lab_v21':ND_BALANCE.config.saveKey;", "const SAVE_KEY=TEST_BUILD?ND_BALANCE.config.labSaveKey:ND_BALANCE.config.saveKey;")
replace('const SAVE_VER = 5;', 'const SAVE_VER = 6;')
replace('    ver: SAVE_VER,', '    ver: SAVE_VER,balanceSchema:3,')
replace("unlocked: ['aurora']", "unlocked: TEST_BUILD?GALAXIES.map(g=>g.id):['aurora']")
replace("    const raw = localStorage.getItem(SAVE_KEY);\n    if (!raw) return;", """    let raw=localStorage.getItem(SAVE_KEY),migrated=false;
    if(!raw&&!TEST_BUILD){
      const legacy=localStorage.getItem('neonDefense_levels_v2');
      if(legacy){raw=JSON.stringify(ND_CAMPAIGN.migrate(JSON.parse(legacy)));migrated=true;}
    }
    if(!raw)return;""")
replace("      Object.assign(SAVE, fresh);", "      if(TEST_BUILD)fresh.galaxy.unlocked=GALAXIES.map(g=>g.id);\n      Object.assign(SAVE,fresh);if(migrated)persist();")
replace("safe(fresh.craft.up[k],8)", "safe(fresh.craft.up[k],ND_BALANCE.config.craftMax[k])")
# All campaign health/speed is already in the fixed stage table. No second multiplier.
s=re.sub(r'hpMul: ?(?:1\.0|1\.35|1\.8|2\.4|3\.2|6\.5|10|16|26|42)(?=[,}])','hpMul:1',s)
s=re.sub(r'spdMul: ?(?:1\.0|1\.12|1\.08|1\.05|1\.1|1\.23|1\.32|1\.43|1\.55|1\.7)(?=[,}])','spdMul:1',s)
replace("const GALAXY_REWARD_MULT = Object.freeze({aurora:1,ember:2,jade:4,indigo:7,eclipse:12,nova:22,cryon:40,bloodmoon:75,nexus:140,singularity:260});","// Rewards are read from the fixed campaign stage, not reset at galaxy entry.")
replace("function galaxyReward(n){return Math.max(1,Math.round(n*(GALAXY_REWARD_MULT[G.id]||1)*(G.id==='aurora'?1.8:1)));}", "function galaxyReward(n){return Math.max(1,Math.round(n*levelSpec().rewardMultiplier));}")
replace("const GALAXY_LEVEL_TARGETS=[15,20,25,30,35,40,45,50,55];", "const GALAXY_LEVEL_TARGETS=ND_CAMPAIGN.lengths.slice(0,9);")
replace("const GALAXY_COIN_TARGETS=[15000,25000,50000,100000,200000,400000,800000,1500000,3000000];", "const GALAXY_COIN_TARGETS=Array(9).fill(0); // Boss clear is the unlock; no post-clear currency softlock.")
replace("if(!gp.visited||!gp.finalDefeated||galaxyLevel(next.parent.id)<next.level||(Number(gp.coins)||0)<next.coins)return;", "if(TEST_BUILD)return;\n  if(!gp.visited||!gp.finalDefeated||galaxyLevel(next.parent.id)<next.level)return;")
replace("const cp=Math.min(1,(Number(gp.coins)||0)/next.coins);", "const cp=1;")
replace("'+'/'+next.coins", "'+'/'+next.coins") if "'+'/'+next.coins" in s else None
# Remove the currency requirement from the visible galaxy-unlock descriptions.
replace("+' · '+fmt(pg.coins||0)+'/'+fmt(requirement.coins)+' 🪙 · '+", "+' · '+")
replace("(pg.coins||0)/requirement.coins", "1")
replace("+' · '+fmt(gp.coins||0)+'/'+fmt(next.coins)+' 🪙 · '+", "+' · '+")
# Actual weapon stats and the reference model share one authority.
a=s.index('const TURRET_DEF = {');b=s.index('/* ================= GALAXY CONFIG',a)
s=s[:a]+"""const TURRET_DEF={
 ELECTRIC:{...ND_CAMPAIGN.baseWeapons.ELECTRIC,hue:190,icon:'⚡',name:'ELECTRIC',projSpeed:900,slowPct:.35,slowDur:1.2,blurb:'Fast shots + slow. 1.5× vs cyan. Breaks shields.'},
 LASER:{...ND_CAMPAIGN.baseWeapons.LASER,hue:0,icon:'🔴',name:'LASER',blurb:'Precision beam. 1.5× vs red. Cuts armor.'},
 ROCKET:{...ND_CAMPAIGN.baseWeapons.ROCKET,hue:45,icon:'🚀',name:'ROCKET',projSpeed:640,blurb:'Explosive AoE. 1.5× vs gold. Cracks shells.'},
 VOID:{...ND_CAMPAIGN.baseWeapons.VOID,hue:280,icon:'🌀',name:'VOID',blurb:'Gravity pulse: pulls + disrupts. 1.5× vs purple.'},
};

"""+s[b:]

# Scripted helper children have a finite reward allowance per level.
replace("begin(){const spec=levelSpec();", "begin(){const spec=levelSpec();this.childRewards=0;")
replace("e.reward = galaxyReward(d.reward);", "e.reward = galaxyReward(d.reward);")
replace("e.breach = d.breach;", "e.breach=Math.round(d.breach*spec.breachScale);")
replace("e.reward=galaxyReward(Math.round((e.finalGalaxyBoss?400:100)*(1+.06*(lv-1))));", "e.reward=levelSpec().guardianReward;")
replace("    const sd2Reward=Math.round(e.reward * (S.time < ultimateMagnetUntil ? ULTIMATE_MAGNET_MULT : 1));\n    addCoins(sd2Reward);", """    let paidReward=e.reward;
    if(e.levelKind==='child'&&e.type!=='AEGIS'&&e.type!=='BLAST'){
      if(Director.childRewards>=levelSpec().childRewardLimit)paidReward=0;else Director.childRewards++;
    }
    const sd2Reward=Math.round(paidReward*(S.time<ultimateMagnetUntil?ULTIMATE_MAGNET_MULT:1));
    addCoins(sd2Reward);""")
replace("'+' + Math.round(e.reward * (S.time < ultimateMagnetUntil ? ULTIMATE_MAGNET_MULT : 1))", "'+'+sd2Reward")
replace("e.reward=Math.max(1,Math.round(GOLD_EVENT.reward*(GALAXY_REWARD_MULT[G.id]||1)));", "e.reward=galaxyReward(GOLD_EVENT.reward);")
replace("e.speed=.012;","e.speed=.012*levelSpec().speed;")
replace("Math.round(ENEMY_DEF.MINI.hp * Director.hpMult() * G.enemy.hpMul * playerEnemyHpScale())","levelSpec().hp.MINI")
replace('const UPGRADE_MAX_LEVEL=60;', 'const UPGRADE_MAX_LEVEL=200;')
replace("craftUpgCost:(lvl,key='dmg')=>Math.ceil((ND_BALANCE.config.craftPrices[key]||100)*1.16**lvl),", "craftUpgCost:(lvl,key='dmg')=>ND_CAMPAIGN.craftPrice(key,lvl),")
a=s.index('function craftStats(u = SAVE.craft.up) {');b=s.index('function buyCraft() {',a)
s=s[:a]+"function craftStats(u=SAVE.craft.up){return ND_CAMPAIGN.craftStats(u);}\n"+s[b:]
replace("if (lvl === undefined || lvl >= 8) return false;", "if(lvl===undefined||lvl>=ND_BALANCE.config.craftMax[key])return false;")
replace("maxed = lvl >= 8", "maxed=lvl>=ND_BALANCE.config.craftMax[d.key]")
# A weapon's main level tracks damage mastery; utility tracks display their own levels.
replace("1+UPGS.filter(u=>u.turret===kind).reduce((sum,u)=>sum+(SAVE.up[u.key]||0),0)", "1+(SAVE.up[{ELECTRIC:'eDmg',LASER:'lDmg',ROCKET:'rDmg',VOID:'vDmg'}[kind]]||0)")
replace("Math.round(dealt).toString()", "fmt(dealt)")
# Keep support/chain mechanics relevant after the early galaxy, without fixed 35/90 damage caps.
replace("Math.max(3,Math.min(35,dmg*.18))", "Math.max(3,Math.min(n.maxhp*.12,dmg*.18))")
replace("Math.max(12,Math.min(n.maxhp*.28,90))", "Math.max(12,n.maxhp*.12)")
# Gravity cannot hide a fully revealed target; guardians resist permanent CC.
replace("if (S.time < e.slowUntil) sp *= (1 - TURRET_DEF.ELECTRIC.slowPct);", "if(S.time<e.slowUntil)sp*=1-TURRET_DEF.ELECTRIC.slowPct*(e.boss?.25:1);")
replace("if (dist < st.pulseR) {\n      e.t = Math.max(0, e.t - st.pull * (1 - dist / st.pulseR));", "if(dist<st.pulseR&&enemyCanBeHit(e,S.priority?.id===target.id)){\n      e.t=Math.max(minimumVisibleDepth(e),e.t-st.pull*(1-dist/st.pulseR)*(e.boss?.18:1));")
replace("/* ================= turrets ================= */", """function minimumVisibleDepth(e){
  let lo=0,hi=Math.max(.3,e.t);
  for(let i=0;i<14;i++){const t=(lo+hi)/2;if(projY(t)-Math.max(9,e.r*projScale(t))>=HOR+2)hi=t;else lo=t;}
  return hi;
}
/* ================= turrets ================= */""")

# Compact large campaign values in existing upgrade and reward cards.
replace("return a[f].toFixed(digits)+' → '+b[f].toFixed(digits)", "return (a[f]>=1000?fmt(a[f]):a[f].toFixed(digits))+' → '+(b[f]>=1000?fmt(b[f]):b[f].toFixed(digits))")
replace("return cs[field].toFixed(digits)+' → '+next[field].toFixed(digits)", "return (cs[field]>=1000?fmt(cs[field]):cs[field].toFixed(digits))+' → '+(next[field]>=1000?fmt(next[field]):next[field].toFixed(digits))")
replace("'+'+sd2Reward", "'+'+fmt(sd2Reward)")
replace("'+'+e.reward+' GOLD'", "'+'+fmt(e.reward)+' GOLD'")

# Consumables must remain useful and priced relative to the campaign budget.
replace("5,000 direct damage to every orb + 3s stun.","60% orb HP / 8% guardian HP + slow.")
replace("Pulls orbs inward and deals 5,000 damage per pulse for 8s.","8s control: 3% orb HP / 0.25% guardian HP per pulse.")
replace("5× real kill rewards for 30 seconds.","5× rewards for 30s; bonus capped at 15% of a level. Once per level.")
replace("cost: 50000", "get cost(){return ND_CAMPAIGN.powerPrice('storm',levelSpec());}")
replace("cost: 75000", "get cost(){return ND_CAMPAIGN.powerPrice('magnet',levelSpec());}")
replace("cost: 150000", "get cost(){return ND_CAMPAIGN.powerPrice('blackhole',levelSpec());}")
replace("const ULTIMATE_HOLE_DAMAGE = 5000; // flat damage per 0.25s pulse","// Skill damage is centralized in ND_CAMPAIGN.powerDamage.")
replace("const ULTIMATE_STORM_DAMAGE = 5000;", "let ultimateMagnetBonusLeft=0;")
replace("const hit=ULTIMATE_STORM_DAMAGE;", "const hit=ND_CAMPAIGN.powerDamage('storm',e.maxhp,!!e.boss);")
replace("damageEnemy(e,ULTIMATE_HOLE_DAMAGE,undefined,'ULTIMATE');", "damageEnemy(e,ND_CAMPAIGN.powerDamage('blackhole',e.maxhp,!!e.boss),undefined,'ULTIMATE');")
replace("'-'+fmt(ULTIMATE_HOLE_DAMAGE)", "'GRAVITY PULSE'")
replace("    ultimateMagnetUntil=S.time+30;", "    ultimateMagnetUntil=S.time+30;ultimateMagnetBonusLeft=Math.floor(levelSpec().maximumIncome*.15);Director.magnetUsed=true;")
replace("  if (!SAVE.powers[key]) return false;", "  if(!SAVE.powers[key])return false;\n  if(key==='magnet'&&(Director.magnetUsed||S.time<ultimateMagnetUntil)){toast('MAGNET · Once per level');return false;}")
replace("this.childRewards=0;", "this.childRewards=0;this.magnetUsed=false;")
replace("const sd2Reward=Math.round(paidReward*(S.time<ultimateMagnetUntil?ULTIMATE_MAGNET_MULT:1));", "const wantedBonus=S.time<ultimateMagnetUntil?paidReward*(ULTIMATE_MAGNET_MULT-1):0;\n    const bonus=Math.min(wantedBonus,Math.max(0,ultimateMagnetBonusLeft));ultimateMagnetBonusLeft-=bonus;\n    const sd2Reward=Math.round(paidReward+bonus);")

# Lab: genuinely unlocked galaxy cards and an explicit affordable stage loadout.
replace("if (SAVE.galaxy.unlocked.indexOf(gid) < 0) return false;", "if(!TEST_BUILD&&SAVE.galaxy.unlocked.indexOf(gid)<0)return false;")
replace("const unlocked=active||SAVE.galaxy.unlocked.includes(gal.id);", "const unlocked=TEST_BUILD||active||SAVE.galaxy.unlocked.includes(gal.id);")
replace("Lab.init();", "Lab.init();if(TEST_BUILD)installCampaignLab();")
replace("<small>×2 و×4 يسرّعان", "<button id=\"labLoadout\">تجهيز مناسب لليفل</button><p id=\"labBalance\" style=\"font-size:11px;line-height:1.6\"></p><small>×2 و×4 يسرّعان")
lab='''
function installCampaignLab(){
 const update=()=>{const spec=levelSpec();document.getElementById('labBalance').textContent='مرحلة '+spec.campaignLevel+'/375 · دخل متوقع '+fmt(spec.expectedIncome)+' · كرة عادية '+fmt(spec.hp.NORMAL)+' HP · السرعة '+spec.speed.toFixed(2)+'×';};
 const jump=Lab.jump.bind(Lab);Lab.jump=(gid,lv)=>{jump(gid,Math.min(ND_CAMPAIGN.lengths[galaxyIndex(gid)],Math.max(1,Number(lv)||1)));update();};
 document.getElementById('labLoadout').onclick=()=>{
  if(!TEST_BUILD)return;
  if(transitTimer){clearTimeout(transitTimer);transitTimer=null;}
  for(const id of ['ovMenu','ovPause','ovEnd','ovTransit','ovUnlock','ovStats'])hideOverlay(id);
  const ref=ND_CAMPAIGN.recommended(galaxyLevel(G.id),galaxyIndex(G.id));
  SAVE.up={...ref.up};SAVE.weapons={...ref.weapons};SAVE.craft=JSON.parse(JSON.stringify(ref.craft));
  if(!Lab.unlimited)SAVE.econ={avail:ref.wallet,total:ref.total};
  layoutTurrets();newRun();S.phase='combat';persist();renderPanel();update();SFX.click();toast('STAGE LOADOUT · Expected earned budget');
 };update();
}
'''
replace('/* ================= render ================= */',lab+'\n/* ================= render ================= */')
# v3.0.1: close reward/lifecycle gaps and make campaign completion actionable.
replace("v3.0 Campaign · progress saves locally","v3.0.1 Campaign · progress saves locally")
replace("    const wantedBonus=S.time<ultimateMagnetUntil?paidReward*(ULTIMATE_MAGNET_MULT-1):0;\n    const bonus=Math.min(wantedBonus,Math.max(0,ultimateMagnetBonusLeft));ultimateMagnetBonusLeft-=bonus;\n    const sd2Reward=Math.round(paidReward+bonus);", "    const sd2Reward=combatReward(paidReward);")
replace("addCoins(Math.round(part.reward * (S.time < ultimateMagnetUntil ? ULTIMATE_MAGNET_MULT : 1)));\n      floatText(p.x, p.y - 12, '+' + part.reward, '#ffd54a');", "const paid=combatReward(part.reward,true);addCoins(paid);\n      floatText(p.x,p.y-12,'+'+fmt(paid),'#ffd54a');")
replace("e.type = 'COMPOSITE'; e.compKind", "e.stageBoss=false;e.finalGalaxyBoss=false;e.stageGoal=0;\n    e.type = 'COMPOSITE'; e.compKind")
replace("e.reward = 0; e.breach = 30;", "e.reward=0;e.breach=Math.round(30*levelSpec().breachScale);")
replace("function clearField() {", "function clearField() {\n  resetCombatEffects();")
replace("function newRun() {", "function newRun() {\n  layoutTurrets();craft.lane=2;craft.t=.55;craft.cool=0;craft.bank=0;")
replace("if(!Lab.unlimited)SAVE.econ={avail:ref.wallet,total:ref.total};", "if(!Lab.unlimited)SAVE.econ={avail:ref.wallet,total:ref.total};\n  else Lab.walletBefore={avail:ref.wallet,total:ref.total};")
replace("document.getElementById('labNext').onclick=()=>this.jump(G.id,galaxyLevel(G.id)+1);", "document.getElementById('labNext').onclick=()=>{const g=galaxyIndex(G.id),lv=galaxyLevel(G.id);if(lv<ND_CAMPAIGN.lengths[g])this.jump(G.id,lv+1);else if(g<9)this.jump(GALAXIES[g+1].id,1);else toast('CAMPAIGN END · Choose a level to replay');};")
replace(" const update=()=>{const spec=levelSpec();document.getElementById('labBalance').textContent=", " const update=()=>{const spec=levelSpec();document.getElementById('labLevel').max=ND_CAMPAIGN.lengths[galaxyIndex(document.getElementById('labGalaxy').value)];document.getElementById('labBalance').textContent=")
replace(" };update();\n}\n", " };document.getElementById('labGalaxy').onchange=update;update();\n}\n")
replace('<div id="combatLevelStatus" role="status">AURORA · 0/72 defeated</div>', '<div id="combatLevelStatus" role="status">AURORA · 0/72 defeated</div>\n  <button id="campaignContinue" hidden type="button" style="grid-column:1/-1;grid-row:3;background:#10354b;color:#8affdb;border:1px solid #36c9bb;border-radius:6px;padding:0 4px;font-size:11px;font-weight:800"></button>')
replace("  const spec=levelSpec(),done=Director.killed+Director.breached;", "  renderCampaignCompletion();\n  const spec=levelSpec(),done=Director.killed+Director.breached;")
replace("function loop(now) {", "function loop(now) {\n  if(document.hidden)pauseForBackground();")
replace("S.phase = 'combat'; // continuous combat starts at once", "S.phase = 'combat';if(document.hidden)pauseForBackground(); // Resume explicitly after a hidden transit.")
extra=\
'''
// All combat rewards share the same finite magnet allowance, including parts.
function combatReward(base,helper=false){
 base=Math.max(0,Math.round(Number(base)||0));
 if(helper){if(Director.childRewards>=levelSpec().childRewardLimit)return 0;Director.childRewards++;}
 const wanted=S.time<ultimateMagnetUntil?base*(ULTIMATE_MAGNET_MULT-1):0;
 const bonus=Math.min(wanted,Math.max(0,ultimateMagnetBonusLeft));ultimateMagnetBonusLeft-=bonus;
 return base+bonus;
}
function resetCombatEffects(){
 ultimateMagnetUntil=0;ultimateMagnetBonusLeft=0;ultimateHoleUntil=0;ultimateHoleTick=0;ultimateFxUntil=0;ultimateFxKind='';
 const fx=document.getElementById('ultimateFx');if(fx)fx.className='';
 const panel=document.getElementById('ultimatePanel');if(panel)panel.hidden=true;
}
function renderCampaignCompletion(){
 const button=document.getElementById('campaignContinue');if(!button)return;
 const done=galaxyProgress(G.id).finalDefeated,g=galaxyIndex(G.id),next=GALAXIES[g+1];
 button.hidden=!done||S.phase==='transit';
 document.getElementById('combatLevelStatus').hidden=!button.hidden;
 button.disabled=!next;
 button.textContent=next?'✓ '+G.name+' COMPLETE · '+next.name+' →':'🏆 SINGULARITY COMPLETE · CAMPAIGN END';
 button.onclick=next?()=>{if(SAVE.galaxy.unlocked.includes(next.id)){SFX.click();button.disabled=true;enterGalaxy(next.id);renderCampaignCompletion();}}:null;
 if(TEST_BUILD){const info=document.getElementById('labBalance');if(info){const s=levelSpec();info.textContent='مرحلة '+s.campaignLevel+'/375 · دخل متوقع '+fmt(s.expectedIncome)+' · كرة عادية '+fmt(s.hp.NORMAL)+' HP · السرعة '+s.speed.toFixed(2)+'×';}}
}
function pauseForBackground(){
 if(S.phase==='combat'){togglePause();persist();}
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseForBackground();});
window.addEventListener('pagehide',pauseForBackground);
'''
replace('/* ================= render ================= */',extra+'\n/* ================= render ================= */')

# v3.0.2: selected lab setup must never silently use the active galaxy.
replace("v3.0.1 Campaign · progress saves locally","v3.0.2 Campaign · progress saves locally")
replace("if(TEST_BUILD)fresh.galaxy.unlocked=GALAXIES.map(g=>g.id);", """if(TEST_BUILD){
        fresh.galaxy.unlocked=GALAXIES.map(g=>g.id);
        const source=d.labLoadout;
        if(source&&galaxyById(source.galaxy))fresh.labLoadout={galaxy:source.galaxy,level:Math.max(1,Math.min(ND_CAMPAIGN.lengths[galaxyIndex(source.galaxy)],safe(source.level,60)))};
      }""")
replace('انتقل / أعد الليفل','انتقل بنفس التجهيز')
replace('<p id="labBalance"', '<p id="labEquipment" style="font-size:11px;line-height:1.7;color:#ffe19a"></p><p id="labBalance"')
replace('<small>×2 و×4 يسرّعان', '<small>الانتقال وحده يحتفظ بالأسلحة والمكوك. زر التجهيز يستبدلهما بتجهيز المرحلة المختارة ويبدأها. ×2 و×4 يسرّعان')
replace("document.getElementById('labLoadout').onclick=()=>{\n  if(!TEST_BUILD)return;", """document.getElementById('labLoadout').onclick=()=>{
  if(!TEST_BUILD)return;
  Lab.jump(document.getElementById('labGalaxy').value,document.getElementById('labLevel').value);""")
replace("SAVE.up={...ref.up};SAVE.weapons={...ref.weapons};SAVE.craft=JSON.parse(JSON.stringify(ref.craft));", "SAVE.up={...ref.up};SAVE.weapons={...ref.weapons};SAVE.craft=JSON.parse(JSON.stringify(ref.craft));\n  SAVE.labLoadout={galaxy:G.id,level:galaxyLevel(G.id)};")
replace("const update=()=>{const spec=levelSpec();", "const update=()=>{renderLabEquipmentInfo();const selected=document.getElementById('labGalaxy').value;const selectedLevel=Math.max(1,Math.min(ND_CAMPAIGN.lengths[galaxyIndex(selected)],Number(document.getElementById('labLevel').value)||1));document.getElementById('labLoadout').textContent='تجهيز وبدء '+galaxyById(selected).name+' · Lv.'+selectedLevel;const spec=levelSpec();")
replace("document.getElementById('labGalaxy').onchange=update;update();", "document.getElementById('labGalaxy').onchange=update;document.getElementById('labLevel').oninput=update;update();")
replace("if(TEST_BUILD){const info=document.getElementById('labBalance');", "if(TEST_BUILD){renderLabEquipmentInfo();const info=document.getElementById('labBalance');")
labEquipment=\
'''
function labEquipmentCode(b){return JSON.stringify([
 Object.keys(ND_CAMPAIGN.config.max).map(k=>Number(b.up[k])||0),
 Object.keys(ND_CAMPAIGN.baseWeapons).map(k=>!!b.weapons[k]),!!b.craft.owned,
 Object.keys(ND_CAMPAIGN.config.craftMax).map(k=>Number(b.craft.up[k])||0)
]);}
function renderLabEquipmentInfo(){
 if(!TEST_BUILD)return;const el=document.getElementById('labEquipment');if(!el)return;
 const source=SAVE.labLoadout,g=source&&galaxyById(source.galaxy);
 const same=g&&labEquipmentCode(SAVE)===labEquipmentCode(ND_CAMPAIGN.recommended(source.level,galaxyIndex(g.id)));
 const summary=document.querySelector('#labTools summary');if(summary)summary.textContent='🧪 TEST LAB · '+(g?'G'+g.num+' / Lv'+source.level+(same?'':' · معدّل'):'تجهيز محفوظ');
 const origin=g?'مصدر التجهيز: '+g.name+' · Lv.'+source.level+(same?' · مطابق':' · عُدّل بعد التجهيز'):'تجهيز محفوظ / يدوي · مصدره غير مسجّل';
 el.textContent='اللعب الآن: '+G.name+' · Lv.'+galaxyLevel(G.id)+' | '+origin+' | الأسلحة E '+(1+SAVE.up.eDmg)+' / L '+(1+SAVE.up.lDmg)+' / R '+(1+SAVE.up.rDmg)+' / V '+(1+SAVE.up.vDmg)+' | المكوك '+(SAVE.craft.owned?'Lv.'+(1+SAVE.craft.up.dmg):'غير مملوك');
}
'''
replace('/* ================= render ================= */',labEquipment+'\n/* ================= render ================= */')

# v3.1: fixed-stage guardian siege checks actual damage, never purchased levels.
replace("v3.0.2 Campaign · progress saves locally","v3.1 Campaign · progress saves locally")
replace("e.stageBoss=false;e.finalGalaxyBoss=false;e.stageGoal=0;", "e.stageBoss=false;e.finalGalaxyBoss=false;e.stageGoal=0;e.guardianEngagedAt=null;e.guardianEnraged=false;")
replace("  if(e.bonusGold)return damageGoldOrb", "  if(e.stageBoss&&e.guardianEngagedAt===null&&dmg>0)e.guardianEngagedAt=S.time;\n  if(e.bonusGold)return damageGoldOrb")
replace("    e.wob += dt * 3;", "    updateGuardianSiege(e,dt);\n    e.wob += dt * 3;")
replace("e.t=Math.max(minimumVisibleDepth(e),e.t-st.pull*(1-dist/st.pulseR)*(e.boss?.18:1));", "if(!e.guardianEnraged)e.t=Math.max(minimumVisibleDepth(e),e.t-st.pull*(1-dist/st.pulseR)*(e.boss?.18:1));")
replace("  if(e.stageBoss){galaxyProgress(G.id).stageBossId=null;Director.t=8;} // guardian escape never completes a level", "  if(e.stageBoss){galaxyProgress(G.id).stageBossId=null;pKill(enemies,e);S.baseHP=0;updateBaseHUD();gameOver();return;} // A guardian reaching the line defeats this attempt; no infinite respawn.")
replace("'GUARDIAN · '+G.name", "'GUARDIAN · '+G.name+guardianSiegeLabel()")
extra=\
'''
function guardianSiegeLabel(){
 const boss=enemyById(galaxyProgress(G.id).stageBossId);
 if(!boss||boss.guardianEngagedAt===null)return ' · SIEGE';
 return boss.guardianEnraged?' · SIEGE RUSH!':' · '+Math.ceil(Math.max(0,levelSpec().guardianBattleSeconds-(S.time-boss.guardianEngagedAt)))+'s TO RUSH';
}
function updateGuardianSiege(e,dt){
 if(!e.stageBoss)return;
 if(e.guardianEngagedAt===null){if(e.t>=ND_CAMPAIGN.rules.guardianHoldDepth)e.guardianEngagedAt=S.time;else return;}
 if(S.time-e.guardianEngagedAt>=levelSpec().guardianBattleSeconds){
  if(!e.guardianEnraged){e.guardianEnraged=true;const p=w2s(e.lane,e.t);floatText(p.x,p.y-30,'⚠ SIEGE RUSH!','#ff866a',true);SFX.breach();}
  e.slowUntil=0;e.t+=dt*ND_CAMPAIGN.rules.guardianRushSpeed;
 }
}
'''
replace('/* ================= render ================= */',extra+'\n/* ================= render ================= */')

replace("e.speed=.012*levelSpec().speed;", "e.speed=ND_CAMPAIGN.rules.guardianApproachSpeed*levelSpec().speed;")
replace("    e.t += sp * dt;", "    e.t += sp * dt;\n    if(e.stageBoss&&!e.guardianEnraged)e.t=Math.min(ND_CAMPAIGN.rules.guardianHoldDepth,e.t);")
replace("n.maxhp*.19", "n.maxhp*ND_CAMPAIGN.rules.novaDeathShock")
# Show the authored stage plan without enforcing one weapon combination.
replace("h = '<div class=\"upgradeBalance\">", "h = '<div style=\"font-size:11px;line-height:1.6;color:#92d9e9;padding:4px\">'+campaignUpgradePlan()+'</div>'+ '<div class=\"upgradeBalance\">")
replace('/* ================= render ================= */',\
'''
function campaignUpgradePlan(){
 const target=levelSpec().referenceEnd,keys={ELECTRIC:'eDmg',LASER:'lDmg',ROCKET:'rDmg',VOID:'vDmg'};
 const plan=Object.entries(keys).filter(([kind])=>target.weapons[kind]).map(([kind,key])=>SAVE.weapons[kind]?kind[0]+': '+(1+SAVE.up[key])+'/'+(1+target.up[key]):'BUY '+kind+' Lv.'+(1+target.up[key])).join(' / ');
 return 'هدف تطوير هذه المرحلة · '+plan+' · بدائل توزيع القوة متاحة';
}
'''+'\n/* ================= render ================= */')

normal=root/'releases/campaign-v3';test=root/'releases/campaign-v3-lab'
for folder,flag in [(normal,False),(test,True)]:
 folder.mkdir(exist_ok=True)
 for name in ['manifest.webmanifest','vercel.json']:shutil.copyfile(source/name,folder/name)
 (folder/'index.html').write_text(s)
 (folder/'campaign.js').write_text((root/'gameplay/campaign-v3/campaign.js').read_text())
 (folder/'runtime-config.js').write_text('/* Deployment profile only; URL parameters cannot enable lab tools. */\nglobalThis.ND_TEST_BUILD='+str(flag).lower()+';\n')
 (folder/'balance.js').write_text('(function(g){const c=g.ND_CAMPAIGN;g.ND_BALANCE=Object.freeze({config:c.config,weaponStats:c.weaponStats,weaponDps:c.weaponDps,price:c.price});})(globalThis);\n')
 (folder/'levels.js').write_text('(function(g){const c=g.ND_CAMPAIGN;g.ND_LEVELS=Object.freeze({version:3,stages:c.tables,stage:c.stage,deck:c.deck});})(globalThis);\n')
 files={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(folder.iterdir()) if p.name!='integrity.json'}
 (folder/'integrity.json').write_text(json.dumps({'version':'3.1.0-campaign','profile':'lab' if flag else 'normal','files':files},indent=2)+'\n')
print('Built campaign v3 normal and all-galaxies-open lab.')
