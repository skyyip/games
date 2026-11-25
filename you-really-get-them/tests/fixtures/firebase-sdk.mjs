// Test-only SDK double. Production always imports the Firebase CDN modules.
export const firebaseSDKSource = `
const state=globalThis.__yrgtFirebase;
export const browserLocalPersistence={type:'LOCAL'};
export const browserSessionPersistence={type:'SESSION'};
export class browserPopupRedirectResolver {}
export const getApps=()=>[];
export const initializeApp=options=>({options});
export function initializeAuth(app,options){
  state.options=options;
  state.auth={app,currentUser:state.restore?.()||null};
  return state.auth;
}
export const getAuth=()=>{throw Error('Unexpected eager getAuth initialization')};
export function onAuthStateChanged(auth,callback){
  state.emit=user=>{auth.currentUser=user;state.persist?.(user);callback(user)};
  queueMicrotask(()=>callback(auth.currentUser));
}
export class GoogleAuthProvider {setCustomParameters(value){this.parameters=value}}
export const EmailAuthProvider={credential:(email,password)=>({email,password})};
function popup(kind,user,provider,resolver){
  state.calls.push({kind,user,parameters:provider.parameters,resolver,activation:globalThis.navigator?.userActivation?.isActive});
  if(state.popupError)return Promise.reject(Object.assign(Error(state.popupError),{code:state.popupError}));
  const signedIn={uid:user?.uid||'google-player',displayName:'Google Player',email:'player@example.test',isAnonymous:false};
  state.emit(signedIn);
  return Promise.resolve({user:signedIn});
}
export const signInWithPopup=(auth,provider,resolver)=>popup('signIn',null,provider,resolver);
export const linkWithPopup=(user,provider,resolver)=>popup('link',user,provider,resolver);
export const signOut=async()=>state.emit(null);
export const signInAnonymously=async()=>{const user={uid:'guest-player',isAnonymous:true};state.emit(user);return {user}};
export const getFirestore=()=>({});
export const doc=(db,...parts)=>parts.join('/');
const rootProfile=ref=>ref.split('/').length===2&&ref.startsWith('users/');
const storedSnapshot=ref=>({exists:()=>Object.hasOwn(state.documents||{},ref),data:()=>state.documents[ref],metadata:{fromCache:false,hasPendingWrites:false}});
async function readSnapshot(ref){state.reads.push(ref);if(rootProfile(ref)&&state.readProfile)return state.readProfile(ref);return storedSnapshot(ref)}
function publish(ref){for(const callback of state.listeners?.get(ref)||[])queueMicrotask(()=>callback(storedSnapshot(ref)));state.persistDocs?.()}
function applyWrite(ref,data,options){state.documents??={};state.documents[ref]=options?.merge?{...state.documents[ref],...data}:data;publish(ref)}
export const getDoc=readSnapshot;
export const getDocFromServer=readSnapshot;
export const setDoc=async(ref,data,options)=>{state.writes.push({ref,data,options});await state.writeProfile?.(ref,data);applyWrite(ref,data,options)};
export const collection=(db,...parts)=>parts.join('/');
export const addDoc=async(ref,data)=>{state.writes.push({ref,data});return {id:'fixture-run'}};
export const runTransaction=(db,action)=>{
 const work=async()=>{
  if(state.transactionError)throw Object.assign(Error(state.transactionError),{code:state.transactionError});
  const writes=[];
  const result=await action({get:async ref=>{if(writes.length)throw Error('Transaction read after write');return state.transactionRead?.(ref)||readSnapshot(ref)},set:(ref,data,options)=>writes.push({ref,data,options})});
  if(state.commitError)throw Object.assign(Error(state.commitError),{code:state.commitError});
  for(const write of writes){state.writes.push(write);applyWrite(write.ref,write.data,write.options)}if(state.afterCommitErrorOnce){const code=state.afterCommitErrorOnce;state.afterCommitErrorOnce=null;throw Object.assign(Error(code),{code})}return result;
 };
 const pending=(state.transactionTail||Promise.resolve()).catch(()=>{}).then(work);state.transactionTail=pending;return pending;
};
export const onSnapshot=(ref,options,callback,onError)=>{state.listeners??=new Map();if(!state.listeners.has(ref))state.listeners.set(ref,new Set());state.listeners.get(ref).add(callback);queueMicrotask(()=>state.watchError?onError(Object.assign(Error(state.watchError),{code:state.watchError})):callback(storedSnapshot(ref)));return ()=>state.listeners.get(ref)?.delete(callback)};
export const where=(field,op,value)=>{
 if(value!==null&&typeof value==='object')throw Error('Unsupported field value: a custom '+value.constructor.name+' object');
 (state.queries??=[]).push({field,op,value});return {field,op,value};
};
export const orderBy=(field,direction)=>({field,direction});
export const limit=count=>({count});
export const query=(ref,...constraints)=>({ref,constraints});
export const getDocs=async()=>{if(state.queryError)throw Error(state.queryError);return {docs:(state.leaderboardRows||[]).map(row=>({data:()=>row}))}};
export const serverTimestamp=()=>123;
`;

export function installBrowserFirebaseFixture(options={}) {
  const storage=options.sessionOnly?sessionStorage:localStorage;
  if(options.initialUser&&!storage.getItem('yrgt-auth-fixture-initialized')){storage.setItem('yrgt-auth-test-user',JSON.stringify(options.initialUser));storage.setItem('yrgt-auth-fixture-initialized','1')}
  if(options.legacySave&&!storage.getItem('yrgt-save-v1:'+options.initialUser?.uid))storage.setItem('yrgt-save-v1:'+options.initialUser.uid,JSON.stringify(options.legacySave));
  globalThis.__yrgtFirebase={
    calls:[],reads:[],writes:[],options:null,popupError:options.popupError,documents:JSON.parse(storage.getItem('yrgt-firestore-test-docs')||JSON.stringify(options.documents||{})),transactionError:storage.getItem('yrgt-fixture-transaction-error')||null,
    restore:()=>JSON.parse(storage.getItem('yrgt-auth-test-user')||'null'),
    persist:user=>user?storage.setItem('yrgt-auth-test-user',JSON.stringify(user)):storage.removeItem('yrgt-auth-test-user'),
    readProfile:ref=>Object.hasOwn(globalThis.__yrgtFirebase.documents,ref)?Promise.resolve({exists:()=>true,data:()=>globalThis.__yrgtFirebase.documents[ref]}):options.profileMode==='pending'?new Promise(()=>{}):options.profileMode==='error'?Promise.reject(Error('unavailable')):Promise.resolve({exists:()=>true,data:()=>({playerName:'雲端玩家',favoriteCards:['w_1','c_1']})})
  };
  const state=globalThis.__yrgtFirebase;state.persistDocs=()=>storage.setItem('yrgt-firestore-test-docs',JSON.stringify(state.documents));state.externalWrite=(ref,data)=>{state.documents[ref]=data;state.persistDocs();for(const callback of state.listeners?.get(ref)||[])callback({exists:()=>true,data:()=>data,metadata:{fromCache:false}})};
}
