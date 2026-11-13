// A release manifest detects a new hashed worker URL even while an old app is open.
import {getLanguage} from './language.js';
if(location.protocol.startsWith('http')&&self.origin!=='null'&&'serviceWorker'in navigator){
 const config=window.PLAYGROUND_RELEASE,base=new URL(config?.base??(location.pathname.endsWith('/games/')?'./':'../'),document.baseURI);
 let latest=null,registration=null,reloading=false,updating=false,failed=false,snoozedUntil=0;
 const dialog=document.createElement('dialog');dialog.id='site-update-dialog';dialog.setAttribute('aria-labelledby','site-update-title');dialog.style.cssText='max-width:min(420px,calc(100vw - 28px));padding:24px;border:2px solid #e8c97e;border-radius:20px;background:#24483f;color:#fff0cc;box-shadow:0 15px 70px #0008';
 const h=document.createElement('h2'),p=document.createElement('p'),update=document.createElement('button'),later=document.createElement('button');h.id='site-update-title';update.id='site-update-apply';later.id='site-update-later';
 for(const b of [update,later]){b.type='button';b.style.cssText='min-height:44px;padding:10px 16px;margin:6px;border-radius:10px;border:1px solid #eac877;background:#efd086;color:#243e33;font:inherit;cursor:pointer';}
 p.style.lineHeight='1.7';dialog.append(h,p,update,later);document.body.append(dialog);
 const progress=document.createElement('p');progress.id='site-update-status';progress.setAttribute('role','status');progress.setAttribute('translate','no');progress.hidden=true;progress.style.cssText='position:fixed;inset:auto 12px 16px;z-index:10000;width:fit-content;max-width:calc(100vw - 24px);margin:auto;padding:12px 18px;border:1px solid #e8c97e;border-radius:14px;background:#24483f;color:#fff0cc;font:14px/1.7 system-ui;box-shadow:0 4px 24px #0006;pointer-events:none';document.body.append(progress);
 function text(){
  const zh=getLanguage()==='zh-Hant';for(const n of [h,p,update,later])n.setAttribute('translate','no');
  h.textContent=zh?'新版遊樂場到咗！':'A new playground is ready!';
  p.textContent=failed?(zh?'暫時未能完成更新，請連線後再試。已儲存的紀錄保留，遊戲仍可繼續。':'The update could not finish. Reconnect and retry. Your saved records are safe and you can keep playing.'):(zh?'已準備最新遊戲內容。更新會重新載入此頁；未完成的這一局將重新開始，已儲存的紀錄會保留。':'Fresh games are ready. Updating reloads this page and restarts an unfinished round; saved records stay.');
  update.textContent=failed?(zh?'重試更新':'Retry update'):(zh?'更新並重新載入':'Update and reload');later.textContent=zh?'稍後，先玩埋呢局':'Later, finish this round';
  progress.textContent=zh?'正在更新遊戲，完成後會重新載入。已儲存的紀錄會保留。':'Updating the game. This page will reload when ready. Your saved records stay safe.';
 }
 function offer(){
  if(document.hidden||dialog.open||updating||reloading||Date.now()<snoozedUntil)return;
  text();if(!document.querySelector('dialog[open]')&&!document.body.classList.contains('is-playing')&&!document.querySelector('[data-state=playing],[data-state=running],[data-phase=beat]')){dialog.showModal();later.focus();}
 }
 later.addEventListener('click',()=>{snoozedUntil=Date.now()+1800000;dialog.close();});dialog.addEventListener('cancel',()=>snoozedUntil=Date.now()+1800000);
 dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const first=update,last=later;if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
 function reload(){if(reloading)return;reloading=true;window.location.reload();}
 function watch(reg){registration=reg;if(reg.waiting)offer();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)offer();});});}
 async function check(){
  if(document.hidden||updating)return;
  try{if(config){const response=await fetch(new URL('release.json?check='+Math.floor(Date.now()/60000),base),{cache:'no-store'});if(response.ok){const release=await response.json();if(release.version!==config.version&&release.workers?.[config.route]){latest=release;offer();}}}else{const reg=await navigator.serviceWorker.getRegistration();if(reg&&!registration)watch(reg);await reg?.update();}}
  catch{/* Offline play keeps its current immutable assets. */}
 }
 // Inspect immediately and after subscribing: a worker can finish installing
 // before register() returns, or activate before controllerchange is observed.
 function observe(events,inspect,signal){
  return new Promise((resolve,reject)=>{
   const cleanup=()=>{for(const [target,type]of events)target.removeEventListener(type,changed);signal.removeEventListener('abort',aborted);};
   const aborted=()=>{cleanup();reject(Error('update-timeout'));};
   const changed=()=>{try{const value=inspect();if(value){cleanup();resolve(value);}}catch(error){cleanup();reject(error);}};
   for(const [target,type]of events)target.addEventListener(type,changed);
   signal.addEventListener('abort',aborted,{once:true});if(signal.aborted)aborted();else changed();
  });
 }
 async function activate(worker,signal){
  await observe([[worker,'statechange']],()=>{if(worker.state==='redundant')throw Error('install failed');return ['installed','activating','activated'].includes(worker.state);},signal);
  if(signal.aborted)throw Error('update-timeout');
  const controlled=observe([[worker,'statechange'],[navigator.serviceWorker,'controllerchange']],()=>{if(worker.state==='redundant')throw Error('activation failed');return worker.state==='activated'&&navigator.serviceWorker.controller?.scriptURL===worker.scriptURL;},signal);
  await Promise.all([controlled,Promise.resolve().then(()=>{if(worker.state==='installed')worker.postMessage({type:'ACTIVATE_UPDATE'});})]);
 }
 async function install(signal){
  if(latest){
   const url=new URL(latest.workers[config.route],base);if(url.origin!==location.origin)throw Error('worker origin');
   const reg=await navigator.serviceWorker.register(url.href,{scope:new URL(config.route,base).pathname,updateViaCache:'none'});if(signal.aborted)throw Error('update-timeout');watch(reg);
   const worker=await observe([[reg,'updatefound']],()=>[reg.installing,reg.waiting,reg.active].find(w=>w?.scriptURL===url.href),signal);
   await activate(worker,signal);
  }else{
   const worker=registration?.waiting??registration?.installing;
   if(worker)await activate(worker,signal);
  }
 }
 update.addEventListener('click',async()=>{
  if(updating||reloading)return;updating=true;failed=false;update.disabled=true;text();
  const controller=new AbortController();let timer;
  try{
   await dialog.close();progress.hidden=false;
   const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('update-timeout'));},45000);});
   await Promise.race([install(controller.signal),deadline]);reload();
  }catch{failed=true;update.disabled=false;}
  finally{clearTimeout(timer);controller.abort();progress.hidden=true;updating=false;if(failed)offer();}
 });
 async function boot(){try{if(config)watch(await navigator.serviceWorker.register(new URL(config.worker,base),{scope:new URL(config.route,base).pathname,updateViaCache:'none'}));else{const reg=await navigator.serviceWorker.getRegistration();if(reg)watch(reg);}await check();}catch{}}
 const scheduleBoot=()=>{'requestIdleCallback'in window?requestIdleCallback(boot,{timeout:1500}):setTimeout(boot,0);};if(document.readyState==='complete')scheduleBoot();else window.addEventListener('load',scheduleBoot,{once:true});
 setInterval(check,300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)check();});document.addEventListener('languagechange',text);setInterval(()=>{if(latest||registration?.waiting)offer();},10000);
}
