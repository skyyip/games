import {questionView} from './question-view.js';
import {paintQuestionImage} from './visual-effects.js';
import {optionOrder} from './choice-order.js';
import {ART} from './art.js';
import {titleFor,PRIZES,MODE_NAMES,questionById,QUESTION_MS} from './game.js';
import {isWeekend,weekendKey} from './economy.js';
import {TOPICS,sessionQuestion,sessionRemaining,sessionRemoved,sessionVotes,sessionPresentation,sessionReviewReady,ROOM_INTERVAL,ROOM_DURATION,ROOM_GRACE,ROOM_FEE_RESERVE,roomCode,roomFeeShare,roomCanFinish} from './session-engine.js';
import {celebrateMillion} from './celebrations.js';
import {playRedVan} from './reward-effects.js';
const money=n=>'$'+Number(n).toLocaleString('en-HK'),el=(tag,text='',cls='')=>{const n=document.createElement(tag);n.textContent=text;n.className=cls;return n;};
const snapshotKey=r=>r?[r.id,r.index,r.phase,r.questionAt,r.halfFor,r.phoneFor,r.audienceFor,r.correct,r.credited].join(':'):'';
export function installArcade({cloud,getUser,getProfile,login,onShop=()=>{},onChange=()=>{},canStart=()=>true,soundEnabled=()=>false}){
 const dialog=el('dialog','','wide-dialog arcade-dialog');dialog.id='arcade-dialog';dialog.setAttribute('aria-labelledby','arcade-title');
 dialog.innerHTML='<header class="arcade-header"><div><p class="eyebrow">街坊一齊考香港</p><h2 id="arcade-title">街坊遊樂場</h2></div><button class="close-button" type="button" aria-label="關閉遊樂場">×</button></header><p id="arcade-status" class="status" role="status" aria-live="polite"></p><main id="arcade-content"></main><footer class="arcade-footer"><button id="arcade-retry" class="outline" type="button">重新連接</button><button id="arcade-lobby" class="text-button" type="button">遊樂場首頁</button></footer>';
 document.body.append(dialog);const $=id=>dialog.querySelector('#'+id);dialog.querySelector('.close-button').onclick=()=>dialog.close();
 const hint=el('dialog');hint.id='arcade-hint';hint.innerHTML='<button class="close-button" type="button" aria-label="關閉提示">×</button><h2 id="arcade-hint-title"></h2><div id="arcade-hint-body"></div>';document.body.append(hint);hint.querySelector('button').onclick=()=>hint.close();
 let visualObserver=null,visualAnimation=null;
 let uid=null,epoch=0,state=null,room=null,run=null,view='home',selection=null,pending=null,stopRoom=null,stopRun=null,starting=false,auto=false,lastRender='',loadId=0,roomFetch=0;
 const status=text=>{$('arcade-status').textContent=text;};
 const button=(text,fn,disabled=false,cls='outline')=>{const b=el('button',text,cls);b.type='button';b.disabled=!!disabled;b.onclick=fn;return b;};
 const now=()=>cloud.sessionNow?.()??Date.now();
 const reviewReady=()=>sessionReviewReady(run,room,cloud.sessionSafeNow?.()??now());
 let autoPaused=false,retryAt=0,failureCount=0;const rebated=new Set();
 const resetFailures=()=>{autoPaused=false;retryAt=0;failureCount=0;};
 const automaticReady=()=>!autoPaused&&performance.now()>=retryAt;
 function failed(error){failureCount++;const code=String(error?.code??error?.message??'').replace(/^firestore\//,'');autoPaused=['permission-denied','unauthenticated','not-configured'].includes(code)||failureCount>=3;retryAt=performance.now()+Math.min(8000,1000*2**(failureCount-1));}
 const descriptor=r=>({id:r.id,kind:r.kind,room:r.room});
 function setIdentity(next){if(uid===next)return;resetFailures();rebated.clear();uid=next;epoch++;loadId++;stopRoom?.();stopRun?.();stopRoom=stopRun=null;run=room=state=pending=null;starting=auto=false;view='home';dialog.close();hint.close();}
 async function bounded(promise){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Object.assign(Error('request-timeout'),{code:'unavailable'})),10000);})]);}finally{clearTimeout(timer);}}
 async function wallet(){const actor=uid,version=epoch,next=await cloud.wallet();if(uid===actor&&epoch===version){if(!state||next.wallet.revision>=state.wallet.revision){state=next;onChange(next);}}return next;}
 async function operation(key,fn,label='正在連接…'){
  if(pending||!uid)return false;const token={key,epoch};pending=token;status(label);render();
  try{await bounded(fn(()=>epoch===token.epoch&&pending===token));if(epoch===token.epoch){failureCount=0;retryAt=0;status('');}return true;}
  catch(error){if(epoch===token.epoch){failed(error);status(cloud.errorText(error)+(autoPaused?' 自動重試已暫停；請按「重新連接」核對。':' 稍後會重試；亦可按「重新連接」。'));}return false;}
  finally{if(pending===token){pending=null;render();}}
 }
 async function bindRun(value,{calibrate=true}={}){
  if(!value)return;const version=epoch;if(calibrate&&value.phase!=='finished'&&typeof cloud.syncSessionClock==='function')value=await cloud.syncSessionClock(descriptor(value));if(version!==epoch)return;stopRun?.();stopRun=null;acceptRun(value);view='game';
  if(typeof cloud.watchSession==='function'){const stop=await cloud.watchSession(descriptor(value),next=>{if(epoch===version&&run?.id===value.id&&next?.id===value.id)acceptRun(next);},error=>{if(epoch===version){failed(error);status(cloud.errorText(error)+' 請重新連接。');}});if(version!==epoch)stop?.();else stopRun=stop;}
  render();
  if(value.kind==='room'&&!rebated.has(value.room)){const actor=uid;rebated.add(value.room);cloud.claimRoom(value.room).then(next=>{if(uid===actor&&epoch===version){room=next.room;state=next;onChange(next);updateRoomProgress();}}).catch(()=>{});}
 }
 function acceptRun(next){
  if(run?.id===next.id){if(next.index<run.index||run.phase==='finished'&&next.phase!=='finished')return;if(next.index===run.index&&run.phase==='reveal'&&next.phase==='playing')return;}
  const changed=snapshotKey(next)!==snapshotKey(run),finished=next.phase==='finished'&&run?.phase!=='finished';run=next;if(changed){selection=null;lastRender='';hint.close();render();}
  if(finished)wallet().then(()=>{if(run?.id===next.id){render();celebrateMillion(next);}}).catch(()=>{});
 }
 async function move(action,{automatic=false}={}){
  if(automatic&&!automaticReady())return;if(!automatic)resetFailures();
  if(!run||run.phase==='finished'||pending)return;const old=run;
  await operation('move',async current=>{const next=await cloud.moveSession(descriptor(old),action,{expected:{index:old.index,phase:old.phase,questionAt:old.questionAt}});if(current())acceptRun(next);},action.type==='answer'?'答案傳送中…':'正在更新本局…');
 }
 async function startWeekend(){if(!canStart()){status('先完成目前的每日熱座，再加入額外挑戰。');return;}await operation('start',async current=>{const next=await cloud.startSession({kind:'weekend'});if(current()){await bindRun(next,{calibrate:false});wallet().catch(()=>{});}});}
 async function startRoomSession(manual=false){
  if(manual===true)resetFailures();if(!automaticReady())return;
  if(starting||pending||!room||room.status!=='playing'||!room.players.includes(uid)||run?.room===room.id&&run.phase==='finished'||!canStart())return;
  starting=true;const id=room.id,version=epoch;
  try{await operation('start-room',async current=>{const next=await cloud.startSession({kind:'room',room:id});if(current()&&room?.id===id){await bindRun(next,{calibrate:false});wallet().catch(()=>{});}});}finally{if(version===epoch)starting=false;}
 }
 async function attach(id){
  const version=epoch;stopRoom?.();stopRoom=null;const request=++roomFetch,next=await cloud.getRoom(id);if(version!==epoch||request!==roomFetch)return;if(!next)throw Error('room-missing');room=next;view='room';render();
  const stop=await cloud.watchRoom(id,value=>{if(epoch!==version||request!==roomFetch||!value)return;room=value;
   // A peer's roster/score update never starts another generic task or rebuilds answer controls.
   if(view==='room'){render();if(value.status==='playing'&&value.players.includes(uid)&&!(run?.room===id&&run.phase==='finished'))queueMicrotask(startRoomSession);}
   else updateRoomProgress();
  },error=>{if(epoch===version)status(cloud.errorText(error));});if(version!==epoch)stop?.();else stopRoom=stop;
 }
 function updateRoomProgress(){const info=$('room-live');if(info&&room)info.textContent=room.players.filter(p=>room.scores[p]?.finished).length+'／'+room.players.length+' 人已交卷';const ready=$('room-finish');if(ready)ready.disabled=!!pending||!roomCanFinish(room,now());const review=$('arcade-review-open');if(review)review.disabled=!reviewReady();const note=$('arcade-review-wait');if(note)note.hidden=reviewReady();}
 function showHint(kind){const body=hint.querySelector('#arcade-hint-body');body.replaceChildren();hint.querySelector('h2').textContent=kind==='phone'?'香港地膽・模擬朋友':'模擬現場觀眾';if(kind==='phone')body.append(el('p',sessionQuestion(run).hint),el('small','題庫預設的方向提示，不保證直接提供答案。'));else{const votes=sessionVotes(run);optionOrder(run,sessionQuestion(run).id).forEach((choice,i)=>{const v=votes[choice];const row=el('div','','audience-row'),bar=el('progress');bar.max=100;bar.value=v;row.append(el('b','ABCD'[i]),bar,el('span',v+'%'));body.append(row);});body.append(el('small','系統模擬投票，觀眾亦可能答錯。'));}hint.showModal();}
 async function life(kind){const key={half:'halfFor',phone:'phoneFor',audience:'audienceFor'}[kind];if(run[key]!==run.index)await move({type:'life',kind});if(run?.[key]===run.index&&kind!=='half')showHint(kind);}
 const isRevealed=()=>run?.phase==='reveal'&&(run.kind!=='room'||now()>=run.questionAt+QUESTION_MS);
 function quiz(list){
  if(!run)return;const q=sessionQuestion(run),revealed=isRevealed(),head=el('div','','arcade-score');head.append(el('strong',run.kind==='room'?'街坊對戰':'週末狂熱'),el('span','第 '+(run.index+1)+'／'+run.count+' 題'),el('b','答對 '+run.correct+' 題'));list.append(head);
  if(run.phase==='finished'){
   const result=el('section','','arcade-result');result.append(el('div','','gacha-icon'));result.firstChild.dataset.icon='trophy';result.append(el('h3',run.kind==='room'?'已交卷！':titleFor(run.payout).name),el('strong',run.kind==='room'?run.correct+'／10':money(run.payout),'result-prize'),el('p',run.kind==='room'?'等齊街坊即可立即結算。勝出者取得全池獎金。':'本場入帳 '+money(run.credit)+'；不計每日排行榜。'));
   const review=button('查看本局解說',()=>{if(!reviewReady())return;hint.querySelector('h2').textContent='本局香港故事';const body=hint.querySelector('#arcade-hint-body');body.replaceChildren();for(const a of Object.values(run.answers)){const question=questionById(a.qid);if(question){const item=el('article','','arcade-review');item.append(el('h3',question.question),el('p','答案：'+question.options[question.answer]),el('p',question.explanation));body.append(item);}}hint.showModal();},!reviewReady());review.id='arcade-review-open';result.append(review);
   if(run.kind==='room'){const note=el('small','本題揭曉或全員交卷後，即可查看解說。');note.id='arcade-review-wait';result.append(note);}
   if(run.kind==='room'){result.append(button('查看房間及結算',()=>{view='room';render();},false,'primary'));const live=el('p');live.id='room-live';result.append(live);}
   else result.append(button('返回遊樂場',()=>{view='home';render();}));list.append(result);updateRoomProgress();celebrateMillion(run);if(state?.wallet?.exit==='exit-redvan'&&run.reason==='walk')playRedVan(run,soundEnabled());return;
  }
  const timer=el('div','','arcade-timer');timer.id='arcade-clock';timer.setAttribute('role','timer');list.append(timer);
  const p=sessionPresentation(run,now()),shown=questionView(q,p.mode),visual=el('div','','arcade-visual');let image=null;
  if(p.mode==='text'||q.textOnly){const art=el('span','','quiz-mascot');art.dataset.icon='bao';visual.append(art);}else{image=new Image();image.src=ART[q.art];visual.append(image);}
  const badge=el('small',revealed?'完整插畫':MODE_NAMES[p.mode]);visual.append(badge);list.append(visual,el('h3',shown.question,'arcade-question'));
  if(image){const paint=()=>{visualAnimation?.cancel();visualAnimation=paintQuestionImage(image,visual,q,{...p,complete:revealed},now()-run.questionAt,QUESTION_MS);};paint();visualObserver=new ResizeObserver(paint);visualObserver.observe(visual);}
  const options=el('div','','arcade-options'),removed=sessionRemoved(run);for(const [display,i]of optionOrder(run,q.id).entries()){const b=button('ABCD'[display]+'　'+q.options[i],()=>{selection=i;render();},!!pending||run.phase!=='playing'||removed.includes(i),'answer-option');b.dataset.choice=i;b.setAttribute('aria-pressed',String(selection===i||run.phase==='reveal'&&run.choice===i));if(removed.includes(i))b.textContent='ABCD'[display]+'　已刪除';if(revealed){if(i===q.answer)b.classList.add('correct');if(i===run.choice&&run.outcome==='wrong')b.classList.add('wrong');}options.append(b);}list.append(options);
  if(run.phase==='playing'){
   const actions=el('div','','arcade-actions');actions.append(button(selection===null?'選一個答案':'確定答案',()=>move({type:'answer',choice:selection}),selection===null||!!pending,'primary'),button(run.kind==='room'?'提早交卷':'割禾青',()=>{hint.querySelector('h2').textContent='確定提早離場？';hint.querySelector('#arcade-hint-body').replaceChildren(el('p',run.kind==='room'?'剩餘題目不作答，按目前成績交卷。':'帶走 '+money(run.correct?PRIZES[run.correct-1]:0)+' 成績。'),button('確認離場',()=>{hint.close();move({type:'walk'});},false,'primary'));hint.showModal();},!!pending));list.append(actions);
   const lives=el('div','','arcade-lives');for(const [kind,label,key]of [['half','50:50','halfFor'],['phone','問朋友','phoneFor'],['audience','問觀眾','audienceFor']])lives.append(button(label+(run[key]>=0?'・已使用':''),()=>life(kind),!!pending||run[key]>=0&&run[key]!==run.index));list.append(lives);
  }else if(!revealed)list.append(el('p','已作答，倒數結束後一起揭曉。','arcade-await'));
  else{const reveal=el('section','','arcade-reveal');reveal.append(el('h3',run.outcome==='correct'?'答啱！':'本題'+({wrong:'答錯',timeout:'時間到',walk:'已放棄'}[run.outcome]??'已結束')));if(run.kind!=='room')reveal.append(el('p',q.explanation),button('下一題',()=>move({type:'next'}),!!pending,'primary'));else reveal.append(el('p','答案：'+q.options[q.answer]),button('查看解說',()=>{hint.querySelector('h2').textContent='香港小知識';hint.querySelector('#arcade-hint-body').replaceChildren(el('p',(q.observation?'認圖線索：'+q.observation.clue+'。':'')+q.explanation));hint.showModal();}));list.append(reveal);}
  clock(false);
 }
 function home(list){
  const w=state?.wallet;list.append(el('p','可用獎金 '+(state?money(state.balance):'—'),'arcade-balance'));
  if(w?.activeSession)list.append(button('繼續未完成挑戰',recover,false,'primary'));
  const grid=el('div','','arcade-entry-grid');for(const [to,title,copy,icon]of [['create','我來開房','訂好參加費，邀街坊鬥香港知識。','tram'],['join','輸入代號','8位代號就入到房。','lantern']]){const card=button('',()=>{view=to;render();},false,'arcade-entry');const picture=el('span','','arcade-entry-art');picture.dataset.icon=icon;card.append(picture,el('strong',title),el('small',copy));grid.append(card);}list.append(grid);
  const pass=el('section','','weekend-compact');pass.append(el('h3','週末狂熱'),el('p','星期六、日隨機15題，一張通行券最多玩3次。每場最多5,000獎金，每日上限100,000；不計每日榜。'));
  const owned=w?.pass===weekendKey(),left=owned?Math.max(0,3-(w.passUses??0)):0;pass.append(el('b',owned?'本週末剩餘 '+left+'／3 次':'通行券 100,000'),button(owned?(isWeekend()?'開始週末挑戰':'星期六、日開放'):'購買週末通行券',()=>owned?startWeekend():(dialog.close(),onShop('tickets')),!!pending||owned&&(!isWeekend()||!left),'primary'));list.append(pass,button('我的房間紀錄',()=>loadRooms()));
 }
 function create(list){
  const form=el('form','','room-form');form.innerHTML='<h3>開個街坊房</h3><label>題目專場<select name="topic"><option value="all">香港綜合</option><option value="sport">體育專場</option><option value="places">地理與景點</option></select></label><label>每人參加費<input name="entryFee" type="number" inputmode="numeric" min="1000" max="500000" step="1" value="1000" required></label><div class="room-cost-preview"></div><p class="quiet">開房費30,000由2–4人均分。報名先預收參加費＋15,000，開局後退回開房費差額；未開局取消，全數退還。參加費全部放入獎金池。</p><button class="primary" type="submit">確認開房</button>';
  const input=form.querySelector('input'),preview=form.querySelector('.room-cost-preview');const update=()=>{preview.textContent='現在預收 '+money((Number(input.value)||0)+15000)+' · 滿4人每人開房費7,500';};input.oninput=update;update();form.onsubmit=e=>{e.preventDefault();if(!canStart()){status('請先完成每日熱座。');return;}const values=new FormData(form),payload={topic:values.get('topic'),entryFee:Number(values.get('entryFee')),code:roomCode()};try{localStorage.setItem('sky.hkm.pending-room.'+uid,JSON.stringify(payload));}catch{}createWith(payload);};list.append(form);
 }
 async function createWith(payload){await operation('create',async current=>{const id=await cloud.createRoom(payload);if(current()){try{localStorage.removeItem('sky.hkm.pending-room.'+uid);}catch{}await attach(id);wallet().catch(()=>{});}});}
 function join(list){const form=el('form','','room-form');form.innerHTML='<h3>加入街坊房</h3><label>8位房間代號<input name="code" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" spellcheck="false" minlength="8" maxlength="8" placeholder="例如 AB23CD45" required></label><p class="quiet">先查看參加費和街坊，再決定加入。</p><button class="primary" type="submit">查看房間</button>';form.onsubmit=e=>{e.preventDefault();const code=new FormData(form).get('code').trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{8}$/.test(code)){status('請輸入8位房間代號。');return;}operation('find',()=>attach(code));};list.append(form);}
 function roomView(list){
  if(!room){view='home';home(list);return;}const member=room.players.includes(uid),box=el('section','','room-code-panel');box.append(el('span','房間代號'),el('strong',room.id),button('複製代號',async()=>{try{await navigator.clipboard.writeText(room.id);status('代號已複製。');}catch{status('房間代號：'+room.id);}}));list.append(box);
  const summary=el('div','','room-summary');summary.append(el('p',TOPICS.find(t=>t.id===room.topic)?.name??'香港綜合'),el('b','每人 '+money(room.entryFee)),el('strong','獎金池 '+money(room.pool)));list.append(summary);
  const roster=el('div','','room-roster');for(let i=0;i<4;i++){const p=room.players[i],seat=el('div','','room-seat');const art=el('span','','seat-avatar');art.dataset.icon=p?'bao':'lantern';seat.append(art,el('b',p?room.names[p]:'等街坊加入'),el('small',p?(room.status==='lobby'?'已報名':room.scores[p]?.finished?room.scores[p].correct+'／10・已交卷':'作答中'):'空位'));roster.append(seat);}list.append(roster);
  if(room.status==='lobby'){
   list.append(el('p','2人起開始 · 最多4人 · 每題25秒＋2.5秒揭曉','room-help'));
   if(!member)list.append(el('p','加入先預收 '+money(room.entryFee+15000)+'，開局後按人數退回差額。','quiet'),button('確認付款並加入',()=>operation('join',async current=>{const next=await cloud.joinRoom(room.id);if(current()){room=next;wallet().catch(()=>{});}}),!!pending,'primary'));
   if(room.hostUid===uid)list.append(button(room.players.length<2?'等多一位街坊':'開始對戰',()=>operation('room-start',async current=>{const next=await cloud.startRoom(room.id);if(current())room=next;}),!!pending||room.players.length<2,'primary'),button('取消房間並退款',()=>operation('cancel',async current=>{const next=await cloud.cancelRoom(room.id);if(current()){room=next;const credit=await cloud.claimRoom(room.id);if(current()){state=credit;onChange(credit);}}}),!!pending));
   if(room.players.length>=2)list.append(el('small','目前每人開房費 '+money(roomFeeShare(room.players.length))+'；開始後自動退回 '+money(15000-roomFeeShare(room.players.length))+'。'));
  }else if(room.status==='playing'){
   if(member){if(!run||run.room!==room.id||run.phase!=='finished')list.append(button('繼續對戰',()=>startRoomSession(true),!!pending,'primary'));const ready=roomCanFinish(room,now()),finish=button(ready?'立即核對全場結果':'等街坊交卷',()=>operation('finalise',async current=>{const next=await cloud.finaliseRoom(room.id);if(current())room=next;}),!!pending||!ready,'primary');finish.id='room-finish';list.append(finish);}const count=el('p');count.id='room-live';list.append(count,el('small','全部交卷即能結算；有人斷線，最遲開局305秒後結算。'));
  }else{
   list.append(el('h3',room.status==='cancelled'?'房間已取消':'勝出街坊：'+(room.names[room.winner]??'—')));
   const canClaim=member&&(!room.rebates[uid]||room.status==='cancelled'&&!room.refunds[uid]||room.winner===uid&&!room.paidTo);
   if(canClaim)list.append(button(room.winner===uid&&!room.paidTo?'領取全池 '+money(room.pool):'領回退款／開房費差額',()=>operation('claim',async current=>{const next=await cloud.claimRoom(room.id);if(current()){room=next.room;state=next;onChange(next);}}),!!pending,'primary'));else if(member)list.append(el('p','本局獎金及差額已處理。','quiet'));
  }
  updateRoomProgress();
 }
 async function loadRooms(){await operation('rooms',async current=>{const rows=await cloud.myRooms();if(!current())return;view='history';const list=$('arcade-content');list.replaceChildren(el('h3','我的房間紀錄'));for(const r of rows)list.append(button(r.id+' · '+money(r.pool)+' · '+({lobby:'等候',playing:'對戰',finished:'已結算',cancelled:'已取消'}[r.status]),()=>operation('room',()=>attach(r.id))));if(!rows.length)list.append(el('p','開房或參加對戰後，會在這裏留下紀錄。'));});}
 function render(){if(!dialog.open)return;visualObserver?.disconnect();visualAnimation?.cancel();visualObserver=visualAnimation=null;dialog.classList.toggle('arcade-playing',view==='game'&&run?.phase!=='finished');dialog.dataset.view=view;const list=$('arcade-content');if(view==='history'){updateRoomProgress();return;}list.replaceChildren();if(view==='game')quiz(list);else if(view==='room')roomView(list);else if(view==='create')create(list);else if(view==='join')join(list);else home(list);$('arcade-retry').disabled=!!pending;$('arcade-lobby').disabled=!!pending;updateRoomProgress();if(view==='room'&&room?.status==='playing'&&!pending&&!starting&&automaticReady()&&room.players.includes(uid)&&!(run?.room===room.id&&run.phase==='finished')&&now()<room.startedAt+ROOM_DURATION)queueMicrotask(startRoomSession);}
 function clock(allowAction=true){
  if(!dialog.open)return;updateRoomProgress();if(view==='room'&&room?.status==='playing'&&!pending&&!starting&&automaticReady()){startRoomSession();return;}if(view!=='game'||!run||run.phase==='finished')return;const clockAt=now(),node=$('arcade-clock');if(node)node.textContent=run.phase==='playing'?'剩餘 '+Math.ceil(sessionRemaining(run,clockAt)/1000)+' 秒':run.kind==='room'?(isRevealed()?'下一題 ':'揭曉倒數 ')+Math.max(0,((isRevealed()?run.questionAt+ROOM_INTERVAL:run.questionAt+QUESTION_MS)-clockAt)/1000).toFixed(1)+' 秒':'本題已揭曉';
  const key=snapshotKey(run)+':'+isRevealed();if(allowAction&&lastRender!==key){lastRender=key;render();return;}if(visualAnimation)visualAnimation.currentTime=Math.max(0,Math.min(QUESTION_MS,clockAt-run.questionAt));
  if(!allowAction||auto||pending||!automaticReady())return;const safeAt=cloud.sessionSafeNow?.()??clockAt,action=run.phase==='playing'&&sessionRemaining(run,safeAt)<=0?{type:'timeout'}:run.kind==='room'&&run.phase==='reveal'&&safeAt>=run.questionAt+ROOM_INTERVAL?{type:'next'}:null;if(action){auto=true;move(action,{automatic:true}).finally(()=>{auto=false;});}
 }
 async function recover(){if(pending)return;resetFailures();await operation('recover',async current=>{const next=run?await cloud.getSession(descriptor(run)):await cloud.activeSession();if(!current())return;if(next){await bindRun(next);if(next.kind==='room'&&room?.id!==next.room){await attach(next.room);view='game';}}else{let payload;try{payload=JSON.parse(localStorage.getItem('sky.hkm.pending-room.'+uid));}catch{}if(payload){const id=await cloud.createRoom(payload);if(current()){localStorage.removeItem('sky.hkm.pending-room.'+uid);await attach(id);}}}wallet().catch(()=>{});});}
 async function open(){setIdentity(getUser()?.uid??null);if(!uid){login();return;}dialog.showModal();view='home';render();if(!canStart()){status('請先完成目前的每日熱座。');return;}const ticket=++loadId;await operation('open',async current=>{await wallet();const next=await cloud.activeSession();if(!current()||ticket!==loadId)return;if(next){await bindRun(next);if(next.kind==='room'){await attach(next.room);view='game';}}});}
 $('arcade-retry').onclick=recover;$('arcade-lobby').onclick=()=>{view='home';render();};dialog.addEventListener('close',()=>{hint.close();visualObserver?.disconnect();visualAnimation?.cancel();visualObserver=visualAnimation=null;});setInterval(clock,150);
 for(const type of ['copy','cut','contextmenu','selectstart','dragstart'])dialog.addEventListener(type,event=>{if(view==='game'&&run?.phase!=='finished'&&event.target.closest?.('.arcade-question,.arcade-options,.arcade-visual'))event.preventDefault();});
 return {open,setIdentity,get run(){return run;}};
}
