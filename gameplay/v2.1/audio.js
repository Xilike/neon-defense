/* Gesture-unlocked WebAudio. No downloads or background audio. */
let AC=null,audioMaster=null,audioVoices=0,audioRetryAt=0;
const audioLast=new Map();
function ac(){
  if(!SAVE.settings.sfx)return null;
  try{
    if(!AC||AC.state==='closed'){
      try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(_){}
      AC=new (window.AudioContext||window.webkitAudioContext)();
      const limiter=AC.createDynamicsCompressor();
      limiter.threshold.value=-18;limiter.knee.value=16;limiter.ratio.value=5;
      audioMaster=AC.createGain();audioMaster.gain.value=.85;
      audioMaster.connect(limiter);limiter.connect(AC.destination);
      audioVoices=0;
    }
    if(AC.state!=='running')AC.resume().catch(()=>{});
    return AC;
  }catch(_){return null;}
}
function unlockAudio(){
  if(document.hidden||!SAVE.settings.sfx)return;
  // Safari can leave a context interrupted after a call or app switch.
  if(AC?.state==='interrupted'&&performance.now()>audioRetryAt){
    AC.close().catch(()=>{});AC=null;audioRetryAt=performance.now()+1500;
  }
  const c=ac();if(!c)return;
  try{const b=c.createBufferSource();b.buffer=c.createBuffer(1,1,c.sampleRate);b.connect(audioMaster);b.start();}catch(_){}
}
for(const event of ['pointerdown','touchend','keydown'])document.addEventListener(event,unlockAudio,{capture:true,passive:true});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){if(AC?.state==='running')AC.suspend().catch(()=>{});}
  else if(SAVE.settings.sfx)ac();
});
function beep(freq,dur=.08,type='square',vol=.04){
  const c=ac();if(!c||c.state!=='running'||document.hidden||audioVoices>=12)return;
  const key=freq+':'+type,now=c.currentTime;
  if(now-(audioLast.get(key)??-1)<.045)return;
  audioLast.set(key,now);
  try{
    const o=c.createOscillator(),g=c.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,now);
    g.gain.setValueAtTime(.0001,now);g.gain.linearRampToValueAtTime(vol*1.8,now+.004);
    g.gain.exponentialRampToValueAtTime(.0001,now+dur);
    o.connect(g);g.connect(audioMaster);audioVoices++;
    o.onended=()=>{audioVoices=Math.max(0,audioVoices-1);o.disconnect();g.disconnect();};
    o.start(now);o.stop(now+dur+.01);
  }catch(_){}
}
const SFX={
 shoot(){beep(880,.06,'square',.035);},laser(){beep(220,.22,'sawtooth',.045);},
 hit(){beep(180,.07,'triangle',.07);},boom(){beep(90,.22,'sawtooth',.07);},
 blast(){beep(280,.09,'sawtooth',.09);setTimeout(()=>beep(115,.34,'triangle',.12),65);},
 shield(){beep(540,.15,'sine',.07);setTimeout(()=>beep(810,.2,'sine',.07),110);},
 coin(){beep(1320,.10,'sine',.065);},
 unlock(){beep(660,.12,'sine',.06);setTimeout(()=>beep(990,.16,'sine',.06),110);},
 click(){beep(520,.06,'sine',.065);},breach(){beep(140,.3,'sawtooth',.08);},
 wave(){beep(440,.1,'sine',.05);setTimeout(()=>beep(660,.12,'sine',.05),100);},
 carrier(){beep(740,.14,'sine',.055);setTimeout(()=>beep(1110,.2,'sine',.055),140);},
};
