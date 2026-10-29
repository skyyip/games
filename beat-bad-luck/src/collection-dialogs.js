import {stallIcon} from './mobile-dialogs.js';
import {getLanguage} from '../../grid-rush/src/language.js';
import {animateDialog} from './stall-polish.js';
import {decorArt,weaponArt} from './art.js';
import {patronArt,recordMedal} from './celebration-art.js';
const comicIcon=(body)=>`<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false"><g stroke="#675365" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
const scenesIcon=comicIcon('<rect x="7" y="19" width="34" height="23" rx="5" fill="#a7d4c0"/><path d="m5 13 33-8 3 9-34 8Z" fill="#ffe2a2"/><path d="m12 12 7 6m5-9 7 6M17 28v1m14-1v1m-12 5q5 5 10 0" fill="none"/>');
const albumIcon=comicIcon('<path d="M8 6h29v36H10q-7-4 0-9h27" fill="#f1b5c6"/><path d="M13 6v27m5-18h13m-10 6v1m7-1v1m-7 5q4 4 8 0" fill="none"/>');
const secretIcon=comicIcon('<path d="M8 21h32v22H8Z" fill="#b8c8ed"/><path d="M5 15h38v10H5Z" fill="#ffe3a3"/><path d="M24 15V43m-1-28Q5 12 12 4q10-3 12 11 2-14 12-11 7 8-11 11" fill="none"/><path d="m14 31 3-1m13 0 3 1m-14 5q5 5 10 0" fill="none"/>');
const entries=[
 ['shop-stall','#panel-stall','#tab-stall',['裝飾攤位','Decorate stall'],()=>stallIcon],
 ['shop-kits','#panel-kits','#tab-kits',['除厄法寶庫','Ritual helpers'],()=>weaponArt('flipflop')],
 ['shop-friends','#panel-friends','#tab-friends',['貴人圖鑑','Good company'],()=>patronArt('kungfu-sing')],
 ['challenges','#journey-panel-challenges','#journey-tab-challenges',['趣味稱號','Fun titles'],()=>recordMedal(1)],
 ['scenes','#journey-panel-scenes','#journey-tab-scenes',['攤位名場面','Stall scenes'],()=>scenesIcon],
 ['album','#journey-panel-album','#journey-tab-album',['平安籤冊','Fortune album'],()=>albumIcon],
 ['backup','#save-tools-panel','#save-tools-title',['帶住攤位周圍去','Take your stall with you'],()=>stallIcon],
 ['secret','#secret-collection',null,['神秘片場收藏','Secret film-set collection'],()=>secretIcon]
];
// Move the live content, retaining all inventory, purchase and collection handlers.
export function createCollectionDialogs({preferences,canOpen=()=>true}){
 const records=new Map();let active=null,serial=0;
 const local=pair=>pair[getLanguage()==='zh-Hant'?0:1];
 const remember=record=>{record.position=record.scroll.scrollTop;if(['challenges','scenes','album'].includes(record.id))preferences.update({positions:{...preferences.value.positions,[record.id]:record.position}});};
 for(const [id,panelSelector,triggerSelector,label,art]of entries){
  const panel=document.querySelector(panelSelector);if(!panel)continue;
  let trigger=triggerSelector&&document.querySelector(triggerSelector);
  if(!trigger){trigger=document.createElement('button');trigger.type='button';trigger.id='open-secret-collection';panel.before(trigger);}
  const parent=panel.parentElement,dialog=document.createElement('dialog');dialog.id='collection-dialog-'+id;dialog.className='collection-dialog';dialog.setAttribute('translate','no');dialog.setAttribute('aria-labelledby',dialog.id+'-title');
  dialog.innerHTML=`<header class="collection-heading"><h2 id="${dialog.id}-title"></h2><button type="button" class="collection-close"><span aria-hidden="true">×</span><span class="collection-close-label"></span></button></header><div class="collection-scroll" tabindex="0"></div>`;
  const scroll=dialog.querySelector('.collection-scroll'),close=dialog.querySelector('.collection-close'),title=dialog.querySelector('h2');scroll.setAttribute('role','region');scroll.setAttribute('aria-labelledby',title.id);
  panel.hidden=false;panel.removeAttribute('role');panel.removeAttribute('tabindex');panel.classList.remove('tab-scroll');scroll.append(panel);parent.append(dialog);animateDialog(dialog);
  trigger.removeAttribute('role');trigger.removeAttribute('aria-selected');trigger.tabIndex=0;trigger.classList.add('collection-launch');if(id==='shop-kits')trigger.hidden=true;trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls',dialog.id);trigger.setAttribute('translate','no');
  trigger.innerHTML=`<span class="collection-launch-art" aria-hidden="true">${art()}</span><span class="collection-launch-label"></span><span class="collection-launch-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6 18 18 6M7 6h11v11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
  const record={id,panel,trigger,dialog,scroll,close,title,label,position:preferences.value.positions[id]??0,returnFocus:true,opener:trigger,focusIndex:-1};records.set(id,record);
  if(id==='secret'||id==='backup')trigger.addEventListener('click',()=>open(id,trigger));
  close.addEventListener('click',()=>dialog.close());
  let outsideDown=false;const outside=event=>{const r=dialog.getBoundingClientRect();return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;};
  dialog.addEventListener('pointerdown',event=>outsideDown=event.target===dialog&&outside(event));
  dialog.addEventListener('pointerup',event=>{if(outsideDown&&event.target===dialog&&outside(event))dialog.close();outsideDown=false;});dialog.addEventListener('pointercancel',()=>outsideDown=false);
  scroll.addEventListener('scroll',()=>{if(dialog.open&&dialog.dataset.motion!=='closing')record.position=scroll.scrollTop;},{passive:true});
  const animatedClose=dialog.close.bind(dialog);dialog.close=()=>{if(dialog.open&&dialog.dataset.motion!=='closing')remember(record);return animatedClose();};
  dialog.addEventListener('close',()=>{if(dialog.open)return;if(active===record)active=null;if(record.returnFocus&&!document.querySelector('dialog[open]')){const opener=record.opener?.isConnected?record.opener:trigger;opener.focus({preventScroll:true});}});
  scroll.addEventListener('click',event=>{const button=event.target.closest('button');record.focusIndex=button?[...panel.querySelectorAll('button')].indexOf(button):-1;},true);
  dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')].filter(n=>n.getClientRects().length),first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 }
 // One two-column menu keeps all five destinations together, retaining their handlers.
 const menu=document.createElement('div');menu.id='collection-menu';menu.className='collection-launchers collection-menu';menu.setAttribute('role','group');
 const hub=document.querySelector('#neighbourhood-hub .neighbourhood-inner')??document.querySelector('#neighbourhood-hub');hub.prepend(menu);
 for(const id of ['shop-friends','secret','album','challenges','scenes']){const record=records.get(id);if(record)menu.append(record.trigger);}
 for(const group of document.querySelectorAll('.stall-tabs,.journey-tabs')){group.setAttribute('role','group');group.classList.add('collection-launchers');if(![...group.children].some(child=>!child.hidden))group.hidden=true;}
 const legend=document.querySelector('#rarity-legend');if(legend)records.get('shop-stall').scroll.prepend(legend);
 function render(){menu.setAttribute('aria-label',local(['貴人及收藏','Patrons and collections']));for(const record of records.values()){
  const {id,trigger,title,close,label}=record,text=local(label);
  trigger.querySelector('.collection-launch-label').textContent=text;title.textContent=id==='secret'?record.panel.querySelector('h3').textContent:text;close.querySelector('.collection-close-label').textContent=local(['關閉','Close']);close.setAttribute('aria-label',local(['關閉','Close'])+' · '+text);
  trigger.removeAttribute('aria-selected');trigger.tabIndex=0;
 }if(active?.dialog.open&&document.activeElement===document.body&&active.focusIndex>=0){const button=active.panel.querySelectorAll('button')[active.focusIndex];if(button&&!button.disabled)button.focus({preventScroll:true});}}
 async function open(id,opener){
  const record=records.get(id);if(!record||!canOpen())return false;
  if(document.querySelector('dialog[open]:not(.collection-dialog)'))return false;
  const request=++serial;if(active&&active!==record){active.returnFocus=false;await active.dialog.close();if(request!==serial)return false;}
  if(record.dialog.open)return true;active=record;record.opener=opener??record.trigger;record.returnFocus=true;
  if(id.startsWith('shop-')&&legend)record.scroll.prepend(legend);
  if(['challenges','scenes','album'].includes(id)){const notice=document.querySelector('#neighbour-note');if(notice)record.scroll.append(notice);}
  render();record.dialog.showModal();record.scroll.scrollTop=record.position;record.close.focus({preventScroll:true});return true;
 }
 async function closeActive({returnFocus=true}={}){if(!active)return;active.returnFocus=returnFocus;await active.dialog.close();}
 window.addEventListener('pagehide',()=>{if(active)remember(active);});
 render();return {open,render,closeActive,get active(){return active?.dialog.open?active.id:null;}};
}
