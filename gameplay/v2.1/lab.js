/* Same simulation, explicit deployment-only lab profile and separate storage. */
const Lab={
 speed:1,unlimited:false,walletBefore:null,
 funds(){if(!TEST_BUILD||!this.unlimited)return;SAVE.econ.avail=Math.max(SAVE.econ.avail,1e9);SAVE.econ.total=Math.max(SAVE.econ.total,SAVE.econ.avail);},
 jump(gid,level){
  if(!TEST_BUILD)return;const g=galaxyById(gid),lv=clamp(Math.floor(Number(level)||1),1,60);
  if(transitTimer){clearTimeout(transitTimer);transitTimer=null;}
  for(const id of ['ovMenu','ovPause','ovEnd','ovTransit','ovUnlock','ovStats'])hideOverlay(id);
  clearField();SAVE.galaxy.current=g.id;if(!SAVE.galaxy.unlocked.includes(g.id))SAVE.galaxy.unlocked.push(g.id);G=g;
  const gp=galaxyProgress(g.id);gp.combatLevel=lv;gp.lastDefeated=lv-1;gp.finalDefeated=false;gp.visited=true;gp.goldVisited=0;
  this.funds();applyGalaxyTheme();newRun();S.phase='combat';persist();renderPlayerProgress();renderPanel();
  document.getElementById('labGalaxy').value=g.id;document.getElementById('labLevel').value=lv;
  SFX.click();
 },
 reset(){
  if(!TEST_BUILD)return;this.speed=1;this.unlimited=false;this.walletBefore=null;
  const settings={...SAVE.settings};Object.keys(SAVE).forEach(k=>delete SAVE[k]);Object.assign(SAVE,defaultSave());SAVE.settings=settings;
  document.getElementById('labSpeed').value='1';document.getElementById('labFunds').checked=false;this.jump('aurora',1);
 },
 init(){
  if(!TEST_BUILD)return;
  const el=document.createElement('details');el.id='labTools';
  el.innerHTML='<summary>🧪 TEST LAB</summary><div class="labBody"><strong>اختبار فقط · حفظ منفصل</strong><label>المجرة <select id="labGalaxy"></select></label><label>الليفل <input id="labLevel" type="number" min="1" max="60" value="1"></label><div class="labRow"><button id="labGo">انتقل / أعد الليفل</button><button id="labNext">الليفل التالي</button></div><label>السرعة <select id="labSpeed"><option value="1">×1</option><option value="2">×2</option><option value="4">×4</option></select></label><label><input id="labFunds" type="checkbox"> رصيد مفتوح</label><div class="labRow"><button id="labCourier">عرض الناقل</button><button id="labReset">بداية طبيعية</button></div><small>×2 و×4 يسرّعان وقت اللعب كله، بما فيه مهلة الكور والتحديد. التوازن يُختبر على ×1 وبرصيد طبيعي.</small></div>';
  document.body.append(el);
  const gs=document.getElementById('labGalaxy');for(const g of GALAXIES)gs.add(new Option(g.name,g.id));gs.value=G.id;
  document.getElementById('labLevel').value=galaxyLevel(G.id);
  document.getElementById('labGo').onclick=()=>this.jump(gs.value,document.getElementById('labLevel').value);
  document.getElementById('labNext').onclick=()=>this.jump(G.id,galaxyLevel(G.id)+1);
  document.getElementById('labSpeed').onchange=e=>{this.speed=[1,2,4].includes(+e.target.value)?+e.target.value:1;SFX.click();};
  document.getElementById('labFunds').onchange=e=>{if(e.target.checked){this.walletBefore={...SAVE.econ};this.unlimited=true;this.funds();}else{this.unlimited=false;SAVE.econ={...(this.walletBefore||{avail:0,total:0})};this.walletBefore=null;}persist();updateGoldHUD();renderPanel();SFX.click();};
  document.getElementById('labReset').onclick=()=>this.reset();
  document.getElementById('labCourier').onclick=()=>{if(S.phase!=='combat')this.jump(G.id,galaxyLevel(G.id));galaxyProgress(G.id).goldVisited=0;GoldCarrier.start();};
 }
};
function simulateCombat(dt){
 Lab.funds();S.time+=dt;updatePriority(dt);
 Director.update(dt);galaxyActiveTick(dt);GoldCarrier.update(dt);updateEnemies(dt);
 ultimateTick(dt);updateTurrets(dt);updateCraft(dt);updateShots(dt);updateFx(dt);updatePriority(dt);
}
