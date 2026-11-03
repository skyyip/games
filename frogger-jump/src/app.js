import {rankBadge} from './badges.js';
import {renderAnimalIcon} from './animal-icons.js';
import {PLATFORM_COPY} from './platforms.js';
import {RiverPlayers} from './social.js';
import {animal,rewardCoins} from './animals.js';
import {FroggerGame,powerColor,SPLASH_MS} from './game.js';
import {RiverScene} from './scene.js';import {RECORD_KEY,readRecords,addRecord,mergeRecords} from './records.js';
import {getLanguage} from '../../grid-rush/src/language.js';
const nodes=new Map(),$=id=>{if(!nodes.has(id))nodes.set(id,document.getElementById(id));return nodes.get(id);},game=new FroggerGame(),preview=new FroggerGame({random:()=>.43,now:()=>0}),scene=new RiverScene($('scene'));preview.start();preview.state='ready';
const copy={
 skip:['前往遊戲','Skip to game'],allGames:['← 所有遊戲','← All games'],titleA:['蓄力','Frogger Jump'],titleB:['連連跳','2.5D.'],streak:['連跳','JUMPS'],best:['歷史最高','PERSONAL BEST'],power:['蓄力','POWER'],threeLogs:['三落點視野','THREE PADS AHEAD'],welcomeKicker:['一隻手指，跳出一條生路。','ONE FINGER. ONE WAY FORWARD.'],welcomeTitle:['準備好，蛙一聲！','Ready, steady… ribbit!'],welcomeNote:['青蛙會自動瞄準。看準距離，在剛好的力度放手。','Frog aims for you. Read the gap and release at just the right power.'],start:['開始跳躍 ↗','Let’s hop ↗'],hold:['按住蓄力 · 放手起跳','Hold to charge · release to hop'],controls:['手指／滑鼠長按畫面，或按住空白鍵。','Hold the screen, mouse button, or Space.'],pauseTitle:['休息一小下。','Take a little breather.'],pauseNote:['蓄力、沉木及燈籠魚倒數已暫停。準備好再出發。','Power, sinking logs and anglerfish are paused. Continue when you’re ready.'],resume:['繼續跳躍 ↗','Keep hopping ↗'],quit:['返回河岸','Back to the riverbank'],resultKicker:['跳躍有盡時，求生無上限。','A LITTLE SPLASH. A FRESH START.'],you:['你','You'],jumps:['次連跳','jumps'],again:['再挑戰一次 ↗','One more hop ↗'],fieldNotes:['河岸求生筆記','NOTES FROM THE RIVERBANK'],guideTitle:['跳得遠，不如跳得準。','Go for precision.'],guideHold:['按住，再放手','Hold. Then let go.'],guideHoldNote:['力度來回增減，蓄力條由幼到粗、綠變黃再變紅。睇準落點放手。','Power rises and falls. The tapered bar widens and shifts green, yellow, then red. Release for the right gap.'],guideRoute:['I 字直跳，Z 字斜跳','Straight I, zigzag Z'],guideRouteNote:['木樁與睡蓮都有大有小。有荊棘會瞄準後方；也可用技能清走。','Logs and lilies come in different sizes. Skip thorns or use your animal’s skill to clear them.'],guideSink:['小落點、下沉陷阱、燈籠魚！','Small pads, sinking traps, fish!'],guideSinkNote:['限時落點 2.5 秒內跳走。魚燈預警後會躍起；避開空中的魚再跳。每局 1 次技能，每 20 跳再加 1 次。','Leave sinking pads in 2.5s. Watch the fish warning and time your hop around its leap. Start with one skill use; earn another every 20 landings.'],recordsTitle:['本機最會跳的三次。','This device’s best three.'],sideCaption:['水很清。鱷魚很餓。<br>今天就靠你這根手指。','Clear water. Hungry crocodile.<br>It all comes down to one finger.'],footer:['一跳一呼吸，慢慢過河。','One breath. One hop. Find your rhythm.']
};
const attr=(node,key,value)=>{value=String(value);if(node.getAttribute(key)!==value)node.setAttribute(key,value);};
const disable=(node,value)=>{if(node.disabled!==value)node.disabled=value;};
const local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en,put=(node,text)=>{if(node.textContent!==String(text))node.textContent=text;};
let activeRun=null,startBusy=false;
let records=[],persistent=true,frame=0,frameTimer=0,lastDraw=-Infinity,pointer=null,keyboard=null,saved=false,flashUntil=0,lastRoute='',meterTransform='',audioContext=null,audioTimer=0,sound=false;
try{records=readRecords(localStorage.getItem(RECORD_KEY));sound=localStorage.getItem('frogger-jump.sound.v1')==='true';}catch{persistent=false;}
Object.assign(copy,{forgotPassword:['忘記密碼？','Forgot password?'],retryProfile:['重新讀取雲端存檔','Retry loading cloud save'],googleLogin:['使用 Google 登入','Continue with Google'],anonymousLogin:['匿名登入','Play anonymously'],platformTitle:['七款河岸新朋友','Meet the river’s seven new pads'],

 currencyName:['青蛙幣','Frog Coins'],walletScope:['試玩與登入後的錢包分開保存；試玩青蛙幣不會自動轉入帳戶。','Practice and account wallets are separate. Practice Frog Coins are not imported into an account.'],
 coinRule:['完成一局 1 青蛙幣；每次成功落地 +2；每 20 跳額外 +10；荷花中心 +2、貝殼中心 +3。','Earn 1 Frog Coin per run, 2 per landing, plus 10 every 20 hops. Lotus centres add 2 and shell centres add 3.'],
 profileButton:['登入','Sign in'],animalButton:['動物商店','Animal shop'],shopActionNote:['揀個小夥伴','Pick a pal'],boardButton:['世界排行','World ranks'],profileTitle:['河岸上，你叫咩名？','What’s your river name?'],guestLabel:['試玩名字（不佔用雲端名稱）','Practice name (not reserved online)'],nameRule:['2–16 個中文字、英文字母、數字、_ 或 -；英文不分大小寫。','2–16 Chinese characters, letters, numbers, _ or -. Names ignore letter case.'],guestPlay:['本機試玩 ↗','Play locally ↗'],accountMode:['帳戶選項','Account'],uniqueName:['唯一玩家名字','Unique player name'],password:['密碼（最少 8 位）','Password (8 characters minimum)'],cloudConnect:['登入 ↗','Sign in ↗'],logout:['登出，改用本機試玩','Sign out and play locally'],shopKicker:['金色青蛙幣，帶新朋友過河','GOLDEN FROG COINS. NEW RIVER FRIENDS.'],shopTitle:['今日邊個陪你跳？','Who’s hopping with you?'],skillRule:['每局 1 次技能；每成功落地 20 次再加 1 次，累積不設上限。','One skill use per run; earn another every 20 successful landings, with no cap.'],boardKicker:['一人一席，只取個人最佳','ONE PLACE PER PLAYER. PERSONAL BESTS.'],boardTitle:['世界英雄榜 · 前 10 名','World heroes · Top 10'],refreshBoard:['重新整理','Refresh'],boardNote:['顯示已同步的玩家名字、最高連跳及當時使用的動物。更新間隔最少 10 秒。','Rankings show each player’s best run and the animal used. Refresh no more than once per 10 seconds.']
});
for(const [kind,pair]of Object.entries(PLATFORM_COPY))copy['pad-'+kind]=pair;
const players=new RiverPlayers({t:local,onPlay:()=>start(),onChange:()=>{if(game.state==='ready'){preview.start({animal:players.profile.selected});preview.state='ready';scene.reset();}paint();}});
preview.start({animal:players.profile.selected});preview.state='ready';scene.reset();
if(records[0]?.score>players.guest.best){players.guest.best=records[0].score;players.saveGuest();}
const model=()=>game.state==='ready'?preview:game;
function audio(pitch=380){if(!sound)return;try{audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume().catch(()=>{});clearTimeout(audioTimer);const o=audioContext.createOscillator(),v=audioContext.createGain(),at=audioContext.currentTime;o.type='sine';o.frequency.setValueAtTime(pitch,at);o.frequency.exponentialRampToValueAtTime(pitch*.55,at+.15);v.gain.setValueAtTime(.055,at);v.gain.exponentialRampToValueAtTime(.001,at+.18);o.connect(v);v.connect(audioContext.destination);o.start();o.stop(at+.2);audioTimer=setTimeout(()=>audioContext?.suspend().catch(()=>{}),600);}catch{}}
function silence(){clearTimeout(audioTimer);audioContext?.suspend().catch(()=>{});}
function buzz(value){try{navigator.vibrate?.(value);}catch{}}
function announce(text){put($('announcements'),text);}
function renderRecords(){
 $('records').replaceChildren();if(!records.length){const li=document.createElement('li');li.textContent=local('下一次，就係你的代表作。','Your next hop could be the one.');$('records').append(li);}
 for(const [index,record]of records.entries()){const li=document.createElement('li'),medal=document.createElement('span'),label=document.createElement('span'),value=document.createElement('b');medal.className='medal';medal.innerHTML=rankBadge(index+1);medal.setAttribute('role','img');medal.setAttribute('aria-label',local(`第 ${index+1} 名`,`Rank ${index+1}`));label.textContent=new Date(record.at).toLocaleDateString(getLanguage()==='zh-Hant'?'zh-Hant':'en',{month:'short',day:'numeric'});value.textContent=record.score;li.append(medal,label,value);$('records').append(li);}
 put($('storage-note'),persistent&&players.persistent?local('最高三次，保存在這部裝置。','Top three runs, saved on this device.'):local('此頁暫存紀錄；瀏覽器未允許永久儲存。','Records last for this visit; storage is unavailable.'));
}
function language(){
 for(const node of document.querySelectorAll('[data-copy]')){const pair=copy[node.dataset.copy];if(!pair)continue;const target=node.querySelector('.champion-label')??node,targetText=pair[getLanguage()==='zh-Hant'?0:1];if(target.innerHTML!==targetText)target.innerHTML=targetText;}
 $('sound-mark').setAttribute('d',sound?'M17 8q6 4 0 8M17 4q12 8 0 16':'m17 9 5 6m0-6-5 6');for(const button of document.querySelectorAll('[data-close]'))button.setAttribute('aria-label',local('關閉','Close'));put($('retry-sync'),local('重新同步','Retry sync'));scene.zh=getLanguage()==='zh-Hant';$('pause').setAttribute('aria-label',local('暫停遊戲','Pause game'));$('sound').setAttribute('aria-label',sound?local('關閉音效','Mute sound'):local('開啟音效','Enable sound'));$('sound').setAttribute('aria-pressed',String(sound));$('jump-control').setAttribute('aria-label',local('按住蓄力，放手跳躍；空白鍵亦可操作。','Hold to charge, release to jump. Space works too.'));$('charge-meter').setAttribute('aria-label',local('蓄力強度','Jump power'));
 for(const id of ['pause-close'])$(id).setAttribute('aria-label',local('繼續遊戲','Resume game'));$('result-close').setAttribute('aria-label',local('返回河岸','Back to the riverbank'));renderRecords();players.language();lastRoute='';paint();
}
function lock(value){document.body.classList.toggle('is-playing',value);for(const node of document.querySelectorAll('#site-header,#intro,#sidebar,#footer,#river-profile,.game-guide'))node.inert=value;}
function resetInput(){const held=pointer;pointer=null;keyboard=null;game.cancelCharge();$('hold-button').classList.remove('is-held');if(held)try{held.node.releasePointerCapture(held.id);}catch{}}
async function start(){
 if(startBusy)return;startBusy=true;$('start').disabled=true;$('again').disabled=true;
 try{const run=await players.prepareRun();if(!run)return;activeRun=run;attr($('play-hint'),'data-advice','');resetInput();silence();if($('result-dialog').open)$('result-dialog').close();$('result-celebration').hidden=true;if($('pause-dialog').open)$('pause-dialog').close();game.start({animal:run.animal});scene.reset();saved=false;flashUntil=0;lastRoute='';$('welcome').hidden=true;lock(true);$('jump-control').disabled=false;$('hold-button').disabled=false;$('pause').disabled=false;put($('play-hint'),local('看準下一塊，按住，再放手。','Read the next gap. Hold, then release.'));resize();$('jump-control').focus({preventScroll:true});wake();}
 catch(error){put($('play-hint'),players.error(error));if($('result-dialog').open){put($('reward-state'),players.error(error));$('retry-sync').hidden=!players.pending;}}
 finally{startBusy=false;$('start').disabled=false;$('again').disabled=false;}
}

function home(){attr($('play-hint'),'data-advice','');if(activeRun&&!saved)players.abandon(activeRun);activeRun=null;resetInput();stopFrames();silence();if($('pause-dialog').open)$('pause-dialog').close();if($('result-dialog').open)$('result-dialog').close();$('result-celebration').hidden=true;game.reset();scene.reset();$('welcome').hidden=false;lock(false);$('jump-control').disabled=true;$('hold-button').disabled=true;$('pause').disabled=true;put($('play-hint'),local('蓄力會來回，不會一直變大喔。','Power goes up, then down. Find your moment.'));resize();$('start').focus({preventScroll:true});}
function pause(){if(!game.pause())return;resetInput();stopFrames();silence();paint();$('pause-dialog').showModal();$('resume').focus({preventScroll:true});}
function resume(){if(!game.resume())return;$('pause-dialog').close();$('jump-control').focus({preventScroll:true});wake();}
function fallAdvice(reason=game.fall.reason){
 const tips={
  short:['↑ 跳唔夠！下次蓄力耐少少。\n趁蓄力條上升時放手。','↑ Too short! Hold a little longer next time.\nRelease while the power bar is rising.'],
  long:['↓ 跳過頭！下次蓄力短少少。\n趁蓄力條上升時，早啲放手。','↓ Too far! Hold for less time next time.\nRelease earlier while the power bar is rising.'],
  thorns:['↑ 未跨過荊棘！下次蓄力耐啲，跳到後面亮圈嘅落點。','↑ Missed the thorn clearance! Use more power to reach the highlighted pad beyond.'],
  angler:['跳到魚嘴喇！下次留意兩個落點中間的預警，等魚落水再跳。','Caught in midair! Watch the warning between pads and wait for the fish to dive before hopping.'],
  sunk:game.current.kind==='ice'?['冰塊收工喇！下次在 3.5 秒內跳走，或者用企鵝加固。','The ice clocked off! Hop within 3.5 seconds, or reinforce it with Penguin.']:['沉木收工喇！下次要在 2.5 秒內跳走。','That log clocked off! Hop away within 2.5 seconds.']
 };
 return {text:local(...(tips[reason]??['睇準落點同蓄力條，再試一次。','Read the gap and power bar, then try again.'])),direction:reason==='short'||reason==='thorns'?'more':reason==='long'?'less':'hazard'};
}
function result(){
 if(saved)return;saved=true;resetInput();$('pause').disabled=true;$('jump-control').disabled=true;$('hold-button').disabled=true;let prior=records;
 try{prior=mergeRecords(records,readRecords(localStorage.getItem(RECORD_KEY)));}catch{persistent=false;}
 const best=players.profile.best??0,newBest=game.score>best;records=addRecord(prior,game.score);
 if(game.score>0)try{localStorage.setItem(RECORD_KEY,JSON.stringify(records));}catch{persistent=false;}
 renderRecords();put($('final-score'),game.score);put($('result-best'),Math.max(best,game.score));put($('result-title'),newBest?local('蛙！新紀錄！','Ribbit! A new best!'):game.fall.reason==='angler'?local('魚：外賣送到！','Fish says: dinner delivered!'):local('鱷魚：多謝款待！','Croc says: thanks for lunch!'));
 const advice=fallAdvice();put($('result-reason'),advice.text);attr($('result-reason'),'data-advice',advice.direction);put($('record-notice'),newBest?local('本機最高紀錄，靚！','A fresh personal best. Beautiful!'):'');put($('result-player'),activeRun?.name||players.profile.name);$('result-celebration').classList.toggle('is-lost',game.score===0);$('result-celebration').hidden=false;$('result-dialog').showModal();$('again').focus({preventScroll:true});announce(local(`今次連跳 ${game.score} 次。`,`You made ${game.score} successful jumps.`));
 const run=activeRun,score=game.score;put($('earned-coins'),`+${rewardCoins(score,game.bonusCoins)}`);put($('reward-state'),run?.mode==='cloud'?local('正在同步 Firebase…','Syncing to Firebase…'):local('本機青蛙幣','Local Frog Coins'));$('retry-sync').hidden=true;
 if(run)players.settle(run,score,game.bonusCoins).then(done=>{if(activeRun?.id!==run.id)return;put($('earned-coins'),`+${done.reward}`);put($('reward-state'),run.mode==='cloud'?local('已存入錢包','Saved to wallet'):local('已存入本機錢包 · 不列入世界排行','Saved locally · unranked'));renderRecords();}).catch(error=>{if(activeRun?.id!==run.id)return;put($('reward-state'),players.error(error));$('retry-sync').hidden=!players.pending;});

}
function processEvents(){for(const event of game.drainEvents()){
 if(event.type==='jump'){scene.launch={at:game.jump.at,point:{...game.jump.from},r:game.current.r,kind:game.current.kind};audio(300+event.power*150);put($('play-hint'),local('走你！','Here we go!'));}
 if(event.type==='land'){scene.effect={at:game.landedAt,point:{x:game.current.x,y:game.current.y},r:game.current.r,kind:game.current.kind,perfect:event.perfect,bonus:event.bonus};flashUntil=game.landedAt+650;audio(event.perfect?680:510);buzz(12);const message=event.skipped?local('跨過荊棘！＋1','Thorns cleared! +1'):event.perfect?local('正中心落地！＋1','Dead centre! +1'):local('跳得靚！＋1','Lovely landing! +1');const feedback=event.bonus?local(`中心獎勵！＋${event.bonus} 青蛙幣`,`Centre bonus! +${event.bonus} Frog Coins`):event.soft?local('蘑菇氣墊！下一跳更易落地','Mushroom cushion! A softer next landing'):event.kind==='duck'?local('吱吱！小鴨送你一程…','Squeak! Duck gives you a short lift…'):message;put($('play-hint'),feedback);announce(feedback+(game.current.sinking?(event.kind==='ice'?local(' 冰塊，3.5 秒內跳走！',' Cracking ice: leave within 3.5 seconds!'):local(' 沉木，2.5 秒內跳走！',' Sinking log: hop away within 2.5 seconds!')):game.fish?local(' 前方有魚！看準魚躍時間再跳。',' Fish ahead! Time your hop around its leap.'):''));}
 if(event.type==='skill'){scene.skill=event;flashUntil=game.clock+650;audio(740);buzz(16);put($('play-hint'),local(`${animal(game.animal).skillZh}！`,`${animal(game.animal).skillEn}!`));lastRoute='';}
 if(event.type==='fish-warning')announce(local('前方魚燈預警！燈籠魚將在兩個落點中間躍起。','Fish warning ahead! An anglerfish will leap between the pads.'));
 if(event.type==='fish-blocked'){flashUntil=game.clock+650;audio(820);put($('play-hint'),local(`${animal(game.animal).skillZh}擋住魚嘴！`,`${animal(game.animal).skillEn} blocked the fish!`));announce(local('護盾已使用，安全通過燈籠魚。','Shield used. You passed the fish safely.'));}
 if(event.type==='skill-ready')announce(local('再有一次技能！','Another skill use earned!'));
 if(event.type==='fall'){resetInput();audio(115);buzz([12,35,18]);const advice=fallAdvice(event.reason);put($('play-hint'),advice.text);attr($('play-hint'),'data-advice',advice.direction);}
 if(event.type==='over')result();
}}
function paint(){
 const m=model();attr($('play-shell'),'data-state',game.state);disable($('hold-button'),!['idle','charging'].includes(game.state)||game.clock<game.slideUntil);disable($('jump-control'),$('hold-button').disabled);attr($('play-shell'),'data-paused',game.paused);attr($('river'),'data-fall-stage',['drowning','over'].includes(game.state)?(game.fall.reason==='angler'&&!game.fall.airborne&&game.clock-game.fall.at<SPLASH_MS?'splash':'predator'):'');put($('score'),game.score);put($('best'),Math.max(players.profile.best??0,game.score));
 const pct=Math.round(m.power*100);if($('charge-meter').getAttribute('aria-valuenow')!==String(pct)){$('charge-meter').setAttribute('aria-valuenow',pct);$('charge-fill').style.transform=`scaleX(${pct/100})`;$('frog-charge').style.setProperty('--power-color',powerColor(pct/100));}
 const kind=animal(m.animal);put($('skill-name'),local(kind.skillZh,kind.skillEn));renderAnimalIcon($('skill-icon'),kind.id,30);put($('skill-count'),m.skillCharges);disable($('skill-button'),game.paused||!['idle','charging'].includes(game.state)||game.skillCharges<1);attr($('skill-button'),'aria-label',local(`${kind.skillZh}，剩餘 ${m.skillCharges} 次`,`${kind.skillEn}, ${m.skillCharges} uses remaining`));
 const dx=m.target.x-m.current.x,route=dx===0?'I ↑':dx<0?'Z ↖':'Z ↗';put($('route'),route);
 const standing=['idle','charging'].includes(m.state),sink=m.current.sinking&&standing,fish=!!m.fish,fishPose=m.fish;
 $('hazard').classList.toggle('is-danger',sink||fish||m.targetIndex===2);
 put($('hazard'),sink?local(`下沉落點・${(m.sinkRemaining/1000).toFixed(1)} s`,`SINKING · ${(m.sinkRemaining/1000).toFixed(1)} s`):fish?(fishPose.phase==='warning'?local(`魚躍預警・${(fishPose.remaining/1000).toFixed(1)} s 後躍起`,`FISH WARNING · leaps in ${(fishPose.remaining/1000).toFixed(1)} s`):fishPose.phase==='leaping'?local('魚正在空中！等佢落水再跳','FISH IN MIDAIR · wait for it to dive'):local('魚已落水・看準時機跳','Fish submerged · choose your moment')):m.targetIndex===2?local('跨過荊棘，瞄準後方亮圈！','Skip thorns! Aim at the far ring'):m.target.sinking?(m.target.kind==='ice'?local(...PLATFORM_COPY.ice):local('下一塊沉木・落地後快跳','Next log sinks: keep moving')):m.target.angler?local('前方魚燈・留意落點中間','Fish ahead · watch the gap'):m.target.small?local('小落點，睇準力度！','Small pad: precise power!'):m.clock<m.slideUntil?local('小鴨滑行中…企穩再跳！','Duck slide… steady before charging!'):m.fishShield?local(`${kind.skillZh}：下一跳防魚護盾`,`${kind.skillEn}: next hop has a fish shield`):m.softLanding?local('軟綿保護：下一跳落腳範圍 +12','Soft landing: next hop tolerance +12'):PLATFORM_COPY[m.target.kind]?local(...PLATFORM_COPY[m.target.kind]):local('瞄準亮圈落點','Aim for the highlighted pad'));
 const key=m.current.id+'|'+getLanguage();if(key!==lastRoute){lastRoute=key;$('route-description').replaceChildren();for(const [i,s]of m.stumps.entries()){const li=document.createElement('li'),label=i===0?local('腳下','Current'):i===m.targetIndex?local('目標','Target'):s.thorns?local('跨過','Skip'):local('預備','Following'),type=s.thorns?local('荊棘','thorns'):PLATFORM_COPY[s.kind]?local(...PLATFORM_COPY[s.kind]):s.sinking?local('沉木','sinking log'):s.angler?local('燈籠魚','anglerfish lure'):s.kind==='lily'?local('睡蓮','water lily'):local('普通木樁','ordinary log');li.textContent=`${label}: ${s.small?local('小型 ','small '):''}${type}, ${s.route}.`;$('route-description').append(li);}}
 scene.draw(m);const anchor=scene.headAnchor,meter=$('frog-charge'),hidden=m.state!=='charging';if(meter.hidden!==hidden)meter.hidden=hidden;if(!hidden&&anchor){const x=Math.max(62,Math.min(scene.width-62,anchor.x)).toFixed(1),y=Math.max(86,anchor.y).toFixed(1),transform=`translate3d(${x}px,${y}px,0) translate(-50%,-100%)`;if(meterTransform!==transform){meterTransform=transform;meter.style.transform=transform;}}
}

// Schedule at the requested cadence instead of polling at the display refresh rate.
function stopFrames(){cancelAnimationFrame(frame);clearTimeout(frameTimer);frame=frameTimer=0;}
function scheduleFrame(){
 const fps=scene.reduced.matches||['idle','charging'].includes(game.state)?30:60,delay=Math.max(0,1000/fps-(performance.now()-lastDraw)-2);
 if(delay>4)frameTimer=setTimeout(()=>{frameTimer=0;frame=requestAnimationFrame(tick);},delay);
 else frame=requestAnimationFrame(tick);
}
function tick(at){
 frame=0;if(game.paused||document.hidden)return;game.update();processEvents();lastDraw=at;paint();
 if(game.needsAnimation||game.state==='idle'&&game.clock<flashUntil)scheduleFrame();
}
function wake(){
 if(frameTimer){clearTimeout(frameTimer);frameTimer=0;}
 if(!frame&&!game.paused&&!document.hidden){lastDraw=-Infinity;frame=requestAnimationFrame(tick);}
}
function resize(entries){const r=entries?.[0]?.contentRect??$('river').getBoundingClientRect();if(r.width&&r.height){scene.resize(r.width,r.height);paint();}wake();}
function begin(){if(!game.beginCharge())return false;$('hold-button').classList.add('is-held');put($('play-hint'),local('看力度，鬆手就起跳。','Watch the power. Let go to hop.'));wake();return true;}
for(const id of ['jump-control','hold-button']){
 const node=$(id);node.addEventListener('pointerdown',e=>{if(e.button!==0||pointer||keyboard||game.paused)return;e.preventDefault();if(begin()){pointer={id:e.pointerId,node};node.setPointerCapture(e.pointerId);}});
 node.addEventListener('pointerup',e=>{if(pointer?.id!==e.pointerId)return;e.preventDefault();const held=pointer;pointer=null;try{held.node.releasePointerCapture(held.id);}catch{}$('hold-button').classList.remove('is-held');game.release();processEvents();paint();wake();});
 for(const type of ['pointercancel','lostpointercapture'])node.addEventListener(type,e=>{if(pointer?.id===e.pointerId){resetInput();paint();wake();}});
 node.addEventListener('keydown',e=>{if(![' ','Enter'].includes(e.key))return;e.preventDefault();if(!e.repeat&&!pointer&&!keyboard&&begin())keyboard=e.code;});node.addEventListener('keyup',e=>{if(![' ','Enter'].includes(e.key))return;e.preventDefault();if(keyboard!==e.code)return;keyboard=null;$('hold-button').classList.remove('is-held');game.release();processEvents();paint();wake();});
 node.addEventListener('contextmenu',e=>e.preventDefault());node.addEventListener('selectstart',e=>e.preventDefault());
}
$('skill-button').addEventListener('click',()=>{resetInput();if(game.useSkill()){processEvents();paint();wake();}});
$('retry-sync').addEventListener('click',async()=>{$('retry-sync').disabled=true;try{await players.retryPending();put($('reward-state'),local('已存入錢包','Saved to wallet'));$('retry-sync').hidden=true;}catch(error){put($('reward-state'),players.error(error));}finally{$('retry-sync').disabled=false;}});
for(const id of ['start','again'])$(id).addEventListener('click',start);for(const id of ['quit','result-home','result-close'])$(id).addEventListener('click',home);$('pause').addEventListener('click',pause);for(const id of ['resume','pause-close'])$(id).addEventListener('click',resume);
$('pause-dialog').addEventListener('cancel',e=>{e.preventDefault();resume();});$('result-dialog').addEventListener('cancel',e=>{e.preventDefault();home();});
$('sound').addEventListener('click',()=>{sound=!sound;try{localStorage.setItem('frogger-jump.sound.v1',String(sound));}catch{}$('sound-mark').setAttribute('d',sound?'M17 8q6 4 0 8M17 4q12 8 0 16':'m17 9 5 6m0-6-5 6');language();if(sound)audio(580);else silence();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('blur',()=>{if(pointer||keyboard){resetInput();paint();wake();}});document.addEventListener('languagechange',language);window.addEventListener('storage',event=>{if(event.key===RECORD_KEY){records=readRecords(event.newValue);renderRecords();paint();}});
new ResizeObserver(resize).observe($('river'));document.fonts?.ready.then(()=>{scene.padCache.clear();paint();});language();put($('play-hint'),local('蓄力會來回，不會一直變大喔。','Power goes up, then down. Find your moment.'));resize();
if('serviceWorker'in navigator)navigator.serviceWorker.register(new URL('../sw.js',import.meta.url)).catch(()=>{});
