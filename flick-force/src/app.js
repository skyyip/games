import {FlickGame,clamp,DECELERATION} from './game.js';
import {readRecords,saveRecords,addRecord} from './records.js';
import {Track} from './track.js';
import {carMarkup,carY} from './car.js';
import {getLanguage} from '../../grid-rush/src/language.js';
import {reducedMotion} from '../../grid-rush/src/playground-ui.js';

const $=selector=>document.querySelector(selector),surface=$('#runway'),game=new FlickGame(),track=new Track($('#track'));
let storage;try{storage=window.localStorage;}catch{/* Scores remain in memory. */}
let {records,available}=readRecords(storage),pointer=null,samples=[],frame=0,lastTime=0,paused=false,rank=null,drag=0,launchDrag=0;
const car=$('#car');car.innerHTML=carMarkup;
const say=text=>{$('#announcements').textContent=text;};
const metres=value=>`${value.toFixed(2)} m`;
function renderRecords(){
  $('#best').textContent=records.length?metres(records[0].distance):'—';
  const rows=records.map((record,index)=>{
    const row=document.createElement('li');row.className=`record${index+1===rank?' is-new':''}`;
    const place=document.createElement('span');place.textContent=String(index+1).padStart(2,'0');
    const details=document.createElement('div'),value=document.createElement('strong'),date=document.createElement('small'),direction=document.createElement('i');
    value.textContent=metres(record.distance);date.textContent=new Intl.DateTimeFormat(getLanguage(),{month:'short',day:'numeric'}).format(new Date(record.date));
    direction.textContent=record.direction==='up'?'↑':'↓';direction.setAttribute('aria-label',record.direction==='up'?'Upward flick':'Downward flick');
    details.append(value,date);row.append(place,details,direction);return row;
  });
  if(!rows.length){const empty=document.createElement('li');empty.className='empty-records';empty.textContent='Your first flick is the start of something lovely.';rows.push(empty);}
  $('#records').replaceChildren(...rows);$('#storage-note').textContent=available?'Saved on this device.':'Storage is unavailable. Records last for this visit.';
}
function draw(){
  const total=game.metrics?game.metrics.initialSpeed**2/(2*DECELERATION):0;
  // Carry the finger-following offset into the glide, settling at the final metre marker.
  const offset=game.state==='dragging'?drag:total?launchDrag*clamp(1-game.distance/total):0;
  track.draw({distance:game.distance,speed:game.speed,direction:game.metrics?.direction??'up',drag:offset,time:game.elapsed,state:game.state,quiet:reducedMotion.matches});
  const quiet=reducedMotion.matches,moving=game.state==='coasting',power=game.speed/108,t=game.elapsed;
  car.dataset.mood=moving?'effort':'happy';car.dataset.paused=String(paused);
  $('#zoom-burst').hidden=!moving||paused||quiet||power<.22;
  $('#zoom-burst').style.top=`${carY(track.height,t)-60}px`;
  if(paused&&!quiet)return;
  car.style.setProperty('--car-y',`${carY(track.height,quiet?0:t)}px`);
  car.style.setProperty('--car-bob',`${moving&&!quiet?Math.sin(t*(8+power*7))*power*2.8:0}px`);
  car.style.setProperty('--car-lean',`${moving&&!quiet?Math.sin(t*9)*power*.35:0}deg`);
  car.style.setProperty('--car-roll',`${moving&&!quiet?Math.sin(t*7)*power*.25:quiet?0:drag/100}deg`);
  car.style.setProperty('--tread-shift',`${quiet?0:(game.distance*(game.metrics?.direction==='down'?-14:14))%10}px`);
  car.style.setProperty('--sweat-y',`${moving&&!quiet?(1+Math.sin(t*7))*3:0}px`);
  car.style.setProperty('--ribbon-wave',`${moving&&!quiet?Math.sin(t*18)*12:0}deg`);
  car.style.setProperty('--exhaust-strength',String(.25+power*.55));
}
function render(){
  surface.dataset.state=game.state;
  $('#distance').textContent=game.distance.toFixed(2);
  $('#ready-hint').hidden=game.state!=='ready';$('#effort-pill').hidden=game.state!=='dragging';$('#coast-pill').hidden=game.state!=='coasting'||paused;
  $('#result').hidden=game.state!=='complete';$('#reset').hidden=game.state==='ready';$('#pause-overlay').hidden=!paused;
  $('#direction').textContent=game.metrics?(game.metrics.direction==='up'?'↑':'↓'):'↑ ↓';
  for(const [name,property] of [['speed','speedQuality'],['force','forceQuality'],['range','spanQuality']]){
    const value=game.metrics?.[property];$(`#${name}-value`).textContent=value===undefined?'—':`${Math.round(value*100)}%`;$(`#${name}-meter`).value=value??0;
  }
  $('#measurement-note').textContent=game.metrics?.pressureUsed?'Effort combines swipe acceleration and available touch pressure. Metres are game distance.':'Effort is estimated from swipe acceleration. Metres are game distance.';
  draw();
}
function finish(){
  const next=addRecord(records,{distance:game.distance,direction:game.metrics.direction});records=next.records;rank=next.rank;
  available=saveRecords(storage,records)&&available;
  $('#final-distance').textContent=game.distance.toFixed(2);
  $('#result-badge').textContent=rank===1?'A NEW PERSONAL BEST':rank?'A PLACE IN YOUR TOP THREE':'A LOVELY LITTLE FLICK';
  $('#result-note').textContent=rank?`Number ${rank} in your longest three.`:'A lovely glide. Your next flick could go even further.';
  $('#gesture-help').textContent='All that way, from one little flick.';
  renderRecords();render();say(`Your flick travelled ${game.distance.toFixed(2)} metres.`);
}
function tick(now){
  frame=0;if(paused||game.state!=='coasting')return;
  const dt=Math.max(0,(now-lastTime)/1000);lastTime=now;
  if(game.advance(dt)){finish();return;}
  $('#distance').textContent=game.distance.toFixed(2);draw();frame=requestAnimationFrame(tick);
}
function animate(){lastTime=performance.now();frame=requestAnimationFrame(tick);}
function releaseCapture(){if(pointer!==null&&surface.hasPointerCapture(pointer))surface.releasePointerCapture(pointer);pointer=null;}
function reset(focus=true){
  cancelAnimationFrame(frame);frame=0;const id=pointer;pointer=null;if(id!==null&&surface.hasPointerCapture(id))surface.releasePointerCapture(id);
  samples=[];drag=0;launchDrag=0;paused=false;rank=null;game.reset();surface.style.removeProperty('--effort');
  $('#gesture-help').textContent='Swipe once, straight up or down. Release while moving.';renderRecords();render();if(focus)surface.focus({preventScroll:true});
}
function cancelGesture(message='Flick cancelled. Take your time and try again.'){
  if(game.state!=='dragging')return;reset(false);$('#gesture-help').textContent=message;say(message);
}
function begin(){
  if(!game.begin())return false;rank=null;drag=0;$('#gesture-help').textContent='Make one clean swipe. Let go while your finger is moving.';render();return true;
}
function launch(options){
  launchDrag=drag;drag=0;releaseCapture();
  if(!game.release(samples,options)){launchDrag=0;$('#gesture-help').textContent='Try a quicker, longer swipe straight up or down.';render();say('Try a quicker, longer swipe straight up or down.');return;}
  samples=[];$('#gesture-help').textContent='Hands off. Let your flick find its finish.';render();animate();
}
function sample(event){return {x:clamp(event.clientX,0,innerWidth),y:clamp(event.clientY,0,innerHeight),t:event.timeStamp,pressure:event.pressure};}
surface.addEventListener('pointerdown',event=>{
  if(event.target.closest('button')||event.button!==0)return;
  if(pointer!==null&&!event.isPrimary){cancelGesture();return;}
  if(!event.isPrimary||!begin())return;
  surface.dataset.input='pointer';
  event.preventDefault();surface.focus({preventScroll:true});pointer=event.pointerId;samples=[sample(event)];surface.setPointerCapture(pointer);
});
surface.addEventListener('pointermove',event=>{
  if(event.pointerId!==pointer||game.state!=='dragging')return;
  event.preventDefault();const points=event.getCoalescedEvents?.()??[];
  for(const point of points.length?points:[event]){if(samples.length<500)samples.push(sample(point));}
  drag=clamp(event.clientY-samples[0].y,-120,120);surface.style.setProperty('--effort',String(clamp(Math.abs(event.clientY-samples[0].y)/innerHeight/.65)));draw();
});
surface.addEventListener('pointerup',event=>{
  if(event.pointerId!==pointer)return;event.preventDefault();samples.push(sample(event));
  const source=event.pointerType||'mouse';const id=pointer;pointer=null;if(surface.hasPointerCapture(id))surface.releasePointerCapture(id);
  launch({extent:innerHeight,source});
});
for(const type of ['pointercancel','lostpointercapture'])surface.addEventListener(type,event=>{if(event.pointerId===pointer)cancelGesture();});
surface.addEventListener('contextmenu',event=>event.preventDefault());
surface.addEventListener('dragstart',event=>event.preventDefault());
surface.addEventListener('touchmove',event=>{if(event.cancelable)event.preventDefault();},{passive:false});
surface.addEventListener('blur',()=>{if(game.state==='dragging')cancelGesture();});
function pause(){
  if(game.state==='dragging'){cancelGesture();return;}
  if(game.state!=='coasting'||paused)return;paused=true;cancelAnimationFrame(frame);frame=0;render();
}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
window.addEventListener('blur',pause);
$('#resume').addEventListener('click',()=>{if(!paused||game.state!=='coasting')return;paused=false;render();animate();surface.focus({preventScroll:true});});
$('#reset').addEventListener('click',()=>{reset();say('Flick cancelled. Nothing was saved.');});
$('#again').addEventListener('click',()=>reset());
new ResizeObserver(()=>{if(game.state==='dragging')cancelGesture('The screen changed. Start a fresh flick.');track.resize();draw();}).observe($('#track'));
document.addEventListener('languagechange',renderRecords);reducedMotion.addEventListener('change',draw);
track.resize();renderRecords();render();
async function enableOffline(){
  try{
    if(!/^https?:$/.test(location.protocol)||self.origin==='null'||!('serviceWorker'in navigator))return;
    await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready to play offline';
  }catch{/* Opaque previews and unsupported browsers still play normally. */}
}
enableOffline();
