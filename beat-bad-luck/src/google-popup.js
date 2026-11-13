// Firebase owns OAuth/event validation. Installed apps prepare its helper first,
// then open the final handler URL directly from an explicit player click.
const reservations=new WeakMap(),resolvers=new WeakMap();
const error=code=>Object.assign(Error(code),{code});
export function googleHandlerURL(auth,provider,authType,eventId,version,returnURL){
 if(provider.providerId!=='google.com'||!['signInViaPopup','linkViaPopup'].includes(authType))throw error('auth/invalid-provider-id');
 const options=auth.app.options,domain=options.authDomain;if(!domain||!/^[a-z\d.-]+(?::\d+)?$/i.test(domain)||!options.apiKey||!eventId)throw error('auth-config-invalid');
 const emulator=auth.emulatorConfig,local=['localhost','127.0.0.1'].includes(new URL(returnURL).hostname);
 const url=emulator&&local&&['localhost','127.0.0.1'].includes(emulator.host)?new URL(`${emulator.protocol}://${emulator.host}:${emulator.port}/emulator/auth/handler`):new URL('https://'+domain+'/__/auth/handler');
 const params={apiKey:options.apiKey,appName:auth.app.name,authType,redirectUrl:returnURL,v:version,eventId,providerId:'google.com'};const custom=provider.getCustomParameters?.()??{};if(Object.keys(custom).length)params.customParameters=JSON.stringify(custom);const scopes=provider.getScopes?.().filter(Boolean)??[];if(scopes.length)params.scopes=scopes.join(',');if(auth.tenantId)params.tid=auth.tenantId;for(const [key,value]of Object.entries(params))if(value!==undefined)url.searchParams.set(key,value);return url;
}
// A home-screen app must open the final OAuth URL in a fresh trusted gesture.
// iOS/COOP can report a live external window as closed; never poll that proxy.
export function prepareGooglePopup(auth,provider,{openingTimeoutMs=15000,onReady=()=>{}}={}){
 const Base=auth.browserPopupRedirectResolver,standalone=navigator.standalone===true||matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches;
 if(!standalone||typeof Base!=='function')return {resolver:Base,standalone:false,dispose(){},aborted:null};
 let timer,disposed=false,opened=false,url=null,popup=null,resolveOpen=null,rejectOpen=null,rejectAction;
 const aborted=new Promise((_,reject)=>{rejectAction=reject;});
 const dispose=(code='auth/cancelled-popup-request')=>{if(disposed)return;disposed=true;clearTimeout(timer);reservations.delete(provider);rejectOpen?.(error(code));try{popup?.close();}catch{}};
 const cancel=(code='auth-google-cancelled')=>{if(disposed)return;rejectAction(error(code));dispose(code);};
 const api={resolver:null,standalone:true,aborted,dispose,cancel,get ready(){return !!url&&!disposed;},get opened(){return opened;},open(){
  if(disposed||!url||opened)throw error('auth/cancelled-popup-request');
  const target='bbl-google-'+crypto.randomUUID();
  const ios=navigator.standalone===true||/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1;
  if(ios){
   // Same direct-link method as Firebase's iOS standalone opener. A WindowProxy
   // is not required, and opening the final URL needs no later navigation.
   const link=document.createElement('a');link.href=url.href;link.target=target;link.rel='opener';link.hidden=true;document.body.append(link);try{link.click();}finally{link.remove();}
  }else{popup=window.open(url.href,target);if(!popup)throw error('auth/popup-blocked');}
  opened=true;
  // Firebase may inspect only this logical cancellation state. The real proxy
  // can be detached on iPhone or by COOP even while account selection is open.
  resolveOpen({window:{get closed(){return disposed;}},associatedEvent:null,close(){dispose();}});
 }};
 timer=setTimeout(()=>cancel('auth-popup-opening-timeout'),openingTimeoutMs);
 reservations.set(provider,{version:auth.firebaseVersion,prepare(handler){if(disposed)throw error('auth/cancelled-popup-request');url=handler;clearTimeout(timer);return new Promise((resolve,reject)=>{resolveOpen=resolve;rejectOpen=reject;onReady();});}});
 if(!resolvers.has(Base)){
  class InstalledPopupResolver extends Base{
   async _openPopup(session,p,authType,eventId){const pending=reservations.get(p);if(!pending)throw error('auth/cancelled-popup-request');p.setDefaultLanguage?.(session.languageCode);const url=googleHandlerURL(session,p,authType,eventId,pending.version,location.href);const token=await session._getAppCheckToken?.();if(token)url.hash='fac='+encodeURIComponent(token);return pending.prepare(url);}
  }resolvers.set(Base,InstalledPopupResolver);
 }
 api.resolver=resolvers.get(Base);return api;
}
