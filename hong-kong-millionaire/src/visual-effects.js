import {cropLayout,questionView} from './question-view.js';
export function paintQuestionImage(image,frame,q,spec,elapsed,duration){
 const mode=spec.mode;
 image.style.cssText='';image.alt=questionView(q,mode).alt;
 image.dataset.mode=mode;frame.dataset.visualMode=mode;
 if(mode==='partial'&&q.observation){
  const {width,height}=frame.getBoundingClientRect(),layout=cropLayout(q.observation.crop,width||800,height||500);
  Object.assign(image.style,{position:'absolute',maxWidth:'none',objectFit:'fill',width:layout.width+'px',height:layout.height+'px',left:layout.left+'px',top:layout.top+'px',clipPath:layout.clip});
 }
 if(mode==='mirrored')image.style.transform=spec.vertical?'scaleY(-1)':'scaleX(-1)';
 if(mode==='blurred'){
  // Relative to image size: enough to obscure details on mobile without hiding
  // the entire scene. Rerenders and hints continue from the original deadline.
  const radius=Math.max(5,Math.min(18,frame.getBoundingClientRect().height*.07));
  const animation=image.animate([{filter:`blur(${radius}px)`},{filter:'blur(0px)'}],{duration,fill:'forwards',easing:'linear'});
  animation.currentTime=Math.max(0,Math.min(duration,elapsed));return animation;
 }
 return null;
}
