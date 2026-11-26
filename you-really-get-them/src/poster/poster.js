import {FACTIONS} from '../questions.js';
const posterIconNames={women:'woman',men:'man',dog:'dog',cat:'cat',duo:'duo'};
const imageCache=new Map();
function loadPosterImage(src){if(!imageCache.has(src))imageCache.set(src,new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src}));return imageCache.get(src)}
// Literal URLs let the upload builder rewrite these images to their content hashes.
const posterIcons={
 woman:new URL('../../assets/icons/woman.png',import.meta.url).href,
 man:new URL('../../assets/icons/man.png',import.meta.url).href,
 dog:new URL('../../assets/icons/dog.png',import.meta.url).href,
 cat:new URL('../../assets/icons/cat.png',import.meta.url).href,
 duo:new URL('../../assets/icons/duo.png',import.meta.url).href,
 spark:new URL('../../assets/icons/spark.png',import.meta.url).href,
};
const posterArt={
 woman:new URL('../../assets/illustrations/woman.webp',import.meta.url).href,
 man:new URL('../../assets/illustrations/man.webp',import.meta.url).href,
 dog:new URL('../../assets/illustrations/dog.webp',import.meta.url).href,
 cat:new URL('../../assets/illustrations/cat.webp',import.meta.url).href,
 duo:new URL('../../assets/illustrations/duo.webp',import.meta.url).href,
};
function loadPosterIcon(name){return loadPosterImage(posterIcons[name])}
function loadPosterArt(name){return loadPosterImage(posterArt[name])}
export async function drawPoster(data,canvas){const c=canvas.getContext('2d'),w=1080,h=1920,f=FACTIONS[data.faction];canvas.width=w;canvas.height=h;c.fillStyle='#f7f2e8';c.fillRect(0,0,w,h);c.fillStyle='#171717';for(let y=25;y<h;y+=28)for(let x=25;x<w;x+=28)c.fillRect(x,y,2,2);c.fillStyle=f.color;c.fillRect(55,55,970,1810);c.strokeStyle='#171717';c.lineWidth=16;c.strokeRect(55,55,970,1810);c.fillStyle='#171717';c.font='bold 34px monospace';c.fillText('RELATIONSHIP SURVIVAL LAB',95,145);c.font='bold 23px sans-serif';c.fillText(data.incidentReport?'本日求生事故報告 / SURVIVAL INCIDENT':'生存鑑定報告書 / SURVIVAL REPORT',95,205);c.fillStyle='#fff';c.fillRect(95,270,890,920);c.strokeStyle='#171717';c.lineWidth=10;c.strokeRect(95,270,890,920);c.fillStyle='#171717';c.font='bold 44px sans-serif';const factionIcon=await loadPosterIcon(posterIconNames[data.faction]||'spark');if(factionIcon)c.drawImage(factionIcon,135,285,130,130);const art=await loadPosterArt(data.faction==='women'?'woman':data.faction==='men'?'man':data.faction==='dog'?'dog':data.faction==='cat'?'cat':'duo');if(art){c.save();c.globalAlpha=.98;c.drawImage(art,635,690,315,315);c.restore();}c.fillText(f.name,290,365);c.font='900 92px sans-serif';c.fillText(data.survived?'你活下來了！':'本次求生失敗',145,520);c.font='bold 31px sans-serif';c.fillText(data.title,145,600);c.font='bold 26px monospace';c.fillText(`HP LEFT      ${data.hp}`,145,730);c.fillText(`SURVIVAL COIN +${data.coins} SC${data.rewardPending?' (待同步)':''}`,145,795);c.fillText(`CORRECT      ${data.correct}/${data.questionCount||12}`,145,860);c.fillText(`RUN NO.      #${String(data.run).padStart(5,'0')}`,145,925);c.fillStyle='#171717';if(data.dimensions){c.font='bold 25px sans-serif';c.fillText('了解對方 '+(data.understandingScore||0)+'分  ·  讀懂氣氛 '+data.airAverage+'分',145,1000);c.font='bold 20px sans-serif';c.fillText(data.dimensions.map(item=>item.name+' '+item.score).join('  ·  '),145,1045);c.font='bold 25px sans-serif';wrap(c,`現場評語：${data.quote}`,145,1110,770,38,data.settlement?2:Infinity)}else{c.font='bold 29px sans-serif';wrap(c,`死因／評語：${data.quote}`,145,1040,770,48)}if(data.settlement){c.font='bold 21px sans-serif';c.fillText(data.survived?`通關 100 SC + ${data.hp} HP × 2${data.settlement.companionReward?' + 隊友 20':''} = ${data.coins} SC`:'陣亡撫恤金：10 SC 醫藥費',145,1180)}if(data.incidentReport){drawIncidentPanel(c,data.incidentReport)}else{c.save();c.translate(745,1400);c.rotate(-.13);c.lineWidth=19;c.strokeStyle=data.survived?'#178a3b':'#d51f32';c.strokeRect(-330,-105,660,210);c.font='900 108px monospace';c.textAlign='center';c.fillStyle=data.survived?'#178a3b':'#d51f32';c.fillText(data.survived?'SURVIVED':'FAILED',0,38);c.restore();}c.fillStyle='#171717';c.font='bold 40px sans-serif';c.fillText('你敢挑戰嗎？',100,1650);c.font='24px monospace';c.fillText(data.assisted?'隊友助陣 · 本局不計入公開排行榜':'PLAY · FAIL · SHARE · REPEAT',100,1710);c.font='21px sans-serif';c.fillText('本報告純屬娛樂，並非關係或動物行為診斷。',100,1780);c.fillRect(95,1820,890,8);return canvas}
function drawIncidentPanel(c,report){
 c.fillStyle='#fffdf4';c.fillRect(95,1225,890,365);c.strokeStyle='#171717';c.lineWidth=6;c.strokeRect(95,1225,890,365);
 c.fillStyle='#171717';c.font='bold 31px sans-serif';c.fillText('本日求生事故報告',120,1272);
 c.font='bold 28px sans-serif';c.fillText('現場稱號：'+report.title,120,1317);
 c.font='bold 23px sans-serif';wrap(c,'主要事故：'+(report.incident?.incident||'本局暫未錄得判斷事故。'),120,1360,840,29,2);
 c.font='22px sans-serif';wrap(c,report.incident?`第 ${report.incident.round} 題，我選了：${report.incident.choice}`:report.summary,120,1430,840,28,2);
 c.font='bold 22px sans-serif';wrap(c,report.best?`最佳操作 · 第 ${report.best.round} 題：${report.best.choice}`:'最佳操作：下一局繼續累積求生經驗。',120,1510,840,28,2);
}
function wrap(c,text,x,y,max,line,maxLines=Infinity){
 const lines=[];let current='';
 for(const ch of text){if(current&&c.measureText(current+ch).width>max){lines.push(current);current=ch}else current+=ch}
 if(current)lines.push(current);
 lines.slice(0,maxLines).forEach((value,i)=>{
  if(i===maxLines-1&&lines.length>maxLines){while(value&&c.measureText(value+'…').width>max)value=value.slice(0,-1);value+='…'}
  c.fillText(value,x,y+i*line);
 });
}
export async function exportPoster(canvas){return new Promise(resolve=>canvas.toBlob(b=>resolve(b),'image/png'))}
