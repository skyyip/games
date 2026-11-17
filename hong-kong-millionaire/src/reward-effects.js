import {prefixedTitle} from './economy.js';
import {titleFor} from './game.js';
const seen=new Set();
export function playRedVan(run,sound=false){
 const key='sky.hkm.redvan.'+(run.id??run.uid+':'+run.day);if(seen.has(key))return;try{if(localStorage.getItem(key))return;localStorage.setItem(key,'1');}catch{}seen.add(key);
 const layer=document.createElement('div');layer.className='redvan-exit';layer.setAttribute('role','status');layer.innerHTML='<div class="redvan-road"></div><div class="redvan-car" aria-hidden="true"><svg viewBox="0 0 180 90" width="150" height="75"><path d="M12 64V24Q12 13 25 13H122L159 40V64Z" fill="#c94032" stroke="#50392c" stroke-width="3"/><path d="M17 26V18H121L145 36H17Z" fill="#fff2d2"/><path d="M23 29H68V48H23ZM77 29H116V48H77ZM126 32L147 46H126Z" fill="#96c8c8" stroke="#3d574e" stroke-width="2"/><rect x="48" y="7" width="63" height="13" rx="3" fill="#f4e7b6" stroke="#50392c"/><text x="80" y="17" text-anchor="middle" font-size="9" fill="#3b4e38">紅 VAN</text><path d="M8 63H164V72H8Z" fill="#e6b967" stroke="#50392c" stroke-width="2"/><circle cx="40" cy="72" r="13" fill="#354336"/><circle cx="135" cy="72" r="13" fill="#354336"/><circle cx="40" cy="72" r="6" fill="#e0d2ac"/><circle cx="135" cy="72" r="6" fill="#e0d2ac"/></svg></div><strong>落車啦唔該！</strong><span>識得收手，街坊下次再嚟。</span>';document.body.append(layer);
 if(sound&&'speechSynthesis'in window){const voice=new SpeechSynthesisUtterance('落車啦唔該');voice.lang='zh-HK';voice.rate=.95;speechSynthesis.speak(voice);}setTimeout(()=>layer.remove(),matchMedia('(prefers-reduced-motion: reduce)').matches?2200:3400);
}
export async function downloadResultCard({run,name,wallet,badge=''}){
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1080;const c=canvas.getContext('2d');if(!c)throw Error('canvas');
 c.fillStyle=wallet?.theme==='theme-ink'?'#e7e3d5':'#fff2cc';c.fillRect(0,0,1080,1080);
 const colors=wallet?.frame==='frame-rwb'?['#c64039','#faf7e6','#23619b']:wallet?.frame==='frame-neon'?['#793ea0','#e35070','#376e58']:['#a6762c','#e6ba55','#846322'];
 for(let i=0;i<3;i++){c.strokeStyle=colors[i];c.lineWidth=13;c.strokeRect(27+i*17,27+i*17,1026-i*34,1026-i*34);}
 c.textAlign='center';c.fillStyle='#234b3d';c.font='bold 46px sans-serif';c.fillText('香港百萬富翁',540,160);
 c.font='32px sans-serif';c.fillText((run.kind==='weekend'?'週末練習':'每日挑戰')+' · 香港街坊',540,225);
 c.font='bold 44px sans-serif';const safe=String(name).slice(0,20);c.fillText(safe,540,330,850);
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
