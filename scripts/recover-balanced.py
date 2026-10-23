"""Build the normal-play branch from the exact recovered Vercel snapshot."""
from pathlib import Path
import re

root=Path(__file__).resolve().parent.parent
s=(root/'recovered/vercel-5di2a47zj/index.html').read_text()
def replace(old,new):
    global s
    assert old in s, old[:100]
    s=s.replace(old,new)
def region(start,end,new):
    global s
    a=s.index(start);b=s.index(end,a)
    s=s[:a]+new+'\n'+s[b:]

replace('<script src="sd2.js"></script>','<script src="balance.js"></script>')
replace('<title>NEON DEFENSE 2.5D — Phase 1</title>','<title>NEON DEFENSE — Balanced</title>')
replace('v0.1-phase1 · progress saves locally','v1.0 Balanced · progress saves locally')
replace('Tap enemies to prioritize, long-press to lock.','Defense fires automatically. Tap enemies to prioritize, long-press to lock.')
replace("const ECON_PROFILE = 'test';", "const ECON_PROFILE = 'balanced';")
region('const ECON = {','const SPAWN_TIERS =', '''const ECON = Object.freeze({
  weapons:ND_BALANCE.config.weapons, spacecraft:ND_BALANCE.config.spacecraft,
  craftUpgCost:(lvl,key='dmg')=>Math.ceil((ND_BALANCE.config.craftPrices[key]||100)*1.16**lvl),
  craftSizeCost:[40,60,90,130,180,250,340,450],
  spawnTierCost:[0,300,900,2500]
});''')
region('const ARENA_MIN_TARGETS','const ENEMY_DEF', '''// Population is a safety cap, never a refill target. Faster kills reduce pressure.
function arenaTargetCount(){return Math.min(ND_BALANCE.config.maxAlive,10+Math.floor((galaxyLevel(G.id)-1)*.5));}
const UPGRADE_MAX_LEVEL=60;''')
replace('NORMAL:   { hp: 80,','NORMAL:   { hp: 65,')
replace('RUNNER:   { hp: 60,','RUNNER:   { hp: 42,')
replace('TANK:     { hp: 300,','TANK:     { hp: 180,')
replace('SPLITTER: { hp: 130,','SPLITTER: { hp: 100,')
replace('MINI:     { hp: 40,','MINI:     { hp: 25,')
replace('BRUTE:    { hp: 1200,','BRUTE:    { hp: 600,')
replace("name: 'LASER', dps: 38, beamDur: 0.55, cool: 1.7", "name: 'LASER', dps: 90, beamDur: 0.8, cool: 1.8")
replace("name: 'ROCKET', dmg: 30, rate: 0.8", "name: 'ROCKET', dmg: 70, rate: 0.85")
replace("name: 'VOID', dmg: 10, pulseCool: 5.0", "name: 'VOID', dmg: 65, pulseCool: 3.2")
replace("const SAVE_KEY = 'neon_sd2_save';", "const SAVE_KEY = ND_BALANCE.config.saveKey;")
replace('const SAVE_VER = 3;', 'const SAVE_VER = 4;')
replace("const PANEL_COLLAPSE_KEY = 'neonDefense_panelCollapsed_v1';", "const PANEL_COLLAPSE_KEY = 'neonDefense_balanced_panel_v1';")
replace('<meta charset="UTF-8">','<meta charset="UTF-8">\n<link rel="manifest" href="manifest.webmanifest">\n<meta name="theme-color" content="#060a18">')
# A real browser can request portrait when installed; handheld landscape pauses.
replace('</style>', '''#portraitNotice{display:none;position:fixed;inset:0;z-index:100000;background:#060a18;color:#d9edff;align-items:center;justify-content:center;text-align:center;padding:30px;font-size:20px}
@media (orientation:landscape) and (max-height:600px){#portraitNotice{display:flex}}
</style>''')
replace('<div class="overlay open" id="ovMenu">','<div id="portraitNotice" role="status">Rotate your phone to portrait to continue.</div>\n<div class="overlay open" id="ovMenu">')
replace('requestAnimationFrame(loop);\n</script>', '''function enforcePortrait(){
  if(innerWidth>innerHeight&&innerHeight<=600&&S.phase==='combat')togglePause();
}
window.addEventListener('resize',enforcePortrait);
requestAnimationFrame(loop);
</script>''')
replace("if (window.SD2_DEBUG && SD2_DEBUG.active) return;",'')
replace("if(window.SD2_DEBUG && SD2_DEBUG.active)return;",'')
replace("if(window.__sd2PurchasesLocked)return;",'')
# Only validated, bounded fields enter the new normal-play save namespace.
replace('      fresh.ver = SAVE_VER;', '''      const safe=(v,max=1e15)=>Number.isFinite(Number(v))?Math.max(0,Math.min(max,Math.floor(Number(v)))):0;
      fresh.econ.total=safe(fresh.econ.total);fresh.econ.avail=Math.min(safe(fresh.econ.avail),fresh.econ.total);
      fresh.up=Object.fromEntries(Object.keys(defaultSave().up).map(k=>[k,safe(fresh.up[k],ND_BALANCE.config.max[k])]));
      fresh.craft.up=Object.fromEntries(Object.keys(defaultSave().craft.up).map(k=>[k,safe(fresh.craft.up[k],8)]));
      fresh.weapons=Object.fromEntries(Object.keys(defaultSave().weapons).map(k=>[k,k==='ELECTRIC'||fresh.weapons[k]===true]));
      fresh.galaxy.unlocked=GALAXIES.filter(g=>g.id==='aurora'||fresh.galaxy.unlocked.includes(g.id)).map(g=>g.id);
      if(!fresh.galaxy.unlocked.includes(fresh.galaxy.current))fresh.galaxy.current='aurora';
      fresh.player.xp=safe(fresh.player.xp);fresh.stats={kills:safe(fresh.stats.kills),dmg:safe(fresh.stats.dmg)};
      for(const [id,gp] of Object.entries(fresh.galaxy.progress)){
        if(!GALAXIES.some(g=>g.id===id)||!gp||typeof gp!=='object'){delete fresh.galaxy.progress[id];continue;}
        fresh.galaxy.progress[id]={active:safe(gp.active,1e7),coins:safe(gp.coins),kills:safe(gp.kills),visited:gp.visited===true,cleared:Math.max(1,safe(gp.cleared,100)),finalDefeated:gp.finalDefeated===true};
      }
      fresh.ver = SAVE_VER;''')
region('function combatPowerRating() {','function escSteps()', '''function combatPowerRating() {
  let power=0;
  for(const kind of Object.keys(TURRET_DEF))if(SAVE.weapons[kind])power+=ND_BALANCE.weaponDps(kind,turretStats(kind));
  if(SAVE.craft.owned&&SAVE.settings.craftVisible!==false){const c=craftStats();power+=c.dmg/c.cool;}
  return Math.round(power*10)/10;
}
const CombatMetrics={hits:[],
  record(amount){if(!(amount>0))return;this.hits.push({t:S.time,n:amount});this.trim();},
  trim(){while(this.hits.length&&this.hits[0].t<S.time-10)this.hits.shift();},
  dps(){this.trim();return this.hits.reduce((v,h)=>v+h.n,0)/10;},
  reset(){this.hits=[];}
};''')
region('function playerEnemyHpScale(){','/* V43', 'function playerEnemyHpScale(){return 1;} // XP is cosmetic; it never penalizes the player.')
region('const BALANCE_ENGINE = Object.freeze({','const GALAXY_REWARD_MULT', '// Gameplay balance and actual weapon math live in balance.js.')
replace('return 150*(Math.pow(1.05,lv-1)-1)/0.05;', 'const c=ND_BALANCE.config;return c.firstStageSeconds*(c.stageTimeGrowth**(lv-1)-1)/(c.stageTimeGrowth-1);')
replace("if(SD2.isActive()){if(!SD2.isReadyForGuardian())return;}\n else if((Number(gp.active)||0)<galaxySecondsToLevel(cleared+1))return;", "if((Number(gp.active)||0)<galaxySecondsToLevel(cleared+1))return;")
replace("const goal=SD2.isActive()?15:(GALAXY_LEVEL_TARGETS[galaxyIndex(G.id)]||60);", "const goal=GALAXY_LEVEL_TARGETS[galaxyIndex(G.id)]||60;")
region(' // Guardians are calibrated',' gp.stageBossId=e.id;', ''' const spec=ND_BALANCE.guardian(cleared,G.enemy.hpMul,isFinal);
 e.maxhp=e.hp=spec.hp;e.speed=spec.speed;
 e.bossShieldUntil=0;e.bossWeakUntil=0;
 e.reward=galaxyReward(spec.reward);
 e.boss=isFinal?G.name+' FINAL GUARDIAN':G.name+' LEVEL '+cleared+' GUARDIAN';''')
replace(" if(SD2.isActive())SD2.onGuardianDefeated(e,doneLevel,e.finalGalaxyBoss?null:Math.min(15,e.stageGoal));",'')
# All difficulty comes from galaxy, stage, and the explicit spawn intensity choice.
region('const AdaptiveThreat={','const Director = {', '''const AdaptiveThreat={
  seconds:0,threat:0,target:0,performance:.5,lastTick:0,baseHpPrev:0,
  reset(){this.seconds=0;this.threat=0;},recordKill(){},recordBreach(){},
  update(dt){this.seconds+=dt;},hpMult(){return 1;},speedMult(){return 1;},spawnMult(){return 1;}
};''')
region('  interval() {','  spawnOne() {', '''  interval() {
    const guardian=!!enemyById(galaxyProgress(G.id).stageBossId);
    return ND_BALANCE.spawnInterval(galaxyLevel(G.id),G.enemy.density||1,SPAWN_TIERS[S.spawnTier]||1,guardian);
  },
  hpMult(){return ND_BALANCE.stageHp(galaxyLevel(G.id));},
  spdMult(){return 1;},
  update(dt){
    this.diff+=dt/60;AdaptiveThreat.update(dt);
    this.t-=dt;
    if(this.t<=0){this.t=this.interval()*rand(.9,1.1);if(enemies.alive<arenaTargetCount())this.spawnOne();}
    const gl=galaxyLevel(G.id);
    this.eventT-=dt;
    if(this.eventT<=0){this.eventT=rand(65,85);if(gl>=3&&enemies.alive<arenaTargetCount()-2)spawnCompositeEvent();}
    this.bruteT-=dt;
    if(this.bruteT<=0){this.bruteT=rand(100,140);if(gl>=4&&enemies.alive<arenaTargetCount()-2)spawnBrute();}
    this.aegisT-=dt;
    if(this.aegisT<=0){this.aegisT=rand(100,140);if(enemies.alive<arenaTargetCount())spawnAegis();}
    this.blastT-=dt;
    if(this.blastT<=0){this.blastT=rand(110,150);if(enemies.alive<arenaTargetCount())spawnBlast();}
    if(S.baseHP>0&&S.baseHP<S.baseMax){this.regenT=(this.regenT||0)+dt;if(this.regenT>=4){this.regenT=0;S.baseHP=Math.min(S.baseMax,S.baseHP+1);updateBaseHUD();}}
  },''')
replace('const types = Object.keys(G.enemy.types);', "const weights=ND_BALANCE.enemyWeights(galaxyLevel(G.id),G.enemy.types,G.id==='aurora');\n    const types = Object.keys(weights);")
replace('wsum += G.enemy.types[t]', 'wsum += weights[t]')
replace('r -= G.enemy.types[t]', 'r -= weights[t]')
replace('e.t=rand(0.30,0.68);', 'e.t=rand(0.08,0.28);')
replace('dmg: 12 * Math.pow(1.18, u.dmg)', 'dmg: 24 * Math.pow(1.10, u.dmg)')
replace('2.4 * Math.pow(0.92, u.rate)', '2.2 * Math.pow(0.94, u.rate)')
replace('ECON.craftUpgCost(lvl)', 'ECON.craftUpgCost(lvl,key)')
# UI uses d.key rather than the purchase function's key.
replace("const lvl = SAVE.craft.up[d.key], maxed = lvl >= 8, cost = (d.key === 'size') ? ECON.craftSizeCost[lvl] : ECON.craftUpgCost(lvl,key);", "const lvl = SAVE.craft.up[d.key], maxed = lvl >= 8, cost = (d.key === 'size') ? ECON.craftSizeCost[lvl] : ECON.craftUpgCost(lvl,d.key);")
region('function craftUpgDesc(key, cs) {','function updateCraft(dt)', '''function craftUpgDesc(key, cs) {
  const next=craftStats({...SAVE.craft.up,[key]:SAVE.craft.up[key]+1});
  const field={dmg:'dmg',spd:'spd',rate:'cool',radius:'radius',range:'range',size:'size'}[key];
  const digits=['cool','radius'].includes(field)?2:1;
  return cs[field].toFixed(digits)+' → '+next[field].toFixed(digits)+(key==='rate'?'s':'');
}''')
replace('function craftStats() {\n  const u = SAVE.craft.up;', 'function craftStats(u = SAVE.craft.up) {')
# Remove the entire experimental director binding and all URL-controlled debug UI.
region('// special events inside continuous combat','function spawnCompositeEvent()', '// Normal play has no SD2 profile adapter or automated upgrade schedule.')
replace('  if(window.SD2) SD2.guardSpawn(type);','')
replace('const stageScale=Math.pow(1.045,Math.max(0,gl-1));','const stageScale=1; // stage growth is applied once by Director.hpMult()')
replace("    if (type === 'BOSS') hpm *= (1 + Math.min(0.15,Director.diff * 0.003)); // bosses scale with combat time",'')
replace("    if(SD2.isActive())SD2.onKill(e,sd2Reward); // legitimate kill reward with optional one-shot magnet",'')
replace("SD2.isActive()?SD2.spawnChild('MINI',()=>spawnEnemy('MINI',e.color,nl,e.t),e):spawnEnemy('MINI', e.color, nl, e.t)","spawnEnemy('MINI', e.color, nl, e.t)")
replace('  const sd2HPBefore=S.baseHP;','')
replace('  if(SD2.isActive())SD2.onBreach(e,sd2HPBefore-S.baseHP);','')
replace("  if(SD2.isActive())SD2.onDefeat('baseDestroyed');",'')
region('function turretStats(kind) {','function layoutTurrets()', '''function turretStats(kind,up=SAVE.up) {return ND_BALANCE.weaponStats(kind,up,TURRET_DEF);}''')
replace("t.cool = turretStats('LASER').cool;", "const laser=turretStats('LASER');t.cool=laser.beamDur+laser.cool;")
# Frame-time integration replaces overcounted 0.12s ticks and preserves weapon identity.
region('    bm.life -= dt;\n    bm.tick -= dt;', '    if (bm.life <= 0 || !tgt) pKill(beams, bm);', '''    const activeDt=Math.min(dt,Math.max(0,bm.life));
    bm.life-=dt;
    const tgt=enemyById(bm.targetId);
    const bHue=(bm.hue!=null?bm.hue:HUES.red);
    if(bm.dps>0&&tgt&&activeDt>0){
      damageEnemy(tgt,bm.dps*activeDt,bHue,'LASER');
    }''')
region('const UPGS = [','function buyUpgrade(key)', '''const UPGS = [
  ['eDmg','ELECTRIC','Damage'],['eRate','ELECTRIC','Fire rate'],['eRange','ELECTRIC','Range'],
  ['lDmg','LASER','Beam damage'],['lEff','LASER','Beam efficiency'],['lRange','LASER','Range'],
  ['rDmg','ROCKET','Damage'],['rRate','ROCKET','Fire rate'],['rAoe','ROCKET','Blast radius'],
  ['vDmg','VOID','Pulse damage'],['vRate','VOID','Pulse rate'],['vPull','VOID','Pull strength'],['base',null,'Base HP']
].map(([key,turret,name])=>({key,turret,name,max:ND_BALANCE.config.max[key],base:ND_BALANCE.config.prices[key]}));
function upgCost(u){return ND_BALANCE.price(u.key,SAVE.up[u.key]);}
function upgradeDescription(u){
  const fields={eDmg:'dmg',eRate:'rate',eRange:'range',lDmg:'dps',lEff:'cool',lRange:'range',rDmg:'dmg',rRate:'rate',rAoe:'aoeR',vDmg:'dmg',vRate:'cool',vPull:'pull'};
  if(u.key==='base')return (BAL.baseHP+25*SAVE.up.base)+' → '+(BAL.baseHP+25*(SAVE.up.base+1));
  const a=turretStats(u.turret),b=turretStats(u.turret,{...SAVE.up,[u.key]:SAVE.up[u.key]+1});
  const f=fields[u.key],digits=['rate','cool','aoeR','pull'].includes(f)?2:1;
  return a[f].toFixed(digits)+' → '+b[f].toFixed(digits)+(f==='cool'?'s':f==='rate'?'/s':'');
}''')
replace('u.desc(upgVal(u))','upgradeDescription(u)')
replace('const ULTIMATE_TEST_MODE = true;', 'const ULTIMATE_TEST_MODE = false;')
replace('    \'<button data-power-action="test" data-power="\'+key+\'">TRY NOW</button>\'+\n','')
replace('Single use · Real damage · Ads coming later','Single use · Earn coins to purchase')
replace("    if(G.id==='aurora' && Math.sin(S.time*1.65)>0.65)dmg*=.58;",'')
# Keep the player-facing readout honest: base DPS excludes area/control bonuses.
replace("'⚔️ Combat power: <b>' + fmt(combatPowerRating()) + '</b> DPS-equivalent<br>'", "'⚔️ Base weapon DPS: <b>' + combatPowerRating().toFixed(1) + '</b> (before affinity / area damage)<br>'+\n    '🎯 Actual damage / sec: <b>'+CombatMetrics.dps().toFixed(1)+'</b> (last 10s)<br>'")
replace("'🔥 Time threat: <b>' + threatLevel() + '</b> (10 min steps)<br>'", "'🌌 Galaxy level: <b>'+galaxyLevel(G.id)+'</b><br>'")
replace("'⚠ Threat level: <b>' + threatLevel() + '</b> (orbs scale with your weapons, upgrades, spacecraft + total coins)<br>'", "'⚠ Difficulty follows galaxy + level. Purchases never strengthen enemies.<br>'")
replace("Galaxy &amp; weapon unlocks use <b>total earned</b> — spending never reverses them.","Weapons cost available coins. Galaxies require progress in the previous galaxy; spending never removes earned progress.")
replace("ECON_PROFILE.toUpperCase()", "'EARNED IN COMBAT'")
replace(" PROFILE</span>","</span>")
# Update affordability in place: earning coins must enable purchases immediately,
# without rebuilding a card beneath an active touch.
replace('function updateGoldHUD() {', '''function refreshPurchaseButtons(){
  const money=SAVE.econ.avail;
  document.querySelectorAll('[data-buy]').forEach(b=>{
    const u=UPGS.find(u=>u.key===b.dataset.buy);if(!u)return;
    const owned=!u.turret||SAVE.weapons[u.turret],maxed=SAVE.up[u.key]>=u.max,cost=upgCost(u);
    b.disabled=!owned||maxed;
    b.textContent=maxed?'MAX':!owned?'WEAPON LOCKED':money>=cost?'UPGRADE · '+fmt(cost)+' 🪙':'NEED '+fmt(cost-money)+' 🪙';
  });
  document.querySelectorAll('[data-weapon]').forEach(b=>{
    const price=ECON.weapons[b.dataset.weapon];b.textContent=money>=price?'BUY '+fmt(price)+' 🪙':'NEED '+fmt(price-money)+' 🪙';
  });
  document.querySelectorAll('[data-craftbuy]').forEach(b=>{b.disabled=money<ECON.spacecraft;});
  document.querySelectorAll('[data-cupg]').forEach(b=>{
    const key=b.dataset.cupg,lvl=SAVE.craft.up[key],cost=key==='size'?ECON.craftSizeCost[lvl]:ECON.craftUpgCost(lvl,key);
    b.disabled=lvl>=8||money<cost;
  });
  document.querySelectorAll('[data-tierbuy]').forEach(b=>{b.disabled=money<ECON.spawnTierCost[Number(b.dataset.tierbuy)];});
  const balance=document.querySelector('.upgradeBalance');
  if(balance)balance.innerHTML='🪙 AVAILABLE: <b>'+fmt(money)+'</b> · TOTAL EARNED: '+fmt(SAVE.econ.total)+'<span> · Tap a weapon card to see upgrades</span>';
}
function updateGoldHUD() {
  refreshPurchaseButtons();''')
region('function saveCombatDifficulty(){','/* ================= flow ================= */', '''function saveCombatDifficulty(){persist();}
function restoreCombatDifficulty(){retryThreatFloor=0;}''')
replace('autoFireContinuous=false;\n  clearField();','autoFireContinuous=true;\n  CombatMetrics.reset();\n  clearField();')
region("const DEBUG = (typeof location", 'function loop(now)', 'const DEBUG=false;')
region('/* debug tools (?debug=1)', '/* ================= init ================= */', '// No developer controls or test API are shipped.')
s=re.sub(r'\n<script async data-explicit-opt-in=.*?</script>\s*$', '\n', s, flags=re.S)
assert 'SD2.' not in s
assert 'sd2.js' not in s
assert 'window.__ND' not in s

# Count real health/shield damage, not overkill, for a useful gameplay readout.
replace('  const dealt = dmg * mult;\n  part.hp -= dealt;', '  const dealt = Math.min(Math.max(0,dmg*mult),Math.max(0,part.hp));\n  CombatMetrics.record(dealt);\n  part.hp -= dealt;')
replace('    e.shield -= dmg;', '    CombatMetrics.record(Math.min(Math.max(0,dmg),e.shield));\n    e.shield -= dmg;')
replace('  e.hp -= dmg;\n  e.hitFlash', '  dmg=Math.min(Math.max(0,dmg),Math.max(0,e.hp));\n  CombatMetrics.record(dmg);\n  e.hp -= dmg;\n  e.hitFlash')
# Shield damage carries through to health when a hit breaks the shield.
replace('    e.shield -= dmg;', '    const shieldDamage=Math.min(dmg,e.shield);\n    e.shield-=shieldDamage;dmg-=shieldDamage;')
replace('    return 0;\n  }\n  dmg=Math.min', '    if(dmg<=0)return 0;\n  }\n  dmg=Math.min')

(root/'releases/balanced-v1/index.html').write_text(s)
print('Built recovered normal-play HTML:',len(s.encode()),'bytes')
