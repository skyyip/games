import {LEVELS,levelById} from './levels.js';
import {MazeGame,formatTime,readRecords,addRecord} from './game.js';
import {TiltSensor,ShakeSensor} from './sensors.js';
import {MazeBoard,miniMaze} from './board.js';
import {reducedMotion,animateChange} from '../../grid-rush/src/playground-ui.js';
const $=s=>document.querySelector(s),game=new MazeGame(),board=new MazeBoard($('#board')),keys=new Set(),pointers=new Map();
const RECORD_KEY='marble-maze.records.v1',directions={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
let records=readRecords(null),storage,ui='setup',runMode='touch',frame=0,lastFrame=null,countdown=0,revision=0,pendingResume=false,recorded=false,savedScroll=0;
let tilt=null,shakeSensor=null,orientationHandler=null,motionHandler=null,sensorTimeout=0,sensorStarted=0,motionAvailable=false,requesting=false,requestStarted=0,lastPosition=0;
try{storage=localStorage;records=readRecords(storage.getItem(RECORD_KEY));}catch{storage=null;}
const announce=text=>{$('#announcements').textContent=text;};
const selectedLevel=()=>Number(document.querySelector('input[name=level]:checked').value);
const selectedMode=()=>document.querySelector('input[name=mode]:checked').value;
const screenAngle=()=>screen.orientation?.angle??window.orientation??0;
function makeChoices(){
  for(const level of LEVELS){const label=document.createElement('label'),radio=document.createElement('input'),choice=document.createElement('span');radio.type='radio';radio.name='level';radio.value=String(level.id);radio.checked=level.id===1;choice.className='level-choice';choice.innerHTML=miniMaze(level);const copy=document.createElement('span'),title=document.createElement('b'),description=document.createElement('small'),number=document.createElement('i');title.textContent=level.name;description.textContent=level.description;number.textContent=`0${level.id}`;copy.append(title,description);choice.append(copy,number);label.append(radio,choice);$('#level-options').append(label);}
}
function showRecords(){
  const id=ui==='setup'?selectedLevel():game.level.id,level=levelById(id),list=$('#records');list.replaceChildren();$('#record-level').textContent=level.name;
  if(!records[id].length){const li=document.createElement('li');li.className='empty-record';li.textContent='Your first clear path belongs here.';list.append(li);}
  records[id].forEach((r,i)=>{const li=document.createElement('li');li.className='record-row';const rank=document.createElement('span'),time=document.createElement('strong'),unit=document.createElement('small');rank.className='rank';rank.textContent=`0${i+1}`;time.textContent=formatTime(r.seconds);unit.textContent='Completed';li.append(rank,time,unit);list.append(li);});
  $('#best').textContent=records[id].length?formatTime(records[id][0].seconds):'—';$('#storage-note').textContent=storage?'Saved on this device.':'Records last for this visit; device storage is unavailable.';
}
function releaseInput(){keys.clear();pointers.clear();game.setInput(0,0);for(const b of document.querySelectorAll('[data-steer]'))b.classList.remove('is-held');}
function stopSensors(){clearTimeout(sensorTimeout);sensorTimeout=0;if(orientationHandler)window.removeEventListener('deviceorientation',orientationHandler);if(motionHandler)window.removeEventListener('devicemotion',motionHandler);orientationHandler=null;motionHandler=null;tilt=null;shakeSensor=null;motionAvailable=false;}
function lock(){
  const enabled=ui!=='setup'&&matchMedia('(max-width:760px), (pointer:coarse)').matches,was=document.body.classList.contains('play-locked');if(enabled===was)return;if(enabled)savedScroll=scrollY;
  document.documentElement.classList.toggle('play-locked',enabled);document.body.classList.toggle('play-locked',enabled);
  for(const el of document.querySelectorAll('.site-top,.intro,.sidebar,.field-guide,.keyboard-help,footer'))el.inert=enabled;
  window.scrollTo({top:enabled?0:savedScroll,behavior:'instant'});
}
function render(){
  const playing=ui==='playing',setup=ui==='setup';$('#board-area').dataset.state=ui;document.body.classList.toggle('is-resting',!['setup','playing','ending'].includes(ui));
  $('#level-options').disabled=!setup;$('#mode-options').disabled=!setup;$('#start').disabled=!setup;$('#ready-overlay').hidden=!['permission','calibrating','countdown','sensor-error'].includes(ui);$('#fallback').hidden=ui!=='sensor-error';$('#pause-overlay').hidden=ui!=='paused';$('#result').hidden=ui!=='results';$('#pause').hidden=!playing;$('#paused-touch').hidden=runMode!=='motion';
  $('#direction-pad').hidden=runMode==='motion'&&!setup;$('#recalibrate').hidden=!playing||runMode!=='motion';$('#shake').hidden=playing&&runMode==='motion'&&motionAvailable;$('#shake').disabled=!playing;
  for(const b of document.querySelectorAll('[data-steer]'))b.disabled=!playing||runMode!=='touch';
  $('#level-label').textContent=`0${game.level.id} / ${game.level.name}`;lock();board.resize();
}
function modeHint(){
  $('.setup-note').textContent=selectedMode()==='motion'?'Hold the screen facing up. We will calibrate your comfortable centre before you start.':'Hold the directional buttons, or use Arrow keys. Tap Shake once twice to clear mist; both taps move the marble.';
}
function selectLevel(){game.reset(selectedLevel());$('#time').textContent='00:00.00';$('#level-label').textContent=`0${game.level.id} / ${game.level.name}`;showRecords();board.draw({game,reduced:reducedMotion.matches});}
function ensureFrame(){if(!frame){lastFrame=null;frame=requestAnimationFrame(tick);}}
function sensorFailure(message){
  if(!['permission','calibrating'].includes(ui))return;revision++;requesting=false;stopSensors();ui='sensor-error';$('#ready-label').textContent='ANOTHER WAY THROUGH';$('#countdown').textContent='↔';$('#ready-message').textContent=message;render();announce(message);
}
function beginCountdown(resuming=false){pendingResume=resuming;countdown=3;ui='countdown';$('#ready-label').textContent='ONE LITTLE ROLL AT A TIME';$('#countdown').textContent='3';$('#ready-message').textContent='Hold steady. Your little journey is about to begin.';render();ensureFrame();}
async function prepareMotion(resuming=false){
  const own=++revision;stopSensors();releaseInput();runMode='motion';pendingResume=resuming;requesting=true;requestStarted=performance.now();ui='permission';$('#ready-label').textContent='FIND YOUR CENTRE';$('#countdown').textContent='↔';$('#ready-message').textContent='Allow tilt and motion access, then hold the screen facing up.';render();ensureFrame();
  if(!window.isSecureContext||typeof DeviceOrientationEvent==='undefined'){sensorFailure('Phone tilt is unavailable here. Touch controls can guide your marble instead.');return;}
  try{
    // Invoke both iOS prompts during the original button gesture, before awaiting either.
    const orientation=typeof DeviceOrientationEvent.requestPermission==='function'?DeviceOrientationEvent.requestPermission():Promise.resolve('granted');
    const motion=typeof DeviceMotionEvent==='undefined'?Promise.resolve('unavailable'):typeof DeviceMotionEvent.requestPermission==='function'?DeviceMotionEvent.requestPermission().catch(()=>'denied'):Promise.resolve('granted');
    const [tiltAccess,motionAccess]=await Promise.all([orientation,motion]);if(own!==revision)return;
    if(tiltAccess!=='granted'){sensorFailure('Tilt access was declined. Try the touch controls for this journey.');return;}
    requesting=false;tilt=new TiltSensor();shakeSensor=new ShakeSensor(performance.now());sensorStarted=performance.now();motionAvailable=motionAccess==='granted';ui='calibrating';$('#ready-message').textContent='Hold still. Finding the centre for all four directions…';render();
    orientationHandler=event=>{if(!tilt)return;const was=tilt.ready;if(tilt.sample(event,screenAngle(),performance.now())&&!was&&tilt.ready&&ui==='calibrating'){clearTimeout(sensorTimeout);sensorTimeout=0;beginCountdown(resuming);announce('Centre found. Get ready to roll.');}};
    motionHandler=event=>{if(!shakeSensor)return;const vector=shakeSensor.sample(event,screenAngle(),performance.now());if(vector&&ui==='playing'){
      const force=Math.hypot(vector.x,vector.y)>.5?vector:{x:game.input.x||Math.sign(vector.z)*.4,y:game.input.y||Math.sign(vector.z)*.9};applyShake(force);
    }};
    window.addEventListener('deviceorientation',orientationHandler);if(motionAvailable)window.addEventListener('devicemotion',motionHandler);
    sensorTimeout=setTimeout(()=>{if(own===revision)sensorFailure('No usable tilt readings arrived. Try touch controls, or return to setup to retry.');},6000);
  }catch{if(own===revision)sensorFailure('Phone tilt could not be enabled. Touch controls are ready instead.');}
}
function start(){recorded=false;releaseInput();game.reset(selectedLevel());$('#time').textContent='00:00.00';$('#bomb-status').textContent='A quiet little maze.';$('#bomb-status').classList.remove('is-danger');if(selectedMode()==='motion')prepareMotion();else{revision++;runMode='touch';stopSensors();beginCountdown();}}
function setup(){revision++;requesting=false;stopSensors();releaseInput();game.abandon();ui='setup';pendingResume=false;selectLevel();render();modeHint();update(performance.now());ensureFrame();$('#start').focus({preventScroll:true});}
function pause(message='Your time is paused. Take your time.'){
  if(ui==='playing'&&game.pause()){ui='paused';releaseInput();$('#pause-note').textContent=message;render();announce('Maze paused.');}
  else if(['permission','calibrating','countdown'].includes(ui)){const resume=pendingResume;revision++;requesting=false;stopSensors();if(resume){ui='paused';$('#pause-note').textContent=message;render();}else setup();}
}
function resume(){if(ui!=='paused')return;releaseInput();runMode==='motion'?prepareMotion(true):beginCountdown(true);}
function finish(){
  if(recorded)return;recorded=true;ui='results';stopSensors();releaseInput();const won=game.outcome==='won',previous=records[game.level.id][0]?.seconds??Infinity;
  if(won){records=addRecord(records,game.level.id,game.elapsed,Date.now());if(storage)try{storage.setItem(RECORD_KEY,JSON.stringify({version:1,levels:records}));}catch{storage=null;}}
  $('.result-card').classList.toggle('is-lost',!won);$('#result-flower').textContent=won?'✳':'✷';$('#result-eyebrow').textContent=won?'A LITTLE PATH, WELL TRAVELLED.':'A LITTLE BUMP IN THE JOURNEY.';$('#result-title').textContent=won?'You found your way.':'Oops. A rolling surprise.';$('#final-time').textContent=formatTime(game.elapsed);$('#result-note').textContent=won?(game.elapsed<previous?'Your quickest way through. A new best!':'A little journey, safely completed.'):'The bomb caught your marble. No record saved. Try another route.';showRecords();render();animateChange($('.result-card'));$('#result-title').focus({preventScroll:true});announce(won?'Maze completed. Your time has been saved.':'Bomb collision. This run is over.');
}
function applyShake(vector){
  const result=game.shake(vector);if(!result)return;
  if(result==='cleared'){announce('The mist is gone. Your marble felt both shakes.');animateChange($('#fog-label'));}
  else if(game.shakes===1)announce('One shake. One more within 1.5 seconds.');
  update(performance.now());
}
function control(){
  if(runMode==='motion')return tilt?.value||{x:0,y:0};
  let x=0,y=0;for(const key of keys){if(['ArrowLeft','KeyA'].includes(key))x--;if(['ArrowRight','KeyD'].includes(key))x++;if(['ArrowUp','KeyW'].includes(key))y--;if(['ArrowDown','KeyS'].includes(key))y++;}
  for(const dir of pointers.values()){x+=directions[dir].x;y+=directions[dir].y;}return {x,y};
}
function update(now){
  $('#time').textContent=formatTime(game.elapsed);$('#shake-count').textContent=`${game.shakes} / 2`;
  $('#fog-label').textContent=game.fogStarted!==null?'The mist is rolling in.':game.elapsed-game.clearedAt<2?'A fresh, clear view!':'A lovely clear view.';
  $('#fog-help').textContent=runMode==='motion'&&motionAvailable?(game.shakes?'One more shake within 1.5 seconds.':'Two short, firm shakes clear the mist.'):'Tap Shake once twice. Each tap also nudges the marble.';
  $('#level-bubble').style.left=`${50+game.input.x*30}%`;$('#level-bubble').style.top=`${50+game.input.y*30}%`;
  const status=$('#bomb-status');status.classList.toggle('is-danger',Boolean(game.pending||game.bombs.length));status.textContent=game.pending?`Bomb arriving in ${Math.max(1,Math.ceil(game.pending.at-game.elapsed))}s.`:game.bombs.length?'A bomb is rolling. Give it room.':'A quiet little maze.';
  if(now-lastPosition>100){$('#position-status').textContent=`Marble position: column ${game.ball.x.toFixed(2)}, row ${game.ball.y.toFixed(2)}.`;lastPosition=now;}
}
function tick(now){
  frame=0;const dt=lastFrame===null?0:(now-lastFrame)/1000;lastFrame=now;
  if(requesting&&now-requestStarted>12000)sensorFailure('Motion access is taking a while. Try touch controls instead.');
  if(ui==='countdown'){
    countdown-=Math.min(dt,.25);const value=String(Math.max(1,Math.ceil(countdown)));if($('#countdown').textContent!==value){$('#countdown').textContent=value;animateChange($('#countdown'));}
    if(countdown<=0){pendingResume?game.resume():game.start(selectedLevel());pendingResume=false;ui='playing';$('#control-help').textContent=runMode==='motion'?'Tilt forward, back, left and right. Small moves feel best.':'Hold the arrows to roll. Release to slow down.';render();announce('Off you roll. Find your way to the finish.');}
  }else if(ui==='playing'||ui==='ending'){
    if(ui==='playing'&&runMode==='motion'&&!tilt?.fresh(now))pause('Tilt readings stopped. Recalibrate or switch to touch controls.');
    else{
      if(ui==='playing'&&runMode==='motion'&&motionAvailable&&now-(shakeSensor?.lastAt??sensorStarted)>3000){motionAvailable=false;render();announce('Shake readings stopped. Use Shake once twice to clear the mist.');}
      const value=control();game.setInput(value.x,value.y);const events=game.advance(dt);
      for(const event of events){
        if(event==='suspended')pause('Your journey paused after a long interruption. Ready to roll again?');
        if(event==='fog')announce('The mist is arriving. Two shakes will clear it.');
        if(event==='warning')announce('A bomb will appear at the finish. Choose your path carefully.');
        if(['won','lost'].includes(event)){ui='ending';stopSensors();releaseInput();render();if(event==='lost')try{navigator.vibrate?.([20,35,20]);}catch{}}
        if(event==='finished')finish();
      }
      // A long suspended frame already pauses the pure model before returning.
      if(game.state==='paused'&&ui==='playing'){ui='paused';$('#pause-note').textContent='Your journey paused after a long interruption. Ready to roll again?';render();}
    }
  }
  update(now);board.draw({game,time:now/1000,reduced:reducedMotion.matches,dt:Math.min(dt,.1)});
  if(!document.hidden&&(['playing','ending','countdown','calibrating','permission'].includes(ui)||(ui==='setup'&&!reducedMotion.matches)))frame=requestAnimationFrame(tick);
}
for(const button of document.querySelectorAll('[data-steer]')){
  button.addEventListener('pointerdown',event=>{if(ui!=='playing'||runMode!=='touch'||event.button!==0)return;event.preventDefault();pointers.set(event.pointerId,button.dataset.steer);button.setPointerCapture(event.pointerId);button.classList.add('is-held');});
  const release=event=>{pointers.delete(event.pointerId);if(![...pointers.values()].includes(button.dataset.steer))button.classList.remove('is-held');};for(const name of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(name,release);
}
$('#shake').addEventListener('click',()=>{if(ui!=='playing')return;const sign=game.shakeImpacts%2?-1:1;applyShake({x:sign,y:.35*sign});});
window.addEventListener('keydown',event=>{
  if(event.isComposing||event.ctrlKey||event.metaKey||event.altKey)return;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyA','KeyS','KeyD'].includes(event.code)&&ui==='playing'&&runMode==='touch'&&!event.target.matches('input')){event.preventDefault();keys.add(event.code);}
  if(event.code==='Space'&&ui==='playing'&&!event.target.closest('button,input')){event.preventDefault();if(!event.repeat){const sign=game.shakeImpacts%2?-1:1;applyShake({x:sign,y:.35*sign});}}
  if(event.code==='KeyP'&&ui==='playing'){event.preventDefault();pause();}
  if(event.code==='Escape'){if(ui==='playing'){event.preventDefault();pause();}else if(['permission','calibrating','countdown','sensor-error'].includes(ui))setup();}
});
window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>{if(ui!=='permission')pause();});
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);$('#change').addEventListener('click',setup);$('#quit').addEventListener('click',setup);$('#cancel-ready').addEventListener('click',setup);$('#pause').addEventListener('click',()=>pause());$('#resume').addEventListener('click',resume);$('#recalibrate').addEventListener('click',()=>{pause();prepareMotion(true);});
$('#fallback').addEventListener('click',()=>{const resume=pendingResume;revision++;requesting=false;stopSensors();runMode='touch';document.querySelector('input[name=mode][value=touch]').checked=true;beginCountdown(resume);});$('#paused-touch').addEventListener('click',()=>{revision++;stopSensors();runMode='touch';document.querySelector('input[name=mode][value=touch]').checked=true;beginCountdown(true);});
$('#level-options').addEventListener('change',selectLevel);$('#mode-options').addEventListener('change',modeHint);
document.addEventListener('visibilitychange',()=>{releaseInput();if(document.hidden){pause();cancelAnimationFrame(frame);frame=0;lastFrame=null;}else ensureFrame();});window.addEventListener('pagehide',()=>{pause();stopSensors();cancelAnimationFrame(frame);frame=0;});window.addEventListener('pageshow',event=>{if(event.persisted)ensureFrame();});
window.addEventListener('resize',()=>{releaseInput();lock();board.resize();ensureFrame();});const rotation=()=>{if(ui==='playing')pause('Your screen direction changed. Recalibrate before continuing.');else if(['calibrating','countdown'].includes(ui))pause();};if(screen.orientation?.addEventListener)screen.orientation.addEventListener('change',rotation);else window.addEventListener('orientationchange',rotation);
document.addEventListener('languagechange',showRecords);reducedMotion.addEventListener('change',ensureFrame);
makeChoices();$('#board').setAttribute('aria-describedby','position-status');if(!matchMedia('(pointer:coarse)').matches)document.querySelector('input[name=mode][value=touch]').checked=true;selectLevel();modeHint();render();update(performance.now());ensureFrame();
if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',async()=>{try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready to find your way offline.';}catch{$('#offline-status').textContent='Your little maze is ready online.';}});
