import { LineGame } from './game.js';
import { pointAt, projectPoint, segmentPath, selectionFraction, SHAPE_NAMES } from './geometry.js';
import { animateChange } from '../../grid-rush/src/playground-ui.js';

const $ = selector => document.querySelector(selector);
const game = new LineGame();
const stage = $('#path-stage');
const panelIds = { setup:'setup', handoff:'handoff', choosing:'play', results:'result' };
let names = ['Player 1','Player 2'];
let draft, gesture = null;
const clamp = value => Math.max(0,Math.min(1,value));
const format = value => value > 1e-9 && value < .01 ? '< 0.01' : value.toFixed(2);
const announce = text => { $('#announcements').textContent = text; };
$('#setup-title').tabIndex = $('#play-title').tabIndex = $('#result-title').tabIndex = -1;
$('.how-to-play').open = !matchMedia('(max-width:650px)').matches;

function renderPlayers() {
  const rows = document.createDocumentFragment();
  names.forEach((name,index) => {
    const row = document.createElement('div'); row.className = 'player-row';
    const label = document.createElement('label'); label.htmlFor = `player-${index}`;
    const dot = document.createElement('i'); dot.setAttribute('aria-hidden','true');
    label.append(dot,document.createTextNode(`PLAYER ${index+1}`));
    const input = document.createElement('input'); input.id = label.htmlFor;
    input.value = name; input.maxLength = 24; input.autocomplete = 'off';
    input.addEventListener('input',()=>{names[index]=input.value;});
    row.append(label,input); rows.append(row);
  });
  $('#rows').replaceChildren(rows);
  $('#player-count').textContent = names.length;
  $('#minus').disabled = names.length === 2; $('#plus').disabled = names.length === 6;
}

function resetDraft() {
  gesture = null;
  draft = { start:null, end:null, active:'start', manual:false, otherSide:false };
  $('#start-point').value = 0; $('#end-point').value = 100;
}

function renderLine() {
  for(const path of document.querySelectorAll('#line-base, #handoff-preview .path-base, #result-preview .path-base')) path.setAttribute('d',game.line.d);
  for(const svg of document.querySelectorAll('#line-svg, #handoff-preview, #result-preview')) svg.setAttribute('viewBox',`0 0 ${game.line.width} ${game.line.height}`);
  stage.style.aspectRatio=`${game.line.width}/${game.line.height}`;
  stage.classList.toggle('is-closed',game.line.closed);
  $('#closed-controls').hidden=!game.line.closed;
  $('#play-subject').textContent=game.line.closed?'outline':'line';
  for(const endpoint of ['start','end'])$(`#${endpoint}-point`).setAttribute('aria-label',`${endpoint==='start'?'Start':'End'} point position along the ${game.line.closed?'outline':'line'}`);
  $('#path-motto').textContent=game.line.closed?'FOLLOW THE OUTLINE. TRUST YOUR EYE.':'FOLLOW THE LINE. TRUST YOUR EYE.';
  $('#keyboard-help').textContent=`Select an endpoint to adjust it. Keyboard: arrow keys move; Shift + arrow moves finely. ${game.line.closed?'Home/End meet at the outline’s join. Other side switches arcs.':'Home/End reach the line’s ends.'}`;
  for(const [id,fraction] of [['origin-cap',0],['finish-cap',1]]) {
    const point=pointAt(game.line,fraction);$( `#${id}`).setAttribute('cx',point.x);$(`#${id}`).setAttribute('cy',point.y);
  }
  $('#finish-cap').style.display=game.line.closed?'none':'';
  $('#line-kind').textContent = `${SHAPE_NAMES[game.line.kind].toUpperCase()} / ${game.line.closed?'OUTLINE':'YOUR LINE'}`;
  $('#shape-name').textContent = `${SHAPE_NAMES[game.line.kind]} this round`;
  $('#line-svg').setAttribute('aria-label',`Select a portion of the ${SHAPE_NAMES[game.line.kind].toLowerCase()} ${game.line.closed?'outline':'line'}`);
}

function renderSelection() {
  const hasEndpoints=draft.start!==null && draft.end!==null;
  const complete=hasEndpoints && selectionFraction(game.line,draft.start,draft.end,draft.otherSide)>0;
  $('#line-selection').setAttribute('d',complete?segmentPath(game.line,draft.start,draft.end,draft.otherSide):'');
  $('#line-selection').style.visibility=complete?'visible':'hidden';
  for(const endpoint of ['start','end']) {
    const marker=$(`#${endpoint}-marker`),value=draft[endpoint];
    marker.hidden=value===null;
    if(value!==null && game.line) {
      const point=pointAt(game.line,value);
      marker.style.left=`${point.x/game.line.width*100}%`;marker.style.top=`${point.y/game.line.height*100}%`;
      $(`#${endpoint}-point`).value=value*100;
    }
    marker.classList.toggle('is-active',draft.active===endpoint);
    marker.classList.toggle('is-focused',document.activeElement===$(`#${endpoint}-point`) || document.activeElement===marker);
    $(`#edit-${endpoint}`).setAttribute('aria-pressed',String(draft.active===endpoint));
  }
  $('#lock').disabled=!complete || gesture!==null;
  $('#other-side').disabled=!hasEndpoints || gesture!==null;
  $('#other-side').setAttribute('aria-pressed',String(draft.otherSide));
  $('#whole-outline').disabled=gesture!==null;
  $('#clear').disabled=draft.start===null && draft.end===null;
  let help=game.line?.closed?'The green arc is your guess. Adjust the points, switch sides, or lock it in.':'Looking good? Adjust either endpoint, or lock your guess when you’re ready.';
  if(draft.start===null)help=game.line?.closed?'Choose two points on the outline. Other side switches between the two arcs.':'Drag along the line, or tap a start point and an end point.';
  else if(draft.end===null)help='Start point placed. Tap an end point, or keep dragging to draw your segment.';
  else if(!complete)help=game.line?.closed?'No length selected. Move an endpoint or choose the other side of the outline.':'The endpoints overlap. Move one point to give your segment some length.';
  if($('#selection-help').textContent!==help) $('#selection-help').textContent=help;
}

function showState() {
  for(const [state,id] of Object.entries(panelIds)) $(`#${id}`).hidden=game.state!==state;
  $('#target').textContent=game.target??'—';
  $('#inline-target').textContent=`${game.target??'—'}%`;
  $('#target-note').textContent=game.target===null?'A random target from 1% to 100%. Revealed when you start.':game.line.closed?'Of the full outline, measured around its edge. The same shape and target for every player.':'Of the full line, measured along its path. The same target for every player.';
  if(game.state==='handoff') {
    resetDraft();renderSelection();
    $('#next-player').textContent=game.players[game.turn];$('#monogram').textContent=game.turn+1;
    $('#handoff-count').textContent=`/ ${game.turn+1} OF ${game.players.length}`;
    $('#locked-note').textContent=game.turn?`${game.turn} of ${game.players.length} guesses locked. Previous guesses are hidden.`:'Your guesses stay under wraps. No pressure. Just a good eye.';
    $('#ready').setAttribute('aria-label',`I’m ready. Start ${game.players[game.turn]}'s turn`);
    animateChange($('#handoff'));
    $('#handoff').scrollIntoView({block:'start',behavior:'auto'});$('#ready').focus({preventScroll:true});
    announce(`Target ${game.target}%. ${SHAPE_NAMES[game.line.kind]} ${game.line.closed?'outline':'line'}. Pass to ${game.players[game.turn]}.`);
  }
  if(game.state==='choosing') {
    $('#turn-count').textContent=`PLAYER ${game.turn+1} / ${game.players.length}`;
    $('#turn-name').textContent=game.players[game.turn];
    renderSelection();$('#play').scrollIntoView({block:'start',behavior:'auto'});$('#play-title').focus({preventScroll:true});
  }
  if(game.state==='results') {
    renderResults();$('#result').scrollIntoView({block:'start',behavior:'auto'});$('#result-title').focus({preventScroll:true});
    announce($('#result-title').textContent);
  }
  if(game.state==='setup') {$('#shape-name').textContent='A new shape each round';renderPlayers();}
}

function startRound() {
  game.start(names);renderLine();showState();
}

function renderResults() {
  const winners=game.winners,results=game.results,winning=new Set(winners.map(result=>result.index));
  $('#result-kicker').textContent=winners.length>1?'A SHARED VICTORY':'THE CLOSEST CALL';
  $('#result-title').textContent=`${winners.map(result=>result.name).join(' & ')} ${winners.length>1?'share the win!':'wins!'}`;
  $('#result-summary').textContent=winners[0].error<1e-9?`Spot on. Exactly ${game.target}% of the ${game.line.closed?'outline':'line'}. That’s a good eye.`:`Closest to ${game.target}%, with an error of ${format(winners[0].error)} percentage points. Nicely judged.`;
  $('#reference-label').textContent=`THE TARGET / ${game.target}%`;
  $('#reference-kind').textContent=SHAPE_NAMES[game.line.kind];
  $('#result-preview .path-selection').setAttribute('d',segmentPath(game.line,0,game.target/100));
  const rows=document.createDocumentFragment();
  results.forEach(result=>{
    const row=document.createElement('li');row.className=`result-row${winning.has(result.index)?' winner':''}`;
    const rank=document.createElement('span');rank.className='place';
    rank.textContent=String(results.findIndex(other=>Math.abs(other.error-result.error)<1e-9)+1).padStart(2,'0');
    const person=document.createElement('div');person.className='result-person';
    const name=document.createElement('strong');name.textContent=result.name;
    if(winning.has(result.index)) {const tag=document.createElement('span');tag.className='win-tag';tag.textContent='WINNER';name.append(tag);}
    const detail=document.createElement('small');detail.textContent=result.error<1e-9?'Exactly on target':`${format(result.error)} pts ${result.percent>game.target?'too long':'too short'}`;
    person.append(name,detail);
    const score=document.createElement('div');score.className='result-score';
    const percent=document.createElement('strong');percent.textContent=`${format(result.percent)}%`;
    const label=document.createElement('small');label.textContent='YOUR GUESS';score.append(percent,label);
    row.append(rank,person,score);rows.append(row);
  });
  $('#standings').replaceChildren(rows);
}

function fractionAt(event) {
  const bounds=$('#line-svg').getBoundingClientRect();
  return projectPoint(game.line,{x:(event.clientX-bounds.left)/bounds.width*game.line.width,y:(event.clientY-bounds.top)/bounds.height*game.line.height});
}

stage.addEventListener('pointerdown',event=>{
  if(game.state!=='choosing' || gesture || event.button!==0 || !event.isPrimary) return;
  event.preventDefault();
  const fresh=draft.start===null && draft.end===null;
  const marker=event.target.closest('[data-point]');
  let endpoint=marker?.dataset.point || draft.active;
  if(fresh) endpoint='start';
  else if(draft.end===null && draft.start!==null && !draft.manual) endpoint='end';
  gesture={id:event.pointerId,x:event.clientX,y:event.clientY,fresh,endpoint,snapshot:{...draft},moved:false};
  stage.setPointerCapture(event.pointerId);
  draft[endpoint]=fractionAt(event);
  draft.active=fresh?'end':endpoint;
  draft.manual=false;
  renderSelection();
});
stage.addEventListener('pointermove',event=>{
  if(gesture?.id!==event.pointerId) return;
  if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>6) gesture.moved=true;
  if(!gesture.moved) return;
  const endpoint=gesture.fresh?'end':gesture.endpoint;
  draft[endpoint]=fractionAt(event);draft.active=endpoint;renderSelection();
});
function release(event,cancelled=false) {
  if(gesture?.id!==event.pointerId) return;
  if(cancelled) draft=gesture.snapshot;
  else if(gesture.moved) draft[gesture.fresh?'end':gesture.endpoint]=fractionAt(event);
  gesture=null;
  if(stage.hasPointerCapture(event.pointerId))stage.releasePointerCapture(event.pointerId);
  renderSelection();
}
stage.addEventListener('pointerup',event=>release(event));
stage.addEventListener('pointercancel',event=>release(event,true));
stage.addEventListener('lostpointercapture',event=>{if(gesture?.id===event.pointerId){draft=gesture.snapshot;gesture=null;renderSelection();}});

function editPoint(endpoint,focus=true) {
  if(game.state!=='choosing') return;
  draft.active=endpoint;draft.manual=true;
  if(draft[endpoint]===null) draft[endpoint]=endpoint==='start'?0:1;
  renderSelection();
  if(focus)$(`#${endpoint}-point`).focus({preventScroll:true});
}
for(const endpoint of ['start','end']) {
  const input=$(`#${endpoint}-point`),marker=$(`#${endpoint}-marker`),control=$(`.point-control[data-point="${endpoint}"]`);
  $(`#edit-${endpoint}`).addEventListener('click',()=>editPoint(endpoint));
  marker.addEventListener('click',event=>{if(event.detail===0)editPoint(endpoint);});
  input.addEventListener('focus',()=>editPoint(endpoint,false));
  input.addEventListener('blur',renderSelection);
  input.addEventListener('input',()=>{if(game.state==='choosing'){draft[endpoint]=Number(input.value)/100;draft.active=endpoint;renderSelection();}});
  const keydown=event=>{
    if(game.state!=='choosing' || !['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(event.key))return;
    event.preventDefault();editPoint(endpoint,false);
    const step=event.shiftKey ? 0.001 : 0.01;
    const delta={ArrowLeft:-step,ArrowDown:-step,ArrowRight:step,ArrowUp:step,PageUp:.1,PageDown:-.1}[event.key];
    draft[endpoint]=event.key==='Home'?0:event.key==='End'?1:clamp(draft[endpoint]+delta);
    renderSelection();
  };
  control.addEventListener('keydown',keydown);marker.addEventListener('keydown',keydown);
}
$('#clear').addEventListener('click',()=>{resetDraft();renderSelection();});
$('#other-side').addEventListener('click',()=>{if(game.state==='choosing' && game.line.closed && !gesture){draft.otherSide=!draft.otherSide;renderSelection();announce('Selected the other arc of the outline.');}});
$('#whole-outline').addEventListener('click',()=>{if(game.state==='choosing' && game.line.closed && !gesture){draft.start=0;draft.end=1;draft.otherSide=false;renderSelection();announce('Whole outline selected.');}});
$('#lock').addEventListener('click',()=>{if(!gesture && game.submit(draft.start,draft.end,draft.otherSide))showState();});
$('#ready').addEventListener('click',()=>{if(game.beginTurn())showState();});
$('#player-form').addEventListener('submit',event=>{event.preventDefault();startRound();});
$('#plus').addEventListener('click',()=>{if(names.length<6){names.push(`Player ${names.length+1}`);renderPlayers();}});
$('#minus').addEventListener('click',()=>{if(names.length>2){names.pop();renderPlayers();}});
$('#again').addEventListener('click',startRound);
$('#change-players').addEventListener('click',()=>{game.reset();resetDraft();showState();$('#setup').scrollIntoView({block:'start',behavior:'auto'});$('#setup-title').focus({preventScroll:true});});
resetDraft();showState();

if('serviceWorker' in navigator && window.isSecureContext)window.addEventListener('load',async()=>{
  try{
    await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));
    await navigator.serviceWorker.ready;
    $('#offline-status').textContent='Ready to play offline. Add Line Up to your home screen.';
  }catch{$('#offline-status').textContent='Online play is ready. Add Line Up to your home screen.';}
});
