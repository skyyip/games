import {COMIC_MOODS,comicGhostArt} from './combat-art.js';
// Native transform/opacity animations run between infrequent, bounded spawns.
export const AMBIENT_LIMITS={ghost:2};
export function createAmbientComics({game}){
 const root=document.createElement('div');root.className='ambient-comics';root.setAttribute('aria-hidden','true');document.querySelector('#beat-arena').prepend(root);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),live=new Set();let phase='',paused=false,bags=new Map(),lastMoods=new Map(),size={width:280,height:300},nextGhost=1200;
 new ResizeObserver(entries=>{const rect=entries[0].contentRect;size={width:rect.width,height:rect.height};}).observe(root);
 function mood(type){let bag=bags.get(type)??[];if(!bag.length){bag=[...COMIC_MOODS];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.at(-1)===lastMoods.get(type))bag.unshift(bag.pop());bags.set(type,bag);}const result=bag.pop();lastMoods.set(type,result);return result;}
 function clear(){for(const item of live){item.animation?.cancel();item.node.remove();}live.clear();phase='';}
 function spawn(){const emotion=mood('ghost'),node=document.createElement('span'),right=Math.random()<.5,duration=7600;node.className='ambient-sprite ambient-ghost';node.dataset.emotion=emotion;node.dataset.side=right?'right':'left';node.innerHTML=comicGhostArt(emotion);root.append(node);
  node.style.top=(12+Math.random()*35)+'%';node.style[right?'right':'left']='-8px';const sign=right?-1:1,travel=Math.max(24,Math.min(size.width*.55,180));const frames=[{transform:'translate3d(0,8px,0) rotate(-5deg)',opacity:0},{transform:`translate3d(${sign*travel*.35}px,-10px,0) rotate(5deg)`,opacity:.45,offset:.18},{transform:`translate3d(${sign*travel}px,-20px,0) rotate(-6deg)`,opacity:.58,offset:.42},{transform:`translate3d(${sign*travel*.55}px,4px,0) rotate(5deg)`,opacity:.45,offset:.68},{transform:`translate3d(${sign*travel*.75}px,-6px,0) rotate(-3deg)`,opacity:.25,offset:.82},{transform:`translate3d(${sign*travel*.85}px,-22px,0)`,opacity:0}];
  const item={node,until:game.elapsed+(reduced.matches?2000:duration),animation:null};if(!reduced.matches)item.animation=node.animate(frames,{duration,easing:'ease-in-out',fill:'both'});else{node.style.opacity='.45';node.style.top='12%';node.style.left='2%';}if(paused)item.animation?.pause();live.add(item);
 }
 function suspend(value){if(paused===value)return;paused=value;for(const item of live)if(item.animation)value?item.animation.pause():item.animation.play();}
 function sync(){if(game.phase!==phase){clear();phase=game.phase;nextGhost=game.elapsed+1200;}if(phase!=='beat')return;suspend(game.pausedAt!==null||document.hidden);if(paused)return;
  for(const item of live)if(game.elapsed>=item.until){item.animation?.cancel();item.node.remove();live.delete(item);}
  if(game.finisherBusy){for(const item of live){item.animation?.cancel();item.node.remove();}live.clear();return;}
  if(game.elapsed>=nextGhost){nextGhost=game.elapsed+4800+Math.random()*1800;if(live.size<AMBIENT_LIMITS.ghost&&(!reduced.matches||live.size===0))spawn();}
 }
 reduced.addEventListener('change',clear);return {sync,suspend,clear};
}
