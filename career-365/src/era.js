import {JOBS} from './content.js';
import {ERA_TOPICS,ERA_PHASES,ERA_SPECIALTIES,ERA_ROUTE_NAMES,ERA_REFERENCE_DATE,eraTopic,eraSpecialty} from './era-content.js';
import {entryPath,journal,progressGoal} from './life-design.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const hash=value=>{let n=2166136261;for(const c of value)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const working=s=>['employed','business'].includes(s.status)&&!s.risks.captivity&&!s.risks.delay;
const active=s=>!['setup','retired'].includes(s.status)&&!s.pending;
const jobFor=s=>JOBS.find(j=>j.id===s.career)??null;
export function eraDefaults(s){return {version:1,referenceDate:ERA_REFERENCE_DATE,startYear:2026,startMonth:11,started:s.elapsed,seed:s.seed>>>0,auto:true,nextEvent:s.elapsed+6,threads:{},courses:{},history:[],last:null,metrics:{finished:0,paused:0,earned:0,completedCourses:0},lastCourseMonth:s.elapsed};}
export function eraCalendar(s){const e=s.era,n=e.startYear*12+e.startMonth-1+s.elapsed-e.started;return {year:Math.floor(n/12),month:n%12+1,label:`${Math.floor(n/12)}年${n%12+1}月`};}
export function eraPhase(s,id){const t=eraTopic(id);if(!t||!s.era)return null;const offset=t.offset+hash(`${s.era.seed}:${id}`)%2,total=ERA_PHASES.reduce((n,p)=>n+p.months,0),elapsed=s.elapsed-s.era.started+offset,cycle=Math.floor(elapsed/total);let index=elapsed%total;for(const [stage,p]of ERA_PHASES.entries()){if(index<p.months)return {...p,index:stage,cycle,left:p.months-index,headline:t.headlines[stage],inspiration:eraCalendar(s).year===2026};index-=p.months;}return null;}
export function completedEraCourses(s,theme=null){return Object.entries(s.era.courses).filter(([id,c])=>c.completed&&(!theme||eraSpecialty(id).theme===theme)).map(([id])=>eraSpecialty(id));}
export function relevantEraTopics(s,job=jobFor(s)){return ERA_TOPICS.filter(t=>s.era?.threads[t.id]?.stage<3|| (job?t.categories.includes(job.category)||completedEraCourses(s,t.id).length:['trust','assets','ip','silver','pets','climate'].includes(t.id)));}
export function eraDemand(s,job=jobFor(s)){if(!job||!s.era)return 1;const topics=ERA_TOPICS.filter(t=>t.categories.includes(job.category)||completedEraCourses(s,t.id).length);return topics.length?clamp(topics.reduce((n,t)=>n+eraPhase(s,t.id).demand,0)/topics.length,.88,1.12):1;}
export function eraWorkBonus(s){const job=jobFor(s);if(!job)return 0;return Math.min(6,completedEraCourses(s).filter(c=>c.categories.includes(job.category)).length*2);}
export function eraMarketImpact(s,id){if(!s.era)return 0;const momentum=theme=>{const p=eraPhase(s,theme);return p.id==='growth'?1:p.id==='peak'?.2:p.id==='cooling'?-1:0;},stock=.004*momentum('ai')+.002*momentum('compute');return ({stock,etf:stock*.4,crypto:.008*momentum('assets'),cards:.01*momentum('ip'),property:.001*momentum('silver'),derivatives:stock*3})[id]??0;}
export function eraOperatingCost(s){if(!s.business||!s.era)return 0;return ['compute','climate'].reduce((n,id)=>n+(eraPhase(s,id).id==='peak'?180:eraPhase(s,id).id==='growth'?60:0),0);}
const relatedCourse=(s,c)=>{const job=jobFor(s);return !!job&&(c.categories.includes(job.category)||s.skills[c.skill]>=35);};
export function courseOffer(s,id){const c=eraSpecialty(id);if(!c)return null;const related=relatedCourse(s,c);return {related,credits:related?3:6,months:related?3:6,fee:c.fee+(related?0:600)};}
export function canEarnEra(s,theme){const job=jobFor(s),consulting=!!job&&['sabbatical','early-retired'].includes(s.status)&&s.skills[job.skill]>=35&&s.life.credentials[job.id]&&!s.risks.captivity&&!s.risks.delay;return !!job&&(working(s)||consulting)&&(!entryPath(job).regulated||s.life.credentials[job.id]||s.life.entry.grandfathered)&&(eraTopic(theme).categories.includes(job.category)||completedEraCourses(s,theme).length>0);}
const coffeeStages=[
 ['街角開了一間AI無人咖啡店','你熟悉的咖啡街多了一間無人店。客人好奇，熟客也問你會不會改變做法。',['學小店AI營運，先測試訂單及排班','深化手沖與熟客服務，維持自己的節奏','與設計、攝影或活動夥伴合作']],
 ['排隊很長，回頭客卻未必一樣','新店很熱鬧，你也收到數位工具、特色內容與活動邀請。維護成本和真正客群需要一起看。',['投入可驗證的小型試行，核對總成本','縮小供應及宣傳，專注穩定品質','與夥伴分擔內容、接待和交接']],
 ['一條街，可以有不只一種咖啡店','話題漸漸變成日常。一份街區合作案想結合數位流程與人的服務。',['承接有上限的小店流程／服務委託','保留手藝與熟客，不接新增承諾','與跨專業夥伴共同辦一場小活動']],
];
const roleDetails={
 ai:{food:'這次要分清菜單、訂單和食品核對，不能讓生成文字代替食安確認。',health:'資料與建議都須符合私隱、職務及專業覆核界線。',finance:'漂亮的摘要不能代替原始憑證、合規及專業判斷。',education:'需要確認學生理解與工具使用規則，不只看作業外觀。',visual:'素材權利、可讀性與客戶真正需求仍需確認。',funeral:'有效意願、家屬私隱和透明收費不能被自動化略過。'},
 trust:{finance:'重點是獨立聯絡、正式付款授權及證據追溯。',media:'發布前需核實來源、影像使用權與可支持的結論。',public:'不能以熟悉的聲音代替法定程序與個資保護。',forensics:'完整性線索不等於真實來源，結論需保留限制。'},
 compute:{trades:'設備作業須由具資格人員執行，這裡先處理勘查與交接。',hardware:'要比較負載、量測與熱條件，不以單一峰值作驗收。',software:'應先檢視工作負載、監測與可靠性，再決定資源配置。'},
 assets:{finance:'牌照範圍、產品權利與市場風險是不同問題。',software:'介面成功不代表結算、權限及失敗處理已完整。',commerce:'合作標示與抽成不能代替對平台和條款的核實。'},
 ip:{visual:'需要確認創作權利、地區、期間和使用媒介。',finance:'估值、實際成交與可變現金額不能混為一談。',commerce:'預購金額、庫存和售後成本要一起核算。',food:'聯名不會降低食安、授權與出品容量的要求。'},
 events:{food:'訂單容量、保存及過敏原核對仍然優先。',transport:'行程壓力不能取代安全、休息和授權限制。',service:'預訂、實際供應與客人私隱都要留下交接。',performance:'需要合約、技術排練及團隊恢復時間。'},
 silver:{finance:'年齡不等於相同風險偏好，應尊重本人意願及適合度。',architecture:'可及路徑與實際使用情境需要由合適專業覆核。',health:'照顧安排與個別診療仍須由具資格團隊處理。',support:'支持本人選擇，不以方便照顧者代替意願。'},
 pets:{food:'需確認適用許可、食物與場地衞生，不假定所有場所都可接待動物。',animals:'觀察個體需要，未明健康問題應轉介獸醫。',funeral:'尊重照護者意願、私隱及透明的服務範圍。'},
 climate:{trades:'工作負荷、環境、警告及合資格人員的安排都需考慮。',transport:'時限不能成為忽略警示或超出工作限制的理由。',food:'保存、供應及總成本要一起評估，不能只改標價。',nature:'保留觀測與資源紀錄，不以單次徵象指定原因。'},
};
function stageRow(s,topic,thread){const source=JOBS.find(j=>j.id===thread.sourceCareer),coffee=topic.id==='ai'&&source?.name==='咖啡師';return (coffee?coffeeStages:topic.stages)[thread.stage];}
function threadFor(s,id){return s.era.threads[id]??null;}
export function eraCandidate(s,id){const topic=eraTopic(id);if(!topic||!relevantEraTopics(s).some(t=>t.id===id))return false;const old=threadFor(s,id);if(old&&old.stage<3)return old.due<=s.elapsed;const current=eraPhase(s,id);if(old&&(old.cycle>=current.cycle||s.elapsed-old.closed<6))return false;return Object.values(s.era.threads).filter(t=>t.stage<3).length<2;}
export function makeEraEvent(s,id){const topic=eraTopic(id),thread=threadFor(s,id);if(!topic||!thread||thread.stage>=3)return null;const source=JOBS.find(j=>j.id===thread.sourceCareer),current=jobFor(s),p=eraPhase(s,id),[title,text,labels]=stageRow(s,topic,thread),earn=canEarnEra(s,id),trained=completedEraCourses(s,id).length>0;
 const costs=thread.stage===0?[1200,0,400]:thread.stage===1?[600,0,250]:[300,0,100],energies=thread.stage===0?[10,4,8]:thread.stage===1?[12,5,8]:[18,6,12];
 const pressure=p.id==='peak'?.08:0,skill=current?s.skills[current.skill]:s.stats.eq,chance=clamp(.3+skill*.003+thread.trust*.001+(trained?.12:0)-pressure,.2,.9),reward=earn?Math.round(1500*p.demand*(trained?1.15:1)):0;
 const choices=labels.map((label,index)=>({label:thread.stage===2&&!earn&&index!==1?'以受督導／義工或教育性範圍參與：'+label:label,effects:{cash:-costs[index],energy:-energies[index],stress:index===1?-3:3,contacts:index===2?1:0},route:index,skillGain:[1,.45,.7][index],chance:thread.stage===2&&index!==1&&earn?Math.min(.95,chance+(index===2?.06:0)):0,reward:thread.stage===2&&index!==1?Math.round(reward*(index===2?.55:1)):0}));
 choices.push({label:'先保留現金與時間，暫不追這一輪熱潮',effects:{stress:-2},route:3,skillGain:0,chance:0,reward:0});
 const calendar=eraCalendar(s),role=source?`${source.name}的日常：${source.routine}。`:'這次從自己的生活與社區需要出發。',route=thread.route===null?'':`你之前選擇「${ERA_ROUTE_NAMES[thread.route]}」。`;
 return {id:'era-event',scene:'story',title:`${topic.emoji} ${title}`,text:`${text} ${topic.npc}會記得這輪的選擇。${role}${roleDetails[id]?.[source?.category]??''}${route}${calendar.year===2026?'以2026資料為背景，這段情節與結果均為虛構。':'這是隨人生年份發展的虛構演化，不是未來新聞。'}`,eraEvent:{theme:id,stage:thread.stage,cycle:thread.cycle,sourceCareer:thread.sourceCareer},choices};
}
export function validEraEvent(e,s){const meta=e.eraEvent,t=eraTopic(meta?.theme),thread=t&&threadFor(s,t.id);if(!thread||thread.stage!==meta.stage||thread.cycle!==meta.cycle||thread.sourceCareer!==meta.sourceCareer)return false;const expected=makeEraEvent(s,t.id);return !!expected&&e.title===expected.title&&e.text===expected.text&&JSON.stringify(e.choices)===JSON.stringify(expected.choices);}
export function restoreEra(s){
 if(s.era===undefined){s.era=eraDefaults(s);return true;}const e=s.era,integer=(n,min=0,max=10000)=>Number.isInteger(n)&&n>=min&&n<=max;
 if(!e||e.version!==1||e.referenceDate!==ERA_REFERENCE_DATE||e.startYear!==2026||e.startMonth!==11||!integer(e.started,0,s.elapsed)||!integer(e.seed,0,4294967295)||typeof e.auto!=='boolean'||!integer(e.nextEvent,0,1000)||!integer(e.lastCourseMonth,e.started,s.elapsed))return false;
 if(!e.threads||Array.isArray(e.threads)||Object.keys(e.threads).length>9||Object.entries(e.threads).some(([id,t])=>!eraTopic(id)||!t||!integer(t.stage,0,3)||!integer(t.cycle,0,30)||!integer(t.due,0,1000)||!integer(t.opened,e.started,s.elapsed)||!integer(t.closed,0,s.elapsed)||t.sourceCareer!==null&&!JOBS.some(j=>j.id===t.sourceCareer)||t.route!==null&&!integer(t.route,0,2)||!Number.isFinite(t.trust)||t.trust<0||t.trust>100||!Array.isArray(t.actions)||t.actions.length>3||t.actions.some(n=>!integer(n,0,3))||t.stage<3&&t.actions.length!==t.stage||t.stage>0&&t.stage<3&&t.route===null))return false;
 if(Object.values(e.threads).filter(t=>t.stage<3).length>2)return false;
 if(!e.courses||Array.isArray(e.courses)||Object.keys(e.courses).length>ERA_SPECIALTIES.length||Object.entries(e.courses).some(([id,c])=>!eraSpecialty(id)||!c||typeof c.related!=='boolean'||typeof c.paused!=='boolean'||typeof c.completed!=='boolean'||!integer(c.started,e.started,s.elapsed)||!integer(c.credits,0,c.related?3:6)||c.completed&&(c.credits<(c.related?3:6)||s.elapsed-c.started<(c.related?3:6))))return false;
 if(Object.values(e.courses).filter(c=>!c.completed&&!c.paused).length>2)return false;
 if(!Array.isArray(e.history)||e.history.length>40||e.history.some(r=>!r||!eraTopic(r.theme)||!integer(r.stage,0,2)||!integer(r.cycle,0,30)||r.sourceCareer!==null&&!JOBS.some(j=>j.id===r.sourceCareer)||r.route!==null&&!integer(r.route,0,2)||!integer(r.choice,0,3)||!integer(r.elapsed,e.started,s.elapsed)||typeof r.passed!=='boolean'||!Number.isFinite(r.reward)||r.reward<0||r.reward>10000))return false;
 if(e.last!==null&&(!e.last||!eraTopic(e.last.theme)||typeof e.last.title!=='string'||e.last.title.length>300||typeof e.last.text!=='string'||e.last.text.length>2000))return false;
 if(!e.metrics||!['finished','paused','completedCourses'].every(k=>integer(e.metrics[k]))||!Number.isFinite(e.metrics.earned)||e.metrics.earned<0||e.metrics.earned>2e9)return false;
 return true;
}
export function settleEra(g){const s=g.s,e=s.era;for(const [id,c]of Object.entries(e.courses)){if(!c.completed&&!c.paused&&c.credits>=(c.related?3:6)&&s.elapsed-c.started>=(c.related?3:6)){c.completed=true;e.metrics.completedCourses++;const spec=eraSpecialty(id);journal(g,`完成「${spec.name}」遊戲專精；原有職業技能保留，正式資格及授權仍另外核對。`);g.record('study','新能力，接上原本的路',`你完成${spec.name}的課堂與修業年期。這是遊戲專精，不是實際證照；可以在合適職務的接案與協作中使用。`);}}
 e.lastCourseMonth=s.elapsed;
}
function activate(g,id){const s=g.s,e=s.era,old=e.threads[id];if(!old||old.stage===3){e.threads[id]={stage:0,cycle:eraPhase(s,id).cycle,due:s.elapsed,opened:s.elapsed,closed:0,sourceCareer:s.career,route:null,trust:40,actions:[]};}
 s.pending=makeEraEvent(s,id);e.nextEvent=s.elapsed+3;return true;
}
export const eraMethods={
 get eraCalendar(){return eraCalendar(this.s);},
 get eraDemand(){return eraDemand(this.s);},
 get eraSpecialties(){return completedEraCourses(this.s);},
 setEraAuto(value){if(typeof value!=='boolean'||!this.active)return false;this.s.era.auto=value;return true;},
 enrollEraSpecialty(id){const s=this.s,c=eraSpecialty(id),offer=courseOffer(s,id);if(!c||!offer||s.era.courses[id]||s.risks.captivity||s.risks.delay||!this.can(1,0,offer.fee)||Object.values(s.era.courses).filter(x=>!x.completed&&!x.paused).length>=2)return false;this.spend();this.pay(offer.fee);s.era.courses[id]={related:offer.related,started:s.elapsed,credits:0,completed:false,paused:false};journal(this,`開始「${c.name}」：${offer.related?'承接原有專長':'跨領域補課'}，至少${offer.months}個月及${offer.credits}次練習；入學費 $${offer.fee}，每課 $${c.lessonFee}。不取代正式職業資格。`);return true;},
 studyEraSpecialty(id){const s=this.s,spec=eraSpecialty(id),c=s.era.courses[id];if(!spec||!c||c.completed||c.paused||c.credits>=(c.related?3:6)||s.risks.captivity||s.risks.delay||!this.can(1,12,spec.lessonFee))return false;this.spend(12);this.pay(spec.lessonFee);c.credits++;s.skills[spec.skill]=clamp(s.skills[spec.skill]+1.2*Math.max(.12,1-s.skills[spec.skill]/110),0,100);this.changeStats({jq:.15,stress:2});progressGoal(this,'craft');journal(this,`${spec.name}：完成第${c.credits}/${c.related?3:6}次課堂；等待修業年期及練習同時達標。`);settleEra(this);return true;},
 pauseEraSpecialty(id){const s=this.s,c=s.era.courses[id];if(!c||c.completed||!this.active)return false;if(c.paused&&Object.values(s.era.courses).filter(x=>!x.completed&&!x.paused).length>=2)return false;c.paused=!c.paused;return true;},
 exploreEra(id){const s=this.s;if(!eraTopic(id)||s.risks.captivity||s.risks.delay||!this.can(1,8)||!eraCandidate(s,id))return false;this.spend(8);return activate(this,id);},
 triggerEraEvent(){const s=this.s,e=s.era;if(!e.auto||!this.active||s.risks.captivity||s.risks.delay||s.elapsed<e.nextEvent)return false;const due=relevantEraTopics(s).filter(t=>e.threads[t.id]?.stage<3&&e.threads[t.id].due<=s.elapsed);let candidates=due.length?due:relevantEraTopics(s).filter(t=>eraCandidate(s,t.id));if(!candidates.length)return false;let value=this.roll()*candidates.reduce((n,t)=>n+(e.threads[t.id]?1:1.8)*(eraPhase(s,t.id).id==='growth'?1.4:1),0);const t=candidates.find(t=>(value-=(e.threads[t.id]?1:1.8)*(eraPhase(s,t.id).id==='growth'?1.4:1))<=0)??candidates.at(-1);return activate(this,t.id);},
 resolveEra(index){const s=this.s,event=s.pending;if(event?.id!=='era-event'||!Number.isInteger(index)||!validEraEvent(event,s))return false;const choice=event.choices[index];if(!choice)return false;const e=s.era,t=eraTopic(event.eraEvent.theme),thread=e.threads[t.id],stage=thread.stage;this.changeStats(choice.effects);const skill=(JOBS.find(j=>j.id===thread.sourceCareer)??jobFor(s))?.skill??'analysis';s.skills[skill]=clamp(s.skills[skill]+choice.skillGain*Math.max(.12,1-s.skills[skill]/110),0,100);const passed=choice.chance>0&&this.roll()<choice.chance,reward=passed?choice.reward:0;if(reward)this.earn(reward);e.metrics.earned+=reward;
  thread.actions.push(index);if(stage===0&&index<3)thread.route=index;thread.trust=clamp(thread.trust+(index===3?0:index===2?4:2),0,100);const pause=index===3;thread.stage=pause?3:stage+1;thread.due=s.elapsed+2;if(thread.stage===3){thread.closed=s.elapsed;if(pause)e.metrics.paused++;else e.metrics.finished++;}
  const next=pause?'你保留了現金與時間，這輪不再追問。':thread.stage<3?'下一章最早兩個月後出現；原有職業、技能與資格要求仍然保留。':choice.chance>0?(passed?`這次有限交付通過，收到額外費用 $${reward}。`:'這次尚未達到約定成果，保留學習與合作紀錄；沒有額外費用進帳。'):'你把經驗留作長期服務、陪伴與生活安排，沒有承接額外有償工作。';
  const text=`你選擇：${choice.label}。${next} ${ERA_ROUTE_NAMES[thread.route]??'按自己的節奏'}是這輪留下的路線。`,row={theme:t.id,stage,choice:index,elapsed:s.elapsed,passed,reward,sourceCareer:thread.sourceCareer,cycle:thread.cycle,route:thread.route};e.history.push(row);e.history=e.history.slice(-40);e.last={theme:t.id,title:event.title,text};progressGoal(this,['silver','pets'].includes(t.id)?'connection':t.id==='climate'?'service':'craft',pause?.2:1);s.pending=null;journal(this,`${t.name}｜${text}`);this.record('story',event.title,text);return true;
 },
};
