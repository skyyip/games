import test from 'node:test';import assert from 'node:assert/strict';
import {SocialSession} from '../src/social-api.js';
import {LifeGame,RETIRE_MONTH} from '../src/game.js';
import {JOBS} from '../src/content.js';
import {applySocialReceipt,socialContext} from '../src/social-game.js';
function game(){const g=new LifeGame({seed:123});g.chooseCareer(JOBS[0].id);g.s.life.socialRunId='run_12345678901234567890';return g;}
const receipt={id:'receipt_123456789012345',assignee:'alice',runId:'run_12345678901234567890',status:'completed',score:85,role:'people',companyName:'河岸公司',title:'宣傳委託',reward:500};
test('social requests reject signed-out users, retain the UID scope and ignore responses after identity changes',async()=>{let finish;const session=new SocialSession({load:async()=>({call:()=>new Promise(r=>finish=r)})});await assert.rejects(session.call('bootstrap'),/signin/);session.identity('alice');const request=session.call('bootstrap');await new Promise(r=>setTimeout(r,0));session.identity('bob');finish({uid:'alice',balance:5000});await assert.rejects(request,/identity-changed/);});
test('switching accounts while loading the social adapter does not send the first user request under the next identity',async()=>{let finish,calls=0;const session=new SocialSession({load:()=>new Promise(r=>finish=r)});session.identity('alice');const pending=session.call('createCompany');session.identity('bob');finish({call:async()=>{calls++;}});await assert.rejects(pending,/identity-changed/);assert.equal(calls,0);});
test('legacy or unverified cooperation receipts never grant growth',()=>{const g=game(),raw=JSON.stringify(g.s);assert.equal(applySocialReceipt(g,receipt,'alice'),false);assert.equal(JSON.stringify(g.s),raw);assert(socialContext(g).runId);for(const k of ['cash','health','iq','eq','pq','jq','email'])assert.equal(socialContext(g)[k],undefined);});
test('foreign users/lives, pending cases, already finished months and retirement cannot receive local cooperation growth',()=>{for(const [uid,change]of [['bob',()=>{}],['alice',g=>g.s.life.socialRunId='another_run_1234567890'],['alice',g=>g.s.ap=0],['alice',g=>g.work()],['alice',g=>{g.s.status='retired';g.s.month=RETIRE_MONTH;g.s.elapsed=RETIRE_MONTH-g.s.profile.startAge*12;}]]){const g=game();change(g);const before=JSON.stringify(g.s);assert.equal(applySocialReceipt(g,receipt,uid),false);assert.equal(JSON.stringify(g.s),before);}});
test('malformed social metadata and repeated receipt IDs cannot enter a restored save',()=>{const g=game();g.s.life.socialClaims=[receipt.id,receipt.id];assert.equal(LifeGame.restore(g.s),null);g.s.life.socialClaims=[];g.s.life.socialRunId='../invalid';assert.equal(LifeGame.restore(g.s),null);});

test('a verified grant adds bounded role growth and a comic once, without money, skills or work evidence',()=>{
 const g=game(),r={id:'company_task01',uid:'alice',peer:'bob',runId:g.s.life.socialRunId,kind:'delivery',role:'tech',state:'granted',companyName:'河岸公司',title:'一起核對資料'};
 const before=structuredClone(g.s),gains=applySocialReceipt(g,r,'alice');assert(gains.iq>0&&gains.jq>0);assert(gains.iq<2&&gains.jq<1);assert.equal(g.s.panels.length,before.panels.length+1);assert.match(g.s.panels.at(-1).text,/IQ \+/);
 for(const k of ['cash','debt','ap','skills','mastery','profession'])assert.deepEqual(g.s[k],before[k]);assert.deepEqual(g.s.life.entry,before.life.entry);
 const saved=LifeGame.restore(g.s);assert(saved);const once=JSON.stringify(saved.s);assert.equal(applySocialReceipt(saved,r,'alice'),false);assert.equal(JSON.stringify(saved.s),once);
});
test('unverified grants, wrong people/lives, stories and retirement cannot grant growth',()=>{
 for(const change of [r=>r.state='pending',r=>r.uid='bob',r=>r.runId='other_1234567890123456',r=>r.role='fake',r=>r.kind='fake',r=>r.id='../bad']){const g=game(),r={id:'company_task02',uid:'alice',runId:g.s.life.socialRunId,kind:'delivery',role:'care',state:'granted'};change(r);const before=JSON.stringify(g.s);assert.equal(applySocialReceipt(g,r,'alice'),false);assert.equal(JSON.stringify(g.s),before);}
 for(const mutate of [g=>g.openVocationalTask(),g=>g.s.status='retired']){const g=game(),r={id:'company_task03',uid:'alice',runId:g.s.life.socialRunId,kind:'review',role:'people',state:'granted'};mutate(g);assert.equal(applySocialReceipt(g,r,'alice'),false);}
});
test('three grants per game month, reset only with a new game month, preserve prior claims and cap stats',()=>{
 const g=game(),r={uid:'alice',runId:g.s.life.socialRunId,kind:'review',role:'people',state:'granted',companyName:'小河',title:'合作'};
 g.s.stats.eq=99.999;g.s.stats.jq=100;
 for(let i=0;i<3;i++)assert(applySocialReceipt(g,{...r,id:'company_task0'+i},'alice'));
 assert.equal(g.s.stats.eq,100);assert.equal(g.s.stats.jq,100);assert.equal(applySocialReceipt(g,{...r,id:'company_task04'},'alice'),false);
 const restored=LifeGame.restore(g.s);assert(restored);restored.s.elapsed++;restored.s.month++;assert(applySocialReceipt(restored,{...r,id:'company_task04'},'alice'));assert.equal(restored.s.life.cooperation.count,1);assert.equal(restored.s.life.socialClaims.length,4);
 for(const bad of [{month:-1,count:1},{month:0,count:4},{month:0,count:1.5},{month:99999,count:1},{month:0,count:1,extra:true}]){const raw=structuredClone(g.s);raw.life.cooperation=bad;assert.equal(LifeGame.restore(raw),null);}
});
