import {BANK,AIR_BANK,MIXED_BANK,FACTIONS} from './questions.js';import {beep,setMuted,isMuted} from './audio.js';import {loadSave,save,addCoins,addCard} from './storage.js';import {drawPoster,exportPoster} from './poster/poster.js';import {initCloud,getCloudUser,signInGoogle,signInEmail,signUpEmail,signInAnonymous,signOutGoogle,saveCloudProfile,recordCloudRun,getCloudRuns,getLeaderboard,createChallenge,joinChallenge,submitChallengeResult,getChallenge} from './firebase/cloud.js';
const $=id=>document.getElementById(id);const icon=(name,cls='ui-icon')=>`<img class="${cls}" src="./assets/icons/${name}.png" alt="" aria-hidden="true">`;const questionIcons={'✨':'spark','🧠':'spark','⚡':'lightning','🐶':'dog','🐱':'cat','💅':'woman','🧢':'man','🫶':'duo'};const factionIllustrations={women:'woman',men:'man',dog:'dog',cat:'cat',duo:'duo'};const illustration=name=>{const emoji={woman:'💅',man:'🧢',dog:'🐶',cat:'🐱',duo:'🫶',scratch:'✨'}[name]||'👀';const src=new URL(`../assets/illustrations/${name}.webp`,import.meta.url).href;return `<img class="scene-illustration" src="${src}" alt="" aria-hidden="true" loading="eager" decoding="async" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'scene-fallback',textContent:'${emoji}'}))">`};const screens=['home','game','result','collection'];let challengeId=new URLSearchParams(location.search).get('challenge'),challengeData=null,challengeSeed=null,challengeRunPending=false,challengeLoading=false;let faction='women',mode='mixed',questions=[],questionCount=15,airScores=[0,0,0,0,0],classicCorrect=0,index=0,hp=100,correct=0,coins=0,streak=0,hints=2,timer=30,tick=null,interactionTimer=null,interactionDone=false,interactionPenaltyApplied=false,answered=false,runId=0,lastResult=null,saveData=loadSave();
const quotes=['死因：你竟然選了這個。','死因：自信得令人擔心。','死因：你把「隨便」當成真的。','死因：讀空氣能力仍在下載。','死因：這題你真的想太久。'];
function seededShuffle(items,seed){let state=seed>>>0;const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296};const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[out[i],out[j]]=[out[j],out[i]]}return out}
function show(name){screens.forEach(s=>$(s).classList.toggle('hidden',s!==name));window.scrollTo({top:0,behavior:'smooth'})}function shuffle(a){return [...a].sort(()=>Math.random()-.5)}function updateSaveUI(){saveData=loadSave();$('cardCount').textContent=saveData.cards.length}
function selectFaction(id){faction=id;document.querySelectorAll('.faction-card').forEach(b=>b.classList.toggle('selected',b.dataset.faction===id));if(id==='duo'&&saveData.runs<3){openModal(`<h2>🔒 雙人默契模式</h2><p>再完成 ${3-saveData.runs} 場挑戰即可解鎖。先去其他陣營累積求生經驗吧！</p>`);faction='women';document.querySelector('[data-faction="women"]').classList.add('selected');document.querySelector('[data-faction="duo"]').classList.remove('selected')}}
function openModal(html){$('modalContent').innerHTML=html;$('modal').showModal()}function start(){if(challengeId&&!getCloudUser()){openModal('<h2>先登入才能接受挑戰</h2><p>使用 Google 登入後即可開始朋友邀請的挑戰。</p>');return}if(faction==='duo'&&saveData.runs<3&&!challengeRunPending)return;const pick=(pool,count,offset)=>{const ordered=challengeRunPending&&challengeSeed!=null?seededShuffle(pool,challengeSeed+offset):shuffle(pool);return ordered.slice(0,count)};const classic=pick(BANK[faction],6,11).map(q=>({...q,kind:'classic',legacyIndex:BANK[faction].indexOf(q)}));const air=pick(AIR_BANK[faction],5,23).map(q=>({...q,kind:'air'}));const hybrid=pick(MIXED_BANK[faction],4,37).map(q=>({...q,kind:'hybrid',correct:q.profiles.reduce((best,profile,i,all)=>profile.reduce((s,v)=>s+v,0)>all[best].reduce((s,v)=>s+v,0)?i:best,0)}));const pool=[...classic,...air,...hybrid];questions=challengeRunPending&&challengeSeed!=null?seededShuffle(pool,challengeSeed+53):shuffle(pool);questionCount=15;index=0;hp=100;correct=0;classicCorrect=0;coins=0;streak=0;hints=2;airScores=[0,0,0,0,0];runId=saveData.runs+1;show('game');renderQuestion()}
function renderQuestion(){clearInterval(tick);clearTimeout(interactionTimer);answered=false;interactionDone=false;interactionPenaltyApplied=false;timer=30;const q=questions[index];$('runCoins').textContent=`${coins} SC`;$('roundFaction').textContent=FACTIONS[faction].name+' · 雙重求生';$('questionNo').textContent=String(index+1).padStart(2,'0');$('game').querySelector('.game-title h2 small').textContent=` / ${questionCount}`;$('hpValue').textContent=hp;$('hpBar').style.width=hp+'%';$('hpBar').style.background=hp<=30?'#ef5350':hp<=60?'#ffe853':'#80d77c';$('timer').textContent='30.0';$('timer').parentElement.classList.remove('hidden');$('timer').classList.remove('danger');$('questionTag').textContent=`${String(index+1).padStart(2,'0')} · ${{classic:'經典求生',air:'閱讀空氣',hybrid:'混合情境'}[q.kind]}`;$('questionDifficulty').textContent=index<3?'WARM UP':index<7?'STRESS':'HELL MODE';$('questionVisual').innerHTML=`${illustration(factionIllustrations[faction]||'woman')}<small>${FACTIONS[faction].name} · 現場觀察</small>`;$('questionText').textContent=q.text;$('questionHint').textContent='';$('answers').innerHTML='';q.opts.forEach((o,i)=>{const b=document.createElement('button');b.className='answer-btn';b.textContent=String.fromCharCode(65+i)+'. '+o;b.addEventListener('click',()=>answer(i));$('answers').append(b)});$('interaction').classList.add('hidden');$('hintLeft').textContent=`× ${hints}`;$('pigHintBtn').classList.toggle('hidden',q.kind!=='classic');$('hintLeft').classList.toggle('hidden',q.kind!=='classic');$('pigHintBtn').disabled=q.kind!=='classic'||hints<=0||hp<=5;$('progressDots').innerHTML=Array.from({length:questionCount},(_,i)=>`<i class="${i<index?'done':''}"></i>`).join('');if(q.kind==='classic')startInteraction(q.legacyIndex);else $('interaction').classList.add('hidden');tick=setInterval(()=>{timer=Math.max(0,timer-.1);$('timer').textContent=timer.toFixed(1);if(timer<=3){$('timer').classList.add('danger');if(Math.round(timer*10)%5===0)beep('tick')}if(timer<=0){clearInterval(tick);if(!answered){hp=Math.max(0,hp-40);streak=0;beep('bad');feedback('時間到！−40 HP');}}},100)}
function feedback(msg){answered=true;clearTimeout(interactionTimer);$('questionHint').textContent=msg;document.querySelector('.question-card').classList.add('shake');setTimeout(()=>document.querySelector('.question-card')?.classList.remove('shake'),300);setTimeout(()=>{if(hp<=0)finish(false);else nextQuestion()},850)}
function answer(choice){if(answered)return;answered=true;clearInterval(tick);clearTimeout(interactionTimer);const q=questions[index],buttons=[...$('answers').children];if(q.kind!=='classic'){answerAir(choice,q,buttons);return;}if(choice===q.correct)classicCorrect++;if(!interactionDone&&!interactionPenaltyApplied&&q.legacyIndex===3){hp=Math.max(0,hp-12);interactionPenaltyApplied=true;$('questionHint').textContent='連打任務未完成！−12 HP';}if(!interactionDone&&!interactionPenaltyApplied&&q.legacyIndex===7){hp=Math.max(0,hp-10);interactionPenaltyApplied=true;$('questionHint').textContent='未能完成按住確認！−10 HP';}if(!interactionDone&&!interactionPenaltyApplied&&q.legacyIndex===6&&(faction==='dog'||faction==='cat')){hp=Math.max(0,hp-8);interactionPenaltyApplied=true;$('questionHint').textContent='救援任務失敗！−8 HP';}buttons.forEach(b=>b.disabled=true);if(choice===q.correct){correct++;streak++;const base=interactionDone?12:8,combo=Math.min((streak-1)*2,10),gain=base+combo;coins+=gain;$('runCoins').textContent=`${coins} SC`;buttons[choice].style.background='#a8ef9b';beep('good');$('questionHint').textContent=`答對！${streak>1?`🔥 ${streak} 連擊！`:''} +${gain} SC。${q.why}`}else{streak=0;const damage=25+(index>=7?10:0);hp=Math.max(0,hp-damage);buttons[choice].style.background='#ffb4b4';buttons[q.correct].style.background='#a8ef9b';beep('bad');$('questionHint').textContent=`答錯！−${damage} HP。${q.why} 豬隊友：我剛剛也是這樣選。`}updateHP();setTimeout(()=>{if(hp<=0)finish(false);else nextQuestion()},1150)}
function answerAir(choice,q,buttons){
  const profile=q.profiles[choice];profile.forEach((value,i)=>airScores[i]+=value);
  const rawQuality=profile.reduce((sum,value)=>sum+value,0);const quality=q.kind==='hybrid'&&choice!==q.correct?Math.min(rawQuality,11):q.kind==='hybrid'?Math.max(rawQuality,16):rawQuality;
  const damage=quality>=16?0:quality>=12?8:quality>=8?16:24;hp=Math.max(0,hp-damage);
  if(quality>=12){correct++;streak++;const gain=6+Math.min((streak-1)*2,6);coins+=gain;$('runCoins').textContent=coins+' SC';buttons[choice].style.background='#a8ef9b';beep('good');$('questionHint').textContent='判斷不錯！'+(streak>1?'🔥 '+streak+' 連擊！':'')+' +'+gain+' SC。'+q.why}
  else{streak=0;buttons[choice].style.background='#ffb4b4';beep('bad');$('questionHint').textContent='現場訊號未完全讀懂。−'+damage+' HP。'+q.why}
  buttons.forEach(b=>b.disabled=true);updateHP();setTimeout(()=>{if(hp<=0)finish(false);else nextQuestion()},1350);
}
function nextQuestion(){index++;if(index>=questionCount)finish(hp>0);else renderQuestion()}
function startInteraction(i){const host=$('interaction');host.classList.remove('hidden');if(i===1){host.innerHTML=`${illustration('scratch')}<h4>${icon('sponge')} 刮開怒氣黑霧</h4><p>擦掉 45% 即可揭曉</p><canvas class="scratch-pad" id="scratch" width="620" height="180"></canvas><div class="meter"><span id="scratchMeter"></span></div>`;setupScratch()}else if(i===3){host.innerHTML=`${illustration(factionIllustrations[faction]||'duo')}<h4>${icon('lightning')} 3 秒連打</h4><p>連按 15 次</p><button class="tap-button" id="tapBtn">我錯了對不起！ <b id="tapCount">0/15</b></button><div class="meter"><span id="tapMeter"></span></div>`;setupTap()}else if(i===5){host.innerHTML=`${illustration(factionIllustrations[faction]||'woman')}<h4>${icon('sneaker')} 逃跑選項</h4><p>抓緊時機點選</p>`;const b=[...$('answers').children][Math.min(2,$('answers').children.length-1)];b.classList.add('runaway-answer');let tries=0;b.addEventListener('pointerenter',()=>{if(tries++<5){b.style.transform=`translate(${Math.random()*110-55}px,${Math.random()*70-35}px)`;beep('click')}});b.addEventListener('focus',()=>b.style.transform='none')}else if(i===7){host.innerHTML=`${illustration(factionIllustrations[faction]||'duo')}<h4>${icon('press')} 按住 1.6 秒</h4><p>中途放手即失敗</p><button class="hold-zone" id="holdBtn">按住承諾</button><div class="meter"><span id="holdMeter"></span></div>`;setupHold()}else if(i===6&&faction==='dog'){host.innerHTML=`${illustration('dog')}<h4>${icon('dog')} 肉泥救援</h4><p>3 秒內出手</p><button class="tap-button" id="treatBtn">${icon('treat')} 遞上肉泥</button>`;let done=false;$('treatBtn').onclick=()=>{if(!done){done=true;interactionDone=true;$('questionHint').textContent='成功分散注意力！本題互動獎勵已啟動。';beep('good')}};interactionTimer=setTimeout(()=>{if(!done){done=true;host.innerHTML+='<p>肉泥來不及了！</p>';hp=Math.max(0,hp-8);interactionPenaltyApplied=true;updateHP()}},3000)}else if(i===6&&faction==='cat'){host.innerHTML=`${illustration('cat')}<h4>${icon('paw-cup')} 貓掌突襲</h4><p>3 秒內保住杯子</p><button class="tap-button" id="cupBtn">${icon('paw-cup')} 保護杯子！</button>`;let done=false;$('cupBtn').onclick=()=>{if(!done){done=true;interactionDone=true;beep('good');$('questionHint').textContent='杯子保住了！你獲得互動獎勵。'}};interactionTimer=setTimeout(()=>{if(!done){done=true;hp=Math.max(0,hp-8);interactionPenaltyApplied=true;updateHP();host.innerHTML+='<p>杯子已經落地了……−8 HP</p>'}},3000)}else{host.innerHTML=`<h4>${icon('pig')} 豬隊友觀察中</h4><p>保持冷靜，讀完題目再作答。你可以隨時選擇答案。</p>`;host.classList.add('hidden')}}
function updateHP(){$('hpValue').textContent=hp;$('hpBar').style.width=hp+'%'}
function setupTap(){let n=0,done=false;const btn=$('tapBtn');const stop=()=>{if(done)return;done=true;clearTimeout(interactionTimer);if(n>=15){interactionDone=true;$('questionHint').textContent='手速合格！+互動獎勵';beep('good')}else{hp=Math.max(0,hp-12);interactionPenaltyApplied=true;updateHP();$('questionHint').textContent='誠意不足！−12 HP';beep('bad')}};btn.addEventListener('click',()=>{if(done)return;n++;$('tapCount').textContent=`${n}/15`;$('tapMeter').style.width=Math.min(100,n/15*100)+'%';beep('click');if(n>=15)stop()});interactionTimer=setTimeout(stop,3000)}
function setupScratch(){const c=$('scratch'),ctx=c.getContext('2d');ctx.fillStyle='#888';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#fff';ctx.font='bold 30px sans-serif';ctx.fillText('擦掉怒氣黑霧！',180,100);ctx.globalCompositeOperation='destination-out';let down=false;function scratch(e){if(!down)return;const r=c.getBoundingClientRect(),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;ctx.beginPath();ctx.arc(x,y,27,0,Math.PI*2);ctx.fill();const d=ctx.getImageData(0,0,c.width,c.height).data;let clear=0;for(let i=3;i<d.length;i+=16)if(d[i]===0)clear++;const pct=clear/(d.length/16)*100;$('scratchMeter').style.width=pct+'%';if(pct>45&&!interactionDone){interactionDone=true;beep('good');$('questionHint').textContent='黑霧散開了！你找回一點理智。'}}c.addEventListener('pointerdown',e=>{down=true;c.setPointerCapture(e.pointerId);scratch(e)});c.addEventListener('pointermove',scratch);c.addEventListener('pointerup',()=>down=false);c.addEventListener('pointercancel',()=>down=false)}
function setupHold(){const b=$('holdBtn');let start=0,frame;function down(e){e.preventDefault();if(start)return;if(e.pointerId!==undefined)b.setPointerCapture(e.pointerId);start=performance.now();b.classList.add('holding');const loop=()=>{if(!start)return;const pct=Math.min(100,(performance.now()-start)/1600*100);$('holdMeter').style.width=pct+'%';if(pct>=100){interactionDone=true;start=0;b.classList.remove('holding');beep('good');$('questionHint').textContent='承諾成立！你成功撐住了。';return}frame=requestAnimationFrame(loop)};frame=requestAnimationFrame(loop)}function up(){if(!start)return;start=0;cancelAnimationFrame(frame);b.classList.remove('holding');$('holdMeter').style.width='0%';hp=Math.max(0,hp-10);interactionPenaltyApplied=true;updateHP();$('questionHint').textContent='中途放手！−10 HP';beep('bad')}b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();down(e)}});b.addEventListener('keyup',e=>{if(e.code==='Space')up()})}
function useHint(){if(questions[index]?.kind!=='classic'||hints<=0||hp<=5||answered)return;hints--;hp=Math.max(0,hp-5);updateHP();$('hintLeft').textContent=`× ${hints}`;$('pigHintBtn').disabled=hints<=0||hp<=5;const q=questions[index],wrong=q.opts.map((_,i)=>i).filter(i=>i!==q.correct);const misleading=wrong[Math.floor(Math.random()*wrong.length)];$('questionHint').innerHTML=`${icon('pig','ui-icon tiny-icon')} 豬隊友：「我覺得選 ${String.fromCharCode(65+misleading)} 啦！我通常都很準……大概。」（−5 HP）`;beep('bad')}
async function finish(survived){clearInterval(tick);clearTimeout(interactionTimer);const bonus=survived?20:0,total=coins+bonus;const dimensionNames=['觀察力','同理心','角色理解','洞察力','時機感'];const dimensions=airScores.map((score,i)=>({name:dimensionNames[i],score:Math.round(score/(9*4)*100)}));const airAverage=Math.round(dimensions.reduce((sum,item)=>sum+item.score,0)/dimensions.length);const understandingScore=Math.round(classicCorrect/6*100);const title=survived?(understandingScore>=80&&airAverage>=80?'默契雷達雙料大師':understandingScore>=70?'相處觀察專家':airAverage>=70?'氣氛捕捉高手':hp>=60?'驚險生還專家':'命硬但有進步'):'現實求生待加強';const quote=survived?'死因未明：對方暫時放過你。':quotes[Math.floor(Math.random()*quotes.length)];saveData=loadSave();saveData.coins+=total;saveData.runs++;saveData.bestHp=Math.max(saveData.bestHp,hp);save(saveData);lastResult={faction,mode:'mixed',questionCount,dimensions,airAverage,understandingScore,survived,hp,coins:total,correct,title,quote,run:saveData.runs};$('resultTitle').textContent=survived?'你竟然活下來了！':'你被現實擊倒了';$('resultSubtitle').textContent='個性理解、現場觀察與情境判斷，三方面一起結算。';$('resultCorrect').previousElementSibling.textContent='TOTAL READS';$('resultHp').textContent=hp;$('resultCoins').textContent=`${total} SC`;$('resultCorrect').textContent=`${correct} / ${questionCount}`;$('resultQuote').textContent=quote;$('airReport').classList.remove('hidden');$('airReport').innerHTML=`<div class="air-report-head"><strong>雙重求生能力分析</strong><b>${Math.round((understandingScore+airAverage)/2)}<small> / 100</small></b></div><div class="air-score-row"><span>了解對方</span><div class="air-score-track"><i style="width:${understandingScore}%"></i></div><b>${understandingScore}</b></div><div class="air-score-row"><span>讀懂氣氛</span><div class="air-score-track"><i style="width:${airAverage}%"></i></div><b>${airAverage}</b></div>${dimensions.map(item=>`<div class="air-score-row"><span>${item.name}</span><div class="air-score-track"><i style="width:${item.score}%"></i></div><b>${item.score}</b></div>`).join('')}<p>6 題經典題考驗你對對方的日常理解；另外 9 題情境題分析你如何觀察線索、理解情緒及選擇時機。</p>`;await drawPoster(lastResult,$('posterPreview'));beep(survived?'win':'lose');updateSaveUI();show('result');if(getCloudUser()){saveCloudProfile(saveData).catch(console.error);recordCloudRun(lastResult).catch(console.error);if(challengeId&&challengeRunPending){submitChallengeResult(challengeId,lastResult).catch(e=>openModal(`<h2>挑戰結果同步失敗</h2><p>${e.message}</p>`));challengeRunPending=false}}}
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
    openModal(`<h2>歷史戰績</h2><p class="score-intro">最近 30 場雲端同步紀錄</p>${content}`);
  }catch(e){openModal(`<h2>讀取失敗</h2><p>${e.message}</p>`)}
}
async function showLeaderboard(){
  try{
    const rows=await getLeaderboard();
    const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const content=rows.length?'<div class="score-list leaderboard-list"><div class="leaderboard-head"><span>排名</span><span>玩家</span><span>最高 HP</span><span>答對</span></div>'+rows.map((r,i)=>`<article class="leaderboard-row ${i<3?'top-rank':''}"><b class="rank-number">${i+1}</b><strong class="leader-name">${safe(r.displayName||'玩家')}</strong><b class="leader-hp">${Number(r.bestHp)||0}<small> HP</small></b><b class="leader-correct">${Number(r.bestCorrect)||0}<small>/15</small></b></article>`).join('')+'</div>':'<p class="score-empty">目前還沒有排行榜資料，完成挑戰後即可上榜。</p>';
    openModal(`<h2>排行榜 TOP 50</h2><p class="score-intro">依最高剩餘 HP 排序；玩家自評榜單，並非防作弊競技排名。</p>${content}`);
  }catch(e){openModal(`<h2>排行榜暫時無法讀取</h2><p>${e.message}</p>`)}
}
async function showChallengeStatus(){
  if(!getCloudUser()){openModal('<h2>請先 Google 登入</h2><p>登入後才能查看好友挑戰成績。</p>');return}
  if(!challengeId){openModal('<h2>尚未建立好友挑戰</h2><p>先建立邀請連結並完成自己的挑戰。</p>');return}
  try{const d=await getChallenge(challengeId);if(!d){openModal('<h2>找不到挑戰</h2><p>邀請可能已失效。</p>');return}
    const score=r=>r?`${r.hp} HP · ${r.correct}/15 題答對 · ${r.survived?'生還':'未生還'}`:'尚未完成';
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
    try{await action();$('modal').close()}
    catch(error){
      const messages={
        'auth/invalid-email':'Email 格式不正確。','auth/invalid-credential':'Email 或密碼不正確。',
        'auth/wrong-password':'Email 或密碼不正確。','auth/user-not-found':'找不到這個 Email 帳戶。',
        'auth/email-already-in-use':'這個 Email 已註冊，請直接登入。','auth/weak-password':'密碼至少需要 6 個字元。',
        'auth/operation-not-allowed':'Firebase Console 尚未啟用此登入方式。',
        'auth/credential-already-in-use':'這個 Email 已綁定其他帳戶，請先登出訪客帳戶再登入。',
        'auth/provider-already-linked':'此帳戶已綁定 Email／密碼。','auth/network-request-failed':'網路連線失敗，請稍後再試。'
      };
      feedback.textContent=messages[error.code]||`登入失敗：${error.message||'請稍後再試。'}`;
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
    {name:'求生菜鳥',rarity:'N',chance:42},{name:'空氣閱讀員',rarity:'N',chance:25},
    {name:'冷靜觀察家',rarity:'R',chance:14},{name:'情緒拆彈手',rarity:'R',chance:10},
    {name:'傳說級讀心者',rarity:'SR',chance:5},{name:'人類使用說明書',rarity:'SR',chance:2},
    {name:'行走式測謊機',rarity:'SSR',chance:1},{name:'宇宙級讀空氣王',rarity:'UR',chance:1}
  ];
  const cost=30;saveData=loadSave();$('collectionCoins').textContent=`${saveData.coins} SC`;$('collectionGrid').innerHTML='';
  cards.forEach(card=>{const owned=saveData.cards.includes(card.name),d=document.createElement('div');d.className='collect-card '+(!owned?'locked':'');d.innerHTML=`<span class="rarity">${card.rarity}</span><strong>${owned?card.name:'???'}</strong><small>${owned?'已收藏 · 關係求生紀念卡':'尚未收藏'}</small>`;$('collectionGrid').append(d)});
  const g=document.createElement('button');g.className='primary-btn draw-card-btn';g.textContent=`花費 ${cost} SC 抽一張卡`;g.disabled=saveData.coins<cost;g.onclick=()=>{
    const s=loadSave();if(s.coins<cost)return;s.coins-=cost;
    const roll=Math.random()*100,chosen=cards.find((card,i)=>roll<cards.slice(0,i+1).reduce((sum,item)=>sum+item.chance,0))||cards[0];
    if(s.cards.includes(chosen.name)){s.coins+=15;save(s);openModal(`<h2>重複卡！轉換成 15 SC</h2><p>再次抽到「${chosen.name}」，已自動回收一半抽卡費用。</p>`)}
    else{s.cards.push(chosen.name);save(s);openModal(`<h2>🎉 ${chosen.rarity} 卡入手！</h2><p>你抽到「${chosen.name}」！</p><p>收藏卡只作紀念，不影響遊戲公平性。</p>`)}
    if(getCloudUser())saveCloudProfile(s).catch(console.error);
    updateSaveUI();showCollection();
  };
  $('collectionGrid').append(g);show('collection')
}
$('authBtn').onclick=async()=>{try{if(getCloudUser()&&!getCloudUser().isAnonymous)await signOutGoogle();else showAuthModal()}catch(e){openModal(`<h2>登出失敗</h2><p>${e.message}</p>`)}};$('leaderboardBtn').onclick=showLeaderboard;$('historyBtn').onclick=showHistory;$('inviteBtn').onclick=makeChallenge;$('challengeAgainBtn').onclick=makeChallenge;$('challengeStatusBtn').onclick=showChallengeStatus;$('homeLink').onclick=e=>{e.preventDefault();if(!$('game').classList.contains('hidden')){$('quitBtn').click();return}if(!$('modal').open)show('home')};$('startBtn').onclick=start;$('factionGrid').addEventListener('click',e=>{const b=e.target.closest('[data-faction]');if(b)selectFaction(b.dataset.faction)});$('howBtn').onclick=()=>openModal('<h2>雙重求生玩法</h2><ol><li>每局 15 題：6 題經典求生、5 題閱讀空氣、4 題混合情境，題型會隨機交錯。</li><li>每題 30 秒，初始 100 HP；答錯會扣血，超時扣 40 HP。</li><li>經典題保留互動任務及豬隊友提示；情境題按觀察力、同理心、角色理解、洞察力及時機感評分。</li><li>答對或作出合適判斷可獲 SC，連擊有額外獎勵，完成整局再獲 20 SC。</li><li>每次抽卡消耗 30 SC；抽中重複卡會回收 15 SC。</li><li>結果會分開顯示「了解對方」及「讀懂氣氛」兩項能力。</li></ol><p>本遊戲純屬娛樂，不代表真實人物心理或動物行為診斷。</p>');$('quitBtn').onclick=()=>openModal('<h2>確定放棄治療？</h2><p>離開本局不會獲得求生幣或紀錄。</p><button class="primary-btn" id="confirmQuit">確認離開</button>');$('modalContent').addEventListener('click',e=>{if(e.target.id==='confirmQuit'){$('modal').close();clearInterval(tick);clearTimeout(interactionTimer);show('home')}});$('pigHintBtn').onclick=useHint;$('collectionBtn').onclick=showCollection;$('backBtn').onclick=()=>show('home');$('againBtn').onclick=start;$('downloadPoster').onclick=download;$('sharePoster').onclick=share;$('soundBtn').onclick=()=>{setMuted(!isMuted());$('soundBtn').classList.toggle('is-muted',isMuted());$('soundBtn').setAttribute('aria-label',isMuted()?'開啟音效':'關閉音效')};$('modalClose').onclick=()=>$('modal').close();updateSaveUI();initCloud(user=>{const b=$('authBtn');b.textContent=user?(user.isAnonymous?'訪客 · 升級':`登出 · ${(user.displayName||user.email||'玩家').slice(0,8)}`):'登入';updateSaveUI();if(user&&challengeId&&!challengeData)loadChallengeContext()}).then(({ready})=>{if(!ready){$('authBtn').disabled=true;$('authBtn').textContent='Google 登入未設定';$('authBtn').title='請先設定 Firebase Web App';['leaderboardBtn','historyBtn','inviteBtn','challengeAgainBtn','challengeStatusBtn'].forEach(id=>$(id).disabled=true)}}).catch(e=>openModal(`<h2>Firebase 初始化失敗</h2><p>${e.message}</p>`));if(challengeId&&getCloudUser())loadChallengeContext();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
