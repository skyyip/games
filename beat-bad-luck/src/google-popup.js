// Installed apps must open a real window in the original trusted click, before
// Firebase's async iframe initialization. Firebase still owns OAuth/event validation.
const reservations=new WeakMap(),resolvers=new WeakMap();
const error=code=>Object.assign(Error(code),{code});
export function googleHandlerURL(auth,provider,authType,eventId,version,returnURL){
 if(provider.providerId!=='google.com'||!['signInViaPopup','linkViaPopup'].includes(authType))throw error('auth/invalid-provider-id');
 const options=auth.app.options,domain=options.authDomain;if(!domain||!/^[a-z\d.-]+(?::\d+)?$/i.test(domain)||!options.apiKey||!eventId)throw error('auth-config-invalid');
 const emulator=auth.emulatorConfig,local=['localhost','127.0.0.1'].includes(new URL(returnURL).hostname);
 const url=emulator&&local&&['localhost','127.0.0.1'].includes(emulator.host)?new URL(`${emulator.protocol}://${emulator.host}:${emulator.port}/emulator/auth/handler`):new URL('https://'+domain+'/__/auth/handler');
 const params={apiKey:options.apiKey,appName:auth.app.name,authType,redirectUrl:returnURL,v:version,eventId,providerId:'google.com'};const custom=provider.getCustomParameters?.()??{};if(Object.keys(custom).length)params.customParameters=JSON.stringify(custom);const scopes=provider.getScopes?.().filter(Boolean)??[];if(scopes.length)params.scopes=scopes.join(',');if(auth.tenantId)params.tid=auth.tenantId;for(const [key,value]of Object.entries(params))if(value!==undefined)url.searchParams.set(key,value);return url;
}
export function reserveGooglePopup(auth,provider,{openingTimeoutMs=15000,title='正在連接 Google…'}={}){
 const Base=auth.browserPopupRedirectResolver,standalone=navigator.standalone===true||matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches;
 if(!standalone||typeof Base!=='function')return {resolver:Base,dispose(){},aborted:null};
 const popup=window.open('about:blank','bbl-google-'+crypto.randomUUID(),'popup=yes,width=480,height=680');if(!popup)throw error('auth/popup-blocked');
 try{popup.document.title=title;const p=popup.document.createElement('p');p.textContent=title;popup.document.body.style.cssText='background:#24483f;color:#fff0cc;font:18px/1.7 system-ui;padding:24px';popup.document.body.append(p);}catch{}
 let timer,poll,disposed=false,opened=false,rejectOpening;const aborted=new Promise((_,reject)=>rejectOpening=reject);
 const stopOpening=()=>{clearTimeout(timer);clearInterval(poll);};
 const dispose=()=>{if(disposed)return;disposed=true;stopOpening();reservations.delete(provider);try{popup.close();}catch{}};
 const cancel=code=>{if(disposed||opened)return;rejectOpening(error(code));dispose();};
 timer=setTimeout(()=>cancel('auth-popup-opening-timeout'),openingTimeoutMs);poll=setInterval(()=>{try{if(popup.closed)cancel('auth/popup-closed-by-user');}catch{}},300);
 reservations.set(provider,{popup,version:auth.firebaseVersion,open(){if(disposed||popup.closed)throw error('auth/popup-closed-by-user');opened=true;stopOpening();}});
 if(!resolvers.has(Base)){
  // One adapter per SDK resolver class reuses Firebase's iframe/event manager.
  // The only SDK hook changed is where its validated handler window is opened.
  class InstalledPopupResolver extends Base{
   async _openPopup(session,p,authType,eventId){const reserved=reservations.get(p);if(!reserved)throw error('auth/cancelled-popup-request');p.setDefaultLanguage?.(session.languageCode);const url=googleHandlerURL(session,p,authType,eventId,reserved.version,location.href);const token=await session._getAppCheckToken?.();if(token)url.hash='fac='+encodeURIComponent(token);reserved.open();reserved.popup.location.replace(url.href);return {window:reserved.popup,associatedEvent:null,close(){try{reserved.popup.close();}catch{}}};}
  }resolvers.set(Base,InstalledPopupResolver);
 }
 return {resolver:resolvers.get(Base),dispose,aborted};
}
