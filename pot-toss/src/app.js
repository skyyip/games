import {PotGame,gestureThrow,keyboardPower,readRecords,addRecord,clamp,STILL_TIME} from './game.js';
import {Court} from './court.js';
import {reducedMotion,animateChange} from '../../grid-rush/src/playground-ui.js';
import {getLanguage} from '../../grid-rush/src/language.js';
const $=s=>document.querySelector(s),game=new PotGame(),court=new Court($('#scene')),arrow=$('#throw');
const RECORD_KEY='pot-toss.records.v1';
let storage,records=readRecords(null),frame=0,deadline=0,gesture=null,key=null,aim=null,recorded=false,savedScroll=0,feedbackUntil=0,moving=false;
const selectedDuration=()=>Number(document.querySelector('input[name=duration]:checked').value);
const announce=text=>{$('#announcements').textContent=text;};
const help=text=>{$('#throw-help').textContent=text;};
try{storage=localStorage;records=readRecords(storage.getItem(RECORD_KEY));}catch{storage=null;}
function showRecords(){
  for(const mode of [120,180]){
    const list=$(`#records-${mode}`);list.replaceChildren();
    if(!records[mode].length){const li=document.createElement('li');li.className='empty-record';li.textContent='Your first lucky round belongs here.';list.append(li);}
    records[mode].forEach((row,i)=>{const li=document.createElement('li');li.className='record-row';const rank=document.createElement('span'),score=document.createElement('strong'),unit=document.createElement('small'),date=document.createElement('time');rank.className='rank';rank.textContent=`0${i+1}`;score.textContent=String(row.score);unit.textContent='pts';date.dateTime=new Date(row.at).toISOString();date.textContent=new Intl.DateTimeFormat(getLanguage(),{month:'short',day:'numeric'}).format(row.at);li.append(rank,score,unit,date);list.append(li);});
  }
  $('#best').textContent=records[game.state==='idle'?selectedDuration():game.duration][0]?.score??'—';
  $('#storage-note').textContent=storage?'Saved on this device.':'Records last for this visit; device storage is unavailable.';
}
function setPower(power=null){const percent=power===null?0:Math.round(clamp(power)*100);$('#power-fill').style.width=`${percent}%`;$('#power-value').textContent=power===null?'—':`${percent}%`;}
function releaseInput(){const active=gesture;gesture=null;key=null;aim=null;arrow.classList.remove('is-held');arrow.style.setProperty('--drag-angle','0deg');arrow.style.setProperty('--drag-y','0px');if(active&&arrow.hasPointerCapture(active.id))try{arrow.releasePointerCapture(active.id);}catch{}setPower();}
function lock(){
  const enabled=game.state!=='idle'&&matchMedia('(max-width:760px), (pointer:coarse)').matches,was=document.body.classList.contains('play-locked');if(enabled===was)return;
  if(enabled)savedScroll=scrollY;document.documentElement.classList.toggle('play-locked',enabled);document.body.classList.toggle('play-locked',enabled);
  for(const el of document.querySelectorAll('.site-top,.intro,.sidebar,.how-to,.keyboard-help,footer'))el.inert=enabled;
  window.scrollTo({top:enabled?0:savedScroll,behavior:'instant'});
}
function render(){
  const playing=game.state==='playing',idle=game.state==='idle';
  $('#court').dataset.state=game.state;document.body.classList.toggle('is-results',game.state==='finished');
  $('#idle-caption').hidden=!idle;$('#result').hidden=game.state!=='finished';$('#end').hidden=!playing;$('#start').disabled=!idle;$('#duration-options').disabled=!idle;$('#aim').disabled=!playing;
  arrow.hidden=!playing;arrow.disabled=!game.ready;$('#arrow-badge').hidden=!playing;lock();
}
function update(){
  const seconds=game.state==='idle'?selectedDuration():Math.ceil(game.remaining);$('#time').textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;$('#score').textContent=String(game.score);
  arrow.disabled=!game.ready;const type=game.flight?.type||game.nextType;colorArrow(type);
  $('#aim-value').textContent=`${$('#aim').value}°`;
  if(game.state==='playing'&&!moving&&game.elapsed>=STILL_TIME){moving=true;$('#movement-label').textContent='A little wander';$('#movement-pill').classList.add('is-moving');announce('The pot is starting to wander. Aim a little ahead.');}
}
function colorArrow(type){
  arrow.classList.toggle('is-color',type==='color');$('#arrow-badge').classList.toggle('is-color',type==='color');$('#arrow-name').textContent=type==='color'?'Rainbow arrow':'Bamboo arrow';$('#arrow-points').textContent=type==='color'?'+2':'+1';
}
function finish(){
  if(recorded)return;recorded=true;clearTimeout(deadline);deadline=0;releaseInput();
  const previous=records[game.duration][0]?.score??-1;records=addRecord(records,game.duration,game.score,Date.now());
  if(storage)try{storage.setItem(RECORD_KEY,JSON.stringify({version:1,modes:records}));}catch{storage=null;}
  $('#final-score').textContent=String(game.score);$('#normal-hits').textContent=String(game.stats.normal);$('#color-hits').textContent=String(game.stats.color);$('#accuracy').textContent=`${game.stats.shots?Math.round((game.stats.normal+game.stats.color)/game.stats.shots*100):0}%`;
  $('#result-note').textContent=game.score>previous?'A fresh personal best. Lovely aim!':'Every little toss is a fresh start.';$('#shot-feedback').hidden=true;showRecords();render();animateChange($('.result-card'));$('#result-title').focus({preventScroll:true});announce(`Round complete. ${game.score} points.`);
}
function feedback(event){
  const messages={hit:event.type==='color'?'A rainbow landing!':'Right in the pot!',rim:'So close! It bounced off the rim.',short:'A little short. Try a quicker flick.',far:'A little far. Try a gentler flick.',left:'A little left. Nudge right next time.',right:'A little right. Nudge left next time.'};
  const box=$('#shot-feedback');box.hidden=false;box.classList.toggle('is-miss',event.kind!=='hit');$('#shot-points').textContent=event.points?`+${event.points}`:'↗';$('#shot-message').textContent=messages[event.kind];feedbackUntil=performance.now()+1150;help(messages[event.kind]);announce(messages[event.kind]);animateChange(box);
  if(event.points){animateChange($('#score'));try{navigator.vibrate?.(event.points===2?[10,20,10]:10);}catch{}}
}
function step(){
  const events=game.advance();for(const event of events){if(event.kind==='finished')finish();else feedback(event);}update();return events;
}
function ensureFrame(){if(!frame)frame=requestAnimationFrame(tick);}
function positionArrow(){const origin=court.project(0,0,.7);arrow.style.left=`${origin.x}px`;arrow.style.top=`${origin.y}px`;}
function tick(now){
  frame=0;if(game.state==='playing')step();
  if(key&&game.ready){const power=keyboardPower(now-key.started);aim={power,heading:Number($('#aim').value)*Math.PI/180};setPower(power);}
  if(feedbackUntil&&now>feedbackUntil){feedbackUntil=0;$('#shot-feedback').hidden=true;}
  court.draw({game,aim,time:now/1000,reduced:reducedMotion.matches});positionArrow();
  if(!document.hidden&&(game.state==='playing'))frame=requestAnimationFrame(tick);
}
function start(){
  clearTimeout(deadline);releaseInput();game.start(selectedDuration());recorded=false;moving=false;feedbackUntil=0;$('#shot-feedback').hidden=true;$('#movement-label').textContent='A quiet start';$('#movement-pill').classList.remove('is-moving');$('#aim').value=0;
  help('Swipe upward from the arrow. Aim for the middle of the strength guide.');showRecords();render();court.resize();positionArrow();update();ensureFrame();deadline=setTimeout(()=>{step();court.draw({game,reduced:reducedMotion.matches});},game.duration*1000);
  if(!matchMedia('(pointer:coarse)').matches)arrow.focus({preventScroll:true});announce('Your courtyard time starts now. Swipe upward from the arrow.');
}
function setup(){
  clearTimeout(deadline);deadline=0;releaseInput();game.abandon();feedbackUntil=0;$('#shot-feedback').hidden=true;$('#movement-label').textContent='A quiet start';$('#movement-pill').classList.remove('is-moving');game.reset(selectedDuration());render();showRecords();update();help('Swipe upward from the arrow. A quicker flick travels farther.');court.draw({game,reduced:reducedMotion.matches});ensureFrame();$('#start').focus({preventScroll:true});
}
function launch(options){
  step();if(game.state!=='playing')return;const f=game.launch(options);
  if(!f){help('Wait for this arrow to land. Your next one is on its way.');return;}
  $('#shot-feedback').hidden=true;feedbackUntil=0;arrow.disabled=true;help('A little arc. Let gravity do the rest.');update();ensureFrame();
}
const point=event=>({x:event.clientX,y:event.clientY,t:performance.now()});
arrow.addEventListener('pointerdown',event=>{
  if(event.button!==0||gesture||key)return;step();if(!game.ready)return;
  event.preventDefault();const bounds=$('#court').getBoundingClientRect();gesture={id:event.pointerId,samples:[point(event)],scale:Math.min(bounds.width,bounds.height)/420};arrow.setPointerCapture(event.pointerId);arrow.classList.add('is-held');setPower(0);$('#shot-feedback').hidden=true;
});
arrow.addEventListener('pointermove',event=>{
  if(gesture?.id!==event.pointerId)return;const p=point(event);gesture.samples.push(p);if(gesture.samples.length>32)gesture.samples.splice(1,1);
  aim=gestureThrow(gesture.samples,p.t,gesture.scale);setPower(aim?.power||0);const first=gesture.samples[0];arrow.style.setProperty('--drag-angle',`${clamp((p.x-first.x)/gesture.scale,-35,35)}deg`);arrow.style.setProperty('--drag-y',`${-Math.min(5,Math.max(0,first.y-p.y)*.03)}px`);
});
arrow.addEventListener('pointerup',event=>{
  if(gesture?.id!==event.pointerId)return;gesture.samples.push(point(event));const shot=gestureThrow(gesture.samples,performance.now(),gesture.scale);releaseInput();
  if(shot)launch(shot);else help('Start on the arrow, swipe upward and release while moving.');
});
for(const name of ['pointercancel','lostpointercapture'])arrow.addEventListener(name,()=>{if(gesture)releaseInput();});
arrow.addEventListener('keydown',event=>{
  if(!['Space','Enter'].includes(event.code)||event.isComposing)return;event.preventDefault();if(event.repeat||key||gesture)return;step();if(!game.ready)return;
  key={code:event.code,started:performance.now()};arrow.classList.add('is-held');$('#shot-feedback').hidden=true;setPower(0);help('Release near the middle of the guide. More power travels farther.');ensureFrame();
});
window.addEventListener('keyup',event=>{
  if(key?.code!==event.code)return;event.preventDefault();const shot={power:keyboardPower(performance.now()-key.started),heading:Number($('#aim').value)*Math.PI/180};releaseInput();if(shot.power>.025)launch(shot);else help('Hold a little longer, then let go.');
});
window.addEventListener('keydown',event=>{
  if(event.isComposing||event.metaKey||event.ctrlKey||event.altKey)return;
  if(event.code==='Escape'){if(gesture||key){releaseInput();help('Shot cancelled. Your arrow is still here.');}return;}
  if(game.state!=='playing'||event.target.matches('input'))return;
  if(['ArrowLeft','KeyA','ArrowRight','KeyD'].includes(event.code)){event.preventDefault();$('#aim').value=clamp(Number($('#aim').value)+(['ArrowLeft','KeyA'].includes(event.code)?-1:1),-25,25);if(key)aim={power:keyboardPower(performance.now()-key.started),heading:Number($('#aim').value)*Math.PI/180};update();}
});
$('#aim').addEventListener('input',update);arrow.addEventListener('blur',releaseInput);window.addEventListener('blur',releaseInput);
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);$('#change').addEventListener('click',setup);$('#end').addEventListener('click',setup);$('#duration-options').addEventListener('change',()=>{update();showRecords();});
document.addEventListener('visibilitychange',()=>{releaseInput();if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{if(game.state==='playing')step();ensureFrame();}});
window.addEventListener('pagehide',()=>{releaseInput();cancelAnimationFrame(frame);frame=0;});window.addEventListener('pageshow',event=>{if(event.persisted){if(game.state==='playing')step();ensureFrame();}});
window.addEventListener('resize',()=>{releaseInput();lock();court.resize();positionArrow();ensureFrame();});reducedMotion.addEventListener('change',ensureFrame);document.addEventListener('languagechange',showRecords);
showRecords();render();update();court.draw({game,reduced:reducedMotion.matches});ensureFrame();
if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',async()=>{
  try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready for a little toss offline.';}catch{$('#offline-status').textContent='Your courtyard is ready online.';}
});
