import {MemoryGame} from './game.js';
import {MemoryBoard} from './board.js';
import {mountPlayers,literal,enableOffline} from '../../grid-rush/src/party-ui.js';
import {translate} from '../../grid-rush/src/language.js';
const $=q=>document.querySelector(q),game=new MemoryGame(),board=new MemoryBoard($('#board')),players=mountPlayers($('#players'));
let strokes=[],pointer=null,current=null,frame=0,timer=0,review=0,cursor={x:.5,y:.5},keyboard=false,pen=false;
const say=text=>{$('#announcements').textContent=text;};
function paint(){
  const answer=game.state==='results'?game.answers[review]:null;
  board.draw({target:['viewing','results'].includes(game.state)?game.shape.points:null,strokes:answer?.drawing??(game.state==='drawing'?strokes:[]),cursor:keyboard&&game.state==='drawing'?cursor:null,pen});
}
function buttons(){const ink=strokes.some(s=>s.length>1);$('#submit').disabled=!ink||pointer!==null;$('#undo').disabled=!strokes.length;$('#clear').disabled=!strokes.length;}
function render(){
  const state=game.state,setup=state==='setup';
  $('#stage').dataset.state=state;
  $('#welcome').hidden=!setup;$('#handoff').hidden=state!=='handoff';$('#locked').hidden=state!=='locked';$('#draw-actions').hidden=state!=='drawing';$('#results').hidden=state!=='results';$('#countdown').hidden=state!=='viewing';$('#drawing-tag').hidden=state!=='drawing';
  $('#player-fields').disabled=!setup;$('#start').hidden=!setup;$('#end-round').hidden=setup;$('#sidebar').classList.toggle('in-round',!setup);
  $('#turn-count').textContent=setup?'2–6 players':`${Math.min(game.turn+1,game.players.length)} / ${game.players.length}`;
  if(setup){$('#turn-name').removeAttribute('translate');$('#turn-name').textContent=translate('Memory Trace');}
  else literal($('#turn-name'),state==='results'?'':game.players[Math.min(game.turn,game.players.length-1)]);
  if(state==='handoff')literal($('#next-player'),game.players[game.turn]);
  $('#phase-label').textContent=state==='viewing'?'THREE SECONDS. TAKE IT IN.':state==='drawing'?'YOUR MEMORY, IN A LITTLE LINE':state==='results'?'THE MEMORIES ARE IN':'A LITTLE LOOK GOES A LONG WAY';
  $('#board-help').textContent=state==='viewing'?'Look at the outline, its size and where it sits.':state==='drawing'?'Draw the outline where it was. Position and size count too.':state==='results'?'Green is the original. Coral is the remembered outline.':'Everyone gets the same shape, position and three-second look.';
  if(state==='locked')$('#next').textContent=game.turn===game.players.length-1?'Reveal our memories ↗':'Pass to the next player';
  $('#board').setAttribute('aria-label',state==='viewing'?'A special outline. Remember its shape and position.':state==='results'?'Original and remembered outlines compared.':'Memory drawing board');buttons();paint();
}
function stopTimers(){cancelAnimationFrame(frame);clearTimeout(timer);frame=0;timer=0;}
function viewingTick(){
  frame=0;if(game.state!=='viewing')return;
  if(game.advance()){stopTimers();render();$('#board').focus({preventScroll:true});say('The shape is gone. Draw it in the original place.');return;}
  $('#countdown').textContent=String(Math.ceil(game.remaining/1000));frame=requestAnimationFrame(viewingTick);
}
function cancelPointer(){const id=pointer;pointer=null;current=null;if(id!==null&&$('#board').hasPointerCapture(id))$('#board').releasePointerCapture(id);pen=false;}
function freshInk(){cancelPointer();strokes=[];keyboard=false;cursor={x:.5,y:.5};buttons();}
function start(){stopTimers();freshInk();game.start(players.names);render();$('#stage').scrollIntoView({block:'center',behavior:'instant'});$('#view').focus({preventScroll:true});}
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);
$('#view').addEventListener('click',()=>{
  if(!game.view())return;freshInk();$('#countdown').textContent='3';render();$('#stage').scrollIntoView({block:'center',behavior:'instant'});
  timer=setTimeout(viewingTick,3000);frame=requestAnimationFrame(viewingTick);say('Three seconds to remember.');
});
function hideEarly(){if(game.hide()){stopTimers();render();say('The screen was interrupted. The shape is hidden; continue drawing.');}}
document.addEventListener('visibilitychange',()=>{if(document.hidden){hideEarly();cancelPointer();}});window.addEventListener('blur',()=>{hideEarly();cancelPointer();});
function point(event){const r=$('#board').getBoundingClientRect();return {x:Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))};}
function append(p){if(!current||strokes.reduce((n,s)=>n+s.length,0)>=5000)return;const last=current.at(-1);if(!last||Math.hypot(last.x-p.x,last.y-p.y)>.0015)current.push(p);}
$('#board').addEventListener('pointerdown',event=>{
  if(game.state!=='drawing'||event.button!==0)return;
  if(pointer!==null){cancelPointer();buttons();return;}if(!event.isPrimary||strokes.length>=64)return;
  event.preventDefault();keyboard=false;pen=false;$('#board').focus({preventScroll:true});pointer=event.pointerId;current=[point(event)];strokes.push(current);$('#board').setPointerCapture(pointer);buttons();paint();
});
$('#board').addEventListener('pointermove',event=>{if(event.pointerId!==pointer)return;event.preventDefault();const points=event.getCoalescedEvents?.()??[];for(const e of points.length?points:[event])append(point(e));paint();});
$('#board').addEventListener('pointerup',event=>{if(event.pointerId!==pointer)return;append(point(event));cancelPointer();buttons();paint();});
for(const type of ['pointercancel','lostpointercapture'])$('#board').addEventListener(type,event=>{if(event.pointerId===pointer){cancelPointer();buttons();paint();}});
$('#board').addEventListener('touchmove',event=>{if(event.cancelable)event.preventDefault();},{passive:false});$('#board').addEventListener('contextmenu',event=>event.preventDefault());
$('#board').addEventListener('keydown',event=>{
  if(game.state!=='drawing'||!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key))return;event.preventDefault();keyboard=true;
  if(event.key===' '){if(event.repeat)return;pen=!pen;if(pen&&strokes.length<64){current=[{...cursor}];strokes.push(current);}else current=null;}
  else{const step=event.shiftKey ? .035 : .012;cursor.x=Math.max(0,Math.min(1,cursor.x+(event.key==='ArrowRight'?step:event.key==='ArrowLeft'?-step:0)));cursor.y=Math.max(0,Math.min(1,cursor.y+(event.key==='ArrowDown'?step:event.key==='ArrowUp'?-step:0)));if(pen)append({...cursor});}
  $('#drawing-tag').classList.toggle('pen-down',pen);$('#drawing-tag').textContent=pen?'Pen down · Space to lift':'Now draw it from memory.';buttons();paint();
});
$('#board').addEventListener('blur',()=>{pen=false;current=null;paint();});
$('#undo').addEventListener('click',()=>{cancelPointer();strokes.pop();buttons();paint();});$('#clear').addEventListener('click',()=>{freshInk();paint();});
$('#submit').addEventListener('click',()=>{cancelPointer();if(game.submit(strokes)){freshInk();render();$('#next').focus({preventScroll:true});}});
$('#next').addEventListener('click',()=>{if(!game.next())return;freshInk();if(game.state==='results')results();render();if(game.state==='results'){$('#result-title').focus({preventScroll:true});$('#results').scrollIntoView({block:'nearest',behavior:'instant'});}else $('#view').focus({preventScroll:true});});
function results(){
  review=game.winners[0].index;$('#result-title').textContent=game.winners.length>1?'A lovely shared memory.':'A memory worth celebrating.';literal($('#winner-names'),game.winners.map(r=>r.name).join(' & '));
  $('#standings').replaceChildren(...game.results.map(result=>{const row=document.createElement('li');row.className=`standing${game.winners.includes(result)?' is-winner':''}`;const place=document.createElement('span');place.textContent=String(game.results.findIndex(r=>r.percent===result.percent)+1).padStart(2,'0');const person=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('small'),score=document.createElement('output');literal(name,result.name);detail.textContent='Outline overlap';score.textContent=`${result.percent.toFixed(1)}%`;person.append(name,detail);row.append(place,person,score);return row;}));
  $('#review-tabs').replaceChildren(...game.answers.map(answer=>{const button=document.createElement('button');button.type='button';literal(button,answer.name);button.setAttribute('aria-pressed',String(answer.index===review));button.addEventListener('click',()=>{review=answer.index;for(const el of $('#review-tabs').children)el.setAttribute('aria-pressed',String(el===button));paint();$('#stage').scrollIntoView({block:'center',behavior:'instant'});});return button;}));
  say('All drawings are complete. Compare your overlap percentages.');
}
function setup(){stopTimers();freshInk();game.reset();render();$('#player-fields').disabled=false;$('#start').focus({preventScroll:true});}
$('#change').addEventListener('click',setup);$('#end-round').addEventListener('click',setup);
new ResizeObserver(()=>{cancelPointer();board.resize();buttons();paint();}).observe($('#board'));board.resize();render();enableOffline($('#offline-status'));
