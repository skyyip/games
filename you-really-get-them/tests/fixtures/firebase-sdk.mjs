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
export const getDoc=ref=>{state.reads.push(ref);return state.readProfile(ref)};
export const setDoc=async(ref,data,options)=>{state.writes.push({ref,data,options});await state.writeProfile?.(ref,data)};
export const collection=(db,...parts)=>parts.join('/');
export const addDoc=async(ref,data)=>{state.writes.push({ref,data});return {id:'fixture-run'}};
export const runTransaction=async(db,action)=>action({get:async ref=>state.transactionRead?.(ref)||{exists:()=>false},set:(ref,data)=>state.writes.push({ref,data})});
export const serverTimestamp=()=>123;
`;

export function installBrowserFirebaseFixture(options={}) {
  const storage=options.sessionOnly?sessionStorage:localStorage;
  globalThis.__yrgtFirebase={
    calls:[],reads:[],writes:[],options:null,popupError:options.popupError,
    restore:()=>JSON.parse(storage.getItem('yrgt-auth-test-user')||'null'),
    persist:user=>user?storage.setItem('yrgt-auth-test-user',JSON.stringify(user)):storage.removeItem('yrgt-auth-test-user'),
    readProfile:()=>options.profileMode==='pending'?new Promise(()=>{}):options.profileMode==='error'?Promise.reject(Error('unavailable')):Promise.resolve({exists:()=>true,data:()=>({playerName:'雲端玩家',favoriteCards:['w_1','c_1']})})
  };
}
