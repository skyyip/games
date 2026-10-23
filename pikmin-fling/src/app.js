import {FlingGame} from './game.js';
import {createRoster,TYPES,TYPE_NAMES,isUpwardSwipe,flightPoint} from './interaction.js';
import {readLeaderboard,saveLeaderboard,addResult} from './leaderboard.js';
import {animateChange,reducedMotion} from '../../grid-rush/src/playground-ui.js';

const $=selector=>document.querySelector(selector);
const game=new FlingGame(),world=$('#world'),units=$('#units'),plant=$('#plant');
const flights=new Map(),gestures=new Map(),effects=new Set();
let storage;
try{storage=window.localStorage;}catch{/* In-memory records still work. */}
let {records,available:storageAvailable}=readLeaderboard(storage);
let roster=[],selected=null,newRank=null,frame=0,assetsReady=false;
let bite=null,nom=null;
const seconds=time=>(time/1000).toFixed(2);
const announce=text=>{$('#announcements').textContent=text;};
const source=type=>`./assets/pikmin/${type}.png`;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

function renderRoster() {
  roster=createRoster(game.count);
  const bySlot=new Map(roster.map(unit=>[unit.slot,unit])),fragment=document.createDocumentFragment();
  for(let i=0;i<40;i++) {
    const slot=document.createElement('div');slot.className='slot';
    const unit=bySlot.get(i);
    if(unit) {
      const button=document.createElement('button');button.type='button';button.className='pikmin';
      button.dataset.id=unit.id;button.disabled=game.state!=='playing';button.setAttribute('aria-pressed','false');
      button.setAttribute('aria-label',`${TYPE_NAMES[unit.type]} Pikmin ${unit.id+1}. Swipe up, or press Enter to fling.`);
      const image=document.createElement('img');image.src=source(unit.type);image.alt='';image.draggable=false;
      image.width=56;image.height=64;button.append(image);slot.append(button);
    }
    fragment.append(slot);
  }
  units.replaceChildren(fragment);
}

function setSelected(id) {
  selected=id!==null && game.units[id]==='ready'?id:null;
  for(const button of units.querySelectorAll('button'))button.setAttribute('aria-pressed',String(Number(button.dataset.id)===selected));
  $('#feed-selected').disabled=selected===null || game.state!=='playing' || [...gestures.values()].some(g=>g.id===selected);
}

function renderRecords() {
  const fragment=document.createDocumentFragment();
  records[game.count].forEach((record,index)=>{
    const row=document.createElement('li');row.className=`record${newRank===index+1?' is-new':''}`;
    const rank=document.createElement('span');rank.className='record-rank';rank.textContent=String(index+1).padStart(2,'0');
    const score=document.createElement('span');score.className='record-score';score.append(document.createTextNode(seconds(record.time)));
    const suffix=document.createElement('small');suffix.textContent='s';score.append(suffix);
    if(newRank===index+1){const badge=document.createElement('span');badge.className='record-new';badge.textContent='NEW RECORD';score.append(badge);}
    const date=document.createElement('time');date.className='record-date';date.dateTime=record.date;
    date.textContent=new Date(record.date).toLocaleDateString(undefined,{month:'short',day:'numeric'});
    row.append(rank,score,date);fragment.append(row);
  });
  if(!fragment.childNodes.length){const row=document.createElement('li');row.className='empty-records';row.textContent='A clean garden deserves a record. Set your first time.';fragment.append(row);}
  $('#records').replaceChildren(fragment);$('#records-count').textContent=`${game.count} PIKMIN`;
  $('#storage-status').textContent=storageAvailable?'Saved on this device.':'Storage is unavailable. Records stay for this visit.';
}

function renderProgress() {
  $('#timer').textContent=seconds(game.elapsed);
  $('#fed').textContent=game.progress;$('#total').textContent=game.count;
  $('#progress').max=game.count;$('#progress').value=game.progress;
  $('#phase').textContent=game.state==='playing'?'FEEDING TIME':game.state==='completed'?'CLEAN SWEEP':'READY TO FLING';
}

function cancelEffects() {
  for(const animation of effects)animation.cancel();effects.clear();
}
function effect(target,keyframes,options) {
  if(reducedMotion.matches)return null;
  const animation=target.animate(keyframes,options);effects.add(animation);
  animation.finished.catch(()=>{}).finally(()=>effects.delete(animation));return animation;
}
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)cancelEffects();});
function chomp() {
  bite?.cancel();nom?.cancel();
  bite=effect($('#plant-head'),[{transform:'scale(1)'},{transform:'scale(1.1,.82)',offset:.3},{transform:'scale(.98,1.04)',offset:.7},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});
  nom=effect($('#chomp-word'),[{opacity:0,transform:'translateY(7px) rotate(9deg) scale(.8)'},{opacity:1,transform:'translateY(0) rotate(9deg) scale(1)',offset:.25},{opacity:1,offset:.65},{opacity:0,transform:'translateY(-8px) rotate(9deg) scale(.95)'}],{duration:380,easing:'ease-out'});
}

function resetRound(count=game.count) {
  cancelAnimationFrame(frame);frame=0;
  for(const [pointer,g] of gestures){if(g.button.hasPointerCapture(pointer))g.button.releasePointerCapture(pointer);}
  gestures.clear();flights.clear();$('#flights').replaceChildren();cancelEffects();
  game.reset(count);selected=null;newRank=null;plant.classList.remove('is-open');
  $('#results').hidden=true;$('#count-options').disabled=false;
  $('#start').hidden=false;$('#reset').hidden=true;
  $('#gesture-help').textContent='Swipe a Pikmin upward to send it flying. The plant will take care of the rest.';
  $('#garden-label').textContent='THE LUNCH CROWD';
  renderRoster();renderProgress();setSelected(null);renderRecords();
}

function startRound(keyboard=false) {
  if(!assetsReady)return;
  resetRound();game.start();
  for(const button of units.querySelectorAll('button'))button.disabled=false;
  $('#count-options').disabled=true;$('#start').hidden=true;$('#reset').hidden=false;
  $('#garden-label').textContent='FLING UP. CLEAR THE GARDEN.';
  renderProgress();$('.scoreboard').scrollIntoView({block:'start',behavior:'auto'});
  if(keyboard)units.querySelector('button').focus({preventScroll:true});
  announce(`${game.count} Pikmin. Timer started. Swipe upward or use Enter to feed the plant.`);
  frame=requestAnimationFrame(tick);
}

function finishRound() {
  const result=addResult(records,game.count,game.elapsed);records=result.records;newRank=result.rank;
  storageAvailable=saveLeaderboard(storage,records)&&storageAvailable;
  $('#final-time').textContent=seconds(game.elapsed);
  $('#result-badge').textContent=result.personalBest?'NEW PERSONAL BEST!':newRank?`TOP THREE / #${newRank}`:'CLEAN SWEEP';
  $('#result-note').textContent=`All ${game.count} Pikmin fed. ${result.personalBest?'Your quickest clean-up yet.':newRank?'A new spot in your fastest three.':'One hungry plant, one very tidy garden.'}`;
  $('#results').hidden=false;renderRecords();setSelected(null);
  $('#garden-label').textContent='ONE VERY HAPPY PLANT';
  animateChange($('#results'));$('#result-title').focus({preventScroll:true});
  $('#results').scrollIntoView({block:'center',behavior:reducedMotion.matches?'auto':'smooth'});
  announce(`Garden cleared in ${seconds(game.elapsed)} seconds. ${$('#result-badge').textContent}`);
}

function tick(now) {
  frame=0;
  const bounds=world.getBoundingClientRect(),mouth=$('#mouth-target').getBoundingClientRect();
  const target={x:mouth.x-bounds.x,y:mouth.y-bounds.y};
  let arrivals=0;
  for(const [id,flight] of flights) {
    const t=Math.min(1,(now-flight.started)/480);
    if(t>=1) {
      flight.image.remove();flights.delete(id);
      if(game.arrive(id))arrivals++;
    }else{
      const from={x:flight.from.x*bounds.width,y:flight.from.y*bounds.height};
      const point=reducedMotion.matches?from:flightPoint(from,target,t);
      const turn=reducedMotion.matches?0:Math.sin(Math.PI*t)*flight.turn;
      const scale=reducedMotion.matches?1:1-.75*t**5;
      flight.image.style.transform=`translate(${point.x}px,${point.y}px) translate(-50%,-50%) rotate(${turn}deg) scale(${scale})`;
      flight.image.style.opacity=reducedMotion.matches?1-t:1;
    }
  }
  plant.classList.toggle('is-open',flights.size>0);
  if(arrivals){chomp();$('#gesture-help').textContent=game.remaining?`${game.progress} fed. ${game.remaining} to go — keep them flying!`:'Every last Pikmin. Delicious.';}
  renderProgress();
  if(game.state==='completed')finishRound();
  else if(game.state==='playing')frame=requestAnimationFrame(tick);
}

function launch(id,keyboard=false) {
  if([...gestures.values()].some(g=>g.id===id))return;
  const button=units.querySelector(`[data-id="${id}"]`);
  if(!button || !game.launch(id))return;
  const bounds=world.getBoundingClientRect(),imageBounds=button.querySelector('img').getBoundingClientRect();
  const from={x:(imageBounds.x+imageBounds.width/2-bounds.x)/bounds.width,y:(imageBounds.y+imageBounds.height/2-bounds.y)/bounds.height};
  const image=button.querySelector('img').cloneNode();image.className='flying-pikmin';
  const turn=from.x<.5?-45:45;
  image.style.transform=`translate(${from.x*bounds.width}px,${from.y*bounds.height}px) translate(-50%,-50%)`;
  $('#flights').append(image);flights.set(id,{image,from,turn,started:performance.now()});
  button.disabled=true;button.classList.add('is-gone');button.querySelector('img').style.transform='';
  plant.classList.add('is-open');setSelected(null);
  if(keyboard){const next=[...units.querySelectorAll('button')].find(b=>!b.disabled);(next||$('#reset')).focus({preventScroll:true});}
}

units.addEventListener('pointerdown',event=>{
  const button=event.target.closest('.pikmin');
  if(!button || game.state!=='playing' || event.button!==0 || button.disabled)return;
  const id=Number(button.dataset.id);
  if([...gestures.values()].some(g=>g.id===id))return;
  event.preventDefault();
  const gesture={id,button,from:{x:event.clientX,y:event.clientY,t:event.timeStamp},previous:selected};
  gestures.set(event.pointerId,gesture);button.setPointerCapture(event.pointerId);
  button.classList.add('is-held');setSelected(id);
});
units.addEventListener('pointermove',event=>{
  const g=gestures.get(event.pointerId);if(!g)return;
  const dx=clamp(event.clientX-g.from.x,-45,45),dy=clamp(event.clientY-g.from.y,-56,25);
  g.button.querySelector('img').style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${dx*.25}deg) scale(1.08)`;
});
function release(event,cancelled=false) {
  const g=gestures.get(event.pointerId);if(!g)return;
  gestures.delete(event.pointerId);g.button.classList.remove('is-held');
  if(g.button.hasPointerCapture(event.pointerId))g.button.releasePointerCapture(event.pointerId);
  if(!cancelled && isUpwardSwipe(g.from,{x:event.clientX,y:event.clientY,t:event.timeStamp}))launch(g.id);
  else{
    g.button.querySelector('img').style.transform='';
    if(cancelled){if(selected===g.id)setSelected(g.previous);}
    else{
      setSelected(g.id);
      const moved=Math.hypot(event.clientX-g.from.x,event.clientY-g.from.y)>12;
      $('#gesture-help').textContent=moved?'Swipe upward to fling. Or tap Feed selected for the same throw.':`${TYPE_NAMES[roster[g.id].type]} Pikmin selected. Swipe up, or tap Feed selected.`;
      if(moved){effect(g.button.querySelector('img'),[{transform:'translate(-50%,-50%) rotate(-8deg)'},{transform:'translate(-50%,-50%) rotate(6deg)'},{transform:'translate(-50%,-50%)'}],{duration:220});try{navigator.vibrate?.(18);}catch{}}
    }
  }
  $('#feed-selected').disabled=selected===null || game.state!=='playing' || [...gestures.values()].some(g=>g.id===selected);
}
units.addEventListener('pointerup',event=>release(event));
units.addEventListener('pointercancel',event=>release(event,true));
units.addEventListener('lostpointercapture',event=>release(event,true));
window.addEventListener('blur',()=>{for(const pointerId of [...gestures.keys()])release({pointerId},true);});
units.addEventListener('click',event=>{const button=event.target.closest('.pikmin');if(button && event.detail===0)launch(Number(button.dataset.id),true);});
units.addEventListener('keydown',event=>{const button=event.target.closest('.pikmin');if(button && event.key==='ArrowUp'){event.preventDefault();launch(Number(button.dataset.id),true);}});
$('#feed-selected').addEventListener('click',()=>{if(selected!==null)launch(selected);});
$('#start').addEventListener('click',event=>startRound(event.detail===0));
$('#again').addEventListener('click',event=>startRound(event.detail===0));
$('#reset').addEventListener('click',()=>{resetRound();$('#start').focus({preventScroll:true});announce('Round reset. Timer and Pikmin are ready.');});
$('#change-count').addEventListener('click',()=>{resetRound();$('#count-options').scrollIntoView({block:'center',behavior:'auto'});$('#count-options input:checked').focus({preventScroll:true});});
$('#count-options').addEventListener('change',event=>{if(game.state!=='playing')resetRound(Number(event.target.value));});
resetRound();

Promise.all(TYPES.map(type=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=source(type);}))).then(loaded=>{
  assetsReady=loaded.every(Boolean);$('#start').disabled=!assetsReady;
  $('#start').textContent=assetsReady?'Start game ↗':'Artwork unavailable';
  if(!assetsReady)$('#control-note').textContent='Some Pikmin could not load. Refresh to try again.';
});

if('serviceWorker' in navigator && window.isSecureContext)window.addEventListener('load',async()=>{
  try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready to play offline. Add Pikmin Fling to your home screen.';}
  catch{$('#offline-status').textContent='Online play is ready. Add Pikmin Fling to your home screen.';}
});
