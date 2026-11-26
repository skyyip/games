import {walletTransaction} from './wallet-transaction.js';
import {emptyWallet,normalizeCards,rewardWallet,drawWallet,leaderboardUpdate} from '../wallet-model.js';
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
  await fs.setDoc(ref,profile,{merge:true});return profile;
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
  // Identity metadata is separate from the transactional SC wallet.
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
 const user=currentUser;if(!user||user.isAnonymous)return;
 const incoming=normalizeCards(cards),ref=fs.doc(db,'users',user.uid);
 return fs.runTransaction(db,async tx=>{
  const snap=await tx.get(ref);if(currentUser?.uid!==user.uid)return;
  const favoriteCards=normalizeCards([...(snap.exists()?snap.data().favoriteCards||[]:[]),...incoming]);
  tx.set(ref,{...(snap.exists()?{}:profileMetadata(user)),favoriteCards,updatedAt:fs.serverTimestamp()},{merge:true});return favoriteCards;
 });
}
export async function recordCloudRun(result,{leaderboard=true}={}){
  if(!currentUser)return;
  await fs.addDoc(fs.collection(db,'users',currentUser.uid,'runs'),{
    faction:result.faction,mode:result.mode||'classic',questionCount:result.questionCount||12,dimensions:result.dimensions||null,survived:result.survived,hp:result.hp,coins:result.coins,correct:result.correct,createdAt:fs.serverTimestamp()
  });
  if(!leaderboard)return;
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

function profileMetadata(user){return {displayName:(user.displayName||'玩家').slice(0,50),playerName:'',photoURL:user.photoURL||'',updatedAt:fs.serverTimestamp()}}
function walletUser(expectedUid){
 const user=currentUser;
 if(!user||user.isAnonymous||(expectedUid&&user.uid!==expectedUid))throw Object.assign(Error('請先登入原帳戶，再同步SC。'),{code:'wallet/account-changed'});
 return user;
}
function operationRef(uid,id){
 if(!/^(run|draw)_[A-Za-z0-9_-]{8,70}$/.test(id||''))throw Error('流水編號無效，沒有改動SC。');
 return fs.doc(db,'users',uid,'walletOps',id);
}
export async function initializeCloudWallet(expectedUid,localCards=[]){
 const user=walletUser(expectedUid),walletRef=fs.doc(db,'users',user.uid,'wallet','main'),profileRef=fs.doc(db,'users',user.uid);
 try{return await fs.runTransaction(db,async tx=>{
  const [walletSnap,profileSnap]=await Promise.all([tx.get(walletRef),tx.get(profileRef)]);walletUser(user.uid);
  const profile=profileSnap.exists()?profileSnap.data():profileMetadata(user);
  const cards=normalizeCards([...(profile.favoriteCards||[]),...normalizeCards(localCards),'w_1','m_1']);
  if(!profileSnap.exists()||JSON.stringify(cards)!==JSON.stringify(profile.favoriteCards||[]))tx.set(profileRef,{...profile,favoriteCards:cards,updatedAt:fs.serverTimestamp()},{merge:true});
  const wallet=walletSnap.exists()?walletSnap.data():emptyWallet();
  if(!walletSnap.exists())tx.set(walletRef,{...wallet,updatedAt:fs.serverTimestamp()});
  return {wallet,cards};
 });}catch(error){walletUser(user.uid);if(error.code!=='permission-denied')throw error;const [wallet,profile]=await Promise.all([fs.getDocFromServer(walletRef),fs.getDocFromServer(profileRef)]);walletUser(user.uid);if(!wallet.exists())throw error;return {wallet:wallet.data(),cards:normalizeCards(profile.exists()?profile.data().favoriteCards||[]:[])}}
}
export function watchCloudWallet(onWallet,onError,expectedUid){
 const user=walletUser(expectedUid),ref=fs.doc(db,'users',user.uid,'wallet','main');
 return fs.onSnapshot(ref,{includeMetadataChanges:true},snap=>{
  if(currentUser?.uid!==user.uid)return;
  if(snap.exists())onWallet(snap.data(),{fromCache:snap.metadata.fromCache});
 },error=>{if(currentUser?.uid===user.uid)onError(error)});
}
export async function readCloudCards(expectedUid){
 const user=walletUser(expectedUid),snap=await fs.getDocFromServer(fs.doc(db,'users',user.uid));walletUser(user.uid);
 return normalizeCards(snap.exists()?snap.data().favoriteCards||[]:[]);
}
export async function settleCloudWallet(receipt,expectedUid){
 const user=walletUser(expectedUid);operationRef(user.uid,receipt.id);
 if(!receipt.id.startsWith('run_'))throw Error('結算流水編號無效。');
 return walletTransaction({fs,db,uid:user.uid,id:receipt.id,kind:'run',assertOwner:()=>walletUser(user.uid)},async(tx,{walletRef,opRef,wallet,profile})=>{
  const cards=normalizeCards(profile.favoriteCards||[]),next=rewardWallet(wallet,receipt,cards),result=receipt.result;
  let boardRef,board;
  if(next.operation.ranked){boardRef=fs.doc(db,'leaderboard',`${user.uid}_${result.faction}`);const snap=await tx.get(boardRef);board=leaderboardUpdate(snap.exists()?snap.data():null,result,{...user,playerName:profile.playerName||currentPlayerName})}
  walletUser(user.uid);const updatedWallet={...next.wallet,lastOperation:receipt.id,updatedAt:fs.serverTimestamp()};
  tx.set(walletRef,updatedWallet);tx.set(opRef,{...next.operation,createdAt:fs.serverTimestamp()});
  tx.set(fs.doc(db,'users',user.uid,'runs',receipt.id),{faction:result.faction,mode:'mixed',questionCount:12,dimensions:result.dimensions||null,survived:result.hp>0,hp:result.hp,coins:next.operation.delta,correct:result.correct,createdAt:fs.serverTimestamp()});
  if(board)tx.set(boardRef,{...board,updatedAt:fs.serverTimestamp()});
  return {wallet:updatedWallet,cards,operation:next.operation,applied:true};
 });
}
export async function drawCloudWallet(pending,expectedUid){
 const user=walletUser(expectedUid);operationRef(user.uid,pending.id);
 if(!pending.id.startsWith('draw_'))throw Error('抽卡流水編號無效。');
 return walletTransaction({fs,db,uid:user.uid,id:pending.id,kind:'draw',assertOwner:()=>walletUser(user.uid)},async(tx,{walletRef,opRef,profileRef,wallet,profile})=>{
  const cards=normalizeCards(profile.favoriteCards||[]),next=drawWallet(wallet,cards,pending.cardId),updatedWallet={...next.wallet,lastOperation:pending.id,updatedAt:fs.serverTimestamp()};walletUser(user.uid);
  tx.set(walletRef,updatedWallet);tx.set(opRef,{...next.operation,createdAt:fs.serverTimestamp()});
  const previousCards=profile.favoriteCards||[];
  tx.set(profileRef,{favoriteCards:next.duplicate?previousCards:[...previousCards,next.card.id],updatedAt:fs.serverTimestamp()},{merge:true});
  return {...next,wallet:updatedWallet,applied:true};
 });
}
