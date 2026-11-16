import {questionView} from './question-view.js';
import {paintQuestionImage} from './visual-effects.js';
import {optionOrder} from './choice-order.js';
import {installIcons,iconSVG} from './hk-icons.js';
import {installCollection} from './collection-ui.js';
import {installArcade} from './arcade-ui.js';
import {prefixedTitle,SERIES} from './economy.js';
import {playRedVan,downloadResultCard} from './reward-effects.js';
import {celebrateMillion} from './celebrations.js';
import {createQuestionCard,questionShareText} from './question-share.js';
import {QUESTIONS} from './questions.js';
import {ART} from './art.js';
import {DailyLedger,pendingAccount} from './ledger.js';
import {newRun,act,hkDay,dayEnd,dayLabel,challengeNumber,questionFor,questionById,presentation,MODE_NAMES,PRIZES,TITLES,titleFor,earned,insurance,remaining,limitMs,livesLeft,removedOptions,audience,shareText,terminal,spent} from './game.js';
import * as cloud from './cloud.js';
import '../../grid-rush/src/site-updates.js';
const $=id=>document.getElementById(id),money=n=>'$'+Number(n).toLocaleString('en-HK'),put=(id,value)=>{const n=$(id);if(n.textContent!==String(value))n.textContent=value;},show=(id,value)=>{$(id).hidden=!value;};
let storage;try{storage=localStorage;}catch{storage={getItem(){return null;},setItem(){throw Error('storage-required');},removeItem(){}};}
const ledger=new DailyLedger({storage}),initial=ledger.read();let run=initial?.owner==='guest'?initial.run:null,owner=run?'guest':null,token=initial?.token,user=null,profile=null,busy=false,pending=false,selected=null,screen='lobby',visualKey='',blur=null,authReady=false,authBusy=false,googleAttempt=null,authVersion=0,identityVersion=0,actionVersion=0,accountLoading=false,authRestored=false,anonymousIntent=!!run,accountRequested=false,stopAuth,boardType='daily',bookType='wrong',detailId=null,deadlineCall=false,lastSecond=-1,lastAnnounced=-1,historyRows=[],boardVersion=0;
const boardCache=new Map(),prepared=new Map();
let collectionUI=null,arcadeUI=null;
let lobbyDay=hkDay(),pendingAttempt=null,syncMessage='';
const questionState=r=>({index:r.index,questionAt:r.questionAt,phase:r.phase});
function syncProblem(error,stage='progress-read'){const names={'answer-write':'提交答案','progress-write':'保存進度','progress-read':'核對雲端進度',settlement:'結算成績'},code=String(error?.code??'unknown').replace(/[^a-z0-9_/-]/gi,'').slice(0,70)||'unknown';syncMessage=(names[error?.stage??stage]??'同步進度')+'未完成（'+code+'）。'+cloud.errorText(error);put('game-status',syncMessage);}
function announce(text){put('announcer',text);}
function dialog(id){if(!$(id).open)$(id).showModal();}
function close(id){if($(id).open)$(id).close();}
function closeRoundDialogs(){for(const id of ['answer-dialog','walk-dialog','phone-dialog','audience-dialog'])close(id);}
function timeout(task,ms=14000){return new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Object.assign(Error('request-timeout'),{code:'unavailable'})),ms);Promise.resolve(task).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});}
function preload(q){if(q.textOnly)return Promise.resolve();const url=ART[q.art];if(!prepared.has(url))prepared.set(url,new Promise((resolve,reject)=>{const image=new Image();image.onload=resolve;image.onerror=()=>{prepared.delete(url);reject(Error('image-unavailable'));};image.src=url;}));return prepared.get(url);}
function page(next){screen=next;show('lobby',next==='lobby');show('game-screen',next==='game');show('result-screen',next==='result');document.body.classList.toggle('is-playing',next==='game');if(next==='game')window.scrollTo({top:0,behavior:'instant'});}
function renderLadders(){for(const id of ['prize-ladder','modal-ladder']){const list=$(id);list.replaceChildren();for(let i=14;i>=0;i--){const li=document.createElement('li');li.classList.toggle('safe',i===4||i===9);li.classList.toggle('current',!!run&&run.phase!=='finished'&&run.index===i);li.classList.toggle('reached',!!run&&i<run.correct);if(li.classList.contains('current'))li.setAttribute('aria-current','step');const no=document.createElement('span'),value=document.createElement('b'),mark=document.createElement('span');no.textContent=String(i+1).padStart(2,'0');value.textContent=money(PRIZES[i]);mark.innerHTML=i===4||i===9?iconSVG('lantern'):i===14?iconSVG('trophy'):'';li.append(no,value,mark);list.append(li);}}}
// A login changes the account identity, never the ownership of today's anonymous attempt.
function guestEntry(){const entry=ledger.read();return entry?.owner==='guest'&&entry.run?.uid==='guest'?entry:null;}
function restoreGuest(){
 const entry=guestEntry();if(!entry)return false;
 if(owner!=='guest'||run?.day!==entry.day){actionVersion++;busy=false;deadlineCall=false;visualKey='';closeRoundDialogs();}
 run=entry.run;owner='guest';token=entry.token;anonymousIntent=true;pending=false;pendingAttempt=null;syncMessage='';put('game-status','');
 if(screen!=='lobby')page(run.phase==='finished'?'result':'game');return true;
}
function activeAction(version,actor){return version===actionVersion&&owner===actor&&(actor==='guest'||user?.uid===actor);}
function renderLobby(){
 const day=hkDay(),mark=ledger.read(),today=run?.day===day,guest=guestEntry();
 lobbyDay=day;put('today-label','香港時間 '+dayLabel(day));put('challenge-label','每日題組 · 第 '+challengeNumber(day)+' 回');
 $('start').disabled=busy||!guest&&(!authRestored||accountLoading);$('guest-start').disabled=busy;
 put('guest-start',pendingAccount(mark)?'核實未完成開局，再匿名遊玩 ↗':'直接匿名遊玩（只存本機） ↗');
 put('start',today?(run.phase==='finished'?'查看今日成績 ↗':'返回今日熱座 ↗'):!authRestored?'正在確認登入狀態…':accountLoading?'正在連接帳戶…':mark?.owner&&mark.owner!=='guest'&&!user?'登入繼續今日挑戰 ↗':user?'帳戶每日挑戰，開始遊玩 ↗':'匿名坐上熱座，開始挑戰 ↗');
 show('guest-start',!guest&&(!!user||!authRestored||accountLoading));
 let note='每人每日一次，香港時間凌晨零時更新。';
 if(!authRestored&&!today)note='正在確認登入狀態；可直接匿名遊玩，進度只保存在本機。';
 else if(!ledger.available&&!user)note='匿名挑戰需要儲存今日次數，請允許網站儲存，或登入後遊玩。';
 else if(today)note=owner==='guest'?'今日匿名進度已保留；登入不會重新獲得一次機會。':'今日挑戰已綁定帳戶，跨裝置可繼續。';
 else if(pendingAccount(mark))note='上次帳戶開局仍待確認；可重試帳戶挑戰，或由伺服器核實後改為匿名遊玩。';
 else if(mark?.owner&&mark.owner!=='guest'&&!user)note='此瀏覽器今日已有帳戶挑戰，登入原帳戶繼續。';
 put('lobby-status',note);
}
function renderVisual(){
 if(!run)return;const q=questionFor(run),p=presentation(run.day,run.index,run.bankVersion),mode=run.phase==='playing'?p.mode:'original',frame=$('visual-frame'),rect=frame.getBoundingClientRect(),key=run.day+':'+run.index+':'+mode+':'+rect.width+':'+rect.height;
 if(key===visualKey)return;visualKey=key;blur?.cancel();blur=null;const text=mode==='text';show('text-visual',text);show('question-image',!text);put('mode-label',run.phase==='playing'?MODE_NAMES[mode]:'完整插畫');
 if(!text){const image=$('question-image');image.src=ART[q.art];blur=paintQuestionImage(image,frame,q,{...p,mode},Date.now()-run.questionAt,limitMs(run.index));}
}
function renderOptions(){const q=questionFor(run),order=optionOrder(run,q.id),removed=removedOptions(run),list=$('options');list.replaceChildren();for(const [i,choice]of order.entries()){const button=document.createElement('button');button.type='button';button.className='option';button.dataset.choice=choice;const letter=document.createElement('span'),text=document.createElement('span');letter.className='option-letter';letter.textContent='ABCD'[i];text.textContent=removed.includes(choice)&&run.phase==='playing'?'已刪去':q.options[choice];button.append(letter,text);button.insertAdjacentHTML('afterbegin',iconSVG('bao'));button.setAttribute('aria-label','選項 '+letter.textContent+'：'+text.textContent);button.disabled=busy||pending||run.phase!=='playing'||removed.includes(choice);button.classList.toggle('is-removed',removed.includes(choice)&&run.phase==='playing');if(run.phase==='reveal'){button.classList.toggle('is-correct',choice===q.answer);button.classList.toggle('is-wrong',choice===run.choice&&run.outcome==='wrong');}button.onclick=()=>{if(busy||pending||run.phase!=='playing')return;selected=choice;put('answer-dialog-title',letter.textContent+'：'+q.options[choice]);dialog('answer-dialog');};list.append(button);}}
function renderGame(){if(!run)return;const q=questionFor(run);put('round-label',dayLabel(run.day)+' · 第'+challengeNumber(run.day)+'回每日挑戰');put('question-number','第 '+(run.index+1)+'／15 題');put('category',q.category);put('question-title',questionView(q,run.phase==='playing'?presentation(run.day,run.index,run.bankVersion).mode:'original').question);$('question-value').replaceChildren(document.createTextNode('這一題，挑戰 '));const award=document.createElement('strong');award.className='question-award';award.textContent=money(PRIZES[run.index]);$('question-value').append(award);put('current-prize',money(earned(run.correct)));put('insurance-note',insurance(run.correct)?'保險線已到 '+money(insurance(run.correct)):'尚未抵達保險線');renderVisual();renderOptions();renderLadders();for(const [kind,key]of [['half','halfFor'],['phone','phoneFor'],['audience','audienceFor']]){const button=$('life-'+kind),used=run[key]>=0,current=run[key]===run.index;button.classList.toggle('used',used);button.disabled=busy||pending||run.phase!=='playing'||used&&(!current||kind==='half');button.querySelector('small').textContent=used?(current&&kind!=='half'?'再看提示':'已使用'):kind==='half'?'一次機會':kind==='phone'?'模擬朋友':'模擬投票';}const reveal=run.phase==='reveal'||pending;show('reveal',reveal);show('next-question',run.phase==='reveal'&&!terminal(run)&&!pending);show('retry-sync',pending);$('next-question').disabled=busy;$('retry-sync').disabled=busy;$('walk').disabled=busy||pending||run.phase==='finished'||run.phase==='reveal'&&terminal(run);if(reveal){put('reveal-title',pending?'今日進度等待同步':run.outcome==='correct'?'答啱！累積 '+money(earned(run.correct)):'挑戰已完結，正在結算。');put('reveal-explanation',pending?(syncMessage||'連線未完成，進度與今日機會仍然保留。重新連接後會核對最新狀態。'):(q.observation?'認圖線索：'+q.observation.clue+'。':'')+q.explanation);}tick();}
function renderResult(){closeRoundDialogs();const title=titleFor(run.payout);put('result-day',dayLabel(run.day)+' · 第'+challengeNumber(run.day)+'回');put('result-title',owner==='guest'?title.name:prefixedTitle(collectionUI?.wallet,title.name));put('result-reason',{wrong:'答錯了，帶走最近保險線的獎金。',walk:'識得收手，安全帶走已累積的獎金。',timeout:'時間到，保留已累積的獎金。',complete:'十五條全中，今晚你就係百萬富翁！'}[run.reason]);put('result-prize',money(run.payout));put('title-note',title.note);put('result-correct',run.correct+'／15');put('result-time',(run.timeMs/1000).toFixed(1)+'秒');put('result-lives',livesLeft(run)+'／3');const grid=$('result-grid');grid.replaceChildren();for(let i=0;i<15;i++){const cell=document.createElement('span'),a=run.answers[i];if(a)cell.className=a.outcome;cell.setAttribute('aria-label','第'+(i+1)+'題：'+(a?{correct:'答對',wrong:'答錯',walk:'未作答',timeout:'超時'}[a.outcome]:'未到達'));grid.append(cell);}put('result-account-note',owner==='guest'?'本局為匿名挑戰，只保留今日結果，不會進入排行榜或永久圖鑑。':'已綁定登入帳戶；永久稱號及排行榜由雲端保存。');show('native-share',typeof navigator.share==='function');tick();celebrateMillion(run);if(owner!=='guest'&&collectionUI?.wallet?.exit==='exit-redvan'&&run.reason==='walk')playRedVan(run,collectionUI.soundEnabled());}
function render(){renderLobby();renderAccount();if(screen==='game')renderGame();if(screen==='result'&&run)renderResult();}
function renderAccount(){collectionUI?.setIdentity(user?.uid??null);arcadeUI?.setIdentity(user?.uid??null);collectionUI?.restore();show('signed-in',!!user);show('signed-out',!user);put('account-label',user?profile?.displayName??'我的帳戶':'登入／帳戶');$('google-login').disabled=!authReady||authBusy;$('email-login').disabled=!authReady||authBusy;$('reset-password').disabled=!authReady||authBusy;$('logout').disabled=authBusy;show('google-open',!!googleAttempt?.popup?.ready&&!googleAttempt.popup.opened);show('auth-cancel',!!googleAttempt?.popup?.standalone);if(user){put('account-identity',user.email??'已登入 Google 帳戶');if(document.activeElement!==$('display-name'))$('display-name').value=profile?.displayName??'';const box=$('account-stats');box.replaceChildren();for(const [value,label]of [[money(profile?.total??0),'生涯總獎金'],[profile?.games??0,'完成挑戰']]){const cell=document.createElement('div'),b=document.createElement('b');b.textContent=value;cell.append(b,document.createTextNode(label));box.append(cell);}}}
async function releaseFailedStart(mark,current){
 if(!pendingAccount(mark)||user?.uid!==mark.owner)return false;
 // Only a fresh, successful server read can establish that an old reservation never became a run.
 return accountClaimLock(async()=>{
  if(!current()||user?.uid!==mark.owner)return false;
  const existing=await timeout(cloud.currentRun(mark.day,{server:true}));if(!current()||user?.uid!==mark.owner)return false;
  const latest=ledger.readAccount(mark.owner);if(latest?.token!==mark.token||!pendingAccount(latest))return false;
  if(existing){ledger.markCloud(mark.owner,existing);return false;}
  return ledger.releaseUnclaimed(mark.owner,mark.token);
 });
}
// Keep recovery behind another tab's in-flight claim, including requests outliving a UI timeout.
const accountClaimLock=task=>navigator.locks?navigator.locks.request('hk-millionaire-cloud-start',task):task();
async function start(mode){
 const wantsGuest=mode==='guest';
 if(busy||!wantsGuest&&!guestEntry()&&(!authRestored||accountLoading))return;
 const day=hkDay(),mark=ledger.read();
 if(wantsGuest&&(!pendingAccount(mark)&&mark?.owner&&mark.owner!=='guest'||run?.day===day&&owner&&owner!=='guest')){
  put('lobby-status','本瀏覽器今日已開始帳戶挑戰，請登入原帳戶繼續；今日機會不會重置。');return;
 }
 restoreGuest();if(run?.day===day){page(run.phase==='finished'?'result':'game');render();return;}
 if(!wantsGuest&&!user){dialog('account-dialog');return;}
 anonymousIntent=wantsGuest;accountRequested=!wantsGuest;
 const version=++actionVersion,uid=user?.uid;let reservation=null;busy=true;renderLobby();put('lobby-status',wantsGuest?'正在準備匿名本機挑戰…':'正在連接帳戶挑戰…');
 const current=()=>version===actionVersion&&(wantsGuest?anonymousIntent:user?.uid===uid);
 try{
  if(wantsGuest){
   if(pendingAccount(mark)){
    put('lobby-status','正在向伺服器核實上次開局是否成功…');
    if(!await releaseFailedStart(mark,current)){if(current())put('lobby-status',user?.uid===mark.owner?'今日帳戶挑戰已存在，或仍未能確認開局狀態。請用原帳戶繼續，不會重置今日機會。':'請先登入上次使用的帳戶，核實未完成的開局；不會重置今日機會。');return;}
   }
   if(!ledger.read())await preload(questionFor(newRun(day)));if(!current())return;
   const entry=await ledger.start('guest');if(!current())return;
   run=entry.run;owner='guest';token=entry.token;
  }else{
   const state=await timeout(cloud.resumeAccount());if(!current())return;profile=state.profile;
   if(state.run?.day===day){run=state.run;owner=uid;if(ledger.available)ledger.markCloud(uid,run);}
   else{
    await preload(questionFor(newRun(day)));if(!current())return;
    const next=await timeout(accountClaimLock(async()=>{
     if(!current())return null;
     if(ledger.available)reservation=await ledger.start(uid);if(!current())return null;
     return cloud.claimDaily();
    }));if(!current())return;
    run=next;owner=uid;if(ledger.available)ledger.markCloud(uid,run);
   }
  }
  pending=false;pendingAttempt=null;syncMessage='';visualKey='';put('game-status','');page(run.phase==='finished'?'result':'game');announce('今日挑戰開始。第一條問題，準備好。');
 }catch(error){if(current()){
  let released=false;
  // A timeout can still commit later. Keep its reservation until a subsequent explicit check.
  if(reservation&&error.code==='permission-denied')try{released=await releaseFailedStart(reservation,current);}catch{}
  if(!current())return;
  put('lobby-status',(error.message==='storage-required'?'請允許網站儲存今日次數，或登入後遊玩。':error.message==='guest-used'?'今日已開始匿名挑戰，請繼續同一局。':error.message==='account-used'?'今日已有帳戶挑戰，請登入原帳戶繼續。':error.message==='image-unavailable'?'題圖未能載入，尚未開始挑戰；請重新連線再試。':cloud.errorText(error))+(released?' 伺服器確認今日尚未開局，已解除失敗標記；可重試帳戶挑戰或匿名遊玩。':''));if(error.message==='account-used')dialog('account-dialog');
 }}
 finally{if(version===actionVersion){busy=false;if(screen!=='lobby')render();else{$('start').disabled=!guestEntry()&&(!authRestored||accountLoading);$('guest-start').disabled=false;}}}
}
async function perform(action){
 if(owner!=='guest'&&guestEntry()){restoreGuest();render();return;}
 if(owner==='guest'&&pending)restoreGuest();
 if(!run||busy||pending||run.phase==='finished')return;if(owner!=='guest'&&user?.uid!==owner){dialog('account-dialog');return;}
 const version=++actionVersion,actor=owner,previous=run,attemptToken=token;busy=true;renderGame();
 const current=()=>activeAction(version,actor);
 try{
  if(action.type==='next'){await preload(questionFor({...previous,index:previous.index+1}));if(!current())return;}
  let next;
  if(actor==='guest'){next=previous.day!==hkDay()?act(previous,action,Date.now()):(await ledger.action(action,attemptToken)).run;}
  else if(previous.phase==='reveal'&&action.type==='walk')next=await timeout(cloud.settle(previous.day,'walk'));
  else if(previous.phase==='reveal'&&previous.day!==hkDay())next=await timeout(cloud.settle(previous.day));
  else next=await timeout(cloud.move(previous.day,action,{expected:questionState(previous)}));
  if(!current())return;run=next;
  if(run.phase==='finished'){
   if(actor!=='guest')try{const nextProfile=await timeout(cloud.account());if(!current())return;profile=nextProfile;}catch{}
   if(!current())return;page('result');announce('挑戰結束，'+titleFor(run.payout).name+'，'+money(run.payout)+'港幣。');
  }else if(run.phase==='reveal')announce(run.outcome==='correct'?'答啱！累積'+money(earned(run.correct)):'挑戰已結束。');
  if(action.type==='life'&&run.phase==='playing'){if(action.kind==='phone')openPhone();if(action.kind==='audience')openAudience();}
 }catch(error){
  if(!current())return;
  if(actor==='guest'){const entry=ledger.read();if(entry?.owner==='guest'){run=entry.run;token=entry.token;put('game-status','另一分頁已更新，畫面已同步到最新進度。');if(run.phase==='finished')page('result');}else put('game-status','今日資料未能儲存，請允許網站儲存後重試。');}
  else{if(error.run?.uid===actor)run=error.run;pendingAttempt=action.type==='answer'?{action:{...action},expected:questionState(previous)}:null;pending=true;syncProblem(error,action.type==='answer'?'answer-write':previous.phase==='reveal'?'settlement':'progress-write');}
 }finally{if(current()){busy=false;if(run?.phase!=='playing')closeRoundDialogs();render();deadlineCall=false;}}
}
async function reconcile(){
 if(restoreGuest()){render();return;}
 if(busy||!user||owner!==user.uid||!run)return;
 const version=++actionVersion,actor=owner,day=run.day,current=()=>activeAction(version,actor);busy=true;renderGame();
 try{
  let next=await timeout(cloud.currentRun(day,{server:true}));if(!current())return;if(!next)throw Error('run-missing');
  // Inspect the authoritative state before resending. Accepted answers are never sent twice.
  run=next;
  const attempt=pendingAttempt,same=attempt&&next.phase==='playing'&&next.index===attempt.expected.index&&next.questionAt===attempt.expected.questionAt;
  if(same)next=await timeout(cloud.move(day,attempt.action,{expected:attempt.expected}));
  else if(next.phase==='playing'&&remaining(next)<=0)next=await timeout(cloud.move(day,{type:'timeout'},{expected:questionState(next)}));
  if(!current())return;run=next;
  if(terminal(next)){next=await timeout(cloud.settle(day));if(!current())return;run=next;}
  pending=false;pendingAttempt=null;syncMessage='';put('game-status','');
  if(run.phase==='finished'){
   page('result');
   try{const nextProfile=await timeout(cloud.account());if(!current())return;profile=nextProfile;}catch{}
  }
 }catch(error){if(current()){if(error.run?.uid===actor)run=error.run;pending=true;syncProblem(error,terminal(run)?'settlement':'progress-read');}}
 finally{if(current()){busy=false;render();}}
}
function openPhone(){put('phone-hint','「'+questionFor(run).hint+'」');dialog('phone-dialog');}
function openAudience(){const values=audience(run),order=optionOrder(run,questionFor(run).id),list=$('audience-chart');list.replaceChildren();for(const [i,choice]of order.entries()){const row=document.createElement('div'),label=document.createElement('b'),track=document.createElement('div'),fill=document.createElement('div'),percent=document.createElement('span');row.className='audience-row';label.textContent='ABCD'[i];track.className='audience-track';fill.className='audience-fill';fill.style.width=values[choice]+'%';percent.textContent=values[choice]+'%';row.setAttribute('aria-label',label.textContent+'：'+values[choice]+'%');track.append(fill);row.append(label,track,percent);list.append(row);}dialog('audience-dialog');}
let sharedQuestion=null,questionCardURL=null,questionCardFile=null,questionCardVersion=0;
async function openQuestionShare(q){
 if(!q)return;
 const version=++questionCardVersion;sharedQuestion=q;questionCardFile=null;
 if(questionCardURL){URL.revokeObjectURL(questionCardURL);questionCardURL=null;}
 show('question-share-preview',false);show('native-question-share',false);$('download-question-card').disabled=true;
 put('question-share-prompt',q.sharePrompt??'呢啲香港日常設計，你又留意過未？');put('question-share-status','正在製作不附答案的分享圖…');dialog('question-share-dialog');
 try{
  const blob=await createQuestionCard(q,ART[q.art]);if(version!==questionCardVersion)return;
  questionCardFile=new File([blob],'hk-millionaire-'+q.id+'.png',{type:'image/png'});questionCardURL=URL.createObjectURL(blob);
  $('question-share-preview').src=questionCardURL;show('question-share-preview',true);$('download-question-card').disabled=false;
  show('native-question-share',typeof navigator.share==='function'&&!!navigator.canShare?.({files:[questionCardFile]}));put('question-share-status','圖片已準備好，可儲存或自行選擇分享。');
 }catch{if(version===questionCardVersion)put('question-share-status','圖片暫時未能製作，仍可複製題目文字。');}
}
function tick(){if(screen==='lobby'&&!busy&&lobbyDay!==hkDay()){run=null;owner=null;token=null;pending=false;pendingAttempt=null;syncMessage='';anonymousIntent=false;renderLobby();}if(run&&screen==='game'){const left=remaining(run),seconds=Math.ceil(left/1000);if(lastSecond!==seconds){put('timer',run.phase==='playing'?seconds:'—');lastSecond=seconds;}const urgent=seconds<=5&&run.phase==='playing';document.querySelector('.timer-box').classList.toggle('urgent',urgent);document.querySelector('.time-track').classList.toggle('urgent',urgent);$('timer-fill').style.transform='scaleX('+(run.phase==='playing'?Math.max(0,Math.min(1,left/limitMs(run.index))):0)+')';if(seconds>0&&seconds<=5&&lastAnnounced!==seconds&&run.phase==='playing'){lastAnnounced=seconds;announce('剩餘'+seconds+'秒。');}if(run.phase==='playing'&&left<=0&&!busy&&!pending&&!deadlineCall){deadlineCall=true;closeRoundDialogs();perform({type:'timeout'});}else if(run.phase==='reveal'&&run.day!==hkDay()&&!busy&&!pending){perform({type:'timeout'});}}if(screen==='result'){const ms=Math.max(0,dayEnd(hkDay())-Date.now()),h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;put('next-day-countdown',run?.day===hkDay()?`${h}小時 ${String(m).padStart(2,'0')}分 ${String(s).padStart(2,'0')}秒後，新一回開場。`:'今日新挑戰已開放，返回大堂即可開始。');}}
async function initAuth(){
 const version=++authVersion;identityVersion++;put('account-status','正在準備登入服務…');show('auth-retry',false);
 try{
  await timeout(cloud.prepareAuth(),10000);if(version!==authVersion)return;authReady=true;stopAuth?.();
  stopAuth=await cloud.observeAuth(async next=>{
   if(version!==authVersion)return;const identity=++identityVersion,previousUid=user?.uid;
   const current=()=>version===authVersion&&identity===identityVersion&&user?.uid===next?.uid;
   user=next;profile=null;authRestored=true;accountLoading=!!next;
   if(!anonymousIntent&&!guestEntry()&&previousUid!==next?.uid){actionVersion++;busy=false;deadlineCall=false;pending=false;pendingAttempt=null;syncMessage='';closeRoundDialogs();if(owner&&owner!=='guest'){run=null;owner=null;token=null;visualKey='';put('game-status','');page('lobby');}}
   restoreGuest();render();
   if(!next){accountLoading=false;put('account-status','免登入也可本機遊玩；登入後保存永久成績。');render();return;}
   put('account-status','正在連接你的香港足跡…');
   try{
    // Reading the profile is safe; resuming an account run can also write a timeout / settlement.
    // Never do that while this browser has already consumed today as an anonymous player.
    const mark=ledger.readAccount(next.uid),requested=accountRequested||mark?.owner===next.uid,resume=!anonymousIntent&&!guestEntry()&&requested;
    const state=!requested?{profile:null,run:null}:resume?await timeout(cloud.resumeAccount()):{profile:await timeout(cloud.account()),run:null};
    if(!current())return;profile=state.profile;
    if(restoreGuest())put('account-status','已登入。今日匿名局繼續保存在本機，不會轉成排行成績；明日起可用帳戶挑戰。');
    else if(!anonymousIntent){
     if(state.run?.uid===next.uid){run=state.run;owner=next.uid;token=null;pending=false;pendingAttempt=null;syncMessage='';visualKey='';put('game-status','');if(ledger.available)ledger.markCloud(owner,run);if(screen!=='lobby')page(run.phase==='finished'?'result':'game');}
     put('account-status',requested?'帳戶已連接。公開稱呼會顯示在排行榜。':'登入狀態已恢復；可選帳戶每日挑戰，或直接匿名遊玩並只存本機。');
    }else put('account-status','已選擇匿名本機挑戰；帳戶登入狀態不會改變本局的儲存方式。');
   }catch(error){if(!current())return;const local=restoreGuest();put('account-status',cloud.errorText(error)+(local?' 今日匿名局仍可在本機繼續。':''));show('auth-retry',true);}
   finally{if(current()){accountLoading=false;render();}}
  });
  if(!user)put('account-status','免登入也可本機遊玩；登入後保存永久成績。');
 }catch(error){if(version!==authVersion)return;authReady=false;authRestored=true;accountLoading=false;put('account-status',cloud.errorText(error));show('auth-retry',true);}
 render();
}
function beginGoogle(){if(authBusy||!authReady)return;accountRequested=true;authBusy=true;put('account-status','正在準備 Google 登入…');try{const attempt=cloud.googleLogin({onReady:()=>{if(googleAttempt!==attempt)return;put('account-status','登入視窗已準備好，請按下方按鈕開啟。');renderAccount();}});googleAttempt=attempt;renderAccount();timeout(attempt.task,120000).then(()=>{if(googleAttempt===attempt&&(!user||accountLoading))put('account-status','Google 登入完成，正在載入紀錄。');}).catch(error=>{if(googleAttempt===attempt)put('account-status',cloud.errorText(error));}).finally(()=>{if(googleAttempt!==attempt)return;attempt.popup.dispose();googleAttempt=null;authBusy=false;renderAccount();});}catch(error){authBusy=false;put('account-status',cloud.errorText(error));renderAccount();}}
async function loadBoard(type=boardType){boardType=type;const version=++boardVersion;for(const b of $('board-tabs').children)b.setAttribute('aria-pressed',String(b.dataset.board===type));put('board-note',type==='daily'?'同獎金先比較總作答時間，再比較剩餘錦囊。顯示前20名。':type==='season'?'今月累積獎金，顯示前20名。':'生涯累積獎金，顯示前20名。');put('board-status','正在讀取排行榜…');$('board-list').replaceChildren();try{const key=type+':'+hkDay(),cached=boardCache.get(key),rows=cached&&Date.now()-cached.at<10000?cached.rows:await timeout(cloud.leaderboard(type));if(version!==boardVersion)return;boardCache.set(key,{at:Date.now(),rows});let styles={};if(typeof cloud.publicStyles==='function')try{styles=await timeout(cloud.publicStyles(rows.map(r=>r.uid)),5000);}catch{}if(version!==boardVersion)return;for(const [i,r]of rows.entries()){const li=document.createElement('li'),no=document.createElement('span'),name=document.createElement('span'),value=document.createElement('strong'),meta=document.createElement('small');no.className='rank-no';if(i<3)no.innerHTML=iconSVG('trophy');else no.textContent=i+1;no.setAttribute('aria-label','第'+(i+1)+'名');name.className='rank-name';name.textContent=r.displayName+(styles[r.uid]?.prefix?' 【'+(SERIES.find(s=>s.id===styles[r.uid].prefix)?.prefix??'')+'】':'');if(styles[r.uid]?.frame&&styles[r.uid].frame!=='none'){const avatar=document.createElement('span');avatar.className='profile-avatar rank-avatar '+styles[r.uid].frame;avatar.textContent=r.displayName[0];no.replaceChildren(avatar);avatar.setAttribute('aria-label','第'+(i+1)+'名');}meta.textContent=type==='daily'?(r.timeMs/1000).toFixed(1)+'秒 · 錦囊剩'+r.lifelinesLeft:'完成'+r.games+'次每日挑戰';name.append(meta);value.className='rank-value';value.textContent=money(r.prize??r.total);li.append(no,name,value);$('board-list').append(li);}put('board-status',rows.length?'只顯示已完成並同步的登入玩家成績。':'暫時未有人上榜，第一位香港通可能就係你。');}catch(error){if(version===boardVersion)put('board-status',cloud.errorText(error));}}
function questionCard(q,meta=''){const button=document.createElement('button'),image=document.createElement('img'),copy=document.createElement('span'),small=document.createElement('small'),title=document.createElement('b'),arrow=document.createElement('span');button.type='button';button.className='book-card';image.src=ART[q.art];image.alt='';image.loading='lazy';small.textContent=q.category+(meta?' · '+meta:'');title.textContent=q.question;copy.append(small,title);arrow.textContent='↗';button.append(image,copy,arrow);button.onclick=()=>openDetail(q.id);return button;}
let bookRequest=0;
function filterBook(){const query=$('book-search').value.trim().toLocaleLowerCase();for(const card of $('book-list').children)card.hidden=!!query&&!card.textContent.toLocaleLowerCase().includes(query);}
function historyCard(r){
 const button=document.createElement('button'),copy=document.createElement('span'),title=document.createElement('b'),meta=document.createElement('small'),value=document.createElement('span'),prize=document.createElement('strong'),hint=document.createElement('small');
 button.type='button';button.className='history-card';copy.className='history-copy';value.className='history-prize';
 title.textContent=new Intl.DateTimeFormat('zh-HK',{timeZone:'UTC',year:'numeric',month:'long',day:'numeric'}).format(new Date(r.day*86400000))+' · '+(r.kind==='weekend'?'週末練習':titleFor(r.payout).name);
 meta.textContent='答對 '+r.correct+'／'+(r.count??15)+' 題 · '+(r.timeMs/1000).toFixed(1)+' 秒';prize.textContent=money(r.payout);hint.textContent=(r.kind?'入帳 '+money(r.credit)+' · ':'')+'查看本局故事 ↗';copy.append(title,meta);value.append(prize,hint);button.append(copy,value);button.onclick=()=>openReview(r);return button;
}
async function openBook(type=bookType){
 if(!user){dialog('account-dialog');put('account-status','登入後可累積永久稱號、錯題本與收藏。');return;}
 const request=++bookRequest,uid=user.uid;bookType=type;dialog('book-dialog');
 for(const b of $('book-tabs').children)b.setAttribute('aria-pressed',String(b.dataset.book===type));
 $('book-search').value='';$('book-list').replaceChildren();put('book-status','正在載入…');
 try{
  const nextProfile=await timeout(cloud.account());if(request!==bookRequest||user?.uid!==uid)return;profile=nextProfile;
  const summary=$('book-summary');summary.replaceChildren();
  for(const [value,label]of [[money(profile.total),'純每日累積獎金'],[profile.games,'純每日挑戰紀錄']]){const cell=document.createElement('div'),b=document.createElement('b'),small=document.createElement('span');b.textContent=value;small.textContent=label;cell.append(b,small);summary.append(cell);}
  const collection=$('title-collection');collection.replaceChildren();
  for(const t of TITLES){const span=document.createElement('span');span.className='title-pill'+(profile.titles.includes(t.id)?' unlocked':'');span.textContent=t.name;if(profile.titles.includes(t.id))span.insertAdjacentHTML('afterbegin',iconSVG('trophy'));collection.append(span);}
  if(type==='history'){
   const rows=await timeout(cloud.history());if(request!==bookRequest||user?.uid!==uid)return;historyRows=rows;
   for(const r of rows)$('book-list').append(historyCard(r));put('book-status',rows.length?'最近 '+rows.length+' 次已完成挑戰（含額外模式）；點選成績查看作答回顧。':'完成一次登入挑戰，這裏就會留下你的第一筆成績。');
  }else{
   const ids=type==='wrong'?profile.wrong:profile.favourites;
   for(const id of ids){const q=questionById(id);if(q)$('book-list').append(questionCard(q,type==='wrong'?'曾答錯或未作答':''));}
   put('book-status',ids.length?type==='wrong'?'點選題目，看看答案與解說。':'你親手收藏的香港故事。':type==='wrong'?'目前沒有錯題，完成挑戰後可回來重溫。':'在題目詳情按「收藏」，就能隨時回來重溫。');
  }
 }catch(error){if(request===bookRequest&&user?.uid===uid)put('book-status',cloud.errorText(error));}
}
$('book-search').oninput=filterBook;

function openReview(value=run){if(!value)return;put('review-title',dayLabel(value.day)+' · 本局香港故事');$('review-list').replaceChildren();for(const [i,a]of Object.entries(value.answers)){const q=questionById(a.qid);if(q)$('review-list').append(questionCard(q,'第'+(Number(i)+1)+'題 · '+{correct:'答啱',wrong:'答錯',walk:'未作答',timeout:'超時'}[a.outcome]));}dialog('review-dialog');}
function openDetail(id){const q=questionById(id);if(!q)return;detailId=id;$('detail-image').src=ART[q.art];put('detail-category',q.category);put('detail-title',q.question);put('detail-answer','正確答案：'+q.options[q.answer]);put('detail-explanation',q.explanation);$('detail-source').href=q.source.url;put('detail-source','延伸閱讀：'+q.source.label+' ↗');const canFavourite=!!user&&profile?.unlocked.includes(id);show('favourite-question',canFavourite);put('favourite-question',profile?.favourites.includes(id)?'★ 已收藏，按此取消':'☆ 收藏這段香港故事');dialog('detail-dialog');}
for(const button of document.querySelectorAll('[data-close]'))button.onclick=()=>close(button.dataset.close);
$('start').onclick=()=>start(user?'account':'guest');$('guest-start').onclick=()=>start('guest');$('rules-open').onclick=()=>dialog('rules-dialog');$('ladder-open').onclick=()=>{renderLadders();dialog('ladder-dialog');};$('account-open').onclick=()=>{dialog('account-dialog');if(user&&!profile&&!accountLoading){accountRequested=true;initAuth();}};$('book-open').onclick=()=>openBook();$('my-book').onclick=()=>{close('account-dialog');openBook();};$('board-open').onclick=()=>{dialog('board-dialog');loadBoard();};$('board-refresh').onclick=()=>loadBoard();for(const b of $('board-tabs').children)b.onclick=()=>loadBoard(b.dataset.board);for(const b of $('book-tabs').children)b.onclick=()=>openBook(b.dataset.book);
$('confirm-answer').onclick=()=>{close('answer-dialog');if(selected!==null)perform({type:'answer',choice:selected});};$('walk').onclick=()=>{put('walk-value',money(earned(run.correct)));dialog('walk-dialog');};$('confirm-walk').onclick=()=>{close('walk-dialog');perform({type:'walk'});};$('next-question').onclick=()=>{visualKey='';lastAnnounced=-1;perform({type:'next'});};$('retry-sync').onclick=reconcile;
for(const kind of ['half','phone','audience'])$('life-'+kind).onclick=()=>{if(!run||run.phase!=='playing')return;const key={half:'halfFor',phone:'phoneFor',audience:'audienceFor'}[kind];if(run[key]===run.index){if(kind==='phone')openPhone();if(kind==='audience')openAudience();return;}perform({type:'life',kind});};
$('google-login').onclick=beginGoogle;$('google-open').onclick=()=>{try{googleAttempt?.popup.open();put('account-status','正在連接 Google，請在登入視窗選擇帳戶。');renderAccount();}catch(error){put('account-status',cloud.errorText(error));}};$('auth-cancel').onclick=()=>{googleAttempt?.popup.cancel?.();};$('auth-retry').onclick=initAuth;
$('register-account').onchange=()=>{const register=$('register-account').checked;put('email-login',register?'建立電郵帳戶':'電郵登入');$('password').autocomplete=register?'new-password':'current-password';};$('email-form').onsubmit=async e=>{e.preventDefault();if(authBusy||!authReady)return;accountRequested=true;authBusy=true;renderAccount();put('account-status','正在驗證帳戶…');try{await timeout(cloud.emailLogin($('email').value.trim(),$('password').value,$('register-account').checked));$('password').value='';}catch(error){put('account-status',cloud.errorText(error));}finally{authBusy=false;renderAccount();}};
$('reset-password').onclick=async()=>{if(!$('email').value||!$('email').checkValidity()){$('email').reportValidity();put('account-status','請先填上有效電郵。');return;}try{await timeout(cloud.resetPassword($('email').value.trim()));put('account-status','若此電郵已登記，會收到重設密碼郵件。');}catch(error){put('account-status',['auth/user-not-found','auth/invalid-email'].includes(error.code)?'若此電郵已登記，會收到重設密碼郵件。':cloud.errorText(error));}};
$('logout').onclick=async()=>{if(authBusy)return;authBusy=true;renderAccount();try{await timeout(cloud.logout());put('account-status','已登出；今日已用的機會不會重置。');}catch(error){put('account-status',cloud.errorText(error));}finally{authBusy=false;renderAccount();}};
$('name-form').onsubmit=async e=>{e.preventDefault();try{profile=await timeout(cloud.saveName($('display-name').value));put('account-status','稱呼已保存，新上傳的成績會使用此稱呼。');renderAccount();}catch(error){put('account-status',cloud.errorText(error));}};
$('favourite-question').onclick=async()=>{if(!detailId||!user)return;$('favourite-question').disabled=true;try{profile=await timeout(cloud.favourite(detailId));openDetail(detailId);}catch(error){put('detail-explanation',cloud.errorText(error));}finally{$('favourite-question').disabled=false;}};
$('review-today').onclick=()=>openReview();$('result-home').onclick=()=>{if(run?.day!==hkDay()){run=null;owner=null;}page('lobby');render();window.scrollTo({top:0,behavior:'instant'});};
$('question-challenge').onclick=()=>{if(run?.phase!=='finished')return;const answered=Object.values(run.answers),failed=answered.find(a=>a.outcome==='wrong');openQuestionShare(questionById((failed??answered.at(-1))?.qid));};
$('share-detail-question').onclick=()=>openQuestionShare(questionById(detailId));
$('question-share-dialog').addEventListener('close',()=>{questionCardVersion++;if(questionCardURL)URL.revokeObjectURL(questionCardURL);questionCardURL=null;questionCardFile=null;});
$('download-question-card').onclick=()=>{if(!questionCardURL||!questionCardFile)return;const link=document.createElement('a');link.href=questionCardURL;link.download=questionCardFile.name;document.body.append(link);link.click();link.remove();put('question-share-status','已準備下載圖片；可將圖片傳送畀朋友。');};
$('native-question-share').onclick=async()=>{if(!questionCardFile||!sharedQuestion)return;try{await navigator.share({title:'香港百萬富翁・考考朋友',text:sharedQuestion.sharePrompt??'你又知唔知呢個香港日常設計？',files:[questionCardFile]});}catch(error){if(error.name!=='AbortError')put('question-share-status','暫時未能分享圖片，可先儲存再傳送。');}};
$('copy-question-share').onclick=async()=>{if(!sharedQuestion)return;try{await navigator.clipboard.writeText(questionShareText(sharedQuestion,new URL('./',location.href).href));put('question-share-status','已複製題目與選項，不包含答案或解說。');}catch{put('question-share-status','未能自動複製，可儲存題目圖片分享。');}};
$('copy-share').onclick=async()=>{const text=shareText(run,new URL('./',location.href).href);try{if(navigator.clipboard?.writeText)await navigator.clipboard.writeText(text);else{const area=document.createElement('textarea');area.value=text;area.style.cssText='position:fixed;left:-9999px';document.body.append(area);area.select();if(!document.execCommand('copy'))throw Error();area.remove();}put('share-status','已複製！貼去 WhatsApp、IG 或 Facebook，唔會劇透題目。');}catch{put('share-status','未能自動複製，請使用「分享畀朋友」或瀏覽器的分享功能。');}};
$('native-share').onclick=async()=>{try{await navigator.share({title:'香港百萬富翁',text:shareText(run,new URL('./',location.href).href)});}catch(error){if(error.name!=='AbortError')put('share-status','暫時未能分享，仍可複製成績。');}};
// Limit clipboard and image extraction only for the current challenge content.
// This is a browser deterrent; scoring and timing are still enforced by Firestore rules.
const protectedQuestionSelector='#question-title,#options,#visual-frame,#answer-dialog-title,#phone-hint,#audience-chart';
const challengeActive=()=>screen==='game'&&run&&run.phase!=='finished';
const protectedQuestionTarget=node=>(node instanceof Element?node:node?.parentElement)?.closest(protectedQuestionSelector);
function selectedQuestion(){
 const selection=window.getSelection();if(!selection||selection.isCollapsed)return false;
 const nodes=document.querySelectorAll(protectedQuestionSelector);
 for(let i=0;i<selection.rangeCount;i++)for(const node of nodes)if(selection.getRangeAt(i).intersectsNode(node))return true;
 return false;
}
for(const type of ['copy','cut'])document.addEventListener(type,event=>{
 if(!challengeActive()||event.target instanceof Element&&event.target.closest('input,textarea,[contenteditable="true"]'))return;
 if(protectedQuestionTarget(event.target)||selectedQuestion()){
  event.preventDefault();event.clipboardData?.clearData();
  announce('挑戰期間不能複製題目、選項或提示；完成後可回顧及分享。');
 }
},true);
for(const type of ['selectstart','contextmenu','dragstart'])document.addEventListener(type,event=>{
 if(challengeActive()&&protectedQuestionTarget(event.target))event.preventDefault();
},true);
document.addEventListener('keydown',event=>{if(document.querySelector('dialog[open]'))return;if(screen==='game'&&run?.phase==='playing'&&!busy&&!pending&&/^[1-4]$/.test(event.key)){event.preventDefault();$('options').children[Number(event.key)-1]?.click();}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden){if(blur&&run?.phase==='playing')blur.currentTime=Math.max(0,Date.now()-run.questionAt);tick();}});
window.addEventListener('storage',event=>{if(owner!=='guest'||!event.key?.startsWith('sky.hk-millionaire.today'))return;const value=ledger.read();if(value?.owner==='guest'){run=value.run;token=value.token;if(run.phase==='finished'&&screen==='game')page('result');render();}});
new ResizeObserver(()=>{if(screen==='game'&&run){visualKey='';renderVisual();}}).observe($('visual-frame'));

function rewardChanged(next){if(!next?.profile||!user||next.profile.uid!==user.uid)return;profile=next.profile;boardCache.clear();renderAccount();if(screen==='result'&&run)renderResult();}
collectionUI=installCollection({cloud,getUser:()=>user,getProfile:()=>profile,login:()=>dialog('account-dialog'),onChange:rewardChanged,onArcade:()=>arcadeUI.open()});
arcadeUI=installArcade({cloud,getUser:()=>user,getProfile:()=>profile,login:()=>dialog('account-dialog'),onShop:tab=>collectionUI.open(tab),onChange:rewardChanged,soundEnabled:()=>collectionUI.soundEnabled(),canStart:()=>!run||run.phase==='finished'});
for(const id of ['collection-open','lobby-collection','result-collection'])$(id).onclick=()=>{close('book-dialog');collectionUI.open();};
for(const id of ['arcade-open','lobby-arcade','result-arcade'])$(id).onclick=()=>{close('book-dialog');arcadeUI.open();};
$('download-result-card').onclick=async()=>{try{await downloadResultCard({run,name:owner==='guest'?'香港街坊':profile?.displayName??'香港街坊',wallet:owner==='guest'?null:collectionUI.wallet});put('share-status','分享卡已準備下載；不含題目及答案。');}catch{put('share-status','圖片未能產生，仍可複製成績。');}};

installIcons();
renderLadders();render();if(run?.phase==='playing'&&remaining(run)<=0)perform({type:'timeout'});initAuth();setInterval(tick,250);
