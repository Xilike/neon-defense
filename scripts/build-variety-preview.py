"""Independent tactics candidate; preserve both requested comparison versions."""
from pathlib import Path
import json,hashlib,shutil
root=Path(__file__).resolve().parent.parent
source=root/'releases/boss-v1-lab';out=root/'releases/variety-v1-lab';out.mkdir(exist_ok=True)
for p in source.iterdir():
 if p.is_file() and p.name!='integrity.json':shutil.copyfile(p,out/p.name)
html=(source/'index.html').read_text()
def replace(old,new,count=1):
 global html
 assert html.count(old)==count,(old,html.count(old))
 html=html.replace(old,new)
asset=(root/'gameplay/variety-v1/tactics.js').read_text()
replace('const Director={',asset+'\nconst Director={')
replace("this.phase=galaxyProgress(G.id).finalDefeated?'complete':'spawn';}","this.phase=galaxyProgress(G.id).finalDefeated?'complete':'spawn';beginVarietyStage();}")
replace("e.levelKind='budget';this.spawned++;","e.levelKind='budget';assignVarietyRole(e,this.spawned);this.spawned++;")
old='e.stageBoss=false;e.finalGalaxyBoss=false;'
n=html.count(old);assert n==2
replace(old,'resetVarietyEnemy(e);'+old,n)
replace('function updateLaneAI(e, dt) {',"function updateLaneAI(e, dt) {\n  if(e.varietyRole==='charger'&&(e.varietyPhase==='warning'||e.varietyPhase==='dash'))return;")
replace('  dmg=galaxyDamageModifier(e,dmg,wkind);','  dmg=varietyDamage(e,galaxyDamageModifier(e,dmg,wkind));')
replace("  e.dead = true;Director.resolved(e,'kill');","  e.dead = true;varietyLeaderDefeated(e);Director.resolved(e,'kill');")
replace('    updateGuardianSiege(e,dt);','    updateGuardianSiege(e,dt);updateVarietyEnemy(e);')
replace('    e.t += sp * dt;','    e.t += sp * varietySpeed(e) * dt;')
replace('  GoldCarrier.draw();','  drawVarietyTactics();\n  GoldCarrier.draw();')
(out/'index.html').write_text(html)
files={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(out.iterdir()) if p.is_file() and p.name!='integrity.json'}
(out/'integrity.json').write_text(json.dumps({'version':'3.1.0-campaign','experiment':'variety-v1','profile':'lab','base':'boss-v1-lab','scope':'Aurora levels 1-10','files':files},indent=2)+'\n')
print('Built independent first-ten-stage leader and dash experiment.')
