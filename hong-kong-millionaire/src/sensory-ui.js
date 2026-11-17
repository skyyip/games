import {ART} from './art.js';
import {optionOrder} from './choice-order.js';
import {questionById} from './game.js';
import {AUDIO_QUESTIONS,SCRATCH_IDS,PRACTICE_MS,PRACTICE_COUNT,GRID_SIZE,newPractice,validPractice,practiceAnswer} from './sensory-model.js';
import {installScratch} from './interactive-visual.js';
import {iconSVG} from './hk-icons.js';
const KEY='sky.hkm.sensory.current.v1',BEST='sky.hkm.sensory.best.v1';
const el=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
export function installSensory({canStart=()=>true,onActive=()=>{},onCloudArcade=()=>{},volume=()=>.5}={}){
 const dialog=el('dialog','','wide-dialog sensory-dialog');dialog.id='sensory-dialog';dialog.setAttribute('aria-labelledby','sensory-title');dialog.innerHTML='<header><div><p class="eyebrow">街坊感官練習・不計排名</p><h2 id="sensory-title">聽香港・抹霧搵線索</h2></div><button class="close-button" type="button" aria-label="關閉感官練習">×</button></header><p id="sensory-status" class="status" role="status"></p><div id="sensory-content"></div><footer><button id="sensory-home" class="text-button" type="button">練習首頁</button><small>不計每日榜・不扣每日機會・不發獎金</small></footer>';document.body.append(dialog);
 const $=id=>dialog.querySelector('#'+id),content=$('sensory-content');let run=null,view='home',scratch=null,audio=null,selectedCaption=false,version=0,savingAt=0;
 const status=text=>{$('sensory-status').textContent=text;};
 const button=(text,fn,disabled=false,cls='outline')=>{const b=el('button',text,cls);b.type='button';b.disabled=disabled;b.onclick=fn;return b;};
 const pool=kind=>kind==='audio'?AUDIO_QUESTIONS.map(q=>q.id):SCRATCH_IDS;
 function question(){return run?.kind==='audio'?AUDIO_QUESTIONS.find(q=>q.id===run.qids[run.index]):questionById(run?.qids[run?.index]);}
 function save(){try{if(run)localStorage.setItem(KEY,JSON.stringify(run));}catch{status('此瀏覽器未能儲存練習；關閉後可能無法繼續。');}}
 function load(){try{const value=JSON.parse(localStorage.getItem(KEY));return validPractice(value,pool(value?.kind));}catch{return null;}}
 function stopAudio(){if(audio){audio.pause();audio.removeAttribute('src');audio.load();audio=null;}}
 function clear(){version++;stopAudio();scratch?.cancel();scratch=null;}
 function start(kind){if(!canStart()){status('先完成目前的每日熱座，再開始練習。');return;}clear();run=newPractice(kind,pool(kind));selectedCaption=false;view='game';save();status('');render();}
 function home(){content.append(el('p','免登入、五條一組，想玩就玩。新朋友可先練習，再挑戰每日熱座。','sensory-intro'));
  const grid=el('div','','sensory-entries');for(const [kind,title,copy,icon]of [['audio','香港聲音挑戰','聽四秒原創情境音效，辨認街頭日常；可選文字描述。','phone'],['scratch','擦玻璃・搵線索','親手抹開霧氣，揭露愈少、答得愈準，觀察星星愈多。','search']]){const card=button('',()=>start(kind),false,'sensory-entry');card.dataset.practice=kind;card.innerHTML=iconSVG(icon);card.append(el('strong',title),el('span',copy));grid.append(card);}content.append(grid);
  const old=load();if(old?.phase!=='finished'&&old)content.append(button('繼續上次練習',()=>{run=old;view='game';render();},false,'primary'));
  try{const best=JSON.parse(localStorage.getItem(BEST));if(best)content.append(el('p','本機最佳：聽聲 '+(best.audio??0)+'／5 · 擦霧 '+(best.scratch??0)+'／5','quiet'));}catch{}
  content.append(button('登入／返回開房對戰',()=>{dialog.close();onCloudArcade();}));
 }
 async function beginAudio(useCaption=false){
  if(!run||!['ready','playing'].includes(run.phase))return;const before=run,key=version,track=audio;
  if(useCaption){selectedCaption=true;run={...run,captionShown:true};save();status('');if(run.phase==='ready'){run={...run,phase:'playing',questionAt:Date.now()};save();render();}else{$('sensory-caption-text').textContent=question().caption;$('sensory-caption-text').hidden=false;}return;}
  const play=$('sensory-play');if(play)play.disabled=true;
  try{track.currentTime=0;await track.play();if(key!==version||run!==before||!dialog.open){track.pause();return;}if(run.phase==='ready'){run={...run,phase:'playing',questionAt:Date.now()};save();render({keepAudio:track});}status('');}
  catch{if(key===version)status('未能播放聲音。可再試一次，或用文字描述練習。');}
  finally{if(key===version&&$('sensory-play'))$('sensory-play').disabled=run.phase!=='ready'&&run.phase!=='playing';}
 }
 function submit(choice){if(run?.phase!=='playing')return;run=practiceAnswer(run,choice,question().answer);save();render();}
 function next(){if(run.phase!=='reveal')return;if(run.index===PRACTICE_COUNT-1){run={...run,phase:'finished'};try{const best=JSON.parse(localStorage.getItem(BEST))??{};best[run.kind]=Math.max(best[run.kind]??0,run.answers.filter(a=>a.correct).length);localStorage.setItem(BEST,JSON.stringify(best));}catch{}save();render();return;}run={...run,index:run.index+1,phase:'ready',questionAt:null,cells:[],captionShown:false};selectedCaption=false;save();status('');render();}
 function game(){selectedCaption=run?.captionShown===true;const q=question();if(!q){view='home';home();return;}
  if(run.phase==='finished'){const good=run.answers.filter(a=>a.correct).length,stars=run.answers.reduce((n,a)=>n+a.stars,0);content.append(el('h3','街坊，又識多樣嘢！'),el('strong',good+'／5','sensory-score'),el('p',run.kind==='scratch'?'今場觀察星星 '+stars+' 顆；只作練習紀錄，不換獎金。':'聲音情境練習已完成，不影響每日挑戰。'));for(const answer of run.answers){const record=run.kind==='audio'?AUDIO_QUESTIONS.find(q=>q.id===answer.qid):questionById(answer.qid),row=el('article','','sensory-review');row.append(el('b',(answer.correct?'✓ ':'○ ')+record.question),el('p','答案：'+record.options[record.answer]),el('small',record.explanation));content.append(row);}content.append(button('再練一組',()=>start(run.kind),false,'primary'));return;}
  const top=el('div','','sensory-round');top.append(el('b',(run.kind==='audio'?'聽聲':'擦霧')+' · '+(run.index+1)+'／5'));const clock=el('strong');clock.id='sensory-clock';clock.setAttribute('role','timer');top.append(clock);content.append(top,el('h3',q.question,'sensory-question'));
  if(run.kind==='audio'){
   content.append(el('p','原創重製音效・非實地錄音','quiet'));const icon=el('div','','sound-scene');icon.innerHTML=iconSVG('phone');for(let i=0;i<9;i++)icon.append(el('i'));content.append(icon);
   if(!audio){audio=new Audio(ART[q.audio]);audio.preload='auto';audio.volume=Math.max(.05,Math.min(1,volume()));}
   const controls=el('div','','sensory-controls'),play=button(run.phase==='ready'?'播放並開始25秒':'重播音效',()=>beginAudio(),run.phase==='reveal','primary');play.id='sensory-play';controls.append(play);const caption=button('改看聲音描述',()=>beginAudio(true),run.phase==='reveal');caption.id='sensory-caption';controls.append(caption);content.append(controls);
   const description=el('p',q.caption,'sound-caption');description.id='sensory-caption-text';description.hidden=!selectedCaption&&run.phase!=='reveal';content.append(description);
  }else{
   const frame=el('div','','sensory-picture'),image=new Image();image.src=ART[q.art];image.alt=run.phase==='reveal'?q.observation?.alt??'完整漫畫':'香港街頭漫畫，抹開霧氣尋找線索';frame.append(image);content.append(frame);
   if(run.phase==='ready'){const cover=el('div','準備好就開始擦霧','scratch-ready');frame.append(cover);const start=button('開始擦霧・25秒',async()=>{start.disabled=true;const before=run,ticket=version;try{await image.decode();if(run!==before||ticket!==version||run.phase!=='ready'||!dialog.open)return;run={...run,phase:'playing',questionAt:Date.now()};save();render();}catch{status('圖片未能載入，請重新連接後再試。');start.disabled=false;}},false,'primary');start.id='sensory-scratch-start';content.append(start);}
   else if(run.phase==='playing'){
    const progress=el('p','','scratch-progress');progress.id='scratch-progress';const tools=el('div','','scratch-tools');tools.append(progress);content.append(tools);
    const update=cells=>{if(run.phase!=='playing')return;run={...run,cells};progress.textContent='已擦開 '+Math.round(cells.length/GRID_SIZE*100)+'% · '+(cells.length>500?'觀察星星已歸零，仍可繼續答題':'50%以內答對，可得觀察星星');if(performance.now()-savingAt>150){savingAt=performance.now();save();}};
    scratch=installScratch(frame,{cells:run.cells,onChange:update});update(run.cells);const step=button('逐步擦開（鍵盤／點按）',()=>{scratch?.revealStep();save();});step.id='scratch-step';tools.append(step);
    if(!scratch){run={...run,cells:Array.from({length:GRID_SIZE},(_,i)=>i)};update(run.cells);status('此瀏覽器未能顯示擦霧畫布，已開放完整圖片；本題不計觀察星星。');}
   }
  }
  const options=el('div','','sensory-options');for(const [display,index]of optionOrder(run,q.id).entries()){const text=q.options[index],b=button('ABCD'[display]+'　'+text,()=>submit(index),run.phase!=='playing');b.dataset.practiceChoice=index;if(run.phase==='reveal'&&index===q.answer)b.classList.add('correct');options.append(b);}content.append(options);
  if(run.phase==='reveal'){const answer=run.answers.at(-1);content.append(el('p',answer.timeout?'時間到，學多一個香港小知識。':answer.correct?'答啱！'+(run.kind==='scratch'?' 觀察星星 '+answer.stars+' 顆。':''):'今次估錯，下次再留意呢個線索。','sensory-feedback'),el('p',q.explanation,'sensory-explanation'),button(run.index===4?'睇今場成績':'下一條',next,false,'primary'));}
  tick();
 }
 function render({keepAudio=null}={}){if(keepAudio===audio){audio=null;clear();audio=keepAudio;}else clear();content.replaceChildren();dialog.dataset.practiceView=view;dialog.dataset.practicePhase=run?.phase??'';if(view==='home')home();else game();}
 function tick(){if(!dialog.open||view!=='game'||!run||run.phase==='finished')return;const clock=$('sensory-clock');if(clock)clock.textContent=run.phase==='ready'?'準備好先開始':run.phase==='reveal'?'本題揭曉':Math.max(0,Math.ceil((run.questionAt+PRACTICE_MS-Date.now())/1000))+'秒';if(run.phase==='playing'&&Date.now()>=run.questionAt+PRACTICE_MS)submit(-1);}
 $('sensory-home').onclick=()=>{save();view='home';status('');render();};dialog.querySelector('.close-button').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{clear();save();onActive(false);});document.addEventListener('visibilitychange',()=>{if(document.hidden)audio?.pause();else tick();});window.addEventListener('pagehide',()=>{scratch?.cancel();scratch=null;save();});window.addEventListener('pageshow',event=>{if(event.persisted&&dialog.open){render();tick();}});setInterval(tick,250);
 return {open(kind=null){onActive(true);dialog.showModal();status('');if(kind)start(kind);else{view='home';render();}},close(){dialog.close();}};
}
