import {weaponArt,decorArt} from './art.js';
import {weaponScoreMultiplier,decorHourlyRate} from './catalog.js';
import {KIT_SKILLS} from './kit-skills.js';
import {getLanguage} from '../../grid-rush/src/language.js';

export function createPurchaseUI({getState,itemName,onReturn,onStart,onView,onReveal=()=>{}}){
 const dialog=document.querySelector('#purchase-dialog'),find=id=>dialog.querySelector('#'+id);
 let receipt=null,outsideDown=false,revealTimer=null,revealed=false;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function reveal(){if(!dialog.open||!receipt||revealed)return;revealed=true;dialog.dataset.revealed='true';onReveal();}
 const local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en;
 const put=(id,value)=>{find(id).textContent=value;};
 const number=value=>value.toLocaleString(getLanguage());
 function render(){
  if(!receipt)return;const {kind,item,cost,level}=receipt,kit=kind==='weapon',upgrade=!kit&&level>1;
  put('purchase-kicker',kit?local('法寶到手，衰氣退散！','New kit. Good vibes!'):upgrade?local('攤位升級，更旺場！','Stall upgraded. Looking good!'):local('新擺設，街坊都讚！','A new delight for your stall!'));
  put('purchase-title',itemName(item));
  put('purchase-effect',kit?local(`解壓分數 ×${weaponScoreMultiplier(item.id)}`,`Relief score ×${weaponScoreMultiplier(item.id)}`):local(`等級 ${level} · 每小時 ${decorHourlyRate(item,level)} 香油錢`,`Level ${level} · ${decorHourlyRate(item,level)} oil per hour`));
  const skill=KIT_SKILLS[item.id];
  put('purchase-detail',kit?(skill?local('招牌技：'+skill.name[0],'Signature: '+skill.name[1]):local('已經裝備好，隨時可以除厄！','Equipped and ready for your next ritual!')):upgrade?local('新等級已在攤位展示，生意更旺！','Your stall is already showing its new level!'):local('已經擺到你的攤位，街坊等緊圍觀！','Already placed in your stall. The neighbours approve!'));
  put('purchase-note',kit?local('法寶已裝備，可用兩次儀式；每局首次命中扣一次。','Equipped for two rituals; one use is spent on each ritual’s first hit.'):local('想換位或修補，可以到攤位管理。','Arrange or repair it in your stall whenever you like.'));
  put('purchase-spent',local(`花費 ${number(cost)} 香油錢 · 餘額 ${number(getState().coins)}`,`${number(cost)} oil spent · ${number(getState().coins)} remaining`));
  put('purchase-action',kit?local('立即開始除厄','Start a ritual'):local('查看我的攤位','See it in my stall'));
  put('purchase-continue',local('繼續逛逛','Keep browsing'));
  find('purchase-close').setAttribute('aria-label',local('關閉購買成功提示','Close purchase celebration'));
 }
 function finish(intent){
  const current=receipt;if(!current)return;clearTimeout(revealTimer);receipt=null;outsideDown=false;
  if(intent==='start')onStart();else if(intent==='view')onView(current.item.id);else onReturn(current.kind,current.item.id);
 }
 function dismiss(intent='browse'){
  if(!dialog.open)return;dialog.close();finish(intent);
 }
 find('purchase-close').addEventListener('click',()=>dismiss());
 find('purchase-continue').addEventListener('click',()=>dismiss());
 find('purchase-action').addEventListener('click',()=>dismiss(receipt?.kind==='weapon'?'start':'view'));
 dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
 dialog.addEventListener('keydown',event=>{
  if(event.key!=='Tab')return;const first=find('purchase-close'),last=find('purchase-continue');
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
 });
 // Also restore focus if the host closes a native dialog directly.
 dialog.addEventListener('close',()=>{if(!dialog.open)finish('browse');});
 const outside=event=>{const r=dialog.getBoundingClientRect();return event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom;};
 dialog.addEventListener('pointerdown',event=>{outsideDown=event.button===0&&event.target===dialog&&outside(event);});
 dialog.addEventListener('pointerup',event=>{const close=outsideDown&&event.target===dialog&&outside(event);outsideDown=false;if(close)dismiss();});
 dialog.addEventListener('pointercancel',()=>outsideDown=false);
 reduced.addEventListener('change',()=>{if(reduced.matches){clearTimeout(revealTimer);reveal();}});
 return {
  get isOpen(){return dialog.open;},render,
  show(kind,item,cost,level=0){
   if(dialog.open||receipt)return false;
   receipt={kind,item,cost,level};dialog.dataset.kind=kind;dialog.dataset.revealed='false';revealed=false;
   find('purchase-art').innerHTML=kind==='weapon'?weaponArt(item.id):decorArt(item.id);
   render();dialog.showModal();find('purchase-continue').focus({preventScroll:true});if(reduced.matches)reveal();else revealTimer=setTimeout(reveal,760);return true;
  }
 };
}
