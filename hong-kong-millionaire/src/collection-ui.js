import {ART} from './art.js';
import {CULTURE_CARDS,SERIES,GEAR,DISPLAY_GEAR,cardById,gearById,unlockedPrefixes,walletBalance,DRAW_PRICE,GOLD_PRICE} from './economy.js';
import {titleFor} from './game.js';
const money=n=>'$'+Number(n).toLocaleString('en-HK');
const el=(tag,text='',className='')=>{const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;};
export function prefixLabel(id){const prefix=SERIES.find(s=>s.id===id)?.prefix;return prefix?el('span',prefix,'prefix-label'):null;}
export function renderPrefixedTitle(target,wallet,title){target.replaceChildren();const label=unlockedPrefixes(wallet).some(s=>s.id===wallet?.prefix)?prefixLabel(wallet.prefix):null;if(label)target.append(label,' ');target.append(el('span',title,'achievement-label'));}
export function cultureCardImage(card){return ART['card-'+card.id+'.webp']??ART['card-'+card.id+'.svg']??ART[['streets','harbour'].includes(card.series)?'collection-streets-harbour.webp':'collection-'+card.series+'.webp'];}
export function cultureCardCrop(card){if(ART['card-'+card.id+'.webp']||ART['card-'+card.id+'.svg'])return {column:0,row:0,columns:1,rows:1};const index=CULTURE_CARDS.filter(c=>c.series===card.series).findIndex(c=>c.id===card.id);const modern=['streets','harbour'].includes(card.series),slot=index+(card.series==='harbour'?6:0),columns=modern?4:2;return {column:slot%columns,row:Math.floor(slot/columns),columns,rows:3};}
export function installCollection({cloud,getUser,getProfile,login,onChange=()=>{},onArcade=()=>{}}){
 const dialog=document.createElement('dialog');dialog.id='collection-dialog';dialog.className='wide-dialog collection-dialog';dialog.setAttribute('aria-labelledby','collection-title');
 dialog.innerHTML='<button class="close-button" type="button" aria-label="關閉情懷收藏">×</button><h2 id="collection-title">情懷收藏與商店</h2><div class="wallet-summary"><span>可用獎金</span><strong id="wallet-balance">—</strong></div><nav class="reward-tabs" aria-label="收藏商店分類"><button type="button" data-tab="draw">文化扭蛋</button><button type="button" data-tab="cards">我的卡冊</button><button type="button" data-tab="gear">個人造型</button></nav><p id="shop-status" class="status" role="status"></p><button id="shop-recover" class="outline" type="button" hidden>核對上次操作</button><div id="shop-content"></div><div class="collection-footer"><label class="checkbox-label"><input id="reward-sound" type="checkbox">播放短音效及合成語音</label><button id="shop-refresh" class="text-button" type="button">重新讀取餘額</button><button id="shop-arcade" class="outline" type="button">前往街坊遊樂場 ↗</button></div>';
 document.body.append(dialog);dialog.querySelector('.close-button').onclick=()=>dialog.close();const $=id=>dialog.querySelector('#'+id);
 const reveal=document.createElement('dialog');reveal.id='culture-card-dialog';reveal.className='culture-card-dialog';reveal.setAttribute('aria-labelledby','culture-card-title');reveal.innerHTML='<header class="detail-toolbar"><button class="close-button" type="button" aria-label="關閉文化卡">×</button></header><div id="culture-card-face"></div><h2 id="culture-card-title"></h2><p id="culture-card-story"></p><a id="culture-card-source" class="source-link" target="_blank" rel="noopener noreferrer">延伸閱讀 ↗</a><button class="primary card-done" type="button">收到，繼續收藏</button>';document.body.append(reveal);for(const button of reveal.querySelectorAll('button'))button.onclick=()=>reveal.close();
 const confirm=document.createElement('dialog');confirm.id='shop-confirm-dialog';confirm.setAttribute('aria-labelledby','shop-confirm-title');confirm.innerHTML='<h2 id="shop-confirm-title">確認使用獎金？</h2><p id="shop-confirm-copy"></p><button id="shop-confirm-buy" class="primary" type="button">確認</button><button class="outline" type="button">先再看看</button>';document.body.append(confirm);confirm.querySelector('.outline').onclick=()=>confirm.close();
 let state=null,uid=null,loadedUid=null,loadingUid=null,busy=false,version=0,tab='draw',intent=null;
 const pendingKey=()=>uid?'sky.hkm.shop.pending.'+uid:null;
 function pending(){try{return JSON.parse(localStorage.getItem(pendingKey()));}catch{return null;}}
 function soundEnabled(){try{return localStorage.getItem('sky.hkm.sound')==='1';}catch{return false;}}
 $('reward-sound').checked=soundEnabled();$('reward-sound').onchange=()=>{try{localStorage.setItem('sky.hkm.sound',$('reward-sound').checked?'1':'0');}catch{}};
 function apply(){const w=state?.wallet;document.documentElement.dataset.hkmTheme=w?.theme??'default';document.body.dataset.hkmFrame=w?.frame??'none';onChange(state);}
 function button(label,handler,disabled=false){const b=el('button',label,'outline');b.type='button';b.disabled=disabled||busy;b.onclick=handler;return b;}
 function tile(title,copy=''){const box=el('article','','reward-tile');box.append(el('h3',title));if(copy)box.append(el('p',copy));return box;}
 function cardFace(c,owned=true){const box=el('div','','culture-face'+(c.foil?' foil':'')+(owned?'':' is-locked')),img=new Image();img.src=cultureCardImage(c);img.alt=c.name+'原創插畫';img.width=['streets','harbour'].includes(c.series)?1448:1024;img.height=['streets','harbour'].includes(c.series)?1086:1536;img.loading='lazy';img.decoding='async';const crop=cultureCardCrop(c);img.style.width=(crop.columns*100)+'%';img.style.height=(crop.rows*100)+'%';img.style.left=(-crop.column*100)+'%';img.style.top=(-crop.row*100)+'%';box.append(img,el('span',c.foil?'閃卡':'文化卡','card-rarity'));
  if(c.foil&&owned){
   const sparkles=el('span','','foil-sparkles');sparkles.setAttribute('aria-hidden','true');box.append(sparkles);
   const reset=()=>box.style.removeProperty('--holo-strength');
   const follow=event=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches){reset();return;}const r=box.getBoundingClientRect(),x=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),y=Math.max(0,Math.min(1,(event.clientY-r.top)/r.height));box.style.setProperty('--holo-x',x*100+'%');box.style.setProperty('--holo-y',y*100+'%');box.style.setProperty('--holo-strength','.55');};
   box.onpointermove=box.onpointerdown=follow;box.onpointerleave=box.onpointercancel=reset;box.onpointerup=event=>{if(event.pointerType!=='mouse')reset();};
  }return box;}
 function showCard(c,owned=true){
  if(!c)return;reveal.querySelector('#culture-card-face').replaceChildren(cardFace(c,owned));reveal.querySelector('#culture-card-title').textContent=c.name;
  reveal.querySelector('#culture-card-story').textContent=owned?c.story:'仲差呢張！抽中之後，就可以睇埋背後嘅香港小故事。';
  const link=reveal.querySelector('#culture-card-source');link.href=c.source;link.hidden=!owned;reveal.showModal();
 }
 async function request(action,title,cost=0){if(busy||!state)return;const actor=uid,epoch=version;if(pending()){if(!await load(true)||uid!==actor||version!==epoch)return;if(pending()){$('shop-status').textContent='請先核對上次操作，再開始新的購買。';return;}}intent=action;confirm.querySelector('#shop-confirm-title').textContent=title;confirm.querySelector('#shop-confirm-copy').textContent=(cost?'將使用 '+money(cost)+' 獎金。':'這項設定不扣除獎金。')+' 目前可用 '+money(state.balance)+'。';confirm.showModal();}
 confirm.querySelector('#shop-confirm-buy').onclick=()=>{const action=intent;confirm.close();intent=null;if(action)transact(action);};
 async function transact(action){
  if(busy||!uid)return;const actor=uid,epoch=version,requestId=action.requestId??crypto.randomUUID(),payload={...action,requestId};busy=true;
  try{localStorage.setItem(pendingKey(),JSON.stringify(payload));}catch{}$('shop-status').textContent='正在核對交易…';render();
  try{
   let next;try{next=await cloud.shop(payload);}catch(error){let checked;try{checked=await cloud.purchaseStatus(payload);}catch{}if(!checked?.confirmed)throw error;next=checked;}if(uid!==actor||version!==epoch)return;state=next;loadedUid=uid;try{localStorage.removeItem(pendingKey());}catch{}
   apply();$('shop-status').textContent=action.type==='draw'||action.type==='gold'?'已抽到「'+(cardById(next.outcome)?.name??'文化卡')+'」。':action.type==='equip'?'展示設定已保存。':'已解鎖收藏。';
   if((action.type==='draw'||action.type==='gold')&&dialog.open)showCard(cardById(next.outcome),true);
  }catch(error){if(uid===actor&&version===epoch){if(error.message==='quote-expired')try{localStorage.removeItem(pendingKey());}catch{}$('shop-status').textContent=cloud.errorText(error)+(error.message==='quote-expired'?'':' 可按「核對上次操作」確認；同一收據不會重複扣款。');}}
  finally{if(uid===actor&&version===epoch){busy=false;render();}}
 }
 function render(){
  for(const b of dialog.querySelectorAll('[data-tab]'))b.setAttribute('aria-pressed',String(b.dataset.tab===tab));
  $('wallet-balance').textContent=state?money(state.balance):'—';$('shop-recover').hidden=!pending();$('shop-recover').disabled=busy;$('shop-refresh').disabled=busy;
  const list=$('shop-content');list.replaceChildren();if(!state){list.append(el('p','登入後讀取你的可用餘額及收藏。','empty-book'));return;}const w=state.wallet;
  if(tab==='draw'){
   const grid=el('div','','reward-grid gacha-grid');
   for(const gold of [false,true]){const cost=gold?GOLD_PRICE:DRAW_PRICE,box=tile(gold?'閃卡金蛋':'普通文化扭蛋');const machine=el('figure','','gacha-machine'+(gold?' gold-machine':'')),dome=el('div','','gacha-dome'),cover=new Image();cover.className='gacha-cover';cover.src=ART[gold?'gacha-gold.webp':'gacha-colour.webp'];cover.alt='';cover.width=512;cover.height=512;cover.decoding='async';dome.append(cover);const base=el('div','','gacha-base');base.append(el('span','','gacha-knob'),el('span','','gacha-slot'));machine.append(dome,base);machine.setAttribute('aria-hidden','true');box.prepend(machine);const label=gold?'抽一顆閃卡金蛋':'抽一張文化卡',draw=button(label,()=>request({type:gold?'gold':'draw'},gold?'抽閃卡金蛋？':'抽普通文化卡？',cost),state.balance<cost);draw.classList.add('gacha-draw');draw.setAttribute('aria-label',label);draw.replaceChildren(el('span',gold?'抽一顆':'抽一張'),el('span',gold?'閃卡金蛋':'文化卡'));box.append(el('strong',money(cost),'reward-price'),draw);grid.append(box);}list.append(grid,el('p','重複卡會保留數量。抽取序號會保存，重新連線不會重抽；所有卡片只作收藏，不提供答題加成。','quiet'));
  }else if(tab==='cards'){
   list.append(el('p','集齊每類全部卡片，解鎖相應收集稱號','quiet'));
   for(const series of SERIES){const cards=CULTURE_CARDS.filter(c=>c.series===series.id),owned=cards.filter(c=>(w.cards[c.id]??0)>0),section=el('section','','card-series');section.append(el('h3',series.name+' · '+owned.length+'／'+cards.length));
    const grid=el('div','','culture-grid');for(const c of cards){const n=w.cards[c.id]??0,b=el('button','','culture-tile'+(n?' owned':' locked'));b.type='button';b.append(cardFace(c,n>0),el('b',c.name),el('small',n?'已收藏 ×'+n:'未抽到'));b.onclick=()=>showCard(c,n>0);grid.append(b);}section.append(grid);
    const complete=unlockedPrefixes(w).some(s=>s.id===series.id);const active=w.prefix===series.id,equip=button('',()=>request({type:'equip',slot:'prefix',id:active?'':series.id},'更新稱號前綴？'),!complete&&!active);equip.setAttribute('aria-label',active?'已使用前綴，按此還原':'使用【'+series.prefix+'】前綴');equip.append(prefixLabel(series.id),document.createTextNode(active?' 使用中 · 還原':' 使用前綴'));section.append(equip);list.append(section);}
  }else if(tab==='gear'){
   const preview=el('div','','identity-preview'),avatar=el('span',(getProfile()?.displayName??'香港')[0],'profile-avatar '+w.frame);const title=el('strong');renderPrefixedTitle(title,w,titleFor(getProfile()?.bestPrize??0).name);preview.append(avatar,title);list.append(preview);
   const grid=el('div','','reward-grid gear-grid');let previousKind='';for(const g of DISPLAY_GEAR){if(g.kind!==previousKind){grid.append(el('h3',{frame:'頭像邊框',theme:'香港主題',exit:'離場動畫'}[g.kind],'gear-section-title'));previousKind=g.kind;}const owned=w.owned.includes(g.id),active=w[g.kind]===g.id,box=tile(g.name,g.description),demo=el('div',g.kind==='frame'?'港':'',g.kind==='frame'?'profile-avatar gear-preview '+g.id:'theme-preview '+g.id);if(g.kind!=='frame'){const image=new Image();const index=['theme-cafe','theme-ink','theme-harbour','theme-tram','theme-lantern','theme-porcelain'].indexOf(g.id);image.src=g.kind==='theme'?(index>=0?ART['theme-panels.webp']:ART[g.id+'.webp']):ART[g.id+'.webp'];if(g.kind==='theme'&&index<0)demo.classList.add('theme-single');if(g.kind==='theme'&&index>=0){demo.classList.add('theme-atlas');image.style.left=(-(index%2)*100)+'%';image.style.top=(-Math.floor(index/2)*100)+'%';}image.alt=g.name+'原創插畫';image.loading='lazy';image.decoding='async';demo.append(image);}box.dataset.gearId=g.id;box.dataset.gearKind=g.kind;box.dataset.gearPrice=g.price;box.prepend(demo);box.append(el('strong',owned?'已擁有':money(g.price),'reward-price'),button(owned?(active?'使用中，按此還原':'套用'): '購買',()=>request(owned?{type:'equip',slot:g.kind,id:active?(g.kind==='frame'?'none':'default'):g.id}:{type:'buy',id:g.id},owned?'更新展示設定？':'購買'+g.name+'？',owned?0:g.price),!owned&&state.balance<g.price));grid.append(box);}list.append(grid);
  }
 }
 for(const b of dialog.querySelectorAll('[data-tab]'))b.onclick=()=>{tab=b.dataset.tab;render();};
 $('shop-recover').onclick=()=>{const action=pending();if(['pass','retry-ticket'].includes(action?.type)){dialog.close();onArcade();}else if(action)transact(action);};$('shop-refresh').onclick=()=>load(true);$('shop-arcade').onclick=()=>{dialog.close();onArcade();};
 async function load(force=false){
  if(!uid||typeof cloud.wallet!=='function'||loadingUid===uid)return false;const actor=uid,epoch=version;loadingUid=uid;
  try{
   $('shop-status').textContent='正在讀取雲端收藏…';let next=await cloud.wallet();if(uid!==actor||version!==epoch)return false;
   const action=pending();let recovered=false;
   if(action){const checked=await cloud.purchaseStatus(action);if(uid!==actor||version!==epoch)return false;if(checked.confirmed){next=checked;try{if(pending()?.requestId===action.requestId)localStorage.removeItem(pendingKey());}catch{}recovered=true;}}
   state=next;loadedUid=uid;apply();$('shop-status').textContent=pending()?'有一筆未確認操作，請核對上次結果。':recovered?'上次操作已確認，餘額與收藏已同步。':'';render();
   if(recovered&&['draw','gold'].includes(action.type)&&dialog.open&&!force)showCard(cardById(next.outcome),true);return true;
  }catch(error){if(uid===actor&&version===epoch){loadedUid=uid;$('shop-status').textContent=cloud.errorText(error);render();}return false;}finally{if(version===epoch)loadingUid=null;}
 }
 function setIdentity(next){if(uid!==next){uid=next;version++;state=null;loadedUid=null;loadingUid=null;busy=false;apply();dialog.close();reveal.close();confirm.close();}}
 async function open(nextTab=tab){setIdentity(getUser()?.uid??null);if(!uid){login();return;}tab=['draw','cards','gear'].includes(nextTab)?nextTab:'draw';dialog.showModal();render();await load();}
 return {open,setIdentity,restore:()=>{setIdentity(getUser()?.uid??null);if(uid&&loadedUid!==uid&&getProfile()?.uid===uid)load();},reload:()=>load(true),get wallet(){return state?.wallet??null;},get state(){return state;},soundEnabled};
}
