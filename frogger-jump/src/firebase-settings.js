// Public Firebase web-app configuration; this is not an Admin credential.
// An explicit runtime override (including null for isolated local tests) is supported.
const projectConfig=Object.freeze({
  apiKey: 'AIzaSyCl8n4geXHHDHQCDRyKyrEVzDlMojexlW4',
  authDomain: 'sky-playground-3c5af.firebaseapp.com',
  projectId: 'sky-playground-3c5af',
  storageBucket: 'sky-playground-3c5af.firebasestorage.app',
  messagingSenderId: '807256166215',
  appId: '1:807256166215:web:0899a60f76adb2487ac662'
});
export const FIREBASE_CONFIG=globalThis.FROGGER_FIREBASE_CONFIG===undefined?projectConfig:globalThis.FROGGER_FIREBASE_CONFIG;
