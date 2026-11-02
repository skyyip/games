let latest=null,registration=null,reloading=false;
const config=()=>window.PLAYGROUND_RELEASE??window.STUDIO_RELEASE;
function announce(){window.dispatchEvent(new Event('studio-update-ready'));}
export function watchUpdates(reg){
 registration=reg;if(reg.waiting)announce();reg.addEventListener('updatefound',()=>{const worker=reg.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)announce();});});
 let timer;const check=async()=>{if(document.hidden)return;const release=config();if(!release)return;try{const base=release.base?new URL(release.base,document.baseURI):new URL('./',document.baseURI),response=await fetch(new URL(release.manifest??'release.json',base),{cache:'no-store'});if(response.ok){const found=await response.json();if(found.version&&found.version!==release.version){latest=found;announce();}}}catch{/* Keep the current game when offline. */}};
 const schedule=()=>{clearInterval(timer);if(!document.hidden){check();timer=setInterval(check,300000);}};document.addEventListener('visibilitychange',schedule);setTimeout(schedule,1500);
}
export async function applyUpdate(){
 const current=config();if(latest?.workers&&current?.route){const base=new URL(current.base,document.baseURI),url=new URL(latest.workers[current.route],base),scope=new URL(current.route,base);if(url.origin!==location.origin||!url.pathname.startsWith(scope.pathname))throw Error('更新路徑唔正確。');registration=await navigator.serviceWorker.register(url,{scope:scope.pathname,updateViaCache:'none'});if(registration.installing)await new Promise((resolve,reject)=>{const worker=registration.installing;worker.addEventListener('statechange',()=>worker.state==='installed'?resolve():worker.state==='redundant'?reject(Error('新版暫時未準備好。')):null);});}
 const reload=()=>{if(!reloading){reloading=true;window.location.reload();}};if(registration?.waiting){navigator.serviceWorker.addEventListener('controllerchange',reload,{once:true});registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});setTimeout(reload,3000);}else reload();
}
