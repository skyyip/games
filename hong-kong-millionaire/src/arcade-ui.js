import {ART} from './art.js';
import {hkDay,titleFor,PRIZES} from './game.js';
import {isWeekend,weekendKey} from './economy.js';
import {TOPICS,sessionQuestion,sessionQid,sessionRemaining,sessionRemoved,sessionVotes,sessionPresentation,sessionTerminal} from './session-engine.js';
import {celebrateMillion} from './celebrations.js';
import {playRedVan} from './reward-effects.js';
const money=n=>'$'+Number(n).toLocaleString('en-HK'),el=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
export function installArcade({cloud,getUser,getProfile,login,onShop=()=>{},onChange=()=>{},beforeDaily=()=>{},onDaily=()=>{},canStart=()=>true,soundEnabled=()=>false}){
 const dialog=el('dialog','','wide-dialog arcade-dialog');dialog.id='arcade-dialog';dialog.setAttribute('aria-labelledby','arcade-title');
 dialog.innerHTML='<button class="close-button" type="button" aria-label="關閉遊樂場">×</button><h2 id="arcade-title">街坊遊樂場</h2><p class="quiet">練習、私人房間與🛒換題挑戰分開計分，不影響純每日排行榜。</p><p id="arcade-status" role="status" class="status"></p><div id="arcade-content"></div><div class="arcade-footer"><button id="arcade-retry" class="outline" type="button">重新連接／繼續進度</button><button id="arcade-lobby" class="text-button" type="button">返回遊樂場選單</button></div>';
 document.body.append(dialog);const $=id=>dialog.querySelector('#'+id);dialog.querySelector('.close-button').onclick=()=>dialog.close();
 const hint=el('dialog');hint.id='arcade-hint';hint.innerHTML='<button class="close-button" type="button" aria-label="關閉提示">×</button><h2 id="arcade-hint-title">香港地膽</h2><div id="arcade-hint-body"></div>';document.body.append(hint);hint.querySelector('button').onclick=()=>hint.close();
 let uid=null,version=0,run=null,room=null,state=null,busy=false,selection=null,view='lobby',unsubscribe=null,tickBusy=false,lastKey='',roomStarting=false;
 const status=text=>{$('arcade-status').textContent=text;};
 function button(text,fn,disabled=false,cls='outline'){const b=el('button',text,cls);b.type='button';b.disabled=disabled||busy;b.onclick=fn;return b;}
 function setIdentity(next){if(uid===next)return;uid=next;version++;run=null;room=null;state=null;busy=false;roomStarting=false;unsubscribe?.();unsubscribe=null;dialog.close();hint.close();lastKey='';}
 async function task(fn){if(busy||!uid)return;const epoch=version,actor=uid;busy=true;status('正在核對雲端進度…');render();try{await fn(()=>uid===actor&&epoch===version);if(uid===actor&&epoch===version)status('');}catch(e){if(uid===actor&&epoch===version)status(cloud.errorText(e)+' 進度仍保留，可按重新連接。');}finally{if(uid===actor&&epoch===version){busy=false;render();}}}
 async function refreshWallet(){const next=await cloud.wallet();if(next.wallet.uid!==uid)return;state=next;onChange(next);}
 async function start(kind){
  if(!canStart()){status('請先完成目前的每日熱座，再進入額外模式。');return;}
  await task(async current=>{if(kind==='assisted')await beforeDaily();const next=await cloud.startSession({kind});if(!current())return;run=next;selection=null;view='game';lastKey='';if(kind==='assisted')onDaily(next);await refreshWallet();});
 }
 async function move(action){
  if(!run||busy||run.phase==='finished')return;const previous=run;
  await task(async current=>{const next=await cloud.moveSession({id:previous.id,kind:previous.kind,room:previous.room},action,{expected:{index:previous.index,phase:previous.phase,questionAt:previous.questionAt}});if(!current())return;run=next;selection=null;lastKey='';hint.close();if(next.kind==='assisted')onDaily(next);if(next.phase==='finished'){await refreshWallet();if(current())celebrateMillion(next);}});
 }
 function showHint(kind){const body=hint.querySelector('#arcade-hint-body');body.replaceChildren();hint.querySelector('h2').textContent=kind==='phone'?'香港地膽・模擬朋友':'模擬現場觀眾';if(kind==='phone')body.append(el('p',sessionQuestion(run).hint),el('small','方向提示由題庫預設，並非真人或即時AI連線。'));else{const votes=sessionVotes(run);votes.forEach((v,i)=>{const row=el('div','','audience-row');row.append(el('b','ABCD'[i]),el('progress'));row.lastChild.max=100;row.lastChild.value=v;row.append(el('span',v+'%'));body.append(row);});body.append(el('small','系統模擬投票，並非真實玩家投票；觀眾亦可能答錯。'));}hint.showModal();}
 async function life(kind){const key={half:'halfFor',phone:'phoneFor',audience:'audienceFor'}[kind];if(run[key]!==run.index)await move({type:'life',kind});if(run?.[key]===run.index&&kind!=='half')showHint(kind);}
 function modeName(){return run?.kind==='assisted'?'🛒 每日換題挑戰':run?.kind==='room'?'圍威喂・私人房間':'週末狂熱・練習';}
 function renderGame(list){
  if(!run){list.append(el('p','尚未有進度。'));return;}const q=sessionQuestion(run);
  const head=el('div','','arcade-score');head.append(el('strong',modeName()),el('span','第 '+(run.index+1)+'／'+run.count+' 題'),el('b','答對 '+run.correct+' 題'));list.append(head);
  if(run.phase==='finished'){
   celebrateMillion(run);if(state?.wallet?.exit==='exit-redvan'&&run.reason==='walk')playRedVan(run,soundEnabled());
   const result=el('section','','arcade-result');result.append(el('div',run.correct===15?'🏆':'✦','gacha-icon'),el('h3',run.kind==='room'?'已交卷，等候全場結算':titleFor(run.payout).name),el('strong',run.kind==='room'?run.correct+'／10':money(run.payout),'result-prize'),el('p',run.kind==='weekend'?'練習虛擬成績；本場已存入 '+money(run.credit)+' 額外獎金（每日上限100,000）。':run.kind==='assisted'?'已存入 '+money(run.credit)+' 可用獎金，成績只計🛒換題榜。':'個人答題不產生獎金；260秒全場結算後，由勝出街坊領取房主獎金池。'));
   result.append(button('查看本局解說',()=>{const body=hint.querySelector('#arcade-hint-body');body.replaceChildren();hint.querySelector('h2').textContent='本局香港故事';for(const a of Object.values(run.answers)){const item=el('article','','arcade-review');item.append(el('b',a.qid+' · '+({correct:'答啱',wrong:'答錯',walk:'未作答',timeout:'超時'}[a.outcome])));import('./game.js').then(({questionById})=>{const value=questionById(a.qid);if(value)item.append(el('h3',value.question),el('p','答案：'+value.options[value.answer]),el('p',value.explanation));});body.append(item);}hint.showModal();}));
   if(run.kind==='room')result.append(button('查看房間及獎金池',()=>{view='room';render();}));else result.append(button('返回遊樂場',()=>{view='lobby';render();}));
   list.append(result);return;
  }
  const timer=el('div','','arcade-timer');timer.id='arcade-clock';timer.setAttribute('role','timer');list.append(timer);
  const visual=el('div','','arcade-visual'),p=sessionPresentation(run);if(p.mode==='text'||q.textOnly)visual.append(el('span','香 港 知 識','text-visual'));else{const img=new Image();img.src=ART[q.art];img.alt=q.imageAlt??'香港文化解謎插畫';img.className=p.mode==='partial'?'partial':p.mode==='mirrored'?'mirrored':'';if(p.mode==='blurred'&&run.phase==='playing')img.dataset.blurred='true';visual.append(img,el('small','原創示意插畫 · '+({partial:'局部觀察',blurred:'逐漸清晰',mirrored:'鏡像反轉',original:'完整插畫'}[p.mode]??'完整插畫')));}list.append(visual,el('p',q.category,'quiet'),el('h3',q.question,'arcade-question'));
  const options=el('div','','arcade-options'),removed=sessionRemoved(run);for(const i of p.order){const b=button('ABCD'[i]+'　'+q.options[i],()=>{selection=i;render();},run.phase!=='playing'||removed.includes(i),'answer-option');b.dataset.choice=i;b.setAttribute('aria-pressed',String(selection===i));if(removed.includes(i))b.textContent='ABCD'[i]+'　已刪除';if(run.phase==='reveal'){if(i===q.answer)b.classList.add('correct');if(i===run.choice&&run.outcome==='wrong')b.classList.add('wrong');}options.append(b);}list.append(options);
  if(run.phase==='playing'){
   const actions=el('div','','arcade-actions');actions.append(button(selection===null?'先選一個答案':'確定答案',()=>move({type:'answer',choice:selection}),selection===null,'primary'));
   actions.append(button(run.kind==='room'?'提早交卷':'割禾青・帶走現有成績',()=>{hint.querySelector('h2').textContent=run.kind==='room'?'現在交卷？':'確定割禾青？';const body=hint.querySelector('#arcade-hint-body');body.replaceChildren(el('p',run.kind==='room'?'剩餘題目不再作答，按目前答對題數結算。':'將帶走 '+money(run.correct?PRIZES[run.correct-1]:0)+' 虛擬成績。'),button('確認離場',()=>{hint.close();move({type:'walk'});}));hint.showModal();}));
   list.append(actions);const lives=el('div','','arcade-lives');for(const [kind,label,key]of [['half','50:50','halfFor'],['phone','問朋友','phoneFor'],['audience','問觀眾','audienceFor']])lives.append(button(label+(run[key]>=0?'・已使用':''),()=>life(kind),run[key]>=0&&run[key]!==run.index));if(run.kind==='assisted')lives.append(button('🛒 換一題'+(run.swapFor>=0?'・已使用':''),()=>move({type:'swap'}),run.swapFor>=0||[run.halfFor,run.phoneFor,run.audienceFor].includes(run.index)));list.append(lives);if(run.kind==='assisted')list.append(el('small','換題沿用目前倒數；使用本題的任何錦囊後便不能換題。'));
  }else{
   const reveal=el('section','','arcade-reveal');reveal.append(el('h3',run.outcome==='correct'?'答啱！':'本題'+({wrong:'答錯',timeout:'時間到',walk:'已放棄'}[run.outcome]??'已結束')),el('p','正確答案：'+q.options[q.answer]),el('p',q.explanation));if(!sessionTerminal(run))reveal.append(button(run.kind==='room'?'等待下一題（同步倒數）':'下一題',()=>move({type:'next'}),run.kind==='room'&&Date.now()<run.questionAt+23000,'primary'));list.append(reveal);
  }
  clock();
 }
 function roomURL(id){const url=new URL('./',location.href);url.searchParams.set('room',id);return url.href;}
 async function attach(id){
  unsubscribe?.();unsubscribe=null;const epoch=version;room=await cloud.getRoom(id);if(epoch!==version)return;if(!room)throw Error('room-missing');view='room';
  const stop=await cloud.watchRoom(id,async next=>{if(epoch!==version)return;room=next;if(room?.status==='playing'&&room.players.includes(uid)&&view==='room'&&canStart()&&!(run?.room===id&&run.phase==='finished')&&!roomStarting){roomStarting=true;await task(async current=>{const nextRun=await cloud.startSession({kind:'room',room:id});if(current()){run=nextRun;view='game';lastKey='';}});roomStarting=false;}render();},e=>status(cloud.errorText(e)));if(epoch!==version){stop?.();return;}unsubscribe=stop;render();
 }
 function renderRoom(list){
  if(!room){list.append(el('p','尚未加入房間。'));return;}list.append(el('h3',TOPICS.find(t=>t.id===room.topic)?.name??'香港綜合'),el('p','房主：'+room.hostName+' · 獎金池 '+money(room.pool),'room-pool'),el('p','10題、每題20秒；3秒揭曉後同步進入下一題。答對最多者勝，依次比較答題時間、加入先後。','quiet'));
  const names=el('div','','room-roster');for(const p of room.players){const s=room.scores[p];names.append(el('p',(p===uid?'● ':'○ ')+room.names[p]+(room.status!=='lobby'?' · '+(s?.finished?s.correct+'/10 已交卷':'作答中'):' · 已就座')));}list.append(names);
  const field=el('input');field.value=roomURL(room.id);field.readOnly=true;field.setAttribute('aria-label','私人房間邀請連結');list.append(field,button('複製邀請連結',async()=>{try{await navigator.clipboard.writeText(field.value);status('邀請連結已複製。');}catch{field.select();status('請複製上方連結。');}}));
  if(room.status==='lobby'){
   if(!room.players.includes(uid))list.append(button('免費加入這一局',()=>task(async current=>{const next=await cloud.joinRoom(room.id);if(current())room=next;}),room.players.length>=6,'primary'));
   if(room.hostUid===uid){list.append(button('開始同步對戰',()=>task(async current=>{const next=await cloud.startRoom(room.id);if(current())room=next;}),room.players.length<2,'primary'),button('取消房間・退回獎金池',()=>task(async current=>{const next=await cloud.claimRoom(room.id,{cancel:true});if(current()){room=next.room;await refreshWallet();}})));}list.append(el('small','最多6人；等候室1小時後停止接受加入。取消只退獎金池，30,000開房費不退。'));
  }else if(room.status==='playing'){
   if(room.players.includes(uid)&&Date.now()<room.startedAt+230000)list.append(button('繼續本局',()=>task(async current=>{const next=await cloud.startSession({kind:'room',room:room.id});if(current()){run=next;view='game';}}),'','primary'));
   if(room.players.includes(uid))list.append(button('核對全場結果',()=>task(async current=>{const next=await cloud.finaliseRoom(room.id);if(current())room=next;}),Date.now()<room.startedAt+260000));
   const wait=el('p','','quiet');wait.id='room-countdown';list.append(wait,el('small','開始後260秒結算；包含30秒重新連線寬限。未交卷者不參與排名。結算後補交可清除個人進度，但不改寫勝出結果。'));
  }else{
   list.append(el('h3',room.status==='cancelled'?'房間已取消':'勝出街坊：'+(room.names[room.winner]??'—')));
   const eligible=room.status==='cancelled'?room.hostUid===uid:room.winner===uid;if(eligible)list.append(button(room.paidTo?'已領取':'領取 '+money(room.pool)+(room.status==='cancelled'?' 退回獎金池':' 獎金池'),()=>task(async current=>{const next=await cloud.claimRoom(room.id);if(current()){room=next.room;await refreshWallet();}}),!!room.paidTo,'primary'));
   if(run?.kind==='room'&&run.phase!=='finished')list.append(button('處理本局未交進度',()=>{view='game';render();}));
  }
 }
 function renderLobby(list){
  const w=state?.wallet;list.append(el('p','可用虛擬獎金 '+(state?money(state.balance):'—'),'room-pool'));
  if(w?.activeSession)list.append(button('繼續未完成的額外挑戰',()=>recover(),'','primary'));
  const grid=el('div','','reward-grid');
  for(const [kind,title,copy,label,disabled]of [
   ['weekend','週末狂熱','15題隨機練習，可無限重玩；每場額外獎金最多5,000，每日上限100,000。',isWeekend()?'開始週末練習':'星期六、日開放',!isWeekend()||w?.pass!==weekendKey()],
   ['assisted','🛒 每日換題挑戰','用今日一次機會及一張預購換題券；最多換一題，原有三個錦囊照常保留。只進換題榜。','使用今日機會及換題券',!w?.swapTokens||getProfile()?.activeDay!==null||getProfile()?.lastSettledDay===hkDay()]
  ]){const box=el('article','','reward-tile');box.append(el('h3',title),el('p',copy),button(label,()=>start(kind),disabled,'primary'));grid.append(box);}list.append(grid,button('購買通行／換題券',()=>{dialog.close();onShop('tickets');}));
  const form=el('form','','room-form');form.innerHTML='<h3>開個「圍威喂」房間</h3><p>開房費30,000。獎金池由房主另外支付，其他街坊免費加入；不計每日榜。</p><label>題目專場<select name="topic"><option value="all">香港綜合</option><option value="sport">體育專場</option><option value="places">地理與景點</option></select></label><label>房主提供獎金池<input name="pool" type="number" min="0" max="500000" step="1000" value="0" required></label><button class="primary" type="submit">建立房間・使用30,000＋獎金池</button>';form.onsubmit=e=>{e.preventDefault();if(!canStart()){status('請先完成目前的每日熱座。');return;}const data=new FormData(form),pool=Number(data.get('pool'));task(async current=>{const id=await cloud.createRoom({topic:data.get('topic'),pool});if(current()){await refreshWallet();await attach(id);}});};list.append(form);
  const join=el('form','','room-form');join.innerHTML='<h3>加入朋友房間</h3><label>貼上邀請連結或房間代號<input name="invite" type="text" autocomplete="off" required></label><button type="submit" class="outline">查看房間</button>';join.onsubmit=e=>{e.preventDefault();let value=new FormData(join).get('invite').trim();try{if(value.includes('?'))value=new URL(value).searchParams.get('room')??'';}catch{}if(!/^[a-f0-9]{32}$/.test(value)){status('請輸入有效的32位房間代號或邀請連結。');return;}task(()=>attach(value));};list.append(join,button('查看我建立的房間',()=>task(async current=>{const rooms=await cloud.myRooms();if(!current())return;const body=hint.querySelector('#arcade-hint-body');hint.querySelector('h2').textContent='我建立的房間';body.replaceChildren();for(const r of rooms)body.append(button(r.hostName+' · '+money(r.pool)+' · '+({lobby:'等候中',playing:'對戰中',finished:'已結算',cancelled:'已取消'}[r.status]),()=>{hint.close();task(()=>attach(r.id));}));if(!rooms.length)body.append(el('p','還未建立房間。'));hint.showModal();})));
 }
 function render(){if(!dialog.open)return;const list=$('arcade-content');list.replaceChildren();if(view==='game')renderGame(list);else if(view==='room')renderRoom(list);else renderLobby(list);$('arcade-retry').disabled=busy;$('arcade-lobby').disabled=busy;if(view==='room'&&room?.status==='playing'&&room.players.includes(uid)&&Date.now()<room.startedAt+230000&&canStart()&&!(run?.room===room.id&&run.phase==='finished')&&!busy&&!roomStarting){roomStarting=true;queueMicrotask(()=>task(async current=>{const next=await cloud.startSession({kind:'room',room:room.id});if(current()){run=next;view='game';}}).finally(()=>{roomStarting=false;}));}}
 function clock(){
  if(!dialog.open)return;const now=Date.now(),clock=$('arcade-clock');if(clock&&run){clock.textContent=run.phase==='playing'?'剩餘 '+Math.ceil(sessionRemaining(run,now)/1000)+' 秒':run.kind==='room'?'下一題 '+Math.max(0,Math.ceil((run.questionAt+23000-now)/1000))+' 秒':'本題已揭曉';const img=$('arcade-content').querySelector('[data-blurred]');if(img)img.style.filter='blur('+Math.max(0,18*sessionRemaining(run,now)/(run.index>=10?40000:20000))+'px)';}
  const countdown=$('room-countdown');if(countdown&&room){const n=Math.max(0,Math.ceil((room.startedAt+260000-now)/1000));countdown.textContent=n?'全場結算尚餘 '+n+' 秒':'可以核對全場結果。';if(!n){const b=[...$('arcade-content').querySelectorAll('button')].find(b=>b.textContent==='核對全場結果');if(b)b.disabled=busy;}}
  if(view!=='game'||!run||run.phase==='finished'||busy||tickBusy)return;const action=run.phase==='playing'&&sessionRemaining(run,now)<=0?{type:'timeout'}:run.kind==='room'&&run.phase==='reveal'&&!sessionTerminal(run)&&now>=run.questionAt+23000?{type:'next'}:null;
  if(action){tickBusy=true;move(action).finally(()=>{tickBusy=false;});}
 }
 async function recover(){await task(async current=>{const next=run?await cloud.getSession(run):await cloud.activeSession();if(!current())return;if(next){run=next;view='game';if(next.kind==='assisted')onDaily(next);}await refreshWallet();});}
 async function open(descriptor=null){setIdentity(getUser()?.uid??null);if(!uid){login();return;}dialog.showModal();if(!canStart()){view='lobby';render();status('請先完成目前的每日熱座，再進入額外模式。');return;}await task(async current=>{await refreshWallet();const next=descriptor?await cloud.getSession(descriptor):await cloud.activeSession();if(!current())return;if(next){run=next;view='game';if(next.kind==='room')await attach(next.room);view='game';}else{view='lobby';const id=new URL(location.href).searchParams.get('room');if(id&&/^[a-f0-9]{32}$/.test(id))await attach(id);}});}
 $('arcade-retry').onclick=recover;$('arcade-lobby').onclick=()=>{view='lobby';render();};setInterval(clock,250);
 for(const type of ['copy','cut','contextmenu','selectstart','dragstart'])dialog.addEventListener(type,event=>{if(view==='game'&&run?.phase!=='finished'&&event.target.closest?.('.arcade-question,.arcade-options,.arcade-visual'))event.preventDefault();});
 return {open,setIdentity,get run(){return run;}};
}
