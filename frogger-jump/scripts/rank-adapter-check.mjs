// Test the actual cloud adapter against a deterministic Firestore aggregate fixture.
import assert from 'node:assert/strict';import {resolve} from 'node:path';
const esbuild=await import(process.env.BBL_ESBUILD_MODULE||'esbuild');
const mocks={
 'firebase/app':"export const initializeApp=()=>({});",
 'firebase/auth':"export const getAuth=()=>({currentUser:{uid:'me'}});export const browserLocalPersistence={};export async function setPersistence(){}",
 'firebase/firestore':`const h=globalThis.rankHarness;export const getFirestore=()=>({});export const doc=(db,...parts)=>parts.join('/');export const collection=(db,name)=>name;export const orderBy=(field,direction)=>({field,direction});export const documentId=()=>'__name__';export const endBefore=snapshot=>({cursor:snapshot});export const query=(collection,...constraints)=>({collection,constraints});export async function getDocFromServer(path){h.reads++;assertPath(path);return {exists:()=>h.rows.some(r=>r.uid==='me'),data:()=>h.rows.find(r=>r.uid==='me')};}function assertPath(path){if(path!=='frogger_leaderboard/me')throw Error('wrong collection');}export async function getCountFromServer(q){h.counts++;h.query=q;if(h.error)throw {code:h.error};const mine=q.constraints.at(-1).cursor.data(),before=h.rows.filter(r=>r.score>mine.score||r.score===mine.score&&(r.at<mine.at||r.at===mine.at&&r.uid<mine.uid));return {data:()=>({count:before.length})};}`
};
const built=await esbuild.build({stdin:{contents:"export {playerRank} from './frogger-jump/src/cloud.js';",resolveDir:resolve('.')},bundle:true,format:'esm',platform:'node',write:false,plugins:[{name:'rank-sdk',setup(b){b.onResolve({filter:/^firebase\//},a=>({path:a.path,namespace:'rank-sdk'}));b.onLoad({filter:/.*/,namespace:'rank-sdk'},a=>({contents:mocks[a.path],loader:'js'}));}}]});
const previous=globalThis.rankHarness,h={rows:[],reads:0,counts:0};globalThis.rankHarness=h;
try{
 const cloud=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
 assert.deepEqual(await cloud.playerRank(),{uid:'me',rank:null,score:0});assert.equal(h.counts,0);
 h.rows=[{uid:'me',score:10,at:100}];assert.equal((await cloud.playerRank()).rank,1);
 h.rows=[...Array.from({length:23},(_,i)=>({uid:'ahead'+i,score:50,at:100})),{uid:'me',score:10,at:100},{uid:'below',score:9,at:1}];assert.equal((await cloud.playerRank()).rank,24,'rank is not limited to the top ten');
 h.rows=[{uid:'aaa',score:10,at:100},{uid:'me',score:10,at:100},{uid:'zzz',score:10,at:100},{uid:'older',score:10,at:99},{uid:'newer',score:10,at:101},{uid:'higher',score:11,at:200}];assert.equal((await cloud.playerRank()).rank,4);
 assert.equal(h.query.collection,'frogger_leaderboard');assert.deepEqual(h.query.constraints.slice(0,3),[{field:'score',direction:'desc'},{field:'at',direction:'asc'},{field:'__name__',direction:'asc'}]);
 h.error='permission-denied';await assert.rejects(cloud.playerRank(),e=>e.code==='permission-denied');assert.equal(h.reads,5);assert.equal(h.counts,4);
 console.log('PASS real rank adapter: missing record, first place, rank 24, score/time/document-ID ties, server aggregate and rules-error forwarding. No production data read or written.');
}finally{if(previous===undefined)delete globalThis.rankHarness;else globalThis.rankHarness=previous;}
