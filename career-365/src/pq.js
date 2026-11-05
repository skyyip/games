// Article-inspired, optional game mechanics; no psychological diagnosis or health guarantee.
export const PQ_SOURCE={title:'PQ．正向智商：人生成功幸福的關鍵',url:'https://melodyliao.cc/215/eq%E4%B8%8D%E6%B5%81%E8%A1%8C%E4%BA%86%EF%BC%8Cpq%E6%89%8D%E6%98%AF%E4%BA%BA%E7%94%9F%E6%88%90%E5%8A%9F%E5%B9%B8%E7%A6%8F%E7%9A%84%E9%97%9C%E9%8D%B5'};
export const MIND_PATTERNS={
 judge:{name:'批判',description:'把一次失誤當成整個人的價值，或只看見別人的缺點。',alternative:'把事實、感受與評價分開；指出可改善的做法，不否定自己或別人。'},
 avoider:{name:'逃避',description:'怕衝突而拖延必要的對話，把不舒服一直壓下去。',alternative:'先說清楚一項需要，再處理一個可以承擔的小步驟。'},
 controller:{name:'控制',description:'焦急時想替所有人作主，催促取代了協商。',alternative:'釐清自己能決定的範圍，也詢問對方的限制與意願。'},
 achiever:{name:'好勝',description:'把成就或別人的肯定，當成衡量自己唯一的尺。',alternative:'除了結果，也看學習、休息和關係是否符合自己的價值。'},
 rational:{name:'超理智',description:'只分析對錯，忽略自己和對方的感受。',alternative:'保留分析，同時問一句「這件事讓你有甚麼感受？」。'},
 vigilant:{name:'過度戒慎',description:'反覆預想最壞情況，難以把注意力放回當下。',alternative:'查核一項真實風險，準備可行預案，再決定下一步。'},
 pleaser:{name:'討好',description:'勉強答應超出負荷的要求，期待付出換來認可。',alternative:'在尊重他人的同時說明界線；幫忙也可以有選擇。'},
 restless:{name:'勞碌煩躁',description:'一直找新刺激或填滿行程，難以停下來。',alternative:'先完成一項重要的小事，為專注與休息留下空間。'},
 stickler:{name:'固執／完美要求',description:'把所有細節都當成不能出錯，難以接受合理的差異。',alternative:'分清不可省略的安全要求，以及可以逐步改善的部分。'},
 helpless:{name:'陷入無力感',description:'遇到挫折後覺得自己完全沒有選擇。文章稱為「受害者」模式。',alternative:'承認痛苦，尋求支援，再找回一小部分選擇權；受到傷害不是你的錯。'}
};
export const MIND_POWERS={
 empathy:{name:'同理心',prompt:'先聽見自己與對方的感受，既不急著責怪，也不放棄界線。',practice:'回想一次對話，分別寫下一個感受及一項需要。',work:'適合協作溝通；尊重對方意願，不能代替專業判斷。'},
 explore:{name:'探索力',prompt:'暫時放下定論，查問自己還不知道的事。',practice:'對困擾提出一個開放問題，分清事實、推測與待查證資料。',work:'適合深入覆核，先問問題、找依據。'},
 innovate:{name:'開創力',prompt:'在現實限制內，找出另一個可行的小方案。',practice:'列出兩個選項，再選一個低風險的小型嘗試。',work:'適合覆核後的小型試驗；受規管工作仍須資格、授權與督導。'},
 navigate:{name:'領航力',prompt:'想一想長遠重視甚麼，再選眼前值得做的事。',practice:'寫下一項重要價值，選一個兼顧自己與他人界線的下一步。',work:'依本次品質、人際或期限重點選做法，不能略過安全要求。'},
 activate:{name:'啟動力',prompt:'先安定注意力，再完成一個具體而可負擔的步驟。',practice:'把任務縮小到一個可完成的步驟，想清楚何時開始。',work:'適合有期限的有限交付；縮小承諾範圍，保留必要核對。'}
};
export const MIND_SENSES={touch:'觸覺：衣袖或腳底的觸感',sound:'聽覺：身邊的一種聲音',sight:'視覺：眼前的顏色和形狀'};
const own=(o,k)=>Object.hasOwn(o,k),integer=(n,max=10000)=>Number.isInteger(n)&&n>=0&&n<=max;
const counter=o=>Object.fromEntries(Object.keys(o).map(k=>[k,0]));
export function mindDefaults(){return {version:1,practices:0,responses:0,powers:counter(MIND_POWERS),patterns:counter(MIND_PATTERNS),lastPractice:-1,lastResponse:-1,prepared:null,history:[]};}
export function mindContext(s){
 const e=s.pending;if(!e||['setup','retired'].includes(s.status)||s.risks.captivity)return null;
 if(e.id==='work-case'||e.id==='occupation-event')return {title:e.title,kind:'work'};
 if(['blame','credit','layoff','supplier','inventory','reunion','classgap','crush','family-care','family-dinner','family-tension','romance','marriage','parenthood'].includes(e.id))return {title:e.title,kind:e.scene==='relationship'||e.group==='family'?'relationship':'life'};
 return null;
}
export const mindEventKey=(s,e=s.pending)=>e?JSON.stringify([s.elapsed,e.id,e.title,s.career]):null;
export function restoreMind(s){
 if(s.life.mind===undefined)s.life.mind=mindDefaults();const m=s.life.mind;
 if(!m||m.version!==1||!integer(m.practices)||!integer(m.responses)||!m.powers||!m.patterns||Array.isArray(m.powers)||Array.isArray(m.patterns)||Object.keys(m.powers).length!==5||Object.keys(m.patterns).length!==10||!Object.keys(MIND_POWERS).every(k=>integer(m.powers[k]))||!Object.keys(MIND_PATTERNS).every(k=>integer(m.patterns[k]))||Object.values(m.powers).reduce((a,b)=>a+b,0)!==m.practices+m.responses||Object.values(m.patterns).reduce((a,b)=>a+b,0)>m.practices+m.responses)return false;
 for(const key of ['lastPractice','lastResponse'])if(!Number.isInteger(m[key])||m[key]<-1||m[key]>s.elapsed)return false;
 const validPattern=k=>k==='none'||own(MIND_PATTERNS,k);
 if(m.prepared!==null&&(!m.prepared||!own(MIND_POWERS,m.prepared.power)||!validPattern(m.prepared.pattern)||m.prepared.eventKey!==mindEventKey(s)||m.lastResponse!==s.elapsed||!mindContext(s)))return false;
 if(!Array.isArray(m.history)||m.history.length>12||m.history.some(r=>!r||!own(MIND_POWERS,r.power)||!validPattern(r.pattern)||!['practice','response'].includes(r.kind)||!integer(r.elapsed,s.elapsed)||!integer(r.month,780)||r.month<216||typeof r.title!=='string'||r.title.length>300||!Number.isFinite(r.pq)||r.pq<0||r.pq>100||!Number.isFinite(r.stress)||r.stress< -100||r.stress>0))return false;
 if(s.lastLedger?.pqChange!==undefined&&(!Number.isFinite(s.lastLedger.pqChange)||Math.abs(s.lastLedger.pqChange)>100))return false;
 if(s.lastLedger?.mind!==undefined){const l=s.lastLedger.mind;if(!l||!integer(l.practices,1)||!integer(l.responses,1)||!Array.isArray(l.powers)||l.powers.length>2||l.powers.some(k=>!own(MIND_POWERS,k)))return false;}
 return true;
}
function remember(g,kind,power,pattern,title,before){const s=g.s,m=s.life.mind;m[kind==='practice'?'practices':'responses']++;m.powers[power]++;if(pattern!=='none')m.patterns[pattern]++;const r={kind,power,pattern,title,month:s.month,elapsed:s.elapsed,pq:s.stats.pq-before.pq,stress:s.stats.stress-before.stress};m.history.push(r);m.history=m.history.slice(-12);return r;}
export function mindMonth(s,elapsed=s.elapsed){const records=s.life.mind.history.filter(r=>r.elapsed===elapsed);return {practices:records.filter(r=>r.kind==='practice').length,responses:records.filter(r=>r.kind==='response').length,powers:[...new Set(records.map(r=>r.power))]};}
function workFits(event,power,approach){const fit={empathy:'talk',explore:'check',innovate:'check',navigate:({quality:'check',people:'talk',deadline:'rush'})[event.work.pressure??'quality'],activate:'rush'};return fit[power]===approach;}
export function mindWorkSupport(s,approach){const p=s.life.mind.prepared;if(!p||p.eventKey!==mindEventKey(s)||s.pending?.id!=='work-case')return 0;return workFits(s.pending,p.power,approach)?Math.min(3,1+s.stats.pq*.02):0;}
export function completeMind(g,event,choice){const s=g.s,m=s.life.mind,p=m.prepared;if(!p||p.eventKey!==mindEventKey(s,event))return;const before={pq:s.stats.pq,stress:s.stats.stress},aligned=event.work?workFits(event,p.power,choice.approach):!(choice.effects.affection<0);m.prepared=null;g.changeStats(aligned?{pq:.8,stress:-3}:{stress:-1});
 // Supportive decisions can strengthen an existing relationship, never force consent.
 if(['empathy','navigate'].includes(p.power)&&s.family.status>0&&choice.effects.affection>0)s.family.affection=Math.min(100,s.family.affection+1);
 const r=remember(g,'response',p.power,p.pattern,event.title,before);g.record('rest','先看見情緒，再選下一步',`你以「${MIND_POWERS[p.power].name}」回應「${event.title}」。${p.pattern==='none'?'你先留意感受，不替自己貼標籤。':`你留意到「${MIND_PATTERNS[p.pattern].name}」的反應，改選具體做法。`}PQ +${r.pq.toFixed(2)}、壓力 ${r.stress.toFixed(1)}；${aligned?'你把整理過的方向帶進了具體回應。':'這次做法與練習方向仍有距離，PQ未額外增加；下次仍可再試。'}原有選擇的費用、風險與後續仍保留。`);
}
export function mindRetirement(s){const m=s.life.mind;if(!m.practices&&!m.responses)return '';const top=Object.keys(MIND_POWERS).sort((a,b)=>m.powers[b]-m.powers[a])[0];return `你練習停一停 ${m.practices} 次，在 ${m.responses} 個選擇前整理感受，最常用的是「${MIND_POWERS[top].name}」。不是每次都順利，但你慢慢學會帶著情緒，選擇下一步。`;}
export const mindMethods={
 canPracticeMind(){return this.can(1,6)&&!this.s.risks.captivity&&!this.s.risks.delay&&this.s.life.mind.lastPractice!==this.s.elapsed;},
 practiceMind(power,pattern='none',sense='touch'){
  if(!own(MIND_POWERS,power)||pattern!=='none'&&!own(MIND_PATTERNS,pattern)||!own(MIND_SENSES,sense)||!this.canPracticeMind())return false;const s=this.s,m=s.life.mind,before={pq:s.stats.pq,stress:s.stats.stress};this.spend(6);m.lastPractice=s.elapsed;this.changeStats({pq:2.2,stress:-6});const r=remember(this,'practice',power,pattern,'一個小練習，把注意力帶回來',before);
  this.record('rest','一個小練習，把注意力帶回來',`${MIND_SENSES[sense]}。${MIND_POWERS[power].practice}${pattern==='none'?'':` 這次留意「${MIND_PATTERNS[pattern].name}」：${MIND_PATTERNS[pattern].alternative}`} PQ +${r.pq.toFixed(2)}、壓力 ${r.stress.toFixed(1)}。用一次本月安排及6精力；每個遊戲月一次，不需每天打卡，隔一段時間再練也有意義。`);return true;
 },
 prepareMind(power,pattern='none'){
  const s=this.s,m=s.life.mind;if(!own(MIND_POWERS,power)||pattern!=='none'&&!own(MIND_PATTERNS,pattern)||!mindContext(s)||m.lastResponse===s.elapsed||s.stats.energy<4)return false;
  s.stats.energy-=4;m.lastResponse=s.elapsed;m.prepared={power,pattern,eventKey:mindEventKey(s)};return true;
 }
};
