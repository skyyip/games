import {countNumber,numberText} from './stall-polish.js';
import {createStallLayout} from './stall-layout.js';
import {polishCollections} from './collection-polish.js';
import {createPlayControls} from './play-controls.js';
import {SKINS} from './skins.js';
import {createRitualUI} from './ritual-ui.js';
import {PATRONS,patronBuffs,patronBuffText} from './ritual-rewards.js';
import {createUX} from './ux-ui.js';
import {createPreferences} from './preferences.js';
import {createBackupUI} from './backup-ui.js';
import {createPurchaseUI} from './purchase-ui.js';
import {ultimateShow,createChantPicker} from './comedy-content.js';
import {extraKingArt} from './slapstick-art.js';
import {createNeighbourhoodUI} from './neighbourhood-ui.js';
import {placedLayout,placeDecoration} from './neighbourhood.js';
import {beginStroke,moveStroke,strokeShape,finishStroke,pinchProgress} from './gestures.js';
import {RitualGame,PHASES,BEAT_INTERVAL} from './game.js';
import {WORRIES,WORRY_GROUPS,WEAPONS,DECOR,FRIENDS,MAX_DECOR_LEVEL,weaponScoreMultiplier,decorHourlyRate,DECOR_LEVEL_RATE_BONUS} from './catalog.js';
import {STORAGE_KEY,readProgress,collectIdle,idleRate,buyWeapon,weaponUses,consumeWeapon,upgrade,decorDurability,repairCost,repairDecor,discardDecor,reward,purchasePrice,dailyReward,decorUnlocked,buySkin,consumeSkin,skinUses} from './progress.js';
import {weaponArt,dollArt,tigerArt,porkArt,fongCostumeArt,decorArt,ghostArt} from './art.js';
import {StallAudio} from './audio.js';
import {getLanguage,translate} from '../../grid-rush/src/language.js';
import {enableOffline} from '../../grid-rush/src/party-ui.js';
const preferences=createPreferences();
const $=selector=>document.querySelector(selector),game=new RitualGame(),audio=new StallAudio(),reduced=matchMedia('(prefers-reduced-motion: reduce)');
audio.setEnabled(preferences.value.sound);
$('#voice').checked=preferences.value.voice;
$('#random-events').checked=preferences.value.randomEvents;
const phaseNames={incense:'Light a little incense',worry:'Give the worry a name',beat:'Whack the bad luck away',tiger:'Feed the white tiger',blessing:'Resolve and bless',divination:'Cast the sacred blocks'};
const lines={incense:'Three little sticks. One slow breath. No need to rush.',worry:'Write it down. You do not have to carry it home.',beat:'Tap away the overtime. Leave room for a pineapple bun.',tiger:'Give the tiger a snack. Let the gossip stop here.',blessing:'Bad luck out. Good company in. Save some kindness for yourself.',divination:'One flat and one curved face. Let good company find you.'};
let storage=null,persistent=true,state,kind='work',frame=0,lastPhase='',lastChant=-1,lastBeat=-1,lastQte=0,receipt='',recorded=false,kitUseCommitted=false,savedScroll=0,paperAnimation=null,shoeAnimation=null,sequence=0,shopTimer=0;
const illustratedDecor=new Set(['cat','radio','incense','tiger','aquarium','three-stars','money-tree','amethyst']);
const shopWeapons=WEAPONS.filter(w=>!w.starter&&!w.hidden&&w.id!=='rebirth-paper').sort((a,b)=>a.cost-b.cost||a.merit-b.merit);
shopWeapons.splice(-1,0,WEAPONS.find(w=>w.id==='rebirth-paper'));
let stallLayoutUI=null,neighbourhoodUI=null,uxUI=null,ritualUI=null,playControls=null,returnToDecor=null;
let rigAnimations=[],cryDuration=1100;
let pickChant=createChantPicker();
const gestures=new Map();let pinch=null,gestureSerial=0;let incenseGesture=null,porkGesture=null,micRevision=0,micStream=null,micContext=null,micFrame=0;
try{storage=localStorage;state=readProgress(storage.getItem(STORAGE_KEY));}catch{state=readProgress(null);persistent=false;}
let storedRaw=null;try{storedRaw=storage?.getItem(STORAGE_KEY)??null;}catch{}
function syncProgress(){
 if(!storage)return false;try{const raw=storage.getItem(STORAGE_KEY);if(raw===storedRaw)return false;storedRaw=raw;state=readProgress(raw);return true;}catch{persistent=false;return false;}
}
const itemName=item=>item.nameZh?(getLanguage()==='zh-Hant'?item.nameZh:item.name):translate(item.name);
const worryLabel=worry=>worry.labelZh&&getLanguage()==='zh-Hant'?worry.labelZh:translate(worry.label);
function showPurchaseShortfall(info,button,cost,merit,id){
 const missingOil=Math.max(0,cost-state.coins),missingMerit=Math.max(0,merit-state.merit);if(!missingOil&&!missingMerit)return;
 const zh=getLanguage()==='zh-Hant',parts=[];
 if(missingMerit)parts.push(zh?`${missingMerit.toLocaleString()} 功德`:`${missingMerit.toLocaleString()} merit`);
 if(missingOil)parts.push(zh?`${missingOil.toLocaleString()} 香油錢`:`${missingOil.toLocaleString()} oil`);
 const hint=document.createElement('small');hint.id=id;hint.className='purchase-shortfall';literal(hint,(zh?(missingOil?'錢包已進入閉關模式。還欠 ':'功德仲修行緊。還欠 '):(missingOil?'Wallet is meditating. Still need ':'Merit is still training. Still need '))+parts.join(zh?'及 ':' and '));info.append(hint);button.setAttribute('aria-describedby',id);
}
function restoreShopFocus(attribute,id,reveal=false){
 const control=$(`[data-${attribute}="${id}"]`)??$(`[data-decor="${id}"]`);if(!control)return;if(control.closest('.kit-row')?.hidden){$(game.phase==='results'?'#again':'#quick-start').focus({preventScroll:true});return;}
 let target=control;
 if(control.disabled){
  target=control.closest('.kit-row,.decor-row');if(!target)return;target.tabIndex=-1;target.dataset.restoreAction=attribute;target.dataset.restoreId=id;target.setAttribute('role','group');
  const item=(attribute==='weapon'?WEAPONS:DECOR).find(item=>item.id===id);target.setAttribute('aria-label',`${itemName(item)} · ${translate(control.textContent)}`);
 }
 target.focus({preventScroll:true});if(reveal)target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
}
const purchaseUI=createPurchaseUI({getState:()=>state,itemName,onReveal:()=>{audio.chime();vibrate([12,25,18]);},onReturn:(kind,id)=>{if(returnToDecor&&kind==='decor'){const piece=returnToDecor;returnToDecor=null;uxUI?.openDecor(piece);}else if(kind==='skin')document.querySelector(`[data-skin="${id}"]`)?.focus({preventScroll:true});else restoreShopFocus(kind==='weapon'?'weapon':'decor',id);},onStart:()=>start(),onView:id=>{
 returnToDecor=null;const piece=$(`[data-piece="${id}"]`),target=piece??$('#stall-showcase-title');target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
 if(piece){piece.classList.remove('purchase-highlight');void piece.offsetWidth;piece.classList.add('purchase-highlight');setTimeout(()=>piece.classList.remove('purchase-highlight'),1900);}
}});
const say=text=>{$('#announcements').textContent=translate(text);};
const vibrate=pattern=>{try{navigator.vibrate?.(pattern);}catch{}};
const gestureText=(zh,en)=>getLanguage()==='zh-Hant'?zh:en;
const qteHints={double:['快速點拍兩次！','Two quick taps!'],heavy:['滑動重扣！','Swipe for a heavy whack!'],rub:['來回搓三次！','Rub back and forth!'],circle:['畫完整圓圈！','Draw a full circle!'],pinch:['雙指向內夾擊！','Bring two fingers together!']};
function feedback(text){literal($('#hit-feedback'),translate(text));}
const literal=(element,text)=>numberText(element,text);
function renderRitualTiming(){
 const zh=getLanguage()==='zh-Hant';
 $('#random-events').checked=preferences.value.randomEvents;literal($('#random-events-label'),zh?'隨機挑戰事件':'Random challenge events');literal($('#random-events-help'),zh?'預設關閉。開啟後每局加入一次橋底事件，可挑戰額外加分與稱號；關閉也可完成儀式和故事。':'Off by default. Enable one event per ritual for optional bonus points and titles. You can finish rituals and stories with events off.');
 literal($('#kit-lifetime-note'),zh?'收費法寶每件可用三次儀式；每局首次成功得分才扣一次，第三次後才破壞消失。未出手便離開不會扣次數。徒手永遠免費。':'Each paid kit lasts three rituals. The first scored action spends one use per ritual; it breaks after the third use. Leaving without a hit costs no use. Bare hands are always free.');
 literal($('#ritual-duration'),zh?'痛打 68 秒 · 化解祈福後擲聖杯':'68s of whacking · purification, then sacred blocks');
 $('#gesture-tools').setAttribute('aria-label',zh?'操作手勢提示（只作說明）':'Gesture hints (instructions only)');
 const hintNames={tap:['點拍','Tap'],heavy:['滑動重扣','Swipe'],circle:['轉圈','Circle'],rub:['來回搓','Rub'],pinch:['雙指夾','Pinch'],};
 for(const hint of document.querySelectorAll('#gesture-tools .gesture-hint'))literal(hint.querySelector('b'),hintNames[hint.dataset.direction||hint.dataset.gesture][zh?0:1]);
 $('#hit-zone').setAttribute('aria-label',zh?'在紙人上點拍、滑動、畫圈，或雙指向內夾；鍵盤可用空白鍵點拍':'Tap, swipe, circle or pinch on the paper; Space gives a keyboard tap');
 literal($('#whack-rule'),zh?'打小人 68 秒，點拍或滑動都可得分。連擊間隔 1 秒，儲滿 100 格可按一下發動必殺，每局最多兩次；演出暫停計時及事件。畫圈、來回搓、雙指夾和節奏只作額外加分，斷連不清空氣槽。':'Whack for 68 seconds: tap or swipe to score. Combos allow one second. Fill 100 charge and tap for a finisher, twice per ritual; shows pause the clock and events. Circles, rubbing, pinching and rhythm are optional bonuses. Combo breaks keep your charge.');
 literal($('#ritual-timing-note'),zh?'打小人 68 秒，預設無隨機挑戰；開啟後每局一次事件，一招即可解決。祭白虎後依序火化小人及衣紙、灑米或豆、焚燒綠馬紙，只需擲筊一次，師傅會自動補擲至聖杯。化解及擲筊不催時，可隨時暫停。':'Whack for 68 seconds with random challenges off by default; enable them for one single-action event per ritual. Feed the tiger, burn the worry and offering papers, scatter rice or beans, burn the green horse paper, then cast once; Master automatically retries until sacred blocks. Purification and divination are untimed. Pause whenever you need.');
}
function save(){try{if(storage){if(!syncProgress()){const raw=JSON.stringify(state);storage.setItem(STORAGE_KEY,raw);storedRaw=raw;}}}catch{persistent=false;}$('#storage-note').textContent=persistent?'Saved on this device.':'Storage is unavailable. Your stall lasts for this visit.';}
function settle(){syncProgress();const idle=collectIdle(state);state=idle.state;if(idle.earned){$('#idle-welcome').hidden=false;$('#idle-welcome').textContent=`Your stall earned ${idle.earned} oil money while you were away.`;}if(idle.lost.length){$('#decor-loss-note').hidden=false;literal($('#decor-loss-note'),translate(`Worn-out decorations removed: ${idle.lost.map(id=>itemName(DECOR.find(d=>d.id===id))).join('、')}`));say('A decoration wore out. You can replace it in the stall.');}save();return idle;}
function message(text){$('#shop-message').textContent=text;clearTimeout(shopTimer);shopTimer=setTimeout(()=>$('#shop-message').textContent='',4500);say(text);}
function drawWorries(){
 const select=$('#worry-select'),zh=getLanguage()==='zh-Hant';
 select.replaceChildren(...WORRY_GROUPS.map(group=>{const options=document.createElement('optgroup');options.label=zh?group.labelZh:group.label;options.dataset.group=group.id;
  for(const worry of WORRIES.filter(w=>w.group===group.id)){const option=new Option(worryLabel(worry),worry.id);option.dataset.worry=worry.id;options.append(option);}return options;}));
 select.value=kind;
}
$('#worry-select').addEventListener('change',event=>{const id=event.target.value;if(WORRIES.some(w=>w.id===id)){kind=id;$('#worry-input').value='';}});
function rowText(title,detail){const div=document.createElement('div'),name=document.createElement('b'),small=document.createElement('small');literal(name,translate(title));small.textContent=detail;div.append(name,small);return div;}
function renderDecorDisplay(){
 for(const decor of DECOR){
  const display=$('#stall-extension');
  const level=state.decor[decor.id]??0;let piece=document.querySelector(`[data-piece="${decor.id}"]`);
  if(!level){if(piece&&!piece.dataset.removing){if(reduced.matches)piece.remove();else{piece.dataset.removing='true';piece.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'translateY(8px) scale(.65) rotate(10deg)'}],{duration:350,fill:'forwards'}).finished.then(()=>piece.remove()).catch(()=>{});}}continue;}
  if(piece?.dataset.removing){piece.remove();piece=null;}
  const previous=Number(piece?.dataset.level)||0;
  if(!piece){
   piece=document.createElement('li');piece.className=`stall-piece piece-${decor.id}`;piece.dataset.piece=decor.id;
   piece.innerHTML=`<button type="button" class="piece-manage"><span class="furnishing-art" aria-hidden="true">${decorArt(decor.id)}</span><span class="furnishing-condition" aria-hidden="true"><i></i></span><span class="furnishing-level" aria-hidden="true"></span><span class="sr-only" translate="no"></span></button><button type="button" class="piece-drag-handle" title="Drag to rearrange" aria-label="Rearrange"><svg class="piece-drag-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="currentColor"><circle cx="8" cy="5" r="1.8"/><circle cx="16" cy="5" r="1.8"/><circle cx="8" cy="12" r="1.8"/><circle cx="16" cy="12" r="1.8"/><circle cx="8" cy="19" r="1.8"/><circle cx="16" cy="19" r="1.8"/></g></svg></button>`;
   piece.addEventListener('click',event=>{if(!event.target.closest('.piece-drag-handle'))uxUI?.openDecor(decor.id);});
   display.append(piece);
  }
  if(piece.parentElement!==display)display.append(piece);
  piece.querySelector('.piece-manage').setAttribute('aria-label',(getLanguage()==='zh-Hant'?'管理擺設：':'Manage decoration: ')+itemName(decor));piece.title=itemName(decor);piece.dataset.label=itemName(decor);piece.dataset.level=level;const health=decorDurability(state,decor.id);piece.style.setProperty('--decor-wear',1-health/100);piece.style.setProperty('--decor-health',health/100);piece.classList.toggle('is-weathered',health<70);piece.classList.toggle('is-fragile',health<25);piece.querySelector('.furnishing-level').textContent=level;
  literal(piece.querySelector('.sr-only'),`${itemName(decor)} · ${translate(`Level ${level} / ${MAX_DECOR_LEVEL} · ${decorHourlyRate(decor,level)} oil per hour`)} · ${translate(`Durability ${Math.max(.1,Math.round(health*10)/10)}%`)}`);
  if((previous&&level>previous)||(!previous&&displayReady)){
   if(!reduced.matches)piece.animate([{transform:'translateY(-12px) scale(.65) rotate(-9deg)',filter:'brightness(1.8)'},{transform:'translateY(2px) scale(1.12) rotate(4deg)'},{transform:'translateY(0) scale(1) rotate(0)',filter:'brightness(1)'}],{duration:650,easing:'cubic-bezier(.2,.8,.3,1)'});
  }
 }
 const owned=placedLayout(state.neighbourhood,state.decor);$('#stall-diorama').hidden=owned.length>0;for(const id of owned){const piece=$(`#stall-extension [data-piece="${id}"]`);if(piece)$('#stall-extension').append(piece);}$('#stall-empty').hidden=owned.length>0;$('#stall-extension').hidden=!owned.length;displayReady=true;stallLayoutUI?.render();
}
let displayReady=false;
const decorPrice=d=>(state.decor[d.id]??0)>=MAX_DECOR_LEVEL?Infinity:purchasePrice(state,d.cost*((state.decor[d.id]??0)+1));
function requestBuy(kind,item){if(purchaseUI.isOpen||PHASES.includes(game.phase))return;settle();const level=kind==='decor'?(state.decor[item.id]??0)+1:0,base=item.cost*(kind==='decor'?level:1),cost=purchasePrice(state,base);purchaseUI.ask(kind,item,cost,level,()=>{settle();if(PHASES.includes(game.phase)||purchasePrice(state,base)!==cost||(kind==='decor'&&(state.decor[item.id]??0)+1!==level))return false;const next=kind==='skin'?buySkin(state,item.id):kind==='weapon'?buyWeapon(state,item.id):upgrade(state,item.id);if(!next)return false;state=next;save();renderStall();return true;});}
const kitScoreLabel=id=>translate(`Relief score ×${weaponScoreMultiplier(id)}`);
function renderStall(){
 $('#use-hands').disabled=state.equipped==='bare-hand';countNumber($('#coins'),state.coins);countNumber($('#merit'),state.merit);numberText($('#idle-note'),translate(`Your stall earns ${idleRate(state)} oil money per hour.`));
 const kit=WEAPONS.find(w=>w.id===state.equipped);$('#equipped-art').innerHTML=weaponArt(kit.id);literal($('#equipped-name'),`${itemName(kit)} · ${kitScoreLabel(kit.id)}${kit.cost?(getLanguage()==='zh-Hant'?` · 餘 ${weaponUses(state,kit.id)} 次`:` · ${weaponUses(state,kit.id)} uses left`):''}`);
 renderDecorDisplay();
 $('#play-panel').classList.toggle('has-neon',state.decor.neon>0);$('#play-panel').classList.toggle('has-incense',state.decor.incense>0);for(const id of illustratedDecor)$('#stall-'+id).hidden=!state.decor[id];
 renderDecorRows();
 $('#weapon-list').replaceChildren(...[...shopWeapons,...WEAPONS.filter(w=>w.hidden&&state.owned.includes(w.id))].map(w=>{const row=document.createElement('div');row.className='kit-row';const icon=document.createElement('span');icon.className='kit-art';icon.setAttribute('aria-hidden','true');icon.innerHTML=weaponArt(w.id);const owned=state.owned.includes(w.id),equipped=state.equipped===w.id,button=document.createElement('button');button.type='button';button.dataset.weapon=w.id;button.disabled=equipped||(!owned&&(state.merit<w.merit||state.coins<purchasePrice(state,w.cost)));button.textContent=equipped?'In hand':owned?'Equip':`${purchasePrice(state,w.cost)} oil`;button.setAttribute('aria-label',`${itemName(w)} · ${translate(button.textContent)}`);button.addEventListener('click',()=>{if(purchaseUI.isOpen||PHASES.includes(game.phase))return;settle();if(state.owned.includes(w.id)){state=buyWeapon(state,w.id);save();renderStall();}else requestBuy('weapon',w);});const detail=owned?(w.cost?(getLanguage()==='zh-Hant'?`剩餘 ${weaponUses(state,w.id)} 次儀式`:`${weaponUses(state,w.id)} ritual uses left`):'Free to use every time'):`Needs ${w.merit} merit`;const text=rowText(itemName(w),'');literal(text.querySelector('small'),`${kitScoreLabel(w.id)} · ${translate(detail)}`);if(w){const detail=document.createElement('small');detail.className='kit-shop-skill';literal(detail,(getLanguage()==='zh-Hant'?'必殺演出：':'Finisher: ')+ultimateShow(w.id).name[getLanguage()==='zh-Hant'?0:1]);text.append(detail);}if(!owned)showPurchaseShortfall(text,button,purchasePrice(state,w.cost),w.merit,`kit-reason-${w.id}`);row.append(icon,text,button);return row;}));
 literal($('#panel-friends>.collection-note'),getLanguage()==='zh-Hant'?'儀式後有機會遇到一至五星貴人，提供香油錢、功德或折扣加成；同類加成取最高。':'Meet one- to five-star patrons after rituals for oil, merit or discounts. The strongest bonus in each category applies.');
 $('#friend-list').replaceChildren(...FRIENDS.map(f=>{const row=document.createElement('div'),icon=document.createElement('span'),owned=state.friends.includes(f.id);row.className=`friend-row patron-stars-${f.stars}${owned?'':' is-locked'}`;icon.className='friend-icon';if(owned&&f.id==='extra-king')icon.innerHTML=extraKingArt();else icon.textContent=owned?f.icon:'?';const text=rowText(owned?itemName(f):(getLanguage()==='zh-Hant'?'神秘貴人':'A mysterious patron'),'');literal(text.querySelector('small'),'★'.repeat(f.stars)+' · '+patronBuffText(f,getLanguage()==='zh-Hant'));if(owned){const story=document.createElement('p');literal(story,getLanguage()==='zh-Hant'?f.story:f.storyEn??'Your neighbour has your back. Even bad luck is taking the last bus home.');text.append(story);}row.append(icon,text);return row;}));
 $('#records').replaceChildren(...state.records.map((r,index)=>{const row=document.createElement('li'),place=document.createElement('span'),info=document.createElement('div'),name=document.createElement('b'),date=document.createElement('small'),score=document.createElement('output');row.className='record-row';place.textContent=String(index+1).padStart(2,'0');literal(name,itemName(WEAPONS.find(w=>w.id===r.weapon)));date.textContent=new Intl.DateTimeFormat(getLanguage(),{month:'short',day:'numeric'}).format(new Date(r.date));score.textContent=r.score;info.append(name,date);row.append(place,info,score);return row;}));
 neighbourhoodUI?.renderHome();
 uxUI?.render();ritualUI?.home();playControls?.render();polishCollections();
 if(!state.records.length){const empty=document.createElement('li');empty.className='empty-record';empty.textContent='Your first lighter evening is waiting.';$('#records').append(empty);}save();
}
function renderDecorRows(){
 $('#decor-list').replaceChildren(...[...DECOR.filter(d=>!d.hidden||state.decor[d.id]>0)].sort((a,b)=>decorPrice(a)-decorPrice(b)||a.cost-b.cost).map(d=>{
  const row=document.createElement('div');row.className='decor-row';const icon=document.createElement('span');icon.className='decor-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=decorArt(d.id);
  const level=state.decor[d.id],cost=purchasePrice(state,d.cost*(level+1)),button=document.createElement('button');button.type='button';button.dataset.decor=d.id;button.disabled=!decorUnlocked(state,d)||d.hidden||level>=MAX_DECOR_LEVEL||state.coins<cost;button.textContent=!decorUnlocked(state,d)?(getLanguage()==='zh-Hant'?'完成申訴故事解鎖':'Finish the appeals story'):d.hidden?(getLanguage()==='zh-Hant'?'儀式限定收藏':'Ritual-only keepsake'):level>=MAX_DECOR_LEVEL?'Fully upgraded':`${cost} oil`;button.setAttribute('aria-label',`${itemName(d)} · ${translate(button.textContent)}`);
  button.addEventListener('click',()=>requestBuy('decor',d));
  const income=translate(`Level ${level} / ${MAX_DECOR_LEVEL} · ${decorHourlyRate(d,level)} oil per hour`);
  const growth=getLanguage()==='zh-Hant'?`首級 ${d.rate}，每升級 +${DECOR_LEVEL_RATE_BONUS}`:`Starts at ${d.rate}; +${DECOR_LEVEL_RATE_BONUS} per upgrade`;
  const info=rowText(itemName(d),'');literal(info.querySelector('small'),`${income} · ${growth}`);if(level<MAX_DECOR_LEVEL)showPurchaseShortfall(info,button,cost,0,`decor-reason-${d.id}`);
  if(level){
   const health=decorDurability(state,d.id),percent=Math.max(.1,Math.round(health*10)/10),label=document.createElement('span'),meter=document.createElement('meter');label.className='decor-health-label';literal(label,translate(`Durability ${percent}%`)+(getLanguage()==='zh-Hant'?` · 約剩 ${Math.ceil(health*.3)} 天`:` · about ${Math.ceil(health*.3)} days left`));meter.className='decor-durability';meter.min=0;meter.max=100;meter.low=25;meter.high=70;meter.optimum=100;meter.value=health;meter.setAttribute('aria-label',`${itemName(d)} · ${translate(`Durability ${percent}%`)}`);info.append(label,meter);
  }
  row.append(icon,info,button);
  if(level){
   const controls=document.createElement('div'),repair=document.createElement('button'),discard=document.createElement('button'),cost=repairCost(state,d.id);controls.className='decor-controls';repair.type=discard.type='button';repair.dataset.repair=d.id;discard.dataset.discard=d.id;
   const fresh=decorDurability(state,d.id)>=99.95;repair.textContent=fresh?'Good as new':`Repair · ${cost} oil`;repair.disabled=fresh||!cost||state.coins<cost;repair.setAttribute('aria-label',`${itemName(d)} · ${translate(repair.textContent)}`);discard.textContent='Discard';discard.setAttribute('aria-label',`${translate('Discard')} · ${itemName(d)}`);
   repair.addEventListener('click',()=>repairItem(d.id));discard.addEventListener('click',()=>askDiscard(d.id));controls.append(repair,discard);row.append(controls);
  }
  return row;
 }));
}
function repairItem(id,{focus=true}={}){settle();const next=repairDecor(state,id);if(next){state=next;save();message('Good as new. Thirty more days of good company.');audio.unlock().then(()=>audio.chime());}renderStall();if(focus)restoreShopFocus('repair',id,true);return Boolean(next);}
let discardTarget=null;
function askDiscard(id){
 if(!state.decor[id])return;discardTarget=id;const decor=DECOR.find(d=>d.id===id);literal($('#discard-detail'),`${itemName(decor)} · ${translate(`Level ${state.decor[id]} / ${MAX_DECOR_LEVEL} · ${decorHourlyRate(decor,state.decor[id])} oil per hour`)}`);$('#discard-dialog').showModal();$('#cancel-discard').focus();
}
$('#cancel-discard').addEventListener('click',()=>$('#discard-dialog').close());
$('#discard-dialog').addEventListener('close',()=>{if(returnToDecor){const id=returnToDecor;returnToDecor=null;if(!uxUI?.openDecor(id))$('#stall-showcase-title').focus({preventScroll:true});}else if(discardTarget)$(`[data-discard="${discardTarget}"]`)?.focus({preventScroll:true});discardTarget=null;});
$('#confirm-discard').addEventListener('click',()=>{
 const id=discardTarget;settle();const next=discardDecor(state,id);if(next){state=next;save();message('Decoration discarded. A little space for something new.');}$('#discard-dialog').close();renderStall();restoreShopFocus('decor',id,true);
});
// Real time keeps moving while the game is open; do not move keyboard focus.
setInterval(()=>{if(document.hidden)return;if(PHASES.includes(game.phase)||purchaseUI.isOpen){settle();purchaseUI.render();return;}const focused=document.activeElement,attribute=['decor','repair','discard','weapon'].find(name=>focused?.dataset?.[name])??focused?.dataset?.restoreAction,id=attribute?(focused.dataset[attribute]??focused.dataset.restoreId):null;settle();renderStall();if(id)restoreShopFocus(attribute,id);},60000);
function lock(value){
 if(value){savedScroll=scrollY;window.getSelection()?.removeAllRanges();}document.body.classList.toggle('is-playing',value);
 for(const selector of ['.bbl-skip','#site-header','#intro','#stall-dashboard','#story','#rules','.bbl-footer'])$(selector).inert=value;
 if(!value)window.scrollTo({top:savedScroll,behavior:'instant'});
}
function cancelGestures(){
 const interrupted=gestures.size>0;
 neighbourhoodUI?.cancel();ritualUI?.cancel();
 for(const id of gestures.keys()){try{$('#hit-zone').releasePointerCapture(id);}catch{}}gestures.clear();pinch=null;clearGesturePreview();if(interrupted)feedback(gestureText('手勢已取消，重新出手。','Gesture cancelled. Start again.'));
 if(incenseGesture){try{$('#incense-zone').releasePointerCapture(incenseGesture.id);}catch{}incenseGesture=null;}
 if(porkGesture){try{$('#pork-piece').releasePointerCapture(porkGesture.id);}catch{}porkGesture=null;}
 $('.tiger-tray').classList.remove('is-smearing');$('#pork-piece').style.translate='';$('#striking-weapon').style.transform='';$('#paper-tiger').classList.remove('is-ready');
}
function start(){
 if(PHASES.includes(game.phase))return;settle();recorded=false;kitUseCommitted=false;receipt=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${++sequence}`;
 const preset=WORRIES.find(w=>w.id===kind);game.start({kind,worry:$('#worry-input').value.trim()||worryLabel(preset),weapon:state.equipped,commission:state.neighbourhood.active,skin:state.selectedSkin,randomEvents:preferences.value.randomEvents});neighbourhoodUI?.reset();
 lastPhase='';lastChant=-1;pickChant=createChantPicker();lastBeat=-1;lastQte=0;$('#welcome').hidden=true;$('#result').hidden=true;$('#ritual-stage').hidden=false;$('#ritual-stage').inert=false;$('#pause-overlay').hidden=true;lock(true);
 audio.voice=$('#voice').checked;unlockSound();renderPhase();cancelAnimationFrame(frame);frame=requestAnimationFrame(tick);
}
function renderPhase(){
 if(game.phase===lastPhase)return;lastPhase=game.phase;$('#play-panel').dataset.phase=game.phase;cancelGestures();stopMicrophone();$('#effects').replaceChildren();
 if(game.phase==='results'){finish();return;}
 $('#phase-title').textContent=phaseNames[game.phase];$('#fong-line').textContent=({incense:'三枝香，慢慢呼一口氣，唔使急。',worry:'寫低心塞，今晚唔使再揹返屋企。',beat:'拍走加班，留返個胃食菠蘿包！',tiger:'白虎食飽飽，是非嘴放大假！',blessing:'衰氣走開，貴人入嚟，留返啲溫柔俾自己。',divination:'一正一反就圓滿，貴人就快到！'})[game.phase];
 for(const item of document.querySelectorAll('.phase-panel'))item.hidden=item.id!==`phase-${game.phase}`;
 const index=PHASES.indexOf(game.phase);for(const item of document.querySelectorAll('[data-step]')){const i=PHASES.indexOf(item.dataset.step);item.classList.toggle('is-current',i===index);item.classList.toggle('is-done',i<index);if(i===index)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');}
 (game.phase==='beat'?$('#beat-arena'):$('#phase-body')).append($('#effects'));
 if(game.phase==='incense'){for(const stick of document.querySelectorAll('[data-stick]'))stick.classList.remove('is-lit');$('#phase-incense').classList.remove('is-blown');$('#blow').disabled=true;ritualUI?.incenseMic('idle');}
 if(game.phase==='worry')literal($('#named-worry'),game.worry);
 if(game.phase==='beat'){$('#paper-doll').dataset.comedyAct='';$('#paper-doll').innerHTML=dollArt(game.kind,game.look,game.skin);literal($('#doll-label'),game.worry);$('#striking-weapon').innerHTML=weaponArt(game.weapon);feedback('Find your rhythm.');$('#hit-zone').dataset.lastGesture='';paintPaperWear();}
 if(game.phase==='tiger'){$('#tiger-smear-paint').style.opacity='0';$('#paper-tiger').innerHTML=tigerArt();$('#pork-piece').innerHTML=porkArt();$('#phase-tiger').classList.remove('is-fed');}
 if(game.phase==='blessing'){$('#bless').classList.remove('is-burning');audio.chime();}
 ritualUI?.render();
 neighbourhoodUI?.renderPlay(true);
 $('#phase-title').focus({preventScroll:true});say(phaseNames[game.phase]);audio.speak($('#fong-line').textContent,'zh-Hant');
}
function paintPaperWear(){
 const wear=game.wear,paper=$('#paper-doll');paper.dataset.comedyAct=wear<.25?'swagger':wear<.7?'pleading':'wrap';paper.classList.toggle('is-crying',game.hits>0&&performance.now()-game.lastHit<cryDuration);paper.style.setProperty('--paper-wear',wear);paper.style.setProperty('--paper-tear',Math.max(0,Math.min(1,(wear-.2)/.5)));paper.style.setProperty('--edge-loss',Math.max(0,Math.min(1.2,(wear-.25)/.65)));paper.style.setProperty('--paper-punch',Math.max(0,Math.min(1,(wear-.75)/.25)));
 for(const [index,threshold]of [.2,.38,.55].entries())paper.style.setProperty(`--edge-loss-${index}`,Math.max(0,Math.min(1,(wear-threshold)/(1-threshold))));paper.style.setProperty('--paper-patch',Math.max(0,Math.min(1,(wear-.5)/.3)));paper.style.setProperty('--head-slump',`${wear*6}deg`);paper.style.setProperty('--head-drop',`${wear*3}px`);
 const stage=Math.min(3,Math.floor(wear*4));paper.dataset.wearStage=stage;const text=['Fresh paper','Creased paper','Torn paper','Tattered paper'][stage];if($('#paper-condition').dataset.stage!==String(stage)){$('#paper-condition').dataset.stage=stage;literal($('#paper-condition'),translate(text));}
}
function tick(){
 frame=0;if(game.pausedAt!==null||!PHASES.includes(game.phase))return;game.advance();if(game.score>0&&!kitUseCommitted)spendKitOnce();renderPhase();if(game.phase==='results')return;
 $('#phase-clock').textContent=Math.ceil(game.remaining/1000);
 if(game.phase==='beat'){
   $('#live-score').textContent=game.score;$('#live-combo').textContent=game.finisherBusy?game.combo:performance.now()-game.lastHit>1000?0:game.combo;$('#live-papers').textContent=game.papers;
   paintPaperWear();neighbourhoodUI?.renderPlay();
   const beat=Math.floor(game.elapsed/BEAT_INTERVAL);if(beat!==lastBeat){lastBeat=beat;if(!game.finisherBusy)audio.tone(420,.045,'triangle',.018);}
   const pulse=game.elapsed%BEAT_INTERVAL;$('#rhythm-pulse').style.setProperty('--beat-scale',1+Math.max(0,1-pulse/160)*.65);
   $('#qte-call').hidden=!game.qte;if(game.qte){literal($('#qte-call'),qteHints[game.qte.type][getLanguage()==='zh-Hant'?0:1]);if(lastQte!==game.qteIndex){lastQte=game.qteIndex;say($('#qte-call').textContent);audio.tone(780,.12,'sine',.06);}}
   for(const hint of document.querySelectorAll('#gesture-tools [data-gesture]')){const type=game.qte?.type,match=(type==='double'?'tap':type)===hint.dataset.gesture;hint.classList.toggle('is-prompted',match);if(match&&hint.dataset.promptIndex!==String(game.qteIndex)){hint.dataset.promptIndex=game.qteIndex;const strip=$('#gesture-tools');strip.scrollTo({left:hint.offsetLeft-(strip.clientWidth-hint.offsetWidth)/2,behavior:reduced.matches?'instant':'smooth'});}}
   const chant=Math.floor(game.elapsed/4000);if(chant!==lastChant){lastChant=chant;const line=pickChant();$('#fong-line').textContent=line;audio.speak(line,'zh-Hant');if(chant===3){audio.tone(1050,.4,'sine',.045);audio.tone(790,.4,'sine',.03,.2);}}
 }
 ritualUI?.render();
 frame=requestAnimationFrame(tick);
}
function sparks(large=false){
 if(reduced.matches)return;const count=Math.min(large?22:10,Math.max(0,80-$('#effects').childElementCount));for(let i=0;i<count;i++){const piece=document.createElement('i');piece.className='spark';piece.style.setProperty('--sx',`${Math.cos(i*2.4)*(large?130:70)}px`);piece.style.setProperty('--sy',`${Math.sin(i*2.4)*(large?110:75)-40}px`);piece.style.setProperty('--sr',`${i*47}deg`);piece.style.setProperty('--spark-color',['#edc77e','#f2dea1','#a9c8ad','#d99d83'][i%4]);$('#effects').append(piece);setTimeout(()=>piece.remove(),750);}
}
function spendKitOnce(){
 if(kitUseCommitted)return;kitUseCommitted=true;syncProgress();const spent=consumeWeapon(state,game.weapon);if(spent)state=spent;const paper=consumeSkin(state,game.skin);if(paper)state=paper;save();
}
function whack(options){
 const hit=game.hit(options);renderPhase();if(!hit)return;
 spendKitOnce();
 const force=.2+Math.min(1,hit.power/9)*.8;cryDuration=900+force*900;audio.hit(game.weapon,hit.heavy,hit.perfect,hit.power);vibrate(Math.round(7+force*30));
 const paper=$('#paper-doll');paper.classList.add('is-crying');paper.style.setProperty('--hit-strength',force);paper.dataset.impact=force.toFixed(3);
 const captions={tap:'Bonk!',heavy:'WHAM!',rub:'Scrub-a-dub!',circle:gestureText('轉走衰運！','Spin it away!'),pinch:'Squeeeze!'};
 if(hit.gesture==='circle')audio.sweep(hit.direction==='ccw'?1000:450,hit.direction==='ccw'?450:1000,.16,.04);
 feedback(`${translate(hit.qteComplete?'Lovely combo!':captions[hit.gesture])} · +${hit.points}`);$('#hit-zone').dataset.lastGesture=hit.gesture;$('#hit-zone').dataset.lastDirection=hit.direction||'';paintPaperWear();neighbourhoodUI?.hitFeedback(hit);neighbourhoodUI?.renderPlay(true);
 if(!reduced.matches){
  paperAnimation?.cancel();shoeAnimation?.cancel();for(const animation of rigAnimations)animation.cancel();rigAnimations=[];
  const angle=8+force*27,travel=6+force*23,squash=1-force*.38;
  const moves={rub:[`translateX(${-travel}px) rotate(${-angle}deg)`,`translateX(${travel}px) rotate(${angle}deg)`,`translateX(${-travel*.6}px) rotate(${-angle*.5}deg)`],circle:[`rotate(${-angle}deg) scale(${1+force*.1},${squash})`,`rotate(${angle*1.4}deg) scale(${1-force*.15},${1+force*.2})`,`rotate(${-angle*.4}deg)`],pinch:[`scale(${1-force*.48},${1+force*.3})`,`scale(${1+force*.27},${1-force*.18})`,`scale(.96,1.04)`]};
  const turn=hit.direction==='ccw'?-1:1;
  moves.circle=[`rotate(${turn*angle}deg) scale(${1+force*.1},${squash})`,`rotate(${-turn*angle*1.4}deg) scale(${1-force*.15},${1+force*.2})`,`rotate(${turn*angle*.4}deg)`];
  const middle=moves[hit.gesture]??[`translateY(${travel*.35}px) rotate(${-angle*.6}deg) scale(${1+force*.28},${squash})`,`translateY(${-travel*.3}px) rotate(${angle*.35}deg) scale(.93,1.12)`];
  paperAnimation=paper.animate([{transform:'none'},...middle.map(transform=>({transform})),{transform:'none'}],{duration:320+force*320,easing:'cubic-bezier(.2,.75,.3,1)'});
  const toolTravel=18+force*60,toolAngle=20+force*62;
  const toolMoves={tap:[`translate(-${toolTravel*.5}px,${toolTravel*.4}px) rotate(-${toolAngle}deg)`],heavy:[`translate(10px,-${toolTravel*.65}px) rotate(${toolAngle}deg)`,`translate(-${toolTravel}px,${toolTravel*.6}px) rotate(-${toolAngle}deg)`],rub:[`translate(-${toolTravel}px,15px) rotate(-${toolAngle}deg)`,`translate(${toolTravel*.2}px,25px) rotate(${toolAngle*.5}deg)`,`translate(-${toolTravel}px,15px) rotate(-${toolAngle}deg)`],circle:[`translate(-${toolTravel}px,-25px) rotate(-100deg)`,`translate(-${toolTravel}px,${toolTravel*.55}px) rotate(-230deg)`,`translate(10px,0) rotate(-360deg)`],pinch:[`translate(-${toolTravel}px,10px) rotate(-${toolAngle}deg)`,`translate(-${toolTravel*.5}px,10px) rotate(-15deg)`]};
  toolMoves.circle=[`translate(${-turn*toolTravel}px,-25px) rotate(${turn*100}deg)`,`translate(${-turn*toolTravel}px,${toolTravel*.55}px) rotate(${turn*230}deg)`,`translate(10px,0) rotate(${turn*360}deg)`];
  shoeAnimation=$('#striking-weapon').animate([{transform:'rotate(-18deg)'},...toolMoves[hit.gesture].map(transform=>({transform})),{transform:'rotate(-18deg)'}],{duration:260+force*260,easing:'ease-out'});
  for(const [selector,sign]of [['.paper-arm-left',-1],['.paper-arm-right',1],['.paper-leg-left',1],['.paper-leg-right',-1],['.paper-head',-.4]]){const part=paper.querySelector(selector);if(part)rigAnimations.push(part.animate([{transform:'rotate(0)'},{transform:`rotate(${sign*(18+force*58)}deg)`,offset:.23},{transform:`rotate(${-sign*(10+force*34)}deg)`,offset:.6},{transform:'rotate(0)'}],{duration:400+force*360,easing:'ease-out'}));}
  $('#hit-feedback').animate([{backgroundColor:'#98603d',color:'#fff4ca'},{backgroundColor:'#193234',color:'#ffe1a0'}],{duration:300,easing:'ease-out'});
  const count=Math.min(Math.round(3+force*11),Math.max(0,75-$('#effects').childElementCount));for(let i=0;i<count;i++){const bit=document.createElement('i');bit.className='paper-bit';bit.style.setProperty('--dx',`${Math.cos(i*2.4)*(30+force*100)}px`);bit.style.setProperty('--dy',`${Math.sin(i*2.4)*(30+force*75)-25}px`);bit.style.setProperty('--turn',`${i*53+force*220}deg`);$('#effects').append(bit);setTimeout(()=>bit.remove(),750);}
 }
 if(hit.paperCleared||hit.qteComplete){sparks(hit.paperCleared);audio.chime();if(hit.paperCleared)say('One paper worry scattered. A little room for good things.');}
}

function finish(){
 if(recorded||!game.result)return;recorded=true;cancelAnimationFrame(frame);frame=0;cancelGestures();stopMicrophone();audio.ambience(!document.hidden);try{speechSynthesis.cancel();}catch{}
 settle();const received=reward(state,game.result,{id:receipt});if(received){state=received.state;save();renderStall();$('#reward-line').textContent=`Oil money +${received.earned} · Merit +${received.merit}`;$('#friend-arrival').hidden=!received.friend;if(received.friend)$('#friend-arrival').textContent=`A kind visitor: ${translate(received.friend.name)}`;}
 $('#final-score').textContent=game.score;$('#final-hits').textContent=game.hits;$('#final-combo').textContent=game.bestCombo;$('#fortune-text').textContent=game.result.fortune;neighbourhoodUI?.renderResult(game.result,received?.journey);
 uxUI?.showResult(kitUseCommitted);$('#ritual-stage').hidden=true;lock(false);$('#result').hidden=false;$('#result-title').focus({preventScroll:true});$('#result').scrollIntoView({block:'start',behavior:'instant'});audio.chime();say('The ritual is complete. Your fortune is ready.');ritualUI?.rewards(received,game.result);
}
function backToStall(){cancelAnimationFrame(frame);frame=0;cancelGestures();stopMicrophone();audio.stop();game.reset();unlockSound();lastPhase='setup';$('#play-panel').dataset.phase='setup';$('#pause-overlay').hidden=true;$('#ritual-stage').hidden=true;$('#ritual-stage').inert=false;$('#result').hidden=true;$('#welcome').hidden=false;lock(false);settle();renderStall();$('#start').focus({preventScroll:true});$('#play-panel').scrollIntoView({block:'nearest',behavior:'instant'});}
function pause(){if(!PHASES.includes(game.phase))return;game.pause();cancelAnimationFrame(frame);frame=0;cancelGestures();stopMicrophone();audio.stop();$('#pause-overlay').hidden=false;$('#ritual-stage').inert=true;uxUI?.renderPause();$('#resume').focus({preventScroll:true});say('The ritual is paused. Take your time.');}
function resume(){if(!game.resume())return;$('#pause-overlay').hidden=true;$('#ritual-stage').inert=false;audio.unlock().then(()=>{if(game.pausedAt===null&&PHASES.includes(game.phase))audio.ambience(true);});$('#phase-title').focus({preventScroll:true});frame=requestAnimationFrame(tick);}
function updateSound(){
 for(const id of ['sound','sound-setup'])$(`#${id}`).setAttribute('aria-pressed',String(audio.enabled));
 const label=audio.enabled?'Mute sound':'Unmute sound';$('#sound').setAttribute('aria-label',label);$('#sound').title=translate(label);$('#sound').textContent=audio.enabled?'♫':'🔇';$('#sound-setup').textContent=audio.enabled?'Sound on':'Sound off';uxUI?.render();
}
function unlockSound(){return audio.unlock().then(()=>{audio.ambience(!document.hidden&&game.pausedAt===null);updateSound();});}
function toggleSound(){audio.setEnabled(!audio.enabled);preferences.update({sound:audio.enabled});if(audio.enabled)unlockSound();updateSound();}
// Mobile Safari may reject pointer-down activation or interrupt audio after a call.
// Keep retrying from real gesture endings instead of removing the first listener.
function beginAudio(){if(audio.enabled&&!document.hidden&&game.pausedAt===null&&audio.needsUnlock)unlockSound();}
for(const event of ['pointerup','touchend','click','keydown'])document.addEventListener(event,beginAudio,{capture:true,passive:true});

$('#use-hands').addEventListener('click',()=>{settle();state=buyWeapon(state,'bare-hand');save();renderStall();$('#equipped-name').tabIndex=-1;$('#equipped-name').focus({preventScroll:true});message('Your hands are ready.');});
$('#pause-overlay').addEventListener('keydown',event=>{if(event.key!=='Tab')return;const first=$('#pause-skill-help').hidden?$('#resume'):$('#pause-skill-help'),last=$('#quit');if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!event.repeat&&!document.querySelector('dialog[open]')&&PHASES.includes(game.phase)){event.preventDefault();game.pausedAt===null?pause():resume();}});
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);$('#to-stall').addEventListener('click',backToStall);$('#pause').addEventListener('click',pause);$('#resume').addEventListener('click',resume);$('#quit').addEventListener('click',()=>uxUI?.requestQuit());$('#sound').addEventListener('click',toggleSound);$('#sound-setup').addEventListener('click',toggleSound);
function light(index){if(!game.light(index))return;document.querySelector(`[data-stick="${index}"]`).classList.add('is-lit');$('#blow').disabled=game.lit.size!==3;audio.noise(.07,.035,2500);vibrate(6);ritualUI?.render();}
for(const stick of document.querySelectorAll('[data-stick]'))stick.addEventListener('click',event=>{if(event.detail===0)light(Number(stick.dataset.stick));});
$('#incense-zone').addEventListener('pointerdown',event=>{if(game.phase!=='incense'||event.button!==0||game.pausedAt!==null)return;event.preventDefault();const rect=event.currentTarget.getBoundingClientRect();incenseGesture={id:event.pointerId,x:event.clientX,y:event.clientY,index:event.target.closest('[data-stick]')?Number(event.target.closest('[data-stick]').dataset.stick):Math.max(0,Math.min(2,Math.floor((event.clientX-rect.left)/rect.width*3)))};event.currentTarget.setPointerCapture(event.pointerId);});
$('#incense-zone').addEventListener('pointerup',event=>{const gesture=incenseGesture;if(!gesture||gesture.id!==event.pointerId)return;incenseGesture=null;if(Math.abs(event.clientX-gesture.x)>55){for(let i=0;i<3;i++)light(i);}else light(gesture.index);});for(const type of ['pointercancel','lostpointercapture'])$('#incense-zone').addEventListener(type,()=>incenseGesture=null);
function blow(){if(!game.blow())return;$('#phase-incense').classList.add('is-blown');$('#blow').disabled=true;$('#fong-line').textContent='呼一口，膊頭放低啲，唔使再硬撐。';stopMicrophone();audio.noise(.22,.05,700);ritualUI?.render();}
$('#blow').addEventListener('click',blow);$('#confirm-worry').addEventListener('click',()=>{if(game.confirm()){$('#fong-line').textContent='收好案！今晚唔使再揹住心塞返屋企。';audio.tone(380,.15,'triangle',.08);ritualUI?.render();}});
function clearGesturePreview(){
 $('#hit-zone').classList.remove('is-gesturing','is-holding');$('#gesture-trail-path').setAttribute('d','');$('#gesture-charge').style.setProperty('--charge','0%');$('#hit-zone').style.setProperty('--hold-charge','0');$('#striking-weapon').style.transform='';
}
function previewGesture(stroke){
 if(stroke.consumed)return;
 if(stroke.length<8&&!pinch){clearGesturePreview();return;}
 const shape=strokeShape(stroke),rect=$('#hit-zone').getBoundingClientRect();
 if(!reduced.matches){const points=stroke.points.slice(-36);$('#gesture-trail-path').setAttribute('d',points.map((p,i)=>`${i?'L':'M'}${(p.x-rect.x)/rect.width*100},${(p.y-rect.y)/rect.height*100}`).join(' '));}
 let type=shape.gesture,progress=shape.progress;
 if(pinch){type=pinch.kind||'pinch';progress=pinch.progress;}
 else if(progress===0){type='heavy';progress=Math.min(1,stroke.length/100);}
 $('#hit-zone').classList.add('is-gesturing');$('#gesture-charge').style.setProperty('--charge',`${progress*100}%`);$('#gesture-charge').textContent={heavy:'↓',rub:'↔',circle:'↻',pinch:'⇢⇠'}[type];
 let message='';
 if(progress>=1)message=type==='pinch'?gestureText('雙指夾擊！','Pinch!'):gestureText('準備好！放手！','Ready! Lift your finger.');
 else if(type==='circle')message=gestureText('繼續轉個圈…','Keep drawing a circle…');
 else if(type==='rub')message=translate('Back and forth. Keep rubbing!');else if(type==='pinch')message=translate('Bring two fingers together!');
 if(message&&$('#hit-feedback').textContent!==message)feedback(message);
}
const zone=$('#hit-zone');
zone.addEventListener('pointerdown',event=>{
 if(event.button!==0||game.phase!=='beat'||game.pausedAt!==null||gestures.size>=2||game.finisherBusy)return;
 event.preventDefault();const stroke=beginStroke(event.clientX,event.clientY,performance.now());stroke.pointerType=event.pointerType;gestures.set(event.pointerId,stroke);zone.setPointerCapture(event.pointerId);
 if(gestures.size===2&&[...gestures.values()].every(g=>g.pointerType==='touch')){const ids=[...gestures.keys()],[a,b]=ids.map(id=>gestures.get(id));pinch={ids,initial:Math.hypot(a.lastX-b.lastX,a.lastY-b.lastY),progress:0,kind:'pinch',moved:false,done:false,started:performance.now()};clearGesturePreview();}
});
zone.addEventListener('pointermove',event=>{
 const stroke=gestures.get(event.pointerId);if(!stroke||stroke.consumed)return;
 for(const sample of [...(event.getCoalescedEvents?.()??[]),event])moveStroke(stroke,sample.clientX,sample.clientY);
 const dx=event.clientX-stroke.x,dy=event.clientY-stroke.y;$('#striking-weapon').style.transform=`translate(${Math.max(-25,Math.min(25,dx*.12))}px,${Math.max(-25,Math.min(25,dy*.12))}px) rotate(${-18+Math.min(35,Math.abs(dy)*.12)}deg)`;
 if(pinch&&!pinch.done){const [a,b]=pinch.ids.map(id=>gestures.get(id));if(a&&b){const gap=Math.hypot(a.lastX-b.lastX,a.lastY-b.lastY),outward=gap>pinch.initial;pinch.kind='pinch';pinch.progress=outward?0:pinchProgress(pinch.initial,gap);pinch.moved ||= Math.abs(gap-pinch.initial)>=12||a.maxDrift>=20||b.maxDrift>=20;if(pinch.progress>=1){pinch.done=true;a.consumed=b.consumed=true;whack({gesture:pinch.kind,strength:Math.min(1,.4+pinch.initial/220+pinch.progress/Math.max(1,(performance.now()-pinch.started)/140)),pointer:`pair-${++gestureSerial}`});clearGesturePreview();return;}}}
 previewGesture(stroke);
});
zone.addEventListener('pointerup',event=>{
 const stroke=gestures.get(event.pointerId);if(!stroke)return;moveStroke(stroke,event.clientX,event.clientY);
 if(pinch?.ids.includes(event.pointerId)){if(pinch.moved&&!pinch.done){for(const id of pinch.ids){const other=gestures.get(id);if(other)other.consumed=true;}feedback(gestureText('向內夾先有加分；點拍照樣玩得！','Pinch inward for a bonus, or simply keep tapping.'));}pinch=null;}
 gestures.delete(event.pointerId);
 if(!stroke.consumed){const action=finishStroke(stroke,performance.now());if(action){whack({...action,pointer:event.pointerId});}else feedback(gestureText('點拍或滑動小人就可以！','Tap or swipe the paper to whack!'));}
 if(!gestures.size)clearGesturePreview();
});
function cancelPointer(event){const stroke=gestures.get(event.pointerId);if(!stroke)return;gestures.delete(event.pointerId);if(pinch?.ids.includes(event.pointerId)){for(const id of pinch.ids){const other=gestures.get(id);if(other)other.consumed=true;}pinch=null;}clearGesturePreview();}
zone.addEventListener('pointercancel',cancelPointer);zone.addEventListener('lostpointercapture',cancelPointer);
zone.addEventListener('click',event=>{if(event.detail===0)whack({pointer:'keyboard'});});

function feed(){
 if(game.phase==='tiger'&&game.porkMode==='blood'&&!game.dipped)game.dip();
 if(!game.feed())return;$('#phase-tiger').classList.add('is-fed');$('#fong-line').textContent='白虎食飽飽，今日是非收晒工！';audio.chomp();vibrate([12,25,20]);
 ritualUI?.render();
}
const pork=$('#pork-piece');function mouth(){const r=$('#paper-tiger .tiger-mouth').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};}
pork.addEventListener('pointerdown',event=>{if(event.button!==0||game.phase!=='tiger'||game.fed||game.pausedAt!==null)return;event.preventDefault();const r=pork.getBoundingClientRect();porkGesture={id:event.pointerId,x:event.clientX,y:event.clientY,cx:r.x+r.width/2,cy:r.y+r.height/2,lastX:event.clientX,lastY:event.clientY};pork.setPointerCapture(event.pointerId);});
pork.addEventListener('pointermove',event=>{const g=porkGesture;if(!g||g.id!==event.pointerId)return;const dx=event.clientX-g.x,dy=event.clientY-g.y,target=mouth(),x=g.cx+dx,y=g.cy+dy,distance=Math.hypot(x-target.x,y-target.y),pull=Math.max(0,1-distance/90)**2*.5;pork.style.translate=`${dx+(target.x-x)*pull}px ${dy+(target.y-y)*pull}px`;$('#paper-tiger').classList.toggle('is-ready',distance<90);$('.tiger-tray').classList.toggle('is-smearing',distance<55);if(distance<55&&game.smearTiger(Math.hypot(event.clientX-g.lastX,event.clientY-g.lastY))){const tray=$('.tiger-tray').getBoundingClientRect(),paint=$('#tiger-smear-paint');paint.style.cssText=`left:${target.x-tray.x-24}px;top:${target.y-tray.y-12}px;width:48px;height:24px;opacity:${.2+game.tigerSmear*.6};transform:scaleX(${.2+game.tigerSmear*.8})`;ritualUI?.render();}g.lastX=event.clientX;g.lastY=event.clientY;});
pork.addEventListener('pointerup',event=>{const g=porkGesture;if(!g||g.id!==event.pointerId)return;const target=mouth(),distance=Math.hypot(g.cx+event.clientX-g.x-target.x,g.cy+event.clientY-g.y-target.y),tap=Math.hypot(event.clientX-g.x,event.clientY-g.y)<12;porkGesture=null;$('.tiger-tray').classList.remove('is-smearing');$('#paper-tiger').classList.remove('is-ready');if(tap){pork.style.translate='';feed();return;}if(game.porkMode==='blood'&&!game.dipped){const bowl=$('#blood-bowl').getBoundingClientRect();if(Math.hypot(g.cx+event.clientX-g.x-bowl.x-bowl.width/2,g.cy+event.clientY-g.y-bowl.y-bowl.height/2)<60)game.dip();else ritualUI?.comicMiss('pork','dip');pork.style.translate='';ritualUI?.render();return;}if(distance<80)feed();else{pork.style.translate='';ritualUI?.comicMiss('pork');}});for(const type of ['pointercancel','lostpointercapture'])pork.addEventListener(type,()=>{porkGesture=null;pork.style.translate='';$('.tiger-tray').classList.remove('is-smearing');$('#paper-tiger').classList.remove('is-ready');});pork.addEventListener('click',event=>{if(event.detail===0)feed();});$('#feed').addEventListener('click',feed);

function stopMicrophone(){micRevision++;cancelAnimationFrame(micFrame);micFrame=0;micStream?.getTracks().forEach(track=>track.stop());micStream=null;micContext?.close().catch(()=>{});micContext=null;ritualUI?.incenseMic('idle');}
$('#microphone').addEventListener('click',async()=>{
 if(micStream){stopMicrophone();return;}
 if(game.phase!=='incense'||game.blown||game.pausedAt!==null)return;
 const revision=++micRevision;ritualUI?.incenseMic('requesting');
 let stream,context;
 try{
   if(!navigator.mediaDevices?.getUserMedia)throw new Error('unsupported');stream=await navigator.mediaDevices.getUserMedia({audio:true});
   if(revision!==micRevision||game.phase!=='incense'){stream.getTracks().forEach(track=>track.stop());return;}
   context=new (window.AudioContext||window.webkitAudioContext)();await context.resume();
   if(revision!==micRevision||game.phase!=='incense'){stream.getTracks().forEach(track=>track.stop());context.close().catch(()=>{});return;}
   micStream=stream;micContext=context;const source=context.createMediaStreamSource(stream),analyser=context.createAnalyser();analyser.fftSize=512;source.connect(analyser);const samples=new Float32Array(analyser.fftSize);let loudSince=null;
   ritualUI?.incenseMic('listening');
   function listen(){if(revision!==micRevision||game.phase!=='incense'||game.pausedAt!==null){stopMicrophone();return;}analyser.getFloatTimeDomainData(samples);const rms=Math.sqrt(samples.reduce((sum,s)=>sum+s*s,0)/samples.length);ritualUI?.incenseLevel(rms/.15);if(rms>.1){loudSince??=performance.now();if(performance.now()-loudSince>180&&game.lit.size===3){blow();return;}}else loudSince=null;micFrame=requestAnimationFrame(listen);}micFrame=requestAnimationFrame(listen);
 }catch{stream?.getTracks().forEach(track=>track.stop());context?.close().catch(()=>{});if(revision===micRevision){stopMicrophone();ritualUI?.incenseMic('error');}}
});
function selectTab(name,focus=false){for(const button of document.querySelectorAll('[data-tab]')){const active=button.dataset.tab===name;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;$(`#panel-${button.dataset.tab}`).hidden=!active;if(active&&focus)button.focus({preventScroll:true});}}
function scrollToCollection(){$('.stall-collection').scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});}
function openShop(name){settle();renderStall();selectTab(name);$(`#tab-${name}`).focus({preventScroll:true});scrollToCollection();}
for(const shortcut of document.querySelectorAll('[data-shortcut]'))shortcut.addEventListener('click',()=>openShop(shortcut.dataset.shortcut));
for(const button of document.querySelectorAll('[data-tab]')){button.addEventListener('click',()=>{settle();renderStall();selectTab(button.dataset.tab);scrollToCollection();});button.addEventListener('keydown',event=>{const names=['stall','kits','friends'],index=names.indexOf(button.dataset.tab);let next;if(event.key==='ArrowRight')next=(index+1)%3;if(event.key==='ArrowLeft')next=(index+2)%3;if(event.key==='Home')next=0;if(event.key==='End')next=2;if(next!==undefined){event.preventDefault();selectTab(names[next],true);scrollToCollection();}});}
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(PHASES.includes(game.phase))pause();else audio.stop();syncProgress();}else{settle();if(!PHASES.includes(game.phase)&&!purchaseUI.isOpen)renderStall();purchaseUI.render();if(audio.context&&game.pausedAt===null)unlockSound();}});window.addEventListener('pagehide',()=>{if(PHASES.includes(game.phase))pause();audio.stop();stopMicrophone();syncProgress();});window.addEventListener('resize',()=>{cancelGestures();polishCollections();});reduced.addEventListener('change',()=>{paperAnimation?.cancel();shoeAnimation?.cancel();});
neighbourhoodUI=createNeighbourhoodUI({game,audio,getState:()=>state,setNeighbourhood:next=>{state={...state,neighbourhood:next};save();},refresh:renderStall,cancelGestures,onGesture:(gesture,direction)=>whack({gesture,direction,pointer:'comic-event-button'}),onExtraScore:spendKitOnce,onAccept:nextKind=>{kind=nextKind;$('#worry-input').value='';drawWorries();}});
$('#kit-skill')?.remove();
$('#open-journey').addEventListener('click',()=>uxUI?.openCollection());
for(const costume of document.querySelectorAll('[data-fong-costume]'))costume.innerHTML=fongCostumeArt();for(const id of illustratedDecor)$('#stall-'+id).innerHTML=decorArt(id);for(const ghost of document.querySelectorAll('[data-ghost]'))ghost.innerHTML=ghostArt(ghost.dataset.ghost);for(const master of document.querySelectorAll('[data-fong]')){const icon=$('.fong-logo').cloneNode(true);icon.className='fong-logo master-avatar';master.append(icon);}drawWorries();settle();renderStall();updateSound();enableOffline($('#offline-status'));

renderRitualTiming();
document.addEventListener('languagechange',()=>{drawWorries();renderStall();renderRitualTiming();purchaseUI.render();});

const backupUI=createBackupUI({getState:()=>state,beforeExport:()=>{settle();renderStall();},onImport:next=>{syncProgress();state=next;save();settle();renderStall();},isPlaying:()=>PHASES.includes(game.phase),isPersistent:()=>persistent});
window.addEventListener('storage',event=>{if(event.storageArea!==storage||(event.key!==STORAGE_KEY&&event.key!==null))return;if(syncProgress()){if(!PHASES.includes(game.phase)&&!purchaseUI.isOpen){settle();renderStall();}purchaseUI.render();}});
window.addEventListener('pageshow',event=>{if(event.persisted&&syncProgress()&&!PHASES.includes(game.phase)){settle();renderStall();}});
document.addEventListener('languagechange',()=>backupUI.render());
uxUI=createUX({game,audio,preferences,itemName,getState:()=>state,isPersistent:()=>persistent,onStart:start,onHome:backToStall,onChooseWorry:()=>{backToStall();$('#worry-input').value='';$('#worry-select').focus({preventScroll:true});$('.worry-field').scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});},onShop:openShop,onToggleSound:toggleSound,onVoice:value=>{$('#voice').checked=value;audio.voice=value;preferences.update({voice:value});},onBackup:(type,opener)=>{if(type==='export')$('#export-save').click();else backupUI.requestImport(opener);},onQuit:backToStall,onRepair:id=>repairItem(id,{focus:false}),onDecorAction:(action,id)=>{returnToDecor=id;if(action==='discard')askDiscard(id);else $(`[data-decor="${id}"]`).click();},pause,resume,openUltimateGuide:()=>ritualUI?.openFinisherGuide()});
stallLayoutUI=createStallLayout({getState:()=>state,itemName,canEdit:()=>!PHASES.includes(game.phase)&&!document.querySelector('dialog[open]'),onMove:(id,index)=>{const next=placeDecoration(state.neighbourhood,state.decor,id,index);if(next){state={...state,neighbourhood:next};save();renderStall();}}});
$('#random-events').addEventListener('change',()=>{preferences.update({randomEvents:$('#random-events').checked});renderRitualTiming();});
$('#voice').addEventListener('change',()=>{audio.voice=$('#voice').checked;preferences.update({voice:audio.voice});uxUI.render();});
document.addEventListener('languagechange',()=>uxUI.render());
$('#start').disabled=false;$('#quick-start').disabled=false;uxUI.render();

ritualUI=createRitualUI({game,audio,getState:()=>state,refresh:renderStall,announce:say,cancelOrdinary:cancelGestures,pause,resume,claimDaily:async()=>{const claim=()=>{if(game.phase!=='setup')return null;syncProgress();const next=dailyReward(state);if(!next)return null;state=next;save();return next;};try{if(navigator.locks?.request)return await navigator.locks.request('beat-bad-luck-daily',claim);}catch{}return claim();}});
ritualUI.render();ritualUI.daily();

playControls=createPlayControls({game,getState:()=>state,itemName,requestBuy,onSelect:id=>{settle();if(!state.ownedSkins.includes(id))return;state=buySkin(state,id);save();renderStall();}});playControls.render();

for(const type of ['contextmenu','selectstart','dragstart'])document.addEventListener(type,event=>{const target=event.target instanceof Element?event.target:null;if(target?.closest('.ritual-stage,.pause-overlay,#finisher-stage'))event.preventDefault();},{capture:true});
