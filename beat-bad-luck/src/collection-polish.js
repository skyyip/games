import {prepareScrollRegions} from './sanctuary-ui.js';
import {WEAPONS,DECOR,FRIENDS} from './catalog.js';
import {getLanguage} from '../../grid-rush/src/language.js';
const labels=[['普通','Common'],['少有','Uncommon'],['稀有','Rare'],['珍稀','Epic'],['傳說','Legendary']];
export function rarity(kind,item){if(item.hidden)return 5;if(kind==='friend')return item.stars;const edges=kind==='weapon'?[400,1500,4500,10000]:[1500,3500,7500,15000];return Math.min(5,edges.filter(n=>item.cost>n).length+1);}
const originals=new Map();
export function polishCollections(){
 prepareScrollRegions();
 const zh=getLanguage()==='zh-Hant';
 for(const [selector,kind,items,attr]of [['#weapon-list>.kit-row','weapon',WEAPONS,'weapon'],['#decor-list>.decor-row','decor',DECOR,'decor'],['#friend-list>.friend-row','friend',FRIENDS,null]]){
  document.querySelectorAll(selector).forEach((row,i)=>{const item=attr?items.find(x=>x.id===row.querySelector(`[data-${attr}]`).dataset[attr]):items[i];if(!item)return;const n=rarity(kind,item);row.dataset.rarity=n;let badge=row.querySelector('.rarity-badge');if(!badge){badge=document.createElement('small');badge.className='rarity-badge';badge.setAttribute('translate','no');row.querySelector('div')?.append(badge);}badge.textContent=`${'★'.repeat(n)} ${labels[n-1][zh?0:1]}`;});
 }
 const tabs=document.querySelector('.stall-tabs');if(tabs&&!document.querySelector('#rarity-legend')){const legend=document.createElement('p');legend.id='rarity-legend';legend.className='rarity-legend';legend.setAttribute('translate','no');tabs.after(legend);}const legend=document.querySelector('#rarity-legend');if(legend)legend.innerHTML=labels.map((label,i)=>`<span data-rarity="${i+1}">${i+1}★ ${label[zh?0:1]}</span>`).join('');
 // Recompute from original font declarations, never from a previous enlargement.
 for(const [node,old]of originals){if(!node.isConnected){originals.delete(node);continue;}if(old.value)node.style.setProperty('font-size',old.value,old.priority);else node.style.removeProperty('font-size');}
 const nodes=[...document.querySelectorAll('#panel-stall *,#panel-kits *,#panel-friends *,.stall-tabs button,#rarity-legend span,#purchase-dialog h2,#purchase-dialog p,#purchase-dialog button,#decor-quick-dialog h2,#decor-quick-dialog p,#decor-quick-dialog button')].filter(e=>!e.closest('svg,.sr-only,.kit-art,.decor-icon,.friend-icon')&&([...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||e.matches('input,select'))&&!e.matches('option,optgroup'));
 const extra=[...document.querySelectorAll('#neighbourhood-hub *,#active-commission,.pause-card p')].filter(e=>!e.closest('svg,select,option,.sr-only,#challenge-list,#challenge-title,#journey-tab-challenges,.journey-tabs')&&([...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||e.matches('p,b,strong,small,button,label,summary,h3')));
 const factors=new Map([...nodes,...extra].map(node=>[node,1.2]));for(const node of document.querySelectorAll('.kit-shortcuts button'))factors.set(node,1.3);for(const node of document.querySelectorAll('#decor-quick-dialog h2,#decor-quick-dialog p,#decor-quick-dialog button'))factors.set(node,1.08);
 for(const node of document.querySelectorAll('.filter-controls input,.filter-controls select'))factors.set(node,1);
 // Additional percentages apply to the original, already established collection scale.
 const scale=(selector,factor)=>{for(const node of document.querySelectorAll(selector)){if(node.closest('svg,.sr-only')||!([...node.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())||node.matches('p,small,label,button,summary,legend,output')))continue;factors.set(node,(factors.get(node)??1)*factor);}};
 scale('details>summary,details>summary .skin-choice-copy',.85);
 scale('#story p,#rules li,#rules p',1.2);
 // The explicit backup accordion request overrides the general summary reduction.
 for(const node of document.querySelectorAll('#save-tools-title'))factors.delete(node);
 scale('#save-tools-title,.save-tools p,.save-tools button',1.15);
 scale('#worry-question,.custom-label',1.15);scale('#worry-privacy',1.1);
 scale('.bbl-intro .bbl-kicker,.fong-intro .bbl-kicker,.stall-wallet>.bbl-kicker',1.15);
 scale('#stall-showcase-title',1.25);scale('#open-journey',1.1);
 scale('#commission-list .neighbour-card>b',1.15);scale('#commission-list .neighbour-card>strong',.85);
 scale('.records-card>.bbl-kicker,#records b,#records small,#records .empty-record,#storage-note',1.15);
 scale('.fortune-slip small,#reward-line,#journey-result,#card-status,#skin-usage-result,#result-kit-note,#personal-postcard small',1.25);
 scale('#friend-arrival',1.15);scale('.result-stats small,#result>.bbl-kicker,.postcard-actions button',1.25);
 const sizes=[...factors].map(([node,factor])=>[node,parseFloat(getComputedStyle(node).fontSize),factor]);
 for(const [node,size,factor]of sizes){if(!originals.has(node))originals.set(node,{value:node.style.getPropertyValue('font-size'),priority:node.style.getPropertyPriority('font-size')});if(size>0)node.style.setProperty('font-size',`${Math.round(size*factor*1000)/1000}px`,'important');}
}
