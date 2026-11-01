"""Gemini comparison only. Keep boss-v1-lab and normal play byte-for-byte."""
from pathlib import Path
import hashlib,json,shutil
root=Path(__file__).resolve().parent.parent
def build(source_name='boss-v1-lab',out_name='gemini-v1-lab',experiment='gemini-v1'):
 source=root/'releases'/source_name;out=root/'releases'/out_name;assets=root/'gameplay/presentation/gemini-v1'
 out.mkdir(exist_ok=True)
 for p in source.iterdir():
  if p.is_file() and p.name!='integrity.json':shutil.copyfile(p,out/p.name)
 html=(source/'index.html').read_text()
 # Replace the former static priority circle rather than drawing two circles.
 a=html.index('    // priority ring\n',html.index('function drawEnemies()'))
 b=html.index('\n  }\n}',a)
 html=html[:a]+html[b:]
 # The proposed text promised a visible grace indicator. Only the painted body
 # is dimmed; the hit eligibility and its 0.70s timer remain entirely unchanged.
 old='else drawEnemyBody(e, p, r); // galaxy-specific silhouette'
 new="else {ctx.save();try{if(enemyIsVisible(e)&&(e.visibleFor||0)<.70)ctx.globalAlpha*=.55;drawEnemyBody(e,p,r);}finally{ctx.restore();}} // grace appearance only"
 assert html.count(old)==1
 html=html.replace(old,new,1)
 js=(assets/'upgrade.js').read_text()
 patch='\n<!-- Gemini comparison experiment -->\n<style>\n'+(assets/'ui.css').read_text()+'\n</style>\n<script>\n'+js+'\n</script>\n'
 assert html.count('</body>')==1
 html=html.replace('</body>',patch+'</body>',1)
 (out/'index.html').write_text(html)
 files={p.name:{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(out.iterdir()) if p.is_file() and p.name!='integrity.json'}
 baseline={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(source.iterdir()) if p.is_file()}
 (out/'integrity.json').write_text(json.dumps({'version':'3.1.0-campaign','experiment':experiment,'profile':'lab','base':source_name,'baseline':baseline,'files':files},indent=2)+'\n')
 print('Built '+out_name+' from '+source_name+'; source release preserved.')

if __name__=='__main__':build()
