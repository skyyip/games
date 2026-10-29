import {finisherScene,finisherKeyframes} from './finisher-scenes.js';
import {finisherPropArt} from './finisher-art.js';
import {weaponArt,dollArt} from './art.js';
import {getLanguage} from '../../grid-rush/src/language.js';
// Recipes change trajectories, stage props, transformations and captions, not hit scoring.
export function createWeaponFinisher({game,stage}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.createElement('div');root.className='weapon-signature';root.setAttribute('aria-hidden','true');stage.append(root);let animations=[],current='',paused=false;
 function clear(){for(const animation of animations)animation.cancel();animations=[];root.replaceChildren();delete document.querySelector('#paper-doll').dataset.finisherPose;current='';}
 function start(){clear();current=game.weapon;const spec=finisherScene(current),local=pair=>pair[getLanguage()==='zh-Hant'?0:1];root.dataset.weapon=current;root.dataset.pose=spec.pose;root.innerHTML='<div class="signature-motif"><svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMid meet">'+finisherPropArt(current)+'</svg></div><p class="signature-caption"></p><div class="signature-tool">'+weaponArt(current)+'</div><div class="signature-paper">'+dollArt(game.kind,game.look,game.skin)+'</div>';
  root.querySelector('.signature-caption').textContent=local(spec.name);root.querySelector('.signature-caption').title=local(spec.payoff);document.querySelector('#paper-doll').dataset.finisherPose=spec.pose;
  if(reduced.matches)return;
  const frames=finisherKeyframes(current),tool=root.querySelector('.signature-tool'),paper=root.querySelector('.signature-paper');
  animations.push(tool.animate(frames,{duration:1800+spec.steps.length*220,iterations:Infinity,easing:'ease-in-out'}));
  animations.push(paper.animate(frames.map((frame,i)=>({...frame,transform:frame.transform.replace(/rotate\((-?[\d.]+)deg\)/g,(_,n)=>`rotate(${-Number(n)}deg)`)})),{duration:2400+spec.tilt*15,iterations:Infinity,direction:'alternate',easing:'ease-in-out'}));
 }
 function sync(){const busy=game.phase==='beat'&&game.finisherBusy;if(!busy){if(current)clear();return;}if(current!==game.weapon)start();const hold=game.pausedAt!==null||document.hidden;if(hold!==paused){paused=hold;root.dataset.paused=String(hold);for(const animation of animations)hold?animation.pause():animation.play();}}
 reduced.addEventListener('change',()=>{if(current){start();if(paused)for(const animation of animations)animation.pause();}});
 return {sync,clear};
}
