// iOS DOM Switch Hack: a real native `switch` checkbox supplies Safari haptics
// when Vibration API is absent. Keep activation inside the original hit handler.
// The visual hit flash also uses two decorative buffers; the pointer target stays put.
export function createImpactSwitch({vibrate,now=()=>performance.now()}){
 const nativeSwitch=document.createElement('input');nativeSwitch.type='checkbox';nativeSwitch.setAttribute('switch','');nativeSwitch.tabIndex=-1;
 const supportsSwitch='switch' in nativeSwitch;
 let switchLabel=null;
 if(supportsSwitch){switchLabel=document.createElement('label');switchLabel.className='impact-haptic-switch';switchLabel.setAttribute('aria-hidden','true');switchLabel.append(nativeSwitch);document.body.append(switchLabel);}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.createElement('div');root.className='dom-impact-switch';root.setAttribute('aria-hidden','true');document.querySelector('#beat-arena').append(root);
 const template=document.createElement('span');template.className='dom-impact-copy';template.innerHTML='<svg viewBox="0 0 140 140"><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="m13 47 15 8m-17 30 17-4m24 42 5-17m32 17-4-17m39-23-17-4m17-31-16 8M54 12l6 17m28-17-5 16"/><path d="m26 35 14-9m-8 79 12 9m63-78-11-10m11 77-12 10" stroke-width="2"/></g></svg>';
 let slots=[template.cloneNode(true),template.cloneNode(true)],take=0,lastHaptic=-Infinity;root.append(...slots);
 function hit(force,critical=1){
  if(now()-lastHaptic>=70){lastHaptic=now();const pattern=critical===3?[16,9,10]:Math.round(5+Math.min(1,force)*15);let native=false;try{native=vibrate(pattern)===true;}catch{}if(!native&&switchLabel&&(!navigator.userActivation||navigator.userActivation.isActive))switchLabel.click();}
  if(reduced.matches)return;
  take=1-take;const previous=slots[take],fresh=template.cloneNode(true);fresh.dataset.take=String(take);fresh.dataset.critical=String(critical);fresh.style.setProperty('--impact-scale',String(.7+Math.min(force,1.7)*.35));previous.replaceWith(fresh);slots[take]=fresh;slots[1-take].dataset.active='false';fresh.dataset.active='true';root.dataset.take=String(take);
 }
 function clear(){for(const slot of slots)slot.dataset.active='false';}
 return {hit,clear};
}
