const celebrated=new Set();
export function celebrateMillion(run){
 if(run?.phase!=='finished'||run.reason!=='complete'||run.correct!==15||run.payout!==1000000)return;
 const key='sky.hkm.celebration.'+(run.id??run.uid+':'+run.day+':'+(run.kind??'daily'));
 if(celebrated.has(key))return;
 try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1');}catch{}
 celebrated.add(key);const dialog=document.getElementById('celebration-dialog');if(!dialog)return;
 let note=dialog.querySelector('.celebration-mode-note');if(!note){note=document.createElement('p');note.className='celebration-mode-note';dialog.append(note);}note.textContent=run.kind==='weekend'?'週末練習全中！虛擬成績一百萬；本場實際額外入帳 .getElementById('celebration-confetti');field.replaceChildren();
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)for(let i=0;i<48;i++){
  const piece=document.createElement('i');piece.style.cssText='--x:'+((i*37)%101)+'%;--delay:'+(i%9*-.17)+'s;--turn:'+((i*71)%360)+'deg;--color:'+['#d74d35','#e9bd51','#4a8b70','#6a9ab5'][i%4];field.append(piece);
 }
 dialog.showModal();setTimeout(()=>field.replaceChildren(),6500);
}
+run.credit.toLocaleString('en-HK')+'。':run.kind==='assisted'?'🛒換題挑戰全中！成績已進獨立換題榜。':'十五題全中！恭喜登上香港知識頂峰。';
 const field=document.getElementById('celebration-confetti');field.replaceChildren();
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches)for(let i=0;i<48;i++){
  const piece=document.createElement('i');piece.style.cssText='--x:'+((i*37)%101)+'%;--delay:'+(i%9*-.17)+'s;--turn:'+((i*71)%360)+'deg;--color:'+['#d74d35','#e9bd51','#4a8b70','#6a9ab5'][i%4];field.append(piece);
 }
 dialog.showModal();setTimeout(()=>field.replaceChildren(),6500);
}
