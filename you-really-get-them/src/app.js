import {BANK,AIR_BANK,MIXED_BANK,FACTIONS} from './questions.js';import {beep,setMuted,isMuted} from './audio.js';import {loadSave,save,addCoins,addCard} from './storage.js';import {drawPoster,exportPoster} from './poster/poster.js';import {initCloud,getCloudUser,getCloudPlayerName,signInGoogle,signInEmail,signUpEmail,signInAnonymous,signOutGoogle,saveCloudProfile,recordCloudRun,getCloudRuns,getLeaderboard,createChallenge,joinChallenge,submitChallengeResult,getChallenge} from './firebase/cloud.js';
const $=id=>document.getElementById(id);const icon=(name,cls='ui-icon')=>`<img class="${cls}" src="./assets/icons/${name}.png" alt="" aria-hidden="true">`;const questionIcons={'✨':'spark','🧠':'spark','⚡':'lightning','🐶':'dog','🐱':'cat','💅':'woman','🧢':'man','🫶':'duo'};const factionIllustrations={women:'woman',men:'man',dog:'dog',cat:'cat',duo:'duo'};const illustration=name=>{const emoji={woman:'💅',man:'🧢',dog:'🐶',cat:'🐱',duo:'🫶',scratch:'✨'}[name]||'👀';const src=new URL(`../assets/illustrations/${name}.webp`,import.meta.url).href;return `<img class="scene-illustration" src="${src}" alt="" aria-hidden="true" loading="eager" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'scene-fallback',textContent:'${emoji}'}))">`};const screens=['home','game','result','collection'];let challengeId=new URLSearchParams(location.search).get('challenge'),challengeData=null,challengeSeed=null,challengeRunPending=false,challengeLoading=false,playerName='',playerNameModalOpen=false;let faction='women',mode='mixed',questions=[],questionCount=12,nextTimer=null,airScores=[0,0,0,0,0],classicCorrect=0,index=0,hp=100,correct=0,coins=0,streak=0,hints=2,timer=30,tick=null,interactionTimer=null,interactionDone=false,interactionPenaltyApplied=false,answered=false,runId=0,lastResult=null,saveData=loadSave();
const quotes=['死因：你竟然選了這個。','死因：自信得令人擔心。','死因：你把「隨便」當成真的。','死因：讀空氣能力仍在下載。','死因：這題你真的想太久。'];
function seededShuffle(items,seed){let state=seed>>>0;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296};const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function show(name){screens.forEach(s=>$(s).classList.toggle('hidden',s!==name));window.scrollTo({top:0,behavior:'smooth'})}function shuffle(a){return [...a].sort(()=>Math.random()-.5)}function updateSaveUI(){saveData=loadSave();$('cardCount').textContent=saveData.cards.length}
function selectFaction(id){duoTestPhase=false;faction=id;document.querySelectorAll('.faction-card').forEach(b=>b.classList.toggle('selected',b.dataset.faction===id))}
let duoSetupQuestions=[],duoExpected=[],duoTestAnswers=[],duoTestPhase=false;
function startDuoSetup(){duoSetupQuestions=shuffle(BANK.duo).slice(0,5);duoExpected=[];duoTestAnswers=[];duoTestPhase=false;$('game').classList.remove('duo-mode');$('modalContent').className='duo-flow';$('modal').showModal();renderDuoSetup(0)}
function renderDuoSetup(step){const content=$('modalContent');content.className='duo-flow';if(step>=5){content.innerHTML=`<div class="duo-role-label">STEP 1 · 出題者</div><div class="duo-complete-icon">✓</div><p class="duo-kicker">答案設定完成</p><h2>交接手機！</h2><p class="duo-lead">5 條題目的答案已經記錄。現在請把手機交給另一位玩家。</p><div class="duo-notice"><b>測試者請留意</b><span>不要向出題者詢問答案，接下來要猜的是「對方會怎樣選」。</span></div><button class="primary-btn duo-main-action" id="duoBeginTest">我已接過手機，開始作答 <span>→</span></button><p class="duo-footnote">測試期間不會顯示出題者的答案。</p>`;return}const q=duoSetupQuestions[step];content.innerHTML=`<div class="duo-flow-head"><span class="duo-role-label">STEP 1 · 出題者設定</span><span class="duo-step-count">${step+1} / 5</span></div><h2>你會選哪個答案？</h2><p class="duo-lead">請以自己的真實想法作答。另一位玩家稍後會猜你的選擇。</p><div class="duo-progress" aria-label="設定進度">${Array.from({length:5},(_,i)=>`<i class="${i<=step?'active':''}"></i>`).join('')}</div><div class="duo-question-count">第 ${step+1} 題 · 共 5 題</div><h3 class="duo-question-text">${q.text}</h3><p class="duo-answer-instruction">選擇你自己的答案</p><div class="answers duo-setup-answers">${q.opts.map((o,i)=>`<button class="answer-btn" data-duo-expected="${i}"><span class="duo-option-letter">${String.fromCharCode(65+i)}</span><span>${o}</span></button>`).join('')}</div><p class="duo-footnote">選擇後會自動進入下一題，不能返回修改。</p>`; }
function beginDuoTest(){duoTestPhase=true;index=0;questionCount=5;duoTestAnswers=[];hp=100;correct=0;$('game').classList.add('duo-mode');show('game');renderQuestion()}
function renderDuoTestQuestion(){const q=duoSetupQuestions[index];answered=false;$('roundFaction').textContent='雙人互測 · 測試者作答';$('questionNo').textContent=String(index+1).padStart(2,'0');$('game').querySelector('.game-title h2 small').textContent=' / 5';$('hpValue').textContent='—';$('hpBar').style.width='100%';$('timer').parentElement.classList.add('hidden');$('questionTag').textContent='測試者作答';$('questionDifficulty').textContent=`第 ${index+1} / 5 題`;$('questionVisual').innerHTML='<strong>輪到你猜！</strong><small>測試者作答 · 不設時限</small>';$('questionText').textContent=q.text;$('questionHint').textContent='選出你認為「出題者本人」會選擇的答案。';$('answers').innerHTML='';q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='answer-btn';b.innerHTML=`<span class="duo-option-letter">${String.fromCharCode(65+i)}</span><span>${o}</span>`;b.addEventListener('click',()=>answerDuoTest(i));$('answers').append(b)});$('interaction').classList.add('hidden');$('pigHintBtn').classList.add('hidden');$('hintLeft').classList.add('hidden');$('runCoins').textContent='雙人互測';$('progressDots').innerHTML=Array.from({length:5},(_,i)=>`<i class="${i<index?'done':''}"></i>`).join('');$('progressDots').setAttribute('aria-valuenow',String(index));$('progressDots').setAttribute('aria-valuemax','5');$('progressDots').setAttribute('aria-label',`已完成 ${index} / 5 題`)}
function answerDuoTest(choice){if(answered)return;answered=true;duoTestAnswers.push(choice);[...$('answers').children].forEach((b,i)=>{b.disabled=true;if(i===choice)b.classList.add('duo-selected')});$('questionHint').textContent='✓ 已記錄你的選擇，答案會在最後一併揭曉。';nextTimer=setTimeout(()=>{index++;if(index>=5)finishDuoTest();else renderQuestion()},650)}
function finishDuoTest(){show('home');$('game').classList.remove('duo-mode');const rows=duoSetupQuestions.map((q,i)=>({q,expected:duoExpected[i],actual:duoTestAnswers[i],match:duoExpected[i]===duoTestAnswers[i]}));const score=rows.filter(r=>r.match).length;$('modalContent').className='duo-flow duo-results';$('modalContent').innerHTML=`<div class="duo-role-label">雙人互測 · 結果報告</div><p class="duo-kicker">你們的默契指數</p><div class="duo-score">${score}<small>/ 5</small></div><h2>${score===5?'心有靈犀！':score>=3?'有啲默契！':'答案完全兩個世界！'}</h2><p class="duo-lead">答中 ${score} 題，答案吻合度 <b>${score*20}%</b></p><div class="duo-result-list">${rows.map((r,i)=>`<article class="duo-result-row ${r.match?'is-match':'is-miss'}"><div class="duo-result-heading"><b>第 ${i+1} 題</b><strong>${r.match?'✓ 答案一致':'✕ 答案不同'}</strong></div><p>${r.q.text}</p><div class="duo-answer-compare"><div><small>出題者的答案</small><b>${String.fromCharCode(65+r.expected)}. ${r.q.opts[r.expected]}</b></div><div><small>測試者的猜測</small><b>${String.fromCharCode(65+r.actual)}. ${r.q.opts[r.actual]}</b></div></div></article>`).join('')}</div><button class="primary-btn duo-main-action" id="duoPlayAgain">再玩一次 <span>↻</span></button><button class="secondary-btn duo-secondary-action" id="duoCloseResult">完成</button>`;$('modal').showModal()}
function openModal(html){$('modalContent').className='';$('modalContent').innerHTML=html;$('modal').showModal()}function start(){if(faction==='duo'){startDuoSetup();return}if(challengeId&&!getCloudUser()){openModal('<h2>先登入才能接受挑戰</h2><p>使用 Google 登入後即可開始朋友邀請的挑戰。</p>');return}if(faction==='duo'&&saveData.runs<3&&!challengeRunPending)return;const pick=(pool,count,offset)=>{const ordered=challengeRunPending&&challengeSeed!=null?seededShuffle(pool,challengeSeed+offset):shuffle(pool);return ordered.slice(0,count)};const classic=pick(BANK[faction],5,11).map(q=>({...q,kind:'classic',legacyIndex:BANK[faction].indexOf(q)}));const air=pick(AIR_BANK[faction],4,23).map(q=>({...q,kind:'air'}));const hybrid=pick(MIXED_BANK[faction],3,37).map(q=>({...q,kind:'hybrid',correct:q.profiles.reduce((best,profile,i,all)=>profile.reduce((s,v)=>s+v,0)>all[best].reduce((s,v)=>s+v,0)?i:best,0)}));const pool=[...classic,...air,...hybrid];questions=challengeRunPending&&challengeSeed!=null?seededShuffle(pool,challengeSeed+53):shuffle(pool);questionCount=12;index=0;hp=100;correct=0;classicCorrect=0;coins=0;streak=0;hints=2;airScores=[0,0,0,0,0];runId=saveData.runs+1;show('game');renderQuestion()}
function renderQuestion(){if(duoTestPhase){renderDuoTestQuestion();return}clearInterval(tick);clearTimeout(interactionTimer);clearTimeout(nextTimer);answered=false;interactionDone=false;interactionPenaltyApplied=false;timer=30;const q=questions[index];$('runCoins').textContent=`${coins} SC`;$('roundFaction').textContent=FACTIONS[faction].name+' · 雙重求生';$('questionNo').textContent=String(index+1).padStart(2,'0');$('game').querySelector('.game-title h2 small').textContent=` / ${questionCount}`;$('hpValue').textContent=hp;$('hpBar').style.width=hp+'%';$('hpBar').style.background=hp<=30?'#ef5350':hp<=60?'#ffe853':'#80d77c';$('timer').textContent='30.0';$('timer').parentElement.classList.remove('hidden');$('timer').classList.remove('danger');$('questionTag').textContent=`${String(index+1).padStart(2,'0')} · ${{classic:'經典求生',air:'閱讀空氣',hybrid:'混合情境'}[q.kind]}`;$('questionDifficulty').textContent=index<3?'WARM UP':index<7?'STRESS':'HELL MODE';$('questionVisual').innerHTML=`${illustration(factionIllustrations[faction]||'woman')}<small>${FACTIONS[faction].name} · 現場觀察</small>`;$('questionText').textContent=q.text;$('questionHint').textContent='';$('answers').innerHTML='';q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='answer-btn';b.textContent=String.fromCharCode(65+i)+'. '+o;b.addEventListener('click',()=>answer(i));$('answers').append(b)});$('interaction').classList.add('hidden');$('hintLeft').textContent=`× ${hints}`;$('pigHintBtn').classList.toggle('hidden',q.kind!=='classic');$('hintLeft').classList.toggle('hidden',q.kind!=='classic');$('pigHintBtn').disabled=q.kind!=='classic'||hints<=0||hp<=5;$('progressDots').innerHTML=Array.from({length:questionCount},(_,i)=>`<i class="${i<index?'done':''}"></i>`).join('');$('progressDots').setAttribute('aria-valuenow',String(index));if(q.kind==='classic')startInteraction(q.legacyIndex);else $('interaction').classList.add('hidden');tick=setInterval(()=>{timer=Math.max(0,timer-.1);$('timer').textContent=timer.toFixed(1);if(timer<=3){$('timer').classList.add('danger');if(Math.round(timer*10)%5===0)beep('tick')}if(timer<=0){clearInterval(tick);if(!answered){hp=Math.max(0,hp-40);streak=0;beep('bad');feedback('時間到！−40 HP');}}},100)}
function feedback(msg){answered=true;clearTimeout(interactionTimer);$('questionHint').textContent=msg;document.querySelector('.question-card').classList.add('shake');setTimeout(()=>document.querySelector('.question-card')?.classList.remove('shake'),300);nextTimer=setTimeout(()=>{if(hp<=0)finish(false);else nextQuestion()},850)}
function answer(choice){if(duoTestPhase){answerDuoTest(choice);return}if(answered)return;answered=true;clearInterval(tick);clearTimeout(interactionTimer);const q=questions[index],buttons=[...$('answers').children];if(q.kind!=='classic'){answerAir(choice,q,buttons);return;}if(choice===q.correct)classicCorrect++;if(!interactionDone&&!interactionPenaltyApplied&&q.legacyIndex===3){hp=Math.max(0,hp-12);interactionPenaltyApplied=true;$('questionHint').textContent='連打任務未完成！−12 HP';}if(!interactionDone&&!interactionPenaltyApplied&&q.legacyIndex===7){hp=Math.max(0,hp-10);interactionPenaltyApplied=true;$('questionHint').textContent='未能完成按住確認！−10 HP';}if(!interactionDone&&!interactionPenaltyApplied&&q.legacyIndex===6&&(faction==='dog'||faction==='cat')){hp=Math.max(0,hp-8);interactionPenaltyApplied=true;$('questionHint').textContent='救援任務失敗！−8 HP';}buttons.forEach(b=>b.disabled=true);if(choice===q.correct){correct++;streak++;const base=interactionDone?12:8,combo=Math.min((streak-1)*2,10),gain=base+combo;coins+=gain;$('runCoins').textContent=`${coins} SC`;buttons[choice].style.background='#a8ef9b';beep('good');$('questionHint').textContent=`答對！${streak>1?`🔥 ${streak} 連擊！`:''} +${gain} SC。${q.why}`}else{streak=0;const optionDamage=q.damageByOption?.[choice];const fatal=optionDamage===100;const damage=fatal?hp:typeof optionDamage==='number'?optionDamage:25+(index>=7?10:0);hp=Math.max(0,hp-damage);buttons[choice].style.background='#ffb4b4';buttons[q.correct].style.background='#a8ef9b';beep('bad');$('questionHint').textContent=`${fatal?'一擊必殺！':'答錯！'}−${damage} HP。${q.why} 豬隊友：我剛剛也是這樣選。`}updateHP();nextTimer=setTimeout(()=>{if(hp<=0)finish(false);else nextQuestion()},1150)}
function answerAir(choice,q,buttons){
  const profile=q.profiles[choice];profile.forEach((value,i)=>airScores[i]+=value);
  const rawQuality=profile.reduce((sum,value)=>sum+value,0);const quality=q.kind==='hybrid'&&choice!==q.correct?Math.min(rawQuality,11):q.kind==='hybrid'?Math.max(rawQuality,16):rawQuality;
  const damage=quality>=16?0:quality>=12?8:quality>=8?16:24;hp=Math.max(0,hp-damage);
  if(quality>=12){correct++;streak++;const gain=6+Math.min((streak-1)*2,6);coins+=gain;$('runCoins').textContent=coins+' SC';buttons[choice].style.background='#a8ef9b';beep('good');$('questionHint').textContent='判斷不錯！'+(streak>1?'🔥 '+streak+' 連擊！':'')+' +'+gain+' SC。'+q.why}
  else{streak=0;buttons[choice].style.background='#ffb4b4';beep('bad');$('questionHint').textContent='現場訊號未完全讀懂。−'+damage+' HP。'+q.why}
  buttons.forEach(b=>b.disabled=true);updateHP();nextTimer=setTimeout(()=>{if(hp<=0)finish(false);else nextQuestion()},1350);
}
function nextQuestion(){index++;if(index>=questionCount)finish(hp>0);else renderQuestion()}
function startInteraction(i){const host=$('interaction');host.classList.remove('hidden');if(i===1){host.innerHTML=`${illustration('scratch')}<h4>${icon('sponge')} 刮開怒氣黑霧</h4><p>擦掉 45% 即可揭曉</p><canvas class="scratch-pad" id="scratch" width="620" height="180"></canvas><div class="meter"><span id="scratchMeter"></span></div>`;setupScratch()}else if(i===3){host.innerHTML=`${illustration(factionIllustrations[faction]||'duo')}<h4>${icon('lightning')} 3 秒連打</h4><p>連按 15 次</p><button class="tap-button" id="tapBtn">我錯了對不起！ <b id="tapCount">0/15</b></button><div class="meter"><span id="tapMeter"></span></div>`;setupTap()}else if(i===5){host.innerHTML=`${illustration(factionIllustrations[faction]||'woman')}<h4>${icon('sneaker')} 逃跑選項</h4><p>抓緊時機點選</p>`;const b=[...$('answers').children][Math.min(2,$('answers').children.length-1)];b.classList.add('runaway-answer');let tries=0;b.addEventListener('pointerenter',()=>{if(tries++<5){b.style.transform=`translate(${Math.random()*110-55}px,${Math.random()*70-35}px)`;beep('click')}});b.addEventListener('focus',()=>b.style.transform='none')}else if(i===7){host.innerHTML=`${illustration(factionIllustrations[faction]||'duo')}<h4>${icon('press')} 按住 1.6 秒</h4><p>中途放手即失敗</p><button class="hold-zone" id="holdBtn">按住承諾</button><div class="meter"><span id="holdMeter"></span></div>`;setupHold()}else if(i===6&&faction==='dog'){host.innerHTML=`${illustration('dog')}<h4>${icon('dog')} 肉泥救援</h4><p>3 秒內出手</p><button class="tap-button" id="treatBtn">${icon('treat')} 遞上肉泥</button>`;let done=false;$('treatBtn').onclick=()=>{if(!done){done=true;interactionDone=true;$('questionHint').textContent='成功分散注意力！本題互動獎勵已啟動。';beep('good')}};interactionTimer=setTimeout(()=>{if(!done){done=true;host.innerHTML+='<p>肉泥來不及了！</p>';hp=Math.max(0,hp-8);interactionPenaltyApplied=true;updateHP()}},3000)}else if(i===6&&faction==='cat'){host.innerHTML=`${illustration('cat')}<h4>${icon('paw-cup')} 貓掌突襲</h4><p>3 秒內保住杯子</p><button class="tap-button" id="cupBtn">${icon('paw-cup')} 保護杯子！</button>`;let done=false;$('cupBtn').onclick=()=>{if(!done){done=true;interactionDone=true;beep('good');$('questionHint').textContent='杯子保住了！你獲得互動獎勵。'}};interactionTimer=setTimeout(()=>{if(!done){done=true;hp=Math.max(0,hp-8);interactionPenaltyApplied=true;updateHP();host.innerHTML+='<p>杯子已經落地了……−8 HP</p>'}},3000)}else{host.innerHTML=`<h4>${icon('pig')} 豬隊友觀察中</h4><p>保持冷靜，讀完題目再作答。你可以隨時選擇答案。</p>`;host.classList.add('hidden')}}
function updateHP(){$('hpValue').textContent=hp;$('hpBar').style.width=hp+'%'}
function setupTap(){let n=0,done=false;const btn=$('tapBtn');const stop=()=>{if(done)return;done=true;clearTimeout(interactionTimer);if(n>=15){interactionDone=true;$('questionHint').textContent='手速合格！+互動獎勵';beep('good')}else{hp=Math.max(0,hp-12);interactionPenaltyApplied=true;updateHP();$('questionHint').textContent='誠意不足！−12 HP';beep('bad')}};btn.addEventListener('click',()=>{if(done)return;n++;$('tapCount').textContent=`${n}/15`;$('tapMeter').style.width=Math.min(100,n/15*100)+'%';beep('click');if(n>=15)stop()});interactionTimer=setTimeout(stop,3000)}
function setupScratch(){const c=$('scratch'),ctx=c.getContext('2d');ctx.fillStyle='#888';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#fff';ctx.font='bold 30px sans-serif';ctx.fillText('擦掉怒氣黑霧！',180,100);ctx.globalCompositeOperation='destination-out';let down=false,lastMeasure=0;function scratch(e,force=false){if(!down)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;ctx.beginPath();ctx.arc(x,y,27,0,Math.PI*2);ctx.fill();if(!force&&e.timeStamp-lastMeasure<80)return;lastMeasure=e.timeStamp;const d=ctx.getImageData(0,0,c.width,c.height).data;let clear=0;for(let i=3;i<d.length;i+=64)if(d[i]===0)clear++;const pct=clear/(d.length/64)*100;$('scratchMeter').style.width=pct+'%';if(pct>45&&!interactionDone){interactionDone=true;beep('good');$('questionHint').textContent='黑霧散開了！你找回一點理智。'}}c.addEventListener('pointerdown',e=>{down=true;lastMeasure=0;c.setPointerCapture(e.pointerId);scratch(e,true)});c.addEventListener('pointermove',scratch);c.addEventListener('pointerup',e=>{scratch(e,true);down=false});c.addEventListener('pointercancel',()=>down=false)}
function setupHold(){const b=$('holdBtn');let start=0,frame;function down(e){e.preventDefault();if(start)return;if(e.pointerId!==undefined)b.setPointerCapture(e.pointerId);start=performance.now();b.classList.add('holding');const loop=()=>{if(!start)return;const pct=Math.min(100,(performance.now()-start)/1600*100);$('holdMeter').style.width=pct+'%';if(pct>=100){interactionDone=true;start=0;b.classList.remove('holding');beep('good');$('questionHint').textContent='承諾成立！你成功撐住了。';return}frame=requestAnimationFrame(loop)};frame=requestAnimationFrame(loop)}function up(){if(!start)return;start=0;cancelAnimationFrame(frame);b.classList.remove('holding');$('holdMeter').style.width='0%';hp=Math.max(0,hp-10);interactionPenaltyApplied=true;updateHP();$('questionHint').textContent='中途放手！−10 HP';beep('bad')}b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();down(e)}});b.addEventListener('keyup',e=>{if(e.code==='Space')up()})}
function useHint(){if(questions[index]?.kind!=='classic'||hints<=0||hp<=5||answered)return;hints--;hp=Math.max(0,hp-5);updateHP();$('hintLeft').textContent=`× ${hints}`;$('pigHintBtn').disabled=hints<=0||hp<=5;const q=questions[index],wrong=q.opts.map((_,i)=>i).filter(i=>i!==q.correct);const misleading=wrong[Math.floor(Math.random()*wrong.length)];$('questionHint').innerHTML=`${icon('pig','ui-icon tiny-icon')} 豬隊友：「我覺得選 ${String.fromCharCode(65+misleading)} 啦！我通常都很準……大概。」（−5 HP）`;beep('bad')}
async function finish(survived){clearInterval(tick);clearTimeout(interactionTimer);clearTimeout(nextTimer);const bonus=survived?20:0,total=coins+bonus;const dimensionNames=['觀察力','同理心','角色理解','洞察力','時機感'];const dimensions=airScores.map((score,i)=>({name:dimensionNames[i],score:Math.round(score/(7*4)*100)}));const airAverage=Math.round(dimensions.reduce((sum,item)=>sum+item.score,0)/dimensions.length);const understandingScore=Math.round(classicCorrect/5*100);const title=survived?(understandingScore>=80&&airAverage>=80?'默契雷達雙料大師':understandingScore>=70?'相處觀察專家':airAverage>=70?'氣氛捕捉高手':hp>=60?'驚險生還專家':'命硬但有進步'):'現實求生待加強';const quote=survived?'死因未明：對方暫時放過你。':quotes[Math.floor(Math.random()*quotes.length)];saveData=loadSave();saveData.coins+=total;saveData.runs++;saveData.bestHp=Math.max(saveData.bestHp,hp);save(saveData);lastResult={faction,mode:'mixed',questionCount,dimensions,airAverage,understandingScore,survived,hp,coins:total,correct,title,quote,run:saveData.runs};$('resultTitle').textContent=survived?'你竟然活下來了！':'你被現實擊倒了';$('resultSubtitle').textContent='個性理解、現場觀察與情境判斷，三方面一起結算。';$('resultCorrect').previousElementSibling.textContent='TOTAL READS';$('resultHp').textContent=hp;$('resultCoins').textContent=`${total} SC`;$('resultCorrect').textContent=`${correct} / ${questionCount}`;$('resultQuote').textContent=quote;$('airReport').classList.remove('hidden');$('airReport').innerHTML=`<div class="air-report-head"><strong>雙重求生能力分析</strong><b>${Math.round((understandingScore+airAverage)/2)}<small> / 100</small></b></div><div class="air-score-row"><span>了解對方</span><div class="air-score-track"><i style="width:${understandingScore}%"></i></div><b>${understandingScore}</b></div><div class="air-score-row"><span>讀懂氣氛</span><div class="air-score-track"><i style="width:${airAverage}%"></i></div><b>${airAverage}</b></div>${dimensions.map(item=>`<div class="air-score-row"><span>${item.name}</span><div class="air-score-track"><i style="width:${item.score}%"></i></div><b>${item.score}</b></div>`).join('')}<p>5 題經典題考驗你對對方的日常理解；另外 7 題情境題分析你如何觀察線索、理解情緒及選擇時機。</p>`;await drawPoster(lastResult,$('posterPreview'));beep(survived?'win':'lose');updateSaveUI();show('result');if(getCloudUser()){saveCloudProfile(saveData).catch(console.error);recordCloudRun(lastResult).catch(console.error);if(challengeId&&challengeRunPending){submitChallengeResult(challengeId,lastResult).catch(e=>openModal(`<h2>挑戰結果同步失敗</h2><p>${e.message}</p>`));challengeRunPending=false}}}
async function download(){if(!lastResult)return;await document.fonts?.ready;const blob=await exportPoster($('posterPreview'));if(!blob){openModal('<h2>匯出失敗</h2><p>你的瀏覽器暫時無法匯出圖片，請嘗試重新載入。</p>');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`survival-report-${lastResult.run}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}async function share(){if(!lastResult)return;await document.fonts?.ready;const blob=await exportPoster($('posterPreview'));if(!blob){openModal('<h2>匯出失敗</h2><p>你的瀏覽器暫時無法匯出圖片，請嘗試重新載入。</p>');return}const file=new File([blob],`survival-report-${lastResult.run}.png`,{type:'image/png'});if(navigator.canShare?.({files:[file]})&&navigator.share){try{await navigator.share({title:'我的生存鑑定報告書',text:'你敢挑戰嗎？',files:[file]})}catch(e){if(e.name!=='AbortError')download()}}else download()}

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
    const content=rows.length?'<div class="score-list history-list">'+rows.map(r=>`<article class="score-row history-row"><div class="score-main"><strong>${safe(FACTIONS[r.faction]?.name||r.faction)} · ${r.mode==='mixed'?'雙重求生':r.mode==='air'?'閱讀空氣':'經典求生'}</strong><small>${safe(r.createdAt||'時間未提供')}</small></div><div class="score-metrics"><span><small>達標</small><b>${Number(r.correct)||0}/${Number(r.questionCount)||10}</b></span><span><small>剩餘 HP</small><b>${Number(r.hp)||0}</b></span><span><small>求生幣</small><b>${Number(r.coins)||0} SC</b></span></div><span class="score-status ${r.survived?'is-survived':'is-failed'}">${r.survived?'成功生還':'挑戰失敗'}</span></article>`).join('')+'</div>':'<p class="score-empty">尚無雲端戰績，完成一場挑戰後就會出現在這裡。</p>';
    openModal(`<h2>我的戰績</h2><p class="score-intro">最近 30 場雲端同步紀錄</p>${content}`);
  }catch(e){openModal(`<h2>讀取失敗</h2><p>${e.message}</p>`)}
}
async function showLeaderboard(selected=faction){
  const render=async active=>{
    const rows=await getLeaderboard(active);
    const content=rows.length?'<div class="score-list leaderboard-list"><div class="leaderboard-head"><span>排名</span><span>玩家</span><span>最高 HP</span><span>答對</span></div>'+rows.map((r,i)=>`<article class="leaderboard-row ${i<3?'top-rank':''}"><b class="rank-number">${i+1}</b><strong class="leader-name">${safe(r.displayName||'玩家')}</strong><b class="leader-hp">${Number(r.bestHp)||0}<small> HP</small></b><b class="leader-correct">${Number(r.bestCorrect)||0}<small>/12</small></b></article>`).join('')+'</div>':'<p class="score-empty">這個陣營暫時沒有上榜玩家，完成一場挑戰即可登榜。</p>';
    $('leaderboardContent').innerHTML=content;
    document.querySelectorAll('[data-leaderboard-faction]').forEach(button=>{
      button.classList.toggle('active',button.dataset.leaderboardFaction===active);
      button.setAttribute('aria-pressed',String(button.dataset.leaderboardFaction===active));
    });
  };
  const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  openModal(`<h2>陣營排行榜 TOP 50</h2><p class="score-intro">各陣營獨立排名，依最高剩餘 HP、答對題數排序。玩家自評榜單，並非防作弊競技排名。</p><div class="leaderboard-faction-tabs" role="group" aria-label="選擇排行榜陣營">${Object.entries(FACTIONS).map(([id,item])=>`<button type="button" class="leaderboard-faction-tab" data-leaderboard-faction="${id}" aria-pressed="false">${safe(item.name)}</button>`).join('')}</div><div id="leaderboardContent" aria-live="polite"><p class="score-empty">排行榜載入中…</p></div>`);
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
  button.hidden=!user;
  button.textContent=playerName?`玩家：${playerName}`:'設定玩家名稱';
  button.title=playerName?`玩家名稱：${playerName}（點擊修改）`:'設定你的玩家名稱';
}
function showPlayerNameModal(){
  if(!getCloudUser()||playerNameModalOpen)return;
  if($('modal').open&&$('emailAuthForm'))return;
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
      playerName=name;updatePlayerNameUI();
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
    try{await action();$('modal').close();if(getCloudUser()&&!playerName)showPlayerNameModal()}
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
function showCollection(){
  const cards=[
    {id:'w_1',name:'傲嬌雙馬尾',emoji:'👧',rarity:'R',chance:58/4,desc:'口頭禪是「我才沒有生氣呢！」'},
    {id:'w_2',name:'名偵探女友',emoji:'🕵️‍♀️',rarity:'SR',chance:30/4,desc:'憑藉一根頭髮就能還原完整案發現場',skill:'微表情透視：刪除 2 個錯誤選項（技能尚未啟用）'},
    {id:'w_3',name:'白月光天使',emoji:'👼',rarity:'SSR',chance:12/4,desc:'傳說中永遠講道理、不翻舊帳的夢幻生物',skill:'免死金牌：抵銷一次一擊必殺（技能尚未啟用）'},
    {id:'m_1',name:'鋼鐵直男',emoji:'🗿',rarity:'R',chance:58/4,desc:'大腦裡只有一個齒輪在轉的純真生物'},
    {id:'m_2',name:'電競肝帝',emoji:'🎮',rarity:'SR',chance:30/4,desc:'發誓「再打最後一場就去睡覺」的男人'},
    {id:'m_3',name:'傳說霸總',emoji:'💼',rarity:'SSR',chance:12/4,desc:'自帶黑卡與「女人妳成功引起我注意」氣場'},
    {id:'d_1',name:'短腿柯基',emoji:'🍞',rarity:'R',chance:58/4,desc:'底盤過低，每次上下樓梯都像在爬山'},
    {id:'d_2',name:'拆家哈士奇',emoji:'🐺',rarity:'SR',chance:30/4,desc:'西伯利亞裝修大隊長，專精沙發爆破',skill:'混亂邪惡：重排選項，通關賞金翻倍（技能尚未啟用）'},
    {id:'d_3',name:'倔強柴將軍',emoji:'🐕',rarity:'SSR',chance:12/4,desc:'散步一旦啟動煞車，八匹馬都拉不動'},
    {id:'c_1',name:'十橘九胖',emoji:'🍊',rarity:'R',chance:58/4,desc:'只要聽見開罐器聲響就能光速瞬移'},
    {id:'c_2',name:'虛空黑貓',emoji:'🐈‍⬛',rarity:'SR',chance:30/4,desc:'完美融入陰影，只露出兩顆發光大眼'},
    {id:'c_3',name:'仙氣布偶皇',emoji:'🐈',rarity:'SSR',chance:12/4,desc:'顏值即正義，看你宛如看卑微兩腳獸',skill:'時間凍結：倒數計時凍結 6 秒（技能尚未啟用）'}
  ];
  const cost=50;saveData=loadSave();
  const owned=new Set(saveData.cards);
  ['w_1','m_1'].forEach(id=>owned.add(id));
  saveData.cards=[...new Set([...saveData.cards,'w_1','m_1'])];save(saveData);updateSaveUI();
  $('collectionCoins').textContent=`${saveData.coins} SC`;$('collectionGrid').innerHTML='';
  cards.forEach(card=>{
    const has=owned.has(card.id)||owned.has(card.name),d=document.createElement('article');
    d.className=`collect-card rarity-${card.rarity.toLowerCase()} ${has?'':'locked'}`;
    d.innerHTML=`<span class="rarity">${card.rarity}</span><div class="flash-card-art" aria-hidden="true">${card.emoji}</div><strong>${has?card.name:'???'}</strong><small>${has?card.desc:'尚未解鎖 · 閃卡抽抽樂'}</small>${has&&card.skill?`<small class="card-skill">${card.skill}</small>`:''}`;
    $('collectionGrid').append(d);
  });
  const g=document.createElement('button');g.className='primary-btn draw-card-btn';g.textContent=`花費 ${cost} SC 抽一張閃卡`;g.disabled=saveData.coins<cost;g.onclick=()=>{
    const state=loadSave();if(state.coins<cost)return;state.coins-=cost;
    const roll=Math.random()*100;let cumulative=0;
    const rarity=roll<58?'R':roll<88?'SR':'SSR';
    const pool=cards.filter(card=>card.rarity===rarity),chosen=pool[Math.floor(Math.random()*pool.length)];
    if(state.cards.includes(chosen.id)||state.cards.includes(chosen.name)){state.coins+=25;save(state);openModal(`<h2>重複閃卡！轉換成 25 SC</h2><p>再次抽到「${chosen.name}」，已回收一半抽卡費用。</p>`)}
    else{state.cards.push(chosen.id);save(state);openModal(`<h2>✨ ${chosen.rarity} 閃卡入手！</h2><p style="font-size:3rem;text-align:center">${chosen.emoji}</p><h3>${chosen.name}</h3><p>${chosen.desc}</p>${chosen.skill?`<p>${chosen.skill}</p>`:''}`)}
    if(getCloudUser())saveCloudProfile(state).catch(console.error);
    updateSaveUI();showCollection();
  };
  $('collectionGrid').append(g);show('collection')
}
$('playerNameBtn').onclick=showPlayerNameModal;$('authBtn').onclick=async()=>{try{if(getCloudUser()&&!getCloudUser().isAnonymous)await signOutGoogle();else showAuthModal()}catch(e){openModal(`<h2>登出失敗</h2><p>${e.message}</p>`)}};$('leaderboardBtn').onclick=showLeaderboard;$('historyBtn').onclick=showHistory;$('inviteBtn').onclick=makeChallenge;$('challengeAgainBtn').onclick=makeChallenge;$('challengeStatusBtn').onclick=showChallengeStatus;$('homeLink').onclick=e=>{e.preventDefault();if(!$('game').classList.contains('hidden')){$('quitBtn').click();return}if(!$('modal').open)show('home')};$('startBtn').onclick=start;$('factionGrid').addEventListener('click',e=>{const b=e.target.closest('[data-faction]');if(b)selectFaction(b.dataset.faction)});$('howBtn').onclick=()=>openModal('<h2>雙重求生玩法</h2><ol><li>每局 12 題：5 題經典求生、4 題閱讀空氣、3 題混合情境，題型會隨機交錯。</li><li>每題 30 秒，初始 100 HP；答錯會扣血，超時扣 40 HP。</li><li>經典題保留互動任務及豬隊友提示；情境題按觀察力、同理心、角色理解、洞察力及時機感評分。</li><li>答對或作出合適判斷可獲 SC，連擊有額外獎勵，完成整局再獲 20 SC。</li><li>每次抽卡消耗 50 SC；抽中重複卡會回收 25 SC。</li><li>結果會分開顯示「了解對方」及「讀懂氣氛」兩項能力。</li></ol><p>本遊戲純屬娛樂，不代表真實人物心理或動物行為診斷。</p>');$('quitBtn').onclick=()=>openModal('<h2>確定放棄治療？</h2><p>離開本局不會獲得求生幣或紀錄。</p><button class="primary-btn" id="confirmQuit">確認離開</button>');$('modalContent').addEventListener('click',e=>{if(e.target.closest('[data-duo-expected]')){duoExpected.push(Number(e.target.closest('[data-duo-expected]').dataset.duoExpected));renderDuoSetup(duoExpected.length)}if(e.target.id==='duoBeginTest'){ $('modal').close();beginDuoTest()}if(e.target.id==='duoPlayAgain'){ $('modal').close();startDuoSetup()}if(e.target.id==='duoCloseResult')$('modal').close();if(e.target.id==='confirmQuit'){$('modal').close();duoTestPhase=false;clearInterval(tick);clearTimeout(interactionTimer);clearTimeout(nextTimer);show('home')}});$('pigHintBtn').onclick=useHint;$('collectionBtn').onclick=showCollection;$('backBtn').onclick=()=>show('home');$('againBtn').onclick=start;$('downloadPoster').onclick=download;$('sharePoster').onclick=share;$('soundBtn').onclick=()=>{setMuted(!isMuted());$('soundBtn').classList.toggle('is-muted',isMuted());$('soundBtn').setAttribute('aria-label',isMuted()?'開啟音效':'關閉音效')};$('modal').addEventListener('close',()=>{playerNameModalOpen=false});$('modalClose').onclick=()=>$('modal').close();updateSaveUI();$('authBtn').textContent='登入狀態載入中…';$('authBtn').disabled=true;initCloud((user,profile)=>{playerName=profile?.playerName||getCloudPlayerName()||'';updatePlayerNameUI();const b=$('authBtn');b.disabled=false;b.textContent=user?(user.isAnonymous?'訪客 · 升級':`登出 · ${(playerName||user.displayName||user.email||'玩家').slice(0,8)}`):'登入';updateSaveUI();if(user&&!playerName)showPlayerNameModal();if(user&&challengeId&&!challengeData)loadChallengeContext()}).then(({ready,redirectError})=>{if(!ready){$('playerNameBtn').hidden=true;$('authBtn').disabled=true;$('authBtn').textContent='Google 登入未設定';$('authBtn').title='請先設定 Firebase Web App';['leaderboardBtn','historyBtn','inviteBtn','challengeAgainBtn','challengeStatusBtn'].forEach(id=>$(id).disabled=true)}if(redirectError){const code=redirectError.code||'unknown';const detail=code==='auth/unauthorized-domain'?'Firebase Authentication 尚未授權 skyyip.github.io。請在 Firebase Console → Authentication → Settings → Authorized domains 加入該網域。':code==='auth/web-storage-unsupported'?'瀏覽器封鎖了登入所需的 Cookie／網站儲存功能，請允許網站資料後重試。':'請重新按 Google 登入；如持續發生，請提供此錯誤代碼以便排查。';console.error('Google redirect recovery error:',code,redirectError);if(!getCloudUser())openModal(`<h2>Google 登入未完成</h2><p>${detail}</p><small>${code}</small>`)}}).catch(e=>{ $('authBtn').disabled=true;$('authBtn').textContent='登入服務暫時不可用';$('authBtn').title=e.message||'Firebase 初始化失敗';console.error('Firebase initialization failed:',e) });if(challengeId&&getCloudUser())loadChallengeContext();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));


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
