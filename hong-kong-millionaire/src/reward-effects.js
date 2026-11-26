import {ART} from './art.js';
import {prefixedTitle} from './economy.js';
import {titleFor} from './game.js';
const seen=new Set();
export function playRedVan(run,sound=false){
 const key='sky.hkm.redvan.'+(run.id??run.uid+':'+run.day);if(seen.has(key))return;try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1');}catch{}seen.add(key);
 const layer=document.createElement('div');layer.className='redvan-exit';layer.setAttribute('role','status');layer.innerHTML='<div class="redvan-road"></div><div class="redvan-car" aria-hidden="true"><img src="'+ART['exit-redvan.webp']+'" alt="" width="230" height="150"></div><strong>落車啦唔該！</strong><span>識得收手，街坊下次再嚟。</span>';document.body.append(layer);
 if(sound&&'speechSynthesis'in window){const voice=new SpeechSynthesisUtterance('落車啦唔該');voice.lang='zh-HK';voice.rate=.95;speechSynthesis.speak(voice);}setTimeout(()=>layer.remove(),matchMedia('(prefers-reduced-motion: reduce)').matches?2200:3400);
}
export async function downloadResultCard({run,name,wallet,badge=''}){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;const c=canvas.getContext('2d');if(!c)throw Error('canvas');
 c.fillStyle=wallet?.theme==='theme-ink'?'#e7e3d5':'#fff2cc';c.fillRect(0,0,1080,1080);
 const illustrations=await Promise.all([wallet?.theme,wallet?.frame].map(async id=>{const url=id?.startsWith('theme-')?(ART[id+'.webp']??ART['theme-panels.webp']):ART[id+'.svg'];if(!url)return null;const image=new Image();image.src=url;try{await image.decode();return image;}catch{return null;}}));if(illustrations[0]){c.globalAlpha=.12;const index=['theme-cafe','theme-ink','theme-harbour','theme-tram','theme-lantern','theme-porcelain'].indexOf(wallet.theme),image=illustrations[0],w=image.naturalWidth/(index<0?1:2),h=image.naturalHeight/(index<0?1:3),slot=Math.max(0,index);c.drawImage(image,slot%2*w,Math.floor(slot/2)*h,w,h,0,0,1080,1080);c.globalAlpha=1;}
 const extraColors={'frame-jade':['#315e48','#d9bc73','#7a9f81'],'frame-harbour':['#365d7b','#ddc68f','#8fbec3'],'frame-lantern':['#ad4e39','#e8c374','#80483a']};
 const colors=extraColors[wallet?.frame]??(wallet?.frame==='frame-rwb'?['#c64039','#faf7e6','#23619b']:wallet?.frame==='frame-neon'?['#793ea0','#e35070','#376e58']:['#a6762c','#e6ba55','#846322']);
 for(let i=0;i<3;i++){c.strokeStyle=colors[i];c.lineWidth=13;c.strokeRect(27+i*17,27+i*17,1026-i*34,1026-i*34);}
 c.textAlign='center';c.fillStyle='#234b3d';c.font='bold 46px sans-serif';c.fillText('香港百萬富翁',540,160);
 c.font='32px sans-serif';c.fillText((run.kind==='weekend'?'週末練習':run.kind==='retry'?'再挑戰一次':'每日挑戰')+' · 香港街坊',540,225);
 c.font='bold 44px sans-serif';const safe=String(name).slice(0,20);if(illustrations[1]){c.fillText(safe,625,330,650);c.font='bold 42px sans-serif';c.fillText(safe[0]??'港',150,322);c.drawImage(illustrations[1],70,235,160,160);}else c.fillText(safe,540,330,850);
 c.fillStyle='#983a2d';c.font='bold 47px sans-serif';c.fillText(prefixedTitle(wallet,titleFor(run.payout).name),540,415,850);
 c.fillStyle='#72521c';c.font='bold 94px sans-serif';c.fillText('$'+run.payout.toLocaleString('en-HK'),540,550);
 c.font='28px sans-serif';c.fillText('港元・不可兌換現金',540,607);
 c.fillStyle='#234b3d';c.font='32px sans-serif';c.fillText('答對 '+run.correct+'／15 題 · '+(run.timeMs/1000).toFixed(1)+' 秒',540,695);
 for(let i=0;i<15;i++){const x=222+(i%5)*134,y=746+Math.floor(i/5)*51;c.fillStyle=run.answers[i]?.outcome==='correct'?'#316e52':run.answers[i]?'#b34a3b':'#c9c9ba';c.fillRect(x,y,100,29);}
 if(badge){c.fillStyle='#983a2d';c.font='bold 26px sans-serif';c.fillText('今場徽章：【'+badge+'】',540,943,850);}
 c.fillStyle='#435b50';c.font='23px sans-serif';c.fillText('sky-playground.com/games/hong-kong-millionaire/',540,978);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('image');
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='香港百萬富翁-'+run.day+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
