// Public Web App config for Beat the Bad Luck's independent project.
// Set to null to disable cloud features and keep local play only.
const projectConfig={
 apiKey:'AIzaSyC39_Q7QoIYOfK95ViWIZ3oq-FsdH2TlFA',
 authDomain:'beat-bad-luck.firebaseapp.com',
 projectId:'beat-bad-luck',
 storageBucket:'beat-bad-luck.firebasestorage.app',
 messagingSenderId:'13142087960',
 appId:'1:13142087960:web:a94a1df3c3b9be2647666d',
};
export function firebaseConfigError(c){if(c==null)return 'auth-disabled';if(['sky-playground-3c5af','sky-playground-career-365'].includes(c.projectId))return 'auth-project-conflict';if(!['apiKey','authDomain','projectId','appId'].every(k=>typeof c[k]==='string'&&c[k].trim()&&!/YOUR_|REPLACE_/i.test(c[k])))return 'auth-config-invalid';return null;}
const candidate=globalThis.BBL_FIREBASE_CONFIG===undefined?projectConfig:globalThis.BBL_FIREBASE_CONFIG;
export const FIREBASE_CONFIG_ERROR=firebaseConfigError(candidate);
export const FIREBASE_CONFIG=FIREBASE_CONFIG_ERROR?null:Object.freeze({...candidate});
