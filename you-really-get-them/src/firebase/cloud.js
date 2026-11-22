import { firebaseConfig, firebaseReady } from './config.js';

const SDK='https://www.gstatic.com/firebasejs/9.23.0';
let auth,db,currentUser=null,authSdk,fs;

export async function initCloud(onChange=()=>{}){
  if(!firebaseReady)return {ready:false,user:null};
  const appSdk=await import(`${SDK}/firebase-app.js`);
  authSdk=await import(`${SDK}/firebase-auth.js`);
  fs=await import(`${SDK}/firebase-firestore.js`);
  const app=appSdk.initializeApp(firebaseConfig);
  auth=authSdk.getAuth(app);
  db=fs.getFirestore(app);
  try {
    await authSdk.setPersistence(auth,authSdk.browserLocalPersistence);
  } catch (error) {
    console.warn('Firebase local persistence unavailable; using session persistence',error);
    await authSdk.setPersistence(auth,authSdk.browserSessionPersistence).catch(persistenceError=>{
      console.error('Firebase auth persistence setup failed',persistenceError);
    });
  }
  let redirectError=null;
  try {
    await authSdk.getRedirectResult(auth);
  } catch (error) {
    redirectError=error;
    console.error('Google sign-in redirect failed',error);
  }
  authSdk.onAuthStateChanged(auth,user=>{
    currentUser=user;
    // Restore the signed-in UI immediately; Firestore must not block auth state.
    onChange(user);
    if(user){
      syncProfileFromCloud()
        .catch(error=>console.error('Firebase profile sync failed',error));
    }
  },error=>console.error('Firebase auth state listener failed',error));
  return {ready:true,user:auth.currentUser,redirectError};
}
export const getCloudUser=()=>currentUser;
export async function signInEmail(email,password){
  const credential=authSdk.EmailAuthProvider.credential(email.trim(),password);
  if(currentUser?.isAnonymous)return authSdk.linkWithCredential(currentUser,credential);
  return authSdk.signInWithEmailAndPassword(auth,email.trim(),password);
}
export async function signUpEmail(email,password){
  const credential=authSdk.EmailAuthProvider.credential(email.trim(),password);
  if(currentUser?.isAnonymous)return authSdk.linkWithCredential(currentUser,credential);
  return authSdk.createUserWithEmailAndPassword(auth,email.trim(),password);
}
export async function signInAnonymous(){return authSdk.signInAnonymously(auth);}
export async function signInGoogle(){
  const provider=new authSdk.GoogleAuthProvider();
  if(currentUser?.isAnonymous){
    return /Mobi|Android|iPhone/i.test(navigator.userAgent)
      ?authSdk.linkWithRedirect(currentUser,provider):authSdk.linkWithPopup(currentUser,provider);
  }
  return /Mobi|Android|iPhone/i.test(navigator.userAgent)
    ?authSdk.signInWithRedirect(auth,provider):authSdk.signInWithPopup(auth,provider);
}
export async function signOutGoogle(){return authSdk.signOut(auth);}
export async function syncProfileFromCloud(){
  if(!currentUser)return null;
  const ref=fs.doc(db,'users',currentUser.uid),snap=await fs.getDoc(ref);
  if(snap.exists())return snap.data();
  const profile={displayName:(currentUser.displayName||'玩家').slice(0,50),photoURL:currentUser.photoURL||'',updatedAt:fs.serverTimestamp()};
  await fs.setDoc(ref,profile);return profile;
}
export async function saveCloudProfile(data){
  if(!currentUser)return;
  // Cloud profile stores identity metadata only. Coins and cards stay local:
  // Firestore Rules intentionally reject client-side asset mutations.
  await fs.setDoc(fs.doc(db,'users',currentUser.uid),{
    displayName:(currentUser.displayName||'玩家').slice(0,50),
    photoURL:currentUser.photoURL||'',
    updatedAt:fs.serverTimestamp()
  },{merge:true});
}
export async function recordCloudRun(result){
  if(!currentUser)return;
  await fs.addDoc(fs.collection(db,'users',currentUser.uid,'runs'),{
    faction:result.faction,mode:result.mode||'classic',questionCount:result.questionCount||12,dimensions:result.dimensions||null,survived:result.survived,hp:result.hp,coins:result.coins,correct:result.correct,createdAt:fs.serverTimestamp()
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
