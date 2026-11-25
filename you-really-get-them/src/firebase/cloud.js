import { firebaseConfig, firebaseReady } from './config.js';

const SDK='https://www.gstatic.com/firebasejs/9.23.0';
let auth,db,currentUser=null,currentPlayerName='',authSdk,fs;

export async function initCloud(onChange=()=>{}){
  if(!firebaseReady)return {ready:false,user:null};
  const appSdk=await import(`${SDK}/firebase-app.js`);
  authSdk=await import(`${SDK}/firebase-auth.js`);
  fs=await import(`${SDK}/firebase-firestore.js`);
  const app=appSdk.getApps().length?appSdk.getApp():appSdk.initializeApp(firebaseConfig);
  // Restore first-party storage without eagerly loading the cross-domain
  // redirect helper, which can be blocked on iOS browsers.
  try {
    auth=authSdk.initializeAuth(app,{
      persistence:[authSdk.browserLocalPersistence,authSdk.browserSessionPersistence]
    });
  } catch(error) {
    if(error.code!=='auth/already-initialized')throw error;
    auth=authSdk.getAuth(app);
  }
  db=fs.getFirestore(app);
  let revision=0;
  const authStateReady=new Promise((resolve,reject)=>{
    authSdk.onAuthStateChanged(auth,user=>{
      const version=++revision;
      currentUser=user;
      currentPlayerName='';
      // Identity must be usable even while a Firestore read/write is pending.
      onChange(user,null,{profileLoaded:false});
      resolve(user);
      if(!user)return;
      syncProfileFromCloud(user).then(profile=>{
        if(version!==revision)return;
        currentPlayerName=profile?.playerName||'';
        onChange(user,profile,{profileLoaded:true});
      }).catch(error=>{
        if(version!==revision)return;
        console.error('Firebase profile sync failed',error);
        onChange(user,null,{profileLoaded:false,profileError:error});
      });
    },reject);
  });
  await authStateReady;
  return {ready:true,user:currentUser};
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
  // Keep the user gesture and the app page alive on mobile as well as desktop.
  // A blocked popup is reported to the user; redirecting would reintroduce
  // the third-party storage dependency.
  return user?.isAnonymous
    ?authSdk.linkWithPopup(user,provider,authSdk.browserPopupRedirectResolver)
    :authSdk.signInWithPopup(auth,provider,authSdk.browserPopupRedirectResolver);
}
export async function signOutGoogle(){return authSdk.signOut(auth);}
export async function syncProfileFromCloud(user=currentUser){
  if(!user)return null;
  const ref=fs.doc(db,'users',user.uid),snap=await fs.getDoc(ref);
  if(currentUser?.uid!==user.uid)return null;
  if(snap.exists())return snap.data();
  const profile={displayName:(user.displayName||'玩家').slice(0,50),playerName:'',photoURL:user.photoURL||'',updatedAt:fs.serverTimestamp()};
  await fs.setDoc(ref,profile);return profile;
}
export async function saveCloudProfile({playerName}={}){
  if(!currentUser)return;
  const name=String(playerName||'').trim();
  if(!name||name.length>20)throw new Error('玩家名稱需為 1 至 20 個字元');
  const ref=fs.doc(db,'users',currentUser.uid),snap=await fs.getDoc(ref);
  const previous=snap.exists()?snap.data():null;
  if(previous?.playerName===name){currentPlayerName=name;return name;}
  const changedAt=previous?.playerNameUpdatedAt?.toMillis?.()||0;
  if(previous?.playerName&&changedAt&&Date.now()-changedAt<90*24*60*60*1000){
    const nextDate=new Date(changedAt+90*24*60*60*1000).toLocaleDateString('zh-HK');
    throw new Error(`玩家名稱每 90 日只可更改一次，下次可於 ${nextDate} 更改。`);
  }
  // Cloud profile stores identity metadata only. Coins and cards stay local.
  await fs.setDoc(ref,{
    displayName:(currentUser.displayName||'玩家').slice(0,50),
    playerName:name,
    playerNameUpdatedAt:fs.serverTimestamp(),
    photoURL:currentUser.photoURL||'',
    updatedAt:fs.serverTimestamp()
  },{merge:true});
  currentPlayerName=name;
  return name;
}
export async function saveCloudFavoriteCards(cards=[]){
  if(!currentUser||currentUser.isAnonymous)return;
  const favoriteCards=[...new Set(cards.filter(card=>typeof card==='string').slice(0,200))];
  await fs.setDoc(fs.doc(db,'users',currentUser.uid),{
    favoriteCards,updatedAt:fs.serverTimestamp()
  },{merge:true});
  return favoriteCards;
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
