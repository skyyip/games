import {FIREBASE_CONFIG,FIREBASE_CONFIG_ERROR} from './firebase-settings.js';
export const configured=!!FIREBASE_CONFIG;
let connection,firestore;
export async function authClient({retry=false}={}){
 if(!configured)throw Error(FIREBASE_CONFIG_ERROR);if(retry)connection=null;
 if(!connection){const pending=Promise.all([import('firebase/app'),import('firebase/auth')]).then(([app,sdk])=>{
  const instance=app.getApps().find(a=>a.name==='beat-bad-luck')??app.initializeApp(FIREBASE_CONFIG,'beat-bad-luck');
  if(instance.options.projectId!==FIREBASE_CONFIG.projectId)throw Error('auth-project-conflict');
  // Previous releases ultimately used localStorage. Select it directly rather than
  // waiting on getAuth's default IndexedDB initialization before switching stores.
  // This game uses popups, not redirects. Supplying a default resolver eagerly
  // loads Google's iframe on Safari/mobile and can block the first auth callback.
  // Pass the resolver explicitly only when the player requests a Google popup.
  let session;try{session=sdk.initializeAuth(instance,{persistence:[sdk.browserLocalPersistence,sdk.browserSessionPersistence,sdk.inMemoryPersistence]});}catch(e){if(e.code!=='auth/already-initialized')throw e;session=sdk.getAuth(instance);}
  if(globalThis.BBL_EMULATORS&&['localhost','127.0.0.1'].includes(location.hostname)&&!session.emulatorConfig)sdk.connectAuthEmulator(session,'http://127.0.0.1:9097',{disableWarnings:true});
  return {...sdk,app:instance,session};
 }).catch(e=>{if(connection===pending)connection=null;throw e;});connection=pending;}return connection;
}
export async function dataClient(){if(!firestore)firestore=Promise.all([authClient(),import('firebase/firestore')]).then(([auth,sdk])=>{const db=sdk.getFirestore(auth.app);if(globalThis.BBL_EMULATORS&&['localhost','127.0.0.1'].includes(location.hostname))sdk.connectFirestoreEmulator(db,'127.0.0.1',8087);return {auth,sdk,db};}).catch(e=>{firestore=null;throw e;});return firestore;}
