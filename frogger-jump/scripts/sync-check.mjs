import assert from 'node:assert/strict';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({serviceWorkers:'block'});
 await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
 // Replace the network boundary only; never sign in or write production data.
 await context.route('**/frogger-jump/src/cloud.js',r=>r.fulfill({contentType:'text/javascript',body:`
 export const cloudConfigured=false;
 export const settleCloudRun=run=>globalThis.syncMock.settle(run);
 export const beginCloudRun=()=>globalThis.syncMock.begin();
 `}));
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.FROGGER_URL||'http://localhost:5260/frogger-jump/',{waitUntil:'networkidle'});
 const results=await page.evaluate(async()=>{
  const {RiverPlayers}=await import('./src/social.js'),{PendingResults}=await import('./src/pending.js');
  const {PENDING_KEY}=await import('./src/profile.js');
  const run=(uid,id)=>({uid,id,score:20,animal:'frog'});
  const queue=new PendingResults(JSON.stringify([run('alice','a1'),run('bob','b1')]));
  let calls=0,release,starts=0;
  globalThis.syncMock={settle:()=>{calls++;return new Promise(resolve=>release=resolve);},begin:async()=>{starts++;return {uid:'bob',id:'b2',animal:'frog'};}};
  const players=Object.assign(Object.create(RiverPlayers.prototype),{cloudProfile:{uid:'alice',name:'Alice'},pendingResults:queue,authReady:true,persistent:true,render(){}});
  const first=players.retryPending(),second=players.retryPending();await Promise.resolve();
  players.cloudProfile={uid:'bob',name:'Bob',coins:7};
  release({profile:{uid:'alice',name:'Alice',coins:51},reward:51});await Promise.all([first,second]);
  const safeProfile=players.cloudProfile.uid==='bob'&&players.cloudProfile.coins===7;
  const saved=JSON.parse(localStorage.getItem(PENDING_KEY));
  // Bob's result must be settled before beginning Bob's next run.
  globalThis.syncMock.settle=async run=>{calls++;return {profile:{uid:run.uid,name:'Bob',coins:58},reward:51};};
  const next=await players.prepareRun();
  // A foreign result must neither block Bob nor get discarded.
  queue.add(run('alice','a2'));players.storePending();const foreignStart=await players.prepareRun();
  const foreignPreserved=JSON.parse(localStorage.getItem(PENDING_KEY))[0].uid==='alice';
  return {calls,safeProfile,saved,next,starts,foreignStart,foreignPreserved,pending:players.pending};
 });
 assert.equal(results.calls,2);assert(results.safeProfile);
 assert.deepEqual(results.saved.map(r=>r.uid),['bob']);
 assert.equal(results.next.uid,'bob');assert.equal(results.starts,2);
 assert.equal(results.foreignStart.uid,'bob');assert(results.foreignPreserved);assert.equal(results.pending,null);
 assert.deepEqual(errors,[]);
 console.log('PASS browser sync: shared retries, account-switch isolation, persisted queues, settlement before replay, foreign result preservation.');
 await context.close();
}finally{await browser.close();}
