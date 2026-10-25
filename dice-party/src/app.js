import {DiceGame} from './game.js';
import {ShakeDetector} from './motion.js';
import {mountPlayers,literal,enableOffline} from '../../grid-rush/src/party-ui.js';
import {reducedMotion} from '../../grid-rush/src/playground-ui.js';
import {translate} from '../../grid-rush/src/language.js';
const $=q=>document.querySelector(q),game=new DiceGame(),players=mountPlayers($('#players')),detector=new ShakeDetector();
const modeNames={high:'Highest total wins',low:'Lowest total wins',poker:'Five-dice poker'};
let frame=0,timer=0,watchdog=0,requested=false,motionEnabled=false,motionState='idle',lastReading=0,lastVisual=-1,previousCount='1';
const say=text=>{$('#announcements').textContent=text;};
function dieMarkup(value){
  if(value==null)return '<span class="question" aria-hidden="true">?</span>';
  const positions={1:[[32,32]],2:[[18,18],[46,46]],3:[[18,18],[32,32],[46,46]],4:[[18,18],[46,18],[18,46],[46,46]],5:[[18,18],[46,18],[32,32],[18,46],[46,46]],6:[[18,16],[46,16],[18,32],[46,32],[18,48],[46,48]]};
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${positions[value].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5.3"/>`).join('')}</svg>`;
}
function dice(values){
 const tray=$('#dice-tray');if(tray.children.length!==values.length)tray.replaceChildren(...values.map((_,i)=>{const el=document.createElement('div');el.className='die';el.style.setProperty('--die',i);el.style.setProperty('--rest',`${[-7,5,-3,8,-5][i]}deg`);el.setAttribute('role','img');return el;}));
 const names=['front','back','right','left','top','bottom'];
 values.forEach((value,i)=>{const el=tray.children[i];let cube=el.querySelector('.die-cube');if(!cube){cube=document.createElement('span');cube.className='die-cube';for(const face of names){const side=document.createElement('span');side.dataset.side=face;cube.append(side);}el.replaceChildren(cube);}
  const remaining=value==null?[]:[1,2,3,4,5,6].filter(n=>n!==value&&n!==7-value),side=remaining[0],top=remaining.find(n=>n!==side&&n!==7-side),faces=value==null?Array(6).fill(null):[value,7-value,side,7-side,top,7-top];
  faces.forEach((n,j)=>{const face=cube.children[j];face.className=`die-face die-${names[j]} ${n===1||n===4?'pips-red':'pips-blue'}`;face.dataset.value=n??'';face.innerHTML=dieMarkup(n);});el.setAttribute('aria-label',value==null?'Die not rolled':`Die ${i+1}: ${value}`);
 });
}

function motionNote(){
  $('#motion-status').textContent=motionState==='denied'?'Motion permission was not granted. The roll button works normally.':motionState==='unsupported'?'Phone motion is unavailable here. Use the roll button.':motionState==='silent'?'No motion readings arrived. The roll button is ready.':motionEnabled?'Shake the phone or tap the button. Both give the same fair roll.':'Use the roll button, or enable phone shake.';
  $('#enable-motion').hidden=motionEnabled||game.state!=='ready';
}
function render(){
  const state=game.state,setup=state==='setup',rolling=state==='rolling',locked=state==='locked';
  $('#stage').dataset.state=state;
  $('#welcome').hidden=!setup;$('#handoff').hidden=state!=='handoff';$('#results').hidden=state!=='results';$('#play-actions').hidden=!['ready','rolling','locked'].includes(state);
  $('#settings').disabled=!setup;$('#start').hidden=!setup;$('#end-round').hidden=setup;$('#sidebar').classList.toggle('in-round',!setup);
  $('#roll').hidden=locked;$('#roll').disabled=rolling;$('#next').hidden=!locked;$('#next').textContent=game.turn===game.players.length-1?'See who won ↗':'Pass to the next player';
  $('#phase-label').textContent=rolling?'A LITTLE LUCK IS IN MOTION':state==='results'?'A LITTLE LUCK, REVEALED':'A LITTLE LUCK GOES A LONG WAY';
  $('#turn-count').textContent=setup?'2–6 players':`${Math.min(game.turn+1,game.players.length)} / ${game.players.length}`;
  if(setup){$('#turn-name').removeAttribute('translate');$('#turn-name').textContent=translate('Dice & Delight');}else literal($('#turn-name'),state==='results'?'':game.players[Math.min(game.turn,game.players.length-1)]);
  if(state==='handoff')literal($('#next-player'),game.players[game.turn]);
  $('#rule-label').textContent=modeNames[setup?$('#mode').value:game.mode];const count=setup?Number($('#count').value):game.count;$('#dice-count-label').textContent=count===1?'1 die':`${count} dice`;
  $('#dice-tray').classList.toggle('rolling',rolling&&!reducedMotion.matches);$('#dice-tray').classList.toggle('settled',locked&&!reducedMotion.matches);
  const result=locked?game.answers.at(-1):state==='results'?game.winners[0]:null;dice(result?.dice??Array(count).fill(null));
  $('#roll-total').textContent=result?String(result.total):'?';$('#roll-detail').textContent=rolling?'A little luck is tumbling…':result?.detail??result?.hand??(result?'That’s your roll. A lovely little chance.':'A little surprise is waiting.');
  motionNote();
}
function stop(){cancelAnimationFrame(frame);clearTimeout(timer);clearTimeout(watchdog);frame=0;timer=0;watchdog=0;}
function start(){stop();game.start(players.names,{count:Number($('#count').value),mode:$('#mode').value});detector.reset();render();$('#stage').scrollIntoView({block:'center',behavior:'instant'});$('#ready').focus({preventScroll:true});}
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);
function advance(){
  frame=0;if(game.state!=='rolling')return;
  if(game.advance()){stop();render();$('#next').focus({preventScroll:true});say(`Your dice total is ${game.answers.at(-1).total}.`);return;}
  if(!reducedMotion.matches){const step=Math.floor(performance.now()/90);if(step!==lastVisual){lastVisual=step;dice(Array.from({length:game.count},(_,i)=>(step+i*2)%6+1));}}
  frame=requestAnimationFrame(advance);
}
function roll(){
  if(document.hidden||!game.shake())return;clearTimeout(watchdog);lastVisual=-1;render();timer=setTimeout(advance,Math.max(0,game.until-performance.now()));frame=requestAnimationFrame(advance);
}
async function motion(){
  requested=true;const Motion=window.DeviceMotionEvent;
  if(!Motion){motionState='unsupported';motionNote();return;}
  try{
    // The permission request is invoked directly from the player's click.
    if(typeof Motion.requestPermission==='function'&&await Motion.requestPermission()!=='granted'){motionState='denied';motionNote();return;}
    motionEnabled=true;motionState='enabled';lastReading=performance.now();detector.reset();motionNote();
    clearTimeout(watchdog);watchdog=setTimeout(()=>{if(game.state==='ready'&&performance.now()-lastReading>=1700){motionState='silent';motionNote();}},1800);
  }catch{motionState='denied';motionNote();}
}
window.addEventListener('devicemotion',event=>{
  if(!motionEnabled||document.hidden||game.state!=='ready')return;
  const useful=[event.acceleration,event.accelerationIncludingGravity].some(v=>v&&['x','y','z'].every(k=>Number.isFinite(v[k])));if(!useful)return;
  lastReading=performance.now();if(motionState==='silent'){motionState='enabled';motionNote();}
  if(detector.sample(event,lastReading))roll();
});
$('#ready').addEventListener('click',()=>{if(!game.ready())return;detector.reset();if(!requested)void motion();render();$('#roll').focus({preventScroll:true});});
$('#enable-motion').addEventListener('click',()=>void motion());$('#roll').addEventListener('click',roll);
$('#next').addEventListener('click',()=>{if(!game.next())return;detector.reset();if(game.state==='results')results();render();if(game.state==='results'){$('#result-title').focus({preventScroll:true});$('#results').scrollIntoView({block:'nearest',behavior:'instant'});}else $('#ready').focus({preventScroll:true});});
function results(){
  $('#result-title').textContent=game.winners.length>1?'A lovely shared win.':'A lovely lucky roll.';literal($('#winner-names'),game.winners.map(r=>r.name).join(' & '));
  $('#standings').replaceChildren(...game.results.map(result=>{const row=document.createElement('li');row.className=`standing${game.winners.includes(result)?' is-winner':''}`;const place=document.createElement('span');place.textContent=String(game.results.findIndex(r=>JSON.stringify(r.key)===JSON.stringify(result.key))+1).padStart(2,'0');const person=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('small'),pips=document.createElement('small'),score=document.createElement('output');literal(name,result.name);detail.textContent=result.detail??result.hand??modeNames[game.mode];pips.className='mini-dice';pips.innerHTML=result.dice.map(value=>`<span class="mini-result-die ${value===1||value===4?'pips-red':'pips-blue'}" role="img" aria-label="${value}">${dieMarkup(value)}</span>`).join('');pips.setAttribute('translate','no');score.textContent=String(result.total);person.append(name,detail,pips);row.append(place,person,score);return row;}));
  $('#tie-note').textContent=game.mode==='poker'?'Poker is ranked by hand type and tie-break dice, not by the displayed total.':'Totals decide this round. Equal totals share the win.';say('Everyone has rolled. The results are ready.');
}
function setup(){stop();game.reset();detector.reset();render();$('#start').focus({preventScroll:true});}
$('#change').addEventListener('click',setup);$('#end-round').addEventListener('click',setup);
function options(){const poker=$('#mode').value==='poker';if(poker){previousCount=$('#count').value;$('#count').value='5';}else if($('#count').disabled){$('#count').value=previousCount;}$('#count').disabled=poker;$('#poker-note').hidden=!poker;$('#mode-note').textContent=poker?'Five dice. Compare the hand type first, then its matching faces and remaining dice.':$('#mode').value==='low'?'Add the dice. The smallest total wins. Equal totals share the win.':'Add the dice. The biggest total wins. Equal totals share the win.';render();}
$('#mode').addEventListener('change',options);$('#count').addEventListener('change',render);
document.addEventListener('visibilitychange',()=>{detector.reset();if(!document.hidden&&game.state==='rolling')advance();});window.addEventListener('blur',()=>detector.reset());
options();enableOffline($('#offline-status'));
