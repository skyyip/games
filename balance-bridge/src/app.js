import {BalanceGame,TiltInput,FALL_ANGLE,WARNING_TIME,formatTime,readRecords,rankRecords,clamp} from './game.js';
import {BridgeScene,eventArt} from './scene.js';
import {reducedMotion,animateChange} from '../../grid-rush/src/playground-ui.js';
const $=s=>document.querySelector(s),game=new BalanceGame(),scene=new BridgeScene($('#scene'));
const RECORD_KEY='balance-bridge.records.v1';
let records=[],storage,frame=0,lastFrame=null,ui='setup',countdown=0,sensor=null,sensorHandler=null;
let sensorTimeout=0,revision=0,runMode='touch',recorded=false,pendingResume=false,savedScroll=0,clock=0;
const keys=new Set(),buttons=new Map();let requesting=false,requestStarted=0;
try{storage=localStorage;records=readRecords(storage.getItem(RECORD_KEY));}catch{storage=null;}
const announce=text=>{$('#announcements').textContent=text;};
const selectedMode=()=>document.querySelector('input[name=mode]:checked').value;
const screenAngle=()=>screen.orientation?.angle??window.orientation??0;
function showRecords(){
  const list=$('#records');list.replaceChildren();
  if(!records.length){const li=document.createElement('li');li.className='empty-record';li.textContent='Your first little walk belongs here.';list.append(li);}
  records.forEach((r,i)=>{const li=document.createElement('li');li.className='record-row';const rank=document.createElement('span'),time=document.createElement('strong'),mode=document.createElement('small');rank.className='rank';rank.textContent=`0${i+1}`;time.textContent=formatTime(r.seconds);mode.textContent=r.mode==='motion'?'Phone tilt':'Touch & keys';li.append(rank,time,mode);list.append(li);});
  $('#best').textContent=records.length?formatTime(records[0].seconds):'—';
  $('#storage-note').textContent=storage?'Saved on this device.':'Records last for this visit; device storage is unavailable.';
}
function resetInput(){keys.clear();buttons.clear();$('#steering').value=0;game.setInput(0);$('#left').classList.remove('is-held');$('#right').classList.remove('is-held');}
function lock(){
  const enabled=ui!=='setup'&&matchMedia('(max-width:760px), (pointer:coarse)').matches,was=document.body.classList.contains('play-locked');
  if(enabled===was)return;if(enabled)savedScroll=scrollY;
  document.documentElement.classList.toggle('play-locked',enabled);document.body.classList.toggle('play-locked',enabled);
  for(const el of document.querySelectorAll('.site-top,.intro,.sidebar,.field-guide,.keyboard-help,footer'))el.inert=enabled;
  window.scrollTo({top:enabled?0:savedScroll,behavior:'instant'});
}
function render(){
  const setup=ui==='setup',playing=ui==='playing';
  document.body.classList.toggle('resting-view',['paused','results'].includes(ui));
  $('#world').dataset.state=ui;$('#idle-caption').hidden=!setup;$('#ready-overlay').hidden=!['permission','calibrating','countdown','sensor-error'].includes(ui);
  $('#pause-overlay').hidden=ui!=='paused';$('#result').hidden=ui!=='results';$('#pause').hidden=!playing;
  $('#mode-options').disabled=!setup;$('#start').disabled=!setup;$('#fallback').hidden=ui!=='sensor-error';
  $('#cancel-ready').hidden=false;$('#recalibrate').hidden=!playing||runMode!=='motion';
  $('#paused-touch').hidden=runMode!=='motion';$('#touch-controls').hidden=runMode==='motion'&&!setup;
  for(const el of [$('#left'),$('#right'),$('#steering')])el.disabled=!playing||runMode==='motion';
  $('#resume').disabled=false;lock();
}
function modeHint(){
  $('#setup-note').textContent=selectedMode()==='motion'?'Hold your phone comfortably, with the screen facing up. We will calibrate before you start.':'Use the slider, hold the arrow buttons, or use Left / Right keys. Nudge against the lean.';
}
function stopSensor(){clearTimeout(sensorTimeout);sensorTimeout=0;if(sensorHandler)window.removeEventListener('deviceorientation',sensorHandler);sensorHandler=null;sensor=null;}
function sensorFailure(message){
  if(!['permission','calibrating','countdown'].includes(ui))return;
  revision++;requesting=false;stopSensor();ui='sensor-error';$('#ready-label').textContent='A DIFFERENT WAY TO WALK';$('#countdown').textContent='↔';$('#ready-message').textContent=message;render();announce(message);
}
function beginCountdown(resume=false){
  pendingResume=resume;ui='countdown';countdown=3;$('#ready-label').textContent='ONE STEP AT A TIME';$('#countdown').textContent='3';$('#ready-message').textContent='Hold steady. Your little walk is about to begin.';render();ensureFrame();
}
async function prepareMotion(resume=false){
  const own=++revision;stopSensor();resetInput();pendingResume=resume;requesting=true;requestStarted=performance.now();ui='permission';runMode='motion';
  $('#ready-label').textContent='FIND YOUR CENTRE';$('#countdown').textContent='↔';$('#ready-message').textContent='Allow motion access, then hold your phone steady.';render();ensureFrame();
  if(!window.isSecureContext||typeof DeviceOrientationEvent==='undefined'){sensorFailure('Phone tilt is unavailable here. You can still play with touch controls.');return;}
  try{
    if(typeof DeviceOrientationEvent.requestPermission==='function'){
      const permission=await DeviceOrientationEvent.requestPermission();if(own!==revision)return;
      if(permission!=='granted'){sensorFailure('Motion access was declined. Try touch controls for this walk.');return;}
    }
    if(own!==revision)return;requesting=false;sensor=new TiltInput();ui='calibrating';$('#ready-message').textContent='Hold still with the screen facing up. Finding your comfortable centre…';render();
    sensorHandler=event=>{
      if(!sensor)return;
      const first=sensor.ready;const accepted=sensor.sample(event,screenAngle(),performance.now());
      if(accepted&&!first&&sensor.ready&&ui==='calibrating'){clearTimeout(sensorTimeout);sensorTimeout=0;beginCountdown(resume);announce('Centre found. Get ready to walk.');}
    };
    window.addEventListener('deviceorientation',sensorHandler);
    sensorTimeout=setTimeout(()=>{if(own===revision)sensorFailure('No usable tilt readings arrived. Try touch controls, or return to setup to retry.');},6000);
  }catch{if(own===revision)sensorFailure('Phone tilt could not be enabled. Touch controls are ready instead.');}
}
function setup(){
  revision++;requesting=false;stopSensor();resetInput();game.abandon();ui='setup';pendingResume=false;$('#time').textContent='00:00.00';$('#event-banner').hidden=true;$('#input-status').textContent='PHONE TILT / TOUCH / KEYS';$('#control-help').textContent='Tilt gently against the lean. Small corrections go a long way.';render();modeHint();game.reset();scene.draw(game,clock,reducedMotion.matches);ensureFrame();
}
function start(){recorded=false;game.reset();$('#time').textContent='00:00.00';$('#event-banner').hidden=true;if(selectedMode()==='motion')prepareMotion();else{revision++;runMode='touch';stopSensor();resetInput();beginCountdown();}}
function pause(message='Your time is paused. Take your time.'){
  if(ui==='playing'&&game.pause()){ui='paused';$('#pause-note').textContent=message;resetInput();render();announce('Walk paused.');}
  else if(['permission','calibrating','countdown'].includes(ui)){
    const resuming=pendingResume;revision++;requesting=false;stopSensor();resetInput();
    if(resuming){ui='paused';$('#pause-note').textContent=message;render();}else setup();
  }
}
function resume(){if(ui!=='paused')return;if(runMode==='motion')prepareMotion(true);else beginCountdown(true);}
function finish(){
  if(recorded)return;recorded=true;ui='results';stopSensor();resetInput();
  const newBest=!records.length||game.elapsed>records[0].seconds;records=rankRecords([...records,{seconds:game.elapsed,at:Date.now(),mode:runMode}]);
  if(storage)try{storage.setItem(RECORD_KEY,JSON.stringify({version:1,records}));}catch{storage=null;}
  showRecords();$('#final-time').textContent=formatTime(game.elapsed);$('#result-note').textContent=newBest?'A new personal best. Look at you go!':'One more step, one more little story.';
  $('#result-cause').textContent=game.fallReason;$('#event-banner').hidden=true;render();animateChange($('.result-card'));$('#result-title').focus({preventScroll:true});announce(`Walk complete. ${formatTime(game.elapsed)}.`);
}
function banner(){
  const stack=$('#active-events');stack.hidden=game.events.length<2||ui!=='playing';const signature=game.events.map(e=>e.id).join(',');if(stack.dataset.events!==signature){stack.dataset.events=signature;stack.replaceChildren();for(const e of game.events){const chip=document.createElement('span'),name=document.createElement('b'),level=document.createElement('small');name.textContent=e.name;level.textContent=`${e.level} / 5`;chip.append(name,level);stack.append(chip);}}
  const event=game.pending||game.event,node=$('#event-banner');node.hidden=!event||ui!=='playing';if(!event)return;
  const warning=Boolean(game.pending);node.classList.toggle('is-warning',warning);node.dataset.level=String(event.level);
  if($('#event-icon').dataset.event!==event.id){$('#event-icon').innerHTML=eventArt[event.id];$('#event-icon').dataset.event=event.id;}$('#event-name').textContent=warning?event.warning:event.name;
  const left=warning?Math.max(0,event.startsAt-game.elapsed):Math.max(0,event.duration-game.elapsed+event.startedAt);
  $('#event-detail').textContent=warning?'Get ready. Keep your corrections small.':event.description;
  $('#event-level').textContent=`${event.level} / 5`;
  $('#event-progress').style.transform=`scaleX(${clamp(left/(warning?WARNING_TIME:event.duration),0,1)})`;
}
function input(){
  if(runMode==='motion')return sensor?.value||0;
  let n=Number($('#steering').value)/100;const left=keys.has('ArrowLeft')||keys.has('KeyA')||[...buttons.values()].includes(-1),right=keys.has('ArrowRight')||keys.has('KeyD')||[...buttons.values()].includes(1);
  if(left||right)n=Number(right)-Number(left);return n;
}
function ensureFrame(){if(!frame){lastFrame=null;frame=requestAnimationFrame(tick);}}
function tick(now){
  frame=0;const dt=lastFrame===null?0:Math.min((now-lastFrame)/1000,.25);lastFrame=now;clock+=dt;
  if(requesting&&now-requestStarted>12000)sensorFailure('Motion access is taking a while. Touch controls are ready instead.');
  if(ui==='countdown'){
    countdown-=dt;const digit=String(Math.max(1,Math.ceil(countdown)));if($('#countdown').textContent!==digit){$('#countdown').textContent=digit;animateChange($('#countdown'));}
    if(countdown<=0){
      if(pendingResume){game.resume();pendingResume=false;}else game.start();
      ui='playing';$('#control-help').textContent=runMode==='motion'?'Tilt gently against the lean. Small corrections go a long way.':'Nudge against the lean. Release the controls to return to centre.';
      $('#input-status').textContent=runMode==='motion'?'PHONE TILT · CENTRE CALIBRATED':'TOUCH & KEYS · LEFT / RIGHT';render();announce('Off you go. Find your balance.');
    }
  }else if(ui==='playing'||ui==='falling'){
    if(ui==='playing'&&runMode==='motion'&&!sensor?.fresh(now)){pause('Tilt readings stopped. Recalibrate or switch to touch controls.');}
    else{
      game.setInput(input());const notices=game.advance(dt);
      if(notices.includes('warning'))announce(game.pending.warning);
      if(notices.includes('event')){announce(game.event.description);try{navigator.vibrate?.(game.event.level*10);}catch{}}
      if(notices.includes('clear')&&!game.events.length)announce('Steady again. Keep walking.');
      if(notices.includes('fall')){ui='falling';resetInput();render();announce('A little tumble. Your walk is complete.');}
      if(notices.includes('finished'))finish();
    }
  }
  $('#time').textContent=formatTime(game.elapsed);
  const lean=clamp(game.angle/FALL_ANGLE),danger=Math.abs(lean)>.65;
  $('#balance-ball').style.left=`${50+lean*48}%`;$('#balance-meter').classList.toggle('is-danger',danger);
  $('#balance-meter').setAttribute('aria-valuenow',String(Math.round(lean*100)));
  $('#balance-status').textContent=ui==='setup'?'Find your centre.':danger?'Easy now. Lean the other way.':Math.abs(lean)<.25?'Lovely and steady.':'Small steps. You have got this.';
  $('#tilt-readout').textContent=`${(runMode==='motion'?(sensor?.degrees||0):game.input*17).toFixed(1)}°`;
  banner();scene.draw(game,clock,reducedMotion.matches);
  if(!document.hidden&&(['playing','falling','countdown','calibrating','permission'].includes(ui)||(ui==='setup'&&!reducedMotion.matches)))frame=requestAnimationFrame(tick);
}
$('#mode-options').addEventListener('change',modeHint);$('#start').addEventListener('click',start);$('#pause').addEventListener('click',()=>pause());$('#resume').addEventListener('click',resume);$('#cancel-ready').addEventListener('click',setup);$('#quit').addEventListener('click',setup);$('#change').addEventListener('click',setup);$('#again').addEventListener('click',()=>{recorded=false;game.reset();$('#event-banner').hidden=true;runMode==='motion'?prepareMotion():beginCountdown();});
$('#fallback').addEventListener('click',()=>{revision++;requesting=false;stopSensor();runMode='touch';document.querySelector('input[name=mode][value=touch]').checked=true;resetInput();beginCountdown(pendingResume);});
$('#paused-touch').addEventListener('click',()=>{revision++;stopSensor();runMode='touch';document.querySelector('input[name=mode][value=touch]').checked=true;resetInput();beginCountdown(true);});
$('#recalibrate').addEventListener('click',()=>{pause();prepareMotion(true);});
for(const [id,value] of [['left',-1],['right',1]]){
  const node=$(`#${id}`);node.addEventListener('pointerdown',event=>{if(ui!=='playing'||runMode!=='touch'||event.button!==0)return;event.preventDefault();buttons.set(event.pointerId,value);node.setPointerCapture(event.pointerId);node.classList.add('is-held');});
  const release=event=>{buttons.delete(event.pointerId);if(![...buttons.values()].includes(value))node.classList.remove('is-held');};
  node.addEventListener('pointerup',release);node.addEventListener('pointercancel',release);node.addEventListener('lostpointercapture',release);
}
$('#steering').addEventListener('pointerdown',event=>{$('#steering').setPointerCapture(event.pointerId);});
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('#steering').addEventListener(name,()=>{$('#steering').value=0;});
$('#steering').addEventListener('blur',()=>{$('#steering').value=0;});
window.addEventListener('keydown',event=>{
  if(event.isComposing||event.altKey||event.ctrlKey||event.metaKey)return;
  if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(event.code)&&ui==='playing'&&runMode==='touch'&&!event.target.matches('input')){event.preventDefault();keys.add(event.code);}
  if(event.code==='Space'&&ui==='playing'&&!event.target.closest('button,input')){event.preventDefault();pause();}
  if(event.code==='Escape'&&ui!=='setup'){event.preventDefault();setup();}
});
window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>{if(ui!=='permission')pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();cancelAnimationFrame(frame);frame=0;lastFrame=null;}else ensureFrame();});
window.addEventListener('pagehide',()=>{pause();cancelAnimationFrame(frame);frame=0;stopSensor();});window.addEventListener('pageshow',event=>{if(event.persisted){if(ui==='playing')pause();ensureFrame();}});
window.addEventListener('resize',()=>{lock();});
function orientationChanged(){if(ui==='playing')pause('Your screen direction changed. Recalibrate before continuing.');else if(['countdown','calibrating'].includes(ui))pause();}
if(screen.orientation?.addEventListener)screen.orientation.addEventListener('change',orientationChanged);else window.addEventListener('orientationchange',orientationChanged);
document.addEventListener('languagechange',showRecords);
reducedMotion.addEventListener('change',()=>{scene.draw(game,clock,reducedMotion.matches);ensureFrame();});
if(!matchMedia('(pointer:coarse)').matches)document.querySelector('input[value=touch]').checked=true;
for(const el of document.querySelectorAll('[data-event-art]'))el.innerHTML=eventArt[el.dataset.eventArt];
showRecords();modeHint();render();scene.draw(game,0,reducedMotion.matches);ensureFrame();
if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',async()=>{
  try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready for a little walk offline.';}catch{$('#offline-status').textContent='Your little trail is ready online.';}
});
