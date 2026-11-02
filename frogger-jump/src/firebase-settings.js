// Firebase web-app settings are public identifiers, never Admin/private keys.
// Create a project, enable Email/Password Auth, deploy the included rules and
// index, then replace null with the Firebase web app's firebaseConfig object.
export const FIREBASE_CONFIG=globalThis.FROGGER_FIREBASE_CONFIG??null;
