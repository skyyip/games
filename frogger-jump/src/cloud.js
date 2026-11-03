import {FIREBASE_CONFIG} from './firebase-settings.js';
import {normalizeName} from './profile.js';import {ANIMALS,animal,rewardCoins} from './animals.js';
export const cloudConfigured=!!FIREBASE_CONFIG?.projectId;
let authConnection,connection,readyAuth;
async function authClient(){
 if(!cloudConfigured)throw Error('cloud-not-configured');
 if(!authConnection)authConnection=(async()=>{
  const [a,auth]=await Promise.all([import('firebase/app'),import('firebase/auth')]);
  const app=a.initializeApp(FIREBASE_CONFIG,'frogger-jump'),session=auth.getAuth(app);
  if(globalThis.FROGGER_FIREBASE_EMULATORS&&['localhost','127.0.0.1'].includes(location.hostname))auth.connectAuthEmulator(session,'http://127.0.0.1:9098',{disableWarnings:true});
  await auth.setPersistence(session,auth.browserLocalPersistence);readyAuth={...auth,app,session};return readyAuth;
 })();
 try{return await authConnection;}catch(error){authConnection=null;readyAuth=null;throw error;}
}
// A signed-out visitor only restores Auth; Firestore loads on first data use.
async function client(){
 if(!connection)connection=(async()=>{const [auth,db]=await Promise.all([authClient(),import('firebase/firestore')]),store=db.getFirestore(auth.app);
  if(globalThis.FROGGER_FIREBASE_EMULATORS&&['localhost','127.0.0.1'].includes(location.hostname))db.connectFirestoreEmulator(store,'127.0.0.1',8089);
  return {...auth,...db,db:store};
 })();
 try{return await connection;}catch(error){connection=null;throw error;}
}
const playerRef=(c,uid)=>c.doc(c.db,'frogger_players',uid);
const runRef=(c,uid,id)=>c.doc(c.db,'frogger_players',uid,'runs',id);
function identity(c){const uid=c.session.currentUser?.uid;if(!uid)throw Error('login-required');return uid;}
const shape=(doc,uid)=>doc?{...doc,uid,mode:'cloud',bestAt:doc.bestAt?.toMillis?.()??0}:null;
export async function observeIdentity(callback){const c=await authClient();return c.onAuthStateChanged(c.session,callback);}
async function signedInProfile(user){
 try{return {user,profile:await readCloudProfile()};}
 catch(cause){const error=Error('profile-load-failed',{cause});error.user=user;throw error;}
}
export async function signIn(email,password){const c=await authClient();if(c.session.currentUser?.isAnonymous)throw Error('anonymous-existing-account');const result=await c.signInWithEmailAndPassword(c.session,email,password);return (await signedInProfile(result.user)).profile;}
function googleProvider(c){const provider=new c.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});return provider;}
export function signInGoogle(){
 // Called directly by the click handler, with no SDK-loading await before the popup.
 const c=readyAuth;if(!c)return Promise.reject(Error('auth-loading'));
 return socialSignIn(c,googleProvider(c));
}
function socialSignIn(c,provider){
 const request=c.session.currentUser?.isAnonymous?c.linkWithPopup(c.session.currentUser,provider):c.signInWithPopup(c.session,provider);
 return request.then(result=>signedInProfile(result.user));
}
export function signInFacebook(){
 const c=readyAuth;if(!c)return Promise.reject(Error('auth-loading'));
 return socialSignIn(c,new c.FacebookAuthProvider());
}
export async function signInAnonymous(){
 const c=await authClient();let user=c.session.currentUser;
 if(user&&!user.isAnonymous)throw Error('already-signed-in');
 if(!user)user=(await c.signInAnonymously(c.session)).user;
 return signedInProfile(user);
}
export async function resetPassword(email,language='en'){
 const c=await authClient();c.session.languageCode=language==='zh-TW'?'zh-TW':'en';
 try{await c.sendPasswordResetEmail(c.session,String(email).trim());}
 catch(error){if(error.code!=='auth/user-not-found')throw error;}
}
export async function register(email,password,name){
 const c=await authClient();
 if(c.session.currentUser?.isAnonymous){
  const {user}=await c.linkWithCredential(c.session.currentUser,c.EmailAuthProvider.credential(email,password));
  try{return await claimName(name);}catch(cause){if(cause.message==='name-taken')throw cause;const error=Error('profile-load-failed',{cause});error.user=user;throw error;}
 }
 await c.createUserWithEmailAndPassword(c.session,email,password);return claimName(name);
}
export async function logout(){const c=await authClient();await c.signOut(c.session);}
export async function readCloudProfile(){const c=await client(),uid=identity(c),doc=await c.getDoc(playerRef(c,uid));return doc.exists()?shape(doc.data(),uid):null;}
export async function claimName(value){const c=await client(),uid=identity(c),{name,key}=normalizeName(value),ref=playerRef(c,uid),nameRef=c.doc(c.db,'frogger_names',key);await c.runTransaction(c.db,async t=>{const [existing,reserved]=await Promise.all([t.get(ref),t.get(nameRef)]);if(existing.exists())return;if(reserved.exists())throw Error('name-taken');const stamp=c.serverTimestamp();t.set(nameRef,{uid,name});t.set(ref,{version:2,name,nameKey:key,coins:0,owned:['frog'],selected:'frog',best:0,bestAnimal:'frog',bestAt:stamp,createdAt:stamp,updatedAt:stamp,activeRun:null,lastSettledRun:null});});return readCloudProfile();}
export async function selectOrBuy(id){if(!ANIMALS.some(a=>a.id===id))throw Error('unknown-animal');const c=await client(),uid=identity(c),ref=playerRef(c,uid);await c.runTransaction(c.db,async t=>{const doc=await t.get(ref);if(!doc.exists())throw Error('name-required');const p=doc.data();if(p.owned.includes(id)){t.update(ref,{selected:id,updatedAt:c.serverTimestamp()});return;}const price=animal(id).price;if(p.coins<price)throw Error('not-enough-coins');t.update(ref,{coins:p.coins-price,owned:[...p.owned,id],selected:id,updatedAt:c.serverTimestamp()});});return readCloudProfile();}
export async function beginCloudRun(){const c=await client(),uid=identity(c),ref=playerRef(c,uid),newRef=c.doc(c.collection(c.db,'frogger_players',uid,'runs'));let kind;await c.runTransaction(c.db,async t=>{const doc=await t.get(ref);if(!doc.exists())throw Error('name-required');const p=doc.data();let oldRef,old;if(p.activeRun){oldRef=runRef(c,uid,p.activeRun);old=await t.get(oldRef);}kind=p.selected;if(old?.exists()&&old.data().status==='playing')t.update(oldRef,{status:'abandoned',endedAt:c.serverTimestamp()});t.set(newRef,{uid,animal:kind,status:'playing',startedAt:c.serverTimestamp(),endedAt:null,score:0,coinsEarned:0});t.update(ref,{activeRun:newRef.id,updatedAt:c.serverTimestamp()});});return {id:newRef.id,animal:kind,uid};}
export async function abandonCloudRun(id){const c=await client(),uid=identity(c),ref=playerRef(c,uid),r=runRef(c,uid,id);await c.runTransaction(c.db,async t=>{const [p,run]=await Promise.all([t.get(ref),t.get(r)]);if(p.exists()&&run.exists()&&p.data().activeRun===id&&run.data().status==='playing'){t.update(r,{status:'abandoned',endedAt:c.serverTimestamp()});t.update(ref,{activeRun:null,updatedAt:c.serverTimestamp()});}});}
export async function settleCloudRun({id,score,uid:owner,bonusCoins=0}){if(!Number.isSafeInteger(bonusCoins)||bonusCoins<0||bonusCoins>score*3||!Number.isSafeInteger(score)||score<0||score>1e6)throw Error('invalid-run');const c=await client(),uid=identity(c);if(owner!==uid)throw Error('wrong-player');const ref=playerRef(c,uid),r=runRef(c,uid,id),board=c.doc(c.db,'frogger_leaderboard',uid);let earned=0,duplicate=false;await c.runTransaction(c.db,async t=>{const [pDoc,runDoc]=await Promise.all([t.get(ref),t.get(r)]);if(!pDoc.exists()||!runDoc.exists())throw Error('run-missing');const p=pDoc.data(),run=runDoc.data();if(run.status==='finished'){earned=run.coinsEarned;duplicate=true;return;}if(run.status!=='playing'||p.activeRun!==id)throw Error('run-replaced');earned=rewardCoins(score,bonusCoins);const stamp=c.serverTimestamp(),record=score>p.best;t.update(r,{status:'finished',score,...(bonusCoins?{bonusCoins}:{}),coinsEarned:earned,endedAt:stamp});t.update(ref,{coins:p.coins+earned,activeRun:null,lastSettledRun:id,updatedAt:stamp,...(record?{best:score,bestAnimal:run.animal,bestAt:stamp}:{})});if(record)t.set(board,{uid,name:p.name,score,animal:run.animal,at:stamp});});return {profile:await readCloudProfile(),reward:earned,duplicate};}
let refreshAfter=0,refreshing;
export async function topTen(force=false){if(refreshing)return refreshing;if(!force&&Date.now()<refreshAfter)throw Error('refresh-cooldown');refreshAfter=Date.now()+10000;refreshing=(async()=>{const c=await client(),q=c.query(c.collection(c.db,'frogger_leaderboard'),c.orderBy('score','desc'),c.orderBy('at','asc'),c.limit(10)),snapshot=await c.getDocs(q);return snapshot.docs.map(doc=>({...doc.data(),uid:doc.id,at:doc.data().at?.toMillis?.()??0}));})();try{return await refreshing;}finally{refreshing=null;}}
export async function playerRank(){
 const c=await client(),uid=identity(c),entry=await c.getDocFromServer(c.doc(c.db,'frogger_leaderboard',uid));
 if(!entry.exists())return {uid,rank:null,score:0};
 // Snapshot cursors include the document ID, matching the leaderboard's final tie-break.
 const ahead=c.query(c.collection(c.db,'frogger_leaderboard'),c.orderBy('score','desc'),c.orderBy('at','asc'),c.orderBy(c.documentId(),'asc'),c.endBefore(entry));
 const count=await c.getCountFromServer(ahead);
 return {uid,rank:count.data().count+1,score:entry.data().score};
}
