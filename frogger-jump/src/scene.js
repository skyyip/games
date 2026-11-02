import {CAMERA_MS,SINK_MS,DROWN_MS,FISH_WARNING_MS,SPLASH_MS} from './game.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
export class RiverScene{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.width=400;this.height=500;this.zoom=null;this.currentId=null;this.effect=null;this.launch=null;this.skill=null;this.zh=true;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');}
 resize(width,height){this.width=Math.max(1,width);this.height=Math.max(1,height);const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(width*dpr);this.canvas.height=Math.round(height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.zoom=null;}
 reset(){this.zoom=null;this.currentId=null;this.effect=null;this.launch=null;this.skill=null;}
 ellipse(x,y,rx,ry,fill,stroke=null,line=1.5){const c=this.ctx;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
 path(points,fill,stroke=null,line=1.5){const c=this.ctx;c.beginPath();points(c);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
 projection(game){
  const span=game.stumps[2].y-game.current.y,fit=Math.min(this.width/425,(this.height*.7-12)/(span*.74+80),1.5);
  if(this.zoom===null){this.zoom=fit;this.zoomFrom=fit;this.zoomTarget=fit;this.currentId=game.current.id;}
  if(this.currentId!==game.current.id){this.zoomFrom=this.zoom;this.zoomTarget=fit;this.currentId=game.current.id;}
  const t=clamp((game.clock-game.cameraAt)/CAMERA_MS);this.zoom=mix(this.zoomFrom,this.zoomTarget,t*t*(3-2*t));
  const s=this.zoom;return {s,point:p=>({x:this.width/2+p.x*s,y:this.height*.79-(p.y-game.camera)*s*.74})};
 }
 shake(game,stump){if(this.reduced.matches||stump.id!==game.current.id||!stump.sinking||game.deadline===null)return {x:0,y:0};const urgency=1-clamp(game.sinkRemaining/SINK_MS);return {x:Math.sin(game.clock*.042)*(1+urgency*2),y:Math.sin(game.clock*.056)*urgency*1.5};}
 impact(game,stump){const age=game.clock-game.landedAt;return !this.reduced.matches&&stump===game.current&&age>=0&&age<420?Math.sin(Math.PI*age/420)*Math.exp(-age/180)*3:0;}
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

 water(game){
  const c=this.ctx,w=this.width,h=this.height;c.clearRect(0,0,w,h);
  // Flat geometry and bounded wave strokes; no blur, particles or image textures.
  for(let i=0;i<10;i++){const y=(i*.119+.045)%1*h,x=(i*93%311)/311*w,shift=this.reduced.matches?0:Math.sin(game.clock*.00055+i)*5;c.strokeStyle=i%2?'#d0efde66':'#4f9d8f33';c.lineWidth=2;c.beginPath();c.moveTo(x-35+shift,y);c.bezierCurveTo(x-15+shift,y-4,x+5+shift,y+5,x+28+shift,y);c.stroke();}
  for(let i=0;i<6;i++){const right=i%2,x=right?w-12-(i*23%26):13+i*7%19,y=h*(.15+i*.14);this.ellipse(x,y,15+i%3*3,7,'#649c78');this.path(p=>{p.moveTo(x,y);p.lineTo(x+14,y-5);p.lineTo(x+10,y+5);},'#83b18a');if(i%3===0)this.ellipse(x-2,y-2,3,2,'#f6d6a0');}
 }
 stump(game,stump,index,projection){
  if(stump.kind==='lily'){this.lily(game,stump,index,projection);return;}
  const c=this.ctx,{s,point}=projection,p=point(stump),shake=this.shake(game,stump),submerge=stump.id===game.current.id&&stump.sinking&&game.deadline!==null?clamp((game.clock-game.deadline)/500):0,r=stump.r*s,ry=r*.43,height=r*.95,x=p.x+shake.x,y=p.y+shake.y+submerge*65*s+this.impact(game,stump)*s;c.save();c.globalAlpha=1-submerge;
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
  const c=this.ctx,{s,point}=projection,p=point(stump),shake=this.shake(game,stump),submerge=stump===game.current&&stump.sinking&&game.deadline!==null?clamp((game.clock-game.deadline)/500):0,r=stump.r*s,ry=r*.43,height=r*.12,x=p.x+shake.x,y=p.y+shake.y+this.impact(game,stump)*s*1.5+submerge*65*s;c.save();c.globalAlpha=1-submerge;
  this.ellipse(x+3*s,y+6*s,r*1.04,ry,'#2d696c22');this.ellipse(x,y+8*s,r*1.14,ry*1.07,null,'#d5efdc88',1.5);
  const top=c.createRadialGradient(x-r*.3,y-ry*.3,1,x,y,r);top.addColorStop(0,'#b2da91');top.addColorStop(1,stump.sinking?'#648a5c':'#68a36e');
  c.beginPath();c.moveTo(x,y);c.ellipse(x,y,r,ry,0,.22,Math.PI*2-.22);c.closePath();c.fillStyle=top;c.fill();c.lineWidth=2.5*s;c.strokeStyle='#488264';c.stroke();
  for(let i=1;i<8;i++){const a=i*Math.PI/4;this.path(p=>{p.moveTo(x,y);p.lineTo(x+Math.cos(a)*r*.82,y+Math.sin(a)*ry*.82);},null,'#60955e88',1.2*s);}
  this.ellipse(x-r*.4,y-ry*.15,6*s,2*s,'#e9f7d49c');
  if(stump.id%3===0){const fx=x-r*.48,fy=y-ry*.72;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;this.ellipse(fx+Math.cos(a)*5*s,fy+Math.sin(a)*4*s,4*s,3*s,'#f1c2c8','#d497a3',.5);}this.ellipse(fx,fy,3*s,2*s,'#f7df9a');}
  this.surfaceMarks(game,stump,index,{s,r,ry,height,x,y});c.restore();
 }
 animal(x,y,scale,kind,pose){
  if(kind==='frog'){this.frog(x,y,scale,pose);return;}
  const {squat=0,stretch=0,kick=0,tuck=0,reach=0,blink=0,lean=0,fall=0,airborne=false}=pose,c=this.ctx,ink='#4b514b';c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.15-stretch*.07)*(1-fall*.55),scale*(1-squat*.2+stretch*.1)*(1-fall*.55));
  if(!airborne)this.ellipse(0,2,23,5,'#31543733');
  if(kind==='monkey')this.path(p=>{p.moveTo(16,-8);p.bezierCurveTo(44,0,41,-36,30,-30);p.quadraticCurveTo(24,-26,32,-22);},null,'#9f7655',5);
  const penguin=kind==='penguin',bunny=kind==='bunny',body=penguin?'#6d8797':bunny?'#efded8':kind==='monkey'?'#b48b65':'#b49b7d',light=penguin?'#fff2d7':bunny?'#fff5e7':'#f4d6ad';
  for(const sign of [-1,1]){const footX=sign*(13+kick*7-tuck*5),footY=kick*13-tuck*4;this.ellipse(footX,footY,penguin?11:9,4,penguin?'#e6ac59':body,ink,1.5);}
  const shade=c.createRadialGradient(-8,-31,2,0,-13,29);shade.addColorStop(0,light);shade.addColorStop(.2,body);shade.addColorStop(1,penguin?'#506b7f':bunny?'#d6bab8':'#917354');this.ellipse(0,-19,penguin?21:22,24,shade,ink,1.8);this.ellipse(0,-15,14,18,light);
  if(!penguin)for(const sign of [-1,1]){const earX=sign*(bunny?10:19),earY=bunny?-51:-34;this.ellipse(earX,earY,bunny?6:8,bunny?17:8,body,ink,1.6);if(!penguin)this.ellipse(earX,earY,bunny?3:4,bunny?11:4,'#efb9b8');}
  this.ellipse(0,-28,penguin?18:22,19,body,ink,1.8);this.ellipse(0,-25,penguin?14:17,13,light);
  for(const sign of [-1,1]){this.ellipse(sign*8,-31,3,Math.max(1,4*(1-blink)),ink);this.ellipse(sign*14,-23,4,2,'#eeb3a5');}
  if(penguin)this.path(p=>{p.moveTo(-5,-26);p.lineTo(0,-20);p.lineTo(5,-26);p.closePath();},'#e6ac59',ink,1);else{this.ellipse(0,-24,bunny?2:3,2,'#8b6256');this.path(p=>{p.moveTo(-5,-20);p.quadraticCurveTo(0,-15,5,-20);},null,ink,1.5);}
  if(kind==='otter')for(const side of [-1,1])for(const dy of [-2,2])this.path(p=>{p.moveTo(side*7,-22+dy);p.lineTo(side*19,-23+dy*1.4);},null,'#805f4f',1);
  for(const sign of [-1,1])this.path(p=>{p.moveTo(sign*18,-19);p.quadraticCurveTo(sign*(29+kick*2),-15-reach*8,sign*(24+stretch*4),-6+kick*5-reach*14);},null,penguin?'#59768c':body,penguin?7:6);
  if(penguin){this.path(p=>{p.moveTo(-14,-17);p.quadraticCurveTo(0,-11,14,-17);},null,'#b6dbe4',5);this.path(p=>{p.moveTo(10,-16);p.lineTo(15,-3);},null,'#b6dbe4',5);}c.restore();
 }
 splash(game,projection){const age=game.clock-game.fall.at;if(age>800)return;const c=this.ctx,{s,point}=projection,p=point(game.fall),t=clamp(age/800);c.save();c.globalAlpha=1-t;this.ellipse(p.x,p.y+5*s,(18+t*45)*s,(6+t*16)*s,null,'#efffe7',2.5*s);for(let i=0;i<8;i++){const a=i*Math.PI/4,spread=10+t*48;this.ellipse(p.x+Math.cos(a)*spread*s,p.y+Math.sin(a)*spread*.27*s-Math.sin(Math.PI*clamp(t/.7))*(15+i%3*5)*s,2.5*s,4*s,'#def5e7');}c.restore();}
 skillEffect(game,projection){const e=this.skill;if(!e||this.reduced.matches)return;const age=game.clock-e.at;if(age<0||age>650)return;const {s,point}=projection,c=this.ctx,p=point(e.point),t=age/650,colors={frog:'#d7f1a8',penguin:'#e0f7ff',bunny:'#ffe1e8',monkey:'#e8e5a1',otter:'#c9f1ed'};c.save();c.globalAlpha=1-t;this.ellipse(p.x,p.y,(e.radius+10+t*24)*s,(e.radius+10+t*24)*s*.43,null,colors[e.animal],3*s);for(let i=0;i<6;i++){const a=i*Math.PI/3;this.ellipse(p.x+Math.cos(a)*(e.radius+10+t*20)*s,p.y+Math.sin(a)*(e.radius+10+t*20)*s*.43,3*s,2*s,colors[e.animal]);}c.restore();}

 frog(x,y,scale,{squat=0,stretch=0,kick=0,tuck=0,reach=0,blink=0,airborne=false,lean=0,fall=0}={}){
  const c=this.ctx;c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.2-stretch*.08)*(1-fall*.55),scale*(1-squat*.24+stretch*.12)*(1-fall*.55));
  if(!airborne)this.ellipse(0,2,23+squat*3,5,'#31543733');
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
 angler(game,projection){
  const c=this.ctx,{point,s}=projection,p=point(game.fall),t=clamp((game.clock-game.fall.at-SPLASH_MS)/(DROWN_MS-SPLASH_MS)),rise=Math.sin(Math.PI*clamp(t/.95)),open=Math.sin(Math.PI*clamp(t/.8)),k=Math.min(1.05,Math.max(.65,s*1.15));
  c.save();c.translate(Math.max(55,Math.min(this.width-55,p.x)),p.y-rise*40);c.scale(k,k);
  this.ellipse(0,25,63,12,'#235a6433');this.ellipse(0,25,72+t*18,14+t*4,null,'#def8eb99',2);
  this.path(p=>{p.moveTo(-43,2);p.lineTo(-74,-18);p.quadraticCurveTo(-66,8,-74,25);p.closePath();},'#6d8ca0','#365f70',2);
  const body=c.createRadialGradient(-17,-20,2,0,0,62);body.addColorStop(0,'#b0c5c8');body.addColorStop(.6,'#63899e');body.addColorStop(1,'#3c5879');this.ellipse(0,0,53,39,body,'#354f67',2);
  this.path(p=>{p.moveTo(-4,-29);p.bezierCurveTo(-10,-78,52,-73,38,-44);},null,'#3f6578',4);this.ellipse(38,-44,9,10,'#fff2a1','#c0a44e',2);this.ellipse(35,-47,3,3,'#fffce6');
  this.ellipse(12,7,31,8+open*22,'#313047','#f1b69c',3);
  for(let i=0;i<5;i++){const x=-9+i*10;for(const sign of [-1,1])this.path(p=>{const y=7+sign*(7+open*18);p.moveTo(x-4,y);p.lineTo(x,y-sign*11);p.lineTo(x+4,y);},'#fff9d5');}
  for(const x of [-15,26]){this.ellipse(x,-21,11,12,'#f4e8bb','#354f67',2);this.ellipse(x+2,-20,3,5,'#2e3f54');this.ellipse(x,-23,2,2,'#fff');}this.ellipse(-31,3,6,4,'#eaa6ae');this.ellipse(38,3,5,4,'#eaa6ae');c.restore();
 }

 crocodile(game,projection){
  const c=this.ctx,{point,s}=projection,f=game.fall,p=point(f),t=clamp((game.clock-f.at-SPLASH_MS)/(DROWN_MS-SPLASH_MS)),jump=Math.sin(Math.PI*clamp((t-.08)/.92))*35,open=Math.sin(Math.PI*clamp(t/.82)),k=Math.min(1.1,Math.max(.65,s*1.2));
  c.save();c.translate(Math.max(61,Math.min(this.width-61,p.x)),p.y-jump);c.scale(k,k);
  this.ellipse(0,10,67,21,'#2b7d7833');
  for(let i=0;i<8;i++){const angle=i*Math.PI/4,r=18+t*65;this.ellipse(Math.cos(angle)*r,Math.sin(angle)*r*.4,3,2,`rgba(235,255,239,${1-t})`);}
  this.path(p=>{p.moveTo(-47,8);p.quadraticCurveTo(-86,12,-91,-6);p.quadraticCurveTo(-65,-4,-42,-15);},'#bc5450','#713f42',2);
  const body=c.createLinearGradient(0,-35,0,30);body.addColorStop(0,'#ffa28b');body.addColorStop(1,'#c54b53');this.ellipse(0,3,55,25,body,'#713f42',2);for(const x of [-35,-18,0,18,35])this.path(p=>{p.moveTo(x-5,18);p.lineTo(x,10);p.lineTo(x+5,18);},'#b3424e');this.ellipse(0,-open*10,48,12+open*22,'#493542','#813f44',3);
  for(let i=0;i<7;i++){const x=-36+i*12;this.path(p=>{p.moveTo(x-4,-open*30);p.lineTo(x,10-open*30);p.lineTo(x+4,-open*30);p.closePath();},'#fff2c7');this.path(p=>{p.moveTo(x-4,14+open*8);p.lineTo(x,5+open*8);p.lineTo(x+4,14+open*8);p.closePath();},'#fff2c7');}
  this.path(p=>{p.moveTo(-53,-open*31-3);p.quadraticCurveTo(0,-open*31-31,53,-open*31-3);},null,'#d9665a',10);
  for(const x of [-24,24]){this.ellipse(x,-open*31-18,12,10,'#e78572','#713f42',2);this.ellipse(x,-open*31-20,6,6,'#ffebae');this.ellipse(x+1,-open*31-20,2.5,4,'#493542');}
  for(const sign of [-1,1]){this.ellipse(sign*43,-open*24+7,7,4,'#f3b0a4');this.ellipse(sign*13,-open*31-8,2,1.5,'#8a4145');this.ellipse(sign*24-2,-open*31-23,2,2,'#fffce1');}c.restore();
 }
 draw(game){
  this.water(game);const projection=this.projection(game),{s,point}=projection;
  this.ripples(game,projection);
  for(let i=2;i>=0;i--)this.stump(game,game.stumps[i],i,projection);
  const frog=game.frog,p=point(frog),shake=['idle','charging','ready'].includes(game.state)?this.shake(game,game.current):{x:0,y:0};
  if(!['over','drowning'].includes(game.state)){
   if(game.state==='jumping'){
    const height=clamp(frog.lift/180),c=this.ctx;c.save();c.globalAlpha=.23-height*.12;this.ellipse(p.x,p.y,23*s*(1-height*.4),6*s*(1-height*.35),'#234d48');c.restore();
   }
   const pose=this.reduced.matches?{...frog,squat:game.state==='charging'?game.power:0,stretch:0,kick:0,tuck:0,reach:0,blink:0}:frog;
   this.animal(p.x+shake.x,p.y+shake.y+this.impact(game,game.current)*s*(game.current.kind==='lily'?1.5:1)-frog.lift*s,s*1.12,game.animal,{...pose,airborne:game.state==='jumping'});
  }else{
   const age=game.clock-game.fall.at,t=clamp(age/SPLASH_MS),c=this.ctx;if(age<SPLASH_MS){c.save();c.globalAlpha=1-t;this.animal(p.x,p.y+t*25*s,s*1.12,game.animal,{fall:t});c.restore();}this.splash(game,projection);if(age>=SPLASH_MS){if(game.fall.reason==='angler')this.angler(game,projection);else this.crocodile(game,projection);}
  }
  this.skillEffect(game,projection);
  this.headAnchor={x:p.x+shake.x,y:p.y+shake.y-frog.lift*s-(game.animal==='bunny'?72:48)*s*(1-frog.squat*.24)};
  if(!this.reduced.matches&&this.effect&&game.clock-this.effect.at<260){const t=clamp((game.clock-this.effect.at)/260),spot=point(game.current),c=this.ctx;c.save();c.globalAlpha=(1-t)*.45;for(const sign of [-1,1]){const x=spot.x+sign*24*s;this.path(p=>{p.moveTo(x-sign*3*s,spot.y+4*s);p.quadraticCurveTo(x,spot.y+7*s,x+sign*(5+t*6)*s,spot.y+3*s);},null,'#f4efc2',1.5*s);}c.restore();}
 }
}
