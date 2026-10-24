import {FlingGame,ROUND_LIMIT,POINTS} from './game.js';
import {createRoster,walkRoster,TYPE_NAMES,PointerGesture,DoubleTap,distanceToSegment,flightPoint} from './interaction.js';
import {readLeaderboard,saveLeaderboard,addResult} from './leaderboard.js';
import {animateChange,reducedMotion} from '../../grid-rush/src/playground-ui.js';
import {createSprite} from './sprites.js';

const $=selector=>document.querySelector(selector);
$('#toggle-badges').addEventListener('click',()=>{
  const visible=$('#toggle-badges').getAttribute('aria-pressed')!=='true';
  $('.play-panel').dataset.badgesVisible=String(visible);
  $('#toggle-badges').setAttribute('aria-pressed',String(visible));
  $('#toggle-badges').textContent=visible?'Hide icons':'Show icons';
});
const game=new FlingGame(),world=$('#world'),units=$('#units'),plant=$('#plant');
const flights=new Map(),gestures=new Map(),effects=new Set(),taps=new DoubleTap();
const growthNames={leaf:'Normal',bud:'Bud',flower:'Flower'};
const modeNames={normal:'Normal',challenge:'Challenge',timed:'30s Rush'};
const hints={leaf:'Fling upward.',bud:'Double-tap to feed.',flower:'Hold still for 0.6 seconds until the ring fills, then fling upward.'};
const symbols={leaf:'↗',bud:'2×',flower:'✿'};
let storage;
try{storage=window.localStorage;}catch{/* In-memory records still work. */}
let {records,available:storageAvailable}=readLeaderboard(storage);
let roster=[],buttons=[],selected=null,newRank=null,frame=0,assetsReady=false;
let bite=null,nom=null,lastFrame=0,fieldWidth=0,fieldHeight=0,unitHeight=58,cycle=0;
let deadlineTimer=0,scoreFrame=0,scorePulse=null,scoreGain=null;
let savedScroll=0;
const resetHome=$('#reset').parentElement;
function setPlayLock(playing) {
  const locked=playing&&matchMedia('(max-width:760px), (pointer:coarse)').matches;
  if(locked===document.body.classList.contains('play-locked'))return;
  if(locked){
    savedScroll=window.scrollY;
    // Cancel result scrolling before entering a new viewport-sized play session.
    window.scrollTo({top:savedScroll,behavior:'instant'});
    $('.garden-tools').append($('#reset'));$('#reset').textContent='End round';
  }
  document.documentElement.classList.toggle('play-locked',locked);
  document.body.classList.toggle('play-locked',locked);
  for(const element of document.querySelectorAll('.site-top,.intro,.sidebar,main>footer'))element.inert=locked;
  if(locked){window.scrollTo({top:0,behavior:'instant'});$('.play-panel').scrollTop=0;world.scrollTop=0;}
  if(!locked){
    resetHome.insertBefore($('#reset'),$('#control-note'));$('#reset').textContent='Reset round';
    window.scrollTo({top:savedScroll,behavior:'instant'});
  }
}
// A non-passive fallback also blocks single-finger rubber-banding in mobile Safari.
document.addEventListener('touchmove',event=>{
  if(document.body.classList.contains('play-locked')&&event.touches.length===1&&event.cancelable)event.preventDefault();
},{passive:false});
window.addEventListener('resize',()=>setPlayLock(game.state==='playing'));
const seconds=time=>(time/1000).toFixed(2);
const announce=text=>{$('#announcements').textContent=text;};
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const point=event=>({x:event.clientX,y:event.clientY,t:performance.now()});
const busy=id=>[...gestures.values()].some(g=>g.ids.includes(id));

function renderUnit(id) {
  const button=buttons[id],unit=game.units[id];
  button.dataset.growth=unit.growth;button.dataset.type=roster[id].type;
  const previous=button.querySelector('.pikmin-art'),sprite=createSprite(unit.type,unit.growth);
  if(previous)previous.replaceWith(sprite);else button.prepend(sprite);
  button.querySelector('.growth-badge').textContent=symbols[unit.growth];
  button.setAttribute('aria-label',`${TYPE_NAMES[roster[id].type]} ${growthNames[unit.growth]} Pikmin ${id+1}.${game.mode==='timed'?` Worth ${POINTS[unit.growth]} points.`:''} ${hints[unit.growth]} Keyboard: Enter to feed.`);
}
function positionUnits() {
  const now=performance.now()/1000;
  for(const unit of roster){
    const button=buttons[unit.id],moving=game.state==='playing'&&!reducedMotion.matches&&!button.classList.contains('is-paused')&&!button.classList.contains('is-held');
    button.style.transform=`translate(${unit.x-22}px,${unit.y-unitHeight/2}px)`;
    const flying=unit.type==='winged',phase=unit.gait??0;
    button.style.setProperty('--stride',`${moving?Math.sin(phase)*(flying?4:14):0}deg`);
    button.style.setProperty('--bob',`${moving?(flying?Math.sin(now*3+unit.id)*1.5:-Math.abs(Math.sin(phase))*.7):0}px`);
    button.style.setProperty('--lift',`${flying?-6:0}px`);
    button.style.setProperty('--flap',moving&&flying?String(.5+.5*Math.sin(now*30+unit.id)):'.5');
    button.style.setProperty('--lean',`${moving?unit.vx/24*2:0}deg`);
    button.style.setProperty('--look',`${unit.vx/24*1.2}px`);
  }
}
function renderRoster() {
  fieldWidth=units.clientWidth;fieldHeight=units.clientHeight;
  unitHeight=parseFloat(getComputedStyle(units).getPropertyValue('--pikmin-height'))||58;
  roster=createRoster(fieldWidth,fieldHeight,Math.random,unitHeight);
  for(const unit of roster)unit.type=game.units[unit.id].type;
  buttons=[];
  const fragment=document.createDocumentFragment();
  for(const unit of roster) {
    const button=document.createElement('button');button.type='button';button.className='pikmin';
    button.dataset.id=unit.id;button.disabled=game.state!=='playing';button.setAttribute('aria-pressed','false');
    button.style.setProperty('--walk-delay',`${-Math.random()*1000}ms`);
    const badge=document.createElement('span');badge.className='growth-badge';badge.setAttribute('aria-hidden','true');
    const ring=document.createElement('span');ring.className='hold-ring';ring.setAttribute('aria-hidden','true');
    button.append(badge,ring);buttons.push(button);fragment.append(button);renderUnit(unit.id);
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
  const timed=game.mode==='timed';
  const fragment=document.createDocumentFragment();
  records[game.mode].forEach((record,index)=>{
    const row=document.createElement('li');row.className=`record${newRank===index+1?' is-new':''}`;
    const rank=document.createElement('span');rank.className='record-rank';rank.textContent=String(index+1).padStart(2,'0');
    const score=document.createElement('span');score.className='record-score';score.append(document.createTextNode(timed?record.score:seconds(record.time)));
    const suffix=document.createElement('small');suffix.textContent=timed?'pts':'s';score.append(suffix);
    if(newRank===index+1){const badge=document.createElement('span');badge.className='record-new';badge.textContent='NEW RECORD';score.append(badge);}
    const date=document.createElement('time');date.className='record-date';date.dateTime=record.date;
    date.textContent=new Date(record.date).toLocaleDateString(document.documentElement.lang,{month:'short',day:'numeric'});
    row.append(rank,score,date);fragment.append(row);
  });
  if(!fragment.childNodes.length){const row=document.createElement('li');row.className='empty-records';row.textContent=timed?'Thirty seconds. Make every Pikmin count. Set your first score.':'A clean garden deserves a record. Set your first time.';fragment.append(row);}
  $('#records').replaceChildren(fragment);$('#records-count').textContent=modeNames[game.mode].toUpperCase();
  $('#records-title').textContent=timed?'Your highest three':'Your fastest three';
  $('#records').setAttribute('aria-label',timed?'Highest total scores':'Fastest completion times');
  $('#storage-status').textContent=storageAvailable?'Saved on this device.':'Storage is unavailable. Records stay for this visit.';
}

function renderProgress() {
  $('#timer').textContent=seconds(game.mode==='timed'?game.remainingTime:game.elapsed);
  $('.scoreboard').classList.toggle('is-urgent',game.mode==='timed'&&game.state==='playing'&&game.remainingTime<=5000);
  $('#fed').textContent=game.progress;$('#total').textContent=game.count;
  $('#progress').max=game.count;$('#progress').value=game.progress;
  for(const [growth,count] of Object.entries(game.growthCounts))$(`#${growth}-count`).textContent=count;
  $('#phase').textContent=game.state==='playing'?'FEEDING TIME':game.state==='completed'?(game.endReason==='timeout'?"TIME’S UP":'CLEAN SWEEP'):'READY TO FLING';
}

function cancelEffects() {
  for(const animation of effects)animation.cancel();effects.clear();
}
function effect(target,keyframes,options) {
  if(reducedMotion.matches)return null;
  const animation=target.animate(keyframes,options);effects.add(animation);
  animation.finished.catch(()=>{}).finally(()=>effects.delete(animation));return animation;
}
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches){cancelEffects();cancelAnimationFrame(scoreFrame);scoreFrame=0;$('#score').textContent=game.score;}});
function addScoreFeedback(points) {
  const output=$('#score'),target=game.score,from=Number(output.textContent),started=performance.now();
  output.setAttribute('aria-label',`Score: ${target} points`);
  announce(`${game.progress} of 30 fed. ${target} points.`);
  cancelAnimationFrame(scoreFrame);scorePulse?.cancel();scoreGain?.cancel();
  if(reducedMotion.matches){output.textContent=target;return;}
  // Retarget from the visible number so simultaneous arrivals never run competing counters.
  const count=now=>{
    const t=Math.min(1,(now-started)/260);
    output.textContent=Math.round(from+(target-from)*(1-(1-t)**3));
    scoreFrame=t<1?requestAnimationFrame(count):0;
  };
  scoreFrame=requestAnimationFrame(count);
  scorePulse=effect(output,[{transform:'scale(1)'},{transform:'scale(1.14)',offset:.35},{transform:'scale(1)'}],{duration:300,easing:'ease-out'});
  $('#score-gain').textContent=`+${points}`;
  scoreGain=effect($('#score-gain'),[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'translateY(-3px)',offset:.2},{opacity:0,transform:'translateY(-20px)'}],{duration:650,easing:'ease-out'});
}
function chomp() {
  bite?.cancel();nom?.cancel();
  bite=effect($('#plant-head'),[{transform:'scale(1)'},{transform:'scale(1.1,.82)',offset:.3},{transform:'scale(.98,1.04)',offset:.7},{transform:'scale(1)'}],{duration:260,easing:'ease-out'});
  nom=effect($('#chomp-word'),[{opacity:0,transform:'translateY(7px) rotate(9deg) scale(.8)'},{opacity:1,transform:'translateY(0) rotate(9deg) scale(1)',offset:.25},{opacity:1,offset:.65},{opacity:0,transform:'translateY(-8px) rotate(9deg) scale(.95)'}],{duration:380,easing:'ease-out'});
}

function resetRound(mode=game.mode,playing=false) {
  cancelAnimationFrame(frame);frame=0;lastFrame=0;
  clearTimeout(deadlineTimer);deadlineTimer=0;cancelAnimationFrame(scoreFrame);scoreFrame=0;
  for(const pointerId of [...gestures.keys()])release({pointerId},true);
  taps.clear();gestures.clear();flights.clear();$('#flights').replaceChildren();$('#chains').replaceChildren();cancelEffects();
  game.reset(mode);selected=null;newRank=null;cycle=0;plant.classList.remove('is-open');world.classList.remove('is-playing');
  const timed=mode==='timed';
  $('.scoreboard').classList.toggle('is-timed',timed);$('#score-panel').hidden=!timed;
  $('#score').textContent='0';$('#score').setAttribute('aria-label','Score: 0 points');$('#score-gain').textContent='';
  $('#time-label').textContent=timed?'TIME LEFT':'YOUR TIME';$('#timer').setAttribute('aria-label',timed?'Seconds remaining':'Elapsed seconds');
  for(const label of document.querySelectorAll('.point-value'))label.hidden=!timed;
  if($('#results').contains(document.activeElement))document.activeElement.blur();
  $('#results').hidden=true;$('#mode-options').disabled=false;
  world.scrollTop=0;$('.play-panel').scrollTop=0;
  $('#start').hidden=false;$('#reset').hidden=true;
  $('#gesture-help').textContent='Short press 0.2s, keep pressed and drag through the same colour and stage, then flick up to feed the whole chain.';
  $('#garden-label').textContent='THE LUNCH CROWD';$('#cycle-timer').textContent='';
  $('#cycle-status').textContent=mode==='normal'?'Normal mode · states stay the same':`${modeNames[mode]} · growth changes every 3–8s`;
  $('#control-note').textContent=timed?'30 seconds. Normal 1 pt · Bud 2 pts · Flower 3 pts. Score on arrival; clear all 30 to finish early. Growth changes every 3–8s.':'Red, Yellow, Blue, Ice, Rock, Winged and White Pikmin mix randomly. Start with 20 normal, 5 buds and 5 flowers.';
  setPlayLock(playing);renderRoster();renderProgress();setSelected(null);renderRecords();
}
function startRound(keyboard=false) {
  if(!assetsReady)return;
  resetRound(game.mode,true);game.start();
  if(game.mode==='timed')deadlineTimer=setTimeout(()=>{if(game.expire()){renderProgress();finishRound();}},ROUND_LIMIT);
  for(const button of buttons)button.disabled=false;
  $('#mode-options').disabled=true;$('#start').hidden=true;$('#reset').hidden=false;world.classList.add('is-playing');
  $('#garden-label').textContent='HOLD. LINK. FLING.';
  renderProgress();if(!document.body.classList.contains('play-locked'))$('.scoreboard').scrollIntoView({block:'start',behavior:'auto'});
  if(keyboard)buttons[0].focus({preventScroll:true});
  announce(`30 Pikmin. ${modeNames[game.mode]} mode. ${game.mode==='timed'?'30-second countdown started. Normal 1 point, bud 2 points, flower 3 points.':'Timer started.'} 20 normal, 5 buds, 5 flowers.`);
  frame=requestAnimationFrame(tick);
}
function finishRound() {
  if(!$('#results').hidden)return;
  cancelAnimationFrame(frame);frame=0;clearTimeout(deadlineTimer);deadlineTimer=0;cancelGestures();
  flights.clear();$('#flights').replaceChildren();plant.classList.remove('is-open');
  for(const button of buttons)button.disabled=true;
  setPlayLock(false);
  const timed=game.mode==='timed',timeout=game.endReason==='timeout';
  const result=addResult(records,game.mode,timed?game.score:game.elapsed);records=result.records;newRank=result.rank;
  storageAvailable=saveLeaderboard(storage,records)&&storageAvailable;
  $('#final-time').textContent=timed?game.score:seconds(game.elapsed);$('#result-unit').textContent=timed?'pts':'s';
  $('#result-title').textContent=timeout?'Time’s up.':'Garden cleared.';
  $('#result-badge').textContent=result.personalBest?'NEW PERSONAL BEST!':newRank?`TOP THREE / #${newRank}`:timed?'NICE FEEDING!':'CLEAN SWEEP';
  $('#result-note').textContent=timed?`${game.progress} of ${game.count} Pikmin fed in ${seconds(game.elapsed)}s. ${result.personalBest?'Your highest score yet.':newRank?'A new spot in your highest three.':'Every Pikmin counts. Try for a higher score!'}`:`All ${game.count} Pikmin fed. ${result.personalBest?'Your quickest clean-up yet.':newRank?'A new spot in your fastest three.':'One hungry plant, one very tidy garden.'}`;
  $('#results').hidden=false;renderRecords();setSelected(null);
  $('#garden-label').textContent=timeout?'A LITTLE BREAK. A BIG APPETITE.':'ONE VERY HAPPY PLANT';
  world.classList.remove('is-playing');$('#cycle-timer').textContent='';
  if(timed){
    $('#cycle-status').textContent=`${timeout?'Time’s up':'Garden cleared'} · ${game.score} points`;
    $('#gesture-help').textContent='Round finished. Play again for a fresh countdown, or choose another mode.';
  }
  animateChange($('#results'));$('#result-title').focus({preventScroll:true});
  $('#results').scrollIntoView({block:'center',behavior:reducedMotion.matches?'auto':'smooth'});
  announce(timed?`${timeout?'Time is up.':'Garden cleared.'} ${game.progress} of 30 fed. Final score ${game.score} points. ${$('#result-badge').textContent}`:`Garden cleared in ${seconds(game.elapsed)} seconds. ${$('#result-badge').textContent}`);
}

function renderGestures(now) {
  if(!gestures.size)return;
  const rect=units.getBoundingClientRect(),fragment=document.createDocumentFragment();
  $('#chains').setAttribute('viewBox',`0 0 ${fieldWidth} ${fieldHeight}`);
  for(const g of gestures.values()) {
    const wasChain=g.chaining,wasCharged=g.charged;g.update(now);
    g.button.style.setProperty('--hold',`${Math.min(1,g.held/g.holdTarget)*360}deg`);
    g.button.classList.toggle('is-charged',g.charged && g.growth==='flower');
    if(g.chaining) {
      for(const id of g.ids)buttons[id].classList.add('is-linked');
      if(!wasChain||g.growth==='flower'&&!wasCharged&&g.charged){
        $('#gesture-help').textContent=g.growth==='flower'&&g.charged?'Flower charged. Flick up, or drag through flowers of the same colour to link.':`Link ready. Keep pressed and drag through more ${TYPE_NAMES[g.type]} ${growthNames[g.growth].toLowerCase()} Pikmin, then flick up.${g.growth==='flower'?' A single flower needs a full 0.6-second hold.':''}`;
        try{navigator.vibrate?.(10);}catch{}
      }
      const line=document.createElementNS('http://www.w3.org/2000/svg','polyline');
      line.setAttribute('points',[...g.ids.map(id=>`${roster[id].x},${roster[id].y}`),`${g.last.x-rect.x},${g.last.y-rect.y}`].join(' '));
      fragment.append(line);
    }
  }
  $('#chains').replaceChildren(fragment);
}
function tick(now) {
  frame=0;taps.expire(now);renderGestures(now);
  const frozen=protectedIds();
  const changed=game.advance(frozen);
  if(game.state==='completed'){renderProgress();finishRound();return;}
  if(changed.length){
    cycle++;for(const id of changed){renderUnit(id);effect(buttons[id].querySelector('.growth-badge'),[{transform:'scale(.7)'},{transform:'scale(1.2)',offset:.6},{transform:'scale(1)'}],{duration:300});}
    $('#cycle-status').textContent=`Growth wave ${cycle} · ${changed.length} changed`;
  }
  if(game.mode!=='normal')$('#cycle-timer').textContent=`Next in ${Math.max(0,Math.ceil((game.nextChange-now)/1000))}s`;
  const ready=roster.filter(p=>game.units[p.id].status==='ready');
  if(!reducedMotion.matches)walkRoster(ready,lastFrame?(now-lastFrame)/1000:0,fieldWidth,fieldHeight,frozen,Math.random,unitHeight);
  for(const unit of ready)buttons[unit.id].classList.toggle('is-paused',frozen.has(unit.id));
  lastFrame=now;positionUnits();
  const bounds=world.getBoundingClientRect(),mouth=$('#mouth-target').getBoundingClientRect();
  const target={x:mouth.x+mouth.width/2-bounds.x,y:mouth.y+mouth.height/2-bounds.y};
  let arrivals=0;const previousScore=game.score;
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
  if(game.score>previousScore)addScoreFeedback(game.score-previousScore);
  renderProgress();
  if(game.state==='completed')finishRound();
  else if(game.state==='playing')frame=requestAnimationFrame(tick);
}
function launch(ids,action,keyboard=false) {
  if(ids.some(busy)||!game.launch(ids,action))return false;
  const bounds=world.getBoundingClientRect();
  for(const id of ids) {
    const button=buttons[id],imageBounds=button.querySelector('.pikmin-art').getBoundingClientRect();
    const from={x:(imageBounds.x+imageBounds.width/2-bounds.x)/bounds.width,y:(imageBounds.y+imageBounds.height/2-bounds.y)/bounds.height};
    const image=button.querySelector('.pikmin-art').cloneNode(true);image.setAttribute('class','pikmin-art flying-pikmin');
    image.style.transform=`translate(${from.x*bounds.width}px,${from.y*bounds.height}px) translate(-50%,-50%)`;
    $('#flights').append(image);flights.set(id,{image,from,turn:from.x<.5?-45:45,started:performance.now()});
    button.disabled=true;button.classList.add('is-gone');button.querySelector('.pikmin-art').style.transform='';
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
  const g=new PointerGesture(id,game.units[id].growth,point(event),game.units[id].type);g.button=button;g.previous=selected;
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
      if(distanceToSegment({x:rect.x+unit.x,y:rect.y+unit.y},previous,p)<=24 && g.add(unit.id,game.units[unit.id].growth,game.units[unit.id].type)) {
        buttons[unit.id].classList.add('is-linked');
        $('#gesture-help').textContent=`${g.ids.length} linked. Keep tracing ${TYPE_NAMES[g.type]} ${growthNames[g.growth].toLowerCase()} Pikmin, then flick up.`;
      }
    }
  }else{
    const dx=clamp(p.x-g.from.x,-35,35),dy=clamp(p.y-g.from.y,-48,20);
    g.button.querySelector('.pikmin-art').style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) rotate(${dx*.25}deg) scale(1.08)`;
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
    $('#gesture-help').textContent=g.chaining&&(g.growth!=='flower'||g.ids.length>1)?'Chain released. Short press 0.2s, drag through the same colour and stage, then finish with an upward flick.':hints[g.growth];
    if(g.moved){try{navigator.vibrate?.(18);}catch{}}
  }
  g.button.querySelector('.pikmin-art').style.transform='';
  if(cancelled){taps.clear();if(selected===g.ids[0])setSelected(g.previous);}
  else if(!launched)setSelected(g.ids[0]);
  $('#feed-selected').disabled=selected===null || game.state!=='playing' || busy(selected);
  $('#chains').replaceChildren();
}
units.addEventListener('pointerup',event=>release(event));
units.addEventListener('pointercancel',event=>release(event,true));
units.addEventListener('lostpointercapture',event=>release(event,true));
for(const type of ['selectstart','dragstart','contextmenu'])$('#pen').addEventListener(type,event=>event.preventDefault());
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
$('#reset').addEventListener('click',()=>{
  const wasLocked=document.body.classList.contains('play-locked');resetRound();
  if(wasLocked)$('#mode-options').scrollIntoView({block:'center',behavior:'auto'});
  $('#start').focus({preventScroll:true});announce('Round reset. Timer and Pikmin are ready.');
});
$('#change-mode').addEventListener('click',()=>{resetRound();$('#mode-options').scrollIntoView({block:'center',behavior:'auto'});$('#mode-options input:checked').focus({preventScroll:true});});
$('#mode-options').addEventListener('change',event=>{if(game.state!=='playing')resetRound(event.target.value);});
new ResizeObserver(()=>{
  const width=units.clientWidth,height=units.clientHeight;
  if(!fieldWidth||!fieldHeight||width===fieldWidth&&height===fieldHeight)return;
  cancelGestures();
  unitHeight=parseFloat(getComputedStyle(units).getPropertyValue('--pikmin-height'))||58;
  // Repack on phone rotation instead of compressing six rows into a short field.
  const layout=document.body.classList.contains('play-locked')?createRoster(width,height,Math.random,unitHeight):null;
  for(const p of roster){
    p.x=layout?layout[p.id].x:clamp(p.x/fieldWidth*width,22,width-22);
    p.y=layout?layout[p.id].y:clamp(p.y/fieldHeight*height,unitHeight/2,height-unitHeight/2);
  }
  fieldWidth=width;fieldHeight=height;positionUnits();
}).observe(units);
resetRound();
assetsReady=true;$('#start').disabled=false;$('#start').textContent='Start game ↗';
if('serviceWorker' in navigator && window.isSecureContext)window.addEventListener('load',async()=>{
  try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready to play offline. Add Pikmin Fling to your home screen.';}
  catch{$('#offline-status').textContent='Online play is ready. Add Pikmin Fling to your home screen.';}
});
