import {WORRIES,WEAPONS,weaponScoreMultiplier} from './catalog.js';
import {SKINS,skinArt,skinScoreMultiplier} from './skins.js';
import {weaponArt} from './art.js';
import {weaponCondition,purchasePrice,skinUses} from './progress.js';
import {STORIES,commissionPay} from './neighbourhood.js';
import {getLanguage,translate} from '../../grid-rush/src/language.js';

// Draft choices belong to this visit. Personal worry text is never persisted.
export function createPreparationUI({getState,getWorry,onChooseWorry,onAcceptStory,onEquip,requestBuy,onEvents}) {
 const $=selector=>document.querySelector(selector),local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en;
 const optionalStepsEnabled=false;
 const welcome=$('#welcome');
 let commissionEnabled=Boolean(getState().neighbourhood.active),previousStory=getState().neighbourhood.active,storiesKey='',kitsKey='';
 const steps=document.createElement('div');steps.id='ritual-preparation';steps.setAttribute('translate','no');
 steps.innerHTML=`<div class="preparation-intro"><h2 id="preparation-title"></h2><p id="preparation-help"></p></div>
 <section class="preparation-step" id="prepare-worry" aria-labelledby="prepare-worry-title"><h3 class="preparation-heading"><span class="preparation-number">01</span><span id="prepare-worry-title"></span><small id="worry-required"></small></h3><div class="preparation-body" id="prepare-worry-body"><div id="worry-controls"></div><button type="button" class="preparation-link" id="write-own-worry" aria-expanded="false" aria-controls="custom-worry-controls"></button><div id="custom-worry-controls" hidden></div><p id="worry-selection-summary" class="preparation-note"></p></div></section>
 <details class="preparation-step" id="prepare-commission"><summary class="preparation-heading"><span class="preparation-number">02</span><span><b id="prepare-commission-title"></b><small id="commission-selection-summary"></small></span></summary><div class="preparation-body"><fieldset class="preparation-options"><legend class="sr-only" id="commission-choice-label"></legend><label><input type="radio" name="preparation-commission" value="none"><span id="commission-none-label"></span></label><label><input type="radio" name="preparation-commission" value="yes"><span id="commission-yes-label"></span></label></fieldset><p class="preparation-note" id="commission-help"></p><div id="preparation-commissions" hidden></div><p class="preparation-note" id="commission-target-note"></p><button type="button" class="preparation-link" id="use-commission-worry" hidden></button></div></details>
 <details class="preparation-step" id="prepare-events"><summary class="preparation-heading"><span class="preparation-number">03</span><span><b id="prepare-events-title"></b><small id="events-selection-summary"></small></span></summary><div class="preparation-body"><fieldset class="preparation-options"><legend class="sr-only" id="events-choice-label"></legend><label><input type="radio" name="preparation-events" value="off"><span><b id="events-off-label"></b><small id="events-off-help"></small></span></label><label><input type="radio" name="preparation-events" value="on"><span><b id="events-on-label"></b><small id="events-on-help"></small></span></label></fieldset></div></details>
 <details class="preparation-step" id="prepare-skin"><summary class="preparation-heading"><span class="preparation-number">04</span><span><b id="prepare-skin-title"></b><small id="skin-selection-summary"></small></span></summary><div class="preparation-body"><div class="preparation-preview" id="preparation-skin-preview" aria-hidden="true"></div><div id="preparation-skins"></div></div></details>
 <details class="preparation-step" id="prepare-kit"><summary class="preparation-heading"><span class="preparation-number">05</span><span><b id="prepare-kit-title"></b><small id="kit-selection-summary"></small></span></summary><div class="preparation-body"><div class="preparation-preview" id="preparation-kit-preview" aria-hidden="true"></div><p id="preparation-kit-help" class="preparation-note"></p><div id="preparation-owned-kits" class="preparation-kit-grid"></div><details class="preparation-catalog" id="preparation-kit-catalog"><summary id="all-kits-label"></summary><p id="preparation-wallet" class="preparation-note"></p><div id="preparation-other-kits" class="preparation-kit-grid"></div></details></div></details>
 <section class="preparation-receipt" aria-labelledby="preparation-receipt-title"><h3 id="preparation-receipt-title"></h3><p id="preparation-receipt-worry"></p><p id="preparation-receipt-options"></p><p id="preparation-receipt-items"></p><p id="preparation-usage-note" class="preparation-note"></p></section>`;
 const field=$('.worry-field'),select=$('#worry-select'),input=$('#worry-input');
 for(const id of ['commission','events'])steps.querySelector('#prepare-'+id).hidden=!optionalStepsEnabled;
 if(!optionalStepsEnabled)for(const [id,number]of [['skin','02'],['kit','03']])steps.querySelector('#prepare-'+id+' .preparation-number').textContent=number;
 steps.querySelector('#preparation-receipt-options').hidden=!optionalStepsEnabled;
 welcome.querySelector('.fong-intro').after(steps);
 $('#worry-controls').append(field);
 $('#custom-worry-controls').append(field.querySelector('.custom-label'),input,$('#worry-privacy'));
 $('#worry-ready-note').setAttribute('aria-live','polite');
 $('#commission-target-note').setAttribute('role','status');
 $('#worry-select').setAttribute('aria-describedby','worry-ready-note');
 steps.querySelector('.preparation-receipt').append($('#start'));
 // Keep existing controls and event handlers as the single source of gameplay state.
 $('.random-events-option').hidden=true;
 $('.selected-kit').hidden=true;$('#use-hands').hidden=true;$('#open-journey').hidden=true;$('#active-commission').hidden=true;
 const skinChooser=$('.skin-chooser');$('#preparation-skins').append(skinChooser);skinChooser.open=true;
 const extras=document.createElement('details');extras.className='preparation-catalog';extras.innerHTML='<summary id="all-skins-label"></summary>';
 skinChooser.querySelector('.skin-grid').before(extras);extras.append(skinChooser.querySelector('.skin-grid'));
 const ownedSkins=document.createElement('div');ownedSkins.className='skin-owned-slot skin-grid';extras.before(ownedSkins);
 const dashboard=$('#stall-dashboard'),stall=document.createElement('section');stall.id='my-stall';stall.setAttribute('aria-labelledby','my-stall-label');stall.innerHTML='<h2 id="my-stall-label" translate="no"></h2>';
 dashboard.before(stall);stall.append(dashboard);$('.kit-shortcuts').querySelector('[data-shortcut=kits]').hidden=true;stall.append($('.kit-shortcuts'));
 const notice=$('#daily-reward-note');if(notice)steps.before(notice);
 const firstHelp=welcome.querySelector('.fong-intro>div:last-child');
 firstHelp.querySelector('.bbl-kicker').hidden=true;firstHelp.querySelector('h2').hidden=true;firstHelp.querySelector('p:last-child').setAttribute('translate','no');
 document.body.classList.add('preparation-ready');
 const text=(id,zh,en)=>{const node=$('#'+id),value=local(zh,en);if(node.textContent!==value)node.textContent=value;};
 const currentStory=()=>{const n=getState().neighbourhood,story=STORIES.find(s=>s.id===n.active);if(!story)return null;const index=n.replay?story.chapters.length-1:n.chapters[story.id];return {story,index,chapter:story.chapters[index]};};
 const name=item=>local(item.nameZh??translate(item.name),item.name);
 function focusStep(id='worry') {
  const step=$('#prepare-'+id);if(step.tagName==='DETAILS')step.open=true;
  const target=id==='worry'?(input.value.trim()?input:select):step.querySelector('summary');
  if(target===input)showCustom(true);
  target.focus({preventScroll:true});step.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 function showCustom(open) {$('#custom-worry-controls').hidden=!open;$('#write-own-worry').setAttribute('aria-expanded',String(open));}
 $('#write-own-worry').addEventListener('click',()=>{const open=$('#custom-worry-controls').hidden;showCustom(open);if(open){onChooseWorry('');render();input.focus();}});
 select.addEventListener('change',()=>{if(select.value)showCustom(false);render();});
 input.addEventListener('input',render);
 for(const radio of document.querySelectorAll('[name=preparation-commission]'))radio.addEventListener('change',()=>{commissionEnabled=radio.value==='yes';render();});
 for(const radio of document.querySelectorAll('[name=preparation-events]'))radio.addEventListener('change',()=>{onEvents(radio.value==='on');render();});
 $('#use-commission-worry').addEventListener('click',()=>{const current=currentStory();if(current){onChooseWorry(current.chapter.kind);showCustom(false);render();focusStep('worry');}});
 function renderStories() {
  const state=getState(),n=state.neighbourhood,container=$('#preparation-commissions');
  container.hidden=!commissionEnabled;
  const key=JSON.stringify([getLanguage(),n.active,n.replay,n.chapters]);if(key===storiesKey)return;storiesKey=key;
  const focused=document.activeElement?.dataset.preparationStory;
  container.replaceChildren(...STORIES.map(story=>{
   const completed=n.chapters[story.id],replay=completed>=story.chapters.length,index=replay?story.chapters.length-1:completed,chapter=story.chapters[index];
   const full=commissionPay(chapter,index===story.chapters.length-1,replay),base=commissionPay(chapter,index===story.chapters.length-1,replay,false);
   const card=document.createElement('article');card.className='preparation-story';
   const title=document.createElement('h4'),task=document.createElement('p'),bonus=document.createElement('p'),reward=document.createElement('p'),button=document.createElement('button');
   title.textContent=local(story.name[0],story.name[1])+` · ${index+1}/${story.chapters.length}`;
   task.textContent=local(`今局：${chapter.name[0]}。完成整個儀式即可過章。`,`This ritual: ${chapter.name[1]}. Finish the ritual to advance.`);
   bonus.textContent=local(`額外挑戰：${chapter.text[0]}`,`Optional bonus: ${chapter.text[1]}`);
   reward.textContent=local(`完成報酬 ${base.oil} 香油錢／${base.merit} 功德；挑戰達成最高 ${full.oil}／${full.merit}。`,`Completion: ${base.oil} oil / ${base.merit} merit; up to ${full.oil} / ${full.merit} with the bonus.`);
   button.type='button';button.className='preparation-action';button.dataset.preparationStory=story.id;button.setAttribute('aria-pressed',String(n.active===story.id));
   button.textContent=n.active===story.id?local('已接好・今局順便幫忙','Selected for this ritual'):replay?local('重溫這個委託','Replay this commission'):local('接呢單委託','Accept this commission');
   button.addEventListener('click',()=>{if(onAcceptStory(story.id,replay)){commissionEnabled=true;previousStory=story.id;render();$('#preparation-commissions').querySelector(`[data-preparation-story="${story.id}"]`)?.focus({preventScroll:true});}});
   card.append(title,task,bonus,reward,button);return card;
  }));
  if(focused)container.querySelector(`[data-preparation-story="${focused}"]`)?.focus({preventScroll:true});
 }
 function renderKits() {
  const state=getState(),focused=document.activeElement?.dataset.preparationKit??document.activeElement?.dataset.preparationRestock;
  const key=JSON.stringify([getLanguage(),state.owned,state.equipped,state.weaponUses,state.coins,state.merit,state.coupons]);if(key===kitsKey)return;kitsKey=key;
  const cards=WEAPONS.filter(w=>!w.hidden||state.owned.includes(w.id)).map(w=>{
   const owned=state.owned.includes(w.id),selected=state.equipped===w.id,cost=purchasePrice(state,w.cost),condition=weaponCondition(state,w.id);
   const card=document.createElement('article');card.className='preparation-kit-card';
   const button=document.createElement('button');button.type='button';button.className='preparation-kit-choice';button.dataset.preparationKit=w.id;button.setAttribute('aria-pressed',String(selected));
   button.innerHTML=weaponArt(w.id)+'<b></b><span></span><small></small>';
   button.querySelector('b').textContent=name(w);button.querySelector('span').textContent=`${local('解壓分數','Score')} ×${weaponScoreMultiplier(w.id)}`;
   const uses=w.starter?local('免費・不限次數','Free · unlimited'):owned?local(`剩餘 ${condition.remaining} 次`,` ${condition.remaining} uses left`):local(`每件可用 ${condition.capacity} 次`,`${condition.capacity} uses per kit`);
   button.querySelector('small').textContent=uses+' · '+(selected?local('已選用 ✓','Selected ✓'):owned?local('選用','Equip'):local(`購買・${cost} 香油錢`,`Buy · ${cost} oil`));
   button.disabled=!owned&&(state.coins<cost||state.merit<w.merit);button.addEventListener('click',()=>owned?onEquip(w.id):requestBuy('weapon',w));card.append(button);
   if(!owned&&button.disabled){const note=document.createElement('small');note.textContent=state.merit<w.merit?local(`需要 ${w.merit} 功德（不扣除）`,`Requires ${w.merit} merit (not spent)`):local(`還欠 ${cost-state.coins} 香油錢`,`Need ${cost-state.coins} more oil`);card.append(note);}
   if(owned&&!w.starter&&!w.hidden){const buy=document.createElement('button');buy.type='button';buy.className='preparation-link';buy.dataset.preparationRestock=w.id;buy.textContent=local(`補購・${cost} 香油錢`,`Restock · ${cost} oil`);buy.disabled=state.coins<cost||state.merit<w.merit;buy.addEventListener('click',()=>requestBuy('weapon',w));card.append(buy);}
   return {owned,card};
  });
  $('#preparation-owned-kits').replaceChildren(...cards.filter(c=>c.owned).map(c=>c.card));$('#preparation-other-kits').replaceChildren(...cards.filter(c=>!c.owned).map(c=>c.card));
  if(focused)$('#prepare-kit').querySelector(`[data-preparation-kit="${focused}"]`)?.focus({preventScroll:true});
 }
 function render() {
    const state=getState(),worry=getWorry(),current=currentStory(),events=optionalStepsEnabled&&$('#random-events').checked;
  if(state.neighbourhood.active!==previousStory){previousStory=state.neighbourhood.active;commissionEnabled=Boolean(previousStory);}
  const selected=WORRIES.find(w=>w.id===worry.kind),worryText=worry.text.trim()||(selected?local(selected.labelZh,selected.label):'');
  select.replaceChildren(new Option(local('揀一件心塞事…','Choose a worry…'),''),...WORRIES.map(w=>new Option(local(w.labelZh,w.label),w.id)));select.value=worry.kind;
  const skin=SKINS.find(s=>s.id===state.selectedSkin)??SKINS[0],kit=WEAPONS.find(w=>w.id===state.equipped),kitUses=weaponCondition(state,kit.id);
  const commissionText=commissionEnabled&&current?local(`${current.story.name[0]}・第 ${current.index+1} 章`,`${current.story.name[1]} · chapter ${current.index+1}`):commissionEnabled?local('請選一個委託，或今局先唔接','Choose a commission, or skip it this ritual'):local('今次專心處理自己','Just my own worry');
  const eventText=events?local('加入隨機挑戰','Random challenges on'):local('輕鬆除厄・事件關閉','Relaxed · events off');
  for(const [id,zhText,enText] of [
   ['preparation-title','準備好，打走今日嘅心塞','Get ready to leave a worry behind'],['preparation-help','只需選一件心事。其他已有預設，想改先展開。','Only a worry is required. Other choices are ready; open any step to change them.'],
  ['prepare-worry-title','今日有咩令你心塞？','What is weighing on you?'],['worry-required','衰嘢交出嚟','Hand it over!'],['write-own-worry','我想自己寫','Write my own worry'],
   ['worry-question','選擇一件心塞事','Choose one worry'],['worry-privacy','心事只留在這次儀式，不會存入紀錄。','Your words stay in this ritual and are never saved.'],
   ['prepare-commission-title','順便幫街坊一個忙？','Help a neighbour along the way?'],['commission-choice-label','今局是否接委託','Commission for this ritual'],['commission-none-label','今次專心處理自己','Just my own worry'],['commission-yes-label','順便接個委託','Help with a commission'],['commission-help','完成儀式即可過章；額外挑戰只影響報酬。今局不接，已接故事及進度會保留。','Finishing the ritual advances the chapter; bonus targets affect pay. Skipping this ritual preserves your accepted story and progress.'],
   ['prepare-events-title','今局想輕鬆，定刺激啲？','A relaxed ritual, or an extra challenge?'],['events-choice-label','選擇隨機事件','Random event choice'],['events-off-label','輕鬆除厄','Relaxed ritual'],['events-off-help','不加突發事件，照樣完成儀式和故事。','No surprise event. Rituals and stories still progress.'],['events-on-label','加入隨機挑戰','Add a random challenge'],['events-on-help','今局加入一次事件，可挑戰額外分數與稱號。','One event this ritual, with optional bonus points and titles.'],
   ['prepare-skin-title','揀個小人，代表今日嘅煩惱','Choose a look for your worry'],['prepare-kit-title','揀件除惡法寶','Choose a ritual helper'],['all-skins-label','查看全部款式／購買','All looks / buy'],['all-kits-label','查看全部法寶／購買','All helpers / buy'],['preparation-kit-help','免費及已擁有法寶可直接選用；首次得分才扣次數。','Equip a free or owned helper. A use is spent only on the first score.'],['my-stall-label','我的小攤・裝飾、街坊故事與收藏','My stall · decorations, stories & collections'],['preparation-receipt-title','今局準備好了嗎？','Ready for this ritual?'],
  ])text(id,zhText,enText);
  $('.custom-label').textContent=local('寫低你的小心事','Write your worry');input.placeholder=local('例如：半夜又收到工作訊息…','For example: another late-night work message…');
  text('worry-selection-summary',worryText?`今日想打走：${worryText}`:'揀選上面的心事，或寫低你自己的小心事。',worryText?`Today’s worry: ${worryText}`:'Choose a worry above, or write your own.');
  text('commission-selection-summary',commissionText,commissionText);text('events-selection-summary',eventText,eventText);
  text('skin-selection-summary',`${name(skin)} · ${skin.starter?'免費・不限次數':`剩餘 ${skinUses(state,skin.id)} 次`} · ×${skinScoreMultiplier(skin.id)}`,`${name(skin)} · ${skin.starter?'free · unlimited':`${skinUses(state,skin.id)} uses left`} · ×${skinScoreMultiplier(skin.id)}`);
  text('kit-selection-summary',`${name(kit)} · ${kit.starter?'免費・不限次數':`剩餘 ${kitUses.remaining} 次`} · ×${weaponScoreMultiplier(kit.id)}`,`${name(kit)} · ${kit.starter?'free · unlimited':`${kitUses.remaining} uses left`} · ×${weaponScoreMultiplier(kit.id)}`);
  $('#preparation-skin-preview').innerHTML=skinArt(skin.id);$('#preparation-kit-preview').innerHTML=weaponArt(kit.id);
  text('preparation-wallet',`現有 ${state.coins.toLocaleString()} 香油錢・${state.merit.toLocaleString()} 功德（只作解鎖，不扣除）`,`Balance: ${state.coins.toLocaleString()} oil · ${state.merit.toLocaleString()} merit (unlock requirement, not spent)`);
  const usage=skin.starter&&kit.starter?local('本局不消耗道具。','No items are consumed this ritual.'):local(`首次得分才扣：${[!skin.starter&&'小人紙 1 次',!kit.starter&&'法寶 1 次'].filter(Boolean).join('、')}。未得分離開不扣次數。`,`First score spends ${[!skin.starter&&'1 paper use',!kit.starter&&'1 helper use'].filter(Boolean).join(' and ')}. Leaving before scoring spends nothing.`);
  text('preparation-receipt-worry',`心事：${worryText||'尚未選擇'}`,`Worry: ${worryText||'not chosen yet'}`);text('preparation-receipt-options',`${commissionText} · ${eventText}`,`${commissionText} · ${eventText}`);text('preparation-receipt-items',`${name(skin)} ＋ ${name(kit)}`,`${name(skin)} + ${name(kit)}`);text('preparation-usage-note',usage,usage);
  for(const radio of document.querySelectorAll('[name=preparation-commission]'))radio.checked=(radio.value==='yes')===commissionEnabled;
  for(const radio of document.querySelectorAll('[name=preparation-events]'))radio.checked=(radio.value==='on')===events;
  const mismatch=commissionEnabled&&current&&(worry.text.trim()||worry.kind!==current.chapter.kind),eventNeeded=commissionEnabled&&current&&current.chapter.goal==='eventsWon'&&!events;
  const target=WORRIES.find(w=>w.id===current?.chapter.kind);
  text('commission-target-note',mismatch?`你的心事已保留。額外挑戰配合「${target?.labelZh}」；不更換也可完成故事並領完成報酬。${eventNeeded?'本章的額外事件挑戰需要開啟隨機事件。':''}`:eventNeeded?'本章的額外事件挑戰需要開啟隨機事件；保持關閉仍可過章。':'',mismatch?`Your worry is preserved. The optional target uses “${target?.label}”. Keep yours to earn completion pay and advance the story.${eventNeeded?' The event bonus also needs random challenges enabled.':''}`:eventNeeded?'The event bonus needs random challenges enabled. Keep them off and the chapter still advances.':'');
  $('#use-commission-worry').hidden=!mismatch;text('use-commission-worry','改用委託建議心事（會取代目前心事）','Use the suggested worry (replaces my current worry)');
  welcome.querySelector('.fong-intro>div:last-child>p:last-child').textContent=local('「心事交低，師傅陪你慢慢打走。」','“Set your worry down. We’ll whack it away together.”');
  for(const id of ['start','quick-start']){const button=$('#'+id);button.querySelector('.work-label').textContent=local(id==='start'?'開始打小人儀式':'開始儀式',id==='start'?'Start the ritual':'Start ritual');button.setAttribute('aria-label',local('開始打小人儀式','Start the ritual'));}
  $('#quick-start').disabled=false;$('#quick-start').setAttribute('aria-describedby','worry-ready-note');
  $('#dock-kit').textContent=local(worryText?`修改心事：${worryText}`:'先選一件心塞事','Edit worry: '+(worryText||'choose one first'));
  $('#dock-kit').setAttribute('aria-label',local('修改儀式準備中的心事','Edit the worry in ritual preparation'));
  const dockCommission=commissionEnabled&&current?local(`委託第 ${current.index+1} 章`,`Commission ch. ${current.index+1}`):local('不接委託','No commission');
  const dockUsage=skin.starter&&kit.starter?local('不耗道具','no item use'):local(`首次得分：${[!skin.starter&&'紙 1 次',!kit.starter&&'法寶 1 次'].filter(Boolean).join('／')}`,`First score: ${[!skin.starter&&'1 paper',!kit.starter&&'1 helper'].filter(Boolean).join(' + ')}`);
    $('#dock-wallet').textContent=optionalStepsEnabled?`${dockCommission} · ${events?local('挑戰開啟','challenges on'):local('事件關閉','events off')}\n${name(skin)} + ${name(kit)} · ${dockUsage}`:`${name(skin)} + ${name(kit)} · ${dockUsage}`;
  $('#active-commission').hidden=true;
  renderStories();renderKits();
 }
 // Hide the floating duplicate while the full start control is visible.
 new IntersectionObserver(entries=>document.body.classList.toggle('inline-start-visible',entries[0].isIntersecting),{threshold:.6}).observe($('#start'));
 new IntersectionObserver(entries=>document.body.classList.toggle('preparation-in-view',entries[0].isIntersecting)).observe(steps);
 render();
 return {render,focusStep,validate(){if(optionalStepsEnabled&&commissionEnabled&&!currentStory()){focusStep('commission');text('commission-target-note','揀一單委託，或者選「今次專心處理自己」再開始。','Choose a commission, or select “Just my own worry” before starting.');return false;}return true;},commission:()=>optionalStepsEnabled&&commissionEnabled?getState().neighbourhood.active:'',events:()=>optionalStepsEnabled&&$('#random-events').checked,acceptSavedCommission(){commissionEnabled=true;previousStory=getState().neighbourhood.active;render();},restorePurchaseFocus(kind,id){const step=kind==='skin'?'skin':'kit';$('#prepare-'+step).open=true;const button=$(kind==='skin'?`#prepare-skin [data-skin="${id}"]`:`#prepare-kit [data-preparation-kit="${id}"]`);for(const details of button?.closest('.preparation-body')?.querySelectorAll('details')??[])if(details.contains(button))details.open=true;button?.focus({preventScroll:true});return Boolean(button);}};
}
