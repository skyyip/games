import {BODY_PARTS,RING_ROUND_MS,RING_IDEAL_MS,MAX_RINGS,pullDirection} from './burst-challenges.js';
import {placeBurstRing} from './ring-layout.js';
import {getLanguage} from '../../grid-rush/src/language.js';

export function createBurstUI({game,onHit}){
 const arena=document.querySelector('#beat-arena'),root=document.createElement('section');
 root.id='burst-challenge';root.style.setProperty('--burst-ring-duration',RING_ROUND_MS+'ms');root.hidden=true;root.setAttribute('aria-labelledby','burst-challenge-title');root.setAttribute('translate','no');
 const ringMarkup=Array.from({length:MAX_RINGS},(_,i)=>`<button type="button" id="burst-ring-target${i?'-'+i:''}" class="burst-ring-target" data-slot="${i}" hidden><svg viewBox="0 0 200 200" aria-hidden="true" focusable="false"><circle class="burst-ring-halo" cx="100" cy="100" r="38"/><circle class="burst-ring-guide" cx="100" cy="100" r="32"/><g class="burst-ring-moving"><circle cx="100" cy="100" r="32"/><circle class="burst-ring-trace" cx="100" cy="100" r="37"/></g><circle cx="90" cy="94" r="3" fill="#fff2c4"/><circle cx="110" cy="94" r="3" fill="#fff2c4"/><path d="M90 105q10 10 20 0" fill="none" stroke="#fff2c4" stroke-width="3" stroke-linecap="round"/></svg></button>`).join('');
 root.innerHTML='<h3 id="burst-challenge-title" class="sr-only"></h3><button type="button" id="burst-body-target"></button><span id="burst-target-exit" aria-hidden="true" hidden></span>'+ringMarkup+'<div id="burst-pull-zone" role="group" tabindex="0"><span class="burst-pull-arrow" aria-hidden="true">↑</span><span class="burst-pull-handle" aria-hidden="true">↕</span><span class="burst-pull-arrow" aria-hidden="true">↓</span></div><p id="burst-challenge-result" class="sr-only" role="status"></p>';
 arena.append(root);
 const target=root.querySelector('#burst-body-target'),exit=root.querySelector('#burst-target-exit'),pull=root.querySelector('#burst-pull-zone'),handle=pull.querySelector('.burst-pull-handle'),title=root.querySelector('h3'),result=root.querySelector('#burst-challenge-result'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const rings=[...root.querySelectorAll('.burst-ring-target')].map(node=>({node,moving:node.querySelector('.burst-ring-moving'),animation:null,id:null}));
 let current=null,points=[],targetKey='',arenaWidth=0,arenaHeight=0,drag=null,targetFade=null,exitFade=null;
 const local=pair=>pair[getLanguage()==='zh-Hant'?0:1];
 const put=(node,value)=>{if(node.textContent!==value)node.textContent=value;};
 const attr=(node,key,value)=>{if(node.getAttribute(key)!==String(value))node.setAttribute(key,String(value));};
 const data=(node,key,value)=>{if(node.dataset[key]!==String(value))node.dataset[key]=String(value);};
 const show=(node,visible)=>{if(node.hidden===visible)node.hidden=!visible;};
 function stopRing(view){view.animation?.cancel();view.animation=null;view.id=null;}
 function stopTargetFade(){targetFade?.cancel();exitFade?.cancel();targetFade=exitFade=null;show(exit,false);}
 function stop(){for(const view of rings)stopRing(view);stopTargetFade();}
 function place(){
  if(root.hidden)return;
  const a=arena.getBoundingClientRect(),z=document.querySelector('#hit-zone').getBoundingClientRect(),scale=Math.min(z.width/140,z.height/160),x=z.left-a.left+(z.width-140*scale)/2,y=z.top-a.top+(z.height-160*scale)/2;
  points=BODY_PARTS.map(p=>({id:p.id,x:Math.max(24,Math.min(a.width-24,x+p.x*140*scale)),y:Math.max(24,Math.min(a.height-24,y+p.y*160*scale))}));
  arenaWidth=a.width;arenaHeight=a.height;targetKey='';for(const view of rings){view.x=null;view.y=null;}
 }
 function assignRings(active){
  for(const view of rings)if(view.id&&!active.some(r=>r.id===view.id))stopRing(view);
  for(const item of active){
   let view=rings.find(v=>v.id===item.id);
   if(!view){view=rings.find(v=>!v.id);view.id=item.id;view.x=null;}
   if(view.x!==null)continue;
   const occupied=rings.filter(v=>v!==view&&v.id&&v.x!==null),spot=placeBurstRing(arenaWidth,arenaHeight,occupied,item.position);
   if(!spot)continue;
   Object.assign(view,spot);view.node.style.width=view.node.style.height=spot.size+'px';view.node.style.left=spot.x+'px';view.node.style.top=spot.y+'px';
  }
 }
 function fadeTarget(){
  stopTargetFade();if(reduced.matches)return;
  if(targetKey){exit.textContent=target.textContent;exit.style.left=target.style.left;exit.style.top=target.style.top;show(exit,true);exitFade=exit.animate([{opacity:1},{opacity:0}],{duration:90,fill:'both'});}
  targetFade=target.animate([{opacity:0},{opacity:1}],{duration:90,fill:'both'});
 }
 function submit(action,pointer){if(game.phase!=='beat'||!game.finisherBusy||game.pausedAt!==null)return;onHit({challengeAction:action,pointer,gesture:'tap'});sync();}
 function bindTap(button,action){
  button.addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();e.stopPropagation();submit(action(),'burst-'+e.pointerId);});
  button.addEventListener('click',e=>{e.stopPropagation();if(e.detail===0)submit(action(),'burst-keyboard');});
 }
 bindTap(target,()=>target.dataset.part);for(const view of rings)bindTap(view.node,()=>`timing:${view.node.dataset.ringId}`);
 function resetPull(){const active=drag;drag=null;if(handle.style.transform)handle.style.transform='';if(pull.dataset.dragging==='true')pull.dataset.dragging='false';if(active&&pull.hasPointerCapture(active.id))pull.releasePointerCapture(active.id);}
 pull.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(e.button!==0||game.finisher?.challenge.mode!=='pull'||!game.finisherBusy||game.pausedAt!==null)return;if(drag){resetPull();return;}drag={id:e.pointerId,x:e.clientX,y:e.clientY,finisher:game.finisher};pull.setPointerCapture(e.pointerId);data(pull,'dragging',true);pull.focus({preventScroll:true});});
 pull.addEventListener('pointermove',e=>{if(drag?.id!==e.pointerId)return;e.preventDefault();e.stopPropagation();handle.style.transform=`translateY(${Math.max(-45,Math.min(45,e.clientY-drag.y))}px)`;});
 pull.addEventListener('pointerup',e=>{e.preventDefault();e.stopPropagation();if(drag?.id!==e.pointerId)return;const active=drag,action=pullDirection(e.clientX-active.x,e.clientY-active.y);resetPull();if(action&&active.finisher===game.finisher)submit(action,'burst-'+e.pointerId);});
 for(const event of ['pointercancel','lostpointercapture'])pull.addEventListener(event,e=>{if(drag?.id===e.pointerId)resetPull();});
 pull.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();});
 pull.addEventListener('keydown',e=>{if(!['ArrowUp','ArrowDown',' '].includes(e.key))return;e.preventDefault();e.stopPropagation();if(!e.repeat&&e.key!==' ')submit(e.key==='ArrowUp'?'pull-up':'pull-down','burst-keyboard');});
 function sync(){
  const f=game.finisher,busy=game.phase==='beat'&&game.finisherBusy;show(root,busy);
  if(!busy){resetPull();if(current){stop();for(const view of rings)show(view.node,false);show(target,false);show(pull,false);data(root,'ringCount',0);current=null;targetKey='';}return;}
  if(current!==f){resetPull();stop();current=f;data(root,'mode',f.challenge.mode);place();}
  const c=f.challenge,time=game.finisherTime,zh=getLanguage()==='zh-Hant',isTarget=c.mode==='targets',isPull=c.mode==='pull',timing=c.mode==='timing',hold=game.pausedAt!==null||document.hidden;
  show(target,isTarget);show(pull,isPull);data(root,'paused',hold);if(drag&&(hold||!isPull))resetPull();
  if(isTarget){
   const part=BODY_PARTS.find(p=>p.id===c.target),key=part.id+'|'+getLanguage();put(title,zh?`點擊${part.name[0]}！`:`Tap the ${part.name[1].toLowerCase()}!`);
   if(key!==targetKey){fadeTarget();targetKey=key;const point=points.find(p=>p.id===part.id);target.style.left=point.x+'px';target.style.top=point.y+'px';data(target,'part',part.id);put(target,local(part.short));attr(target,'aria-label',zh?`點擊指定部位：${part.name[0]}`:`Tap the named body part: ${part.name[1]}`);}
  }else if(isPull){put(title,zh?'向上拉／向下拉！':'Pull up or down!');attr(pull,'aria-label',zh?'上下拉動區：向上或向下拉至少 40px 後放手。鍵盤可用上下方向鍵。':'Pull area: drag up or down at least 40px, then release. Keyboard: up or down arrow.');}
  else{put(title,zh?'縮圈挑戰：最多三個圈，分別點擊！':'Timing challenge: up to three independently judged rings.');assignRings(c.rings);data(root,'ringProgress',((time-(c.rings[0]?.at??time))/RING_ROUND_MS).toFixed(3));data(root,'ringCount',c.rings.length);}
  for(const fade of [targetFade,exitFade])if(fade&&fade.playState!=='finished'){if(hold&&fade.playState!=='paused')fade.pause();else if(!hold&&fade.playState==='paused')fade.play();}
  if(exitFade?.playState==='finished')show(exit,false);
  for(const view of rings){
   const item=timing?c.rings.find(r=>r.id===view.id):null;show(view.node,Boolean(item&&view.x!==null));if(!item){if(view.animation)stopRing(view);continue;}
   const phase=time-item.at;data(view.node,'ringId',item.id);data(view.node,'bornAt',item.at);data(view.node,'ringProgress',(phase/RING_ROUND_MS).toFixed(3));data(view.node,'part',item.part);data(view.node,'locked',item.judged);attr(view.node,'aria-disabled',item.judged);attr(view.node,'aria-label',zh?`縮圈：外圈和金圈重合時點擊${item.judged?'，本圈已判定':''}`:`Timing ring: tap when the rings overlap${item.judged?'; already judged':''}`);
   if(!view.animation){view.animation=view.moving.animate([{transform:'scale(2.6)',opacity:.65},{transform:'scale(1)',opacity:1,offset:RING_IDEAL_MS/RING_ROUND_MS},{transform:'scale(.6)',opacity:.35}],{duration:RING_ROUND_MS,fill:'both',easing:'linear'});view.animation.currentTime=phase;}
   if(Math.abs(Number(view.animation.currentTime)-phase)>150)view.animation.currentTime=phase;
   if(hold&&view.animation.playState!=='paused')view.animation.pause();else if(!hold&&view.animation.playState==='paused')view.animation.play();
  }
  const feedback=c.judgement,visible=feedback&&time-feedback.at<(isTarget?250:750);
  put(result,visible?(feedback.grade==='Miss'?(zh?'Miss！太早或太遲，可試其他圈。':'Miss! Too early or late. Try another ring.'):`${feedback.grade==='Target'?(zh?'命中！':'Hit!'):feedback.grade==='Pull'?(zh?'拉中喇！':'Good pull!'):feedback.grade} +${Math.round(feedback.points*game.scoreMultiplier)}`):'');data(root,'grade',visible?feedback.grade:'');
 }
 new ResizeObserver(()=>{if(!root.hidden){place();sync();}}).observe(arena);
 reduced.addEventListener('change',()=>{stop();sync();});
 return {sync,focus(){(game.finisher?.challenge.mode==='targets'?target:game.finisher?.challenge.mode==='pull'?pull:(rings.find(v=>!v.node.hidden)??rings[0]).node).focus({preventScroll:true});}};
}
