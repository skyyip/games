import {SKILLS,EFFECTS,equippedCompanion,createCompanionRun,useCompanion,companionBonus} from './companions.js';
import {CARDS,RARITIES,DRAW_COST,DUPLICATE_REFUND,purchaseDraw} from './gacha.js';
import {settleRun} from './settlement.js';
import {comicReveal,answerRecord,buildIncidentReport} from './comedy.js';
import {PICTURE_BANK} from './picture-questions.js';
import {BANK,AIR_BANK,MIXED_BANK,FACTIONS} from './questions.js';import {beep,setMuted,isMuted} from './audio.js';import {loadSave,save,setSaveScope,addCoins,addCard} from './storage.js';import {drawPoster,exportPoster} from './poster/poster.js';import {initCloud,getCloudUser,getCloudPlayerName,signInGoogle,signInEmail,signUpEmail,signInAnonymous,signOutGoogle,saveCloudProfile,saveCloudFavoriteCards,recordCloudRun,getCloudRuns,getLeaderboard,createChallenge,joinChallenge,submitChallengeResult,getChallenge} from './firebase/cloud.js';
const $=id=>document.getElementById(id);
// Explicit asset references survive the upload build's content-hashed filenames.
const iconSources={
 lightning:new URL('../assets/icons/lightning.png',import.meta.url).href,
 sneaker:new URL('../assets/icons/sneaker.png',import.meta.url).href,
 press:new URL('../assets/icons/press.png',import.meta.url).href,
 dog:new URL('../assets/icons/dog.png',import.meta.url).href,
 treat:new URL('../assets/icons/treat.png',import.meta.url).href,
 'paw-cup':new URL('../assets/icons/paw-cup.png',import.meta.url).href,
 pig:new URL('../assets/icons/pig.png',import.meta.url).href
};
const icon=(name,cls='ui-icon')=>`<img class="${cls}" src="${iconSources[name]}" alt="" aria-hidden="true">`;const questionIcons={'✨':'spark','🧠':'spark','⚡':'lightning','🐶':'dog','🐱':'cat','💅':'woman','🧢':'man','🫶':'duo'};const factionIllustrations={women:'woman',men:'man',dog:'dog',cat:'cat',duo:'duo'};const sceneArt={woman:[0,'她的心思','💅'],man:[1,'他的心思','🧢'],dog:[2,'狗狗心思','🐶'],cat:[3,'貓主子心思','🐱'],duo:[4,'雙人默契','🫶']};
const illustration=(name,picture=null)=>{
 const [slot,label,emoji]=picture?[picture.art,picture.title,'📷']:(sceneArt[name]||sceneArt.woman);
 const rows=picture?3:2;
 const src=picture?new URL('../assets/illustrations/picture-stories.webp',import.meta.url).href:new URL('../assets/illustrations/question-polaroids.webp',import.meta.url).href;
 return `<figure class="scene-polaroid${picture?' picture-polaroid':''}" data-scene="${name}" ${picture?'':'aria-hidden="true"'}><span class="scene-photo" ${picture?`role="group" aria-label="${picture.alt}"`:''}><img class="scene-illustration" src="${src}" style="left:-${slot%3*100}%;top:-${Math.floor(slot/3)*100}%;height:${rows*100}%" alt="" loading="eager" decoding="async" onerror="${picture?"this.closest('figure').querySelector('details')?.setAttribute('open','');":''}this.replaceWith(Object.assign(document.createElement('span'),{className:'scene-fallback',textContent:'${emoji}'}))"></span><figcaption>${label}</figcaption>${picture?`<details class="picture-description"><summary>圖片文字描述</summary><p>${picture.alt}</p></details>`:''}</figure>`;
};const screens=['home','game','result','collection'];let challengeId=new URLSearchParams(location.search).get('challenge'),challengeData=null,challengeSeed=null,challengeRunPending=false,challengeLoading=false,playerName='',playerNameUpdatedAt=0,playerNameModalOpen=false,pendingPlayerNamePrompt=false;let faction='women',mode='mixed',questions=[],questionCount=12,nextTimer=null,airScores=[0,0,0,0,0],classicCorrect=0,index=0,hp=100,correct=0,streak=0,hints=2,timer=30,tick=null,interactionTimer=null,interactionDone=false,interactionPenaltyApplied=false,answered=false,runId=0,lastResult=null,saveData=loadSave();
let runAnswers=[],runSettled=false,companionRun=null;

function seededShuffle(items,seed){let state=seed>>>0;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296};const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function show(name){screens.forEach(s=>$(s).classList.toggle('hidden',s!==name));window.scrollTo({top:0,behavior:'smooth'})}function shuffle(a){const out=[...a];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}function updateSaveUI(){saveData=loadSave();$('cardCount').textContent=saveData.cards.length;renderCompanionPreview()}
function persistFavoriteCards(cards){if(getCloudUser()&&!getCloudUser().isAnonymous)saveCloudFavoriteCards(cards).catch(error=>console.error('收藏同步失敗',error))}
function selectFaction(id){duoTestPhase=false;faction=id;document.querySelectorAll('.faction-card').forEach(b=>b.classList.toggle('selected',b.dataset.faction===id))}
let duoSetupQuestions=[],duoExpected=[],duoTestAnswers=[],duoTestPhase=false;
function startDuoSetup(){companionRun=null;renderCompanion();duoSetupQuestions=shuffle([...shuffle(BANK.duo).slice(0,4),PICTURE_BANK.duo[0]]);duoExpected=[];duoTestAnswers=[];duoTestPhase=false;$('game').classList.remove('duo-mode');$('modalContent').className='duo-flow';$('modal').showModal();renderDuoSetup(0)}
function renderDuoSetup(step){$('modal').scrollTop=0;const content=$('modalContent');content.className='duo-flow';if(step>=5){content.innerHTML=`<div class="duo-role-label">STEP 1 · 出題者</div><div class="duo-complete-icon">✓</div><h2>交接手機！</h2><p class="duo-lead">5 條題目的答案已經記錄。現在請把手機交給另一位玩家。</p><div class="duo-notice"><b>測試者請留意</b><span>不要向出題者詢問答案，接下來要猜的是「對方會怎樣選」。</span></div><button class="primary-btn duo-main-action" id="duoBeginTest">我已接過手機，開始作答 <span>→</span></button><p class="duo-footnote">測試期間不會顯示出題者的答案。</p>`;return}const q=duoSetupQuestions[step];content.innerHTML=`<div class="duo-flow-head"><span class="duo-role-label">STEP 1 · 出題者設定</span><span class="duo-step-count">${step+1} / 5</span></div><h2>你會怎樣選？</h2>${step===0?'<p class="duo-lead">先選自己的答案，再交給對方猜。</p>':''}<div class="duo-progress" aria-label="設定進度">${Array.from({length:5},(_,i)=>`<i class="${i<=step?'active':''}"></i>`).join('')}</div>${q.picture?illustration('duo',q.picture):''}<h3 class="duo-question-text">${q.text}</h3><div class="answers duo-setup-answers">${q.opts.map((o,i)=>`<button class="answer-btn" data-duo-expected="${i}"><span class="duo-option-letter">${String.fromCharCode(65+i)}</span><span>${o}</span></button>`).join('')}</div><p class="duo-footnote">選擇後會自動進入下一題，不能返回修改。</p>`; }
function beginDuoTest(){duoTestPhase=true;index=0;questionCount=5;duoTestAnswers=[];hp=100;correct=0;$('game').classList.add('duo-mode');show('game');renderQuestion()}
function renderDuoTestQuestion(){const q=duoSetupQuestions[index];answered=false;$('roundFaction').textContent='雙人互測';$('questionNo').textContent=String(index+1).padStart(2,'0');$('game').querySelector('.game-title h2 small').textContent=' / 5';$('hpValue').textContent='—';$('hpBar').style.width='100%';$('timer').parentElement.classList.add('hidden');$('questionTag').textContent='測試者作答 · 不設時限';$('questionVisual').classList.toggle('has-picture-question',!!q.picture);$('questionVisual').innerHTML=`${illustration('duo',q.picture)}`;$('questionText').textContent=q.text;$('questionHint').textContent='選出你認為「出題者本人」會選擇的答案。';$('answers').innerHTML='';q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='answer-btn';b.innerHTML=`<span class="duo-option-letter">${String.fromCharCode(65+i)}</span><span>${o}</span>`;b.addEventListener('click',()=>answerDuoTest(i));$('answers').append(b)});$('interaction').classList.add('hidden');$('pigHintBtn').classList.add('hidden');$('hintLeft').classList.add('hidden');$('runCoins').textContent='雙人互測';$('progressDots').innerHTML=Array.from({length:5},(_,i)=>`<i class="${i<index?'done':''}"></i>`).join('');$('progressDots').setAttribute('aria-valuenow',String(index));$('progressDots').setAttribute('aria-valuemax','5');$('progressDots').setAttribute('aria-label',`已完成 ${index} / 5 題`)}
function answerDuoTest(choice){if(answered)return;answered=true;duoTestAnswers.push(choice);[...$('answers').children].forEach((b,i)=>{b.disabled=true;if(i===choice)b.classList.add('duo-selected')});$('questionHint').textContent='✓ 已記錄你的選擇，答案會在最後一併揭曉。';nextTimer=setTimeout(()=>{index++;if(index>=5)finishDuoTest();else renderQuestion()},650)}
function finishDuoTest(){show('home');$('game').classList.remove('duo-mode');const rows=duoSetupQuestions.map((q,i)=>({q,expected:duoExpected[i],actual:duoTestAnswers[i],match:duoExpected[i]===duoTestAnswers[i]}));const score=rows.filter(r=>r.match).length;$('modalContent').className='duo-flow duo-results';$('modalContent').innerHTML=`<div class="duo-role-label">雙人互測 · 結果報告</div><p class="duo-kicker">你們的默契指數</p><div class="duo-score">${score}<small>/ 5</small></div><h2>${score===5?'心有靈犀！':score>=3?'有啲默契！':'答案完全兩個世界！'}</h2><p class="duo-lead">答中 ${score} 題，答案吻合度 <b>${score*20}%</b></p><div class="duo-result-list">${rows.map((r,i)=>`<article class="duo-result-row ${r.match?'is-match':'is-miss'}"><div class="duo-result-heading"><b>第 ${i+1} 題</b><strong>${r.match?'✓ 答案一致':'✕ 答案不同'}</strong></div><p>${r.q.text}</p><div class="duo-answer-compare"><div><small>出題者的答案</small><b>${String.fromCharCode(65+r.expected)}. ${r.q.opts[r.expected]}</b></div><div><small>測試者的猜測</small><b>${String.fromCharCode(65+r.actual)}. ${r.q.opts[r.actual]}</b></div></div></article>`).join('')}</div><button class="primary-btn duo-main-action" id="duoPlayAgain">再玩一次 <span>↻</span></button><button class="secondary-btn duo-secondary-action" id="duoCloseResult">完成</button>`;$('modal').showModal()}
function openModal(html){$('modalContent').className='';$('modalContent').innerHTML=html;$('modal').showModal()}function start(){if(faction==='duo'){startDuoSetup();return}$('game').classList.remove('duo-mode');if(challengeId&&!getCloudUser()){openModal('<h2>先登入才能接受挑戰</h2><p>使用 Google 登入後即可開始朋友邀請的挑戰。</p>');return}if(faction==='duo'&&saveData.runs<3&&!challengeRunPending)return;const pick=(pool,count,offset)=>{const ordered=challengeRunPending&&challengeSeed!=null?seededShuffle(pool,challengeSeed+offset):shuffle(pool);return ordered.slice(0,count)};const classic=[...pick(BANK[faction],3,11),...pick(PICTURE_BANK[faction],2,17)].map(q=>({...q,kind:'classic',legacyIndex:BANK[faction].indexOf(q)}));const air=pick(AIR_BANK[faction],4,23).map(q=>({...q,kind:'air'}));const hybrid=pick(MIXED_BANK[faction],3,37).map(q=>({...q,kind:'hybrid',correct:q.profiles.reduce((best,profile,i,all)=>profile.reduce((s,v)=>s+v,0)>all[best].reduce((s,v)=>s+v,0)?i:best,0)}));const pool=[...classic,...air,...hybrid];questions=challengeRunPending&&challengeSeed!=null?seededShuffle(pool,challengeSeed+53):shuffle(pool);questionCount=12;index=0;hp=100;correct=0;classicCorrect=0;runSettled=false;streak=0;hints=2;airScores=[0,0,0,0,0];runAnswers=[];runId=saveData.runs+1;companionRun=createCompanionRun(loadSave(),{enabled:!challengeId&&!challengeRunPending,scope:companionScope()});show('game');renderQuestion()}
function renderQuestion(){stopCompanionPause();resetComicReview();if(duoTestPhase){renderDuoTestQuestion();return}clearInterval(tick);clearTimeout(interactionTimer);clearTimeout(nextTimer);answered=false;interactionDone=false;interactionPenaltyApplied=false;timer=30;const q=questions[index];updateRewardPreview();$('roundFaction').textContent=FACTIONS[faction].name;$('questionNo').textContent=String(index+1).padStart(2,'0');$('game').querySelector('.game-title h2 small').textContent=` / ${questionCount}`;$('hpValue').textContent=hp;$('hpBar').style.width=hp+'%';$('hpBar').style.background=hp<=30?'#ef5350':hp<=60?'#ffe853':'#80d77c';$('timer').textContent='30.0';$('timer').parentElement.classList.remove('hidden');$('timer').classList.remove('danger');$('questionTag').textContent=q.picture?'圖片情境題':{classic:'經典求生',air:'閱讀空氣',hybrid:'混合情境'}[q.kind];$('questionVisual').classList.toggle('has-picture-question',!!q.picture);$('questionVisual').innerHTML=`${illustration(factionIllustrations[faction]||'woman',q.picture)}`;$('questionText').textContent=q.text;renderCompanion();$('questionHint').textContent='';$('answers').innerHTML='';q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='answer-btn';b.innerHTML=`<span class="answer-letter">${String.fromCharCode(65+i)}</span><span class="answer-copy">${escapeText(o)}</span>`;b.setAttribute('aria-label',`${String.fromCharCode(65+i)}. ${o}`);b.addEventListener('click',()=>answer(i));$('answers').append(b)});$('interaction').classList.add('hidden');$('hintLeft').textContent=`× ${hints}`;$('pigHintBtn').classList.toggle('hidden',q.kind!=='classic');$('hintLeft').classList.toggle('hidden',q.kind!=='classic');$('pigHintBtn').disabled=q.kind!=='classic'||hints<=0||hp<=5;$('progressDots').innerHTML=Array.from({length:questionCount},(_,i)=>`<i class="${i<index?'done':''}"></i>`).join('');$('progressDots').setAttribute('aria-valuenow',String(index));$('progressDots').setAttribute('aria-valuemax',String(questionCount));$('progressDots').setAttribute('aria-label',`已完成 ${index} / ${questionCount} 題`);if(q.kind==='classic')startInteraction(q.legacyIndex);else $('interaction').classList.add('hidden');tick=setInterval(()=>{if(companionRun?.pauseUntil){if(companionRun.scope===companionScope()&&performance.now()<companionRun.pauseUntil)return;stopCompanionPause()}timer=Math.max(0,timer-.1);$('timer').textContent=timer.toFixed(1);if(timer<=3){$('timer').classList.add('danger');if(Math.round(timer*10)%5===0)beep('tick')}if(timer<=0){clearInterval(tick);if(!answered){const previousHp=hp;hp=Math.max(0,hp-40);streak=0;beep('bad');feedback('時間到！−40 HP',previousHp);}}},100)}
function feedback(msg,previousHp=hp){answered=true;clearInterval(tick);clearTimeout(interactionTimer);$('questionHint').textContent=msg;document.querySelector('.question-card').classList.add('shake');setTimeout(()=>document.querySelector('.question-card')?.classList.remove('shake'),300);updateHP();showComicReview(null,false,previousHp)}
function answer(choice){if(duoTestPhase){answerDuoTest(choice);return}if(answered)return;answered=true;clearInterval(tick);clearTimeout(interactionTimer);const previousHp=hp,q=questions[index],buttons=[...$('answers').children];if(q.kind!=='classic'){answerAir(choice,q,buttons,previousHp);return;}if(choice===q.correct)classicCorrect++;if(!interactionDone&&!interactionPenaltyApplied&&q.legacyIndex===6&&(faction==='dog'||faction==='cat')){hp=Math.max(0,hp-8);interactionPenaltyApplied=true;$('questionHint').textContent='救援任務失敗！−8 HP';}buttons.forEach(b=>b.disabled=true);if(choice===q.correct){correct++;streak++;buttons[choice].style.background='#a8ef9b';beep('good');$('questionHint').textContent=`答對！${streak>1?`🔥 ${streak} 連擊！`:''} ${q.why}`}else{streak=0;const optionDamage=q.damageByOption?.[choice];const fatal=optionDamage===100;const damage=fatal?hp:typeof optionDamage==='number'?optionDamage:25+(index>=7?10:0);hp=Math.max(0,hp-damage);buttons[choice].style.background='#ffb4b4';buttons[q.correct].style.background='#a8ef9b';beep('bad');$('questionHint').textContent=`${fatal?'一擊必殺！':'答錯！'}−${damage} HP。${q.why} 豬隊友：我剛剛也是這樣選。`}updateHP();showComicReview(choice,choice===q.correct,previousHp)}
function answerAir(choice,q,buttons,previousHp){
  const profile=q.profiles[choice];profile.forEach((value,i)=>airScores[i]+=value);
  const rawQuality=profile.reduce((sum,value)=>sum+value,0);const quality=q.kind==='hybrid'&&choice!==q.correct?Math.min(rawQuality,11):q.kind==='hybrid'?Math.max(rawQuality,16):rawQuality;
  const damage=quality>=16?0:quality>=12?8:quality>=8?16:24;hp=Math.max(0,hp-damage);
  if(quality>=12){correct++;streak++;buttons[choice].style.background='#a8ef9b';beep('good');$('questionHint').textContent='判斷不錯！'+(streak>1?'🔥 '+streak+' 連擊！':'')+' '+q.why}
  else{streak=0;buttons[choice].style.background='#ffb4b4';beep('bad');$('questionHint').textContent='現場訊號未完全讀懂。−'+damage+' HP。'+q.why}
  buttons.forEach(b=>b.disabled=true);updateHP();showComicReview(choice,quality>=12,previousHp);
}
const escapeText=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function resetComicReview(){
  $('answerReview').hidden=true;
  $('questionVisual').classList.remove('is-reviewing');
}
function showComicReview(choice,success,previousHp){
  stopCompanionPause();renderCompanion();
  const q=questions[index],reveal=comicReveal(q,{choice,success,faction,run:runId});
  runAnswers.push(answerRecord(q,{round:index+1,choice,success,hpLost:Math.max(0,previousHp-hp)}));
  $('answers').querySelectorAll('button').forEach(button=>button.disabled=true);
  $('interaction').classList.add('hidden');$('pigHintBtn').disabled=true;
  const photo=$('questionVisual').querySelector('.scene-polaroid'),front=[...photo.children];
  const back=document.createElement('div');back.className='polaroid-back';
  back.innerHTML=`<h4>${escapeText(reveal.speaker)}</h4><p class="comic-said">嘴上說的：${escapeText(reveal.said)}</p><blockquote>${escapeText(reveal.thought)}</blockquote>`;
  photo.removeAttribute('aria-hidden');photo.append(back);$('questionVisual').classList.add('is-reviewing');
  const flip=document.createElement('button');flip.type='button';flip.className='photo-flip-btn';flip.id='photoFlipBtn';
  let isBack=true;
  const turn=()=>{front.forEach(node=>node.hidden=isBack);back.hidden=!isBack;photo.classList.toggle('is-back',isBack);flip.textContent=isBack?'↩ 翻回現場照片':'↪ 查看心聲字幕';flip.setAttribute('aria-pressed',String(isBack))};
  flip.onclick=()=>{isBack=!isBack;turn()};turn();$('questionVisual').append(flip);
  $('answerReview').hidden=false;
  const next=$('nextQuestionBtn');next.disabled=false;next.textContent=hp<=0||index+1>=questionCount?'查看本日事故報告 →':'下一題 →';
  next.onclick=()=>{if(!answered||next.disabled)return;next.disabled=true;if(hp<=0)finish();else nextQuestion()};
  $('reviewStatus').textContent=choice===null?'時間到，心聲已揭曉；按下一步繼續。':'心聲已揭曉；可翻回照片，再按下一步繼續。';
  $('questionVisual').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}
function incidentMarkup(report){
  const evidence=(record,best=false)=>record?`<article class="incident-evidence ${best?'is-best':''}" data-round="${record.round}"><h4>${best?'最佳操作':'主要事故'} · 第 ${record.round} 題</h4><p>${escapeText(best?record.best:record.incident)}</p><details><summary>翻查本題口供</summary><p>${escapeText(record.question)}</p><blockquote>我選了：${escapeText(record.choice)}</blockquote></details></article>`:`<article class="incident-evidence"><h4>${best?'最佳操作':'主要事故'}</h4><p>${best?'本局尚未錄得達標操作；下一局繼續累積求生經驗。':'本局暫未錄得判斷事故，字幕組準時收工。'}</p></article>`;
  return `<div class="incident-heading"><span>RELATIONSHIP SURVIVAL LAB</span><h3>本日求生事故報告</h3><strong class="incident-badge">現場稱號：${escapeText(report.title)}</strong><p>${report.summary}</p></div>${evidence(report.incident)}${evidence(report.best,true)}<p class="incident-footnote">口供來自本局實際選擇 · 稱號純屬娛樂 · 已收錄於分享海報</p>`;
}
function nextQuestion(){index++;if(index>=questionCount)finish();else{renderQuestion();$('questionVisual').scrollIntoView({block:'start',behavior:'auto'})}}
function startInteraction(i){const host=$('interaction');host.classList.remove('hidden');if(i===5){host.innerHTML=`${illustration(factionIllustrations[faction]||'woman')}<h4>${icon('sneaker')} 逃跑選項</h4><p>抓緊時機點選</p>`;const b=[...$('answers').children][Math.min(2,$('answers').children.length-1)];b.classList.add('runaway-answer');let tries=0;b.addEventListener('pointerenter',()=>{if(tries++<5){b.style.transform=`translate(${Math.random()*110-55}px,${Math.random()*70-35}px)`;beep('click')}});b.addEventListener('focus',()=>b.style.transform='none')}else if(i===6&&faction==='dog'){host.innerHTML=`${illustration('dog')}<h4>${icon('dog')} 肉泥救援</h4><p>3 秒內出手</p><button class="tap-button" id="treatBtn">${icon('treat')} 遞上肉泥</button>`;let done=false;$('treatBtn').onclick=()=>{if(!done){done=true;interactionDone=true;$('questionHint').textContent='成功分散注意力！本題互動已完成。';beep('good')}};interactionTimer=setTimeout(()=>{if(!done){done=true;host.innerHTML+='<p>肉泥來不及了！</p>';hp=Math.max(0,hp-8);interactionPenaltyApplied=true;updateHP()}},3000)}else if(i===6&&faction==='cat'){host.innerHTML=`${illustration('cat')}<h4>${icon('paw-cup')} 貓掌突襲</h4><p>3 秒內保住杯子</p><button class="tap-button" id="cupBtn">${icon('paw-cup')} 保護杯子！</button>`;let done=false;$('cupBtn').onclick=()=>{if(!done){done=true;interactionDone=true;beep('good');$('questionHint').textContent='杯子保住了！求生欲認證成功。'}};interactionTimer=setTimeout(()=>{if(!done){done=true;hp=Math.max(0,hp-8);interactionPenaltyApplied=true;updateHP();host.innerHTML+='<p>杯子已經落地了……−8 HP</p>'}},3000)}else{host.innerHTML=`<h4>${icon('pig')} 豬隊友觀察中</h4><p>保持冷靜，讀完題目再作答。你可以隨時選擇答案。</p>`;host.classList.add('hidden')}}
function updateRewardPreview(){if(!duoTestPhase)$('runCoins').textContent=`預計 ${settleRun(hp,faction,eligibleCompanion()).coins} SC`}
function updateHP(){$('hpValue').textContent=hp;$('hpBar').style.width=hp+'%';updateRewardPreview()}

function useHint(){if(questions[index]?.kind!=='classic'||hints<=0||hp<=5||answered)return;hints--;hp=Math.max(0,hp-5);updateHP();$('hintLeft').textContent=`× ${hints}`;$('pigHintBtn').disabled=hints<=0||hp<=5;const q=questions[index],wrong=q.opts.map((_,i)=>i).filter(i=>i!==q.correct);const misleading=wrong[Math.floor(Math.random()*wrong.length)];$('questionHint').innerHTML=`${icon('pig','ui-icon tiny-icon')} 豬隊友：「我覺得選 ${String.fromCharCode(65+misleading)} 啦！我通常都很準……大概。」（−5 HP）`;beep('bad')}
async function finish(){if(runSettled)return;runSettled=true;clearInterval(tick);clearTimeout(interactionTimer);clearTimeout(nextTimer);const settlement=settleRun(hp,faction,eligibleCompanion()),assisted=Boolean(companionRun?.used),{survived,title,quote}=settlement,total=settlement.coins;const dimensionNames=['觀察力','同理心','角色理解','洞察力','時機感'];const dimensions=airScores.map((score,i)=>({name:dimensionNames[i],score:Math.round(score/(7*4)*100)}));const airAverage=Math.round(dimensions.reduce((sum,item)=>sum+item.score,0)/dimensions.length);const understandingScore=Math.round(classicCorrect/5*100);saveData=loadSave();saveData.coins+=total;saveData.runs++;saveData.bestHp=Math.max(saveData.bestHp,hp);save(saveData);const incidentReport=buildIncidentReport(runAnswers,{faction,questionCount});lastResult={settlement,assisted,incidentReport,faction,mode:'mixed',questionCount,dimensions,airAverage,understandingScore,survived,hp,coins:total,correct,title,quote,run:saveData.runs};$('resultTitle').textContent=title;$('resultSubtitle').textContent=quote;$('resultCertification').hidden=!settlement.certification;$('resultCertification').textContent=settlement.certification?`認證：${settlement.certification}`:'';$('rewardBreakdown').innerHTML=survived?`<div><span>基礎通關獎勵</span><b>100 SC</b></div><div><span>剩餘血量加成 · ${hp} HP × 2</span><b>${settlement.hpBonus} SC</b></div>${settlement.companionReward?`<div><span>${escapeText(companionRun.card.name)} · 收工津貼</span><b>20 SC</b></div>`:''}<div class="reward-total"><span>本局獲得</span><b>${total} SC</b></div>`:'<div><span>陣亡撫恤金 · 醫藥費</span><b>10 SC</b></div><p>血量歸零，通關獎勵及血量加成不適用。</p>';if(assisted||settlement.companionReward){const note=document.createElement('div');note.className='companion-result';note.textContent=settlement.companionReward?companionRun.card.quip:'隊友助陣 · 本局不計入公開排行榜';if(settlement.companionReward){const scene=document.createElement('div');scene.className='companion-payday';scene.setAttribute('aria-hidden','true');scene.innerHTML=`${cardArt(companionRun.card,'')}<span class="payday-coins"><i>SC</i><i>SC</i><i>SC</i></span><span class="payday-coupon">優惠券<b>已過期</b></span>`;note.prepend(scene)};$('rewardBreakdown').append(note)}$('resultCorrect').previousElementSibling.textContent='TOTAL READS';$('resultHp').textContent=hp;$('resultCoins').textContent=`${total} SC`;$('resultCorrect').textContent=`${correct} / ${questionCount}`;$('resultQuote').textContent=incidentReport.verdict;$('incidentReport').innerHTML=incidentMarkup(incidentReport);$('airReport').classList.remove('hidden');$('airReport').innerHTML=`<div class="air-report-head"><strong>雙重求生能力分析</strong><b>${Math.round((understandingScore+airAverage)/2)}<small> / 100</small></b></div><div class="air-score-row"><span>了解對方</span><div class="air-score-track"><i style="width:${understandingScore}%"></i></div><b>${understandingScore}</b></div><div class="air-score-row"><span>讀懂氣氛</span><div class="air-score-track"><i style="width:${airAverage}%"></i></div><b>${airAverage}</b></div>${dimensions.map(item=>`<div class="air-score-row"><span>${item.name}</span><div class="air-score-track"><i style="width:${item.score}%"></i></div><b>${item.score}</b></div>`).join('')}<p>3 題經典與 2 題圖片情境考驗你對對方的日常理解；另外 7 題情境題分析你如何觀察線索、理解情緒及選擇時機。</p>`;await drawPoster(lastResult,$('posterPreview'));beep(survived?'win':'lose');updateSaveUI();show('result');if(getCloudUser()){recordCloudRun(lastResult,{leaderboard:!assisted}).catch(console.error);if(challengeId&&challengeRunPending){submitChallengeResult(challengeId,lastResult).catch(e=>openModal(`<h2>挑戰結果同步失敗</h2><p>${e.message}</p>`));challengeRunPending=false}}}
async function download(){if(!lastResult)return;await document.fonts?.ready;const blob=await exportPoster($('posterPreview'));if(!blob){openModal('<h2>匯出失敗</h2><p>你的瀏覽器暫時無法匯出圖片，請嘗試重新載入。</p>');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`survival-report-${lastResult.run}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}async function share(){if(!lastResult)return;await document.fonts?.ready;const blob=await exportPoster($('posterPreview'));if(!blob){openModal('<h2>匯出失敗</h2><p>你的瀏覽器暫時無法匯出圖片，請嘗試重新載入。</p>');return}const file=new File([blob],`survival-report-${lastResult.run}.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({title:'我的求生事故報告',text:`我獲得「${lastResult.title}」，本局 ${lastResult.coins} SC。${lastResult.incidentReport.summary}。你敢挑戰嗎？`,files:[file]})}catch(e){if(e.name!=='AbortError')download()}}else download()}

async function makeChallenge(){
  try{
    if(!getCloudUser()){openModal('<h2>先登入 Google</h2><p>登入後即可建立專屬邀請連結。</p>');return}
    const invite=await createChallenge(faction);challengeId=invite.id;challengeSeed=invite.seed;challengeRunPending=true;
    history.replaceState(null,'',invite.url);
    openModal(`<h2>好友挑戰已建立</h2><p>分享這條連結，朋友可用相同題目順序完成挑戰：</p><p class="invite-url">${invite.url}</p><button class="primary-btn" id="copyInvite">複製邀請連結</button>`);
    $('copyInvite').onclick=()=>navigator.clipboard.writeText(invite.url).then(()=>$('copyInvite').textContent='已複製！');
  }catch(e){openModal(`<h2>建立失敗</h2><p>${e.message}</p>`)}
}
async function acceptChallenge(){
  try{
    challengeData=await joinChallenge(challengeId);faction=challengeData.faction;challengeSeed=challengeData.seed;challengeRunPending=true;
    document.querySelectorAll('.faction-card').forEach(b=>b.classList.toggle('selected',b.dataset.faction===faction));
    openModal(`<h2>收到好友挑戰！</h2><p>${challengeData.ownerName} 邀請你挑戰「${FACTIONS[faction].name}」。</p><button class="primary-btn" id="beginChallenge">接受並開始</button>`);
    $('beginChallenge').onclick=()=>{$('modal').close();start()};
  }catch(e){openModal(`<h2>無法接受挑戰</h2><p>${e.message}</p>`)}
}
async function showHistory(){
  if(!getCloudUser()){openModal('<h2>請先 Google 登入</h2><p>登入後即可查看跨裝置同步的歷史戰績。</p>');return}
  try{
    const rows=await getCloudRuns();
    const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const content=rows.length?'<div class="score-list history-list">'+rows.map(r=>`<article class="score-row history-row"><div class="score-main"><strong>${safe(FACTIONS[r.faction]?.name||r.faction)} · ${r.mode==='mixed'?'雙重求生':r.mode==='air'?'閱讀空氣':'經典求生'}</strong><small>${safe(r.createdAt||'時間未提供')}</small></div><div class="score-metrics"><span><small>達標</small><b>${Number(r.correct)||0}/${Number(r.questionCount)||12}</b></span><span><small>剩餘 HP</small><b>${Number(r.hp)||0}</b></span><span><small>求生幣</small><b>${Number(r.coins)||0} SC</b></span></div><span class="score-status ${r.survived?'is-survived':'is-failed'}">${r.survived?'成功生還':'挑戰失敗'}</span></article>`).join('')+'</div>':'<p class="score-empty">尚無雲端戰績，完成一場挑戰後就會出現在這裡。</p>';
    openModal(`<h2>我的戰績</h2><p class="score-intro">最近 30 場雲端同步紀錄</p>${content}`);
  }catch(e){openModal(`<h2>讀取失敗</h2><p>${e.message}</p>`)}
}
async function showLeaderboard(selected=faction){
  const render=async active=>{
    const rows=await getLeaderboard(active);
    const content=rows.length?'<div class="score-list leaderboard-list" role="table" aria-label="陣營排行榜"><div class="leaderboard-head" role="row"><span role="columnheader">名次</span><span role="columnheader">玩家名稱</span><span role="columnheader">最高 HP</span><span role="columnheader">答對題數</span></div>'+rows.map((r,i)=>`<article class="leaderboard-row ${i<3?'top-rank':''}" role="row"><b class="rank-number" role="cell">${i+1}</b><strong class="leader-name" role="cell">${safe(r.displayName||'玩家')}</strong><b class="leader-hp" role="cell">${Number(r.bestHp)||0}<small> HP</small></b><b class="leader-correct" role="cell">${Number(r.bestCorrect)||0}<small>/12</small></b></article>`).join('')+'</div>':'<p class="score-empty">這個陣營暫時沒有上榜玩家，完成一場挑戰即可登榜。</p>';
    $('leaderboardContent').innerHTML=content;
    document.querySelectorAll('[data-leaderboard-faction]').forEach(button=>{
      button.classList.toggle('active',button.dataset.leaderboardFaction===active);
      button.setAttribute('aria-pressed',String(button.dataset.leaderboardFaction===active));
    });
  };
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  openModal(`<h2>陣營排行榜 TOP 50</h2><p class="score-intro">各陣營獨立排名，先比較最高剩餘 HP，再比較答對題數。每個陣營獨立計算；此榜單為玩家自評紀錄。</p><div class="leaderboard-faction-tabs" role="group" aria-label="選擇排行榜陣營">${Object.entries(FACTIONS).map(([id,item])=>`<button type="button" class="leaderboard-faction-tab" data-leaderboard-faction="${id}" aria-pressed="false">${safe(item.name)}</button>`).join('')}</div><div id="leaderboardContent" aria-live="polite"><p class="score-empty">排行榜載入中…</p></div>`);
  document.querySelectorAll('[data-leaderboard-faction]').forEach(button=>{
    button.onclick=()=>render(button.dataset.leaderboardFaction).catch(e=>{
      $('leaderboardContent').innerHTML=`<p class="score-empty">排行榜暫時無法讀取：${safe(e.message)}</p>`;
    });
  });
  try{await render(selected)}catch(e){$('leaderboardContent').innerHTML=`<p class="score-empty">排行榜暫時無法讀取：${safe(e.message)}</p>`}
}
async function showChallengeStatus(){
  if(!getCloudUser()){openModal('<h2>請先 Google 登入</h2><p>登入後才能查看好友挑戰成績。</p>');return}
  if(!challengeId){openModal('<h2>尚未建立好友挑戰</h2><p>先建立邀請連結並完成自己的挑戰。</p>');return}
  try{const d=await getChallenge(challengeId);if(!d){openModal('<h2>找不到挑戰</h2><p>邀請可能已失效。</p>');return}
    const score=r=>r?`${r.hp} HP · ${r.correct}/12 題答對 · ${r.survived?'生還':'未生還'}`:'尚未完成';
    openModal(`<h2>好友挑戰結果</h2><p>${d.ownerName}：${score(d.ownerResult)}</p><p>${d.guestName||'受邀玩家'}：${score(d.guestResult)}</p><p>${d.status==='completed'?'雙方已完成，可以比較成績。':'等待另一位玩家完成挑戰。'}</p>`);
  }catch(e){openModal(`<h2>讀取失敗</h2><p>${e.message}</p>`)}
}
function clearChallengeUrl(){
  const url=new URL(location.href);
  url.searchParams.delete('challenge');
  history.replaceState(null,'',url);
}
async function loadChallengeContext(){
  if(challengeLoading||!challengeId)return;
  challengeLoading=true;
  try{
    const d=await getChallenge(challengeId);
    if(d&&[d.ownerUid,d.guestUid].includes(getCloudUser().uid)){
      challengeData=d;faction=d.faction;challengeSeed=d.seed;
      challengeRunPending=d.ownerUid===getCloudUser().uid?!d.ownerResult:!d.guestResult;
      document.querySelectorAll('.faction-card').forEach(b=>b.classList.toggle('selected',b.dataset.faction===faction));
      clearChallengeUrl();
      if(challengeRunPending){openModal(`<h2>好友挑戰已載入</h2><p>與 ${d.ownerName} 進行相同題目挑戰。</p><button class="primary-btn" id="resumeChallenge">開始挑戰</button>`);$('resumeChallenge').onclick=()=>{$('modal').close();start()}}
      return;
    }
    await acceptChallenge();
    if(challengeData)clearChallengeUrl();
  }catch(e){openModal(`<h2>無法載入挑戰</h2><p>${e.message}</p>`)}
  finally{challengeLoading=false}
}

function updatePlayerNameUI(){
  const button=$('playerNameBtn'),user=getCloudUser();
  button.hidden=!(user&&!user.isAnonymous);
  button.textContent=playerName?`玩家：${playerName}`:'設定玩家名稱';
  const nextChangeAt=playerNameUpdatedAt+90*24*60*60*1000;
  button.title=playerName?(playerNameUpdatedAt&&Date.now()<nextChangeAt? `玩家名稱：${playerName}（${new Date(nextChangeAt).toLocaleDateString('zh-HK')} 後可更改）`:`玩家名稱：${playerName}（點擊修改）`):'設定你的玩家名稱';
}
function showPlayerNameModal(){
  if(!getCloudUser()||playerNameModalOpen)return;
  if($('modal').open&&$('emailAuthForm'))return;
  const nextChangeAt=playerNameUpdatedAt+90*24*60*60*1000;
  if(playerName&&playerNameUpdatedAt&&Date.now()<nextChangeAt){
    openModal(`<h2>玩家名稱暫不可更改</h2><p>玩家名稱每 90 日只可更改一次。</p><p>下次可更改日期：<b>${new Date(nextChangeAt).toLocaleDateString('zh-HK')}</b></p>`);
    return;
  }
  playerNameModalOpen=true;
  openModal(`<h2>設定玩家名稱</h2>
    <p>選一個遊戲內顯示的名稱，會用於你的玩家標記、排行榜及好友挑戰。</p>
    <form id="playerNameForm" class="auth-form">
      <label for="playerNameInput">玩家名稱</label>
      <input id="playerNameInput" name="playerName" type="text" maxlength="20" autocomplete="nickname" required placeholder="例如：港島求生王">
      <button class="primary-btn" type="submit">儲存玩家名稱</button>
      <p class="auth-feedback" id="playerNameFeedback" role="status" aria-live="polite"></p>
    </form>`);
  $('playerNameInput').value=playerName;
  $('playerNameForm').addEventListener('submit',async event=>{
    event.preventDefault();
    const name=$('playerNameInput').value.trim(),feedback=$('playerNameFeedback');
    if(!name||name.length>20){feedback.textContent='請輸入 1 至 20 個字元的名稱。';return}
    const submit=$('playerNameForm').querySelector('button[type="submit"]');
    submit.disabled=true;feedback.textContent='儲存中…';
    try{
      await saveCloudProfile({playerName:name});
      playerName=name;playerNameUpdatedAt=Date.now();updatePlayerNameUI();
      const user=getCloudUser();
      $('authBtn').textContent=user?(user.isAnonymous?'訪客 · 升級':`登出 · ${playerName.slice(0,8)}`):'登入';
      $('modal').close();playerNameModalOpen=false;
    }catch(error){feedback.textContent=`儲存失敗：${error.message||'請稍後再試。'}`;submit.disabled=false}
  });
}
function showAuthModal(){
  openModal(`<h2>登入／建立帳戶</h2>
    <p>選擇登入方式。訪客模式可先玩遊戲，之後可用 Email 註冊並保留訪客帳戶資料。</p>
    <form id="emailAuthForm" class="auth-form">
      <label for="authEmail">Email</label>
      <input id="authEmail" name="email" type="email" autocomplete="email" required placeholder="name@example.com">
      <label for="authPassword">密碼</label>
      <input id="authPassword" name="password" type="password" autocomplete="current-password" minlength="6" required placeholder="至少 6 個字元">
      <div class="auth-actions">
        <button class="primary-btn" type="submit" data-auth-mode="signin">Email 登入</button>
        <button class="secondary-btn" type="button" id="emailSignUp">建立 Email 帳戶</button>
      </div>
    </form>
    <div class="auth-divider">或使用其他方式</div>
    <button class="secondary-btn auth-wide" type="button" id="googleSignIn">Google 登入</button>
    <button class="secondary-btn auth-wide" type="button" id="anonymousSignIn">以訪客身分繼續</button>
    ${getCloudUser()?.isAnonymous?'<button class="text-btn auth-wide" type="button" id="anonymousSignOut">登出訪客帳戶</button>':''}
    <p class="auth-feedback" id="authFeedback" role="status" aria-live="polite"></p>`);
  const email=()=>$('authEmail').value.trim(),password=()=>$('authPassword').value;
  const run=async action=>{
    const feedback=$('authFeedback');feedback.textContent='處理中…';
    const controls=[...$('emailAuthForm').querySelectorAll('button'),$('googleSignIn'),$('anonymousSignIn')].filter(Boolean);
    controls.forEach(button=>button.disabled=true);
    try{await action();$('modal').close();if(pendingPlayerNamePrompt){pendingPlayerNamePrompt=false;if(getCloudUser()&&!playerName)showPlayerNameModal()}}
    catch(error){
      const messages={
        'auth/invalid-email':'Email 格式不正確。','auth/invalid-credential':'Email 或密碼不正確。',
        'auth/wrong-password':'Email 或密碼不正確。','auth/user-not-found':'找不到這個 Email 帳戶。',
        'auth/email-already-in-use':'這個 Email 已註冊，請直接登入。','auth/weak-password':'密碼至少需要 6 個字元。',
        'auth/operation-not-allowed':'Firebase Console 尚未啟用此登入方式。',
        'auth/unauthorized-domain':'目前網站網域未加入 Firebase Authentication 的授權網域。',
        'auth/popup-blocked':'瀏覽器封鎖了登入視窗，請允許彈出視窗後重試。',
        'auth/popup-closed-by-user':'登入視窗已關閉，尚未完成登入。',
        'auth/cancelled-popup-request':'登入程序已被取消，請重新嘗試。',
        'auth/web-storage-unsupported':'瀏覽器封鎖了登入所需的儲存功能，請允許網站使用 Cookie／網站資料。',
        'auth/credential-already-in-use':'這個 Google 帳戶已綁定其他玩家帳戶；請先登出目前帳戶再登入。',
        'auth/account-exists-with-different-credential':'此 Email 已使用其他登入方式註冊，請先使用原登入方式。',
        'auth/provider-already-linked':'此帳戶已綁定 Google。',
        'auth/network-request-failed':'網路連線失敗，請稍後再試。'
      };
      feedback.textContent=messages[error.code]||`登入失敗：${error.message||'請稍後再試。'}`;
      controls.forEach(button=>button.disabled=false);
    }
  };
  $('emailAuthForm').addEventListener('submit',e=>{e.preventDefault();if($('emailAuthForm').reportValidity())run(()=>signInEmail(email(),password()))});
  $('emailSignUp').onclick=()=>{if($('emailAuthForm').reportValidity())run(()=>signUpEmail(email(),password()))};
  $('googleSignIn').onclick=()=>run(signInGoogle);
  $('anonymousSignIn').onclick=()=>run(signInAnonymous);
  if($('anonymousSignOut'))$('anonymousSignOut').onclick=()=>run(signOutGoogle);
}
let drawing=false;
function cardArt(card,label,large=false){
  const columns=4,rows=card.atlas==='bonus'?2:card.atlas?4:3,x=card.art%columns*100/(columns-1),y=Math.floor(card.art/columns)*100/(rows-1);
  return `<figure class="flash-card-polaroid rarity-${card.rarity.toLowerCase()}${card.rarity==='SSR'?' holo-card':''}${large?' flash-card-polaroid-large':''}" ${card.rarity==='SSR'?'tabindex="0"':''}><div class="flash-card-art${card.atlas==='metro'?' metro-card-art':card.atlas==='bonus'?' bonus-card-art':card.atlas==='weekend'?' weekend-card-art':card.atlas==='festival'?' festival-card-art':card.atlas==='life'?' life-card-art':card.atlas==='pets'?' pet-card-art':card.atlas==='new'?' new-card-art':''}" role="img" aria-label="${escapeText(label)}" style="--art-x:${x}%;--art-y:${y}%"></div><figcaption>${escapeText(label)}</figcaption></figure>`;
}
function followHologram(root){
  root.onpointermove=root.onpointerdown=event=>{
    const card=event.target.closest('.holo-card');if(!card||card.closest('.locked')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const rect=card.getBoundingClientRect(),x=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width)),y=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
    card.style.setProperty('--light-x',`${x*100}%`);card.style.setProperty('--light-y',`${y*100}%`);card.style.setProperty('--rx',`${(y-.5)*-12}deg`);card.style.setProperty('--ry',`${(x-.5)*12}deg`);
  };
  root.onpointerout=root.onpointercancel=event=>{const card=event.target.closest('.holo-card');if(card&&!card.contains(event.relatedTarget)){card.style.removeProperty('--rx');card.style.removeProperty('--ry');card.style.removeProperty('--light-x');card.style.removeProperty('--light-y')}};
}

function companionScope(){const user=getCloudUser();return user&&!user.isAnonymous?user.uid:'guest'}
function eligibleCompanion(){return companionBonus(companionRun,hp,companionScope())?companionRun.card:null}
function stopCompanionPause(){if(companionRun)companionRun.pauseUntil=0;$('companionBar').classList.remove('is-paused');$('timer').removeAttribute('aria-label');if(companionRun?.used)renderCompanion()}
function renderCompanionPreview(){
 const card=equippedCompanion(saveData);
 $('companionPortrait').hidden=!card;
 $('companionPortrait').innerHTML=card?cardArt(card,''):'';
 $('companionPortrait').querySelector('[tabindex]')?.removeAttribute('tabindex');
 $('equippedName').textContent=card?.name||'獨自求生';
 $('companionName').textContent=card?.skillName||'求生隊友';
 $('companionEffect').textContent=card?EFFECTS[card.kind].description:'前往求生收藏冊，選一位隊友';
}
function renderCompanion(){
 const run=companionRun,bar=$('companionBar');bar.hidden=!run||duoTestPhase||run.card.kind==='bonus';
 if(bar.hidden)return;
 const card=run.card,valid=run.scope===companionScope();
 const button=$('companionUse');button.hidden=card.kind==='bonus';button.disabled=answered||runSettled||run.used||!valid;
 button.textContent=run.used?'已出手':`${card.skillName} · 使用`;
 $('companionLine').textContent=!valid?'帳戶已切換，本局隊友休息。':run.used?(run.pauseUntil>performance.now()?'倒數暫停中 · ':'')+card.quip:'';
}
function activateCompanion(){
 const q=questions[index];
 if(duoTestPhase||challengeId||challengeRunPending||!q||!useCompanion(companionRun,{scope:companionScope(),answered,settled:runSettled,now:performance.now(),clue:q.clue}))return;
 const {card}=companionRun;
 if(card.kind==='clue'){
  const at=q.text.indexOf(q.clue),mark=document.createElement('mark');mark.className='companion-clue';mark.textContent=q.clue;
  $('questionText').replaceChildren(document.createTextNode(q.text.slice(0,at)),mark,document.createTextNode(q.text.slice(at+q.clue.length)));
 }else{
  $('companionBar').classList.add('is-paused');$('timer').setAttribute('aria-label','題目倒數暫停五秒');
 }
 renderCompanion();beep('good');
}
function equipCompanion(id){
 const data=loadSave();data.equippedCard=id;
 if(id&&!equippedCompanion(data))return;
 save(data);
 if(loadSave().equippedCard!==id){$('companionSaveStatus').textContent='未能儲存隊友，請允許網站儲存資料後再試。';return}
 renderCollection();$('companionSaveStatus').textContent=id?`${equippedCompanion(data).name}已就位，下局出戰。`:'下局獨自求生。';
}

function renderCollection(){
  saveData=loadSave();const owns=card=>saveData.cards.includes(card.id)||saveData.cards.includes(card.name);
  const starters=CARDS.filter(card=>['w_1','m_1'].includes(card.id)&&!owns(card));
  if(starters.length){saveData.cards.push(...starters.map(card=>card.id));save(saveData);persistFavoriteCards(saveData.cards)}
  updateSaveUI();const companion=equippedCompanion(saveData);$('collectionCompanion').textContent=companion?`下局隊友 · ${companion.name}`:'下局獨自求生';$('unequipCompanion').disabled=!companion;$('collectionCoins').textContent=`${saveData.coins} SC`;
  $('collectionCount').textContent=`已收藏 ${CARDS.filter(owns).length} / ${CARDS.length} 張`;
  $('gachaDraw').disabled=drawing||saveData.coins<DRAW_COST;
  $('gachaDraw').setAttribute('aria-label',drawing?'開盲盒中，請稍候':`花費 ${DRAW_COST} SC 抽一張閃卡`);
  $('gachaPrice').textContent=drawing?'開盲盒中…':`${DRAW_COST} SC / 每抽`;
  $('gachaDraw').onclick=drawGacha;
  $('collectionGrid').replaceChildren();
  const rarityOrder=RARITIES.map(tier=>tier.id);
  for(const [factionId,prefix] of [['women','w_'],['men','m_'],['dog','d_'],['cat','c_']]){
    const cards=CARDS.filter(card=>card.id.startsWith(prefix)).sort((a,b)=>rarityOrder.indexOf(a.rarity)-rarityOrder.indexOf(b.rarity));
    const group=document.createElement('section');group.className=`collection-faction faction-${factionId}`;group.dataset.cardFaction=factionId;group.setAttribute('aria-labelledby',`collection-${factionId}`);
    group.innerHTML=`<div class="collection-faction-heading"><h3 id="collection-${factionId}">${FACTIONS[factionId].name}</h3><span aria-label="已收藏 ${cards.filter(owns).length} 張，共 ${cards.length} 張">${cards.filter(owns).length} / ${cards.length}</span></div><div class="collection-grid"></div>`;
    for(const card of cards){
      const has=owns(card),item=document.createElement('article');item.className=`collect-card rarity-${card.rarity.toLowerCase()} ${has?'':'locked'}`;item.dataset.card=card.id;
      item.innerHTML=`<span class="rarity">${card.rarity}</span>${cardArt(card,has?card.name:'未解鎖')}${has?`<small>${card.desc}</small><div class="card-skill"><strong>${SKILLS[card.id].name}</strong><small>${EFFECTS[SKILLS[card.id].kind].description}</small></div><button type="button" class="secondary-btn equip-companion" aria-pressed="${companion?.id===card.id}" data-equip="${card.id}">${companion?.id===card.id?'已就位':'下局出戰'}</button>`:''}`;
      if(!has)item.querySelector('.holo-card')?.removeAttribute('tabindex');
      group.querySelector('.collection-grid').append(item);
    }
    $('collectionGrid').append(group);
  }
  followHologram($('collectionGrid'));
}
function showCollection(){renderCollection();if(!drawing)$('gachaStatus').textContent=saveData.coins<DRAW_COST?'求生幣不足 100 SC':'';show('collection')}
function drawGacha(){
  if(drawing)return;
  const outcome=purchaseDraw(loadSave());if(!outcome){renderCollection();$('gachaStatus').textContent='求生幣不足 100 SC，暫時不能抽卡。';return}
  const scope=getCloudUser()?.uid||'guest';drawing=true;
  // Debit and ownership are committed together before the cosmetic animation.
  save(outcome.save);const stored=loadSave();
  if(stored.coins!==outcome.save.coins||JSON.stringify(stored.cards)!==JSON.stringify(outcome.save.cards)){
    drawing=false;$('gachaStatus').textContent='未能儲存抽卡結果，請允許網站儲存資料後再試。';renderCollection();return;
  }
  persistFavoriteCards(outcome.save.cards);updateSaveUI();$('collectionCoins').textContent=`${outcome.save.coins} SC`;
  $('gachaDraw').disabled=true;$('gachaDraw').setAttribute('aria-label','開盲盒中，請稍候');$('gachaPrice').textContent='開盲盒中…';$('gachaMachine').setAttribute('aria-busy','true');$('gachaMachine').classList.add('is-drawing');
  $('gachaStatus').textContent='';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced&&!isMuted())navigator.vibrate?.([60,30,90]);beep('click');
  setTimeout(()=>{
    drawing=false;$('gachaMachine').classList.remove('is-drawing');$('gachaMachine').setAttribute('aria-busy','false');
    if((getCloudUser()?.uid||'guest')!==scope){$('gachaDraw').disabled=loadSave().coins<DRAW_COST;$('gachaPrice').textContent=`${DRAW_COST} SC / 每抽`;return;}
    if(!$('collection').classList.contains('hidden')){
      renderCollection();const {card,duplicate}=outcome;
      $('gachaStatus').textContent='';
      openModal(`<section class="gacha-result rarity-${card.rarity.toLowerCase()}"><h2>${duplicate?'重複閃卡！':card.rarity+' 閃卡入手！'}</h2>${cardArt(card,card.name,true)}<p>${card.desc}</p><p class="card-skill"><strong>${SKILLS[card.id].name}</strong><small>${EFFECTS[SKILLS[card.id].kind].description}</small></p><p class="gacha-receipt">花費 ${DRAW_COST} SC${duplicate?` · 重複回收 ${DUPLICATE_REFUND} SC`:''}</p><button type="button" class="primary-btn" id="keepGachaCard">收進收藏冊 →</button></section>`);
      $('keepGachaCard').onclick=()=>$('modal').close();followHologram($('modalContent'));beep(card.rarity==='SSR'?'win':'good');
    }
  },reduced?0:1250);
}

$('companionPicker').onclick=event=>{event.preventDefault();showCollection()};$('companionUse').onclick=activateCompanion;$('unequipCompanion').onclick=()=>equipCompanion(null);$('collectionGrid').addEventListener('click',event=>{const button=event.target.closest('[data-equip]');if(button)equipCompanion(button.dataset.equip)});
$('playerNameBtn').onclick=showPlayerNameModal;$('authBtn').onclick=async()=>{try{if(getCloudUser()&&!getCloudUser().isAnonymous)await signOutGoogle();else showAuthModal()}catch(e){openModal(`<h2>登出失敗</h2><p>${e.message}</p>`)}};$('leaderboardBtn').onclick=()=>showLeaderboard();$('historyBtn').onclick=showHistory;$('inviteBtn').onclick=makeChallenge;$('challengeAgainBtn').onclick=makeChallenge;$('challengeStatusBtn').onclick=showChallengeStatus;$('homeLink').onclick=e=>{e.preventDefault();if(!$('game').classList.contains('hidden')){$('quitBtn').click();return}if(!$('modal').open)show('home')};$('startBtn').onclick=start;$('factionGrid').addEventListener('click',e=>{const b=e.target.closest('[data-faction]');if(b)selectFaction(b.dataset.faction)});$('howBtn').onclick=()=>openModal('<h2>雙重求生玩法</h2><ol><li>每局 12 題：3 題經典求生、2 題圖片情境、4 題閱讀空氣、3 題混合情境，題型會隨機交錯。</li><li>每題 30 秒，初始 100 HP；答錯會扣血，超時扣 40 HP。</li><li>經典題保留逃跑選項、寵物救援及豬隊友提示；圖片題可開啟文字描述，沿用相同計分；情境題按觀察力、同理心、角色理解、洞察力及時機感評分。</li><li>作答後會翻到拍立得背面揭曉角色心聲；計時暫停，按「下一題」繼續。</li><li>答對可累積連擊；求生幣只在本局結算時發放：成功存活固定獲得 100 SC，再加剩餘 HP × 2（滿血共 300 SC）；陣亡固定獲得 10 SC 醫藥費。</li><li>收藏冊可選一張已擁有閃卡作下局隊友。重讀線索或暫停題目倒數 5 秒，每局只用一次；暫停不影響寵物救援限時。收工津貼只在生還時額外發放 20 SC。使用線索或暫停技能的場次保留個人戰績，但不計入公開排行榜；只領收工津貼仍可上榜；雙人互測及好友挑戰不設隊友。</li><li>每次抽卡消耗 100 SC；N 57%、R 30%、SR 10%、SSR 3%；重複卡回收 25 SC。</li><li>結果會分開顯示「了解對方」及「讀懂氣氛」兩項能力，並按本局實際選擇生成可下載分享的求生事故報告。</li></ol><p>本遊戲純屬娛樂，不代表真實人物心理或動物行為診斷。</p>');$('quitBtn').onclick=()=>openModal('<h2>確定放棄治療？</h2><p>離開本局不會獲得求生幣或紀錄。</p><button class="primary-btn" id="confirmQuit">確認離開</button>');$('modalContent').addEventListener('click',e=>{if(e.target.closest('[data-duo-expected]')){duoExpected.push(Number(e.target.closest('[data-duo-expected]').dataset.duoExpected));renderDuoSetup(duoExpected.length)}if(e.target.closest('#duoBeginTest')){ $('modal').close();beginDuoTest()}if(e.target.id==='duoPlayAgain'){ $('modal').close();startDuoSetup()}if(e.target.id==='duoCloseResult')$('modal').close();if(e.target.id==='confirmQuit'){$('modal').close();duoTestPhase=false;clearInterval(tick);clearTimeout(interactionTimer);clearTimeout(nextTimer);companionRun=null;renderCompanion();show('home')}});$('pigHintBtn').onclick=useHint;$('collectionBtn').onclick=showCollection;$('backBtn').onclick=()=>show('home');$('againBtn').onclick=start;$('downloadPoster').onclick=download;$('sharePoster').onclick=share;$('soundBtn').onclick=()=>{setMuted(!isMuted());$('soundBtn').classList.toggle('is-muted',isMuted());$('soundBtn').setAttribute('aria-label',isMuted()?'開啟音效':'關閉音效')};$('modal').addEventListener('close',()=>{playerNameModalOpen=false});$('modalClose').onclick=()=>$('modal').close();updateSaveUI();$('authBtn').textContent='登入狀態載入中…';$('authBtn').disabled=true;initCloud((user,profile,{profileLoaded=false,profileError}={})=>{setSaveScope(user&&!user.isAnonymous?user.uid:'guest');const scopedSave=loadSave();if(user&&!user.isAnonymous&&profileLoaded){const cloudCards=Array.isArray(profile?.favoriteCards)?profile.favoriteCards:scopedSave.cards;scopedSave.cards=[...new Set(cloudCards)];save(scopedSave);if(!Array.isArray(profile?.favoriteCards))persistFavoriteCards(scopedSave.cards)}saveData=loadSave();playerName=profile?.playerName||getCloudPlayerName()||'';playerNameUpdatedAt=profile?.playerNameUpdatedAt?.toMillis?.()||0;updatePlayerNameUI();$('playerNameBtn').disabled=Boolean(user&&!profileLoaded&&!profileError);const b=$('authBtn');b.disabled=false;b.title=user&&!profileLoaded?(profileError?'已登入；雲端玩家資料暫時未能同步。':'已登入；雲端玩家資料同步中…'):'';b.textContent=user?(user.isAnonymous?'訪客 · 升級':`登出 · ${(playerName||user.displayName||user.email||'玩家').slice(0,8)}`):'登入';updateSaveUI();if(companionRun){if(companionRun.scope!==companionScope())stopCompanionPause();renderCompanion()}if(user&&profileLoaded&&!playerName){if($('modal').open&&$('emailAuthForm'))pendingPlayerNamePrompt=true;else showPlayerNameModal()}if(user&&profileLoaded&&challengeId&&!challengeData)loadChallengeContext()}).then(({ready})=>{if(!ready){$('playerNameBtn').hidden=true;$('authBtn').disabled=true;$('authBtn').textContent='Google 登入未設定';$('authBtn').title='請先設定 Firebase Web App';['leaderboardBtn','historyBtn','inviteBtn','challengeAgainBtn','challengeStatusBtn'].forEach(id=>$(id).disabled=true)}}).catch(e=>{ $('authBtn').disabled=true;$('authBtn').textContent='登入服務暫時不可用';$('authBtn').title=e.message||'Firebase 初始化失敗';console.error('Firebase initialization failed:',e) });if(challengeId&&getCloudUser())loadChallengeContext();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));


// Close the header menu after an action, or when the user clicks away / presses Escape.
const actionMenu = $('actionMenu');
actionMenu.addEventListener('click', event => {
  if (event.target.closest('button')) actionMenu.open = false;
});
document.addEventListener('click', event => {
  if (actionMenu.open && !actionMenu.contains(event.target)) actionMenu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') actionMenu.open = false;
});
