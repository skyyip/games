import {html} from './dom.js';
import {JOBS} from './content.js';
import {ERA_TOPICS,ERA_SPECIALTIES,ERA_REFERENCE_DATE,eraTopic} from './era-content.js';
import {eraPhase,eraCandidate,courseOffer,relevantEraTopics,eraLegacy,eraRetainer} from './era.js';
import {esc} from './comics.js';
const $=id=>document.getElementById(id),cash=n=>'$'+Math.round(n).toLocaleString('zh-HK');
export class EraUI{
 constructor({getGame,act,show}){Object.assign(this,{getGame,act,show});this.tab='topics';this.filter='relevant';$('era-open').onclick=()=>this.open();}
 open(){if(!this.getGame())return;this.renderDialog();this.show('era-dialog');}
 render(){const g=this.getGame();if(!g)return;const s=g.s,calendar=g.eraCalendar,topics=relevantEraTopics(s),spot=topics.find(t=>s.era.threads[t.id]?.stage<3)??topics.find(t=>eraPhase(s,t.id).id==='growth')??ERA_TOPICS[0],phase=eraPhase(s,spot.id);
  html($('era-summary'),`<div class="card-top"><h3 tabindex="-1">${calendar.label}・時代小誌</h3><span class="trait-chip">${calendar.year===2026?'2026資料靈感':'虛構未來演化'}</span></div><p><b>${spot.emoji} ${esc(spot.name)}・${phase.name}</b><br>${esc(phase.headline)}</p><p class="form-note">本業接案需求係數 ${g.eraDemand.toFixed(2)}；月薪代理值不因熱度自動提高。${g.eraSpecialties.length?'已修專精：'+g.eraSpecialties.map(c=>esc(c.name)).join('、'):'專精可承接舊技能，也可跨領域補課。'}</p>${s.era.last?`<details class="era-last"><summary>上次選擇：${esc(s.era.last.title)}</summary><p>${esc(s.era.last.text)}</p></details>`:''}`);
  $('era-open').disabled=false;if($('era-dialog').open)this.renderDialog();
 }
 renderDialog(){const g=this.getGame();if(!g)return;const s=g.s;
  $('era-calendar').textContent=`人生世界：${g.eraCalendar.label}。資料背景截至 ${ERA_REFERENCE_DATE}；遊戲月份推進才改變時代，離線不扣進度。2027年起的事件均為虛構演化。`;
  html($('era-tabs'),[['topics','熱潮與故事'],['courses','新專精'],['history','我的選擇']].map(([id,label])=>`<button id="era-tab-${id}" role="tab" aria-selected="${this.tab===id}" aria-controls="era-panel" tabindex="${this.tab===id?0:-1}" data-era-tab="${id}">${label}</button>`).join(''));
  $('era-panel').setAttribute('aria-labelledby','era-tab-'+this.tab);
  document.querySelectorAll('[data-era-tab]').forEach(b=>{b.onclick=()=>{this.tab=b.dataset.eraTab;this.renderDialog();$('era-tab-'+this.tab).focus();};b.onkeydown=e=>{const ids=['topics','courses','history'],n=ids.indexOf(this.tab),i=e.key==='ArrowRight'?(n+1)%3:e.key==='ArrowLeft'?(n+2)%3:e.key==='Home'?0:e.key==='End'?2:null;if(i!==null){e.preventDefault();this.tab=ids[i];this.renderDialog();$('era-tab-'+this.tab).focus();}};});
  if(this.tab==='topics')this.renderTopics(g);else if(this.tab==='courses')this.renderCourses(g);else this.renderHistory(g);
 }
 topicCard(g,t,relevant){const s=g.s,p=eraPhase(s,t.id),thread=s.era.threads[t.id],candidate=eraCandidate(s,t.id),enabled=candidate&&g.can(1,8)&&!s.risks.delay&&!s.risks.captivity,source=JOBS.find(j=>j.id===thread?.sourceCareer),legacy=eraLegacy(s,t.id);
  const reason=s.pending?'先完成眼前的選擇':thread?.stage<3&&thread.due>s.elapsed?`下一章最早${thread.due-s.elapsed}個月後`:thread?.stage===3&&!candidate?'這輪已收好，等待後續時代變化':!relevant.has(t.id)?'可先修讀相關專精，再探索新領域':Object.values(s.era.threads).filter(x=>x.stage<3).length>=2&&!thread?'先完成兩條進行中的企劃':'需要一次安排、8精力及可參與的狀態';
  return `<article class="era-card"><div class="card-top"><h3>${t.emoji} ${esc(t.name)}</h3><span class="era-phase ${p.id}">${p.name}</span></div><p>${esc(p.headline)}</p><p class="form-note">留下 ${legacy.clients} 段固定服務關係・${legacy.portfolio} 份作品・${legacy.partners} 段合作網絡。${s.status==='retired'?'65歲後只回顧，不再推進。':''}</p><small>約${p.left}個月後進入下一階段・第${p.cycle+1}輪${thread?`<br>企劃進度 ${Math.min(thread.stage,3)}/3${source?'・原職務 '+esc(source.name):''}`:''}</small><button class="secondary" data-era-story="${t.id}" ${enabled?'':'disabled'}>${thread?.stage<3?'繼續這段故事':'探索本月機會'}・一次安排</button>${!enabled?`<p class="form-note">${reason}</p>`:''}<details><summary>現實靈感與資料日期</summary><p class="form-note">情節、機率和收益均為遊戲設定；未來年份不代表真實新聞。</p><a href="${t.reference.url}" target="_blank" rel="noopener">${esc(t.reference.title)}（${t.reference.date}）↗</a>${t.reference.extra?`<br><a href="${t.reference.extra.url}" target="_blank" rel="noopener">${esc(t.reference.extra.title)}（${t.reference.extra.date}）↗</a>`:''}</details></article>`;
 }
 renderTopics(g){const s=g.s,relevant=new Set(relevantEraTopics(s).map(t=>t.id)),visible=this.filter==='all'?ERA_TOPICS:ERA_TOPICS.filter(t=>relevant.has(t.id));
  html($('era-panel'),`<label class="era-check"><input id="era-auto" type="checkbox" ${s.era.auto?'checked':''} ${g.active?'':'disabled'}>自動遇見時代事件（可關閉，仍可主動探索）</label><label>顯示範圍<select id="era-filter"><option value="relevant" ${this.filter==='relevant'?'selected':''}>與本業、生活或舊職後續有關</option><option value="all" ${this.filter==='all'?'selected':''}>查看全部九個主題</option></select></label><div class="era-cards">${visible.map(t=>this.topicCard(g,t,relevant)).join('')}</div>`);
  $('era-filter').onchange=e=>{this.filter=e.target.value;this.renderDialog();$('era-filter').focus();};$('era-auto').onchange=e=>this.act(()=>g.setEraAuto(e.target.checked));
  document.querySelectorAll('[data-era-story]').forEach(b=>b.onclick=()=>{$('era-dialog').close();this.act(()=>g.exploreEra(b.dataset.eraStory));});
 }
 courseCard(g,spec,ongoing){const s=g.s,c=s.era.courses[spec.id],offer=courseOffer(s,spec.id),required=c?(c.related?3:6):offer.credits,months=c?s.elapsed-c.started:0,enroll=!c&&g.can(1,0,offer.fee)&&ongoing<2&&!s.risks.captivity&&!s.risks.delay,study=c&&!c.completed&&!c.paused&&c.credits<required&&g.can(1,12,350)&&!s.risks.captivity&&!s.risks.delay;
  return `<article class="era-card"><h3>${esc(spec.name)}</h3><span class="trait-chip">${esc(eraTopic(spec.theme).name)}</span><p>${c?(c.completed?'已完成・跨轉職保留':`${c.paused?'已暫停':'修讀中'}・課堂 ${c.credits}/${required}・修讀 ${months}/${required} 個月`):`${offer.related?'承接原有經驗':'跨領域補課'}・入學 ${cash(offer.fee)}・至少 ${offer.months} 個月`}</p>${!c?`<button class="secondary" data-era-enroll="${spec.id}" ${enroll?'':'disabled'}>開始專精・一次安排</button>`:c.completed?'<b class="era-complete">✓ 新能力已留下來</b>':`<button class="secondary" data-era-study="${spec.id}" ${study?'':'disabled'}>完成一課・$350</button><button class="quiet" data-era-pause="${spec.id}" ${g.active&&(c.paused?ongoing<2:true)?'':'disabled'}>${c.paused?'恢復修讀':'暫停並保留進度'}</button>${c.credits>=required?'<p class="form-note">課堂已足夠，修業年期達標後於月結完成。</p>':''}`}</article>`;
 }
 renderCourses(g){const ongoing=Object.values(g.s.era.courses).filter(c=>!c.completed&&!c.paused).length;
  html($('era-panel'),`<p>保留本業，同時學一項新專精。相關經驗需至少3個月／3課，跨領域需6個月／6課；最多同時修讀兩項，可暫停並保留進度。</p><p class="form-note">每課一次安排、12精力及$350；時間以遊戲月份計。這些是遊戲專精徽章，不是正式證照，不會免除職業資格與授權。</p><div class="era-cards">${ERA_SPECIALTIES.map(spec=>this.courseCard(g,spec,ongoing)).join('')}</div>`);
  for(const [attribute,method]of [['enroll','enrollEraSpecialty'],['study','studyEraSpecialty'],['pause','pauseEraSpecialty']])document.querySelectorAll(`[data-era-${attribute}]`).forEach(b=>b.onclick=async()=>{const id=b.getAttribute('data-era-'+attribute);await this.act(()=>g[method](id));const next=$('era-panel').querySelector(`[data-era-study="${id}"]:not(:disabled)`)??$('era-panel').querySelector(`[data-era-pause="${id}"]:not(:disabled)`);(next??$('era-tab-courses')).focus({preventScroll:true});});
 }
 renderHistory(g){const e=g.s.era,date=r=>{const n=2026*12+10+r.elapsed-e.started;return `${Math.floor(n/12)}年${n%12+1}月`;};
  html($('era-panel'),`<p>完成 ${e.metrics.finished} 輪企劃・${e.metrics.completedCourses} 項專精・${e.metrics.paused} 次選擇保留節奏。目前固定服務每月 ${cash(eraRetainer(g.s))}（只限合適且具資格的範圍，合計上限$480）；額外委託與服務累積 ${cash(e.metrics.earned)}，不是整月薪酬。</p>${e.last?`<article class="era-card"><h3>${esc(e.last.title)}</h3><p>${esc(e.last.text)}</p></article>`:''}<ol class="era-history">${e.history.slice().reverse().map(r=>`<li><small>${date(r)}・${esc(eraTopic(r.theme).name)}</small><p>第${r.stage+1}章・${r.choice===3?'暫不追逐這一輪':r.reward?'有限交付通過，收入 '+cash(r.reward):'累積經驗與選擇'}${r.sourceCareer?'・原職務 '+esc(JOBS.find(j=>j.id===r.sourceCareer).name):''}</p></li>`).join('')||'<li>第一個選擇，會成為這本時代小誌的起點。</li>'}</ol>`);
 }
}
export function eraChoiceHint(c){return c.chance?`・交付機率 ${Math.round(c.chance*100)}%・通過時額外費用 $${c.reward}`:c.skillGain?'・累積專業經驗，不發整月薪酬':'';}
