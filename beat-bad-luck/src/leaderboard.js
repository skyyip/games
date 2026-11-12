import {WEAPONS} from './catalog.js';
import {unpackState,playerName} from './player-state.js';

export const LEADERBOARD_LIMIT=20;
export function bestScoreRecord(state){
 return (state.records??[]).filter(r=>Number.isInteger(r.score)&&r.score>0&&r.score<=1000000&&Number.isInteger(r.hits)&&r.hits>=0&&r.hits<=1000000&&WEAPONS.some(w=>w.id===r.weapon))
  .sort((a,b)=>b.score-a.score||a.date-b.date)[0]??null;
}
// Scores are client-managed casual-game records, not server-verified competition results.
export function createLeaderboardAPI({sdk:s,db,currentUser}){
 const scores=s.collection(db,'bbl_scores'),ref=uid=>s.doc(db,'bbl_scores',uid);
 const get=r=>(s.getDocFromServer??s.getDoc)(r);
 const identity=()=>{const user=currentUser();if(!user?.uid)throw Error('signin');return user.uid;};
 return {
  async top(){const result=await s.getDocs(s.query(scores,s.orderBy('score','desc'),s.orderBy('achievedAt','asc'),s.limit(LEADERBOARD_LIMIT)));return result.docs.map((d,i)=>({id:d.id,...d.data(),rank:i+1}));},
  async mine(){const uid=identity(),d=await get(ref(uid));if(currentUser()?.uid!==uid)throw Error('identity-changed');return d.exists()?{id:uid,...d.data()}:null;},
  async submit(name,{requireExisting=false}={}){
   const uid=identity(),publicName=playerName(name);if(!publicName)throw Error('invalid-profile');let result;
   await s.runTransaction(db,async tx=>{
    if(currentUser()?.uid!==uid)throw Error('identity-changed');
    const [save,old]=await Promise.all([tx.get(s.doc(db,'bbl_saves',uid)),tx.get(ref(uid))]);
    if(requireExisting&&!old.exists())throw Error('score-opted-out');
    const record=save.exists()?bestScoreRecord(unpackState(save.data().payload)):null;
    if(!record)throw Error('score-required');
    const previous=old.exists()?old.data():null,improved=!previous||record.score>previous.score;
    if(previous&&!improved&&previous.name===publicName){result={id:uid,...previous};return;}
    const next=improved?{uid,name:publicName,score:record.score,hits:record.hits,weapon:record.weapon,achievedAt:s.serverTimestamp(),updatedAt:s.serverTimestamp()}:{...previous,name:publicName,updatedAt:s.serverTimestamp()};
    tx.set(ref(uid),next);result={id:uid,...next};
   });
   if(currentUser()?.uid!==uid)throw Error('identity-changed');return result;
  },
  async remove(){const uid=identity();await s.runTransaction(db,async tx=>{await tx.get(ref(uid));if(currentUser()?.uid!==uid)throw Error('identity-changed');tx.delete(ref(uid));});},
 };
}
export async function firebaseLeaderboardAPI(){const {dataClient}=await import('./player-cloud.js'),c=await dataClient();return createLeaderboardAPI({sdk:c.sdk,db:c.db,currentUser:()=>c.auth.session.currentUser});}
