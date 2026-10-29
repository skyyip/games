import {COMIC_MOODS,spiritPaperArt,comicGhostArt,peekingZombieArt} from './combat-art.js';
// Native transform/opacity animations run between infrequent, bounded spawns.
export const AMBIENT_LIMITS={paper:2,ghost:1,zombie:1};
export function createAmbientComics({game}){
 const root=document.createElement('div');root.className='ambient-comics';root.setAttribute('aria-hidden','true');document.querySelector('#beat-arena').prepend(root);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),live=new Set();let phase='',paused=false,bags=new Map(),lastMoods=new Map(),size={width:280,height:300},next={paper:400,ghost:1200,zombie:2100};
 new ResizeObserver(entries=>{const rect=entries[0].contentRect;size={width:rect.width,height:rect.height};}).observe(root);
 function mood(type){let bag=bags.get(type)??[];if(!bag.length){bag=[...COMIC_MOODS];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag.at(-1)===lastMoods.get(type))bag.unshift(bag.pop());bags.set(type,bag);}const result=bag.pop();lastMoods.set(type,result);return result;}
 function clear(){for(const item of live){item.animation?.cancel();item.node.remove();}live.clear();phase='';}
 function spawn(type){const emotion=mood(type),node=document.createElement('span'),right=Math.random()<.5,duration=type==='paper'?4800:type==='ghost'?4000:3200;node.className='ambient-sprite ambient-'+type;node.dataset.emotion=emotion;node.dataset.side=right?'right':'left';node.innerHTML=type==='paper'?spiritPaperArt(emotion,Math.floor(Math.random()*3)):type==='ghost'?comicGhostArt(emotion):peekingZombieArt(emotion);root.append(node);
  let frames;
  if(type==='paper'){node.style.left=(right?79+Math.random()*9:3+Math.random()*9)+'%';frames=[{transform:'translate3d(0,-65px,0) rotate(-14deg)',opacity:0},{transform:`translate3d(${right?-8:8}px,${size.height*.25}px,0) rotate(16deg)`,opacity:.8,offset:.3},{transform:`translate3d(${right?-16:16}px,${size.height+40}px,0) rotate(-18deg)`,opacity:0}];}
  else if(type==='ghost'){node.style.top=(18+Math.random()*42)+'%';node.style[right?'right':'left']='-8px';const sign=right?1:-1;frames=[{transform:`translate3d(${sign*60}px,10px,0)`,opacity:0},{transform:`translate3d(${-sign*8}px,-12px,0) rotate(${-sign*9}deg)`,opacity:.65,offset:.4},{transform:`translate3d(${sign*62}px,-22px,0) rotate(${sign*7}deg)`,opacity:0}];}
  else{node.style.top=(8+Math.random()*48)+'%';node.style[right?'right':'left']='-9px';const sign=right?1:-1;frames=[{transform:`translate3d(${sign*56}px,0,0) rotate(${sign*12}deg)`,opacity:0},{transform:`translate3d(${sign*8}px,0,0) rotate(${-sign*12}deg)`,opacity:.78,offset:.3},{transform:`translate3d(${sign*16}px,0,0) rotate(${-sign*5}deg)`,opacity:.78,offset:.72},{transform:`translate3d(${sign*56}px,0,0) rotate(${sign*12}deg)`,opacity:0}];}
  const item={node,type,until:game.elapsed+(reduced.matches?2000:duration),animation:null};if(!reduced.matches)item.animation=node.animate(frames,{duration,easing:'ease-in-out',fill:'both'});else{node.style.opacity='.45';node.style.top='12%';node.style.left='2%';}if(paused)item.animation?.pause();live.add(item);
 }
 function suspend(value){if(paused===value)return;paused=value;for(const item of live)if(item.animation)value?item.animation.pause():item.animation.play();}
 function sync(){if(game.phase!==phase){clear();phase=game.phase;next={paper:game.elapsed+400,ghost:game.elapsed+1200,zombie:game.elapsed+2100};}if(phase!=='beat')return;suspend(game.pausedAt!==null||document.hidden);if(paused)return;
  for(const item of live)if(game.elapsed>=item.until){item.animation?.cancel();item.node.remove();live.delete(item);}
  if(game.finisherBusy)return;
  for(const type of ['paper','ghost','zombie']){if(game.elapsed<next[type])continue;next[type]=game.elapsed+(type==='paper'?2600:type==='ghost'?6200:7800)+Math.random()*2200;if([...live].filter(item=>item.type===type).length<AMBIENT_LIMITS[type]&&(!reduced.matches||live.size===0))spawn(type);}
 }
 reduced.addEventListener('change',clear);return {sync,suspend,clear};
}
