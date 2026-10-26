"""Apply the supplied painters to the approved 3.1 game. No gameplay patches."""
from pathlib import Path
import hashlib,json,shutil
root=Path(__file__).resolve().parent.parent
assets=root/'gameplay/presentation/families-v2'
families=(assets/'families.js').read_text()
ring=(assets/'health-ring.js').read_text()
# Canvas state isolation is the only adapter to the supplied painter.
body=families.replace('function drawEnemyBody(e, p, r)', 'function drawFamilyEnemyBody(e, p, r)',1)
body+='''\nfunction drawEnemyBody(e,p,r){
  ctx.save();try{drawFamilyEnemyBody(e,p,r);}finally{ctx.restore();}
}
'''
for profile,source_name,out_name in [('normal','campaign-v3','families-v2'),('lab','campaign-v3-lab','families-v2-lab')]:
 source=root/'releases'/source_name;out=root/'releases'/out_name
 original=(source/'index.html').read_text()
 a=original.index('function drawEnemyBody(e, p, r) {')
 b=original.index('/* ============ spawn director:',a)
 old_body=original[a:b]
 c=original.index('    // hp bar when damaged\n');d=original.index('    // priority ring\n',c)
 old_bar=original[c:d]
 html=original.replace(old_body,body+'\n'+ring+'\n\n',1)
 # Draw the segmented HP painter after existing type features/hit flash, keeping
 # special supply, shield, boss and targeting marks. Gold keeps its own painter.
 html=html.replace(old_bar,'    drawOrbHealthRing(e,p,r);\n',1)
 # Mechanical proof: restoring ONLY these drawing regions reproduces every
 # original gameplay byte, HUD, input handler and script/config reference.
 restored=html.replace(body+'\n'+ring+'\n\n',old_body,1).replace('    drawOrbHealthRing(e,p,r);\n',old_bar,1)
 assert restored==original,'Unexpected edit outside the drawing regions'
 out.mkdir(exist_ok=True)
 for p in source.iterdir():
  if p.is_file() and p.name not in ['index.html','integrity.json']:shutil.copyfile(p,out/p.name)
 (out/'index.html').write_text(html)
 files={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(out.iterdir()) if p.is_file() and p.name!='integrity.json'}
 manifest={'version':'3.1.0-campaign','presentation':'families-v2','profile':profile,'baseHTML':hashlib.sha256(original.encode()).hexdigest(),'inputAssets':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(assets.glob('*.js'))},'files':files}
 (out/'integrity.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('Built supplied enemy families + segmented health rings; 3.1 gameplay untouched.')
