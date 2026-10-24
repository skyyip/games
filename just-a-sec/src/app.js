import {TimeGame} from './game.js';
import {getLanguage} from '../../grid-rush/src/language.js';
import {reducedMotion} from '../../grid-rush/src/playground-ui.js';
import {mountPadMotion,mountParallax,moveInk} from './motion.js';

const $=selector=>document.querySelector(selector),game=new TimeGame(),hold=$('#hold');
const playerName=i=>getLanguage()==='zh-Hant'?`玩家 ${i}`:`Player ${i}`;
let names=[playerName(1),playerName(2)],sceneId='',lastTurn=-1;
const scenes={setup:'welcome',handoff:'handoff',ready:'play',holding:'play',locked:'locked',results:'result'};
const announce=text=>{$('#announcements').textContent=text;};
const seconds=milliseconds=>(milliseconds/1000).toFixed(3);
function renderPlayers() {
  const rows=document.createDocumentFragment();
  names.forEach((name,index)=>{
    const row=document.createElement('div');row.className='player-row';
    const label=document.createElement('label');label.htmlFor=`player-${index}`;label.textContent=String(index+1).padStart(2,'0');label.setAttribute('aria-label',`Player ${index+1}`);
    const input=document.createElement('input');input.id=label.htmlFor;input.value=name;input.maxLength=24;input.autocomplete='off';
    input.addEventListener('input',()=>{names[index]=input.value;});row.append(label,input);rows.append(row);
  });
  $('#rows').replaceChildren(rows);$('#player-count').textContent=names.length;$('#minus').disabled=names.length===2;$('#plus').disabled=names.length===6;
}
function renderTracker() {
  const tracker=$('#round-tracker');tracker.hidden=game.state==='setup';
  if(tracker.hidden)return;
  if($('#turns').children.length!==game.players.length) {
    $('#turns').replaceChildren(...game.players.map((name,index)=>{const item=document.createElement('li');item.textContent=index+1;item.setAttribute('aria-label',`Player ${index+1}`);return item;}));
  }
  [...$('#turns').children].forEach((item,index)=>{
    item.classList.toggle('current',index===game.turn);item.classList.toggle('done',index<game.guesses.length);
    if(index===game.turn)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
  });
  $('#round-people').replaceChildren(...game.players.map((name,index)=>{
    const token=document.createElement('span');token.className=`person-token${index<game.guesses.length?' done':''}${index===game.turn?' current':''}`;
    token.textContent=String(index+1).padStart(2,'0');token.setAttribute('aria-label',name);token.setAttribute('translate','no');return token;
  }));
  if(lastTurn!==game.turn){moveInk(tracker,game.turn);lastTurn=game.turn;}
}
function renderResults() {
  const winners=game.winners;
  $('#result-title').textContent=`${winners.map(result=>result.name).join(' & ')} ${winners.length>1?'share the moment.':'has the best timing.'}`;
  $('#result-note').textContent=winners[0].error===0?'Right on the millisecond. What a feeling.':`Just ${seconds(winners[0].error)} seconds from the target. A good feeling, confirmed.`;
  const targetUnit=document.createElement('small');targetUnit.textContent='s';
  $('#result-target').replaceChildren(document.createTextNode(String(game.target)),targetUnit);
  const rows=document.createDocumentFragment();
  game.results.forEach((result,index)=>{
    const row=document.createElement('li');row.className=`result-row${result.error===winners[0].error?' winner':''}`;row.style.setProperty('--row',index);
    const rank=document.createElement('span');rank.className='place';rank.textContent=String(game.results.findIndex(r=>r.error===result.error)+1).padStart(2,'0');
    const person=document.createElement('div');person.className='result-person';
    const name=document.createElement('strong');name.textContent=result.name;name.setAttribute('translate','no');
    const detail=document.createElement('small');detail.textContent=result.error===0?'Right on time':`${seconds(result.error)}s ${result.elapsed>game.target*1000?'too late':'too early'}`;
    person.append(name,detail);
    const time=document.createElement('span');time.className='result-time';time.textContent=seconds(result.elapsed);
    const unit=document.createElement('small');unit.textContent='s';time.append(unit);row.append(rank,person,time);rows.append(row);
  });
  $('#standings').replaceChildren(rows);
}
function render({focus=true}={}) {
  const id=scenes[game.state],changed=sceneId!==id;
  for(const value of new Set(Object.values(scenes)))$(`#${value}`).hidden=value!==id;
  $('#setup').hidden=game.state!=='setup';$('#round-card').hidden=game.state==='setup';$('#end-round').hidden=game.state==='setup';$('#edition').hidden=game.state!=='setup';
  document.body.classList.toggle('is-timing',game.state==='holding');
  hold.classList.toggle('is-holding',game.state==='holding');
  hold.setAttribute('aria-pressed',String(game.state==='holding'));
  $('#pad-label').textContent=game.state==='holding'?'Let go when it feels right':'Hold to begin';
  $('#pad-small').textContent=game.state==='holding'?'YOUR INNER CLOCK IS RUNNING':'YOUR TIME STARTS WITH YOU';
  $('#stage-label').textContent=game.state==='setup'?'MAKE A LITTLE TIME':game.state==='results'?'THE MOMENT OF TRUTH':'YOUR MOMENT, YOUR CALL';
  if(game.target!==null)for(const selector of ['#target','#handoff-target','#side-target'])$(selector).textContent=game.target;
  if(game.state==='handoff') {
    $('#next-player').textContent=game.players[game.turn];$('#monogram').textContent=String(game.turn+1).padStart(2,'0');$('#cancel-note').textContent='';
  }
  if(['ready','holding'].includes(game.state)) {
    $('#turn-name').textContent=game.players[game.turn];$('#turn-count').textContent=`PLAYER ${game.turn+1} / ${game.players.length}`;
  }
  if(game.state==='locked') {
    $('#locked-name').textContent=game.players[game.turn];$('#next').textContent=game.turn===game.players.length-1?'See our timing ↗':'Pass the moment ↗';
  }
  if(game.state==='results')renderResults();renderTracker();
  if(changed) {
    const scene=$(`#${id}`);scene.classList.remove('is-entering');
    if(!reducedMotion.matches){void scene.offsetWidth;scene.classList.add('is-entering');}
    sceneId=id;
    if(focus&&game.state!=='setup') {
      $('.play-panel').scrollIntoView({block:'start',behavior:'instant'});
      const target=game.state==='handoff'?$('#ready'):game.state==='ready'?hold:game.state==='locked'?$('#next'):$('#result-title');
      if(target.tagName==='H2')target.tabIndex=-1;target.focus({preventScroll:true});
      target.scrollIntoView({block:game.state==='ready'?'center':'nearest',behavior:'instant'});
    }
  }
}
function startRound() {
  game.start(names.map((name,index)=>name.trim()||playerName(index+1)));lastTurn=-1;render();
  announce(`Target ${game.target} seconds. Pass to ${game.players[0]}.`);
}
function cancelHold() {
  if(!game.cancel())return;
  window.dispatchEvent(new Event('timegame:cancel'));render({focus:false});
  $('#cancel-note').textContent='Hold cancelled. Nothing was saved. Try again.';
}
function begin(input) {
  if(!game.press(input))return false;
  $('#cancel-note').textContent='';render({focus:false});announce('Timing started. Release when it feels right.');return true;
}
function release(input) {
  if(!game.release(input))return;
  render();announce('Guess locked. Your time stays secret until everyone finishes.');
}
$('#start').addEventListener('click',startRound);
$('#rows').addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.isComposing){event.preventDefault();startRound();}});
$('#plus').addEventListener('click',()=>{if(names.length<6){names.push(playerName(names.length+1));renderPlayers();}});
$('#minus').addEventListener('click',()=>{if(names.length>2){names.pop();renderPlayers();}});
$('#ready').addEventListener('click',()=>{if(game.ready())render();});
$('#next').addEventListener('click',()=>{if(game.next())render();});
$('#again').addEventListener('click',startRound);
$('#change-players').addEventListener('click',()=>{game.reset();lastTurn=-1;render();$('#start').focus({preventScroll:true});$('#setup').scrollIntoView({block:'center',behavior:'instant'});});
$('#end-round').addEventListener('click',()=>{cancelHold();game.reset();lastTurn=-1;render();$('#start').focus({preventScroll:true});$('#setup').scrollIntoView({block:'center',behavior:'instant'});});
hold.addEventListener('pointerdown',event=>{
  if(event.button!==0||!event.isPrimary)return;
  event.preventDefault();
  if(begin(`pointer:${event.pointerId}`)){hold.focus({preventScroll:true});hold.setPointerCapture(event.pointerId);}
});
window.addEventListener('pointerup',event=>{release(`pointer:${event.pointerId}`);});
hold.addEventListener('pointercancel',event=>{if(game.input===`pointer:${event.pointerId}`)cancelHold();});
hold.addEventListener('lostpointercapture',()=>{if(game.state==='holding'&&game.input?.startsWith('pointer:'))cancelHold();});
hold.addEventListener('keydown',event=>{
  if(!['Space','Enter'].includes(event.code)||event.isComposing)return;
  event.preventDefault();if(!event.repeat)begin(`key:${event.code}`);
});
window.addEventListener('keyup',event=>{if(['Space','Enter'].includes(event.code)){if(game.input===`key:${event.code}`)event.preventDefault();release(`key:${event.code}`);}});
window.addEventListener('keydown',event=>{if(event.key==='Escape')cancelHold();});
hold.addEventListener('blur',cancelHold);window.addEventListener('blur',cancelHold);
document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelHold();});
for(const type of ['contextmenu','selectstart','dragstart'])hold.addEventListener(type,event=>event.preventDefault());
new ResizeObserver(()=>moveInk($('#round-tracker'),game.turn)).observe($('.play-panel'));
mountPadMotion(hold);mountParallax($('.welcome-art'));renderPlayers();render({focus:false});
if('serviceWorker' in navigator&&window.isSecureContext)window.addEventListener('load',async()=>{
  try{await navigator.serviceWorker.register(new URL('../sw.js',import.meta.url));await navigator.serviceWorker.ready;$('#offline-status').textContent='Ready for a moment offline.';}
  catch{$('#offline-status').textContent='Your next moment is ready online.';}
});
