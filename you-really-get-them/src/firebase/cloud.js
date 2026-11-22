import { firebaseConfig, firebaseReady } from './config.js';

const SDK='https://www.gstatic.com/firebasejs/9.23.0';
let auth,db,currentUser=null,currentPlayerName='',authSdk,fs;

export async function initCloud(onChange=()=>{}){
  if(!firebaseReady)return {ready:false,user:null};
  const appSdk=await import(`${SDK}/firebase-app.js`);
  authSdk=await import(`${SDK}/firebase-auth.js`);
  fs=await import(`${SDK}/firebase-firestore.js`);
  const app=appSdk.getApps().length?appSdk.getApp():appSdk.initializeApp(firebaseConfig);
  auth=authSdk.getAuth(app);
  db=fs.getFirestore(app);
  try {
    await authSdk.setPersistence(auth,authSdk.browserLocalPersistence);
  } catch (error) {
    console.warn('Firebase local persistence unavailable; using session persistence',error);
    try {
      await authSdk.setPersistence(auth,authSdk.browserSessionPersistence);
    } catch (persistenceError) {
      console.error('Firebase auth persistence setup failed',persistenceError);
    }
  }
  // Subscribe before processing the redirect so iOS browsers cannot miss
  // the initial persisted/redirected auth state.
  let initialized=false;
  const authStateReady=new Promise(resolve=>{
    authSdk.onAuthStateChanged(auth,async user=>{
      currentUser=user;
      currentPlayerName='';
      let profile=null;
      if(user){
        try{profile=await syncProfileFromCloud()}catch(error){console.error('Firebase profile sync failed',error)}
      }
      currentPlayerName=profile?.playerName||'';
      onChange(user,profile);
      if(!initialized){initialized=true;resolve(user)}
    },error=>{
      console.error('Firebase auth state listener failed',error);
      if(!initialized){initialized=true;resolve(null)}
    });
  });
  let redirectError=null,redirectUser=null;
  try {
    const result=await authSdk.getRedirectResult(auth);
    redirectUser=result?.user||null;
  } catch (error) {
    redirectError=error;
    console.error('Google sign-in redirect failed',error);
  }
  await authStateReady;
  // Some mobile browsers resolve the redirect result after the first auth
  // observer callback. Prefer Firebase's current user, then the redirect user.
  const resolvedUser=auth.currentUser||redirectUser||currentUser;
  if(resolvedUser?.uid!==currentUser?.uid){
    currentUser=resolvedUser;
    onChange(currentUser);
    if(currentUser)syncProfileFromCloud().catch(error=>console.error('Firebase profile sync failed',error));
  }
  return {ready:true,user:currentUser,redirectError};
}
export const getCloudUser=()=>currentUser;
export const getCloudPlayerName=()=>currentPlayerName;
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
  provider.setCustomParameters({prompt:'select_account'});
  const user=auth.currentUser||currentUser;
  const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||navigator.maxTouchPoints>1&&/Mac/i.test(navigator.platform);
  const redirect=()=>user?.isAnonymous
    ?authSdk.linkWithRedirect(user,provider)
    :authSdk.signInWithRedirect(auth,provider);
  if(mobile)return redirect();
  try {
    return user?.isAnonymous
      ?await authSdk.linkWithPopup(user,provider)
      :await authSdk.signInWithPopup(auth,provider);
  } catch(error) {
    if(error.code==='auth/popup-blocked')return redirect();
    throw error;
  }
}
export async function signOutGoogle(){return authSdk.signOut(auth);}
export async function syncProfileFromCloud(){
  if(!currentUser)return null;
  const ref=fs.doc(db,'users',currentUser.uid),snap=await fs.getDoc(ref);
  if(snap.exists())return snap.data();
  const profile={displayName:(currentUser.displayName||'玩家').slice(0,50),playerName:'',photoURL:currentUser.photoURL||'',updatedAt:fs.serverTimestamp()};
  await fs.setDoc(ref,profile);return profile;
}
export async function saveCloudProfile({playerName}={}){
  if(!currentUser)return;
  const name=String(playerName||'').trim();
  if(!name||name.length>20)throw new Error('玩家名稱需為 1 至 20 個字元');
  // Cloud profile stores identity metadata only. Coins and cards stay local.
  await fs.setDoc(fs.doc(db,'users',currentUser.uid),{
    displayName:(currentUser.displayName||'玩家').slice(0,50),
    playerName:name,
    photoURL:currentUser.photoURL||'',
    updatedAt:fs.serverTimestamp()
  },{merge:true});
  currentPlayerName=name;
  return name;
}
export async function recordCloudRun(result){
  if(!currentUser)return;
  await fs.addDoc(fs.collection(db,'users',currentUser.uid,'runs'),{
    faction:result.faction,mode:result.mode||'classic',questionCount:result.questionCount||12,dimensions:result.dimensions||null,survived:result.survived,hp:result.hp,coins:result.coins,correct:result.correct,createdAt:fs.serverTimestamp()
  });
  const faction=result.faction;
  const ref=fs.doc(db,'leaderboard',`${currentUser.uid}_${faction}`);
  await fs.runTransaction(db,async tx=>{
    const snap=await tx.get(ref),previous=snap.exists()?snap.data():null;
    const bestHp=Math.max(previous?.bestHp||0,result.hp);
    const bestCorrect=!previous||result.hp>previous.bestHp?result.correct:
      result.hp===previous.bestHp?Math.max(previous.bestCorrect||0,result.correct):previous.bestCorrect;
    tx.set(ref,{uid:currentUser.uid,faction,displayName:(currentPlayerName||currentUser.displayName||'玩家').slice(0,50),bestHp,bestCorrect,runs:(previous?.runs||0)+1,updatedAt:fs.serverTimestamp()});
  });
}
export async function getCloudRuns(){
  if(!currentUser)return [];
  const q=fs.query(fs.collection(db,'users',currentUser.uid,'runs'),fs.orderBy('createdAt','desc'),fs.limit(30));
  const snap=await fs.getDocs(q);
  return snap.docs.map(d=>({...d.data(),createdAt:d.data().createdAt?.toDate?.().toLocaleString()||''}));
}
export async function getLeaderboard(faction){
  const q=fs.query(fs.collection(db,'leaderboard'),fs.where('faction','==',faction),fs.orderBy('bestHp','desc'),fs.orderBy('bestCorrect','desc'),fs.limit(50));
  const snap=await fs.getDocs(q);return snap.docs.map(d=>d.data());
}
export async function createChallenge(faction){
  if(!currentUser)throw new Error('請先使用 Google 登入');
  const seed=Math.floor(Math.random()*0xffffffff);
  const ref=await fs.addDoc(fs.collection(db,'challenges'),{
    ownerUid:currentUser.uid,ownerName:(currentPlayerName||currentUser.displayName||'玩家').slice(0,50),faction,seed,
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
    tx.update(ref,{guestUid:currentUser.uid,guestName:(currentPlayerName||currentUser.displayName||'玩家').slice(0,50),status:'accepted'});
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
