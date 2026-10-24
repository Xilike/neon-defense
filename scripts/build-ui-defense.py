from pathlib import Path
import shutil,json,hashlib
root=Path(__file__).resolve().parent.parent
source=root/'releases/events-v2.1-lab'
target=root/'releases/ui-defense-preview';target.mkdir(exist_ok=True)
s=(source/'index.html').read_text()
a=s.index('function drawDefenseLine() {');b=s.index('/* 2.5D shaded sphere',a)
s=s[:a]+(root/'gameplay/ui-defense/defense.js').read_text()+'\n'+s[b:]
# Visual hit feedback only; damage, breach depth, range and projection unchanged.
s=s.replace("function breachBase(e) {\n  if (!e.on || e.dead) return;", "function breachBase(e) {\n  if (!e.on || e.dead) return;\n  if(!e.bonusGold&&e.type!=='AEGIS'&&e.type!=='BLAST')S.defenseImpactUntil=S.time+.3;")
# Retain the existing shield timer in the HUD instead of a duplicate field label.
s=s.replace("function updateBaseHUD() {", "function updateBaseHUD() {\n  const label=document.querySelector('.defLabel');\n  if(label)label.textContent=S.time<(S.lineShieldUntil||0)?'DEFENSE · SHIELD '+Math.ceil(S.lineShieldUntil-S.time)+'s':'DEFENSE LINE';")
s=s.replace("uiT = 0.25; updateGoldHUD();", "uiT = 0.25; updateGoldHUD();updateBaseHUD();")
s=s.replace('v2.1 Gold Courier · progress saves locally','v2.1 UI Preview · progress saves locally')
for f in source.iterdir():
 if f.name not in ['integrity.json','index.html']:shutil.copyfile(f,target/f.name)
(target/'index.html').write_text(s)
files={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(target.iterdir()) if p.name!='integrity.json'}
(target/'integrity.json').write_text(json.dumps({'version':'2.1.0-ui-defense-preview','profile':'lab','files':files},indent=2)+'\n')
print('Built visual-only lab preview. Normal play root untouched.')
