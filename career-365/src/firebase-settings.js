// Career365 owns its Firebase project. Never import another game's configuration.
// Public Web App identifiers, not Admin credentials. Null disables cloud for local play.
const projectConfig={
 apiKey:'AIzaSyB8eu_D-GdVhMnKxdq6_pilPV9Y7EQuxvk',
 authDomain:'sky-playground-career-365.firebaseapp.com',
 projectId:'sky-playground-career-365',
 storageBucket:'sky-playground-career-365.firebasestorage.app',
 messagingSenderId:'818739784781',
 appId:'1:818739784781:web:9a29d661e718a6fdf2c004'
};
export function firebaseConfigError(config){
 if(config===null||config===undefined)return 'auth-disabled';
 if(config.projectId==='sky-playground-3c5af')return 'auth-project-conflict';
 if(!['apiKey','authDomain','projectId','appId'].every(k=>typeof config[k]==='string'&&config[k].trim()&&!/YOUR_|REPLACE_/i.test(config[k])))return 'auth-config-invalid';
 return null;
}
const candidate=globalThis.CAREER_FIREBASE_CONFIG===undefined?projectConfig:globalThis.CAREER_FIREBASE_CONFIG;
export const FIREBASE_CONFIG_ERROR=firebaseConfigError(candidate);
export const FIREBASE_CONFIG=FIREBASE_CONFIG_ERROR?null:Object.freeze({...candidate});
