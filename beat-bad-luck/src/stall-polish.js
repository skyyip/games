import {getLanguage} from '../../grid-rush/src/language.js';
const counters=new WeakMap(),rich=new WeakMap();
export function countNumber(node,target){
 const locale=getLanguage(),old=counters.get(node);target=Number(target)||0;
 if(old?.target===target&&old.locale===locale)return;
 if(old?.frame)cancelAnimationFrame(old.frame);
 const state={target,locale,current:old?.current??0,frame:0},from=state.current,at=performance.now();counters.set(node,state);node.dataset.value=String(target);node.dataset.digits=String(Math.floor(target)).length;node.setAttribute('translate','no');node.setAttribute('aria-label',target.toLocaleString(locale,{maximumFractionDigits:2}));
 const paint=value=>{state.current=value;node.textContent=Math.round(value).toLocaleString(locale,{maximumFractionDigits:2});};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||from===target){paint(target);return;}
 node.classList.add('is-counting');const tick=now=>{const p=Math.min(1,(now-at)/650);paint(from+(target-from)*(1-(1-p)**3));if(p<1)state.frame=requestAnimationFrame(tick);else{state.frame=0;node.classList.remove('is-counting');}};state.frame=requestAnimationFrame(tick);
}
export function numberText(node,text){
 text=String(text);if(rich.get(node)===text&&node.textContent===text)return;rich.set(node,text);node.setAttribute('translate','no');
 const fragment=document.createDocumentFragment();let last=0;
 for(const match of text.matchAll(/\d[\d,]*(?:\.\d+)?(?:[KMB萬億])?/g)){fragment.append(document.createTextNode(text.slice(last,match.index)));const n=document.createElement('strong');n.className='stat-number';n.textContent=match[0];fragment.append(n);last=match.index+match[0].length;}
 fragment.append(document.createTextNode(text.slice(last)));node.replaceChildren(fragment);
}
// One controller per native dialog. Hold the final fade until close(), then restore DOM/focus.
const dialogControllers=new WeakMap();
export function animateDialog(dialog){
 if(dialogControllers.has(dialog))return dialog;
 dialogControllers.set(dialog,true);
 const nativeOpen=dialog.showModal.bind(dialog),nativeClose=dialog.close.bind(dialog);
 let motion=null,backdrop=null,closing=null,generation=0;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const cancel=()=>{motion?.cancel();backdrop?.cancel();motion=backdrop=null;};
 function shade(from,to,duration,easing){try{backdrop=dialog.animate([{opacity:from},{opacity:to}],{pseudoElement:'::backdrop',duration,easing,fill:'both'});}catch{}}
 dialog.showModal=()=>{
  if(dialog.open&&dialog.dataset.motion!=='closing')return;
  const current=dialog.open?getComputedStyle(dialog):null,start=current?{opacity:current.opacity,transform:current.transform}:{opacity:0,transform:'translateY(14px) scale(.97)'};
  const token=++generation;closing=null;cancel();if(!dialog.open)nativeOpen();dialog.dataset.motion='opening';
  if(reduced()){dialog.dataset.motion='open';return;}
  shade(0,1,220,'ease-out');motion=dialog.animate([start,{opacity:1,transform:'none'}],{duration:220,easing:'cubic-bezier(.18,.75,.3,1)',fill:'both'});
  motion.finished.then(()=>{if(token!==generation)return;dialog.dataset.motion='open';cancel();},()=>{});
 };
 dialog.close=(returnValue)=>{
  if(closing)return closing;if(!dialog.open)return Promise.resolve();
  const style=getComputedStyle(dialog),start={opacity:style.opacity,transform:style.transform},token=++generation;
  cancel();dialog.dataset.motion='closing';
  closing=(async()=>{
   if(!reduced()){
    shade(1,0,190,'ease-in-out');motion=dialog.animate([start,{opacity:0,transform:'translateY(10px) scale(.98)'}],{duration:190,easing:'cubic-bezier(.4,0,.6,1)',fill:'both'});
    try{await motion.finished;}catch{}
   }
   if(token!==generation)return;
   if(returnValue===undefined)nativeClose();else nativeClose(returnValue);dialog.dataset.motion='closed';cancel();closing=null;
  })();return closing;
 };
 for(const type of ['click','keydown'])dialog.addEventListener(type,e=>{if(dialog.dataset.motion==='closing'){e.preventDefault();e.stopImmediatePropagation();}},true);
 dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();});return dialog;
}
