import {springStep,resistedDrag} from '../../grid-rush/src/motion.js';
import {reducedMotion} from '../../grid-rush/src/playground-ui.js';

export function mountPadMotion(button) {
  const value={x:0,y:0,scale:1,strain:0},target={...value},velocity={...value,x:0,y:0,scale:0,strain:0};
  let frame=0,previous=0,bounds,last;
  function draw() {
    for(const [name,key,unit] of [['x','x','px'],['y','y','px'],['scale','scale',''],['strain','strain','']])button.style.setProperty(`--${name==='strain'?'strain':`pad-${name}`}`,`${value[key]}${unit}`);
  }
  function tick(now) {
    const dt=previous?(now-previous)/1000:1/60;previous=now;let moving=false;
    for(const key of Object.keys(value)) {
      const next=springStep(value[key],velocity[key],target[key],dt,{stiffness:290,damping:23,mass:.8});
      const settled=Math.abs(next.position-target[key])<.0005&&Math.abs(next.velocity)<.005;
      value[key]=settled?target[key]:next.position;velocity[key]=settled?0:next.velocity;moving ||= !settled;
    }
    draw();frame=moving?requestAnimationFrame(tick):0;if(!frame)previous=0;
  }
  function set(next) {
    Object.assign(target,next);
    if(reducedMotion.matches){cancelAnimationFrame(frame);frame=0;previous=0;Object.assign(value,target);for(const key of Object.keys(velocity))velocity[key]=0;draw();return;}
    if(!frame)frame=requestAnimationFrame(tick);
  }
  function rest(){last=null;set({x:0,y:0,scale:1,strain:0});}
  button.addEventListener('pointerenter',()=>{bounds=button.getBoundingClientRect();});
  button.addEventListener('pointerdown',event=>{
    if(event.button!==0||!event.isPrimary)return;
    bounds=button.getBoundingClientRect();last={x:event.clientX,y:event.clientY,t:event.timeStamp};set({scale:.94});
  });
  button.addEventListener('pointermove',event=>{
    if(!event.isPrimary||reducedMotion.matches)return;
    bounds ||= button.getBoundingClientRect();
    const x=event.clientX-bounds.left-bounds.width/2,y=event.clientY-bounds.top-bounds.height/2;
    if(button.classList.contains('is-holding')) {
      const speed=last?Math.hypot(event.clientX-last.x,event.clientY-last.y)/Math.max(1,event.timeStamp-last.t):0;
      set({x:resistedDrag(x*.18,10),y:resistedDrag(y*.18,10),strain:Math.min(.035,speed*.018)});
      last={x:event.clientX,y:event.clientY,t:event.timeStamp};
    }else if(event.pointerType==='mouse'&&matchMedia('(hover:hover)').matches){
      const pull=Math.max(0,1-Math.hypot(x,y)/(bounds.width*.8))**2;
      set({x:x*.13*pull,y:y*.13*pull});
    }
  });
  button.addEventListener('pointerleave',()=>{if(!button.classList.contains('is-holding'))rest();});
  window.addEventListener('pointerup',rest);window.addEventListener('pointercancel',rest);window.addEventListener('blur',rest);
  button.addEventListener('keydown',event=>{if(['Space','Enter'].includes(event.code)&&!event.repeat)set({scale:.94});});
  window.addEventListener('keyup',event=>{if(['Space','Enter'].includes(event.code))rest();});
  window.addEventListener('timegame:cancel',rest);
  reducedMotion.addEventListener('change',rest);
}

export function mountParallax(art) {
  art.addEventListener('pointermove',event=>{
    if(reducedMotion.matches||event.pointerType!=='mouse')return;
    const r=art.getBoundingClientRect();
    art.style.setProperty('--art-x',`${(event.clientX-r.left-r.width/2)*.025}px`);
    art.style.setProperty('--art-y',`${(event.clientY-r.top-r.height/2)*.025}px`);
  });
  const rest=()=>{art.style.setProperty('--art-x','0px');art.style.setProperty('--art-y','0px');};
  art.addEventListener('pointerleave',rest);reducedMotion.addEventListener('change',rest);
}

let inkAnimation;
export function moveInk(tracker,index) {
  const item=tracker.querySelectorAll('li')[index],ink=tracker.querySelector('.tracker-ink');
  if(!item||tracker.hidden)return;
  const itemBox=item.getBoundingClientRect(),box=tracker.getBoundingClientRect(),x=itemBox.left-box.left-6;
  const from=getComputedStyle(ink).transform;
  inkAnimation?.cancel();ink.style.width=`${itemBox.width}px`;ink.style.transform=`translateX(${x}px)`;
  if(!reducedMotion.matches&&from!=='none')inkAnimation=ink.animate([
    {transform:from},{transform:`translateX(${x*.65}px) scaleX(1.25)`,offset:.5},
    {transform:`translateX(${x}px) scaleX(.96)`,offset:.82},{transform:`translateX(${x}px) scaleX(1)`},
  ],{duration:430,easing:'cubic-bezier(.2,.8,.2,1)'});
}
