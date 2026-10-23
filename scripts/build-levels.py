from pathlib import Path
root=Path(__file__).resolve().parent.parent
s=(root/'releases/balanced-v1/index.html').read_text()
def replace(a,b):
 global s
 assert a in s,a[:80]
 s=s.replace(a,b)
def region(a,b,t):
 global s
 i=s.index(a);j=s.index(b,i);s=s[:i]+t+'\n'+s[j:]

replace('<script src="balance.js"></script>','<script src="levels.js"></script>\n<script src="balance.js"></script>')
replace('NEON DEFENSE — Balanced','NEON DEFENSE — Combat Levels')
replace('v1.0 Balanced · progress saves locally','v2.0 Combat Levels · progress saves locally')
replace('const SAVE_VER = 4;','const SAVE_VER = 5;')
replace('cleared:Math.max(1,safe(gp.cleared,100)),finalDefeated:gp.finalDefeated===true','cleared:Math.max(1,safe(gp.cleared,100)),combatLevel:Math.max(1,safe(gp.combatLevel,60)),lastDefeated:safe(gp.lastDefeated,60),levelSchema:2,finalDefeated:gp.finalDefeated===true')
region('function galaxyProgress(id){','function nextGalaxyRequirement(){', '''function galaxyProgress(id){
  SAVE.galaxy.progress??={};
  const gp=SAVE.galaxy.progress[id]??={coins:0,kills:0,visited:false};
  if(gp.levelSchema!==2){Object.assign(gp,{combatLevel:1,lastDefeated:0,cleared:1,levelSchema:2,finalDefeated:false});}
  return gp;
}
function galaxyLevel(id){return Math.max(1,Math.floor(galaxyProgress(id).combatLevel||1));}
function levelSpec(){return ND_LEVELS.stage(galaxyLevel(G.id),galaxyIndex(G.id));}
function stageGate(){
  if(Director.phase!=='clearing'||Director.aliveHostiles()>0)return;
  const gp=galaxyProgress(G.id),lv=galaxyLevel(G.id),goal=GALAXY_LEVEL_TARGETS[galaxyIndex(G.id)]||60;
  const e=spawnEnemy('BOSS',pick(G.enemy.colors));if(!e)return;
  e.stageBoss=true;e.finalGalaxyBoss=lv>=goal;e.stageGoal=lv+1;e.levelKind='guardian';
  e.hp=e.maxhp=Math.round(levelSpec().guardianHP*G.enemy.hpMul);e.speed=.012;
  e.reward=galaxyReward(Math.round((e.finalGalaxyBoss?400:100)*(1+.06*(lv-1))));
  e.boss=G.name+' LEVEL '+lv+' GUARDIAN';
  gp.stageBossId=e.id;Director.phase='guardian';renderPlayerProgress();
  toast('👑 LEVEL '+lv+' GUARDIAN');
}
function onStageBossDefeated(e){
  if(!e.stageBoss)return;
  const gp=galaxyProgress(G.id);if(gp.stageBossId!==e.id)return;
  const done=galaxyLevel(G.id);gp.stageBossId=null;gp.lastDefeated=done;
  if(e.finalGalaxyBoss){gp.finalDefeated=true;gp.cleared=done;Director.phase='complete';toast('🏆 '+G.name+' COMPLETE');}
  else {gp.combatLevel=done+1;gp.cleared=done+1;Director.phase='transition';Director.t=2;toast('LEVEL '+done+' CLEAR → LEVEL '+(done+1));}
  persist();checkGalaxyUnlocks();renderPlayerProgress();
}
let lastGalaxyKillAt=-1e9,galaxyPersistTimer=0,lastGalaxyLevel=1;
function galaxyKillActivity(){if(S.phase!=='combat')return;const gp=galaxyProgress(G.id);gp.visited=true;gp.kills=(gp.kills||0)+1;lastGalaxyKillAt=S.time;}
function galaxyActiveTick(dt){
  if(S.phase!=='combat')return;stageGate();
  galaxyPersistTimer+=dt;if(galaxyPersistTimer>=1){galaxyPersistTimer=0;persist();renderPlayerProgress();}
}''')
replace("document.getElementById('playerName').textContent=SAVE.player.name;", "document.getElementById('playerName').textContent=SAVE.player.name+' · XP '+lv;")
replace("document.getElementById('playerLevel').textContent='Lv.'+lv;", "document.getElementById('playerLevel').textContent='LEVEL '+galaxyLevel(G.id);")
replace("document.getElementById('playerXpFill').style.width=(100*(xp-low)/Math.max(1,high-low)).toFixed(2)+'%';", "const spec=levelSpec(),done=Director.killed+Director.breached;\n  document.getElementById('playerXpFill').style.width=(100*Math.min(1,done/spec.count))+'%';\n  document.getElementById('combatLevelStatus').textContent=Director.phase==='guardian'?'GUARDIAN · '+G.name:Director.phase==='complete'?'GALAXY COMPLETE':G.name+' · '+Director.killed+'/'+spec.count+' defeated'+(Director.breached?' · '+Director.breached+' breached':'');")
replace("const lp=Math.min(1,Math.max(0,(l-1+(gp.active-galaxySecondsToLevel(l))/Math.max(1,galaxySecondsToLevel(l+1)-galaxySecondsToLevel(l)))/(next.level-1)));", "const lp=Math.min(1,(Number(gp.lastDefeated)||0)/next.level);")
replace("toast('⭐ LEVEL UP! Lv.'+newLv)", "toast('⭐ XP RANK '+newLv)")
replace('<div id="playerProgress" aria-label="Player experience">','<div id="playerProgress" aria-label="Combat level and player experience">')
replace('  <div id="galaxyMilestone">', '  <div id="combatLevelStatus" role="status">AURORA · 0/72 defeated</div>\n  <div id="galaxyMilestone">')
replace('</style>', '''#combatLevelStatus{grid-column:1/-1;grid-row:3;text-align:center;font-size:11px;font-weight:800;line-height:18px;letter-spacing:.3px;background:#0b1834;border:1px solid #264c83;border-radius:6px;color:#80edff}
#playerLevel{font-size:15px!important}
#hud{grid-template-rows:48px 62px 22px}
#sideTools{top:calc(171px + env(safe-area-inset-top))}
#powersCol{top:calc(177px + env(safe-area-inset-top))}
#pauseBtn{top:calc(154px + env(safe-area-inset-top))}
</style>''')
replace("HOR = H * 0.16; GY = H * 0.94;", "const header=document.getElementById('hud');\n  const headerBottom=header.getBoundingClientRect().bottom-bw.getBoundingClientRect().top;\n  HOR=Math.min(H*.48,headerBottom+22);GY=H*.94;")
# Actual canvas geometry, plus a minimum visible time, defines eligibility.
replace('function projScale(t) { return 0.30 + 0.72 * clamp(t, 0, 1.2); }','function projScale(t) { return 0.48 + 0.54 * clamp(t, 0, 1.2); }')
replace('function projY(t)', '''function enemyIsVisible(e){
  const p=w2s(e.lane,e.t),r=Math.max(9,e.r*p.s);
  return p.y-r>=HOR-2&&p.y+r<GY+24&&p.x-r>=4&&p.x+r<=W-4;
}
function enemyCanBeHit(e){return enemyIsVisible(e)&&(e.visibleFor||0)>=1.1&&e.t>=.22;}
function projY(t)''')
region('const Director = {','/* ============ spawn intensity tiers', '''const Director={
  cap:24,t:1,diff:0,phase:'spawn',spawned:0,killed:0,breached:0,deck:[],supplyGiven:false,
  reset(){this.begin();this.diff=0;},
  begin(){const spec=levelSpec();this.deck=ND_LEVELS.deck(spec);this.spawned=0;this.killed=0;this.breached=0;this.supplyGiven=false;this.t=1;this.phase=galaxyProgress(G.id).finalDefeated?'complete':'spawn';},
  interval(){return levelSpec().interval/(SPAWN_TIERS[S.spawnTier]||1);},
  hpMult(){return levelSpec().hp.NORMAL/ENEMY_DEF.NORMAL.hp;},spdMult(){return levelSpec().speed;},
  aliveHostiles(){return enemies.arr.reduce((n,e)=>n+(e.on&&!e.dead&&e.type!=='AEGIS'&&e.type!=='BLAST'?1:0),0);},
  resolved(e,kind){if(e.levelKind==='budget'&&e.levelNo===galaxyLevel(G.id)){if(kind==='kill')this.killed++;else this.breached++;}},
  update(dt){
    this.diff+=dt/60;
    if(this.phase==='transition'){this.t-=dt;if(this.t<=0){this.begin();renderPlayerProgress();}return;}
    if(this.phase==='guardian'&&!enemyById(galaxyProgress(G.id).stageBossId)){
      this.t-=dt;if(this.t<=0){this.phase='clearing';stageGate();}return;
    }
    if(this.phase!=='spawn')return;
    this.t-=dt;
    if(this.t<=0&&this.aliveHostiles()<levelSpec().maxAlive){
      const type=this.deck[this.spawned];
      if(type){const e=spawnEnemy(type,pick(G.enemy.colors));if(e){e.levelKind='budget';this.spawned++;this.t=this.interval();}}
      if(this.spawned>=this.deck.length)this.phase='clearing';
    }
    if(!this.supplyGiven&&galaxyLevel(G.id)>=2&&this.spawned>=this.deck.length/2){this.supplyGiven=true;spawnAegis();}
  }
};''')
# All non-plan spawns are classified as mechanic children; no periodic bonus floods.
replace("  if(G.id==='jade'&&S.time>=jadeNextQueen){jadeNextQueen=S.time+75;spawnJadeQueen();}",'')
replace('    e.id = uid();', "    e.id = uid();e.visibleFor=0;e.levelNo=galaxyLevel(G.id);e.levelKind='child';")
replace('e.t = (t0 === undefined) ? rand(-0.06, 0) : t0;', 'e.t = (t0 === undefined) ? .08 : Math.max(.08,t0);')
region('    let hm = Director.hpMult();','    e.baseSpeed=e.speed;', '''    const spec=levelSpec();
    const base=spec.hp[type]||d.hp;
    e.hp=e.maxhp=Math.round(base*(type==='AEGIS'||type==='BLAST'?1:G.enemy.hpMul));
    e.speed=d.speed*spec.speed*G.enemy.spdMul;''')
replace('    e.wob += dt * 3;', '    e.visibleFor=enemyIsVisible(e)?(e.visibleFor||0)+dt:0;\n    e.wob += dt * 3;')
replace('    const r = e.r * p.s;\n    // glow halo', '    const r = Math.max(9,e.r * p.s);\n    // glow halo')
# Gate all targeting AND all damage paths, including splash, craft and powers.
replace('if (pe) {\n      const pp', 'if (pe && enemyCanBeHit(pe)) {\n      const pp')
replace('const dist = Math.hypot(pp.x - tp.x, pp.y - tp.y);', 'const dist = Math.hypot(pp.x - tp.x, pp.y - tp.y);\n      const maxRange=st.range/430*(GY-HOR)*.72+15;')
replace('st.range * FIELD_RANGE_K * tp.s + 40', 'maxRange')
replace('    if (!e.on || e.dead) continue;\n    const pp = w2s(e.lane, e.t);', '    if (!e.on || e.dead || !enemyCanBeHit(e)) continue;\n    const pp = w2s(e.lane, e.t);')
replace("  if (!e.on || e.dead) return 0;\n  if (e.comp)", "  if (!e.on || e.dead || !enemyCanBeHit(e)) return 0;\n  if (e.comp)")
replace("if (!e.on || e.dead || !enemyCanBeHit(e)) return 0;", "if (S.phase!=='combat'||!e.on || e.dead || !enemyCanBeHit(e)) return 0;")
replace('    if (!e.on || e.dead) continue;\n    const d = Math.hypot(e.t - craft.t', '    if (!e.on || e.dead || !enemyCanBeHit(e)) continue;\n    const d = Math.hypot(e.t - craft.t')
replace('  e.dead = true;\n  const jadeLinked', "  e.dead = true;Director.resolved(e,'kill');\n  const jadeLinked")
replace('  e.dead = true; // removed exactly once, no reward', "  e.dead = true;Director.resolved(e,'breach');\n  if(e.stageBoss){galaxyProgress(G.id).stageBossId=null;Director.t=8;} // guardian escape never completes a level\n  // removed exactly once, no reward")
# Previous branch's periodic base regen made idle play too forgiving.
replace("'🌌 Galaxy level: <b>'+galaxyLevel(G.id)+'</b><br>'", "'🌌 Combat level: <b>'+galaxyLevel(G.id)+'</b> · '+Director.killed+'/'+levelSpec().count+' defeated<br>'")
replace("+' defeated<br>'", "+' defeated<br>'+\n    '👾 This level: '+levelSpec().count+' enemies · one every '+Director.interval().toFixed(2)+'s<br>'+\n    '❤️ Normal enemy: '+Math.round(levelSpec().hp.NORMAL*G.enemy.hpMul)+' HP · Guardian: '+Math.round(levelSpec().guardianHP*G.enemy.hpMul)+' HP<br>'")
replace('  Director.reset();', '  Director.reset();renderPlayerProgress();')
replace('function refreshPurchaseButtons(){', '''let firstUpgradeHintShown=false;
function refreshPurchaseButtons(){
  const availableUpgrade=UPGS.some(u=>(!u.turret||SAVE.weapons[u.turret])&&SAVE.up[u.key]<u.max&&SAVE.econ.avail>=upgCost(u));
  document.getElementById('shopDot').style.display=availableUpgrade?'block':'none';
  if(!firstUpgradeHintShown&&S.phase==='combat'&&SAVE.up.eDmg===0&&SAVE.econ.avail>=upgCost(UPGS.find(u=>u.key==='eDmg'))){firstUpgradeHintShown=true;toast('UPGRADE READY · DEFENSE → ELECTRIC → DAMAGE');}''')
(root/'releases/levels-v2/index.html').write_text(s)
b=(root/'releases/balanced-v1/balance.js').read_text().replace("version: '1.0.0-balanced', saveKey: 'neonDefense_balanced_v1'", "version: '2.0.0-levels', saveKey: 'neonDefense_levels_v2'")
b=b[:b.index('  function stageHp')]+"  global.ND_BALANCE=Object.freeze({config,weaponStats,weaponDps,price});\n})(globalThis);\n"
b='\n'.join(line for line in b.split('\n') if 'stageHpGrowth:' not in line and 'spawnSeconds:' not in line)
(root/'releases/levels-v2/balance.js').write_text(b)
print('Level release built',len(s.encode()))
