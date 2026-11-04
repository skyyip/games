import test from 'node:test';import assert from 'node:assert/strict';
import {LifeGame} from '../src/game.js';import {JOBS} from '../src/content.js';import {ASSET_INFO} from '../src/economy.js';import {WORK_TRACKS,workProfile} from '../src/work-experience.js';
function rig(name='水電工'){const g=new LifeGame({seed:123});g.chooseCareer(JOBS.find(j=>j.name===name).id);g.s.cash=100000;g.roll=()=>.95;return g;}
function answer(g,approach='check'){assert(g.s.pending?.work);const i=g.s.pending.choices.findIndex(c=>c.approach===approach);assert(g.resolve(i));}
test('all405 jobs have concrete daily tasks, acceptance criteria and at least three playable problems',()=>{
 assert.equal(Object.keys(WORK_TRACKS).length,25);for(const job of JOBS){const p=workProfile(job);assert(p.day.length>=3);assert(p.requirements.length>=3);assert(p.cases.length>=3);const g=rig(job.name);assert(g.work());assert.equal(g.s.pending.id,'work-case');assert(g.s.pending.text.length>10);assert(g.s.pending.work.clue.length>10);assert(LifeGame.restore(g.s));answer(g);assert(LifeGame.restore(g.s));}
});
test('plumber,YouTuber,barista,frontend and pet-communication assignments contain specific professional issues',()=>{
 for(const [job,word]of [['水電工','現勘'],['YouTuber','安全'],['咖啡師','無奶'],['前端工程師','鍵盤'],['寵物溝通師','獸醫']]){const g=rig(job),p=workProfile(g.job),scenario=p.cases.findIndex(c=>c.join(' ').includes(word));assert(scenario>=0,job);g.s.life.projectCounts[g.job.id]=scenario<3?scenario:3+4*(scenario-3);g.work();assert((g.s.pending.title+g.s.pending.text+g.s.pending.work.clue+g.s.pending.choices.map(c=>c.label).join('')).includes(word));}
});
test('a work problem blocks time advancement until answered, does not charge a second action and pays salary once',()=>{
 const g=rig();g.work();const cash=g.s.cash,ap=g.s.ap;assert.equal(g.endMonth(),false);answer(g);assert.equal(g.s.ap,ap);assert(g.s.cash>cash);assert.equal(g.s.profession.completed,1);assert.equal(g.s.profession.passed,1);const before=g.s.cash;g.work();assert.equal(g.s.cash,before);assert.equal(g.s.pending,null);assert(g.endMonth());g.work();assert(g.s.pending.work);assert.notEqual(g.s.pending.work.scenario,0);
});
test('deep verification and scoped delivery trade energy, costs and potential bonuses',()=>{
 const careful=rig(),scoped=rig();careful.work();scoped.work();answer(careful);answer(scoped,'rush');assert(careful.s.profession.quality>scoped.s.profession.quality);assert(careful.s.stats.energy<scoped.s.stats.energy);assert(careful.s.cash>scoped.s.cash);assert(scoped.s.profession.last.feedback.includes('縮小'));
});
test('work history remains tied to its profession across career switches and old saves migrate',()=>{
 const g=rig();g.work();answer(g);g.chooseCareer(JOBS.find(j=>j.name==='YouTuber').id);assert.equal(g.s.profession.counts[JOBS.find(j=>j.name==='水電工').id],1);assert.equal(g.s.profession.counts[g.s.career],undefined);assert(LifeGame.restore(g.s));delete g.s.profession;assert.equal(LifeGame.restore(g.s).s.profession.completed,0);
});
test('work save validation rejects unknown approaches, altered clues and malformed profession history',()=>{
 const g=rig();g.work();const raw=JSON.stringify(g.s);g.s.pending.choices[0].approach='cheat';assert.equal(LifeGame.restore(g.s),null);const good=LifeGame.restore(raw);good.s.pending.work.clue='<img>';assert.equal(LifeGame.restore(good.s),null);good.s.pending=null;good.s.profession.counts.hack=1;assert.equal(LifeGame.restore(good.s),null);
});
test('one free allocation buys all eight assets with a single action and visible costs',()=>{
 const g=rig(),entries=Object.fromEntries(Object.keys(ASSET_INFO).map(k=>[k,k==='property'?10000:1000]));const prior=JSON.stringify(g.s),preview=g.allocationPreview(entries);assert(preview.ok);assert.equal(JSON.stringify(g.s),prior);assert.equal(preview.orders.length,8);assert.equal(preview.fees,440);assert(g.allocate(entries));assert.equal(g.s.ap,2);assert.equal(g.s.cash,83000);for(const k of Object.keys(ASSET_INFO))assert(g.assetValue(k)>0);assert(LifeGame.restore(g.s));
});
test('selling one asset can fund other purchases in the same atomic transaction',()=>{
 const g=rig();g.s.cash=0;g.s.assets.stock=100;const preview=g.allocationPreview({stock:-10000,etf:5000,bank:5000});assert(preview.ok);assert(g.allocate({stock:-10000,etf:5000,bank:5000}));assert.equal(g.s.cash,0);assert.equal(g.s.assets.stock,0);assert.equal(g.assetValue('etf'),5000);assert.equal(g.assetValue('bank'),5000);
});
test('weight allocation reserves residual cash and scales buys to account for selling costs',()=>{
 const g=rig();assert(g.allocate({bank:30,stock:20,crypto:10},'weights'));assert.equal(g.s.cash,40000);assert.equal(g.assetValue('bank'),30000);assert.equal(g.assetValue('stock'),20000);
 g.s.ap=3;g.s.assets.cards=100;g.s.cash=0;const before=g.s.assets.stock,plan=g.allocationPreview({stock:100},'weights');assert(plan.ok);assert(plan.fees>0);assert(plan.cashAfter>=0);assert(g.allocate({stock:100},'weights'));assert(g.s.assets.stock>before);assert.equal(g.s.assets.cards,0);
});
test('invalid allocations are rejected without changing cash, holdings, RNG or action count',()=>{
 const g=rig();for(const [entries,mode]of [[{bank:100001},'amount'],[{property:9999},'amount'],[{stock:-1},'amount'],[{hack:100},'amount'],[{bank:NaN},'amount'],[{bank:60,etf:50},'weights'],[{bank:-1},'weights'],[{},'amount']]){const before=JSON.stringify(g.s);assert.equal(g.allocate(entries,mode),false);assert.equal(JSON.stringify(g.s),before);}
});

test('40 added emerging and niche jobs use new stable namespaces without replacing existing professions',()=>{
 const groups={ai:16,funeral:8,forensics:6,experience:10};for(const [id,count]of Object.entries(groups))assert.equal(JOBS.filter(j=>j.category===id).length,count);
 assert.equal(JOBS.find(j=>j.name==='星級主廚').id,'food-01');assert.equal(JOBS.find(j=>j.name==='AI詠唱師').id,'newventures-02');assert.equal(JOBS.find(j=>j.name==='殯葬禮儀師').id,'service-16');
 for(const name of ['AI代理工程師','RAG知識庫工程師','AI模型評測員','AI資料標註師','殯儀統籌師','法醫','試吃員','神秘顧客'])assert(workProfile(JOBS.find(j=>j.name===name)).specific);
});
test('new occupational scenarios exercise their relevant standards and all three choices round-trip safely',()=>{
 for(const [name,clue]of [['AI代理工程師','授權'],['RAG知識庫工程師','版本'],['AI模型評測員','測試'],['AI資料標註師','分歧'],['殯儀統籌師','意願'],['法醫','證據'],['試吃員','過敏原'],['神秘顧客','指標']]){
  const job=JOBS.find(j=>j.name===name),profile=workProfile(job);assert(profile.cases.some(c=>c.join(' ').includes(clue)));
  for(let number=0;number<profile.cases.length;number++)for(const approach of ['check','talk','rush']){const g=rig(name);g.s.profession.counts[job.id]=number;g.s.life.projectCounts[job.id]=number<3?number:3+4*(number-3);assert(g.work());assert(LifeGame.restore(g.s));answer(g,approach);assert(LifeGame.restore(g.s));assert.equal(g.s.profession.last.career,job.id);assert.equal(g.s.profession.completed,1);}
 }
});
