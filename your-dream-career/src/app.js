import {LifeGame} from './game.js';
import {JOBS,CATEGORIES,SKILLS} from './content.js';
import {VocationUI} from './vocation-ui.js';
import {vocationalCourse} from './vocation-content.js';
import {vocationRecord} from './vocation.js';
import {storyProfile} from './career-stories.js';
import {entryPath} from './life-design.js';
import {TOPIC_SOURCES,TOPICS} from './workplace-topics.js';
import {LifeRepository} from './life-repository.js';
import {AccountStore,accountScope} from './account-store.js';
import {CareerAccount} from './account-ui.js';
import {CareerCloud} from './cloud-ui.js';
import {SocialNotifications} from './social-notifications.js';
import {socialContext} from './social-game.js';
import {DailyGrowth} from './daily-growth.js';
import {MonthSkipBudget} from './skip-budget.js';
import {avatar,panelSVG,bookDocument,esc} from './comics.js';
import {html} from './dom.js';
import {closeReadings,installReadingModals,prepareReadingButtons} from './reading-modal.js';
const $=id=>document.getElementById(id),money=n=>'$'+Math.round(n).toLocaleString('zh-HK');
async function main(){
 let storage=null;try{storage=localStorage;}catch{}
 const store=new AccountStore(storage),repository=new LifeRepository(store),skips=new MonthSkipBudget({storage});
 let game=null,uid=null,busy=false,blocked=false,identityLoading=false,social=null,page=0,selected=null,bookPage=0,timer,identityEpoch=0;
 let settledOperation=Promise.resolve(),resolveOperation=()=>{};
 const growth=new DailyGrowth({store,scope:()=>accountScope(uid)});
 const inform=text=>{$('notice').textContent=text;clearTimeout(timer);timer=setTimeout(()=>$('notice').textContent='',6000);};
 function show(id){closeReadings();const d=$(id);if(!d.open)d.showModal();d.querySelector('button:not(:disabled)')?.focus({preventScroll:true});}
 function info(title,body){$('info-title').textContent=title;html($('info-content'),body);show('info-dialog');}
 for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>$(b.dataset.close).close();
 installReadingModals();
 // Native dialogs handle Escape and trap tab focus. Their title is never focused.
 async function act(fn,unused,options={}){
  if(busy||identityLoading||blocked){inform(blocked?'另一個分頁有較新進度，請重新整理後繼續。':'正在保存，請稍候。');return false;}
  busy=true;settledOperation=new Promise(resolve=>{resolveOperation=resolve;});const before=game?structuredClone(game.s):null,previous=game,scope=uid;
  try{return await repository.exclusive(scope,async()=>{const result=await fn();if(result===false){inform('目前無法安排，請查看所需精力、金錢與剩餘安排。');return false;}await repository.save(scope,game.s,options);growth.capture(game.s);$('storage-note').textContent=repository.persistent?'':'瀏覽器未能永久保存；請立即下載JSON備份。';render();if(!!before?.pending!==!!game.s.pending&&!document.querySelector('dialog[open]')){const heading=$('story').querySelector('h2');if(heading){$('story').scrollIntoView({block:'start'});heading.focus({preventScroll:true});}}return result;});}
  catch(e){game=before?LifeGame.restore(before):previous;if(e.message==='local-conflict'){blocked=true;inform('另一個分頁已更新進度，請重新整理後繼續。');}else{$('storage-note').textContent='這次操作未能保存，已還原操作前的進度；可下載備份後重試。';}render();return false;}finally{busy=false;resolveOperation();}
 }
 const cloud=new CareerCloud({getGame:()=>game,getUid:()=>uid,notify:inform,restore:async g=>{const result=await act(()=>{game=g;return true;},null,{replace:true});if(result===false)throw Error('storage-write');startView();}});
 const account=new CareerAccount({store,show,notify:inform,hasCandidate:()=>false,onAdopt:()=>{},onRestoring:value=>{identityLoading=value;},onIdentity:async user=>{
  const next=user?.uid??null;notifications.identity(user);if(next===uid)return;const epoch=++identityEpoch;identityLoading=true;
  try{await settledOperation;if(epoch!==identityEpoch)return;for(const d of document.querySelectorAll('dialog[open]'))if(d.id!=='account-dialog')d.close();uid=next;cloud.identity(uid);social?.identity(uid);const loaded=await repository.load(uid);if(epoch!==identityEpoch)return;game=loaded;blocked=false;$('game').hidden=true;$('cover').hidden=false;$('continue').hidden=!game;document.body.classList.remove('is-playing');inform('已切換玩家，存檔按帳戶獨立保存。');}catch{if(epoch===identityEpoch){game=null;blocked=true;inform('未能讀取這位玩家的存檔，請重新整理；既有資料保留。');}}finally{if(epoch===identityEpoch)identityLoading=false;}
 }});
 const notifications=new SocialNotifications({store,show,login:()=>account.open(),openInbox:()=>{if($('notifications-dialog').open)$('notifications-dialog').close();openSocial('inbox');}});
 async function openSocial(tab){if(!game){inform('先領取工作證並選擇職業，再建立玩家名片。');return;}try{if(!social){const {CareerSocial}=await import('./social-ui.js');social=new CareerSocial({getGame:()=>game,getUid:()=>uid,getUser:()=>account.user,act,show,notify:inform,login:()=>account.open(),ensureContext:async()=>{const g=game,owner=uid;if(!owner)throw Error('signin');if(!g.s.life.socialRunId){if(await act(()=>{g.s.life.socialRunId=crypto.randomUUID();return true;})===false)throw Error('identity-changed');}if(g!==game||owner!==uid)throw Error('identity-changed');return socialContext(g);}});social.identity(uid);}if(tab)social.tab=tab;await social.open();}catch{inform('社群暫時未能載入，本機職涯仍可繼續。');}}
 $('social-open').onclick=()=>openSocial();
 const vocation=new VocationUI({getGame:()=>game,act,show,openCareer});
 function startView(){if(!game)return;$('cover').hidden=true;$('game').hidden=false;document.body.classList.add('is-playing');render();if(!game.job)openCareer();else{const report=growth.claim(game.s);if(report&&!report.first)info('這段職涯，累積了甚麼？',`<p>上次記錄日：${esc(report.period)}。顯示實際變化，不額外發放點數。</p><ul>${report.gains.map(x=>`<li>${esc(SKILLS[x.key.replace('skill-','')]??x.key.toUpperCase())} +${x.value}</li>`).join('')||'<li>這段時間沒有屬性淨提升。休整與補救也值得保留。</li>'}</ul>`);}}
 $('new-cover').onclick=async()=>{if(game&&!confirm('建立新職涯會取代這位玩家目前的本機進度。建議先下載JSON備份。確定開始？'))return;const name=$('player-name').value.trim()||'職場新鮮人';if(await act(()=>{game=new LifeGame({name});return true;},null,{replace:true})!==false)startView();};
 $('continue').onclick=startView;
 html($('cover-art'),[['mentor','第一次，先跟著做'],['work','卡關，也是一種成長'],['promotion','有一天，換你帶新人']].map(([scene,title],i)=>`<article>${panelSVG({age:20+i*10,month:0,scene,tone:i,portrait:i,title})}<h3>${title}</h3></article>`).join(''));
 const labels={iq:'IQ 理解與分析',eq:'EQ 溝通與情緒',pq:'PQ 正向心智',jq:'JQ 職場判斷'};
 function render(){closeReadings();$('continue').hidden=!game;if(!game)return;const s=game.s,q=s.stats,retired=s.status==='retired';
  html($('identity'),`<svg class="avatar" viewBox="-55 -110 110 130" aria-hidden="true">${avatar(s.profile.portrait)}</svg><div><h2>${esc(s.profile.name)}</h2><p>${esc(game.job?.name??'等待第一份工作')} · ${retired?'已退休':s.status==='apprentice'?'學徒':s.status==='setup'?'準備出發':esc(game.rankName)}</p></div>`);
  $('age').textContent=game.ageLabel;html($('attributes'),Object.entries(labels).map(([key,label])=>`<span>${label}<b>${q[key].toFixed(1)}${key==='pq'?'%':''}</b></span>`).join(''));
  html($('status-line'),`<span>精力 ${Math.round(q.energy)}/${game.energyMax}</span><span>壓力 ${Math.round(q.stress)}/100</span><span>現金 ${money(s.cash)}</span><span>債務 ${money(s.debt)}</span><span>本月剩餘 ${s.ap}/2 次安排</span>`);
  $('month').disabled=!game.active||!game.job||retired||blocked;$('month-help').textContent=retired?'65歲退休，仍可查看漫畫、作品及社群紀錄。':`每月兩次安排。${s.pending?'先完成目前故事，或返回本月安排。':s.ap>0?`工作、練習及休整都可選；提早跳月今天尚餘${skips.remaining}次。`:'安排已用完，查看月結前進一個月。'} 例行薪金每月只發一次，月結自動補算。`;
  $('recap-open').hidden=!s.lastLedger;
  $('career-panel').hidden=retired||!game.job;$('story').hidden=retired||!game.job;
  if(game.job&&!retired)vocation.render();
  const followup=s.lastLedger?.followup;$('followup-summary').hidden=!followup;if(followup)html($('followup-summary'),`<p class="eyebrow">上月的決定，這次有回音</p><h2>${esc(followup.title)}</h2><p>${esc(followup.text)}</p>`);
  renderTactics();renderActions();renderTopic();prepareReadingButtons($('game'));$('ending').hidden=!retired;
  if(retired){const summary=game.retirement();html($('ending'),`<p class="eyebrow">THE LAST CLOCK-OUT</p><h2>65歲，最後一次打卡。</h2><h3>${esc(summary.titles.join('・'))}</h3><p>${esc(summary.quote)}</p><p>目前現金與退休儲備扣除債務：${money(summary.wealth)}。不是職業優劣排名；你走過的每一段，都留在漫畫裡。</p><button id="ending-download" class="primary">下載我的職涯繪本 ↗</button>`);$('ending-download').onclick=exportBook;}
 }
 function renderTactics(){const root=$('tactics'),s=game.s;root.hidden=!game.job||s.status==='retired';if(root.hidden)return;const n=vocationRecord(s)?.narrative,step=(n?.step??0)%4,t=s.dreamCareer.tactic;
  html(root,`<p class="eyebrow">CHOOSE YOUR APPROACH</p><h2>出工前，帶一張工具卡。</h2><p>免費選一張，支援本月第一份工單；也可直接開始故事。工具幫你看清問題，交付仍由你負責。</p><ol class="dream-route">${['看現場','理需求','處理例外','回訪與交接'].map((text,i)=>`<li ${step===i?'aria-current="step"':''}>${i+1} ${text}</li>`).join('')}</ol><div class="tactic-cards">${[['checklist','核對清單','首份工單直接展開核對工具，顯示可驗證的實作資料。'],['buddy','同事接力','提供一次同事支援，先協助實作第一步，其餘由你完成。'],['scope','留點餘裕','首份工單交付後保留6精力；必要核對與交付成本照常。']].map(([id,title,text])=>`<button data-tactic="${id}" aria-pressed="${t?.id===id}" ${t||!game.active?'disabled':''}><b>${title}</b><small>${text}</small></button>`).join('')}</div>${t?'<p class="form-note">本月已選定；下月可用不同做法。工具不代替專業資格。</p>':''}`);
  for(const b of root.querySelectorAll('[data-tactic]'))b.onclick=()=>act(()=>game.chooseTactic(b.dataset.tactic));
 }
 function renderActions(){const s=game.s,can=game.active;html($('career-actions'),[
  ['practice','對著弱項練一次','開啟同職業的實作補練，確認處理才花一次安排。',can&&s.ap>0&&qEnergy(14)],
  ['rest','準時下班，整理思路','一次安排・恢復45精力／減壓20。',can&&s.ap>0],
  ['network','和同事交換經驗','一次安排・$120；溝通、人脈與精力慢慢累積。',game.can(1,0,120)],
  ['career','轉職／體驗另一行','先看要求與得失，再決定。查看不扣安排。',!s.pending&&s.status!=='retired']
 ].map(([id,title,text,enabled])=>`<button data-arrange="${id}" ${enabled?'':'disabled'}><b>${title}</b><small>${text}</small></button>`).join(''));
  for(const b of $('career-actions').querySelectorAll('[data-arrange]'))b.onclick=()=>b.dataset.arrange==='career'?openCareer():act(()=>b.dataset.arrange==='practice'?game.openStoryTask('drill'):game.rest(b.dataset.arrange==='network'));
 }
 const qEnergy=n=>game.s.stats.energy>=n;
 function renderTopic(){const root=$('topic'),s=game.s;root.hidden=!game.job||s.status==='retired';if(root.hidden)return;const done=s.dreamCareer.topicMonth===s.month,last=s.dreamCareer.topicHistory.at(-1),t=done?TOPICS.find(t=>t.id===last?.id)??game.currentTopic:game.currentTopic,source=TOPIC_SOURCES[t.source];
  html(root,`<span class="topic-tag">職場突發工單・可選</span><h2>${esc(t.title)}</h2><p>你正在擔任${esc(game.job.name)}。${esc(t.context)}</p>${done?`<div class="vocation-feedback"><p><b>你選擇：</b>${esc(t.choices[last.choice].label)}</p><p>${esc(t.choices[last.choice].result)}</p><p class="form-note">結果已收進職涯漫畫，下月會看到後續。</p></div>`:`<p class="form-note">不同做法各有成本，沒有唯一人生答案。每次用一次安排；可略過，繼續職業主線。</p><div class="topic-choices">${t.choices.map((c,i)=>`<button data-topic="${i}" ${game.can(1,c.energy,c.cost)?'':'disabled'}><b>${esc(c.label)}</b><small>${money(c.cost)}・${c.energy}精力・一次安排</small></button>`).join('')}</div>`}<p class="form-note">情境為原創綜合案例，並非新聞實錄或即時新聞。資料查閱：2026-11-06；實際規定以所在地最新要求為準。</p><a class="extension-reference" href="${source[1]}" target="_blank" rel="noopener">背景參考：${esc(source[0])} ↗</a>`);
  for(const b of root.querySelectorAll('[data-topic]'))b.onclick=()=>act(()=>game.handleTopic(Number(b.dataset.topic)));
 }
 $('month').onclick=()=>{if(!game?.active||!game.job)return;const s=game.s,ledger=s.lastLedger;info('本月，準備收工？',`<p>${game.ageLabel}・${esc(game.job.name)}。參考稅前月薪${money(s.status==='apprentice'?game.apprenticeSalary:game.salary)}；已領部分不重複發放。月結扣基本開支${money(game.livingCost)}，薪酬另按遊戲簡化稅款及MPF結算。</p><p>${s.ap>0?`尚有${s.ap}次安排。提早跳月會略過這些安排，今日尚餘${skips.remaining}次；不會代答工作難題。`:'安排已完成，正常月結不使用跳月次數。'} 精力恢復48、壓力降低5；高壓可能影響健康。</p>${s.dreamCareer.followup?'<p>上次突發工單的後續，將在下一個月收進漫畫。</p>':''}<button id="month-confirm" class="primary" ${s.ap>0&&skips.remaining===0?'disabled':''}>確認月結，前進一個月</button>`);
  $('month-confirm').onclick=async()=>{if(s.ap>0&&skips.remaining===0)return;const skipped=s.ap>0;if(await act(()=>game.endMonth())!==false){if(skipped)skips.consume();$('info-dialog').close();render();if(game.s.status==='retired')$('ending').scrollIntoView({block:'start'});}};
 };
 $('recap-open').onclick=()=>{const l=game.s.lastLedger;info('上個月的收支',`<p>收入 ${money(l.totalIncome)}・支出 ${money(l.totalExpenses)}。</p><p>稅前薪金 ${money(l.gross)}、MPF ${money(l.mpf)}、遊戲稅款預留 ${money(l.tax)}、基本開支 ${money(l.living)}。其他支出包括你實際選擇的覆核、培訓及協作成本。</p>`);};
 $('attributes-open').onclick=()=>{const s=game.s;info('每一次實作，留下真實成長',`<dl class="profile-facts"><div><dt>性別</dt><dd>${esc(s.profile.gender)}</dd></div><div><dt>MBTI</dt><dd>${esc(s.profile.mbti)}</dd></div></dl><p>性別與MBTI不限制職業，不決定能力。這些數值是角色設定，不是玩家心理測驗。</p><h3>IQ 理解與分析</h3><p>透過查證學習、拆解問題和練習專業觀念逐步累積。影響理解、學習與判斷；不是答題就能提高現實智商。</p><h3>EQ 溝通與情緒</h3><p>協商範圍、聽懂同事與客戶需求、合作交付時成長；幫助處理人際困難。</p><h3>PQ 正向心智</h3><p>0–100%的遊戲指標，代表角色能用建設性態度應對的心智狀態；休整與整理思路有助成長，能緩衝壓力，不等於強迫自己樂觀。</p><h3>JQ 職場判斷</h3><p>實際處理交接、覆核、授權及責任問題時成長。與技能及職業實績一起影響出師與晉升。</p><h3>目前可帶走的技能</h3><ul>${Object.entries(s.skills).map(([k,v])=>`<li>${SKILLS[k]}：${v.toFixed(1)}</li>`).join('')}</ul><p>成長隨能力提高而放慢。轉職保留技能，但新的行業資格、受督導年期與實績不能跳過。</p>`);};
 // Career picker: searchable, paged and with explicit entry/transfer requirements.
 html($('job-category'),'<option value="">全部領域</option>'+CATEGORIES.map(c=>`<option value="${c.id}">${esc(c.zh)}</option>`).join(''));
 function openCareer(){if(!game)return;selected=null;page=0;renderJobs();previewJob();show('career-dialog');}
 function renderJobs(){const search=$('job-search').value.trim().toLowerCase(),category=$('job-category').value,filtered=JOBS.filter(j=>(!category||j.category===category)&&(!search||(j.name+' '+j.id).toLowerCase().includes(search))),count=Math.ceil(filtered.length/24);page=Math.min(page,Math.max(0,count-1));$('job-count').textContent=`找到${filtered.length}種職業・第${page+1}/${Math.max(1,count)}頁`;
  html($('job-list'),filtered.slice(page*24,page*24+24).map(j=>`<button data-job="${j.id}" class="job-card" aria-pressed="${j.id===selected}"><span>${j.emoji}</span><b>${esc(j.name)}</b><small>${esc(j.salaryInfo.basis)}・參考 ${money(j.salary)}/月</small></button>`).join('')||'<p>沒有相符職業，試試其他關鍵字。</p>');
  html($('job-pagination'),`<button id="jobs-prev" ${page===0?'disabled':''}>← 上一頁</button><button id="jobs-next" ${page>=count-1?'disabled':''}>下一頁 →</button>`);$('jobs-prev').onclick=()=>{page--;renderJobs();};$('jobs-next').onclick=()=>{page++;renderJobs();};for(const b of $('job-list').querySelectorAll('[data-job]'))b.onclick=()=>{selected=b.dataset.job;renderJobs();previewJob();};
 }
 function previewJob(){const j=JOBS.find(j=>j.id===selected),confirm=$('career-confirm');if(!j){html($('career-preview'),'<p>先點選一張職業卡，就能查看具體技能與日常。</p>');confirm.disabled=true;confirm.textContent='請先選一份職業';return;}const c=vocationalCourse(j),path=entryPath(j),p=game.transferPreview(j.id),eligibility=game.careerEligibility(j.id,document.querySelector('[name=route]:checked').value);
  html($('career-preview'),`<h3>${j.emoji} ${esc(j.name)}・真正要做些甚麼？</h3><p>${esc(j.routine)}。</p><h4>需要掌握的能力</h4><ul>${c.skills.map(text=>`<li>${esc(text)}</li>`).join('')}</ul><h4>會遇到的難題</h4><p>${esc(c.cases[0][1])}</p><h4>從受督導練習開始</h4><p>遊戲訓練要求：至少${path.months}個月、${path.practice}次受督導實作，加上五階段技能證據${path.regulated?'與模擬資格考核':''}。${path.regulated?'受規管工作需正式認可學歷、訓練及註冊；遊戲完成任務不等於可以執業。':'實際入行要求因地區、僱主和職務而異。'}</p><p>學徒參考${money(Math.max(6000,j.salary*.45))}/月；出師起步參考${money(j.salary)}/月。${esc(j.salaryInfo.note)} 這是現有行業／職業組別資料的遊戲代理值，不是每份職缺報價。</p>${game.job?`<h4>轉職的得與失</h4><p>${esc(game.job.name)} → ${esc(j.name)}。$3,000及一次安排；人脈減少${p.contactsLoss.toFixed(1)}、聲望減少${p.reputationLoss.toFixed(1)}。${p.related?'相關技能可加快重新上手。':'跨領域需要重新建立實績。'}所有舊技能、作品與資格保留；已取得本職業遊戲資格可回任，否則重新由學徒收入起步。</p>`:'<p>第一次入行免費，不花安排。</p>'}`);
  confirm.disabled=!eligibility.ok;confirm.textContent=eligibility.initial?'確認入行，開始第一份工作 ↗':'確認轉職，開始下一章 ↗';$('career-availability').textContent=eligibility.ok?'先了解要求，再按確認；查看沒有成本。':eligibility.blockers.includes('cash')?'轉職需要$3,000現金，可先完成本月工作累積資金。':eligibility.blockers.includes('actions')?'本月安排已用完，月結後再確認轉職。':'請先完成或暫停目前故事。';
 }
 $('job-search').oninput=()=>{page=0;renderJobs();};$('job-category').onchange=()=>{page=0;renderJobs();};for(const radio of document.querySelectorAll('[name=route]'))radio.onchange=previewJob;
 $('career-confirm').onclick=async()=>{if(await act(()=>game.chooseCareer(selected,document.querySelector('[name=route]:checked').value))!==false){$('career-dialog').close();$('career-panel').scrollIntoView({block:'start'});}};
 function download(name,type,content){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
 function exportBook(){if(game)download('your-dream-career-comic.html','text/html;charset=utf-8',bookDocument(game.s,game.retirement()));}
 $('save-open').onclick=()=>show('save-dialog');$('export-save').onclick=()=>game?download('your-dream-career-save.json','application/json',JSON.stringify(game.s)):inform('先建立一段職涯。');
 $('import-save').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;if(file.size>20e6){inform('備份太大，請使用20MB以下檔案。');return;}const g=LifeGame.restore(await file.text());if(!g){inform('這不是有效的Your Dream Career職涯備份。');return;}if(game&&!confirm('載入會取代目前本機職涯，確定繼續？'))return;if(await act(()=>{game=g;return true;},null,{replace:true})!==false){$('save-dialog').close();startView();}};
 $('return-cover').onclick=()=>{$('save-dialog').close();$('cover').hidden=false;$('game').hidden=true;document.body.classList.remove('is-playing');};
 function renderBook(){if(!game)return;const panels=game.s.panels,max=Math.max(1,Math.ceil(panels.length/6));bookPage=Math.min(bookPage,max-1);html($('book-panels'),panels.slice(bookPage*6,bookPage*6+6).map(p=>`<article class="comic-card">${panelSVG(p)}<h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join(''));$('book-page').textContent=`${bookPage+1}/${max}`;$('book-prev').disabled=bookPage===0;$('book-next').disabled=bookPage>=max-1;}
 $('book-open').onclick=()=>{bookPage=0;renderBook();show('book-dialog');};$('book-prev').onclick=()=>{bookPage--;renderBook();};$('book-next').onclick=()=>{bookPage++;renderBook();};$('export-book').onclick=exportBook;
 $('guide-open').onclick=()=>info('先玩懂一份工作，再選下一步',`<ol><li><b>領工作證、選職業。</b>先看日常、薪酬資料與技能要求，首次入行免費。</li><li><b>接一份工單。</b>選工具卡（可選），按「繼續故事」，動手整理資料、排列工序或核對現場；卡住時請教師傅或查看教材，都是免費。</li><li><b>做出交付。</b>完成必要觀念練習，選擇覆核、協調或有限交付。確認才扣一次安排；失敗保留成長與下一步，沒有清空重練。</li><li><b>安排餘下時間。</b>每月共兩次，可補練、休整、和同事交流或處理突發工單。精力不夠先休息。</li><li><b>月結與成長。</b>正常月結不扣跳月額度；提早跳過剩餘安排每天最多12次（UTC+9重置）。薪金只發一次，基本開支照付。學徒完成技能證據、年期與必要考核才出師。</li><li><b>轉職、合作，直到65歲。</b>任何時候可預覽別的職業。確認轉職才扣費與安排，技能和作品保留；65歲固定退休並下載職涯漫畫。</li></ol><p>私人雲端、Email／Google／匿名登入及真人社群待新Firebase設定後開放。本機職涯無需登入；JSON備份可搬到其他裝置。</p>`);
 $('sources-open').onclick=()=>info('現實資料與遊戲靈感',`<p>資料查閱：2026-11-06。職場情境是原創綜合案例；新聞議題不是每月即時更新，也不代表每個行業都會經歷相同事情。</p><ul>${Object.values(TOPIC_SOURCES).map(([name,url])=>`<li><a href="${url}" target="_blank" rel="noopener">${esc(name)}</a></li>`).join('')}</ul><p>薪金沿用Career 365的香港統計資料代理值，個別職位未必有獨立官方數字。每張職業卡會標明資料性質；資格與稅務採簡化模擬。</p><p>參考近期作品的可重玩設計：<a href="https://store.steampowered.com/app/2868840/" target="_blank" rel="noopener">Slay the Spire 2</a>的路線及工具選擇、<a href="https://store.steampowered.com/app/3527290/" target="_blank" rel="noopener">PEAK</a>的互相接力。新版使用原創工具卡、四段職涯路線與同事支援；不連接這些遊戲。</p>`);
 try{game=await repository.load(uid);}catch{blocked=true;inform('存檔暫時未能讀取，原有資料保留；請重新整理再試。');}$('continue').hidden=!game;
 if('serviceWorker' in navigator)navigator.serviceWorker.register(new URL('../sw.js',import.meta.url),{type:'module'}).catch(()=>{});
}
main().catch(()=>{document.getElementById('storage-note').textContent='遊戲未能完整啟動。請重新整理；既有存檔不會自動刪除。';});
