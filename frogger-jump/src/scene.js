import {ROUTE_DEPTH,PAD_DEPTH,landingOffset,soleOffset,ease} from './grounding.js';
import {NEW_FRIENDS,paintNewFriend,paintRiverCompanion,paintRiverVisitor} from './new-friends.js';
import {ISLAND_HEAD_HEIGHT,paintIslandFriend} from './island-friends.js';
import {VARIANTS,surface} from './platforms.js';
import {CAMERA_MS,SINK_MS,DROWN_MS,FISH_WARNING_MS,SPLASH_MS} from './game.js';
import {animal as species,motionFor} from './animals.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
const ANIMAL_ART={
 penguin:['#6d8797','#fff2d7','#506b7f'],bunny:['#efded8','#fff5e7','#d6bab8'],monkey:['#b48b65','#f4d6ad','#917354'],otter:['#b49b7d','#f4d6ad','#917354'],
 duck:['#f4d879','#fff3b7','#c89a45'],cat:['#d5a06d','#ffe8c9','#ad794d'],panda:['#eeeadd','#fff9eb','#babeb3'],fox:['#dc935d','#fff0d5','#b36d47'],capybara:['#b7a083','#e4ceb0','#8d775e'],mochi:['#f6eee8','#fffaf0','#e8cfc9']
};
export const MAX_CANVAS_PIXELS=1400000;
export class RiverScene{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.width=400;this.height=500;this.pixelRatio=0;this.waterLayer=null;this.padCache=new Map();this.animalCache=new Map();this.companionCache=new Map();this.zoom=null;this.currentId=null;this.effect=null;this.launch=null;this.skill=null;this.zh=true;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');}
 resize(width,height){
  width=Math.max(1,width);height=Math.max(1,height);
  const dpr=Math.min(devicePixelRatio||1,1.75,Math.sqrt(MAX_CANVAS_PIXELS/(width*height)));
  if(width===this.width&&height===this.height&&dpr===this.pixelRatio)return false;
  const scaleChanged=dpr!==this.pixelRatio;
  this.waterLayer?.canvas.remove?.();this.width=width;this.height=height;this.pixelRatio=dpr;this.canvas.width=Math.round(width*dpr);this.canvas.height=Math.round(height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.zoom=null;this.waterLayer=null;this.padCache.clear();if(scaleChanged){this.animalCache.clear();this.companionCache.clear();}return true;
 }
 reset(){this.zoom=null;this.currentId=null;this.effect=null;this.launch=null;this.skill=null;this.padCache.clear();}
 layer(width,height){
  const canvas=document.createElement('canvas'),dpr=this.pixelRatio||1;canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {canvas,ctx,width,height};
 }
 ellipse(x,y,rx,ry,fill,stroke=null,line=1.5){const c=this.ctx;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
 path(points,fill,stroke=null,line=1.5){const c=this.ctx;c.beginPath();points(c);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
 projection(game){
  const span=game.stumps[2].y-game.current.y,fit=Math.min(this.width/480,(this.height*.7-12)/(span*ROUTE_DEPTH+80),1.5);
  if(this.zoom===null){this.zoom=fit;this.zoomFrom=fit;this.zoomTarget=fit;this.currentId=game.current.id;}
  if(this.currentId!==game.current.id){this.zoomFrom=this.zoom;this.zoomTarget=fit;this.currentId=game.current.id;}
  const t=clamp((game.clock-game.cameraAt)/CAMERA_MS);this.zoom=mix(this.zoomFrom,this.zoomTarget,t*t*(3-2*t));
  const s=this.zoom;return {s,point:p=>({x:this.width/2+p.x*s,y:this.height*.79-(p.y-game.camera)*s*ROUTE_DEPTH})};
 }
 shake(game,stump,time=game.clock){if(this.reduced.matches||stump.id!==game.current.id||!stump.sinking||game.deadline===null)return {x:0,y:0};const urgency=1-clamp((game.deadline-time)/SINK_MS);return {x:Math.sin(time*.042)*(1+urgency*2),y:Math.sin(time*.056)*urgency*1.5};}
 impact(game,stump,time=game.clock){const age=time-game.landedAt;return !this.reduced.matches&&stump===game.current&&age>=0&&age<420?Math.sin(Math.PI*age/420)*Math.exp(-age/180)*3:0;}
 platformFrame(game,pad,projection,time=game.clock){
  const top=surface(pad,time),p=projection.point(top),shake=this.shake(game,pad,time),submerge=pad===game.current&&pad.sinking&&game.deadline!==null?clamp((time-game.deadline)/500):0;
  return {top,r:top.r*projection.s,ry:top.r*projection.s*PAD_DEPTH,x:p.x+shake.x,y:p.y+shake.y+this.impact(game,pad,time)*projection.s*(pad.kind==='lily'?1.5:1)+submerge*65*projection.s,submerge};
 }
 padContact(game,pad,offset,projection,time=game.clock){const frame=this.platformFrame(game,pad,projection,time),delta=landingOffset(frame.top,offset,pad===game.current&&!this.reduced.matches?time-game.landedAt:Infinity);return {x:frame.x+delta.x*projection.s,y:frame.y+delta.y*projection.s};}
 riderContact(game,projection,frog=game.frog){
  if(game.state!=='jumping')return this.padContact(game,game.current,game.riderOffset??{x:0,y:0},projection);
  const j=game.jump,t=clamp((game.clock-j.at)/j.duration),raw=projection.point(frog),fromTop=surface(game.current,j.at),from=this.padContact(game,game.current,{x:j.from.x-fromTop.x,y:j.from.y-fromTop.y},projection,j.at),rawFrom=projection.point(j.from),start=1-ease(t/.2);
  let x=raw.x+(from.x-rawFrom.x)*start,y=raw.y+(from.y-rawFrom.y)*start;
  if(j.success){const top=surface(game.target,j.at+j.duration),to=this.padContact(game,game.target,{x:j.end.x-top.x,y:j.end.y-top.y},projection,j.at+j.duration),rawTo=projection.point(j.end),end=ease((t-.72)/.28);x+=(to.x-rawTo.x)*end;y+=(to.y-rawTo.y)*end;}
  return {x,y};
 }
 ripples(game,projection){
  if(this.reduced.matches)return;
  const c=this.ctx,{s,point}=projection;
  for(const [effect,duration]of [[this.launch,380],[this.effect,650]]){
   if(!effect)continue;const t=(game.clock-effect.at)/duration;if(t<0||t>=1)continue;
   const p=point(effect.point),r=effect.r*s,waterY=p.y+r*(effect.kind==='lily'?.12:.95)+5*s;c.save();
   for(let i=0;i<2;i++){const phase=clamp(t-i*.14);if(phase<=0)continue;c.globalAlpha=(1-t)*(.5-i*.15);this.ellipse(p.x,waterY,r*(1.06+phase*.65),r*.39*(1.06+phase*.65),null,'#e5f7df',1.5*s);}
   if(effect===this.launch&&t<.75){c.globalAlpha=(1-t/.75)*.6;for(let i=0;i<4;i++){const side=i%2?-1:1;this.ellipse(p.x+side*r*(.7+t*(.5+i*.1)),waterY-(Math.sin(Math.PI*t/.75)*(8+i*2))*s,1.5*s,2*s,'#d9f2df');}}
   c.restore();
  }
 }

 water(){
  if(!this.waterLayer){const layer=this.layer(this.width,this.height),main=this.ctx;this.ctx=layer.ctx;try{this.paintWater();}finally{this.ctx=main;}this.waterLayer=layer;
   if(this.canvas.parentNode&&this.canvas.before){layer.canvas.className='river-water-layer';layer.canvas.setAttribute('aria-hidden','true');this.canvas.before(layer.canvas);layer.visible=true;}
  }
  this.ctx.clearRect(0,0,this.width,this.height);if(!this.waterLayer.visible)this.ctx.drawImage(this.waterLayer.canvas,0,0,this.width,this.height);
 }
 paintWater(){
  const c=this.ctx,w=this.width,h=this.height;c.clearRect(0,0,w,h);
  // Flat geometry and bounded wave strokes; no blur, particles or image textures.
  for(let i=0;i<10;i++){const y=(i*.119+.045)%1*h,x=(i*93%311)/311*w,shift=0;c.strokeStyle=i%2?'#d0efde66':'#4f9d8f33';c.lineWidth=2;c.beginPath();c.moveTo(x-35+shift,y);c.bezierCurveTo(x-15+shift,y-4,x+5+shift,y+5,x+28+shift,y);c.stroke();}
  for(let i=0;i<6;i++){const right=i%2,x=right?w-12-(i*23%26):13+i*7%19,y=h*(.15+i*.14);this.ellipse(x,y,15+i%3*3,7,'#649c78');this.path(p=>{p.moveTo(x,y);p.lineTo(x+14,y-5);p.lineTo(x+10,y+5);},'#83b18a');if(i%3===0)this.ellipse(x-2,y-2,3,2,'#f6d6a0');}
 }
 // Reuse stable pad artwork; moving turtles keep their live surface position.
 stump(game,pad,index,projection){
  const age=game.clock-game.landedAt,current=pad===game.current,cacheScale=Math.max(this.zoomFrom??projection.s,this.zoomTarget??projection.s);
  const cacheable=!['lotus','spinner'].includes(pad.kind)&&!(current&&(pad.sinking||pad.angler||age>=0&&age<650));
  if(!cacheable){this.paintPlatform(game,pad,index,projection);return;}
  const {s:liveScale,point}=projection,s=cacheScale,key=[s,index,game.targetIndex,this.zh,pad.kind,pad.r,pad.sinking,pad.thorns,pad.angler,pad.reinforced,pad.guarded,pad.kind==='shell'&&game.jump?.error<=pad.r*.25].join('|');let cached=this.padCache.get(pad.id);
  if(!cached||cached.key!==key){
   const left=Math.ceil(pad.r*s*1.35+24),top=Math.ceil(pad.r*s*.43+40),width=left*2,height=top+Math.ceil(pad.r*s*1.5+48),layer=this.layer(width,height),main=this.ctx;
   this.ctx=layer.ctx;try{this.paintPlatform(game,pad,index,{s,point:()=>({x:left,y:top})});}finally{this.ctx=main;}
   cached={...layer,key,left,top};this.padCache.set(pad.id,cached);
  }
  const p=point(surface(pad,game.clock));const ratio=liveScale/s;this.ctx.drawImage(cached.canvas,p.x-cached.left*ratio,p.y-cached.top*ratio,cached.width*ratio,cached.height*ratio);
 }
 paintPlatform(game,stump,index,projection){
  if(VARIANTS.includes(stump.kind)){this.variant(game,stump,index,projection);return;}
  if(stump.kind==='lily'){this.lily(game,stump,index,projection);return;}
  const c=this.ctx,{s}=projection,{r,ry,x,y,submerge}=this.platformFrame(game,stump,projection),height=r*.95;c.save();c.globalAlpha=1-submerge;
  this.ellipse(x+5,y+height+8,r*1.13,ry*.8,'#306f6b26');
  c.strokeStyle='#d9eee0aa';c.lineWidth=1.5;this.ellipse(x,y+height+4,r*1.22,ry*.95,null,'#d8f2e099');
  const dark=stump.sinking,side=c.createLinearGradient(x-r,y,x+r,y);side.addColorStop(0,dark?'#553c35':'#86613f');side.addColorStop(.35,dark?'#94705c':'#c39a64');side.addColorStop(1,dark?'#4a3834':'#6b4d38');this.path(p=>{p.moveTo(x-r,y);p.bezierCurveTo(x-r,y+ry,x+r,y+ry,x+r,y);p.lineTo(x+r,y+height);p.bezierCurveTo(x+r,y+height+ry,x-r,y+height+ry,x-r,y+height);p.closePath();},side,dark?'#543b38':'#795b40',2);
  for(const n of [-.65,-.2,.35,.7]){c.beginPath();c.moveTo(x+n*r,y+height*.38);c.lineTo(x+n*r+Math.sin(n*10)*3,y+height*.85);c.strokeStyle=dark?'#9c7660':'#c69a67';c.lineWidth=2;c.stroke();}
  const top=c.createRadialGradient(x-r*.35,y-ry*.4,1,x,y,r);top.addColorStop(0,dark?'#d1ac83':'#ffdfa1');top.addColorStop(1,dark?'#8d654e':'#c29c67');this.ellipse(x,y,r,ry,top,dark?'#70503e':'#8d6c46',2);
  for(const k of [.74,.49,.22])this.ellipse(x-r*.05,y,r*k,ry*k,null,dark?'#8b654b':'#bc9966',1);
  this.ellipse(x-r*.08,y,2*s,s,dark?'#70503e':'#9b774e');
  this.surfaceMarks(game,stump,index,{s,r,ry,height,x,y});
  if(dark){c.font='700 14px system-ui';c.fillStyle='#fff0cf';c.fillText('!',x+r*.62,y+height*.7);}c.restore();
 }
 surfaceMarks(game,stump,index,{s,r,ry,height,x,y}){const c=this.ctx;
  if(stump===game.target){this.ellipse(x,y,r+5,ry+3,null,'#fff5bd',2);this.path(p=>{p.moveTo(x-5*s,y-ry-13*s);p.lineTo(x,y-ry-7*s);p.lineTo(x+5*s,y-ry-13*s);},null,'#fff7c9',2);}
  if(stump.thorns){
   this.path(p=>{p.moveTo(x-r*.8,y);p.bezierCurveTo(x-r*.3,y-ry,x+r*.1,y+ry,x+r*.8,y-ry*.3);},null,'#456748',5*s);
   for(let n=-2;n<=2;n++){const tx=x+n*r*.29,ty=y+Math.sin(n*1.5)*ry*.35;this.path(p=>{p.moveTo(tx-5*s,ty);p.lineTo(tx,ty-17*s);p.lineTo(tx+4*s,ty);},'#edf0af','#456748',1.5);}
  }
  if(stump.angler){
   const warning=stump===game.current&&game.fishRemaining!==null,urgency=warning?1-game.fishRemaining/FISH_WARNING_MS:0,lx=x+r*.8,ly=y+height+4;
   this.ellipse(lx,ly,16*s,6*s,null,'#d9efe3',1.5);
   this.path(p=>{p.moveTo(lx,ly);p.quadraticCurveTo(lx+12*s,ly-24*s,lx-2*s,ly-26*s);},null,'#336c69',2*s);
   this.ellipse(lx-2*s,ly-26*s,(5+urgency*2)*s,6*s,warning?'#fff2a1':'#d6f1ae','#588171');
  }
  const text=index===0?(this.zh?'腳下':'HERE'):stump.thorns?(this.zh?'跨過！':'SKIP!'):stump===game.target?(this.zh?'下一跳':'NEXT'):(this.zh?'再下一跳':'THEN');c.textAlign='center';c.font='700 11px "DM Sans",system-ui';c.fillStyle=stump.thorns?'#633d38':'#234e43';c.fillText(text,x,index>0?y-ry-23:y+height+ry+19);
  if(stump.reinforced||stump.guarded)this.ellipse(x,y,r+2,ry+2,null,stump.guarded?'#cceff2':'#d6f2ff',2.5*s);
 }
 lily(game,stump,index,projection){
  const c=this.ctx,{s}=projection,{r,ry,x,y,submerge}=this.platformFrame(game,stump,projection),height=r*.12;c.save();c.globalAlpha=1-submerge;
  this.ellipse(x+3*s,y+6*s,r*1.04,ry,'#2d696c22');this.ellipse(x,y+8*s,r*1.14,ry*1.07,null,'#d5efdc88',1.5);
  const top=c.createRadialGradient(x-r*.3,y-ry*.3,1,x,y,r);top.addColorStop(0,'#b2da91');top.addColorStop(1,stump.sinking?'#648a5c':'#68a36e');
  c.beginPath();c.moveTo(x,y);c.ellipse(x,y,r,ry,0,.22,Math.PI*2-.22);c.closePath();c.fillStyle=top;c.fill();c.lineWidth=2.5*s;c.strokeStyle='#488264';c.stroke();
  for(let i=1;i<8;i++){const a=i*Math.PI/4;this.path(p=>{p.moveTo(x,y);p.lineTo(x+Math.cos(a)*r*.82,y+Math.sin(a)*ry*.82);},null,'#60955e88',1.2*s);}
  this.ellipse(x-r*.4,y-ry*.15,6*s,2*s,'#e9f7d49c');
  if(stump.id%3===0){const fx=x-r*.48,fy=y-ry*.72;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;this.ellipse(fx+Math.cos(a)*5*s,fy+Math.sin(a)*4*s,4*s,3*s,'#f1c2c8','#d497a3',.5);}this.ellipse(fx,fy,3*s,2*s,'#f7df9a');}
  this.surfaceMarks(game,stump,index,{s,r,ry,height,x,y});c.restore();
 }
 variant(game,pad,index,projection){
  const c=this.ctx,{s}=projection,{top,r,ry,x,y,submerge}=this.platformFrame(game,pad,projection),kind=pad.kind;
  const age=game.clock-game.landedAt,occupied=pad===game.current,landed=occupied&&age>=0,phase=this.reduced.matches?0:top.phase;
  c.save();c.globalAlpha=1-submerge;this.ellipse(x+3*s,y+12*s,r*1.07,ry*.95,'#285b642b');this.ellipse(x,y+12*s,r*1.14,ry,null,'#d4f3df88');
  if(kind==='lotus'){
   for(let i=0;i<8;i++){const a=i*Math.PI/4;this.ellipse(x+Math.cos(a)*r*.65,y+Math.sin(a)*ry*.65,r*.42,ry*.5,'#f3bdcf','#ae748d',1.5*s);}
   this.ellipse(x,y,r*.74,ry*.77,'#a6cd88','#528260',2*s);this.ellipse(x,y,r*.24,ry*.27,'#ffe4a2','#ca9b61',s);
  }else if(kind==='turtle'){
   const peek=landed?1-Math.sin(Math.PI*Math.min(1,age/600))*.65:1;
   for(const sign of [-1,1])for(const dy of [-1,1])this.ellipse(x+sign*r*.77,y+dy*ry*.68,r*.24,ry*.3,'#86b689','#476e60',s);
   this.ellipse(x+r*(.7+peek*.36),y-ry*.12,r*.3,ry*.48,'#b4d69b','#476e60',1.5*s);
   this.ellipse(x+r*(.8+peek*.36),y-ry*.27,2*s,2.8*s,'#334d44');
   this.ellipse(x,y+5*s,r,ry,'#4f8266','#42694f',2*s);this.ellipse(x,y,r,ry,'#a0bf78','#42694f',2*s);
   for(let i=0;i<6;i++){const a=i*Math.PI/3;this.path(p=>{p.moveTo(x,y);p.lineTo(x+Math.cos(a)*r*.85,y+Math.sin(a)*ry*.85);},null,'#668d59',1.5*s);}this.ellipse(x,y,r*.42,ry*.42,'#b9d38b','#668d59',s);
  }else if(kind==='mushroom'){
   const squash=landed&&!this.reduced.matches&&age<500?Math.sin(Math.PI*age/500)*.16:0;
   this.ellipse(x,y+ry*.3,r*.48,ry*.8,'#f8e9c9','#977d72',2*s);this.ellipse(x,y+6*s,r,ry*(1-squash),'#b26070','#7d5261',2*s);this.ellipse(x,y,r*(1+squash*.2),ry*(1-squash),'#f49d9e','#9e5969',2*s);
   for(const [dx,dy,k] of [[-.5,-.2,.2],[.35,.2,.24],[.15,-.5,.14]])this.ellipse(x+dx*r,y+dy*ry,r*k,ry*k,'#fff2d4');
  }else if(kind==='duck'){
   this.ellipse(x,y+5*s,r,ry,'#dbb356','#9d814d',2*s);this.ellipse(x,y,r,ry,'#ffe69b','#ab8c54',2*s);
   this.ellipse(x-r*.76,y-ry*.55,r*.34,ry*.75,'#ffe9a8','#ab8c54',1.5*s);this.ellipse(x-r*.98,y-ry*.42,r*.18,ry*.21,'#ecad6a','#ad7c4c',s);this.ellipse(x-r*.78,y-ry*.74,2.5*s,3*s,'#434e47');this.ellipse(x-r*.68,y-ry*.42,3*s,2*s,'#f0b3a3');
   this.path(p=>{p.moveTo(x+r*.8,y-ry*.3);p.lineTo(x+r*1.08,y-ry*.85);p.lineTo(x+r*.95,y+ry*.2);},'#ffe69b','#ab8c54',s);
  }else if(kind==='ice'){
   this.ellipse(x,y+9*s,r,ry,'#80bcc8','#59899b',2*s);this.ellipse(x,y,r,ry,'#d7f6f2','#76a9bd',2*s);
   const elapsed=occupied&&pad.sinking?1-game.sinkRemaining/3500:0,cracks=Math.min(3,1+Math.floor(elapsed*3));
   for(let i=0;i<cracks;i++){const a=i*2.1+.3;this.path(p=>{p.moveTo(x+Math.cos(a)*r*.9,y+Math.sin(a)*ry*.9);p.lineTo(x+Math.cos(a+.3)*r*.35,y+Math.sin(a+.3)*ry*.35);p.lineTo(x-5*s,y+3*s);},null,'#6d9fb7',2*s);}this.ellipse(x-r*.45,y-ry*.25,r*.19,ry*.16,'#ffffffbb');
  }else if(kind==='spinner'){
   this.ellipse(x,y+4*s,r,ry,'#629a73','#49785f',2*s);this.ellipse(x,y,r,ry,'#add994','#49785f',2*s);
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5+phase*.4;this.path(p=>{p.moveTo(x,y);p.quadraticCurveTo(x+Math.cos(a+.5)*r*.5,y+Math.sin(a+.5)*ry*.5,x+Math.cos(a)*r*.96,y+Math.sin(a)*ry*.96);},null,'#598d67',2*s);}this.ellipse(x,y,5*s,3*s,'#d7eba3');
  }else if(kind==='shell'){
   const open=landed?Math.min(1,age/400):.15;
   this.ellipse(x,y-ry*(.15+open*.4),r,ry*(1+open*.5),'#e7bed9','#9b789d',2*s);
   for(let i=-2;i<=2;i++)this.path(p=>{p.moveTo(x,y+ry*.5);p.quadraticCurveTo(x+i*r*.3,y-ry*.6-open*ry*.7,x+i*r*.36,y-ry*(.45+open*.5));},null,'#b18bab',s);
   this.ellipse(x,y+4*s,r,ry,'#f3d4df','#a67a92',2*s);this.ellipse(x,y,r*.83,ry*.67,'#fff0dc');
   if(!landed||game.jump?.error<=top.r*.25)this.ellipse(x,y,7*s,5*s,'#fffcea','#c5b4cf',s);
   for(const sign of [-1,1])this.ellipse(x+sign*r*.63,y,2*s,2.5*s,'#765d76');
   this.path(p=>{p.moveTo(x-4*s,y+7*s);p.quadraticCurveTo(x,y+(landed&&game.jump?.error>top.r*.25?3:11)*s,x+4*s,y+7*s);},null,'#9b6d84',s);
  }
  this.surfaceMarks(game,pad,index,{s,r,ry,height:12*s,x,y});c.restore();
 }
 animal(x,y,scale,kind,pose={}){
  // A bounded phase atlas: continuous transforms are cheap; full vector art is cached.
  const motion=motionFor(kind);let stage='idle',frame=0,quantized={};
  if(pose.airborne){stage='flight';frame=Math.round((pose.flightPhase??.5)*23);const t=frame/23;quantized={squat:.5*(1-clamp(t/.18)),stretch:Math.sin(Math.PI*t)*.8,kick:Math.sin(Math.PI*clamp(t/.4))*motion.kick,tuck:Math.sin(Math.PI*clamp((t-.18)/.64)),reach:Math.sin(Math.PI*clamp((t-.65)/.35)),lean:Math.sin(Math.PI*t)*motion.sway,airborne:true};}
  else if(pose.fall){stage='fall';frame=Math.round(pose.fall*7);quantized={fall:frame/7,lean:(pose.direction==='long'?1:-1)*frame*.065,airborne:true};}
  else if(pose.landingPhase!==null&&pose.landingPhase!==undefined){stage='land';frame=Math.round(pose.landingPhase*5);quantized={squat:Math.sin(Math.PI*frame/5)*.5*motion.settle,blink:frame<2?.6:0};}
  else{frame=Math.round((pose.squat||0)*7);stage=frame?'charge':'idle';quantized={squat:frame/7*motion.spring};}
  if(pose.anchorFeet)quantized.noShadow=true;const key=kind+'|'+stage+'|'+frame+(stage==='fall'?'|'+pose.direction:'')+(pose.anchorFeet?'|feet':'');let sprite=this.animalCache.get(key);
  if(!sprite){
   sprite=this.layer(128,144);sprite.sole=pose.anchorFeet?soleOffset(kind,quantized):0;const previous=this.ctx;this.ctx=sprite.ctx;
   try{this.paintAnimal(64,100,1,kind,quantized);}finally{this.ctx=previous;}
   if(this.animalCache.size>=48)this.animalCache.delete(this.animalCache.keys().next().value);
   this.animalCache.set(key,sprite);
  }
  // Keep frequently reused charge/idle poses hot when jump poses fill the cache.
  this.animalCache.delete(key);this.animalCache.set(key,sprite);
  this.ctx.drawImage(sprite.canvas,x-64*scale,y-(100+sprite.sole)*scale,128*scale,144*scale);
 }
 paintRiverCompanion(x,y,scale,id){paintRiverCompanion(this,x,y,scale,id);}
 riverCompanion(game,projection){if(!game.companion)return;let sprite=this.companionCache.get(game.companion);if(!sprite){sprite=this.layer(100,80);const prev=this.ctx;this.ctx=sprite.ctx;try{paintRiverCompanion(this,50,40,1,game.companion);}finally{this.ctx=prev;}this.companionCache.set(game.companion,sprite);}const {s,point}=projection,p=point(game.current),c=this.ctx;c.save();c.globalAlpha=game.companionReady?.85:.35;c.drawImage(sprite.canvas,p.x-110*s,p.y-10*s,75*s,60*s);c.restore();}
 prepareAnimal(kind){for(let i=0;i<24;i++)this.animal(-1000,-1000,1,kind,{airborne:true,flightPhase:i/23,anchorFeet:true});for(let i=0;i<8;i++)this.animal(-1000,-1000,1,kind,{squat:i/7,anchorFeet:true});for(let i=0;i<6;i++)this.animal(-1000,-1000,1,kind,{landingPhase:i/5,anchorFeet:true});}
 paintAnimal(x,y,scale,kind,pose){
  if(NEW_FRIENDS.has(kind)){paintNewFriend(this,x,y,scale,kind,pose);return;}
  if(kind==='frog'){this.frog(x,y,scale,pose);return;}
  if(kind==='mochi'){this.mochi(x,y,scale,pose);return;}
  if(ISLAND_HEAD_HEIGHT[kind]){paintIslandFriend(this,x,y,scale,kind,pose);return;}
  if(['chiikawa','hachiware','usagi'].includes(kind)){this.comicFriend(x,y,scale,kind,pose);return;}
  const {squat=0,stretch=0,kick=0,tuck=0,reach=0,blink=0,lean=0,fall=0,airborne=false,noShadow=false}=pose,c=this.ctx,ink='#4b514b';c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.15-stretch*.07)*(1-fall*.55),scale*(1-squat*.2+stretch*.1)*(1-fall*.55));
  if(!airborne&&!noShadow)this.ellipse(0,2,23,5,'#31543733');
  if(kind==='monkey'||kind==='cat')this.path(p=>{p.moveTo(16,-8);p.bezierCurveTo(44,0,41,-36,30,-30);p.quadraticCurveTo(24,-26,32,-22);},null,kind==='cat'?'#b57d4f':'#9f7655',5);
  if(kind==='fox'){this.path(p=>{p.moveTo(12,-8);p.quadraticCurveTo(53,6,37,-39);p.quadraticCurveTo(26,-27,21,-28);p.closePath();},'#d98750',ink,1.5);this.path(p=>{p.moveTo(37,-39);p.lineTo(29,-28);p.lineTo(40,-22);p.closePath();},'#fff1d9');}
  const penguin=kind==='penguin',bunny=kind==='bunny',duck=kind==='duck',panda=kind==='panda',pointy=kind==='cat'||kind==='fox',capy=kind==='capybara',[body,light,dark]=ANIMAL_ART[kind]??ANIMAL_ART.otter;
  for(const sign of [-1,1]){const footX=sign*(13+kick*7-tuck*5),footY=kick*13-tuck*4;this.ellipse(footX,footY,penguin||duck?11:9,4,penguin||duck?'#e6ac59':panda?'#535952':body,ink,1.5);}
  const shade=c.createRadialGradient(-8,-31,2,0,-13,29);shade.addColorStop(0,light);shade.addColorStop(.2,body);shade.addColorStop(1,dark);this.ellipse(0,-19,penguin?21:22,24,shade,ink,1.8);this.ellipse(0,-15,14,18,light);
  if(!penguin&&!duck)for(const sign of [-1,1]){const earX=sign*(bunny?10:capy?15:19),earY=bunny?-51:capy?-43:-34;if(pointy){this.path(p=>{p.moveTo(sign*10,-38);p.lineTo(sign*22,-54);p.lineTo(sign*25,-29);p.closePath();},body,ink,1.6);this.path(p=>{p.moveTo(sign*15,-37);p.lineTo(sign*21,-47);p.lineTo(sign*22,-33);p.closePath();},'#efb9b8');}else{this.ellipse(earX,earY,bunny?6:capy?5:8,bunny?17:capy?6:8,panda?'#535952':body,ink,1.6);this.ellipse(earX,earY,bunny?3:capy?2.5:4,bunny?11:capy?3:4,'#efb9b8');}}
  if(duck)this.path(p=>{p.moveTo(-4,-46);p.quadraticCurveTo(-7,-58,3,-49);p.quadraticCurveTo(9,-56,8,-45);},body,ink,1.5);
  this.ellipse(0,-28,penguin?18:capy?24:22,19,body,ink,1.8);this.ellipse(0,capy?-22:-25,penguin?14:capy?19:17,capy?11:13,light);
  if(panda)for(const sign of [-1,1])this.ellipse(sign*9,-31,6,8,'#535952');
  for(const sign of [-1,1]){if(panda)this.ellipse(sign*8,-31,3.8,Math.max(1,4.8*(1-blink)),'#fff9eb');this.ellipse(sign*8,-31,panda?2:3,Math.max(1,(panda?3:4)*(1-blink)),ink);this.ellipse(sign*14,-23,4,2,'#eeb3a5');}
  if(duck){this.ellipse(0,-23,9,4,'#e6a14c',ink,1);this.path(p=>{p.moveTo(-5,-22);p.lineTo(5,-22);},null,ink,1);}else if(penguin)this.path(p=>{p.moveTo(-5,-26);p.lineTo(0,-20);p.lineTo(5,-26);p.closePath();},'#e6ac59',ink,1);else{this.ellipse(0,-24,bunny?2:capy?5:3,2,'#8b6256');this.path(p=>{p.moveTo(-5,-20);p.quadraticCurveTo(0,-15,5,-20);},null,ink,1.5);}
  if(capy){c.fillStyle='#fff9e6';c.fillRect(-3,-17,6,4);this.path(p=>{p.moveTo(0,-17);p.lineTo(0,-13);},null,'#8d775e',1);}
  if(kind==='otter'||kind==='cat')for(const side of [-1,1])for(const dy of [-2,2])this.path(p=>{p.moveTo(side*7,-22+dy);p.lineTo(side*19,-23+dy*1.4);},null,'#805f4f',1);
  if(kind==='cat')for(const x of [-6,0,6])this.path(p=>{p.moveTo(x,-45);p.lineTo(x*.7,-38);},null,'#9e6a43',2);
  for(const sign of [-1,1])this.path(p=>{p.moveTo(sign*18,-19);p.quadraticCurveTo(sign*(29+kick*2),-15-reach*8,sign*(24+stretch*4),-6+kick*5-reach*14);},null,penguin?'#59768c':panda?'#535952':body,penguin?7:6);
  if(penguin){this.path(p=>{p.moveTo(-14,-17);p.quadraticCurveTo(0,-11,14,-17);},null,'#b6dbe4',5);this.path(p=>{p.moveTo(10,-16);p.lineTo(15,-3);},null,'#b6dbe4',5);}c.restore();
 }
 comicFriend(x,y,scale,kind,{squat=0,stretch=0,kick=0,tuck=0,reach=0,blink=0,lean=0,fall=0,airborne=false,noShadow=false}={}){
  const c=this.ctx,ink='#675861',cat=kind==='hachiware',rabbit=kind==='usagi',body=rabbit?'#fff0b8':'#fffaf4',blue='#a9cceb',pink=rabbit?'#efbd9f':'#efb8c9';
  c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.16-stretch*.06)*(1-fall*.55),scale*(1-squat*.21+stretch*.1)*(1-fall*.55));
  if(!airborne&&!noShadow)this.ellipse(0,2,23,5,'#31543722');
  if(cat)this.path(p=>{p.moveTo(13,-5);p.bezierCurveTo(35,0,37,-19,28,-23);},null,blue,6);
  for(const side of [-1,1]){
   this.ellipse(side*(10+kick*7-tuck*4),kick*11-tuck*4,7,4,body,ink,1.3);
   if(cat){this.path(p=>{p.moveTo(side*13,-44);p.lineTo(side*26,-65);p.quadraticCurveTo(side*32,-53,side*27,-34);p.closePath();},blue,ink,1.6);this.path(p=>{p.moveTo(side*20,-47);p.lineTo(side*25,-58);p.lineTo(side*27,-43);p.closePath();},pink);}
   else{this.ellipse(side*(rabbit?11:20),rabbit?-61:-52,rabbit?7:8,rabbit?20:9,body,ink,1.6);this.ellipse(side*(rabbit?11:20),rabbit?-62:-52,rabbit?3.4:4,rabbit?13:4.5,pink);}
  }
  this.ellipse(0,-15,17,20,body,ink,1.6);
  for(const side of [-1,1])this.path(p=>{p.moveTo(side*16,-19);p.quadraticCurveTo(side*(27+kick*2),-15-reach*9,side*21,-7+kick*5-reach*12);},null,body,6);
  this.ellipse(0,-34,28,23,cat?blue:body,ink,1.8);
  if(cat){this.ellipse(0,-27,25,17,body);this.path(p=>{p.moveTo(0,-53);p.quadraticCurveTo(-4,-42,-13,-34);p.lineTo(13,-34);p.quadraticCurveTo(4,-42,0,-53);p.closePath();},body);}
  for(const side of [-1,1]){
   const eye=side*10;this.ellipse(eye,-35,rabbit?3.2:3,Math.max(.8,(rabbit?3.8:4.6)*(1-blink)),ink);
   if(blink<.6)this.ellipse(eye-.8,-37,1.1,1.3,'#fff');
   this.ellipse(side*18,-27,5,2.8,pink);
   for(let i=0;i<2;i++)this.path(p=>{p.moveTo(side*(16+i*3),-28);p.lineTo(side*(17+i*3),-25);},null,'#ce8fa3',.65);
   if(rabbit)this.path(p=>{p.moveTo(side*6,-44);p.quadraticCurveTo(side*11,-48,side*15,-43);},null,ink,1.5);
   else if(!cat)this.path(p=>{p.moveTo(side*6,-44);p.quadraticCurveTo(side*11,-45-squat*2,side*15,-42);},null,ink,1);
  }
  if(cat){this.path(p=>{p.moveTo(-6,-27);p.quadraticCurveTo(0,-23,6,-27);p.quadraticCurveTo(3,-15,0,-16);p.quadraticCurveTo(-3,-15,-6,-27);p.closePath();},'#b37685',ink,1.2);this.ellipse(0,-20,3,1.6,'#efb4c4');}
  else{this.path(p=>{p.moveTo(-5,-27);p.quadraticCurveTo(-2,-22,0,-26);p.quadraticCurveTo(2,-22,5,-27);},null,ink,1.4);if(rabbit&&airborne)this.ellipse(0,-20,3,3.5,'#bd7e77',ink,1);}
  if(!cat&&!rabbit){for(const side of [-1,1])this.ellipse(side*14,-32,1.6,2.7,'#d4e9ee');this.ellipse(0,-7,4,3,'#f0c8d3');}
  if(rabbit){this.path(p=>{p.moveTo(-4,-9);p.quadraticCurveTo(0,-4,4,-9);},null,'#d7ae63',1.2);}
  c.restore();
 }
 mochi(x,y,scale,{squat=0,stretch=0,kick=0,tuck=0,reach=0,blink=0,lean=0,fall=0,airborne=false,noShadow=false}={}){
  const c=this.ctx,ink='#725b61';c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.15-stretch*.06)*(1-fall*.55),scale*(1-squat*.2+stretch*.1)*(1-fall*.55));
  if(!airborne&&!noShadow)this.ellipse(0,2,24,5,'#31543722');
  for(const side of [-1,1]){this.ellipse(side*(12+kick*7-tuck*4),kick*10-tuck*4,8,4,'#f1d9d5',ink,1.3);this.ellipse(side*18,-47,9,10,'#fff5ed',ink,1.5);this.ellipse(side*18,-47,4.5,5,'#edbabb');}
  this.ellipse(0,-17,22,22,'#fff8ef',ink,1.6);this.ellipse(0,-33,27,22,'#fff8ef',ink,1.7);
  for(const side of [-1,1]){this.ellipse(side*10,-35,3,Math.max(.8,4.2*(1-blink)),ink);if(blink<.6)this.ellipse(side*10-1,-37,1,1.2,'#fff');this.ellipse(side*18,-27,5,3,'#edb8be');this.path(p=>{p.moveTo(side*20,-18);p.quadraticCurveTo(side*31,-16-reach*9,side*22,-8+kick*4-reach*12);},null,'#edcfca',6);}
  this.path(p=>{p.moveTo(-5,-28);p.quadraticCurveTo(-2,-22,0,-27);p.quadraticCurveTo(2,-22,5,-28);},null,ink,1.5);
  this.path(p=>{p.moveTo(-18,-15);p.lineTo(13,1);},null,'#9fbfbd',3);this.ellipse(5,-5,10,8,'#b5d5cc',ink,1.2);
  this.path(p=>{for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3:6;(i?p.lineTo.bind(p):p.moveTo.bind(p))(5+Math.cos(a)*r,-6+Math.sin(a)*r);}p.closePath();},'#f7d97b',ink,.7);c.restore();
 }
 coin(x,y,scale){
  const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);this.ellipse(0,1,17,17,'#b87816');this.ellipse(0,-1,16,16,'#f5c94e','#9a6512',1.5);this.ellipse(0,-1,12,12,'#ffe39a','#daa329',1);
  this.ellipse(0,2,9,7,'#e8b63d','#9a6512',1);for(const sign of [-1,1]){this.ellipse(sign*5,-5,4,4,'#e8b63d','#9a6512',1);this.ellipse(sign*5,-5,1.5,1.5,'#805418');}this.path(p=>{p.moveTo(-4,3);p.quadraticCurveTo(0,8,4,3);},null,'#805418',1.5);c.restore();
 }
 splash(game,projection){const age=game.clock-game.fall.at;if(age>800)return;const c=this.ctx,{s,point}=projection,p=point(game.fall),t=clamp(age/800);c.save();c.globalAlpha=1-t;this.ellipse(p.x,p.y+5*s,(18+t*45)*s,(6+t*16)*s,null,'#efffe7',2.5*s);for(let i=0;i<8;i++){const a=i*Math.PI/4,spread=10+t*48;this.ellipse(p.x+Math.cos(a)*spread*s,p.y+Math.sin(a)*spread*.27*s-Math.sin(Math.PI*clamp(t/.7))*(15+i%3*5)*s,2.5*s,4*s,'#def5e7');}c.restore();}
 skillEffect(game,projection){const e=this.skill;if(!e||this.reduced.matches)return;const age=game.clock-e.at;if(age<0||age>650)return;const {s,point}=projection,c=this.ctx,p=point(e.point),t=age/650,colors={frog:'#d7f1a8',penguin:'#e0f7ff',bunny:'#ffe1e8',monkey:'#e8e5a1',otter:'#c9f1ed'};c.save();c.globalAlpha=1-t;this.ellipse(p.x,p.y,(e.radius+10+t*24)*s,(e.radius+10+t*24)*s*.43,null,(colors[e.animal]??species(e.animal).color),3*s);for(let i=0;i<6;i++){const a=i*Math.PI/3;this.ellipse(p.x+Math.cos(a)*(e.radius+10+t*20)*s,p.y+Math.sin(a)*(e.radius+10+t*20)*s*.43,3*s,2*s,(colors[e.animal]??species(e.animal).color));}c.restore();}

 frog(x,y,scale,{squat=0,stretch=0,kick=0,tuck=0,reach=0,blink=0,airborne=false,lean=0,fall=0,noShadow=false}={}){
  const c=this.ctx;c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.2-stretch*.08)*(1-fall*.55),scale*(1-squat*.24+stretch*.12)*(1-fall*.55));
  if(!airborne&&!noShadow)this.ellipse(0,2,23+squat*3,5,'#31543733');
  // Hind legs extend after take-off and tuck back in before touchdown.
  for(const sign of [-1,1]){
   this.path(p=>{p.moveTo(sign*14,-14);p.quadraticCurveTo(sign*(31+kick*8-tuck*10),-14+kick*14-tuck*4,sign*(20+kick*10-tuck*11),-2+kick*19-tuck*10);},null,'#3c7047',8);
   const fx=sign*(19+kick*12-tuck*11),fy=kick*19-tuck*9;this.ellipse(fx,fy,11-tuck*2,4,'#79ac50','#355d40');
   for(let toe=-1;toe<=1;toe++)this.path(p=>{p.moveTo(fx+sign*4,fy+toe*1.1);p.lineTo(fx+sign*(11-Math.abs(toe)*2),fy+toe*2.3);},null,'#3d6d42',1.2);
  }
  const body=c.createRadialGradient(-8,-28,2,4,-14,27);body.addColorStop(0,'#b4df83');body.addColorStop(.55,'#85bd5f');body.addColorStop(1,'#508d4b');
  this.ellipse(0,-17,22,19,body,'#355c42',2);this.ellipse(0,-12,13,10,'#dceaaa');this.ellipse(-6,-24,6,3,'#daeeaf77');
  for(const sign of [-1,1]){const x=sign*11;this.ellipse(x,-32,10,11,body,'#355c42',2);this.ellipse(x,-34,5.5,6.5*(1-blink),'#fffce6');this.ellipse(x+1,-33-stretch,2.8,Math.max(.8,4*(1-blink)),'#244435');if(blink<.6)this.ellipse(x,-35-stretch,1.3,1.6,'#fff');this.ellipse(sign*17,-19,4,2.5,'#f3b6a3');}
  if(airborne&&kick>.5)this.ellipse(0,-15,3,4,'#355c42');else this.path(p=>{p.moveTo(-7,-18);p.quadraticCurveTo(0,-10-squat*2,7,-18);},null,'#355c42',2);
  this.path(p=>{p.moveTo(-19,-17);p.quadraticCurveTo(-27,-11-reach*10,-26-stretch*5,-5+kick*5-reach*16);p.moveTo(19,-17);p.quadraticCurveTo(27,-11-reach*10,26+stretch*5,-5+kick*5-reach*16);},null,'#4d8349',3);c.restore();
 }
 fishBody(x,y,scale,open=1){
  const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);
  this.path(p=>{p.moveTo(-34,0);p.lineTo(-61,-22);p.quadraticCurveTo(-54,0,-61,22);p.closePath();},'#7f9db1','#425b76',2);
  this.ellipse(0,0,43,34,'#809eb5','#425b76',2);this.ellipse(-16,-9,14,9,'#bed2d7');
  this.path(p=>{p.moveTo(-5,-27);p.bezierCurveTo(-12,-65,41,-72,34,-43);},null,'#425b76',3);this.ellipse(34,-43,8,9,'#ffeaa0','#a78a4e',1.5);
  this.ellipse(9,5,27,9+open*15,'#403549','#edb6aa',3);
  for(const x of [-9,2,13,24])for(const side of [-1,1])this.path(p=>{const y=5+side*(8+open*11);p.moveTo(x-4,y);p.lineTo(x,y-side*8);p.lineTo(x+4,y);p.closePath();},'#fff5df');
  for(const x of [-14,20]){this.ellipse(x,-20,9,10,'#fff6db','#425b76',1.5);this.ellipse(x+1,-19,3,4,'#35445b');this.ellipse(x,-22,1.5,1.5,'#fff');}this.ellipse(-28,2,5,3,'#e9b4bb');c.restore();
 }
 fishHazard(game,projection){
  const fish=game.fish;if(!fish)return;const {point,s}=projection,p=point(fish),c=this.ctx;
  c.save();this.ellipse(p.x,p.y+8*s,37*s,10*s,null,fish.phase==='warning'?'#ffe19b':'#d2ece6',2*s);
  if(fish.phase==='leaping'){
   this.fishBody(p.x,p.y-fish.lift*s,s*.85,1);
   for(const side of [-1,1])this.ellipse(p.x+side*24*s,p.y-(18+fish.progress*14)*s,2*s,6*s,'#dcf6ed');
  }else{
   const pulse=this.reduced.matches?1:.85+Math.sin(game.clock*.009)*.15;c.globalAlpha=fish.phase==='warning'?1:.65;
   this.ellipse(p.x,p.y-12*s,11*s*pulse,12*s*pulse,fish.phase==='warning'?'#ffe19b':'#d0eae3','#8a7255',1.5*s);
   c.font=`700 ${Math.max(12,15*s)}px system-ui`;c.textAlign='center';c.fillStyle='#634a39';c.fillText(fish.phase==='warning'?'!':'…',p.x,p.y-7*s);
  }c.restore();
 }
 angler(game,projection){
  const {point,s}=projection,fall=game.fall,fish=fall.fish??fall,p=point(fish),age=game.clock-fall.at,capture=clamp(age/260),c=this.ctx;
  this.fishBody(p.x,p.y-(fish.lift??0)*s,s*.85,1-clamp((age-220)/420));
  if(capture<1){c.save();c.globalAlpha=1-capture;this.animal(p.x,p.y-(fish.lift??0)*s+capture*15*s,s*.8*(1-capture*.7),game.animal,{fall:capture,airborne:true});c.restore();}
 }

 crocodile(game,projection){
  const c=this.ctx,{point,s}=projection,f=game.fall,p=point(f),age=game.clock-f.at,t=clamp(age/DROWN_MS),capture=clamp(age/240),open=1-clamp((age-200)/420),k=Math.min(.8,Math.max(.46,s*.86));
  // The open mouth is present on the first failed-landing frame; no splash delay.
  c.save();c.translate(Math.max(46,Math.min(this.width-46,p.x)),p.y-Math.sin(Math.PI*t)*8);c.scale(k,k);
  this.ellipse(0,23,55,9,'#32645933');
  this.path(p=>{p.moveTo(-35,14);p.quadraticCurveTo(-68,28,-57,-5);p.quadraticCurveTo(-45,7,-30,1);},'#e77770','#713f42',2);
  this.ellipse(0,5,45,30,'#ed8980','#713f42',2.5);this.ellipse(0,16,33,14,'#ffc4a2');
  for(const sign of [-1,1])this.ellipse(sign*39,22,12,6,'#dc716b','#713f42',1.5);
  this.ellipse(0,2,33,5+open*24,'#533642','#713f42',2);this.ellipse(0,14+open*6,16,4,'#ee9994');
  for(const x of [-20,-7,7,20])this.path(p=>{p.moveTo(x-4,-open*22);p.quadraticCurveTo(x,-open*22+12,x+4,-open*22);p.closePath();},'#fff3d5','#a16760',.7);
  for(const sign of [-1,1]){this.ellipse(sign*20,-24-open*11,13,13,'#f5a595','#713f42',2);this.ellipse(sign*20,-25-open*11,8,8,'#fff7d5');this.ellipse(sign*20+1,-24-open*11,3,5,'#493542');this.ellipse(sign*20-2,-28-open*11,2,2,'#fff');this.ellipse(sign*35,1,7,4,'#f8b8af');}
  // The selected animal drops straight into the mouth and is hidden by its lower lip.
  if(capture<1){c.save();c.globalAlpha=1-capture;this.animal(0,-13+capture*28,.7*(1-capture*.7),game.animal,{fall:capture,airborne:true});c.restore();}
  this.path(p=>{p.moveTo(-34,15+open*9);p.quadraticCurveTo(0,35+open*4,34,15+open*9);},null,'#e87971',7);
  for(const x of [-20,-7,7,20])this.path(p=>{const y=16+open*7;p.moveTo(x-4,y);p.quadraticCurveTo(x,y-12,x+4,y);p.closePath();},'#fff3d5','#a16760',.7);
  for(const sign of [-1,1])this.ellipse(sign*9,-27-open*4,2,1.5,'#a65a57');
  c.restore();
 }

 draw(game){
  this.water();for(const id of this.padCache.keys())if(!game.stumps.some(p=>p.id===id))this.padCache.delete(id);const projection=this.projection(game),{s,point}=projection;
  this.ripples(game,projection);this.riverCompanion(game,projection);
  if(game.routeOffer){const alternate=point(game.routeOffer),c=this.ctx;c.save();c.globalAlpha=.5;this.ellipse(alternate.x,alternate.y,game.target.r*s*.8,game.target.r*s*.35,'#e9ce83','#8c784f',2*s);c.restore();}
  if(game.riverFriend){const c=this.ctx,q=point(game.target),key='visitor-'+game.riverFriend;let sprite=this.companionCache.get(key);if(!sprite){sprite=this.layer(64,64);const prev=this.ctx;this.ctx=sprite.ctx;try{paintRiverVisitor(this,32,32,1,game.riverFriend);}finally{this.ctx=prev;}this.companionCache.set(key,sprite);}c.drawImage(sprite.canvas,q.x+game.target.r*s+3*s,q.y-46*s,48*s,48*s);if(game.riverFriend==='firefly'||game.target.mailChallenge)this.ellipse(q.x,q.y,6*s,3*s,'#f8e7a4');if(game.riverFriend==='dragonfly'&&game.target.kind==='turtle'){c.save();c.font=`${16*s}px system-ui`;c.fillStyle='#466a58';c.fillText(surface(game.target,game.clock+100).x>surface(game.target,game.clock).x?'→':'←',q.x+game.target.r*s+15*s,q.y+18*s);c.restore();}}
  for(let i=2;i>=0;i--)this.stump(game,game.stumps[i],i,projection);
  if(!['over','drowning'].includes(game.state))this.fishHazard(game,projection);
  const frog=game.frog,p=['over','drowning'].includes(game.state)?point(frog):this.riderContact(game,projection,frog);
  if(!['over','drowning'].includes(game.state)){
   if(game.state==='jumping'){
    const height=clamp(frog.lift/180),c=this.ctx;c.save();c.globalAlpha=.23-height*.12;this.ellipse(p.x,p.y,23*s*(1-height*.4),6*s*(1-height*.35),'#234d48');c.restore();
   }
   if(game.state!=='jumping')this.ellipse(p.x,p.y+1*s,21*s,3.5*s,'#31543740');
   const pose=this.reduced.matches?{...frog,squat:game.state==='charging'?game.power:0,stretch:0,kick:0,tuck:0,reach:0,blink:0}:frog;
   this.animal(p.x,p.y-frog.lift*s,s*1.12,game.animal,{...pose,anchorFeet:true,airborne:game.state==='jumping'});
  }else{
   const age=game.clock-game.fall.at,t=clamp(age/SPLASH_MS),c=this.ctx;
   if(game.fall.reason==='angler'&&game.fall.airborne){this.angler(game,projection);}
   else if(game.fall.reason==='angler'){if(age<SPLASH_MS){c.save();c.globalAlpha=1-t;this.animal(p.x,p.y+t*25*s,s*1.12,game.animal,{fall:t});c.restore();}this.splash(game,projection);if(age>=SPLASH_MS)this.angler(game,projection);}
   else{if(age<SPLASH_MS){c.save();c.globalAlpha=1-t;const v=game.fall.velocity??{x:0,y:0},drift=age*(1-t*.5);this.animal(p.x+v.x*drift*s,p.y-v.y*drift*s*.74+t*25*s,s*1.12,game.animal,{fall:t,direction:game.fall.reason});c.restore();}this.splash(game,projection);if(age>=SPLASH_MS)this.crocodile(game,projection);}
  }
  if((game.fishShield||game.state==='jumping'&&game.jump.shield)&&!['drowning','over'].includes(game.state))this.ellipse(p.x,p.y-frog.lift*s-24*s,34*s,38*s,null,'#f8dd84',2.5*s);
  this.skillEffect(game,projection);
  if(this.effect?.coins&&game.clock-this.effect.at<650){const t=clamp((game.clock-this.effect.at)/650),p=point(this.effect.point),c=this.ctx;c.save();c.globalAlpha=1-t;c.textAlign='center';c.font='700 17px system-ui';c.fillStyle='#fff3b5';c.strokeStyle='#76613d';c.lineWidth=3;const text=`+${this.effect.coins}`;c.strokeText(text,p.x-10*s,p.y-(65+t*24)*s);c.fillText(text,p.x-10*s,p.y-(65+t*24)*s);this.coin(p.x+17*s,p.y-(71+t*24)*s,.5*s);if(this.effect.milestone){c.font='700 12px system-ui';const label=this.zh?'里程碑 +10':'Milestone +10';c.strokeText(label,p.x,p.y-(90+t*24)*s);c.fillText(label,p.x,p.y-(90+t*24)*s);}c.restore();}
  const headHeight=ISLAND_HEAD_HEIGHT[game.animal]??(NEW_FRIENDS.has(game.animal)?105:game.animal==='usagi'?91:['chiikawa','hachiware'].includes(game.animal)?75:game.animal==='bunny'?80:['fox','cat'].includes(game.animal)?66:game.animal==='duck'?64:game.animal==='mochi'?72:60);
  this.headAnchor={x:p.x,y:p.y-frog.lift*s-headHeight*s*(1-frog.squat*.24)};
  if(!this.reduced.matches&&this.effect&&game.clock-this.effect.at<260){const t=clamp((game.clock-this.effect.at)/260),spot=point(game.current),c=this.ctx;c.save();c.globalAlpha=(1-t)*.45;for(const sign of [-1,1]){const x=spot.x+sign*24*s;this.path(p=>{p.moveTo(x-sign*3*s,spot.y+4*s);p.quadraticCurveTo(x,spot.y+7*s,x+sign*(5+t*6)*s,spot.y+3*s);},null,'#f4efc2',1.5*s);}c.restore();}
 }
}
