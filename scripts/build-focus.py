from pathlib import Path
import shutil
root=Path(__file__).resolve().parent.parent
source=root/'releases/levels-v2'
target=root/'releases/focus-v2.0.1'
target.mkdir(exist_ok=True)
for name in ['levels.js','manifest.webmanifest','vercel.json']:
 shutil.copyfile(source/name,target/name)
s=(source/'index.html').read_text()
def replace(a,b):
 global s
 assert a in s,a[:100]
 s=s.replace(a,b)
replace('v2.0 Combat Levels · progress saves locally','v2.0.1 Focus · progress saves locally')
replace('function enemyCanBeHit(e){return enemyIsVisible(e)&&(e.visibleFor||0)>=1.1&&e.t>=.22;}',
        'function enemyCanBeHit(e,manualAim=false){return enemyIsVisible(e)&&(e.visibleFor||0)>=1.1&&(manualAim||e.t>=.22);}')
replace('''    if (pe && enemyCanBeHit(pe)) {
      const pp = w2s(pe.lane, pe.t);
      const dist = Math.hypot(pp.x - tp.x, pp.y - tp.y);
      const maxRange=st.range/430*(GY-HOR)*.72+15;
      if (dist <= maxRange) { t.targetId = pe.id; return pe; }
    } else S.priority = null;''', '''    if(pe){
      t.targetId=pe.id;
      const pp=w2s(pe.lane,pe.t);
      t.angle=Math.atan2(pp.y-tp.y,pp.x-tp.x);
      // Manual focus reaches any fully revealed target. It never skips cooldown
      // or visibility protection. Keep the command while reveal grace runs.
      return enemyCanBeHit(pe,true)?pe:null;
    }else S.priority=null;''')
replace('function damageEnemy(e, dmg, matchHue, wkind) {','function damageEnemy(e, dmg, matchHue, wkind, manualAim=false) {')
replace("if (S.phase!=='combat'||!e.on || e.dead || !enemyCanBeHit(e)) return 0;", "if (S.phase!=='combat'||!e.on || e.dead || !enemyCanBeHit(e,manualAim)) return 0;")
replace("    b.kind = 'ELECTRIC'; b.life = 1.6;", "    b.manualAim=S.priority?.id===target.id;\n    b.kind = 'ELECTRIC'; b.life=b.manualAim?Math.max(1.6,Math.hypot(pp.x-mz.x,pp.y-mz.y)/sp+.6):1.6;")
replace("    b.kind = 'ROCKET'; b.life = 2.2; b.aoeR = st.aoeR;", "    b.manualAim=S.priority?.id===target.id;\n    b.kind = 'ROCKET'; b.life=b.manualAim?Math.max(2.2,Math.hypot(pp.x-mz.x,pp.y-mz.y)/sp+.6):2.2;b.aoeR = st.aoeR;")
replace('    bm.tx = t.slot; bm.targetId = target.id;', '    bm.tx = t.slot; bm.targetId = target.id;bm.manualAim=S.priority?.id===target.id;')
replace('function explode(x, y, lane, t, dmg, aoeR, hue) {','function explode(x, y, lane, t, dmg, aoeR, hue, manualAim=false) {')
replace("damageEnemy(e, dmg * fall, hue, 'ROCKET');", "damageEnemy(e, dmg * fall, hue, 'ROCKET',manualAim);")
replace('explode(pp2.x, pp2.y, e.lane, e.t, b.dmg, b.aoeR, b.hue);','explode(pp2.x, pp2.y, e.lane, e.t, b.dmg, b.aoeR, b.hue,b.manualAim);')
replace('damageEnemy(e, b.dmg, b.hue, b.kind);','damageEnemy(e, b.dmg, b.hue, b.kind,b.manualAim);')
replace('    b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp;', '''    const focused=S.priority?.id===target.id;
    const shotAngle=focused?Math.atan2(pp.y-mz.y,pp.x-mz.x):a;
    b.vx = Math.cos(shotAngle) * sp; b.vy = Math.sin(shotAngle) * sp;''')
replace("damageEnemy(tgt,bm.dps*activeDt,bHue,'LASER');", "damageEnemy(tgt,bm.dps*activeDt,bHue,'LASER',bm.manualAim);")
replace("damageEnemy(e, st.dmg, TURRET_DEF.VOID.hue, 'VOID');", "damageEnemy(e, st.dmg, TURRET_DEF.VOID.hue, 'VOID',S.priority?.id===target.id);")
replace("toast(lpFired ? '🔒 Target locked' : '◎ Priority target (8s)');", "toast(lpFired ? '🔒 Focus fire locked' : '◎ Focus fire (8s)');")
(target/'index.html').write_text(s)
b=(source/'balance.js').read_text().replace("version: '2.0.0-levels'", "version: '2.0.1-focus'")
(target/'balance.js').write_text(b)
print('Focused targeting build created. Level/economy/save configuration unchanged.')
