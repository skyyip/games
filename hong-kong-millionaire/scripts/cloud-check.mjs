// Adapter tests with a deterministic SDK double. These do not replace Rules Emulator tests.
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {hkDay,dayEnd,questionFor,newRun,act} from '../src/game.js';
const {build}=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const dir=await mkdtemp(join(tmpdir(),'hkm-cloud-')),NOW=Date.UTC(2026,10,14,4),nativeNow=Date.now;
const qa=globalThis.__HKM_CLOUD_QA={now:NOW,uid:'qa-account-0001',data:new Map(),calls:[],tail:Promise.resolve()};
Date.now=()=>qa.now;
const sdk=`
const q=globalThis.__HKM_CLOUD_QA;
class Stamp {constructor(n){this.n=n;}toMillis(){return this.n;}}
function copy(v){if(v instanceof Stamp)return new Stamp(v.n);if(Array.isArray(v))return v.map(copy);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,copy(x)]));return v;}
function resolve(v){if(v?.__server)return new Stamp(q.now+.75);if(v instanceof Stamp)return copy(v);if(Array.isArray(v))return v.map(resolve);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,resolve(x)]));return v;}
function snap(path){return {exists:()=>q.data.has(path),data:()=>copy(q.data.get(path))};}
export const SDK_VERSION='test-sdk',browserLocalPersistence='local';
export function initializeApp(config,name){q.calls.push({kind:'app',config,name});return {options:config,name};}
export function getAuth(app){return {app,get currentUser(){return q.uid?{uid:q.uid,email:'private@example.test'}:null;}};}
export async function setPersistence(){};export function getFirestore(){return {};}
export function onAuthStateChanged(auth,cb){cb(auth.currentUser);return ()=>{};}
export function doc(db,...parts){return parts.join('/');}export function collection(db,...parts){return parts.join('/');}
export function serverTimestamp(){return {__server:true};}export async function getDoc(ref){return snap(ref);}
export async function updateDoc(ref,patch){q.data.set(ref,{...q.data.get(ref),...resolve(patch)});}
export function runTransaction(db,cb){const task=q.tail.then(async()=>{let writing=false;const writes=[];const t={async get(ref){if(writing)throw Error('read-after-write');return snap(ref);},set(ref,value){writing=true;writes.push({ref,value});},update(ref,value){writing=true;writes.push({ref,value,update:true});}};const value=await cb(t);for(const w of writes)q.data.set(w.ref,w.update?{...q.data.get(w.ref),...resolve(w.value)}:resolve(w.value));q.calls.push({kind:'transaction',paths:writes.map(w=>w.ref)});return value;});q.tail=task.catch(()=>{});return task;}
export const where=(key,op,value)=>({kind:'where',key,op,value}),orderBy=(key,dir='asc')=>({kind:'order',key,dir}),limit=value=>({kind:'limit',value}),query=(path,...clauses)=>({path,clauses});
export async function getDocs(query){let rows=[...q.data].filter(([key])=>key.startsWith(query.path+'/')&&key.split('/').length===query.path.split('/').length+1).map(([path,data])=>({path,data}));for(const c of query.clauses.filter(c=>c.kind==='where'))rows=rows.filter(r=>r.data[c.key]===c.value);const sorts=query.clauses.filter(c=>c.kind==='order');rows.sort((a,b)=>{for(const s of sorts){const av=a.data[s.key]?.toMillis?.()??a.data[s.key],bv=b.data[s.key]?.toMillis?.()??b.data[s.key];if(av!==bv)return(av<bv?-1:1)*(s.dir==='desc'?-1:1);}return 0;});rows=rows.slice(0,query.clauses.find(c=>c.kind==='limit')?.value??rows.length);return {docs:rows.map(r=>snap(r.path))};}
export async function signInWithEmailAndPassword(auth,email,password){q.calls.push({kind:'email',email,password});return {user:auth.currentUser};}
export async function createUserWithEmailAndPassword(auth,email,password){q.calls.push({kind:'register',email,password});return {user:auth.currentUser};}
export async function sendPasswordResetEmail(auth,email){q.calls.push({kind:'reset',email});}export async function signOut(){q.uid=null;}
export class GoogleAuthProvider{setCustomParameters(p){this.params=p;}}
export async function signInWithPopup(){throw Error('not-simulated');}
export function connectAuthEmulator(){}export function connectFirestoreEmulator(){}
`;
let checks=0;
try{
 await writeFile(join(dir,'sdk.mjs'),sdk);
 const outfile=join(dir,'cloud.mjs');await build({entryPoints:[new URL('../src/cloud.js',import.meta.url).pathname],bundle:true,platform:'node',format:'esm',outfile,plugins:[{name:'test-sdk',setup(b){b.onResolve({filter:/^firebase\//},()=>({path:join(dir,'sdk.mjs')}));}}]});
 const cloud=await import(pathToFileURL(outfile));await cloud.prepareAuth();const app=qa.calls.find(c=>c.kind==='app');assert.equal(app.name,'hk-millionaire');assert.equal(app.config.projectId,'sky-playground-millionaire');assert.equal(app.config.apiKey.length,39);checks++;
 let profile=await cloud.account();assert.equal(profile.total,0);assert(!profile.displayName.includes('@'));await cloud.saveName('測試香港通');assert.equal((await cloud.account()).displayName,'測試香港通');checks++;
 let r=await cloud.claimDaily();assert.equal(r.questionAt,NOW);assert.equal(r.seen.length,0);assert.equal((await cloud.claimDaily()).startedAt,r.startedAt);checks++;
 const at=r.questionAt;for(const kind of ['half','phone','audience']){qa.now+=100;r=await cloud.move(r.day,{type:'life',kind});assert.equal(r.questionAt,at);await assert.rejects(()=>cloud.move(r.day,{type:'life',kind}),/life-used/);}checks++;
 for(let i=0;i<15;i++){qa.now+=1000;r=await cloud.move(r.day,{type:'answer',choice:questionFor(r).answer});assert.equal(r.correct,i+1);assert.equal(r.seen.length,i+1);if(i<14){qa.now+=20000;r=await cloud.move(r.day,{type:'next'});}}
 assert.equal(r.payout,1000000);assert.equal(r.reason,'complete');assert.equal(r.timeMs,15300);profile=await cloud.account();assert.equal(profile.games,1);assert.equal(profile.total,1000000);assert.equal(profile.unlocked.length,15);assert.deepEqual(profile.titles,['ordinary','neighbour','expert','peak','millionaire']);checks++;
 await Promise.all([cloud.settle(r.day),cloud.settle(r.day)]);assert.equal((await cloud.account()).total,1000000);assert.equal((await cloud.account()).games,1);assert.equal((await cloud.claimDaily()).phase,'finished');checks++;
 for(const type of ['daily','season','all']){const rows=await cloud.leaderboard(type);assert.equal(rows.length,1);assert.equal(rows[0].displayName,'測試香港通');assert(!('email'in rows[0]));assert(!('answers'in rows[0]));}checks++;
 await cloud.favourite(r.seen[0]);assert.deepEqual((await cloud.account()).favourites,[r.seen[0]]);await assert.rejects(()=>cloud.favourite('unknown'),/not-unlocked/);assert.equal((await cloud.history()).length,1);checks++;
 // Next day: an ordinary wrong result adds only the applicable insurance to lifetime/month totals.
 qa.now=dayEnd(r.day)+1000;r=await cloud.claimDaily();for(let i=0;i<10;i++){qa.now+=1000;r=await cloud.move(r.day,{type:'answer',choice:questionFor(r).answer});qa.now+=200;r=await cloud.move(r.day,{type:'next'});}qa.now+=1000;r=await cloud.move(r.day,{type:'answer',choice:(questionFor(r).answer+1)%4});assert.equal(r.payout,60000);assert.equal((await cloud.account()).total,1060000);assert.equal((await cloud.leaderboard('season'))[0].total,1060000);checks++;
 // Leave an incorrect terminal reveal before midnight, then reconnect the following day.
 qa.now=dayEnd(r.day)+1000;r=await cloud.claimDaily();for(let i=0;i<6;i++){qa.now+=500;r=await cloud.move(r.day,{type:'answer',choice:questionFor(r).answer});qa.now+=100;r=await cloud.move(r.day,{type:'next'});}const waiting=act(r,{type:'answer',choice:(questionFor(r).answer+1)%4},qa.now+100,{autoFinish:false});const path='hkm_players/'+qa.uid+'/runs/'+r.day;qa.data.set(path,waiting);qa.now=dayEnd(r.day)+1000;await cloud.resumeAccount();const failed=await cloud.currentRun(r.day);assert.equal(failed.reason,'wrong');assert.equal(failed.payout,8000);checks++;
 // A full win waiting for settlement must still finish as complete after midnight.
 r=await cloud.claimDaily();for(let i=0;i<15;i++){r=act(r,{type:'answer',choice:questionFor(r).answer},qa.now+100,{autoFinish:false});if(i<14)r=act(r,{type:'next'},qa.now+200);}qa.data.set('hkm_players/'+qa.uid+'/runs/'+r.day,r);qa.now=dayEnd(r.day)+1000;await cloud.resumeAccount();assert.equal((await cloud.currentRun(r.day)).reason,'complete');checks++;
 // A timed-out unfinished question settles on resume, rather than resetting its deadline.
 r=await cloud.claimDaily();qa.now=r.questionAt+20001;const resumed=await cloud.resumeAccount();assert.equal(resumed.run.reason,'timeout');assert.equal(resumed.run.payout,0);checks++;
 await cloud.emailLogin('qa@example.test','password');await cloud.emailLogin('new@example.test','password',true);await cloud.resetPassword('qa@example.test');for(const kind of ['email','register','reset'])assert(qa.calls.some(c=>c.kind===kind));await cloud.logout();await assert.rejects(()=>cloud.claimDaily(),/login-required/);checks++;
 assert(qa.calls.filter(c=>c.kind==='transaction').every(c=>c.paths.every(p=>/^hkm_/.test(p))));console.log(JSON.stringify({checks,transactions:qa.calls.filter(c=>c.kind==='transaction').length,mode:'SDK double; no live Firebase or rule execution'}));
}finally{Date.now=nativeNow;delete globalThis.__HKM_CLOUD_QA;await rm(dir,{recursive:true,force:true});}
