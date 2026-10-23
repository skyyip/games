import {FlingGame,GROWTH,CHAIN_HOLD} from './game.js';
import {createRoster,walkRoster,TYPES,TYPE_NAMES,PointerGesture,DoubleTap,distanceToSegment,flightPoint} from './interaction.js';
import {readLeaderboard,saveLeaderboard,addResult} from './leaderboard.js';
import {animateChange,reducedMotion} from '../../grid-rush/src/playground-ui.js';

const $=selector=>document.querySelector(selector);
const game=new FlingGame(),world=$('#world'),units=$('#units'),plant=$('#plant');
const flights=new Map(),gestures=new Map(),effects=new Set(),taps=new DoubleTap();
const growthNames={leaf:'Normal',bud:'Bud',flower:'Flower'};
const hints={leaf:'Fling upward.',bud:'Double-tap to feed.',flower:'Hold still until the ring lights up, then fling upward.'};
const symbols={leaf:'↗',bud:'2×',flower:'✿'};
let storage;
try{storage=window.localStorage;}catch{/* In-memory records still work. */}
let {records,available:storageAvailable}=readLeaderboard(storage);
let roster=[],buttons=[],selected=null,newRank=null,frame=0,assetsReady=false;
let bite=null,nom=null,lastFrame=0,fieldWidth=0,fieldHeight=0,cycle=0;
const seconds=time=>(time/1000).toFixed(2);
const announce=text=>{$('#announcements').textContent=text;};
const source=(type,growth)=>`./assets/pikmin/${type}-${growth}.png`;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const point=event=>({x:event.clientX,y:event.clientY,t:performance.now()});
const busy=id=>[...gestures.values()].some(g=>g.ids.includes(id));

function renderUnit(id) {
  const button=buttons[id],unit=game.units[id];
  button.dataset.growth=unit.growth;
  button.querySelector('img').src=source(roster[id].type,unit.growth);
  button.querySelector('.growth-badge').textContent=symbols[unit.growth];
  button.setAttribute('aria-label',`${TYPE_NAMES[roster[id].type]} ${growthNames[unit.growth]} Pikmin ${id+1}. ${hints[unit.growth]} Keyboard: Enter to feed.`);
}
function positionUnits() {
  for(const unit of roster)buttons[unit.id].style.transform=`translate(${unit.x-22}px,${unit.y-29}px)`;
}
function renderRoster() {
  fieldWidth=units.clientWidth;fieldHeight=units.clientHeight;
  roster=createRoster(fieldWidth,fieldHeight);buttons=[];
  const fragment=document.createDocumentFragment();
  for(const unit of roster) {
    const button=document.createElement('button');button.type='button';button.className='pikmin';
    button.dataset.id=unit.id;button.disabled=game.state!=='playing';button.setAttribute('aria-pressed','false');
    button.style.setProperty('--walk-delay',`${-Math.random()*1000}ms`);
    const image=document.createElement('img');image.alt='';image.draggable=false;image.width=54;image.height=66;
    const badge=document.createElement('span');badge.className='growth-badge';badge.setAttribute('aria-hidden','true');
    const ring=document.createElement('span');ring.className='hold-ring';ring.setAttribute('aria-hidden','true');
    button.append(image,badge,ring);buttons.push(button);fragment.append(button);renderUnit(unit.id);
  }
  units.replaceChildren(fragment);positionUnits();
}
function setSelected(id) {
  selected=id!==null && game.units[id]?.status==='ready'?id:null;
  for(const button of buttons)button.setAttribute('aria-pressed',String(Number(button.dataset.id)===selected));
  $('#feed-selected').disabled=selected===null || game.state!=='playing' || busy(selected);
}
function protectedIds() {
  const ids=new Set([...gestures.values()].flatMap(g=>g.ids));
  if(taps.pending)ids.add(taps.pending.id);
  if(selected!==null)ids.add(selected);
  if(document.activeElement?.matches('.pikmin'))ids.add(Number(document.activeElement.dataset.id));
  return ids;
}
function renderRecords() {
  const fragment=document.createDocumentFragment();
  records[game.mode].forEach((record,index)=>{
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
  $('#records').replaceChildren(fragment);$('#records-count').textContent=game.mode.toUpperCase();
  $('#storage-status').textContent=storageAvailable?'Saved on this device.':'Storage is unavailable. Records stay for this visit.';
}

function renderProgress() {
  $('#timer').textContent=seconds(game.elapsed);
  $('#fed').textContent=game.progress;$('#total').textContent=game.count;
  $('#progress').max=game.count;$('#progress').value=game.progress;
  for(const [growth,count] of Object.entries(game.growthCounts))$(`#${growth}-count`).textContent=count;
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

function resetRound(mode=game.mode) {
  cancelAnimationFrame(frame);frame=0;lastFrame=0;
  for(const pointerId of [...gestures.keys()])release({pointerId},true);
  taps.clear();gestures.clear();flights.clear();$('#flights').replaceChildren();$('#chains').replaceChildren();cancelEffects();
  game.reset(mode);selected=null;newRank=null;cycle=0;plant.classList.remove('is-open');world.classList.remove('is-playing');
  $('#results').hidden=true;$('#mode-options').disabled=false;
  $('#start').hidden=false;$('#reset').hidden=true;
  $('#gesture-help').textContent='Follow each growth stage. Hold still for 0.5s to start a same-stage chain.';
  $('#garden-label').textContent='THE LUNCH CROWD';$('#cycle-timer').textContent='';
  $('#cycle-status').textContent=mode==='challenge'?'Challenge · growth changes every 3–8s':'Normal mode · states stay the same';
  renderRoster();renderProgress();setSelected(null);renderRecords();
}
function startRound(keyboard=false) {
  if(!assetsReady)return;
  resetRound();game.start();
  for(const button of buttons)button.disabled=false;
  $('#mode-options').disabled=true;$('#start').hidden=true;$('#reset').hidden=false;world.classList.add('is-playing');
  $('#garden-label').textContent='HOLD. LINK. FLING.';
  renderProgress();$('.scoreboard').scrollIntoView({block:'start',behavior:'auto'});
  if(keyboard)buttons[0].focus({preventScroll:true});
  announce(`30 Pikmin. ${game.mode} mode. Timer started. 20 normal, 5 buds, 5 flowers.`);
  frame=requestAnimationFrame(tick);
}
function finishRound() {
  const result=addResult(records,game.mode,game.elapsed);records=result.records;newRank=result.rank;
  storageAvailable=saveLeaderboard(storage,records)&&storageAvailable;
  $('#final-time').textContent=seconds(game.elapsed);
  $('#result-badge').textContent=result.personalBest?'NEW PERSONAL BEST!':newRank?`TOP THREE / #${newRank}`:'CLEAN SWEEP';
  $('#result-note').textContent=`All ${game.count} Pikmin fed. ${result.personalBest?'Your quickest clean-up yet.':newRank?'A new spot in your fastest three.':'One hungry plant, one very tidy garden.'}`;
  $('#results').hidden=false;renderRecords();setSelected(null);
  $('#garden-label').textContent='ONE VERY HAPPY PLANT';
  world.classList.remove('is-playing');$('#cycle-timer').textContent='';
  animateChange($('#results'));$('#result-title').focus({preventScroll:true});
  $('#results').scrollIntoView({block:'center',behavior:reducedMotion.matches?'auto':'smooth'});
  announce(`Garden cleared in ${seconds(game.elapsed)} seconds. ${$('#result-badge').textContent}`);
}

function renderGestures(now) {
  if(!gestures.size)return;
  const rect=units.getBoundingClientRect(),fragment=document.createDocumentFragment();
  $('#chains').setAttribute('viewBox',`0 0 ${fieldWidth} ${fieldHeight}`);
  for(const g of gestures.values()) {
    const wasChain=g.chaining,wasCharged=g.charged;g.update(now);
    g.button.style.setProperty('--hold',`${Math.min(1,g.held/CHAIN_HOLD)*360}deg`);
    g.button.classList.toggle('is-charged',g.charged && g.growth==='flower');
    if(g.chaining) {
      for(const id of g.ids)buttons[id].classList.add('is-linked');
      if(!wasChain){$('#gesture-help').textContent=`Chain ready. Trace more ${growthNames[g.growth].toLowerCase()} Pikmin, then flick up.`;try{navigator.vibrate?.(10);}catch{}}
      const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');
      line.setAttribute('points',[...g.ids.map(id=>`${roster[id].x},${roster[id].y}`),`${g.last.x-rect.x},${g.last.y-rect.y}`].join(' '));
      fragment.append(line);
    }else if(!wasCharged && g.charged && g.growth==='flower')$('#gesture-help').textContent='Flower ready — fling up! Keep holding to start a chain.';
  }
  $('#chains').replaceChildren(fragment);
}
function tick(now) {
  frame=0;taps.expire(now);renderGestures(now);
  const frozen=protectedIds();
  const changed=game.advance(frozen);
  if(changed.length){
    cycle++;for(const id of changed){renderUnit(id);effect(buttons[id].querySelector('.growth-badge'),[{transform:'scale(.7)'},{transform:'scale(1.2)',offset:.6},{transform:'scale(1)'}],{duration:300});}
    $('#cycle-status').textContent=`Growth wave ${cycle} · ${changed.length} changed`;
  }
  if(game.mode==='challenge')$('#cycle-timer').textContent=`Next in ${Math.max(0,Math.ceil((game.nextChange-now)/1000))}s`;
  const ready=roster.filter(p=>game.units[p.id].status==='ready');
  if(!reducedMotion.matches)walkRoster(ready,lastFrame?(now-lastFrame)/1000:0,fieldWidth,fieldHeight,frozen);
  for(const unit of ready)buttons[unit.id].classList.toggle('is-paused',frozen.has(unit.id));
  lastFrame=now;positionUnits();
  const bounds=world.getBoundingClientRect(),mouth=$('#mouth-target').getBoundingClientRect();
  const target={x:mouth.x-bounds.x,y:mouth.y-bounds.y};
  let arrivals=0;
  for(const [id,flight] of flights) {
    const t=Math.min(1,(now-flight.started)/480);
    if(t>=1) {
      flight.image.remove();flights.delete(id);if(game.arrive(id))arrivals++;
    }else{
      const from={x:flight.from.x*bounds.width,y:flight.from.y*bounds.height};
      const at=reducedMotion.matches?from:flightPoint(from,target,t);
      const turn=reducedMotion.matches?0:Math.sin(Math.PI*t)*flight.turn;
      flight.image.style.transform=`translate(${at.x}px,${at.y}px) translate(-50%,-50%) rotate(${turn}deg) scale(${reducedMotion.matches?1:1-.75*t**5})`;
      flight.image.style.opacity=reducedMotion.matches?1-t:1;
    }
  }
  plant.classList.toggle('is-open',flights.size>0);
  if(arrivals)chomp();
  renderProgress();
  if(game.state==='completed')finishRound();
  else if(game.state==='playing')frame=requestAnimationFrame(tick);
}
function launch(ids,action,keyboard=false) {
  if(ids.some(busy)||!game.launch(ids,action))return false;
  const bounds=world.getBoundingClientRect();
  for(const id of ids) {
    const button=buttons[id],imageBounds=button.querySelector('img').getBoundingClientRect();
    const from={x:(imageBounds.x+imageBounds.width/2-bounds.x)/bounds.width,y:(imageBounds.y+imageBounds.height/2-bounds.y)/bounds.height};
    const image=button.querySelector('img').cloneNode();image.className='flying-pikmin';
    image.style.transform=`translate(${from.x*bounds.width}px,${from.y*bounds.height}px) translate(-50%,-50%)`;
    $('#flights').append(image);flights.set(id,{image,from,turn:from.x<.5?-45:45,started:performance.now()});
    button.disabled=true;button.classList.add('is-gone');button.querySelector('img').style.transform='';
  }
  if(taps.pending && ids.includes(taps.pending.id))taps.clear();
  plant.classList.add('is-open');setSelected(null);
  $('#gesture-help').textContent=ids.length>1?`${ids.length} ${growthNames[game.units[ids[0]].growth].toLowerCase()} Pikmin, one lovely fling!`:'On the way to lunch. Keep them flying!';
  if(keyboard){const next=buttons.find(b=>!b.disabled);(next||$('#reset')).focus({preventScroll:true});}
  return true;
}

units.addEventListener('pointerdown',event=>{
  const button=event.target.closest('.pikmin');
  if(!button || game.state!=='playing' || event.button!==0 || button.disabled)return;
  const id=Number(button.dataset.id);if(busy(id))return;
  event.preventDefault();
  const g=new PointerGesture(id,game.units[id].growth,point(event));g.button=button;g.previous=selected;
  gestures.set(event.pointerId,g);button.setPointerCapture(event.pointerId);button.classList.add('is-held');
  setSelected(id);$('#gesture-help').textContent=hints[g.growth];
});
units.addEventListener('pointermove',event=>{
  const g=gestures.get(event.pointerId);if(!g)return;
  const previous=g.last,p=point(event);g.move(p);
  if(g.chaining) {
    const rect=units.getBoundingClientRect();
    for(const unit of roster) {
      if(game.units[unit.id].status!=='ready'||busy(unit.id))continue;
      if(distanceToSegment({x:rect.x+unit.x,y:rect.y+unit.y},previous,p)<=24 && g.add(unit.id,game.units[unit.id].growth)) {
        buttons[unit.id].classList.add('is-linked');
        $('#gesture-help').textContent=`${g.ids.length} linked. Keep tracing ${growthNames[g.growth].toLowerCase()} Pikmin, then flick up.`;
      }
    }
  }else{
    const dx=clamp(p.x-g.from.x,-35,35),dy=clamp(p.y-g.from.y,-48,20);
    g.button.querySelector('img').style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${dx*.25}deg) scale(1.08)`;
  }
});
function release(event,cancelled=false) {
  const g=gestures.get(event.pointerId);if(!g)return;
  gestures.delete(event.pointerId);
  if(g.button.hasPointerCapture(event.pointerId))g.button.releasePointerCapture(event.pointerId);
  for(const id of g.ids){buttons[id].classList.remove('is-held','is-linked','is-charged');buttons[id].style.removeProperty('--hold');}
  const end=cancelled?null:point(event),action=cancelled?null:g.action(end);
  let launched=action && launch(g.ids,action);
  if(!cancelled && !launched && g.growth==='bud' && g.isTap(end)) {
    if(taps.tap(g.ids[0],end.t))launched=launch([g.ids[0]],{kind:'double-tap'});
    else $('#gesture-help').textContent='One more tap on this bud!';
  }else if(!launched && !cancelled){
    taps.clear();
    $('#gesture-help').textContent=g.chaining?'Chain released. Hold still to link again, then finish with a quick upward flick.':hints[g.growth];
    if(g.moved){try{navigator.vibrate?.(18);}catch{}}
  }
  g.button.querySelector('img').style.transform='';
  if(cancelled){taps.clear();if(selected===g.ids[0])setSelected(g.previous);}
  else if(!launched)setSelected(g.ids[0]);
  $('#feed-selected').disabled=selected===null || game.state!=='playing' || busy(selected);
  $('#chains').replaceChildren();
}
units.addEventListener('pointerup',event=>release(event));
units.addEventListener('pointercancel',event=>release(event,true));
units.addEventListener('lostpointercapture',event=>release(event,true));
units.addEventListener('contextmenu',event=>event.preventDefault());
const cancelGestures=()=>{for(const pointerId of [...gestures.keys()])release({pointerId},true);taps.clear();};
window.addEventListener('blur',cancelGestures);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelGestures();});
units.addEventListener('click',event=>{const button=event.target.closest('.pikmin');if(button && event.detail===0)launch([Number(button.dataset.id)],{kind:'accessible'},true);});
units.addEventListener('keydown',event=>{
  const button=event.target.closest('.pikmin');
  if(button && event.key==='ArrowUp'){event.preventDefault();launch([Number(button.dataset.id)],{kind:'accessible'},true);}
});
window.addEventListener('keydown',event=>{
  if(event.key==='Escape'){cancelGestures();setSelected(null);}
});
$('#feed-selected').addEventListener('click',()=>{if(selected!==null)launch([selected],{kind:'accessible'});});
$('#start').addEventListener('click',event=>startRound(event.detail===0));
$('#again').addEventListener('click',event=>startRound(event.detail===0));
$('#reset').addEventListener('click',()=>{resetRound();$('#start').focus({preventScroll:true});announce('Round reset. Timer and Pikmin are ready.');});
$('#change-mode').addEventListener('click',()=>{resetRound();$('#mode-options').scrollIntoView({block:'center',behavior:'auto'});$('#mode-options input:checked').focus({preventScroll:true});});
$('#mode-options').addEventListener('change',event=>{if(game.state!=='playing')resetRound(event.target.value);});
new ResizeObserver(()=>{
  const width=units.clientWidth,height=units.clientHeight;
  if(!fieldWidth||!fieldHeight||width===fieldWidth&&height===fieldHeight)return;
  cancelGestures();
  for(const p of roster){p.x=clamp(p.x/fieldWidth*width,22,width-22);p.y=clamp(p.y/fieldHeight*height,29,height-29);}
  fieldWidth=width;fieldHeight=height;positionUnits();
}).observe(units);
resetRound();
Promise.all(TYPES.flatMap(type=>GROWTH.map(growth=>new Promise(resolve=>{
  const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=source(type,growth);
})))).then(loaded=>{
  assetsReady=loaded.every(Boolean);$('#start').disabled=!assetsReady;
  $('#start').textContent=assetsReady?'Start game ↗':'Artwork unavailable';
  if(!assetsReady)$('#control-note').textContent='Some Pikmin could not load. Refresh to try again.';
});
if('serviceWorker' in navigator && window.isSecureContext)window.addEventListener('load',async()=>{
  try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready to play offline. Add Pikmin Fling to your home screen.';}
  catch{$('#offline-status').textContent='Online play is ready. Add Pikmin Fling to your home screen.';}
});
