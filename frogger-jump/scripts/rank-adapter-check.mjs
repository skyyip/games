// Test the actual cloud adapter against a deterministic Firestore aggregate fixture.
import assert from 'node:assert/strict';import {resolve} from 'node:path';
const esbuild=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const mocks={
 'firebase/app':"export const initializeApp=()=>({});",
 'firebase/auth':"export const getAuth=()=>({currentUser:{uid:'me'}});export const browserLocalPersistence={};export async function setPersistence(){}",
 'firebase/firestore':`const h=globalThis.rankHarness;export const getFirestore=()=>({});export const doc=(db,...parts)=>parts.join('/');export const collection=(db,name)=>name;export const orderBy=(field,direction)=>({field,direction});export const limit=n=>({limit:n});export async function getDocs(q){h.boardQuery=q;h.boardReads=(h.boardReads??0)+1;if(h.error)throw {code:h.error};return {docs:[...h.rows].sort((a,b)=>b.score-a.score||a.at-b.at||a.uid.localeCompare(b.uid)).slice(0,q.constraints.at(-1).limit).map(row=>({id:row.uid,data:()=>({...row,at:{toMillis:()=>row.at}})}))};}export const documentId=()=>'__name__';export const endBefore=snapshot=>({cursor:snapshot});export const query=(collection,...constraints)=>({collection,constraints});export async function getDocFromServer(path){h.reads++;assertPath(path);return {exists:()=>h.rows.some(r=>r.uid==='me'),data:()=>h.rows.find(r=>r.uid==='me')};}function assertPath(path){if(path!=='frogger_leaderboard/me')throw Error('wrong collection');}export async function getCountFromServer(q){h.counts++;h.query=q;if(h.error)throw {code:h.error};const mine=q.constraints.at(-1).cursor.data(),before=h.rows.filter(r=>r.score>mine.score||r.score===mine.score&&(r.at<mine.at||r.at===mine.at&&r.uid<mine.uid));return {data:()=>({count:before.length})};}`
};
const built=await esbuild.build({stdin:{contents:"export {playerRank,topFifty} from './frogger-jump/src/cloud.js';",resolveDir:resolve('.')},bundle:true,format:'esm',platform:'node',write:false,plugins:[{name:'rank-sdk',setup(b){b.onResolve({filter:/^firebase\//},a=>({path:a.path,namespace:'rank-sdk'}));b.onLoad({filter:/.*/,namespace:'rank-sdk'},a=>({contents:mocks[a.path],loader:'js'}));}}]});
const previous=globalThis.rankHarness,h={rows:[],reads:0,counts:0};globalThis.rankHarness=h;
try{
 const cloud=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
 assert.deepEqual(await cloud.playerRank(),{uid:'me',rank:null,score:0});assert.equal(h.counts,0);
 h.rows=[{uid:'me',score:10,at:100}];assert.equal((await cloud.playerRank()).rank,1);
 h.rows=[...Array.from({length:53},(_,i)=>({uid:'ahead'+i,score:50,at:100})),{uid:'me',score:10,at:100},{uid:'below',score:9,at:1}];assert.equal((await cloud.playerRank()).rank,54,'rank is not limited to the top fifty');
 h.rows=[{uid:'aaa',score:10,at:100},{uid:'me',score:10,at:100},{uid:'zzz',score:10,at:100},{uid:'older',score:10,at:99},{uid:'newer',score:10,at:101},{uid:'higher',score:11,at:200}];assert.equal((await cloud.playerRank()).rank,4);
 assert.equal(h.query.collection,'frogger_leaderboard');assert.deepEqual(h.query.constraints.slice(0,3),[{field:'score',direction:'desc'},{field:'at',direction:'asc'},{field:'__name__',direction:'asc'}]);
 h.error='permission-denied';await assert.rejects(cloud.playerRank(),e=>e.code==='permission-denied');assert.equal(h.reads,5);assert.equal(h.counts,4);
 delete h.error;h.rows=Array.from({length:60},(_,i)=>({uid:'p'+String(i).padStart(2,'0'),name:'Player'+i,animal:'frog',score:100-Math.floor(i/2),at:i}));
 const leaders=await cloud.topFifty(true);assert.equal(leaders.length,50);assert.equal(leaders[0].uid,'p00');assert.equal(leaders[49].uid,'p49');assert.equal(leaders[49].at,49);assert.equal(h.boardQuery.collection,'frogger_leaderboard');assert.deepEqual(h.boardQuery.constraints,[{field:'score',direction:'desc'},{field:'at',direction:'asc'},{limit:50}]);
 await assert.rejects(cloud.topFifty(),/refresh-cooldown/);assert.equal(h.boardReads,1);h.error='unavailable';await assert.rejects(cloud.topFifty(true),e=>e.code==='unavailable');assert.equal(h.boardReads,2);
 console.log('PASS real rank adapter: missing record, first place, rank 54, score/time/document-ID ties, server aggregate, fifty-row query, cooldown and error forwarding. No production data read or written.');
}finally{if(previous===undefined)delete globalThis.rankHarness;else globalThis.rankHarness=previous;}
