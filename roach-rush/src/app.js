import {RoachGame,HOLES,MOUSE_HOLD,SWIPE_DISTANCE,ANT_PENALTY,DURATIONS,distanceToSegment,antFlick} from './game.js';
import {sprite,cageMarkup,sprayMarkup,trapMarkup} from './sprites.js';
import {readRecords,addRecord} from './records.js';
import {animateChange,reducedMotion} from '../../grid-rush/src/playground-ui.js';
const $=selector=>document.querySelector(selector),room=$('#room'),entities=$('#entities'),cage=$('#cage');
const game=new RoachGame(),buttons=new Map(),positions=new Map(),gestures=new Map();
let frame=0,deadline=0,previousScore=null,savedScroll=0,keyboardGrab=null,layout,tenAnnounced=false;
let cageAnimation=null,cageBusy=false,cageRevision=0;
let toolGesture=null;const cloudTimers=new Map(),trapNodes=new Map();
let records={60:[],120:[],180:[]},storage;
try{storage=localStorage;records=readRecords(storage.getItem('roach-rush.records.v3'),storage.getItem('roach-rush.best.v1'),storage.getItem('roach-rush.records.v2'));}catch{storage=null;$('#records-note').textContent='Records last for this visit; device storage is unavailable.';}
const announce=text=>{$('#announcements').textContent=text;};
const hint=text=>{if($('#gesture-help').textContent!==text)$('#gesture-help').textContent=text;};
const clock=milliseconds=>{const seconds=Math.ceil(milliseconds/1000);return `${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;};
function renderRecords(){
  for(const duration of DURATIONS){
    const list=$(`#records-${duration}`);list.replaceChildren();
    if(!records[duration].length){const row=document.createElement('li');row.className='empty-record';row.textContent='Your first clean-up is waiting.';list.append(row);continue;}
    records[duration].forEach((record,index)=>{const row=document.createElement('li'),rank=document.createElement('span'),score=document.createElement('strong'),unit=document.createElement('small');row.className='record-row';rank.className='record-rank';rank.textContent=String(index+1).padStart(2,'0');score.textContent=record.score;unit.textContent='pts';score.append(unit);row.append(rank,score);list.append(row);});
  }
}
const sprayRadius=()=>Math.min(105,Math.min(layout.width,layout.height)*.28);
const onFloor=p=>p.x>=layout.x&&p.x<=layout.x+layout.width&&p.y>=layout.y&&p.y<=layout.y+layout.height;
const usesLeft=kind=>kind==='spray'?game.spraysLeft:game.trapsLeft;
function trapArea(p){return {x:(p.x-layout.x)/layout.width,y:(p.y-layout.y)/layout.height,radiusX:Math.min(.9,38/layout.width),radiusY:Math.min(.9,30/layout.height)};}
function renderTraps(){
  if(!layout)return;
  for(const [id,node] of trapNodes)if(!game.traps.has(id)){node.remove();trapNodes.delete(id);}
  for(const trap of game.traps.values()){
    let node=trapNodes.get(trap.id);if(!node){node=document.createElement('span');node.className='mouse-trap';node.dataset.id=trap.id;node.innerHTML=trapMarkup;$('#traps').append(node);trapNodes.set(trap.id,node);}
    node.style.left=`${layout.x+trap.x*layout.width}px`;node.style.top=`${layout.y+trap.y*layout.height}px`;node.classList.toggle('is-sprung',!trap.armed);
  }
}
function paintToolAim(){
  const g=toolGesture;$('#spray-aim').hidden=true;$('#trap-aim').hidden=true;if(!g||!onFloor(g.last))return;
  if(g.kind==='trap'){const aim=$('#trap-aim');aim.hidden=false;aim.style.left=`${g.last.x}px`;aim.style.top=`${g.last.y}px`;return;}
  const aim=$('#spray-aim'),radius=sprayRadius();aim.hidden=false;aim.style.left=`${g.last.x}px`;aim.style.top=`${g.last.y}px`;aim.style.width=aim.style.height=`${radius*2}px`;
  const targets=[...game.entities.values()].filter(e=>['roach','ant'].includes(e.type)&&Math.hypot(layout.x+e.x*layout.width-g.last.x,layout.y+e.y*layout.height-g.last.y)<=radius);
  const ants=targets.filter(e=>e.type==='ant').length;
  $('#spray-targets').textContent=targets.length-ants;$('#spray-ant-targets').textContent=ants;$('#spray-ant-cost').textContent=`−${ants*ANT_PENALTY}`;$('#spray-ant-warning').hidden=ants===0;aim.classList.toggle('has-ants',ants>0);
}
function cancelToolAim(){
  const g=toolGesture;toolGesture=null;$('#spray-aim').hidden=true;$('#trap-aim').hidden=true;
  for(const kind of ['spray','trap'])$(`#${kind}`).classList.remove('is-dragging');
  if(g?.id!==undefined&&$(`#${g.kind}`).hasPointerCapture(g.id))$(`#${g.kind}`).releasePointerCapture(g.id);
}
function clearSprayClouds(){for(const [node,timer] of cloudTimers){clearTimeout(timer);node.remove();}cloudTimers.clear();}
function releaseTool(p){
  const kind=toolGesture?.kind;cancelToolAim();if(game.state!=='playing'||!kind)return;
  if(!onFloor(p)){hint('Drop the item inside the room. No use was consumed.');return;}
  if(kind==='trap'){
    const trap=game.placeTrap(trapArea(p));if(!trap){if(game.state==='finished')finish();return;}
    renderTraps();renderScore();hint('Trap set. It catches one mouse for 5 points.');announce('Mouse trap placed. Only mice can trigger it.');return;
  }
  const radius=sprayRadius(),cloud=game.useSpray({x:(p.x-layout.x)/layout.width,y:(p.y-layout.y)/layout.height,radiusX:radius/layout.width,radiusY:radius/layout.height});
  if(!cloud){if(game.state==='finished')finish();return;}
  const node=document.createElement('div');node.className='spray-cloud is-releasing';node.innerHTML='<i></i><i></i><i></i><i></i><i></i>';node.style.left=`${p.x}px`;node.style.top=`${p.y}px`;node.style.width=node.style.height=`${radius*2}px`;$('#spray-clouds').append(node);
  const timer=setTimeout(()=>{node.remove();cloudTimers.delete(node);},1150);cloudTimers.set(node,timer);
  hint('Spray released. Roaches +1 each; ants −3 each.');announce(`Spray released. ${game.spraysLeft} uses remaining.`);renderScore();
}
function readLayout(){
  const r=room.getBoundingClientRect(),f=$('#floor').getBoundingClientRect();layout={x:f.x-r.x,y:f.y-r.y,width:f.width,height:f.height};
  for(const trap of game.traps.values()){trap.radiusX=Math.min(.9,38/f.width);trap.radiusY=Math.min(.9,30/f.height);}
  if(f.width&&f.height)game.setGeometry([...document.querySelectorAll('.hole')].map(node=>{const h=node.getBoundingClientRect();return {x:(h.x+h.width/2-f.x)/f.width,y:(h.y+h.height/2-f.y)/f.height};}));
}
function point(event){const r=room.getBoundingClientRect();return {x:event.clientX-r.x,y:event.clientY-r.y,t:performance.now()};}
function inCage(p){const r=room.getBoundingClientRect(),c=cage.getBoundingClientRect();return p.x>=c.left-r.left-10&&p.x<=c.right-r.left+10&&p.y>=c.top-r.top-6&&p.y<=c.bottom-r.top+10;}
function nearCage(p){const r=room.getBoundingClientRect(),c=cage.getBoundingClientRect();return p.x>=c.left-r.left-34&&p.x<=c.right-r.left+34&&p.y>=c.top-r.top-24&&p.y<=c.bottom-r.top+36;}
function setLock(playing){
  const lock=playing&&matchMedia('(max-width:760px), (pointer:coarse)').matches;
  if(lock===document.body.classList.contains('play-locked'))return;
  if(lock){savedScroll=scrollY;window.scrollTo({top:savedScroll,behavior:'instant'});}
  document.documentElement.classList.toggle('play-locked',lock);document.body.classList.toggle('play-locked',lock);
  for(const node of document.querySelectorAll('.site-top,.intro,.sidebar,main>footer'))node.inert=lock;
  if(lock)window.scrollTo({top:0,behavior:'instant'});else window.scrollTo({top:savedScroll,behavior:'instant'});
  $('.play-panel').scrollTop=0;room.scrollTop=0;readLayout();
}
function describe(entity){
  if(entity.type==='ant')return 'Ant friend. Tapping loses 3 points. Flick it out safely. Keyboard: Shift plus Enter to flick.';
  if(entity.type==='mouse')return 'Mouse. Hold for 0.5 seconds, then drag to the cage for 5 points. Keyboard: hold Space, then activate the cage.';
  if(entity.mode==='flying')return entity.size==='big'?'Flying big roach. Swipe for 4 points. Keyboard: Enter.':'Flying small roach. Swipe for 3 points. Keyboard: Enter.';
  if(entity.size==='big')return performance.now()<entity.dazedUntil?'Big roach. Tap again for 2 points.':'Big crawling roach. Double-tap for 2 points. Keyboard: Enter twice.';
  return 'Small crawling roach. Tap for 1 point. Keyboard: Enter.';
}
function sync(){
  for(const [id,button] of buttons)if(!game.entities.has(id)){button.remove();buttons.delete(id);positions.delete(id);}
  for(const entity of game.entities.values()){
    let button=buttons.get(entity.id);
    if(!button){
      button=document.createElement('button');button.type='button';button.className='critter is-new';button.dataset.id=entity.id;button.dataset.type=entity.type;button.dataset.size=entity.size;
      button.innerHTML=sprite(entity.type,entity.size)+'<span class="charge-ring" aria-hidden="true"></span>';
      entities.append(button);buttons.set(entity.id,button);setTimeout(()=>button.classList.remove('is-new'),280);
    }
    button.disabled=game.state!=='playing';button.dataset.mode=entity.mode;
    const label=describe(entity);if(button.dataset.sourceLabel!==label){button.dataset.sourceLabel=label;button.setAttribute('aria-label',label);}
  }
}
function renderScore(){
  $('#timer').textContent=clock(game.remaining);$('.scoreboard').classList.toggle('is-urgent',game.state==='playing'&&game.remaining<=10000);
  if(game.score!==previousScore){$('#score').textContent=game.score;$('#score').setAttribute('aria-label',`Score: ${game.score} points`);$('#score').classList.toggle('is-penalty',previousScore!==null&&game.score<previousScore);if(previousScore!==null)animateChange($('#score'));previousScore=game.score;}
  $('#best').textContent=records[game.duration][0]?.score??'—';
  for(const kind of ['spray','trap']){
    const tool=$(`#${kind}`),left=usesLeft(kind),state=`${game.state}:${left}`;tool.disabled=game.state!=='playing'||left===0;
    if(tool.dataset.state!==state){tool.dataset.state=state;tool.classList.toggle('is-used',left===0);$(`#${kind}-count`).textContent=`×${left}`;tool.setAttribute('aria-label',kind==='spray'?`Insect spray. ${left} uses remaining. Drag into the room, or press Enter to aim.`:`Mouse traps. ${left} uses remaining. Drag into the room, or press Enter to aim.`);}
  }
}
function frozen(){
  const ids=new Set([...gestures.values()].filter(g=>!g.cancelled&&g.id!==null).map(g=>g.id));
  if(keyboardGrab)ids.add(keyboardGrab.id);
  const focused=document.activeElement?.closest('.critter');if(focused)ids.add(Number(focused.dataset.id));return ids;
}
function positionEntities(){
  if(!layout)readLayout();renderTraps();
  for(const entity of game.entities.values()){
    const button=buttons.get(entity.id);if(!button)continue;
    const drag=[...gestures.values()].find(g=>g.id===entity.id&&!g.cancelled&&(g.charged||entity.type==='ant'&&g.distance>10));
    const p=drag?.last||{x:layout.x+entity.x*layout.width,y:layout.y+entity.y*layout.height-entity.flight*(10+Math.sin(entity.phase*.18)*2)};
    positions.set(entity.id,p);
    button.style.transform=`translate(${p.x-button.offsetWidth/2}px,${p.y-button.offsetHeight/2}px)`;
    button.style.setProperty('--angle',`${entity.heading*180/Math.PI}deg`);
    button.style.setProperty('--flight',String(entity.flight));
    button.style.setProperty('--step',reducedMotion.matches?'0':String(Math.sin(entity.phase)));
    button.style.setProperty('--flap',reducedMotion.matches?'0':String(Math.sin(entity.phase*2)));
    if(entity.type==='ant')button.classList.toggle('is-ant-dragged',Boolean(drag));
    const primed=performance.now()<entity.dazedUntil;button.classList.toggle('is-primed',primed);
    if(button.dataset.primed!==String(primed)){button.dataset.primed=String(primed);const label=describe(entity);button.dataset.sourceLabel=label;button.setAttribute('aria-label',label);}
  }
}
function spawnFeedback(entity){
  const hole=$(`[data-hole="${entity.hole}"]`);hole.classList.remove('is-spawning');void hole.offsetWidth;hole.classList.add('is-spawning');
  if(entity.type==='mouse'){hint('A mouse is out! Hold for 0.5s, then drag it into the cage.');announce('A mouse is out. Hold it, then drag to the cage for 5 points.');}
  if(entity.type==='ant'){hint('An ant friend! Tap loses 3 points. Flick it out safely.');announce('An ant friend is visiting. Tapping loses three points.');}
}
function celebrateCage(){
  const art=$('.cage-art'),from=getComputedStyle(art).transform,revision=++cageRevision;
  cageAnimation?.cancel();cageBusy=true;cage.classList.add('is-open');cage.classList.remove('is-over');
  if(reducedMotion.matches){cageBusy=false;return;}
  cageAnimation=art.animate([
    {transform:from==='none'?'scale(1)':from,easing:'cubic-bezier(.22,.8,.32,1)'},{transform:'scale(1.16)',offset:.45,easing:'ease-in-out'},{transform:'scale(.98)',offset:.78,easing:'ease-out'},{transform:'scale(1)'},
  ],{duration:450,easing:'linear'});
  cageAnimation.finished.catch(()=>{}).finally(()=>{
    if(revision!==cageRevision)return;
    cageAnimation=null;cageBusy=false;updateGestures(performance.now());
  });
}
function effect(result,fling){
  const p=positions.get(result.id)||{x:layout.x+result.x*layout.width,y:layout.y+result.y*layout.height};
  if(result.kind==='antsFlicked'){
    if(!reducedMotion.matches){
      const node=document.createElement('span');node.className='ant-fling';node.style.left=`${p.x}px`;node.style.top=`${p.y}px`;node.innerHTML=buttons.get(result.id).querySelector('svg').outerHTML;$('#effects').append(node);
      const dx=fling?.dx||0,dy=fling?.dy??-1,length=Math.hypot(dx,dy)||1,travel=Math.hypot(room.clientWidth,room.clientHeight)+90;
      const animation=node.animate([{transform:'translate(-50%,-50%) rotate(0deg)'},{transform:`translate(calc(-50% + ${dx/length*travel}px),calc(-50% + ${dy/length*travel}px)) rotate(300deg) scale(.45)`}],{duration:440,easing:'cubic-bezier(.3,0,.8,1)'});
      animation.finished.catch(()=>{}).finally(()=>node.remove());
    }
    hint('Ant safely flicked out. No points lost.');announce('Ant safely flicked out. No points lost.');return;
  }
  if(!reducedMotion.matches){
    for(const className of ['critter-poof','score-pop']){const node=document.createElement('span');node.className=className+(result.points<0?' is-penalty':'');node.style.left=`${p.x-20}px`;node.style.top=`${p.y-20}px`;if(className==='score-pop')node.textContent=result.points<0?`−${Math.abs(result.points)}`:`+${result.points}`;$('#effects').append(node);setTimeout(()=>node.remove(),600);}
  }
  if(result.kind==='antsHit'){hint('That was an ant friend. −3 points.');announce('Ant tapped. Three points deducted.');}
  if(result.kind==='trapped'){hint('A mouse triggered a trap. +5 points!');announce('Mouse caught by a trap. 5 points.');}
  if(result.kind==='mice'){celebrateCage();hint('Safe in the cage. Nice catch! +5');announce('Mouse caught. 5 points.');}
  try{navigator.vibrate?.(['mice','trapped'].includes(result.kind)?[12,25,12]:8);}catch{}
}
function apply(result,fling){
  if(!result)return;
  if(result.kind==='primed'){buttons.get(result.id)?.classList.add('is-primed');hint('One more quick tap on the same big roach!');return;}
  effect(result,fling);sync();renderScore();
}
function updateGestures(now){
  cage.classList.remove('is-ready','is-over');cage.disabled=true;
  let doorOpen=cageBusy;
  const all=[...gestures.values(),...(keyboardGrab?[keyboardGrab]:[])];
  for(const g of all){
    const entity=game.entities.get(g.id);if(entity?.type!=='mouse'||g.cancelled)continue;
    const button=buttons.get(g.id),held=now-g.started;
    button.classList.add('is-held');button.style.setProperty('--charge',`${Math.min(1,held/MOUSE_HOLD)*360}deg`);
    if(held>=MOUSE_HOLD){
      if(!g.charged){g.charged=true;hint(g.keyboard?'Mouse picked up. Release Space, then activate the cage.':'Got it! Keep holding and drag into the cage above.');}
      cage.classList.add('is-ready');if(g.keyboard)cage.disabled=false;
      if(g.keyboard||nearCage(g.last))doorOpen=true;
      if(!g.keyboard){button.classList.add('is-dragged');if(inCage(g.last))cage.classList.add('is-over');}
    }
  }
  cage.classList.toggle('is-open',doorOpen);
}
function clearGesture(g){
  const button=buttons.get(g.id);button?.classList.remove('is-held','is-dragged');button?.style.removeProperty('--charge');
}
function cancelAll(){
  cancelToolAim();
  for(const g of gestures.values())clearGesture(g);gestures.clear();
  if(keyboardGrab)clearGesture(keyboardGrab);keyboardGrab=null;
  cageRevision++;cageAnimation?.cancel();cageAnimation=null;cageBusy=false;
  cage.classList.remove('is-ready','is-over','is-open');cage.disabled=true;$('#swipe-trail path').setAttribute('d','');
}
function finish(){
  if(!$('#result').hidden)return;
  cancelAnimationFrame(frame);frame=0;clearTimeout(deadline);deadline=0;cancelAll();sync();renderScore();setLock(false);
  clearSprayClouds();const best=records[game.duration][0]?.score,personalBest=best===undefined||game.score>best;records=addRecord(records,game.duration,game.score,Date.now());
  try{storage?.setItem('roach-rush.records.v3',JSON.stringify({version:3,modes:records}));}catch{$('#records-note').textContent='Records last for this visit; device storage is unavailable.';}
  renderRecords();
  $('#final-score').textContent=game.score;$('#result-note').textContent=personalBest?'A new personal best. This room has met its match.':'A busy little room. A very good effort.';
  for(const kind of ['small','big','flying','mice'])$(`#stat-${kind}`).textContent=game.stats[kind];
  $('#ant-summary').textContent=`Ant taps: ${game.stats.antsHit} · Safely flicked: ${game.stats.antsFlicked}`;
  $('#spray-summary').textContent=`Sprayed roaches: ${game.stats.sprayed} · 1 point each`;
  $('#spray-ant-summary').hidden=game.stats.antsSprayed===0;$('#spray-ant-summary').textContent=`Ants sprayed: ${game.stats.antsSprayed} · −${game.stats.antsSprayed*ANT_PENALTY} points`;
  $('#trap-summary').textContent=`Trap catches: ${game.stats.trapped} · +${game.stats.trapped*5} points`;
  $('#result').hidden=false;$('#mode-options').disabled=false;$('#start').disabled=false;$('#end').hidden=true;
  hint('Room cleared for now. Play again for a fresh swarm.');renderScore();
  $('#result-title').focus({preventScroll:true});$('#result').scrollIntoView({block:'center',behavior:'instant'});announce(`Time is up. Final score ${game.score} points.`);
}
function tick(){
  const now=performance.now(),events=game.advance(frozen());
  if(events.finished||game.state==='finished'){finish();return;}
  for(const entity of events.spawned)spawnFeedback(entity);
  for(const result of [...events.sprayed,...events.trapped])effect(result);
  if(events.sprayReleased){
    const ants=events.sprayed.filter(r=>r.kind==='antsSprayed').length,roaches=events.sprayed.length-ants,net=roaches-ants*ANT_PENALTY;
    const change=net<0?`−${Math.abs(net)}`:net>0?`+${net}`:'0';
    const message=events.sprayed.length?`Spray result: roaches ${roaches}, ants ${ants}; score ${change}.`:'The cloud missed. Your spray is used.';
    hint(message);announce(message);
  }
  sync();updateGestures(now);positionEntities();renderScore();
  if(toolGesture)paintToolAim();
  if(game.remaining<=10000&&!tenAnnounced){tenAnnounced=true;announce('Ten seconds left!');}
  frame=requestAnimationFrame(tick);
}
function resetRound(duration=game.duration){
  cancelAnimationFrame(frame);clearTimeout(deadline);frame=deadline=0;cancelAll();clearSprayClouds();
  if($('#result').contains(document.activeElement))document.activeElement.blur();
  game.reset(duration);$('#result').hidden=true;$('#idle-note').hidden=false;$('#end').hidden=true;$('#start').disabled=false;$('#mode-options').disabled=false;
  $('#effects').replaceChildren();entities.replaceChildren();buttons.clear();positions.clear();previousScore=null;
  setLock(false);readLayout();for(let hole=0;hole<HOLES.length;hole++)game.spawnRoach(hole);sync();positionEntities();renderScore();
  hint('Tap the small ones. Double-tap the big ones. Swipe the flying ones.');
}
function startRound(){
  cancelAnimationFrame(frame);clearTimeout(deadline);cancelAll();clearSprayClouds();if($('#result').contains(document.activeElement))document.activeElement.blur();
  $('#result').hidden=true;$('#idle-note').hidden=true;$('#effects').replaceChildren();entities.replaceChildren();buttons.clear();positions.clear();
  setLock(true);previousScore=null;tenAnnounced=false;$('#mode-options').disabled=true;$('#start').disabled=true;$('#end').hidden=false;readLayout();game.start();
  if(!document.body.classList.contains('play-locked'))$('.scoreboard').scrollIntoView({block:'start',behavior:'instant'});
  readLayout();sync();positionEntities();renderScore();
  hint('Tap the small ones. Double-tap the big ones. Swipe the flying ones.');announce('The room is open. Catch the little visitors!');
  deadline=setTimeout(()=>{if(game.expire())finish();},game.duration*1000);frame=requestAnimationFrame(tick);
}
room.addEventListener('pointerdown',event=>{
  if(game.state!=='playing'||event.button!==0)return;
  if(event.target.closest('#cage')&&keyboardGrab?.charged)return;
  event.preventDefault();const button=event.target.closest('.critter'),id=button?Number(button.dataset.id):null;
  if([...gestures.values()].some(g=>g.id===id&&id!==null)||keyboardGrab?.id===id)return;
  document.activeElement?.closest('.critter')?.blur();readLayout();const p=point(event);
  gestures.set(event.pointerId,{id,type:game.entities.get(id)?.type,from:p,last:p,started:p.t,distance:0,charged:false,cancelled:false,points:[p]});room.setPointerCapture(event.pointerId);
});
room.addEventListener('pointermove',event=>{
  const g=gestures.get(event.pointerId);if(!g||game.state!=='playing')return;
  const p=point(event),previous=g.last;g.distance+=Math.hypot(p.x-previous.x,p.y-previous.y);g.last=p;
  const entity=game.entities.get(g.id);
  if(g.type==='ant'){
    if(p.t-previous.t>140)g.points=[{...previous,t:p.t}];
    g.points.push(p);g.points=g.points.slice(-12);positionEntities();return;
  }
  if(entity?.type==='mouse'){
    if(!g.charged&&p.t-g.started>=MOUSE_HOLD)updateGestures(p.t);
    if(!g.charged&&Math.hypot(p.x-g.from.x,p.y-g.from.y)>10){g.cancelled=true;clearGesture(g);hint('Hold still for 0.5s before dragging the mouse.');}
    updateGestures(p.t);positionEntities();return;
  }
  g.points.push(p);g.points=g.points.slice(-12);
  if(g.distance<SWIPE_DISTANCE)return;
  const hits=[];
  for(const e of game.entities.values())if(e.type==='roach'&&e.mode==='flying'){
    const at=positions.get(e.id),button=buttons.get(e.id),radius=button.offsetWidth*.42+5;
    if(at&&g.points.slice(1).some((point,index)=>distanceToSegment(at,g.points[index],point)<=radius))hits.push(e.id);
  }
  for(const id of hits)apply(game.swipe(id,g.distance));
  if(!reducedMotion.matches){$('#swipe-trail path').setAttribute('d',g.points.map((p,i)=>`${i?'L':'M'}${p.x} ${p.y}`).join(' '));}
});
function release(event,cancelled=false){
  const g=gestures.get(event.pointerId);if(!g)return;
  gestures.delete(event.pointerId);const p=point(event),entity=game.entities.get(g.id),held=p.t-g.started;
  if(!cancelled&&!g.cancelled&&game.state==='playing'){
    if(g.type==='ant'){
      const flick=antFlick(g.points,p);
      if(entity&&flick)apply(game.flickAnt(entity.id,flick.distance,flick.speed),flick);
      else if(entity&&g.distance<12&&Math.hypot(p.x-g.from.x,p.y-g.from.y)<12&&held<=350)apply(game.tap(entity.id));
      else if(entity){game.dropAnt(entity.id,(p.x-layout.x)/layout.width,(p.y-layout.y)/layout.height);hint('Flick a little faster to send the ant out safely.');}
    }else if(entity?.type==='mouse'){
      const result=game.catchMouse(entity.id,held,inCage(p));
      if(result)apply(result);else if(held>=MOUSE_HOLD){game.dropMouse(entity.id,(p.x-layout.x)/layout.width,(p.y-layout.y)/layout.height);hint('Almost! Drop the mouse inside the cage to score.');}
      else hint('Hold the mouse a little longer before dragging.');
    }else if(g.distance<12&&Math.hypot(p.x-g.from.x,p.y-g.from.y)<12&&held<=350){
      if(entity?.mode==='flying')hint(entity.size==='big'?'That big one is flying. Swipe across it for 4 points.':'That small one is flying. Swipe across it for 3 points.');else if(entity)apply(game.tap(entity.id));
    }
  }
  clearGesture(g);if(room.hasPointerCapture(event.pointerId))room.releasePointerCapture(event.pointerId);
  $('#swipe-trail path').setAttribute('d','');updateGestures(performance.now());positionEntities();
  if(game.state==='finished')finish();
}
room.addEventListener('pointerup',event=>release(event));room.addEventListener('pointercancel',event=>release(event,true));
room.addEventListener('lostpointercapture',event=>{if(gestures.has(event.pointerId))release(event,true);});
entities.addEventListener('keydown',event=>{
  const button=event.target.closest('.critter');if(!button||!['Enter','Space'].includes(event.code)||game.state!=='playing')return;
  event.preventDefault();if(event.repeat)return;const id=Number(button.dataset.id),entity=game.entities.get(id);if(!entity)return;
  if(entity.type==='ant'){
    if(event.code==='Enter'&&event.shiftKey)apply(game.flickAnt(id,SWIPE_DISTANCE,.25),{dx:0,dy:-1});else apply(game.tap(id));
  }else if(entity.type==='mouse'){
    if(event.code==='Space'&&!keyboardGrab){keyboardGrab={id,started:performance.now(),keyboard:true,charged:false,awaitingRelease:true};hint('Keep holding Space until the ring fills.');}
  }else apply(entity.mode==='flying'?game.swipe(id,SWIPE_DISTANCE):game.tap(id));
});
window.addEventListener('keyup',event=>{
  if(event.code!=='Space'||!keyboardGrab?.awaitingRelease)return;
  event.preventDefault();updateGestures(performance.now());
  if(keyboardGrab.charged){keyboardGrab.awaitingRelease=false;cage.disabled=false;cage.focus({preventScroll:true});hint('Mouse picked up. Activate the cage to catch it.');}
  else {clearGesture(keyboardGrab);keyboardGrab=null;hint('Hold the mouse a little longer before dragging.');}
});
cage.addEventListener('click',()=>{if(keyboardGrab?.charged){const g=keyboardGrab;keyboardGrab=null;clearGesture(g);apply(game.catchMouse(g.id,performance.now()-g.started,true));updateGestures(performance.now());if(game.state==='finished')finish();}});
window.addEventListener('keydown',event=>{if(event.key==='Escape'){cancelAll();hint('Grab cancelled. Try again when you’re ready.');}});
window.addEventListener('blur',cancelAll);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelAll();});
for(const kind of ['spray','trap']){
  const tool=$(`#${kind}`);
  tool.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary||game.state!=='playing'||usesLeft(kind)===0||toolGesture)return;
    event.preventDefault();document.activeElement?.closest('.critter')?.blur();tool.focus({preventScroll:true});readLayout();
    toolGesture={kind,id:event.pointerId,last:point(event)};tool.setPointerCapture(event.pointerId);tool.classList.add('is-dragging');hint(kind==='spray'?'Drag into the room. Roaches +1 each; ants −3 each.':'Drag the trap onto the floor. It catches one mouse for 5 points.');paintToolAim();
  });
  tool.addEventListener('pointermove',event=>{if(toolGesture?.kind===kind&&toolGesture?.id===event.pointerId){toolGesture.last=point(event);paintToolAim();}});
  tool.addEventListener('pointerup',event=>{if(toolGesture?.kind===kind&&toolGesture?.id===event.pointerId)releaseTool(point(event));});
  tool.addEventListener('pointercancel',cancelToolAim);tool.addEventListener('lostpointercapture',()=>{if(toolGesture?.kind===kind&&!toolGesture.keyboard)cancelToolAim();});
  tool.addEventListener('click',event=>{
    if(event.detail!==0||game.state!=='playing'||usesLeft(kind)===0||toolGesture)return;
    readLayout();toolGesture={kind,keyboard:true,last:{x:layout.x+layout.width/2,y:layout.y+layout.height/2}};tool.classList.add('is-dragging');paintToolAim();hint('Arrow keys move the item. Enter or Space places it. Escape cancels.');
  });
  tool.addEventListener('keydown',event=>{
    if(toolGesture?.kind!==kind||!toolGesture.keyboard)return;
    if(['Enter','Space'].includes(event.code)){event.preventDefault();if(!event.repeat)releaseTool(toolGesture.last);return;}
    const move={ArrowLeft:[-24,0],ArrowRight:[24,0],ArrowUp:[0,-24],ArrowDown:[0,24]}[event.key];if(!move)return;
    event.preventDefault();const p=toolGesture.last;p.x=Math.max(layout.x,Math.min(layout.x+layout.width,p.x+move[0]));p.y=Math.max(layout.y,Math.min(layout.y+layout.height,p.y+move[1]));paintToolAim();
  });
  for(const type of ['contextmenu','selectstart','dragstart'])tool.addEventListener(type,event=>event.preventDefault());
}
for(const type of ['contextmenu','selectstart','dragstart'])room.addEventListener(type,event=>event.preventDefault());
document.addEventListener('touchmove',event=>{if(document.body.classList.contains('play-locked')&&event.touches.length===1)event.preventDefault();},{passive:false});
$('#start').addEventListener('click',startRound);$('#again').addEventListener('click',startRound);
$('#end').addEventListener('click',()=>{resetRound();$('#start').focus({preventScroll:true});});
$('#change-time').addEventListener('click',()=>{resetRound();$('#start').focus({preventScroll:true});});
$('#mode-options').addEventListener('change',()=>resetRound(Number(document.querySelector('input[name="duration"]:checked').value)));
window.addEventListener('resize',()=>{setLock(game.state==='playing');readLayout();positionEntities();});new ResizeObserver(()=>{readLayout();positionEntities();}).observe(room);
$('.cage-art').innerHTML=cageMarkup;
$('.spray-art').innerHTML=sprayMarkup;$('.trap-art').innerHTML=trapMarkup;const trapGhost=document.createElement('span');trapGhost.className='trap-ghost';trapGhost.innerHTML=trapMarkup;$('#trap-aim').append(trapGhost);
const sprayGhost=document.createElement('span');sprayGhost.className='spray-ghost';sprayGhost.innerHTML=sprayMarkup;$('#spray-aim').append(sprayGhost);
for(const node of document.querySelectorAll('[data-guide]')){const kind=node.dataset.guide;node.innerHTML=sprite(['mouse','ant'].includes(kind)?kind:'roach',kind==='big'?'big':'small');}
renderRecords();resetRound();
if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',async()=>{
  try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready to rush offline.';}
  catch{$('#offline-status').textContent='Your room is ready online.';}
});
