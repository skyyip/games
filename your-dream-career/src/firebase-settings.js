// DreamCareer owns its Firebase project. Never import another game's configuration.
// Public Web App identifiers, not Admin credentials. Null disables cloud for local play.
const projectConfig=null;
export function firebaseConfigError(config){
 if(config===null||config===undefined)return 'auth-disabled';
 if(['sky-playground-3c5af','sky-playground-career-365'].includes(config.projectId))return 'auth-project-conflict';
 if(!['apiKey','authDomain','projectId','appId'].every(k=>typeof config[k]==='string'&&config[k].trim()&&!/YOUR_|REPLACE_/i.test(config[k])))return 'auth-config-invalid';
 return null;
}
const candidate=globalThis.DREAM_CAREER_FIREBASE_CONFIG===undefined?projectConfig:globalThis.DREAM_CAREER_FIREBASE_CONFIG;
export const FIREBASE_CONFIG_ERROR=firebaseConfigError(candidate);
export const FIREBASE_CONFIG=FIREBASE_CONFIG_ERROR?null:Object.freeze({...candidate});
