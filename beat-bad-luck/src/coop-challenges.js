import {challengeWeek,challengeWindow,CHALLENGE_TARGET} from './kindness.js';
import {unpackState} from './player-state.js';
export function createCoopAPI({sdk:s,db,uid,currentUser,now=()=>Date.now()}){
 const ref=(kind,id)=>s.doc(db,'bbl_'+kind,id),stamp=()=>s.serverTimestamp();
 const check=()=>{if(currentUser()?.uid!==uid)throw Error('identity-changed');if(currentUser()?.isAnonymous)throw Error('registered-account-required');};
 const api={
 async challenges(){check();const lists=await Promise.all(['a','b'].map(field=>(s.getDocsFromServer??s.getDocs)(s.query(s.collection(db,'bbl_coop'),s.where(field,'==',uid),s.orderBy('updatedAt','desc'),s.limit(40)))));check();return [...new Map(lists.flatMap(q=>q.docs.map(d=>[d.id,{id:d.id,...d.data()}]))).values()];},
 async joinChallenge(friendId){
  check();const week=challengeWeek(now()),id=friendId+'__'+week;
  await s.runTransaction(db,async tx=>{check();const [fd,old]=await Promise.all([tx.get(ref('friends',friendId)),tx.get(ref('coop',id))]);const f=fd.exists()?fd.data():null;if(!f||f.status!=='accepted'||![f.from,f.to].includes(uid))throw Error('friend-required');
   const side=f.from===uid?'A':'B';if(old.exists()){const c=old.data();if(c['joined'+side])return;tx.update(ref('coop',id),{['joined'+side]:true,['joinedAt'+side]:stamp(),updatedAt:stamp()});}
   else tx.set(ref('coop',id),{friendId,a:f.from,b:f.to,aName:f.fromName,bName:f.toName,week,joinedA:side==='A',joinedB:side==='B',joinedAtA:side==='A'?stamp():null,joinedAtB:side==='B'?stamp():null,receiptsA:[],receiptsB:[],createdAt:stamp(),updatedAt:stamp()});
  });check();return id;
 },
 async syncChallenges(){
  check();const entries=(await api.challenges()).filter(c=>c.week===challengeWeek(now())&&c.joinedA&&c.joinedB&&c[c.a===uid?'receiptsA':'receiptsB'].length<CHALLENGE_TARGET);let credited=0;
  for(const entry of entries){
   // At most three bounded transactions per player/pair/week. Re-read after conflicts.
   for(let attempt=0;attempt<CHALLENGE_TARGET;attempt++){
    let added=false;await s.runTransaction(db,async tx=>{added=false;check();const [cd,sd,fd]=await Promise.all([tx.get(ref('coop',entry.id)),tx.get(ref('saves',uid)),tx.get(ref('friends',entry.friendId))]);if(!cd.exists()||!sd.exists()||!fd.exists()||fd.data().status!=='accepted')return;
     const c=cd.data(),side=c.a===uid?'A':'B',receipts=c['receipts'+side];if(c.week!==challengeWeek(now())||!c.joinedA||!c.joinedB||receipts.length>=CHALLENGE_TARGET)return;
     const window=challengeWindow(c.week),since=Math.max(window.start,c.joinedAtA.toMillis(),c.joinedAtB.toMillis()),state=unpackState(sd.data().payload);
     const receipt=state.neighbourhood.album.find(r=>r.at>=since&&r.at<window.end&&r.at<=now()&&!receipts.includes(r.id));if(!receipt)return;
     tx.update(ref('coop',entry.id),{['receipts'+side]:[...receipts,receipt.id],updatedAt:stamp()});added=true;
    });check();if(!added)break;credited++;
   }
  }return credited;
 }
 };return api;
}
