import {getLanguage} from '../../grid-rush/src/language.js';
const counters=new WeakMap(),rich=new WeakMap();
export function countNumber(node,target){
 const locale=getLanguage(),old=counters.get(node);target=Number(target)||0;
 if(old?.target===target&&old.locale===locale)return;
 if(old?.frame)cancelAnimationFrame(old.frame);
 const state={target,locale,current:old?.current??0,frame:0},from=state.current,at=performance.now();counters.set(node,state);node.dataset.value=String(target);node.dataset.digits=String(Math.floor(target)).length;node.setAttribute('translate','no');node.setAttribute('aria-label',target.toLocaleString(locale));
 const paint=value=>{state.current=value;node.textContent=Math.round(value).toLocaleString(locale);};
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||from===target){paint(target);return;}
 node.classList.add('is-counting');const tick=now=>{const p=Math.min(1,(now-at)/650);paint(from+(target-from)*(1-(1-p)**3));if(p<1)state.frame=requestAnimationFrame(tick);else{state.frame=0;node.classList.remove('is-counting');}};state.frame=requestAnimationFrame(tick);
}
export function numberText(node,text){
 text=String(text);if(rich.get(node)===text&&node.textContent===text)return;rich.set(node,text);node.setAttribute('translate','no');
 const fragment=document.createDocumentFragment();let last=0;
 for(const match of text.matchAll(/\d[\d,]*(?:\.\d+)?(?:[KMB萬億])?/g)){fragment.append(document.createTextNode(text.slice(last,match.index)));const n=document.createElement('strong');n.className='stat-number';n.textContent=match[0];fragment.append(n);last=match.index+match[0].length;}
 fragment.append(document.createTextNode(text.slice(last)));node.replaceChildren(fragment);
}
// Animate the actual modal; it stays modal until the closing animation finishes.
export function animateDialog(dialog){
 const nativeOpen=dialog.showModal.bind(dialog),nativeClose=dialog.close.bind(dialog);let motion=null,closing=null;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 dialog.showModal=()=>{if(dialog.open)return;motion?.cancel();nativeOpen();dialog.dataset.motion='opening';if(reduced()){dialog.dataset.motion='open';return;}motion=dialog.animate([{opacity:0,transform:'translateY(18px) scale(.94)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:260,easing:'cubic-bezier(.2,.85,.25,1)',fill:'none'});motion.finished.then(()=>dialog.dataset.motion='open',()=>{});};
 dialog.close=()=>{if(closing)return closing;if(!dialog.open)return Promise.resolve();motion?.cancel();dialog.dataset.motion='closing';dialog.querySelectorAll('button').forEach(b=>b.setAttribute('aria-disabled','true'));closing=Promise.resolve().then(async()=>{if(!reduced()){motion=dialog.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(12px) scale(.97)'}],{duration:180,easing:'ease-in',fill:'none'});try{await motion.finished;}catch{}}nativeClose();dialog.dataset.motion='closed';dialog.querySelectorAll('button').forEach(b=>b.removeAttribute('aria-disabled'));closing=null;});return closing;};
 dialog.addEventListener('click',e=>{if(dialog.dataset.motion==='closing'){e.preventDefault();e.stopImmediatePropagation();}},true);dialog.addEventListener('cancel',e=>{e.preventDefault();dialog.close();});return dialog;
}
