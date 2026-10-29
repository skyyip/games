import {SKINS,SKIN_USES,skinArt,skinScoreMultiplier} from './skins.js';
import {WEAPONS,weaponScoreMultiplier} from './catalog.js';
import {weaponArt} from './art.js';
import {comicDescription} from './ritual-rewards.js';
import {skinUses,weaponCondition} from './progress.js';
import {formatNumber} from './number-format.js';
import {animateDialog} from './stall-polish.js';
import {getLanguage} from '../../grid-rush/src/language.js';
export const magnifierArt='<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="m29 29 13 13" stroke="#674e5b" stroke-width="9" stroke-linecap="round"/><path d="m33 33 9 9" stroke="#f1ba85" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="20" r="15" fill="#d6f1e5" stroke="#675468" stroke-width="3"/><path d="m12 12 5-2" stroke="#fff9de" stroke-width="4" stroke-linecap="round"/><circle cx="15" cy="20" r="2" fill="#675468"/><circle cx="25" cy="20" r="2" fill="#675468"/><path d="M16 26q4 5 8 0" fill="none" stroke="#ad6683" stroke-width="2.5" stroke-linecap="round"/></svg>';
function createInspector({getState,itemName},kind){
 const weapon=kind==='weapon',items=weapon?WEAPONS:SKINS,art=weapon?weaponArt:skinArt,prefix=kind+'-detail',local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en;
 const dialog=document.createElement('dialog');dialog.id=prefix+'-dialog';dialog.className='skin-detail-dialog item-detail-dialog';dialog.setAttribute('translate','no');dialog.setAttribute('aria-labelledby',prefix+'-title');
 const row=id=>`<div><dt id="${prefix}-${id}-label"></dt><dd id="${prefix}-${id}"></dd></div>`;
 dialog.innerHTML=`<header class="collection-heading"><h2 id="${prefix}-title"></h2><button class="collection-close" type="button"><span aria-hidden="true">×</span><span class="collection-close-label"></span></button></header><div class="skin-detail-scroll" tabindex="0"><div id="${prefix}-art" class="item-detail-art" aria-hidden="true"></div><p id="${prefix}-description"></p><dl>${row('bonus')}${row('uses')}${row('price')}${weapon?row('merit'):''}</dl><p id="${prefix}-note" class="item-detail-note"></p></div>`;
 document.body.append(dialog);animateDialog(dialog);let current=null,opener=null;const close=dialog.querySelector('.collection-close');
 const put=(id,value)=>dialog.querySelector('#'+prefix+'-'+id).textContent=value;
 function render(){if(!current)return;const item=items.find(s=>s.id===current);if(!item)return;const state=getState(),condition=weapon?weaponCondition(state,current):null;
  put('title',itemName(item));put('description',local(weapon?comicDescription(item):item.description,item.descriptionEn??'An original comic prop. Even bad luck needs a day off.'));
  put('bonus-label',local('解壓分數倍率','Relief score bonus'));put('bonus','×'+formatNumber(weapon?weaponScoreMultiplier(current):skinScoreMultiplier(current)));
  put('uses-label',local('剩餘耐用次數','Uses remaining'));put('uses',weapon?local(`${condition.remaining} 次庫存 · 每件 ${condition.capacity} 次`,`${condition.remaining} in stock · ${condition.capacity} per kit`):`${skinUses(state,current)} / ${SKIN_USES}`);
  put('price-label',local('原價香油錢','Base price in oil'));put('price',formatNumber(item.cost));
  if(weapon){put('merit-label',local('功德門檻（不扣除）','Merit required (not spent)'));put('merit',formatNumber(item.merit));}
  put('note',local('查看詳情不會更換物品、購買或消耗次數；每局首次得分才扣一次。','Viewing never equips, buys or spends a use. A use is spent only on the first score of a ritual.'));
  close.querySelector('.collection-close-label').textContent=local('關閉','Close');close.setAttribute('aria-label',local('關閉詳情','Close details'));
 }
 function open(id,from){const item=items.find(s=>s.id===id);if(!item||item.starter||!weapon&&!getState().ownedSkins.includes(id))return;current=id;opener=from;render();dialog.querySelector('.item-detail-art').innerHTML=art(id);dialog.showModal();dialog.querySelector('.skin-detail-scroll').scrollTop=0;close.focus({preventScroll:true});}
 close.addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{if(!dialog.open){const target=opener?.isConnected?opener:document.querySelector(`[data-inspect-${kind}="${current}"]`);target?.focus({preventScroll:true});}});
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const scroll=dialog.querySelector('.skin-detail-scroll');if(event.shiftKey&&document.activeElement===close){event.preventDefault();scroll.focus();}else if(!event.shiftKey&&document.activeElement===scroll){event.preventDefault();close.focus();}});
 function attach(shell,id){const item=items.find(s=>s.id===id);if(!item||item.starter)return shell;const inspect=document.createElement('button');inspect.type='button';inspect.className='skin-inspect'+(weapon?' weapon-inspect':'');inspect.dataset[weapon?'inspectWeapon':'inspectSkin']=id;inspect.setAttribute('aria-haspopup','dialog');inspect.setAttribute('aria-controls',dialog.id);inspect.setAttribute('aria-label',local(`查看${itemName(item)}詳情`,`View ${itemName(item)} details`));inspect.innerHTML=magnifierArt;inspect.addEventListener('click',event=>{event.stopPropagation();open(id,inspect);});shell.append(inspect);return shell;}
 return {render(){if(dialog.open)render();},attach,wrap(card){const id=card.dataset.skin,item=items.find(s=>s.id===id);if(!item||item.starter)return card;const shell=document.createElement('article');shell.className='skin-card-shell';shell.append(card);return attach(shell,id);}};
}
export const createSkinInspector=options=>createInspector(options,'skin');
export const createWeaponInspector=options=>createInspector(options,'weapon');
