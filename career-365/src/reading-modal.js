// Move the live DOM, preserving labels, form values and existing event handlers.
const opened=[];
export function closeReadings(root){for(const x of [...opened].reverse().filter(x=>!root||root.contains(x.details))){x.finish();x.dialog.close();}}
export function openReading(details,opener=document.activeElement){
 if(!details)return;const summary=details.querySelector(':scope > summary'),dialog=document.createElement('dialog'),title=document.createElement('h2'),content=document.createElement('div'),close=document.createElement('button');
 dialog.className='wide-dialog reading-dialog';title.id='reading-title-'+crypto.randomUUID();title.tabIndex=-1;title.textContent=summary?.textContent??'詳細內容';dialog.setAttribute('aria-labelledby',title.id);close.type='button';close.className='dialog-close';close.textContent='×';close.setAttribute('aria-label','關閉詳細內容');close.onclick=()=>dialog.close();
 const nodes=[...details.childNodes].filter(n=>n!==summary);for(const node of nodes)content.append(node);dialog.append(close,title,content);document.body.append(dialog);
 let restored=false;const finish=()=>{if(restored)return;restored=true;for(const node of [...content.childNodes])details.append(node);opened.splice(opened.indexOf(entry),1);dialog.remove();if(opener?.isConnected)opener.focus({preventScroll:true});};const entry={dialog,finish,details};opened.push(entry);dialog.addEventListener('close',finish,{once:true});
 dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const controls=[...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],summary')].filter(n=>n.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&[first,title].includes(document.activeElement)){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}});
 dialog.showModal();title.focus({preventScroll:true});
}
export function installReadingModals(){document.addEventListener('click',e=>{const summary=e.target.closest('summary');if(!summary)return;const details=summary.parentElement;if(details.tagName!=='DETAILS')return;e.preventDefault();openReading(details,summary);},true);}
