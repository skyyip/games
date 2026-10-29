import { getLanguage } from '../../grid-rush/src/language.js';
import '../../grid-rush/src/victory.js';
import { createGame, advance, moveMop, shout, superMove, feet, eat, pause, resume, releaseAll, cleanPercent, isRaised } from './game.js';
import { createRenderer } from './renderer.js';
import { t } from './copy.js';
import { load, save, GEAR, purchase, settle, reward, recordKey } from './progress.js';
import { createAudio } from './audio.js';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
let storage;try{storage=localStorage;}catch{}
let progress=load(storage), mode='sister', game=null, frame=0, previous=0, lastUI=0, finished=false, pointer=null;
const audio=createAudio(), renderer=createRenderer($('#room')), reduced=matchMedia('(prefers-reduced-motion:reduce)'), keys=new Set(), holds=new Map();
let names=[], sisterName='';
const lang=()=>getLanguage(), text=key=>t(key,lang());
function persist(){ $('#storage-note').hidden=save(storage,progress); }
function copy(){
  for(const node of $$('[data-copy]'))node.textContent=text(node.dataset.copy);
  document.title=text('title')+' | Sky Playground';
  $('.home-link').setAttribute('aria-label',text('home'));
  for(const b of $$('.close'))b.setAttribute('aria-label',text('close'));
  $('#pause').setAttribute('aria-label',text('pause'));$('#room').setAttribute('aria-label',text(mode));
  $('#play-panel').setAttribute('aria-label',text(mode));
  $('#food-progress').setAttribute('aria-label',text('food'));$('#drink-progress').setAttribute('aria-label',text('drink'));
  $('#sister-name').placeholder=text('nameSister');
  soundUI();renderNames();
  if(game){renderDinerControls();updateUI();if(game.status==='finished')resultCopy();else renderer.draw(game,lang(),progress.equipped,reduced.matches);}
  if($('#wardrobe-dialog').open)renderGear();
  if($('#records-dialog').open)renderRecords();
}
function soundUI(){for(const b of [$('#sound'),$('#play-sound')]){b.setAttribute('aria-pressed',String(audio.enabled));b.setAttribute('aria-label',text(audio.enabled?'sound':'soundOff'));}$('#sound').replaceChildren(document.createTextNode(audio.enabled?'♫ ':'♪ '),Object.assign(document.createElement('span'),{textContent:text(audio.enabled?'sound':'soundOff')}));$('#play-sound').textContent=audio.enabled?'♫':'♪';}
function soundToggle(){audio.set(!audio.enabled);if(audio.enabled&&game?.status==='playing')audio.start();soundUI();}
$('#sound').addEventListener('click',soundToggle);$('#play-sound').addEventListener('click',soundToggle);
function renderNames(){
  const old=$$('#names input').map(i=>i.value), count=Number($('#players').value);
  $('#names').replaceChildren(...Array.from({length:count},(_,i)=>{const label=document.createElement('label'),span=document.createElement('span'),input=document.createElement('input');span.textContent=`${text('nameDiner')} ${i+1}`;input.maxLength=18;input.value=old[i]||'';input.placeholder=`${text('nameDiner')} ${i+1}`;input.id=`name-${i}`;label.append(span,input);return label;}));
}
for(const button of $$('[data-mode]'))button.addEventListener('click',()=>{
  mode=button.dataset.mode;for(const b of $$('[data-mode]'))b.setAttribute('aria-pressed',String(b===button));$('#versus-options').hidden=mode!=='versus';
});
$('#players').addEventListener('change',renderNames);
const animating=new WeakMap();
function openDialog(id){const d=$(id);d.showModal();if(!reduced.matches){animating.get(d)?.cancel();animating.set(d,d.animate([{opacity:0,transform:'translateY(12px) scale(.98)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:180,easing:'cubic-bezier(.2,.8,.2,1)'}));}}
for(const b of $$('.close'))b.addEventListener('click',()=>b.closest('dialog').close());
$('#open-rules').addEventListener('click',()=>openDialog('#rules-dialog'));
$('#open-wardrobe').addEventListener('click',()=>{renderGear();openDialog('#wardrobe-dialog');});
$('#open-records').addEventListener('click',()=>{renderRecords();openDialog('#records-dialog');});
function renderGear(){
  $('#wallet').textContent=progress.coins;
  $('#gear-list').replaceChildren(...GEAR.map(item=>{
    const card=document.createElement('div');card.className='gear-card';
    const icon=document.createElement('span'),desc=document.createElement('div'),name=document.createElement('strong'),cost=document.createElement('small'),button=document.createElement('button');
    icon.textContent=item.icon;icon.setAttribute('aria-hidden','true');name.textContent=text(item.id);cost.textContent=`${item.price} 🪙`;desc.append(name,cost);
    const owned=progress.owned.includes(item.id),equipped=progress.equipped[item.slot]===item.id;
    button.type='button';button.dataset.gear=item.id;button.setAttribute('aria-pressed',String(equipped));button.textContent=text(equipped?'equipped':owned?'equip':'unlock');button.disabled=equipped;
    button.addEventListener('click',()=>{audio.unlock();const next=purchase(progress,item.id);if(next===progress){$('#shop-message').textContent=text('notEnough');return;}progress=next;persist();$('#shop-message').textContent=`${text(item.id)} · ${text('equipped')}`;renderGear();});
    card.append(icon,desc,button);return card;
  }));
}
function category(){return `${text(mode)} · ${$('#duration').value}s${mode==='versus'?` · 1v${$('#players').value}`:''}`;}
function listRecords(container,key){
  const list=progress.records[key]||[];container.replaceChildren();
  if(!list.length){const p=document.createElement('p');p.className='soft-note';p.textContent=text('emptyRecords');container.append(p);return;}
  for(const [i,r] of list.entries()) {const row=document.createElement('div'),medal=document.createElement('span'),score=document.createElement('strong'),date=document.createElement('time');row.className='record-entry';medal.className='medal';medal.textContent=['🥇','🥈','🥉'][i];score.textContent=r.score;date.dateTime=new Date(r.at).toISOString();date.textContent=new Intl.DateTimeFormat(lang(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(r.at);row.append(medal,score,date);container.append(row);}
}
function renderRecords(){const key=`${mode}-${$('#duration').value}-${mode==='versus'?$('#players').value:1}`;$('#record-category').textContent=category();listRecords($('#record-list'),key);}
function createHold(button,index,side){
  button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();audio.unlock();button.setPointerCapture(e.pointerId);holds.set(e.pointerId,{index,side,button});if(game)feet(game,index,side,true);updateUI();});
  const release=e=>{const hold=holds.get(e.pointerId);if(!hold)return;holds.delete(e.pointerId);if(game&&!Array.from(holds.values()).some(h=>h.index===index&&h.side===side))feet(game,index,side,false);updateUI();};
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  button.addEventListener('keydown',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation();if(game)feet(game,index,side,true);}});
  button.addEventListener('keyup',e=>{if([' ','Enter'].includes(e.key)){e.preventDefault();e.stopPropagation();if(game)feet(game,index,side,false);}});
  button.addEventListener('blur',()=>{if(game)feet(game,index,side,false);});
  button.addEventListener('contextmenu',e=>e.preventDefault());
}
function renderDinerControls(){
  if(!game)return;$('#diner-controls').replaceChildren();$('#diner-controls').dataset.count=game.diners.length;
  for(const d of game.diners){
    const row=document.createElement('div');row.className='diner-row';row.dataset.diner=String(d.id);row.style.setProperty('--player',['#c78139','#518c9d','#9361a2'][d.id]);
    const status=document.createElement('div'),name=document.createElement('strong'),wet=document.createElement('small'),meterWrap=document.createElement('div'),label=document.createElement('span'),meter=document.createElement('meter'),cramp=document.createElement('span'),buttons=document.createElement('div');
    status.className='diner-status';name.textContent=names[d.id]||`${text('nameDiner')} ${d.id+1}`;wet.className='diner-wet';status.append(name,wet);meterWrap.className='diner-meter';label.textContent=text('stamina');meter.min=0;meter.max=100;meter.value=0;meter.setAttribute('aria-label',`${name.textContent} ${text('stamina')}`);cramp.className='diner-cramp';meterWrap.append(label,meter,cramp);buttons.className='foot-buttons';
    for(const side of ['left','right',...(mode==='diner'?['block']:[])]){const b=document.createElement('button');b.type='button';b.dataset.foot=side;b.textContent=text(side==='block'?'menu':side);b.setAttribute('aria-label',`${name.textContent} ${b.textContent}`);b.setAttribute('aria-pressed','false');if(side==='block')b.className='menu-button';createHold(b,d.id,side);buttons.append(b);}
    row.append(status,meterWrap,buttons);$('#diner-controls').append(row);
  }
}
function start(){
  cancelAnimationFrame(frame);audio.stop();audio.unlock();keys.clear();holds.clear();pointer=null;
  $('#play-panel').dataset.mode=mode;announced='';game=createGame({mode,duration:Number($('#duration').value),players:Number($('#players').value),events:$('#events').checked});finished=false;
  sisterName=$('#sister-name').value.trim()||text('nameSister');names=$$('#names input').map((input,i)=>input.value.trim()||`${text('nameDiner')} ${i+1}`);if(mode!=='versus')names=[text('nameDiner')];
  $('#home-panel').hidden=true;$('#result-panel').hidden=true;$('#play-panel').hidden=false;document.body.classList.add('is-playing');
  $('#sister-controls').hidden=mode==='diner';$('#diner-controls').hidden=mode==='sister';$('#meal-controls').hidden=mode!=='diner';
  renderDinerControls();$('#pause').focus({preventScroll:true});window.scrollTo(0,0);updateUI();renderer.draw(game,lang(),progress.equipped,reduced.matches);
  previous=performance.now();lastUI=0;audio.start();frame=requestAnimationFrame(loop);
}
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);
function home(){
  cancelAnimationFrame(frame);audio.stop();if(game)releaseAll(game);keys.clear();holds.clear();pointer=null;game=null;
  $('#pause-dialog').close();$('#play-panel').hidden=true;$('#result-panel').hidden=true;$('#home-panel').hidden=false;document.body.classList.remove('is-playing');$('#start').focus({preventScroll:true});
}
$('#result-home').addEventListener('click',home);$('#pause-home').addEventListener('click',home);
function loop(now){
  if(!game||game.status!=='playing')return;
  const dt=Math.min((now-previous)/1000,.1);previous=now;
  if(mode!=='diner'){
    const dx=Number(keys.has('arrowright'))-Number(keys.has('arrowleft')),dy=Number(keys.has('arrowdown'))-Number(keys.has('arrowup'));
    if(dx||dy)moveMop(game,game.mop.x+dx*80,game.mop.y+dy*80);
    else if(pointer===null)game.mop.moving=false;
  }
  advance(game,dt);renderer.draw(game,lang(),progress.equipped,reduced.matches);
  for(const kind of game.sound.splice(0))audio.play(kind,lang());
  if(now-lastUI>80){updateUI();lastUI=now;}
  if(game.status==='finished'){finish();return;}
  frame=requestAnimationFrame(loop);
}
let announced='';
function updateUI(){
  if(!game)return;
  $('#clock').textContent=Math.ceil(game.remaining);$('#clock').style.color=game.remaining<10?'#b54b3c':'';$('#score').textContent=game.score;
  $('#metric-label').textContent=text(mode==='sister'?'clean':mode==='diner'?'wet':'combo');$('#metric').textContent=mode==='sister'?`${cleanPercent(game)}%`:mode==='diner'?`${game.diners[0].wet}/3`:game.combo;
  $('#tip-rating').hidden=mode!=='sister';$('#tip-rating').textContent=`${text('tips')} ${game.tips}`;$('#rage-meter').value=game.rage;$('#rage-value').textContent=game.rage>=100?text('ready'):`${Math.floor(game.rage)}%`;
  for(const id of ['shout','roar']){$('#'+id).disabled=game.time<game.shoutReady;$('#'+id).textContent=text(id)+(game.time<game.shoutReady?` ${Math.ceil(game.shoutReady-game.time)}`:'');}
  for(const id of ['cyclone','soap'])$('#'+id).disabled=game.rage<100;
  $('#food-progress').value=game.food;$('#drink-progress').value=game.drink;$('#eat-food').disabled=game.time<game.eatReady||game.food>=100;$('#eat-drink').disabled=game.time<game.eatReady||game.drink>=100;
  for(const d of game.diners){const row=$(`[data-diner="${d.id}"]`);if(!row)continue;row.querySelector('.diner-wet').textContent=d.wet>=3?text('eliminated'):`💧 ${d.wet}/3`;row.querySelector('meter').value=d.stamina;row.querySelector('.diner-cramp').textContent=game.time<d.crampUntil?`${Math.ceil(d.crampUntil-game.time)}s`:'';for(const b of row.querySelectorAll('[data-foot]')){b.disabled=d.wet>=3;b.setAttribute('aria-pressed',String(b.dataset.foot==='block'?d.block:isRaised(game,d,b.dataset.foot)));}}
  const qte=mode==='diner'&&game.time<game.qteUntil;$('#controls').classList.toggle('is-qte',qte);
  let instruction=text(mode==='sister'?'controlsSister':mode==='diner'?'controlsDiner':'controlsVersus');
  if(mode==='diner'&&game.attack)instruction=text({left:'warnLeft',right:'warnRight',sweep:'warnSweep',splash:'warnSplash'}[game.attack.kind]);else if(qte)instruction=text('biteQte');
  if(mode==='diner'&&game.time<game.diners[0].crampUntil)instruction=text('cramp');
  if(instruction!==announced){$('#play-instruction').textContent=instruction;announced=instruction;}
  $('#play-instruction').classList.toggle('is-warning',mode==='diner'&&!!game.attack);
  const banner=$('#event-banner');banner.hidden=!game.event;if(game.event)banner.textContent=text(game.event.kind);
}
function breakTime(){if(!game||game.status!=='playing')return;pause(game);cancelAnimationFrame(frame);audio.stop();keys.clear();holds.clear();pointer=null;openDialog('#pause-dialog');updateUI();}
function continueGame(){if(game?.status==='paused'){resume(game);previous=performance.now();audio.start();frame=requestAnimationFrame(loop);}}
$('#pause').addEventListener('click',breakTime);$('#resume').addEventListener('click',()=>$('#pause-dialog').close());$('#pause-dialog').addEventListener('close',continueGame);
function resultCopy(){
  if(!game)return;const win=mode==='sister'?'sister':game.winner;
  $('#result-title').textContent=text(mode==='sister'?(game.endReason==='clean'?'cleanWin':'sisterTime'):mode==='diner'?(win==='diners'?'dinerWin':'dinerLose'):(win==='sister'?'sisterWin':'dinersWin'));
  const winner=$('#winner-name');$('#result-panel').dataset.victoryOutcome=mode==='diner'&&win!=='diners'?'draw':'win';
  winner.replaceChildren(document.createTextNode(mode==='versus'?(win==='sister'?sisterName:game.diners.filter(d=>d.wet<3).map(d=>names[d.id]).join(' & ')):mode==='sister'?text('nameSister'):text('nameDiner')));
  winner.hidden=mode==='diner'&&win!=='diners';
  $('#result-score').textContent=game.score;$('#result-combo').textContent=game.bestCombo;$('#result-perfect').textContent=game.perfects;$('#result-coins').textContent=`+${reward(game)}`;$('#total-coins').textContent=progress.coins;listRecords($('#result-records'),recordKey(game));
}
function finish(){if(finished)return;finished=true;audio.stop();releaseAll(game);holds.clear();keys.clear();pointer=null;progress=settle(progress,game);persist();updateUI();resultCopy();$('#play-panel').hidden=true;document.body.classList.remove('is-playing');$('#result-panel').hidden=false;$('#again').focus({preventScroll:true});window.scrollTo(0,0);}
function doShout(roar=false){audio.unlock();if(game)shout(game,roar);updateUI();}
$('#shout').addEventListener('click',()=>doShout());$('#roar').addEventListener('click',()=>doShout(true));
for(const kind of ['cyclone','soap'])$('#'+kind).addEventListener('click',()=>{audio.unlock();if(game)superMove(game,kind);updateUI();});
$('#eat-food').addEventListener('click',()=>{audio.unlock();if(game)eatAction('food');});$('#eat-drink').addEventListener('click',()=>{audio.unlock();if(game)eatAction('drink');});
function eatAction(kind){eat(game,kind);updateUI();}
const canvas=$('#room');
canvas.addEventListener('pointerdown',e=>{if(e.button!==0||!game||game.status!=='playing'||mode==='diner'||pointer!==null)return;e.preventDefault();audio.unlock();pointer=e.pointerId;canvas.setPointerCapture(pointer);const p=renderer.point(e.clientX,e.clientY);moveMop(game,p.x,p.y);});
canvas.addEventListener('pointermove',e=>{if(e.pointerId!==pointer||!game)return;e.preventDefault();const p=renderer.point(e.clientX,e.clientY);moveMop(game,p.x,p.y);});
function releasePointer(e){if(e.pointerId!==pointer)return;pointer=null;if(game)game.mop.moving=false;}
canvas.addEventListener('pointerup',releasePointer);canvas.addEventListener('pointercancel',releasePointer);canvas.addEventListener('lostpointercapture',releasePointer);canvas.addEventListener('contextmenu',e=>e.preventDefault());
function keyFoot(key,down){
  if(!game)return false;
  const pairs=mode==='versus'?[['a','d'],['j','l'],['n','m']]:[['a','d']];
  for(let i=0;i<game.diners.length;i++)for(let j=0;j<2;j++)if(key===pairs[i]?.[j]){feet(game,i,j===0?'left':'right',down);return true;}
  if(mode==='diner'&&key==='s'){feet(game,0,'block',down);return true;}return false;
}
document.addEventListener('keydown',e=>{
  if(!game||e.target.matches('input,select,textarea'))return;
  if(e.key==='Escape'&&game.status==='playing'){e.preventDefault();breakTime();return;}
  if(game.status!=='playing'||e.target.closest('dialog'))return;
  const key=e.key.toLowerCase();
  if(keyFoot(key,true)){e.preventDefault();return;}
  if(['arrowup','arrowdown','arrowleft','arrowright'].includes(key)&&mode!=='diner'){e.preventDefault();keys.add(key);return;}
  if(e.repeat)return;
  if(mode==='diner'){if(key===' '){e.preventDefault();eatAction('food');}if(key==='enter'&&!e.target.matches('button')){e.preventDefault();eatAction('drink');}}
  else if(mode!=='diner'){if(key==='e')doShout();if(key==='q')doShout(true);if(key==='f')superMove(game,'cyclone');if(key==='g')superMove(game,'soap');}
});
document.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(game)keyFoot(e.key.toLowerCase(),false);});
document.addEventListener('visibilitychange',()=>{if(document.hidden)breakTime();});
window.addEventListener('blur',()=>{if(game?.status==='playing')breakTime();});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);audio.stop();if(game)releaseAll(game);});
window.addEventListener('resize',()=>{if(game)renderer.draw(game,lang(),progress.equipped,reduced.matches);});
document.addEventListener('languagechange',copy);
copy();
if(location.protocol.startsWith('http')&&'serviceWorker'in navigator&&!window.PLAYGROUND_RELEASE)navigator.serviceWorker.register('./sw.js').catch(()=>{});
