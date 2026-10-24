from pathlib import Path
import shutil,json,hashlib
root=Path(__file__).resolve().parent.parent
source=root/'releases/focus-v2.0.1'
target=root/'releases/events-v2.1'
target.mkdir(exist_ok=True)
s=(source/'index.html').read_text()
def replace(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b)
replace('<script src="balance.js"></script>','<script src="runtime-config.js"></script>\n<script src="balance.js"></script>')
replace('const SAVE_KEY = ND_BALANCE.config.saveKey;',"const TEST_BUILD=globalThis.ND_TEST_BUILD===true;\nconst SAVE_KEY = TEST_BUILD?'neonDefense_lab_v21':ND_BALANCE.config.saveKey;")
replace("1.1&&(manualAim", ".70&&(manualAim")
replace('v2.0.1 Focus · progress saves locally','v2.1 Gold Courier · progress saves locally')
replace("const PANEL_COLLAPSE_KEY = 'neonDefense_balanced_panel_v1';", "const PANEL_COLLAPSE_KEY = TEST_BUILD?'neonDefense_lab_panel_v21':'neonDefense_balanced_panel_v1';")
replace('levelSchema:2,finalDefeated:gp.finalDefeated===true','levelSchema:2,goldVisited:safe(gp.goldVisited,60),finalDefeated:gp.finalDefeated===true')
start=s.index('let AC = null;');end=s.index('/* ================= canvas',start)
s=s[:start]+(root/'gameplay/v2.1/audio.js').read_text()+'\n'+s[end:]
replace('function addCoins(n) {','function addCoins(n,activity=true) {')
replace("if(S.phase==='combat'){\n    const gp=galaxyProgress(G.id);", "if(activity&&S.phase==='combat'){\n    const gp=galaxyProgress(G.id);")
replace('  n = Math.floor(n);\n  if (!(n > 0) || SAVE.econ.avail < n) return false;', '  n = Math.floor(n);\n  if(TEST_BUILD)Lab.funds();\n  if (!(n > 0) || SAVE.econ.avail < n) return false;')
replace("e.type!=='AEGIS'&&e.type!=='BLAST'?1:0", "e.type!=='AEGIS'&&e.type!=='BLAST'&&!e.bonusGold?1:0")
replace("e.id = uid();e.visibleFor=0;e.levelNo=galaxyLevel(G.id);e.levelKind='child';", "e.id = uid();e.bonusGold=false;e.goldLife=0;e.visibleFor=0;e.levelNo=galaxyLevel(G.id);e.levelKind='child';")
replace("if (e.comp) return damageComposite(e, dmg, matchHue, wkind);", "if(e.bonusGold)return damageGoldOrb(e,matchHue===e.hue?dmg*BAL.matchMult:dmg);\n  if (e.comp) return damageComposite(e, dmg, matchHue, wkind);")
replace('function killEnemy(e, srcHue) {\n  if (!e.on || e.dead) return;', 'function killEnemy(e, srcHue) {\n  if (!e.on || e.dead) return;\n  if(e.bonusGold){collectGoldOrb(e);return;}')
replace('function breachBase(e) {\n  if (!e.on || e.dead) return;', 'function breachBase(e) {\n  if (!e.on || e.dead) return;\n  if(e.bonusGold){expireGoldOrb(e);return;}')
replace('    e.visibleFor=enemyIsVisible(e)?(e.visibleFor||0)+dt:0;','    e.visibleFor=enemyIsVisible(e)?(e.visibleFor||0)+dt:0;\n    if(e.bonusGold){updateGoldOrb(e,dt);continue;}')
replace("if (!o.on || o.dead || o === e) continue;", "if (!o.on || o.dead || o === e || o.bonusGold) continue;")
replace("if(n===e||!n.on||n.dead||n.type==='AEGIS'", "if(n===e||!n.on||n.dead||n.bonusGold||n.type==='AEGIS'")
replace('    const r = Math.max(9,e.r * p.s);\n    // glow halo', '    const r = Math.max(9,e.r * p.s);\n    if(e.bonusGold){drawGoldOrb(e,p,r);continue;}\n    // glow halo')
# Preserve cooldowns on layout changes, including opening weapon upgrades.
replace('function layoutTurrets() {\n  turrets.length = 0;', 'function layoutTurrets(preserve=false) {\n  const previous=new Map((preserve?turrets:[]).map(t=>[t.kind,{...t}]));\n  turrets.length = 0;')
replace('  defs.forEach((d, i) => {', '  defs.forEach((d, i) => {\n    const initialCool=rand(0,.4);')
replace('angle: -Math.PI / 2, cool: rand(0, 0.4),', 'angle: previous.get(d.kind)?.angle??-Math.PI/2, cool: previous.get(d.kind)?.cool??initialCool,')
replace("  layoutTurrets();\n}\nwindow.addEventListener('resize'", "  layoutTurrets(true);\n}\nwindow.addEventListener('resize'")
replace('targetId: null,\n    });', 'targetId: previous.get(d.kind)?.targetId??null,\n    });')
# Tap physical turret to open its existing upgrades; never change focus.
replace('let pdown = null, lpTimer = null, lpFired = false;', '''let pdown = null, lpTimer = null, lpFired = false,turretTapGesture=null;
// Opening cards moves content under a finger. Consume only the compatibility
// click from that same pointer gesture, never the user's next touch.
document.addEventListener('click',e=>{
  const g=turretTapGesture;if(!g||performance.now()-g.at>500||e.detail===0)return;
  if(e.pointerId===g.pointerId||(e.pointerId==null&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<3)){
    turretTapGesture=null;e.preventDefault();e.stopImmediatePropagation();
  }
},true);''')
replace('function canvasTap(x, y) {\n  startContinuousAuto();', '''function canvasTap(x, y) {
  if(S.phase!=='combat')return;
  for(const t of turrets){
    const p=turretPos(t);
    if(Math.abs(x-p.x)<=Math.max(22,30*p.s)&&y>=p.y-52*p.s&&y<=p.y+18*p.s){const r=cv.getBoundingClientRect();turretTapGesture={pointerId:pdown?.pointerId,x:x+r.left,y:y+r.top,at:performance.now()};openTurretUpgrades(t.kind);return;}
  }
  startContinuousAuto();''')
replace('    if (!e.on || e.dead) continue;\n    const p = w2s(e.lane, e.t);\n    const d = Math.hypot', '    if (!e.on || e.dead || !enemyIsVisible(e)) continue;\n    const p = w2s(e.lane, e.t);\n    const d = Math.hypot')
a=s.index('  if (S.priority && S.priority.id === best.id) {',s.index('function canvasTap'))
b=s.index("  SFX.click();",a)
s=s[:a]+"  S.priority={id:best.id,until:S.time+8,locked:false};\n  toast('◎ Focus fire (8s)');\n"+s[b:]
# Pointer events are viewport coordinates, but rendering uses canvas local pixels.
replace('  pdown = { x: e.clientX, y: e.clientY,', '  const rect=cv.getBoundingClientRect();\n  pdown = { pointerId:e.pointerId,x: e.clientX-rect.left, y: e.clientY-rect.top,')
replace('Math.hypot(e.clientX - pdown.x, e.clientY - pdown.y)', 'Math.hypot(e.clientX-cv.getBoundingClientRect().left-pdown.x,e.clientY-cv.getBoundingClientRect().top-pdown.y)')
replace('canvasTap(e.clientX, e.clientY);', 'canvasTap(e.clientX-cv.getBoundingClientRect().left,e.clientY-cv.getBoundingClientRect().top);')
replace('  S.priority = null; S.spawnQueue = [];', '  S.priority = null; S.spawnQueue = [];GoldCarrier.reset();')
replace('  drawTurrets();\n  drawCraft();', '  GoldCarrier.draw();\n  drawTurrets();\n  drawCraft();')
start=s.index('    S.time += dt;\n    Director.update(dt);',s.index('function loop'))
end=s.index("  } else if (S.phase === 'transit')",start)
s=s[:start]+'''    const scale=TEST_BUILD?Lab.speed:1;
    for(let n=0;n<scale&&S.phase==='combat';n++)simulateCombat(dt);

'''+s[end:]
replace('/* ================= render ================= */', (root/'gameplay/v2.1/events.js').read_text()+'\n'+(root/'gameplay/v2.1/lab.js').read_text()+'\n/* ================= render ================= */')
replace('// No developer controls or test API are shipped.','// The normal profile never creates lab controls; query strings cannot enable them.')
replace('renderPanel();\nfunction enforcePortrait()', 'renderPanel();Lab.init();\nfunction enforcePortrait()')
replace("SAVE.settings.sfx = !SAVE.settings.sfx; persist(); this.classList.toggle('on', SAVE.settings.sfx); SFX.click();", "SAVE.settings.sfx = !SAVE.settings.sfx;persist();this.classList.toggle('on',SAVE.settings.sfx);\n  if(SAVE.settings.sfx){unlockAudio();SFX.unlock();}else if(audioMaster)audioMaster.gain.value=0;\n  if(audioMaster&&SAVE.settings.sfx)audioMaster.gain.value=.85;")
# Existing card clicks and physical turret taps share the existing accordion.
replace('</style>', '''#labTools{position:fixed;right:8px;bottom:90px;z-index:9000;background:#14253f;color:#e0f6ff;border:1px solid #ffcf68;border-radius:10px;font:13px Tahoma;max-width:calc(100vw - 16px)}
#labTools summary{padding:9px;cursor:pointer;color:#ffe69a;font-weight:bold}
#labTools .labBody{padding:10px;width:280px;max-width:calc(100vw - 40px);max-height:50vh;overflow:auto;direction:rtl}
#labTools label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:10px 0}
#labTools select,#labTools input[type=number]{color:#fff;background:#08142a;border:1px solid #719ac0;padding:6px;max-width:150px;border-radius:5px}
#labTools button{background:#12385d;color:#fff;border:1px solid #5fb2d9;border-radius:6px;padding:8px;cursor:pointer}
#labTools .labRow{display:flex;gap:8px;margin:8px 0}#labTools small{display:block;line-height:1.7;color:#a9c1da}
</style>''')
for name in ['levels.js','manifest.webmanifest','vercel.json']:shutil.copyfile(source/name,target/name)
(target/'index.html').write_text(s)
(target/'balance.js').write_text((source/'balance.js').read_text().replace('2.0.1-focus','2.1.0-courier'))
(target/'runtime-config.js').write_text('/* Normal play: test controls cannot be enabled by URL. */\nglobalThis.ND_TEST_BUILD=false;\n')
lab=root/'releases/events-v2.1-lab';lab.mkdir(exist_ok=True)
for f in target.iterdir():
 if f.name!='integrity.json':shutil.copyfile(f,lab/f.name)
(lab/'runtime-config.js').write_text('/* Isolated lab deployment. Gameplay source is identical to normal play. */\nglobalThis.ND_TEST_BUILD=true;\n')
for directory in [target,lab]:
 files={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(directory.iterdir()) if p.name!='integrity.json'}
 (directory/'integrity.json').write_text(json.dumps({'version':'2.1.0-courier','profile':'lab' if directory==lab else 'normal','files':files},indent=2)+'\n')
print('Built normal and isolated lab profiles; identical gameplay HTML/level/economy code.')
