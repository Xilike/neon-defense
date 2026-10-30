"""Isolated guardian experiment; never rewrites the published 3.1 snapshots."""
from pathlib import Path
import shutil,json,hashlib
root=Path(__file__).resolve().parent.parent
source=root/'releases/families-v2-lab';out=root/'releases/boss-v1-lab'
out.mkdir(exist_ok=True)
for p in source.iterdir():
 if p.is_file() and p.name!='integrity.json':shutil.copyfile(p,out/p.name)
html=(out/'index.html').read_text()
old='ctx.save();try{drawFamilyEnemyBody(e,p,r);}finally{ctx.restore();}'
new='ctx.save();try{if(e.stageBoss)drawStageGuardian(e,p,r);else drawFamilyEnemyBody(e,p,r);}finally{ctx.restore();}'
assert html.count(old)==1
art=(root/'gameplay/presentation/boss-v1/guardian.js').read_text()
html=html.replace(old,new,1).replace('function drawEnemyBody(e,p,r){',art+'\nfunction drawEnemyBody(e,p,r){',1)
assert html.replace(art+'\n','',1).replace(new,old,1)==(source/'index.html').read_text()
(out/'index.html').write_text(html)
model=(source/'campaign.js').read_text()
# HP already reflects end-of-stage gear. End gear now also defines the siege
# allowance. Everything remains fixed from the authored, affordable ledger.
old='guardianHP/Math.max(1,fleet(startBuild,false))'
new='1.2+guardianHP/Math.max(1,fleet(endBuild,false))'
assert model.count(old)==1
model=model.replace(old,new,1)
# Eclipse's Electric/Void reveal supplies a 1.45x damage window. Its fixed
# siege allowance accounts for that existing vulnerability.
old_factor='(g===6?rules.cryonWindowFactor:'
assert model.count(old_factor)==1
model=model.replace(old_factor,'(g===4?.9:g===6?rules.cryonWindowFactor:',1)
(out/'campaign.js').write_text(model)
files={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(out.iterdir()) if p.is_file() and p.name!='integrity.json'}
(out/'integrity.json').write_text(json.dumps({'version':'3.1.0-campaign','experiment':'boss-v1','profile':'lab','changes':['stage guardian painter','guardian siege allowance uses referenceEnd fleet'], 'files':files},indent=2)+'\n')
print('Built isolated boss-v1-lab; prices, weapons, wave stats and save keys unchanged.')
