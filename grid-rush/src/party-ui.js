import {getLanguage} from './language.js';

export function mountPlayers(root,onChange=()=>{}){
  let names=Array.from({length:2},(_,i)=>getLanguage()==='zh-Hant'?`玩家 ${i+1}`:`Player ${i+1}`);
  const rows=root.querySelector('.player-rows'),minus=root.querySelector('[data-count="minus"]'),plus=root.querySelector('[data-count="plus"]'),count=root.querySelector('.player-count');
  function render(){
    rows.replaceChildren(...names.map((name,i)=>{
      const row=document.createElement('label');row.className='player-row';
      const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');
      const input=document.createElement('input');input.type='text';input.value=name;input.maxLength=24;input.autocomplete='off';input.setAttribute('aria-label',`Player ${i+1}`);
      input.addEventListener('input',()=>{names[i]=input.value;onChange();});row.append(number,input);return row;
    }));
    count.textContent=String(names.length);minus.disabled=names.length===2;plus.disabled=names.length===6;onChange();
  }
  minus.addEventListener('click',()=>{if(names.length>2){names.pop();render();}});
  plus.addEventListener('click',()=>{if(names.length<6){names.push(getLanguage()==='zh-Hant'?`玩家 ${names.length+1}`:`Player ${names.length+1}`);render();}});
  render();return {get names(){return names.map((name,i)=>name.trim()||(getLanguage()==='zh-Hant'?`玩家 ${i+1}`:`Player ${i+1}`));}};
}
export function literal(element,value){element.textContent=value;element.setAttribute('translate','no');}
export async function enableOffline(message){
  try{if(!/^https?:$/.test(location.protocol)||self.origin==='null'||!('serviceWorker'in navigator))return;
    await navigator.serviceWorker.register('./sw.js');await navigator.serviceWorker.ready;message.textContent='Ready to play offline';
  }catch{/* Sandboxed previews and unsupported browsers can still play. */}
}
