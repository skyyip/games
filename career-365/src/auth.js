import {FIREBASE_CONFIG,FIREBASE_CONFIG_ERROR} from './firebase-settings.js';
import {loadAuthSDK} from './firebase-auth-sdk.js';
export const configured=!!FIREBASE_CONFIG?.projectId;
export const configurationError=FIREBASE_CONFIG_ERROR;
let ready,pending;
export function initAuth(){
 if(!configured)return Promise.reject(Error(configurationError??'auth-disabled'));
 if(!pending)pending=loadAuthSDK().then(async([app,sdk])=>{
  const instance=app.getApps().find(a=>a.name==='career-365')??app.initializeApp(FIREBASE_CONFIG,'career-365');
  if(instance.options?.projectId!==FIREBASE_CONFIG.projectId)throw Error('auth-project-conflict');
  const session=sdk.getAuth(instance);
  await sdk.setPersistence(session,sdk.browserLocalPersistence);ready={...sdk,session};return ready;
 }).catch(e=>{pending=null;ready=null;throw e;});return pending;
}
export async function observeIdentity(callback,error){const c=await initAuth();return c.onAuthStateChanged(c.session,callback,error);}
export async function emailSignIn(email,password){const c=await initAuth();return (await c.signInWithEmailAndPassword(c.session,email,password)).user;}
export async function emailRegister(email,password){const c=await initAuth();const result=c.session.currentUser?.isAnonymous?await c.linkWithCredential(c.session.currentUser,c.EmailAuthProvider.credential(email,password)):await c.createUserWithEmailAndPassword(c.session,email,password);return result.user;}
export function googleSignIn(){const c=ready;if(!c)return Promise.reject(Error('auth-loading'));const provider=new c.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});return (c.session.currentUser?.isAnonymous?c.linkWithPopup(c.session.currentUser,provider):c.signInWithPopup(c.session,provider)).then(result=>result.user);}
export async function anonymousSignIn(){const c=await initAuth();if(c.session.currentUser&&!c.session.currentUser.isAnonymous)throw Error('already-signed-in');return c.session.currentUser??(await c.signInAnonymously(c.session)).user;}
export async function signOut(){const c=await initAuth();await c.signOut(c.session);}
export async function resetPassword(email){const c=await initAuth();c.session.languageCode='zh-TW';try{await c.sendPasswordResetEmail(c.session,email);}catch(e){if(e.code!=='auth/user-not-found')throw e;}}
