import {beginStroke,moveStroke,strokeShape,finishStroke,pinchProgress} from './gestures.js';
import {RitualGame,PHASES,BEAT_INTERVAL} from './game.js';
import {WORRIES,WEAPONS,DECOR,FRIENDS,CHANTS,MAX_DECOR_LEVEL,weaponScoreMultiplier,decorHourlyRate,DECOR_LEVEL_RATE_BONUS} from './catalog.js';
import {STORAGE_KEY,readProgress,collectIdle,idleRate,buyWeapon,consumeWeapon,upgrade,decorDurability,repairCost,repairDecor,discardDecor,reward} from './progress.js';
import {weaponArt,dollArt,tigerArt,porkArt,fongCostumeArt,decorArt,ghostArt} from './art.js';
import {StallAudio} from './audio.js';
import {getLanguage,translate} from '../../grid-rush/src/language.js';
import {enableOffline} from '../../grid-rush/src/party-ui.js';
const $=selector=>document.querySelector(selector),game=new RitualGame(),audio=new StallAudio(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const phaseNames={incense:'Light a little incense',worry:'Give the worry a name',beat:'Whack the bad luck away',tiger:'Feed the white tiger',blessing:'Welcome good fortune'};
const lines={incense:'Three little sticks. One slow breath. No need to rush.',worry:'Write it down. You do not have to carry it home.',beat:'Tap away the overtime. Leave room for a pineapple bun.',tiger:'Give the tiger a snack. Let the gossip stop here.',blessing:'Bad luck out. Good company in. Save some kindness for yourself.'};
let storage=null,persistent=true,state,kind='work',frame=0,lastPhase='',lastChant=-1,lastBeat=-1,lastQte=0,receipt='',recorded=false,savedScroll=0,paperAnimation=null,shoeAnimation=null,sequence=0,shopTimer=0;
const illustratedDecor=new Set(['cat','radio','incense','tiger','aquarium','three-stars','money-tree','amethyst']);
const shopWeapons=WEAPONS.filter(w=>!w.starter&&w.id!=='rebirth-paper').sort((a,b)=>a.cost-b.cost||a.merit-b.merit);
shopWeapons.splice(-1,0,WEAPONS.find(w=>w.id==='rebirth-paper'));
let rigAnimations=[],cryDuration=1100;
const gestures=new Map();let pinch=null,gestureSerial=0;let incenseGesture=null,porkGesture=null,micRevision=0,micStream=null,micContext=null,micFrame=0;
try{storage=localStorage;state=readProgress(storage.getItem(STORAGE_KEY));}catch{state=readProgress(null);persistent=false;}
const itemName=item=>item.nameZh?(getLanguage()==='zh-Hant'?item.nameZh:item.name):translate(item.name);
const say=text=>{$('#announcements').textContent=translate(text);};
const vibrate=pattern=>{try{navigator.vibrate?.(pattern);}catch{}};
const qteHints={double:'Two quick taps!',heavy:'Swipe for a heavy whack!',rub:'Rub back and forth!',circle:'Draw a full circle!',pinch:'Bring two fingers together!'};
function feedback(text){literal($('#hit-feedback'),translate(text));}
const literal=(element,text)=>{element.textContent=text;element.setAttribute('translate','no');};
function save(){try{storage?.setItem(STORAGE_KEY,JSON.stringify(state));}catch{persistent=false;}$('#storage-note').textContent=persistent?'Saved on this device.':'Storage is unavailable. Your stall lasts for this visit.';}
function settle(){const idle=collectIdle(state);state=idle.state;if(idle.earned){$('#idle-welcome').hidden=false;$('#idle-welcome').textContent=`Your stall earned ${idle.earned} oil money while you were away.`;}if(idle.lost.length){$('#decor-loss-note').hidden=false;literal($('#decor-loss-note'),translate(`Worn-out decorations removed: ${idle.lost.map(id=>itemName(DECOR.find(d=>d.id===id))).join('、')}`));say('A decoration wore out. You can replace it in the stall.');}save();return idle;}
function message(text){$('#shop-message').textContent=text;clearTimeout(shopTimer);shopTimer=setTimeout(()=>$('#shop-message').textContent='',4500);say(text);}
function drawWorries(){
 $('#worry-options').replaceChildren(...WORRIES.map(w=>{const button=document.createElement('button');button.type='button';button.className='worry-option';button.dataset.worry=w.id;button.textContent=w.label;button.setAttribute('aria-pressed',String(kind===w.id));button.addEventListener('click',()=>{kind=w.id;$('#worry-input').value='';for(const item of $('#worry-options').children)item.setAttribute('aria-pressed',String(item===button));});return button;}));
}
function rowText(title,detail){const div=document.createElement('div'),name=document.createElement('b'),small=document.createElement('small');literal(name,translate(title));small.textContent=detail;div.append(name,small);return div;}
function renderDecorDisplay(){
 for(const decor of DECOR){
  const display=$(decor.expanded?'#stall-extension':'#stall-furnishings');
  const level=state.decor[decor.id]??0;let piece=display.querySelector(`[data-piece="${decor.id}"]`);
  if(!level){if(piece&&!piece.dataset.removing){if(reduced.matches)piece.remove();else{piece.dataset.removing='true';piece.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'translateY(8px) scale(.65) rotate(10deg)'}],{duration:350,fill:'forwards'}).finished.then(()=>piece.remove()).catch(()=>{});}}continue;}
  if(piece?.dataset.removing){piece.remove();piece=null;}
  const previous=Number(piece?.dataset.level)||0;
  if(!piece){
   piece=document.createElement('li');piece.className=`stall-piece piece-${decor.id}`;piece.dataset.piece=decor.id;
   piece.innerHTML=`<span class="furnishing-art" aria-hidden="true">${decorArt(decor.id)}</span><span class="furnishing-condition" aria-hidden="true"><i></i></span><span class="furnishing-level" aria-hidden="true"></span><span class="sr-only" translate="no"></span>`;
   display.append(piece);
  }
  piece.title=itemName(decor);piece.dataset.label=itemName(decor);piece.dataset.level=level;const health=decorDurability(state,decor.id);piece.style.setProperty('--decor-wear',1-health/100);piece.style.setProperty('--decor-health',health/100);piece.classList.toggle('is-weathered',health<70);piece.classList.toggle('is-fragile',health<25);piece.querySelector('.furnishing-level').textContent=level;
  literal(piece.querySelector('.sr-only'),`${itemName(decor)} · ${translate(`Level ${level} / ${MAX_DECOR_LEVEL} · ${decorHourlyRate(decor,level)} oil per hour`)} · ${translate(`Durability ${Math.max(.1,Math.round(health*10)/10)}%`)}`);
  if((previous&&level>previous)||(!previous&&displayReady)){
   if(!reduced.matches)piece.animate([{transform:'translateY(-12px) scale(.65) rotate(-9deg)',filter:'brightness(1.8)'},{transform:'translateY(2px) scale(1.12) rotate(4deg)'},{transform:'translateY(0) scale(1) rotate(0)',filter:'brightness(1)'}],{duration:650,easing:'cubic-bezier(.2,.8,.3,1)'});
  }
 }
 $('#stall-empty').hidden=DECOR.some(d=>!d.expanded&&state.decor[d.id]>0);$('#stall-extension').hidden=!DECOR.some(d=>d.expanded&&state.decor[d.id]>0);displayReady=true;
}
let displayReady=false;
const decorPrice=d=>(state.decor[d.id]??0)>=MAX_DECOR_LEVEL?Infinity:d.cost*((state.decor[d.id]??0)+1);
const kitScoreLabel=id=>translate(`Relief score ×${weaponScoreMultiplier(id)}`);
function renderStall(){
 $('#use-hands').disabled=state.equipped==='bare-hand';$('#coins').textContent=state.coins;$('#merit').textContent=state.merit;$('#idle-note').textContent=`Your stall earns ${idleRate(state)} oil money per hour.`;
 const kit=WEAPONS.find(w=>w.id===state.equipped);$('#equipped-art').innerHTML=weaponArt(kit.id);literal($('#equipped-name'),`${itemName(kit)} · ${kitScoreLabel(kit.id)}`);
 renderDecorDisplay();
 $('#play-panel').classList.toggle('has-neon',state.decor.neon>0);$('#play-panel').classList.toggle('has-incense',state.decor.incense>0);for(const id of illustratedDecor)$('#stall-'+id).hidden=!state.decor[id];
 renderDecorRows();
 $('#weapon-list').replaceChildren(...shopWeapons.map(w=>{const row=document.createElement('div');row.className='kit-row';const icon=document.createElement('span');icon.className='kit-art';icon.setAttribute('aria-hidden','true');icon.innerHTML=weaponArt(w.id);const owned=state.owned.includes(w.id),equipped=state.equipped===w.id,button=document.createElement('button');button.type='button';button.dataset.weapon=w.id;button.disabled=equipped||(!owned&&(state.merit<w.merit||state.coins<w.cost));button.textContent=equipped?'In hand':owned?'Equip':`${w.cost} oil`;button.setAttribute('aria-label',`${itemName(w)} · ${translate(button.textContent)}`);button.addEventListener('click',()=>{settle();const next=buyWeapon(state,w.id);if(!next)return;state=next;save();renderStall();message(w.cost?'Your single-use kit is ready for one ritual.':'Your hands are ready.');audio.unlock().then(()=>audio.hit(w.id,false,false));$(`[data-weapon="${w.id}"]`)?.focus({preventScroll:true});});const detail=owned?(w.cost?'One ritual left':'Free to use every time'):`Needs ${w.merit} merit`;const text=rowText(itemName(w),'');literal(text.querySelector('small'),`${kitScoreLabel(w.id)} · ${translate(detail)}`);row.append(icon,text,button);return row;}));
 $('#friend-list').replaceChildren(...FRIENDS.map(f=>{const row=document.createElement('div'),icon=document.createElement('span');const owned=state.friends.includes(f.id);row.className=`friend-row${owned?'':' is-locked'}`;icon.className='friend-icon';icon.textContent=owned?f.icon:'?';icon.setAttribute('aria-hidden','true');const text=rowText(owned?f.name:'A kind stranger',owned?'5% more ritual oil money':'Keep a little room for good company.');if(owned){const story=document.createElement('p');story.textContent=f.story;text.append(story);}row.append(icon,text);return row;}));
 $('#records').replaceChildren(...state.records.map((r,index)=>{const row=document.createElement('li'),place=document.createElement('span'),info=document.createElement('div'),name=document.createElement('b'),date=document.createElement('small'),score=document.createElement('output');row.className='record-row';place.textContent=String(index+1).padStart(2,'0');literal(name,itemName(WEAPONS.find(w=>w.id===r.weapon)));date.textContent=new Intl.DateTimeFormat(getLanguage(),{month:'short',day:'numeric'}).format(new Date(r.date));score.textContent=r.score;info.append(name,date);row.append(place,info,score);return row;}));
 if(!state.records.length){const empty=document.createElement('li');empty.className='empty-record';empty.textContent='Your first lighter evening is waiting.';$('#records').append(empty);}save();
}
function renderDecorRows(){
 $('#decor-list').replaceChildren(...[...DECOR].sort((a,b)=>decorPrice(a)-decorPrice(b)||a.cost-b.cost).map(d=>{
  const row=document.createElement('div');row.className='decor-row';const icon=document.createElement('span');icon.className='decor-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=decorArt(d.id);
  const level=state.decor[d.id],cost=d.cost*(level+1),button=document.createElement('button');button.type='button';button.dataset.decor=d.id;button.disabled=level>=MAX_DECOR_LEVEL||state.coins<cost;button.textContent=level>=MAX_DECOR_LEVEL?'Fully upgraded':`${cost} oil`;button.setAttribute('aria-label',`${itemName(d)} · ${translate(button.textContent)}`);
  button.addEventListener('click',()=>{settle();const next=upgrade(state,d.id);if(!next){renderStall();return;}state=next;save();renderStall();message('A little brighter. The neighbourhood says thanks.');audio.unlock().then(()=>audio.chime());$(`[data-decor="${d.id}"]`)?.focus({preventScroll:true});});
  const income=translate(`Level ${level} / ${MAX_DECOR_LEVEL} · ${decorHourlyRate(d,level)} oil per hour`);
  const growth=getLanguage()==='zh-Hant'?`首級 ${d.rate}，每升級 +${DECOR_LEVEL_RATE_BONUS}`:`Starts at ${d.rate}; +${DECOR_LEVEL_RATE_BONUS} per upgrade`;
  const info=rowText(itemName(d),'');literal(info.querySelector('small'),`${income} · ${growth}`);
  if(level){
   const health=decorDurability(state,d.id),percent=Math.max(.1,Math.round(health*10)/10),label=document.createElement('span'),meter=document.createElement('meter');label.className='decor-health-label';literal(label,translate(`Durability ${percent}%`));meter.className='decor-durability';meter.min=0;meter.max=100;meter.low=25;meter.high=70;meter.optimum=100;meter.value=health;meter.setAttribute('aria-label',`${itemName(d)} · ${translate(`Durability ${percent}%`)}`);info.append(label,meter);
  }
  row.append(icon,info,button);
  if(level){
   const controls=document.createElement('div'),repair=document.createElement('button'),discard=document.createElement('button'),cost=repairCost(state,d.id);controls.className='decor-controls';repair.type=discard.type='button';repair.dataset.repair=d.id;discard.dataset.discard=d.id;
   const fresh=decorDurability(state,d.id)>=99.95;repair.textContent=fresh?'Good as new':`Repair · ${cost} oil`;repair.disabled=fresh||!cost||state.coins<cost;repair.setAttribute('aria-label',`${itemName(d)} · ${translate(repair.textContent)}`);discard.textContent='Discard';discard.setAttribute('aria-label',`${translate('Discard')} · ${itemName(d)}`);
   repair.addEventListener('click',()=>{settle();const next=repairDecor(state,d.id);if(next){state=next;save();message('Good as new. Thirty more days of good company.');audio.unlock().then(()=>audio.chime());}renderStall();$(`[data-repair="${d.id}"]`)?.focus({preventScroll:true});});discard.addEventListener('click',()=>askDiscard(d.id));controls.append(repair,discard);row.append(controls);
  }
  return row;
 }));
}
let discardTarget=null;
function askDiscard(id){
 if(!state.decor[id])return;discardTarget=id;const decor=DECOR.find(d=>d.id===id);literal($('#discard-detail'),`${itemName(decor)} · ${translate(`Level ${state.decor[id]} / ${MAX_DECOR_LEVEL} · ${decorHourlyRate(decor,state.decor[id])} oil per hour`)}`);$('#discard-dialog').showModal();$('#cancel-discard').focus();
}
$('#cancel-discard').addEventListener('click',()=>$('#discard-dialog').close());
$('#discard-dialog').addEventListener('close',()=>{if(discardTarget)$(`[data-discard="${discardTarget}"]`)?.focus({preventScroll:true});discardTarget=null;});
$('#confirm-discard').addEventListener('click',()=>{
 const id=discardTarget;settle();const next=discardDecor(state,id);if(next){state=next;save();message('Decoration discarded. A little space for something new.');}$('#discard-dialog').close();renderStall();$(`[data-decor="${id}"]`)?.focus({preventScroll:true});
});
// Real time keeps moving while the game is open; do not move keyboard focus.
setInterval(()=>{if(document.hidden)return;const focused=document.activeElement,attribute=['decor','repair','discard'].find(name=>focused?.dataset?.[name]),id=attribute?focused.dataset[attribute]:null;settle();renderStall();if(id)$(`[data-${attribute}="${id}"]`)?.focus({preventScroll:true});},60000);
function lock(value){
 if(value)savedScroll=scrollY;document.body.classList.toggle('is-playing',value);
 for(const selector of ['.bbl-skip','#site-header','#intro','#stall-dashboard','#story','#rules','.bbl-footer'])$(selector).inert=value;
 if(!value)window.scrollTo({top:savedScroll,behavior:'instant'});
}
function cancelGestures(){
 for(const id of gestures.keys()){try{$('#hit-zone').releasePointerCapture(id);}catch{}}gestures.clear();pinch=null;clearGesturePreview();
 if(incenseGesture){try{$('#incense-zone').releasePointerCapture(incenseGesture.id);}catch{}incenseGesture=null;}
 if(porkGesture){try{$('#pork-piece').releasePointerCapture(porkGesture.id);}catch{}porkGesture=null;}
 $('#pork-piece').style.translate='';$('#striking-weapon').style.transform='';$('#paper-tiger').classList.remove('is-ready');
}
function start(){
 if(PHASES.includes(game.phase))return;settle();recorded=false;receipt=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${++sequence}`;
 const preset=WORRIES.find(w=>w.id===kind);game.start({kind,worry:$('#worry-input').value.trim()||translate(preset.label),weapon:state.equipped});
 lastPhase='';lastChant=-1;lastBeat=-1;lastQte=0;$('#welcome').hidden=true;$('#result').hidden=true;$('#ritual-stage').hidden=false;$('#ritual-stage').inert=false;$('#pause-overlay').hidden=true;lock(true);
 audio.voice=$('#voice').checked;unlockSound();renderPhase();cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);
}
function renderPhase(){
 if(game.phase===lastPhase)return;lastPhase=game.phase;$('#play-panel').dataset.phase=game.phase;cancelGestures();stopMicrophone();$('#effects').replaceChildren();
 if(game.phase==='results'){finish();return;}
 $('#phase-title').textContent=phaseNames[game.phase];$('#fong-line').textContent=lines[game.phase];
 for(const item of document.querySelectorAll('.phase-panel'))item.hidden=item.id!==`phase-${game.phase}`;
 const index=PHASES.indexOf(game.phase);for(const item of document.querySelectorAll('[data-step]')){const i=PHASES.indexOf(item.dataset.step);item.classList.toggle('is-current',i===index);item.classList.toggle('is-done',i<index);if(i===index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');}
 if(game.phase==='incense'){for(const stick of document.querySelectorAll('[data-stick]'))stick.classList.remove('is-lit');$('#phase-incense').classList.remove('is-blown');$('#blow').disabled=true;$('#mic-note').textContent='The button works without a microphone.';}
 if(game.phase==='worry')literal($('#named-worry'),game.worry);
 if(game.phase==='beat'){$('#paper-doll').innerHTML=dollArt(game.kind,game.look);literal($('#doll-label'),game.worry);$('#striking-weapon').innerHTML=weaponArt(game.weapon);feedback('Find your rhythm.');$('#hit-zone').dataset.lastGesture='';paintPaperWear();}
 if(game.phase==='tiger'){$('#paper-tiger').innerHTML=tigerArt();$('#pork-piece').innerHTML=porkArt();$('#phase-tiger').classList.remove('is-fed');}
 if(game.phase==='blessing'){$('#bless').classList.remove('is-burning');audio.chime();}
 $('#phase-title').focus({preventScroll:true});say(phaseNames[game.phase]);audio.speak(translate(lines[game.phase]),getLanguage());
}
function paintPaperWear(){
 const wear=game.wear,paper=$('#paper-doll');paper.classList.toggle('is-crying',game.hits>0&&performance.now()-game.lastHit<cryDuration);paper.style.setProperty('--paper-wear',wear);paper.style.setProperty('--paper-tear',Math.max(0,Math.min(1,(wear-.2)/.5)));paper.style.setProperty('--edge-loss',Math.max(0,Math.min(1.2,(wear-.25)/.65)));paper.style.setProperty('--paper-punch',Math.max(0,Math.min(1,(wear-.75)/.25)));
 for(const [index,threshold]of [.2,.38,.55].entries())paper.style.setProperty(`--edge-loss-${index}`,Math.max(0,Math.min(1,(wear-threshold)/(1-threshold))));paper.style.setProperty('--paper-patch',Math.max(0,Math.min(1,(wear-.5)/.3)));paper.style.setProperty('--head-slump',`${wear*6}deg`);paper.style.setProperty('--head-drop',`${wear*3}px`);
 const stage=Math.min(3,Math.floor(wear*4));paper.dataset.wearStage=stage;const text=['Fresh paper','Creased paper','Torn paper','Tattered paper'][stage];if($('#paper-condition').dataset.stage!==String(stage)){$('#paper-condition').dataset.stage=stage;literal($('#paper-condition'),translate(text));}
}
function tick(){
 frame=0;if(game.pausedAt!==null||!PHASES.includes(game.phase))return;game.advance();renderPhase();if(game.phase==='results')return;
 $('#phase-clock').textContent=Math.ceil(game.remaining/1000);
 if(game.phase==='beat'){
   $('#live-score').textContent=game.score;$('#live-combo').textContent=performance.now()-game.lastHit>800?0:game.combo;$('#live-papers').textContent=game.papers;
   paintPaperWear();
   const beat=Math.floor(game.elapsed/BEAT_INTERVAL);if(beat!==lastBeat){lastBeat=beat;audio.tone(420,.045,'triangle',.018);}
   const pulse=game.elapsed%BEAT_INTERVAL;$('#rhythm-pulse').style.setProperty('--beat-scale',1+Math.max(0,1-pulse/160)*.65);
   $('#qte-call').hidden=!game.qte;if(game.qte){$('#qte-call').textContent=qteHints[game.qte.type];if(lastQte!==game.qteIndex){lastQte=game.qteIndex;say($('#qte-call').textContent);audio.tone(780,.12,'sine',.06);}}
   for(const button of document.querySelectorAll('[data-gesture]'))button.classList.toggle('is-prompted',(game.qte?.type==='double'?'tap':game.qte?.type)===button.dataset.gesture);
   const chant=Math.floor(game.elapsed/4000);if(chant!==lastChant){lastChant=chant;const line=CHANTS[chant%CHANTS.length];$('#fong-line').textContent=line;audio.speak(translate(line),getLanguage());if(chant===3){audio.tone(1050,.4,'sine',.045);audio.tone(790,.4,'sine',.03,.2);}}
 }
 frame=requestAnimationFrame(tick);
}
function sparks(large=false){
 if(reduced.matches)return;const count=Math.min(large?22:10,Math.max(0,80-$('#effects').childElementCount));for(let i=0;i<count;i++){const piece=document.createElement('i');piece.className='spark';piece.style.setProperty('--sx',`${Math.cos(i*2.4)*(large?130:70)}px`);piece.style.setProperty('--sy',`${Math.sin(i*2.4)*(large?110:75)-40}px`);piece.style.setProperty('--sr',`${i*47}deg`);piece.style.setProperty('--spark-color',['#edc77e','#f2dea1','#a9c8ad','#d99d83'][i%4]);$('#effects').append(piece);setTimeout(()=>piece.remove(),750);}
}
function whack(options){
 const hit=game.hit(options);renderPhase();if(!hit)return;
 if(game.hits===1){const spent=consumeWeapon(state,game.weapon);if(spent){state=spent;save();}}
 const force=.2+Math.min(1,hit.power/9)*.8;cryDuration=900+force*900;audio.hit(game.weapon,hit.heavy,hit.perfect,hit.power);vibrate(Math.round(7+force*30));
 const paper=$('#paper-doll');paper.classList.add('is-crying');paper.style.setProperty('--hit-strength',force);paper.dataset.impact=force.toFixed(3);
 const captions={tap:'Bonk!',heavy:'WHAM!',rub:'Scrub-a-dub!',circle:'Whoooosh!',pinch:'Squeeeze!'};
 feedback(hit.qteComplete?'Lovely combo!':captions[hit.gesture]);$('#hit-zone').dataset.lastGesture=hit.gesture;paintPaperWear();
 if(!reduced.matches){
  paperAnimation?.cancel();shoeAnimation?.cancel();for(const animation of rigAnimations)animation.cancel();rigAnimations=[];
  const angle=8+force*27,travel=6+force*23,squash=1-force*.38;
  const moves={rub:[`translateX(${-travel}px) rotate(${-angle}deg)`,`translateX(${travel}px) rotate(${angle}deg)`,`translateX(${-travel*.6}px) rotate(${-angle*.5}deg)`],circle:[`rotate(${-angle}deg) scale(${1+force*.1},${squash})`,`rotate(${angle*1.4}deg) scale(${1-force*.15},${1+force*.2})`,`rotate(${-angle*.4}deg)`],pinch:[`scale(${1-force*.48},${1+force*.3})`,`scale(${1+force*.27},${1-force*.18})`,`scale(.96,1.04)`]};
  const middle=moves[hit.gesture]??[`translateY(${travel*.35}px) rotate(${-angle*.6}deg) scale(${1+force*.28},${squash})`,`translateY(${-travel*.3}px) rotate(${angle*.35}deg) scale(.93,1.12)`];
  paperAnimation=paper.animate([{transform:'none'},...middle.map(transform=>({transform})),{transform:'none'}],{duration:320+force*320,easing:'cubic-bezier(.2,.75,.3,1)'});
  const toolTravel=18+force*60,toolAngle=20+force*62;
  const toolMoves={tap:[`translate(-${toolTravel*.5}px,${toolTravel*.4}px) rotate(-${toolAngle}deg)`],heavy:[`translate(10px,-${toolTravel*.65}px) rotate(${toolAngle}deg)`,`translate(-${toolTravel}px,${toolTravel*.6}px) rotate(-${toolAngle}deg)`],rub:[`translate(-${toolTravel}px,15px) rotate(-${toolAngle}deg)`,`translate(${toolTravel*.2}px,25px) rotate(${toolAngle*.5}deg)`,`translate(-${toolTravel}px,15px) rotate(-${toolAngle}deg)`],circle:[`translate(-${toolTravel}px,-25px) rotate(-100deg)`,`translate(-${toolTravel}px,${toolTravel*.55}px) rotate(-230deg)`,`translate(10px,0) rotate(-360deg)`],pinch:[`translate(-${toolTravel}px,10px) rotate(-${toolAngle}deg)`,`translate(-${toolTravel*.5}px,10px) rotate(-15deg)`]};
  shoeAnimation=$('#striking-weapon').animate([{transform:'rotate(-18deg)'},...toolMoves[hit.gesture].map(transform=>({transform})),{transform:'rotate(-18deg)'}],{duration:260+force*260,easing:'ease-out'});
  for(const [selector,sign]of [['.paper-arm-left',-1],['.paper-arm-right',1],['.paper-leg-left',1],['.paper-leg-right',-1],['.paper-head',-.4]]){const part=paper.querySelector(selector);if(part)rigAnimations.push(part.animate([{transform:'rotate(0)'},{transform:`rotate(${sign*(18+force*58)}deg)`,offset:.23},{transform:`rotate(${-sign*(10+force*34)}deg)`,offset:.6},{transform:'rotate(0)'}],{duration:400+force*360,easing:'ease-out'}));}
  const pop=document.createElement('span');pop.className='score-pop';pop.textContent=`+${hit.points}`;$('#effects').append(pop);setTimeout(()=>pop.remove(),650);
  const word=document.createElement('span');word.className='impact-word';word.textContent=translate(captions[hit.gesture]);$('#effects').append(word);setTimeout(()=>word.remove(),700);
  const count=Math.min(Math.round(3+force*11),Math.max(0,75-$('#effects').childElementCount));for(let i=0;i<count;i++){const bit=document.createElement('i');bit.className='paper-bit';bit.style.setProperty('--dx',`${Math.cos(i*2.4)*(30+force*100)}px`);bit.style.setProperty('--dy',`${Math.sin(i*2.4)*(30+force*75)-25}px`);bit.style.setProperty('--turn',`${i*53+force*220}deg`);$('#effects').append(bit);setTimeout(()=>bit.remove(),750);}
 }
 if(hit.paperCleared||hit.qteComplete){sparks(hit.paperCleared);audio.chime();if(hit.paperCleared)say('One paper worry scattered. A little room for good things.');}
}

function finish(){
 if(recorded||!game.result)return;recorded=true;cancelAnimationFrame(frame);frame=0;cancelGestures();stopMicrophone();audio.ambience(!document.hidden);try{speechSynthesis.cancel();}catch{}
 const received=reward(state,game.result,{id:receipt});if(received){state=received.state;save();renderStall();$('#reward-line').textContent=`Oil money +${received.earned} · Merit +${received.merit}`;$('#friend-arrival').hidden=!received.friend;if(received.friend)$('#friend-arrival').textContent=`A kind visitor: ${translate(received.friend.name)}`;}
 $('#final-score').textContent=game.score;$('#final-hits').textContent=game.hits;$('#final-combo').textContent=game.bestCombo;$('#fortune-text').textContent=game.result.fortune;
 $('#ritual-stage').hidden=true;lock(false);$('#result').hidden=false;$('#result-title').focus({preventScroll:true});$('#result').scrollIntoView({block:'start',behavior:'instant'});audio.chime();say('The ritual is complete. Your fortune is ready.');
}
function backToStall(){cancelAnimationFrame(frame);frame=0;cancelGestures();stopMicrophone();audio.stop();game.reset();unlockSound();lastPhase='setup';$('#play-panel').dataset.phase='setup';$('#pause-overlay').hidden=true;$('#ritual-stage').hidden=true;$('#ritual-stage').inert=false;$('#result').hidden=true;$('#welcome').hidden=false;lock(false);renderStall();$('#start').focus({preventScroll:true});$('#play-panel').scrollIntoView({block:'nearest',behavior:'instant'});}
function pause(){if(!PHASES.includes(game.phase))return;game.pause();cancelAnimationFrame(frame);frame=0;cancelGestures();stopMicrophone();audio.stop();$('#pause-overlay').hidden=false;$('#ritual-stage').inert=true;$('#resume').focus({preventScroll:true});say('The ritual is paused. Take your time.');}
function resume(){if(!game.resume())return;$('#pause-overlay').hidden=true;$('#ritual-stage').inert=false;audio.unlock().then(()=>{if(game.pausedAt===null&&PHASES.includes(game.phase))audio.ambience(true);});$('#phase-title').focus({preventScroll:true});frame=requestAnimationFrame(tick);}
function updateSound(){
 for(const id of ['sound','sound-setup'])$(`#${id}`).setAttribute('aria-pressed',String(audio.enabled));
 const label=audio.enabled?'Mute sound':'Unmute sound';$('#sound').setAttribute('aria-label',label);$('#sound').title=translate(label);$('#sound').textContent=audio.enabled?'♫':'🔇';$('#sound-setup').textContent=audio.enabled?'Sound on':'Sound off';
}
function unlockSound(){return audio.unlock().then(()=>{audio.ambience(!document.hidden&&game.pausedAt===null);updateSound();});}
function toggleSound(){audio.setEnabled(!audio.enabled);if(audio.enabled)unlockSound();updateSound();}
// Mobile Safari may reject pointer-down activation or interrupt audio after a call.
// Keep retrying from real gesture endings instead of removing the first listener.
function beginAudio(){if(audio.enabled&&!document.hidden&&game.pausedAt===null&&audio.needsUnlock)unlockSound();}
for(const event of ['pointerup','touchend','click','keydown'])document.addEventListener(event,beginAudio,{capture:true,passive:true});

$('#use-hands').addEventListener('click',()=>{state=buyWeapon(state,'bare-hand');save();renderStall();message('Your hands are ready.');});
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);$('#to-stall').addEventListener('click',backToStall);$('#pause').addEventListener('click',pause);$('#resume').addEventListener('click',resume);$('#quit').addEventListener('click',backToStall);$('#sound').addEventListener('click',toggleSound);$('#sound-setup').addEventListener('click',toggleSound);
function light(index){if(!game.light(index))return;document.querySelector(`[data-stick="${index}"]`).classList.add('is-lit');$('#blow').disabled=game.lit.size!==3;audio.noise(.07,.035,2500);vibrate(6);}
for(const stick of document.querySelectorAll('[data-stick]'))stick.addEventListener('click',event=>{if(event.detail===0)light(Number(stick.dataset.stick));});
$('#incense-zone').addEventListener('pointerdown',event=>{if(game.phase!=='incense'||event.button!==0||game.pausedAt!==null)return;event.preventDefault();const rect=event.currentTarget.getBoundingClientRect();incenseGesture={id:event.pointerId,x:event.clientX,y:event.clientY,index:Math.max(0,Math.min(2,Math.floor((event.clientX-rect.left)/rect.width*3)))};event.currentTarget.setPointerCapture(event.pointerId);});
$('#incense-zone').addEventListener('pointerup',event=>{const gesture=incenseGesture;if(!gesture||gesture.id!==event.pointerId)return;incenseGesture=null;if(Math.abs(event.clientX-gesture.x)>55){for(let i=0;i<3;i++)light(i);}else light(gesture.index);});$('#incense-zone').addEventListener('pointercancel',()=>incenseGesture=null);
function blow(){if(!game.blow())return;$('#phase-incense').classList.add('is-blown');$('#blow').disabled=true;$('#fong-line').textContent='One slow breath. Let your shoulders settle.';stopMicrophone();audio.noise(.22,.05,700);}
$('#blow').addEventListener('click',blow);$('#confirm-worry').addEventListener('click',()=>{if(game.confirm()){$('#fong-line').textContent='Written down. You can put it down now.';audio.tone(380,.15,'triangle',.08);}});
function clearGesturePreview(){
 $('#hit-zone').classList.remove('is-gesturing');$('#gesture-trail-path').setAttribute('d','');$('#gesture-charge').style.setProperty('--charge','0%');$('#striking-weapon').style.transform='';
}
function previewGesture(stroke){
 const shape=strokeShape(stroke),rect=$('#hit-zone').getBoundingClientRect();
 if(!reduced.matches){const points=stroke.points.slice(-36);$('#gesture-trail-path').setAttribute('d',points.map((p,i)=>`${i?'L':'M'}${(p.x-rect.x)/rect.width*100},${(p.y-rect.y)/rect.height*100}`).join(' '));}
 let type=shape.gesture,progress=shape.progress;
 if(pinch){type='pinch';progress=pinch.progress;}
 else if(progress===0){type='heavy';progress=Math.min(1,stroke.length/100);}
 $('#hit-zone').classList.add('is-gesturing');$('#gesture-charge').style.setProperty('--charge',`${progress*100}%`);$('#gesture-charge').textContent={heavy:'↓',rub:'↔',circle:'↻',pinch:'⇢⇠'}[type];
 if(progress>=1)feedback(type==='heavy'?'Release for a heavy whack.':type==='pinch'?'Pinch! A little less pressure.':'Ready! Lift your finger.');
 else if(type==='circle')feedback('Keep circling…');else if(type==='rub')feedback('Back and forth. Keep rubbing!');else if(type==='pinch')feedback('Bring two fingers together!');
}
const zone=$('#hit-zone');
zone.addEventListener('pointerdown',event=>{
 if(event.button!==0||game.phase!=='beat'||game.pausedAt!==null||gestures.size>=2)return;
 event.preventDefault();const stroke=beginStroke(event.clientX,event.clientY,performance.now());stroke.pointerType=event.pointerType;gestures.set(event.pointerId,stroke);zone.setPointerCapture(event.pointerId);
 if(gestures.size===2&&[...gestures.values()].every(g=>g.pointerType==='touch')){const ids=[...gestures.keys()],[a,b]=ids.map(id=>gestures.get(id));pinch={ids,initial:Math.hypot(a.lastX-b.lastX,a.lastY-b.lastY),progress:0,done:false,started:performance.now()};}
});
zone.addEventListener('pointermove',event=>{
 const stroke=gestures.get(event.pointerId);if(!stroke||stroke.consumed)return;
 for(const sample of [...(event.getCoalescedEvents?.()??[]),event])moveStroke(stroke,sample.clientX,sample.clientY);
 const dx=event.clientX-stroke.x,dy=event.clientY-stroke.y;$('#striking-weapon').style.transform=`translate(${Math.max(-25,Math.min(25,dx*.12))}px,${Math.max(-25,Math.min(25,dy*.12))}px) rotate(${-18+Math.min(35,Math.abs(dy)*.12)}deg)`;
 if(pinch&&!pinch.done){const [a,b]=pinch.ids.map(id=>gestures.get(id));if(a&&b){pinch.progress=pinchProgress(pinch.initial,Math.hypot(a.lastX-b.lastX,a.lastY-b.lastY));if(pinch.progress>=1){pinch.done=true;a.consumed=b.consumed=true;whack({gesture:'pinch',strength:Math.min(1,.4+pinch.initial/220+pinch.progress/Math.max(1,(performance.now()-pinch.started)/140)),pointer:`pinch-${++gestureSerial}`});}}}
 previewGesture(stroke);
});
zone.addEventListener('pointerup',event=>{
 const stroke=gestures.get(event.pointerId);if(!stroke)return;moveStroke(stroke,event.clientX,event.clientY);gestures.delete(event.pointerId);if(pinch?.ids.includes(event.pointerId))pinch=null;
 if(!stroke.consumed){const action=finishStroke(stroke,performance.now());if(action)whack({...action,pointer:event.pointerId});else feedback('Try a full circle or three back-and-forth strokes.');}
 if(!gestures.size)clearGesturePreview();
});
function cancelPointer(event){const stroke=gestures.get(event.pointerId);if(!stroke)return;gestures.delete(event.pointerId);if(pinch?.ids.includes(event.pointerId)){for(const id of pinch.ids){const other=gestures.get(id);if(other)other.consumed=true;}pinch=null;}clearGesturePreview();}
zone.addEventListener('pointercancel',cancelPointer);zone.addEventListener('lostpointercapture',cancelPointer);
zone.addEventListener('click',event=>{if(event.detail===0)whack({pointer:'keyboard'});});
for(const button of document.querySelectorAll('[data-gesture]'))button.addEventListener('click',()=>whack({gesture:button.dataset.gesture,pointer:`button-${button.dataset.gesture}`}));

function feed(){
 if(!game.feed())return;const piece=$('#pork-piece'),target=mouth(),r=piece.getBoundingClientRect();$('#phase-tiger').classList.add('is-fed');$('#fong-line').textContent='The white tiger has had enough gossip for today.';audio.chomp();vibrate([12,25,20]);
 if(!reduced.matches){piece.animate([{transform:'translate(0,0) rotate(0) scale(1)',opacity:1},{transform:`translate(${target.x-r.x-r.width/2}px,${target.y-r.y-r.height/2}px) rotate(80deg) scale(.12)`,opacity:0}],{duration:420,easing:'cubic-bezier(.3,.1,.6,1)'});$('#paper-tiger').animate([{transform:'scale(1)'},{transform:'scale(1.3,.86) rotate(-8deg)',offset:.3},{transform:'scale(.91,1.22) rotate(6deg)',offset:.56},{transform:'scale(1.06,.97)',offset:.8},{transform:'scale(1)'}],{duration:850,easing:'ease-out'});sparks();}
}
const pork=$('#pork-piece');function mouth(){const r=$('#paper-tiger .tiger-mouth').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};}
pork.addEventListener('pointerdown',event=>{if(event.button!==0||game.phase!=='tiger'||game.fed||game.pausedAt!==null)return;event.preventDefault();const r=pork.getBoundingClientRect();porkGesture={id:event.pointerId,x:event.clientX,y:event.clientY,cx:r.x+r.width/2,cy:r.y+r.height/2};pork.setPointerCapture(event.pointerId);});
pork.addEventListener('pointermove',event=>{const g=porkGesture;if(!g||g.id!==event.pointerId)return;const dx=event.clientX-g.x,dy=event.clientY-g.y,target=mouth(),x=g.cx+dx,y=g.cy+dy,distance=Math.hypot(x-target.x,y-target.y),pull=Math.max(0,1-distance/90)**2*.5;pork.style.translate=`${dx+(target.x-x)*pull}px ${dy+(target.y-y)*pull}px`;$('#paper-tiger').classList.toggle('is-ready',distance<90);});
pork.addEventListener('pointerup',event=>{const g=porkGesture;if(!g||g.id!==event.pointerId)return;const target=mouth(),distance=Math.hypot(g.cx+event.clientX-g.x-target.x,g.cy+event.clientY-g.y-target.y);porkGesture=null;$('#paper-tiger').classList.remove('is-ready');if(distance<80)feed();else pork.style.translate='';});pork.addEventListener('pointercancel',()=>{porkGesture=null;pork.style.translate='';$('#paper-tiger').classList.remove('is-ready');});pork.addEventListener('click',event=>{if(event.detail===0)feed();});$('#feed').addEventListener('click',feed);
$('#bless').addEventListener('click',()=>{if(!game.bless())return;$('#bless').classList.add('is-burning');sparks(true);audio.chime();vibrate([15,30,15]);});
function stopMicrophone(){micRevision++;cancelAnimationFrame(micFrame);micFrame=0;micStream?.getTracks().forEach(track=>track.stop());micStream=null;micContext?.close().catch(()=>{});micContext=null;$('#microphone').disabled=false;$('#microphone').textContent='Use microphone';}
$('#microphone').addEventListener('click',async()=>{
 if(micStream){stopMicrophone();$('#mic-note').textContent='The button works without a microphone.';return;}
 if(game.phase!=='incense'||game.blown||game.pausedAt!==null)return;
 const revision=++micRevision;$('#microphone').disabled=true;$('#mic-note').textContent='Microphone permission is optional. The button works too.';
 let stream,context;
 try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');stream=await navigator.mediaDevices.getUserMedia({audio:true});
   if(revision!==micRevision||game.phase!=='incense'){stream.getTracks().forEach(track=>track.stop());return;}
   context=new (window.AudioContext||window.webkitAudioContext)();await context.resume();
   if(revision!==micRevision||game.phase!=='incense'){stream.getTracks().forEach(track=>track.stop());context.close().catch(()=>{});return;}
   micStream=stream;micContext=context;const source=context.createMediaStreamSource(stream),analyser=context.createAnalyser();analyser.fftSize=512;source.connect(analyser);const samples=new Float32Array(analyser.fftSize);let loudSince=null;
   $('#microphone').disabled=false;$('#microphone').textContent='Stop microphone';$('#mic-note').textContent='Listening locally. No audio is recorded. Light all three, then blow gently.';
   function listen(){if(revision!==micRevision||game.phase!=='incense'||game.pausedAt!==null){stopMicrophone();return;}analyser.getFloatTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((sum,s)=>sum+s*s,0)/samples.length);if(rms>.1){loudSince??=performance.now();if(performance.now()-loudSince>180&&game.lit.size===3){blow();return;}}else loudSince=null;micFrame=requestAnimationFrame(listen);}micFrame=requestAnimationFrame(listen);
 }catch{stream?.getTracks().forEach(track=>track.stop());context?.close().catch(()=>{});if(revision===micRevision){stopMicrophone();$('#mic-note').textContent='No microphone today. Tap Blow gently instead.';}}
});
function selectTab(name,focus=false){for(const button of document.querySelectorAll('[data-tab]')){const active=button.dataset.tab===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$(`#panel-${button.dataset.tab}`).hidden=!active;if(active&&focus)button.focus();}}
for(const shortcut of document.querySelectorAll('[data-shortcut]'))shortcut.addEventListener('click',()=>{
 settle();renderStall();selectTab(shortcut.dataset.shortcut);$(`#tab-${shortcut.dataset.shortcut}`).focus({preventScroll:true});
 document.querySelector('.stall-tabs').scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});
});
for(const button of document.querySelectorAll('[data-tab]')){button.addEventListener('click',()=>{settle();renderStall();selectTab(button.dataset.tab);});button.addEventListener('keydown',event=>{const names=['stall','kits','friends'],index=names.indexOf(button.dataset.tab);let next;if(event.key==='ArrowRight')next=(index+1)%3;if(event.key==='ArrowLeft')next=(index+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;if(next!==undefined){event.preventDefault();selectTab(names[next],true);}});}
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(PHASES.includes(game.phase))pause();else audio.stop();save();}else{settle();renderStall();if(audio.context&&game.pausedAt===null)unlockSound();}});window.addEventListener('pagehide',()=>{if(PHASES.includes(game.phase))game.pause();audio.stop();stopMicrophone();save();});window.addEventListener('resize',cancelGestures);reduced.addEventListener('change',()=>{paperAnimation?.cancel();shoeAnimation?.cancel();});
for(const costume of document.querySelectorAll('[data-fong-costume]'))costume.innerHTML=fongCostumeArt();for(const id of illustratedDecor)$('#stall-'+id).innerHTML=decorArt(id);for(const ghost of document.querySelectorAll('[data-ghost]'))ghost.innerHTML=ghostArt(ghost.dataset.ghost);for(const master of document.querySelectorAll('[data-fong]')){const icon=$('.fong-logo').cloneNode(true);icon.className='fong-logo master-avatar';master.append(icon);}drawWorries();settle();renderStall();updateSound();enableOffline($('#offline-status'));

document.addEventListener('languagechange',renderStall);
