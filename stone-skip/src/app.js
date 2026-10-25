import {StoneGame,LIMITS,DEFAULTS,WEIGHTS,qualities,motionQualities,gesturePower,keyboardPower,flightPlan,flightAt,rankRecords,keepRecords,readRecords,clamp} from './game.js';
import {MotionPower} from './motion.js';
import {River} from './river.js';
import {reducedMotion,animateChange} from '../../grid-rush/src/playground-ui.js';

const $=s=>document.querySelector(s),game=new StoneGame(),river=new River($('#water')),stone=$('#stone');
const RECORD_KEY='stone-skip.records.v2',sourceLabels={gesture:'Swipe throw',motion:'Phone motion',keyboard:'Keyboard charge'};
const labels={angle:'Release angle',power:'Your throw'};
let records=[],storage,gesture=null,key=null,frame=0,elapsed=0,lastFrame=null,plan=null,seenContacts=0,savedScroll=0;
let motionHandler=null,motionInterval=0,motionTimeout=0,motionRevision=0,sequence=0;
try{storage=localStorage;records=readRecords(storage.getItem(RECORD_KEY));}catch{storage=null;$('#storage-note').textContent='Records last for this visit; device storage is unavailable.';}
const announce=text=>{$('#announcements').textContent=text;};
const help=text=>{$('#throw-help').textContent=text;};
const mode=()=>document.querySelector('input[name="mode"]:checked').value;
function readSettings(){return Object.fromEntries(Object.keys(LIMITS).map(name=>[name,$(`#${name}-value`).valueAsNumber]));}
function validSettings(){return Object.keys(LIMITS).every(name=>$(`#${name}-value`).validity.valid&&Number.isFinite($(`#${name}-value`).valueAsNumber));}
function preview(){
  $('#start').disabled=!validSettings();if(!validSettings())return;
  const values=readSettings(),q=qualities(values);$('#setup-score').textContent=`${(q.angle*WEIGHTS.angle).toFixed(1)} / ${WEIGHTS.angle}`;
}
for(const [name,[min,max]] of Object.entries(LIMITS)){
  const range=$(`#${name}`),number=$(`#${name}-value`);
  range.addEventListener('input',()=>{number.value=range.value;preview();});
  number.addEventListener('input',()=>{if(number.validity.valid)range.value=number.value;preview();});
  number.addEventListener('change',()=>{number.value=clamp(Number.isFinite(number.valueAsNumber)?number.valueAsNumber:DEFAULTS[name],min,max);if(!number.validity.valid)number.value=DEFAULTS[name];range.value=number.value;preview();});
}
function strength(power){const value=Math.round(clamp(power)*100);$('#strength').value=value;$('#strength').textContent=`${value}%`;$('#strength-value').textContent=`${value}%`;}
function lock(){
  const enabled=game.state!=='setup'&&matchMedia('(max-width:760px), (pointer:coarse)').matches,was=document.body.classList.contains('play-locked');
  if(enabled===was)return;
  if(enabled)savedScroll=scrollY;
  document.documentElement.classList.toggle('play-locked',enabled);document.body.classList.toggle('play-locked',enabled);
  for(const el of document.querySelectorAll('.site-top,.intro,.sidebar,.recipe,footer'))el.inert=enabled;
  window.scrollTo({top:enabled?0:savedScroll,behavior:'instant'});$('.play-panel').scrollTop=0;
}
function render(){
  const playing=game.state!=='setup',armed=game.state==='armed';
  $('#settings').disabled=playing;$('#mode-options').disabled=playing;$('#start').disabled=playing||!validSettings();
  $('#exit').hidden=!playing;$('.river-note').hidden=playing;$('#river-caption').hidden=['animating','results'].includes(game.state);
  stone.hidden=!armed||mode()!=='gesture';$('#motion-actions').hidden=!armed||mode()!=='motion';
  $('#flight-counter').hidden=game.state!=='animating';$('#result').hidden=game.state!=='results';
  $('#charge').hidden=!armed||!(key||motionHandler);
  $('#stage-label').textContent=game.state==='setup'?'01 / FIND YOUR FLOW':armed?'YOUR STONE. YOUR MOMENT.':game.state==='animating'?'FOLLOW THE LITTLE RIPPLE':'ONE FOR THE RIVER BOOKS';
  lock();
}
function stopMotion(){
  motionRevision++;if(motionHandler)window.removeEventListener('devicemotion',motionHandler);motionHandler=null;
  clearInterval(motionInterval);clearTimeout(motionTimeout);motionInterval=motionTimeout=0;$('#enable-motion').disabled=false;
}
function cancelInput(message=false){
  const active=Boolean(gesture||key||motionHandler);gesture=null;key=null;stopMotion();
  stone.classList.remove('is-held');stone.style.setProperty('--drag-x','0px');stone.style.setProperty('--drag-y','0px');
  $('#charge').hidden=true;strength(0);if(message&&active&&game.state==='armed')help('Throw cancelled. Your stone is still here. Try again.');
}
function recordRows(selector,rows,metric){
  const list=$(selector);list.replaceChildren();
  if(!rows.length){const li=document.createElement('li');li.className='empty';li.textContent='The river is waiting for your first stone.';list.append(li);return;}
  rows.forEach((r,index)=>{
    const li=document.createElement('li');li.className='record-row';
    const rank=document.createElement('span');rank.className='record-rank';rank.textContent=String(index+1).padStart(2,'0');
    const detail=document.createElement('div');detail.className='record-detail';const title=document.createElement('b');title.textContent=sourceLabels[r.source];
    const small=document.createElement('span');small.textContent=metric==='distance'?`${r.bounces} bounces`:`${r.distance.toFixed(1)} m`;detail.append(title,small);
    const value=document.createElement('span');value.className='record-value';value.textContent=metric==='distance'?r.distance.toFixed(1):r.bounces;
    const unit=document.createElement('small');unit.textContent=metric==='distance'?'Metres':'Bounces';value.append(unit);li.append(rank,detail,value);list.append(li);
  });
}
function showRecords(){const top=rankRecords(records);recordRows('#distance-records',top.distance,'distance');recordRows('#bounce-records',top.bounces,'bounces');}
function finish(){
  const result=game.complete();if(!result)return;
  const id=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${++sequence}`;
  const record={...result,id,createdAt:Date.now()};records=keepRecords([...records,record]);
  try{storage?.setItem(RECORD_KEY,JSON.stringify({version:2,records}));}catch{storage=null;$('#storage-note').textContent='Records last for this visit; device storage is unavailable.';}
  const top=rankRecords(records),best=top.distance[0]?.id===id||top.bounces[0]?.id===id;
  $('#result-distance').textContent=result.distance.toFixed(1);$('#result-bounces').textContent=result.bounces;$('#result-score').textContent=`${result.score.toFixed(1)} / 100`;
  $('#result-source').textContent=sourceLabels[result.source];$('#result-power').textContent=`${Math.round(result.power*100)}% strength`;
  const metrics=$('#motion-metrics');metrics.hidden=!result.motion;$('#motion-score-note').hidden=!result.motion;metrics.replaceChildren();
  if(result.motion){
    const q=motionQualities(result.motion);
    for(const [key,label,unit,multiplier] of [['force','Throw force','m/s²',1],['speed','Throw speed','m/s',1],['amplitude','Swing range','cm',100]]){
      const row=document.createElement('div'),name=document.createElement('dt'),value=document.createElement('dd'),points=document.createElement('span');
      name.textContent=label;value.append(document.createTextNode(`${(result.motion[key]*multiplier).toFixed(1)} ${unit} · `));
      points.textContent=`${(q[key]*WEIGHTS.power/3).toFixed(1)} pts`;value.append(points);row.append(name,value);metrics.append(row);
    }
  }
  $('#record-note').textContent=best?'A new river best. Beautifully done.':records.some(r=>r.id===id)?'One of your three best. A ripple worth keeping.':'A lovely little moment on the water.';
  $('#contributions').replaceChildren(...Object.entries(result.parts).map(([name,value])=>{
    const li=document.createElement('li'),label=document.createElement('span'),text=document.createElement('span'),weight=document.createElement('span'),points=document.createElement('b');
    text.textContent=labels[name];weight.textContent=` · ${WEIGHTS[name]}%`;label.append(text,weight);points.textContent=`${value.toFixed(1)} / ${WEIGHTS[name]}`;li.append(label,points);return li;
  }));
  showRecords();render();$('#result').scrollTop=0;$('#result-title').focus({preventScroll:true});
  help('The stone has settled. Ready for another ripple?');announce(`Your stone travelled ${result.distance.toFixed(1)} metres with ${result.bounces} bounces.`);
}
function animate(now){
  if(game.state!=='animating'){frame=0;return;}
  if(!document.hidden&&lastFrame!==null)elapsed+=Math.min(80,now-lastFrame);lastFrame=document.hidden?null:now;
  river.draw({plan,elapsed,result:game.result});const state=flightAt(plan,elapsed);
  if(state.contacts!==seenContacts){seenContacts=state.contacts;$('#live-bounces').textContent=seenContacts;if(!reducedMotion.matches)animateChange($('#live-bounces'));}
  if(state.done){frame=0;finish();return;}frame=requestAnimationFrame(animate);
}
function launch(power,source,motion=null){
  if(!game.launch(power,source,motion))return;
  cancelInput();plan=flightPlan(game.result,{reduced:reducedMotion.matches});elapsed=0;lastFrame=null;seenContacts=0;$('#live-bounces').textContent='0';
  help('Watch your stone dance across the river.');announce('Stone released. Follow the bounces.');render();frame=requestAnimationFrame(animate);
}
async function enableMotion(){
  stopMotion();if(game.state!=='armed'||mode()!=='motion')return;
  const revision=motionRevision;$('#enable-motion').disabled=true;
  try{
    if(!window.isSecureContext||!globalThis.DeviceMotionEvent)throw new Error('unsupported');
    if(typeof DeviceMotionEvent.requestPermission==='function'){
      const permission=await DeviceMotionEvent.requestPermission();if(permission!=='granted')throw new Error('denied');
    }
    if(revision!==motionRevision||game.state!=='armed')return;
    const meter=new MotionPower(performance.now());let ready=false;
    help('Hold still for a moment. Getting ready to feel your throw.');strength(0);
    motionHandler=event=>{
      const reading=meter.sample(event,performance.now());if(!reading)return;
      if(reading.ready&&!ready){ready=true;help('Keep hold of your phone and make one comfortable throwing motion. Do not let go of the phone.');announce('Ready for your throwing motion.');}
      strength(reading.power);
    };
    window.addEventListener('devicemotion',motionHandler);
    motionInterval=setInterval(()=>{const power=meter.finish(performance.now());if(power!==null)launch(power,'motion',meter.metrics);},40);
    motionTimeout=setTimeout(()=>{stopMotion();$('#charge').hidden=true;help('No throw detected. Try phone motion again, or use a swipe.');announce('No throw detected. Try again or switch to a swipe.');},8000);
    render();
  }catch(error){
    if(revision!==motionRevision)return;stopMotion();$('#charge').hidden=true;
    help(error.message==='denied'?'Motion access was declined. You can try again or use a swipe.':'Motion sensing is unavailable here. Use a swipe, or try your phone browser.');announce($('#throw-help').textContent);
  }
}
function arm(){
  cancelInput();if(!validSettings()){Object.keys(LIMITS).map(name=>$(`#${name}-value`)).find(input=>!input.validity.valid)?.reportValidity();return;}
  if(!game.arm(readSettings()))return;river.draw();$('#result .breakdown').open=false;render();
  if(!document.body.classList.contains('play-locked'))$('.play-panel').scrollIntoView({block:'start',behavior:'instant'});
  if(mode()==='motion')enableMotion();else{help('Swipe the stone up toward the river, then let go.');$('#input-note').textContent='Keyboard: hold Space or Enter to charge, then release.';stone.focus({preventScroll:true});}
}
function reset(){
  cancelAnimationFrame(frame);frame=0;cancelInput();game.reset();plan=null;elapsed=0;river.draw();render();preview();
  help('Choose a stone. The river will do the rest.');$('#input-note').textContent='Your three best distances and bounce counts stay on this device.';
  $('#start').focus({preventScroll:true});$('.setup-card').scrollIntoView({block:'center',behavior:'instant'});
}
$('#start').addEventListener('click',arm);$('#again').addEventListener('click',arm);$('#exit').addEventListener('click',reset);$('#change').addEventListener('click',reset);
$('#enable-motion').addEventListener('click',enableMotion);
$('#use-gesture').addEventListener('click',()=>{cancelInput();document.querySelector('input[name="mode"][value="gesture"]').checked=true;modeHint();render();help('Swipe the stone up toward the river, then let go.');$('#input-note').textContent='Keyboard: hold Space or Enter to charge, then release.';stone.focus({preventScroll:true});});
function modeHint(){
  const motion=mode()==='motion';$('#setup-note').textContent=motion?'Your phone measures the throw. Keep hold of it; never release the phone.':'Drag up and release. A faster swipe makes a stronger throw.';
  $('#motion-scoring').hidden=!motion;
}
if(matchMedia('(pointer:coarse)').matches&&globalThis.DeviceMotionEvent)document.querySelector('input[name="mode"][value="motion"]').checked=true;
$('#mode-options').addEventListener('change',modeHint);
stone.addEventListener('pointerdown',event=>{
  if(game.state!=='armed'||mode()!=='gesture'||event.button!==0||!event.isPrimary||gesture||key)return;
  event.preventDefault();const p={x:event.clientX,y:event.clientY,t:performance.now()};gesture={id:event.pointerId,points:[p],from:p};
  stone.focus({preventScroll:true});stone.setPointerCapture(event.pointerId);stone.classList.add('is-held');help('Up toward the water. Release to send it skipping.');
});
stone.addEventListener('pointermove',event=>{
  if(gesture?.id!==event.pointerId)return;
  const p={x:event.clientX,y:event.clientY,t:performance.now()};gesture.points.push(p);gesture.points=gesture.points.slice(-30);
  stone.style.setProperty('--drag-x',`${clamp((p.x-gesture.from.x)*.24,-40,65)}px`);stone.style.setProperty('--drag-y',`${clamp((p.y-gesture.from.y)*.24,-65,30)}px`);
});
stone.addEventListener('pointerup',event=>{
  if(gesture?.id!==event.pointerId)return;
  const power=gesturePower(gesture.points,{x:event.clientX,y:event.clientY,t:performance.now()});cancelInput();
  if(power===null)help('A quick upward swipe will do it. Your stone is ready to try again.');else launch(power,'gesture');
});
stone.addEventListener('pointercancel',()=>cancelInput(true));stone.addEventListener('lostpointercapture',()=>{if(gesture)cancelInput(true);});
for(const type of ['contextmenu','selectstart','dragstart'])stone.addEventListener(type,e=>e.preventDefault());
stone.addEventListener('keydown',event=>{
  if(!['Space','Enter'].includes(event.code)||event.isComposing||game.state!=='armed')return;
  event.preventDefault();if(event.repeat||gesture||key)return;
  key={code:event.code,started:performance.now()};stone.classList.add('is-held');$('#charge').hidden=false;help('Release near a full meter for a stronger throw.');
  const charge=()=>{if(!key)return;strength(keyboardPower(performance.now()-key.started));frame=requestAnimationFrame(charge);};frame=requestAnimationFrame(charge);
});
window.addEventListener('keyup',event=>{
  if(key?.code!==event.code)return;event.preventDefault();const power=keyboardPower(performance.now()-key.started);cancelAnimationFrame(frame);frame=0;cancelInput();
  if(power<.02)help('Hold a little longer to charge your throw.');else launch(power,'keyboard');
});
window.addEventListener('keydown',event=>{if(event.key==='Escape')cancelInput(true);});
stone.addEventListener('blur',()=>{if(gesture||key)cancelInput(true);});
window.addEventListener('blur',()=>{if(gesture||key||motionHandler)cancelInput(true);});
document.addEventListener('visibilitychange',()=>{lastFrame=null;if(document.hidden&&game.state==='armed')cancelInput(true);});
window.addEventListener('pagehide',()=>{cancelInput();cancelAnimationFrame(frame);frame=0;});
window.addEventListener('pageshow',event=>{if(event.persisted&&game.state==='animating'){lastFrame=null;frame=requestAnimationFrame(animate);}});
window.addEventListener('resize',()=>{lock();river.resize();});
document.addEventListener('languagechange',showRecords);
preview();modeHint();showRecords();render();
if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',async()=>{
  try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready for a ripple offline.';}catch{$('#offline-status').textContent='Your river is ready online.';}
});
