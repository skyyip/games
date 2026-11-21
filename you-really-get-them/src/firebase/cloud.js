import { firebaseConfig, firebaseReady } from './config.js';
import { save } from '../storage.js';

const SDK='https://www.gstatic.com/firebasejs/11.10.0';
let auth,db,currentUser=null,authSdk,fs;

export async function initCloud(onChange=()=>{}){
  if(!firebaseReady)return {ready:false,user:null};
  const appSdk=await import(`${SDK}/firebase-app.js`);
  authSdk=await import(`${SDK}/firebase-auth.js`);
  fs=await import(`${SDK}/firebase-firestore.js`);
  const app=appSdk.initializeApp(firebaseConfig);
  auth=authSdk.getAuth(app);
  db=fs.getFirestore(app);
  await authSdk.getRedirectResult(auth).catch(()=>{});
  authSdk.onAuthStateChanged(auth,async user=>{
    currentUser=user;
    if(user){
      try{
        const profile=await syncProfileFromCloud();
        save({coins:profile.coins||0,cards:profile.cards||[],runs:profile.runs||0,bestHp:profile.bestHp||0});
      }catch(error){console.error('Firebase profile sync failed',error);}
    }
    onChange(user);
  });
  return {ready:true,user:auth.currentUser};
}
export const getCloudUser=()=>currentUser;
export async function signInGoogle(){
  const provider=new authSdk.GoogleAuthProvider();
  return /Mobi|Android|iPhone/i.test(navigator.userAgent)
    ?authSdk.signInWithRedirect(auth,provider):authSdk.signInWithPopup(auth,provider);
}
export async function signOutGoogle(){return authSdk.signOut(auth);}
export async function syncProfileFromCloud(){
  if(!currentUser)return null;
  const ref=fs.doc(db,'users',currentUser.uid),snap=await fs.getDoc(ref);
  if(snap.exists())return snap.data();
  const profile={displayName:currentUser.displayName||'玩家',photoURL:currentUser.photoURL||'',coins:0,cards:[],runs:0,bestHp:0,updatedAt:fs.serverTimestamp()};
  await fs.setDoc(ref,profile);return profile;
}
export async function saveCloudProfile(data){
  if(!currentUser)return;
  await fs.setDoc(fs.doc(db,'users',currentUser.uid),{
    displayName:(currentUser.displayName||'玩家').slice(0,50),photoURL:currentUser.photoURL||'',
    coins:data.coins,cards:data.cards,runs:data.runs,bestHp:data.bestHp,updatedAt:fs.serverTimestamp()
  },{merge:true});
}
export async function recordCloudRun(result){
  if(!currentUser)return;
  await fs.addDoc(fs.collection(db,'users',currentUser.uid,'runs'),{
    faction:result.faction,survived:result.survived,hp:result.hp,coins:result.coins,correct:result.correct,createdAt:fs.serverTimestamp()
  });
  const ref=fs.doc(db,'leaderboard',currentUser.uid);
  await fs.runTransaction(db,async tx=>{
    const snap=await tx.get(ref),previous=snap.exists()?snap.data():null;
    const bestHp=Math.max(previous?.bestHp||0,result.hp);
    const bestCorrect=!previous||result.hp>previous.bestHp?result.correct:
      result.hp===previous.bestHp?Math.max(previous.bestCorrect||0,result.correct):previous.bestCorrect;
    tx.set(ref,{uid:currentUser.uid,displayName:(currentUser.displayName||'玩家').slice(0,50),bestHp,bestCorrect,runs:(previous?.runs||0)+1,updatedAt:fs.serverTimestamp()});
  });
}
export async function getCloudRuns(){
  if(!currentUser)return [];
  const q=fs.query(fs.collection(db,'users',currentUser.uid,'runs'),fs.orderBy('createdAt','desc'),fs.limit(30));
  const snap=await fs.getDocs(q);
  return snap.docs.map(d=>({...d.data(),createdAt:d.data().createdAt?.toDate?.().toLocaleString()||''}));
}
export async function getLeaderboard(){
  const q=fs.query(fs.collection(db,'leaderboard'),fs.orderBy('bestHp','desc'),fs.orderBy('bestCorrect','desc'),fs.limit(50));
  const snap=await fs.getDocs(q);return snap.docs.map(d=>d.data());
}
export async function createChallenge(faction){
  if(!currentUser)throw new Error('請先使用 Google 登入');
  const seed=Math.floor(Math.random()*0xffffffff);
  const ref=await fs.addDoc(fs.collection(db,'challenges'),{
    ownerUid:currentUser.uid,ownerName:(currentUser.displayName||'玩家').slice(0,50),faction,seed,
    status:'waiting',createdAt:fs.serverTimestamp(),expiresAt:Date.now()+7*86400000
  });
  return {id:ref.id,seed,url:`${location.origin}${location.pathname}?challenge=${ref.id}`};
}
export async function joinChallenge(id){
  if(!currentUser)throw new Error('請先使用 Google 登入');
  const ref=fs.doc(db,'challenges',id);
  await fs.runTransaction(db,async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists())throw new Error('邀請不存在或已失效');
    const d=snap.data();
    if(d.ownerUid===currentUser.uid)throw new Error('不能接受自己建立的邀請');
    if(d.status!=='waiting'||d.guestUid||d.expiresAt<Date.now())throw new Error('邀請已被接受或已過期');
    tx.update(ref,{guestUid:currentUser.uid,guestName:(currentUser.displayName||'玩家').slice(0,50),status:'accepted'});
  });
  const snap=await fs.getDoc(ref);return {id:snap.id,...snap.data()};
}
export async function submitChallengeResult(id,result){
  if(!currentUser||!id)return;
  const ref=fs.doc(db,'challenges',id);
  await fs.runTransaction(db,async tx=>{
    const snap=await tx.get(ref);
    if(!snap.exists())throw new Error('挑戰已不存在');
    const d=snap.data();
    if(![d.ownerUid,d.guestUid].includes(currentUser.uid))throw new Error('你不是這場挑戰的參與者');
    const side=d.ownerUid===currentUser.uid?'ownerResult':'guestResult';
    const other=side==='ownerResult'?'guestResult':'ownerResult';
    if(d[side])throw new Error('你已提交過這場挑戰的結果');
    tx.update(ref,{[side]:{hp:result.hp,correct:result.correct,survived:result.survived,submittedAt:Date.now()},status:d[other]?'completed':d.status});
  });
}
export async function getChallenge(id){
  if(!currentUser||!id)return null;
  const snap=await fs.getDoc(fs.doc(db,'challenges',id));
  return snap.exists()?{id:snap.id,...snap.data()}:null;
}
