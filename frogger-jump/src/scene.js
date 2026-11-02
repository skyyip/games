import {CAMERA_MS,SINK_MS,DROWN_MS} from './game.js';
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t;
export class RiverScene{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});this.width=400;this.height=500;this.zoom=null;this.currentId=null;this.effect=null;this.zh=true;this.reduced=matchMedia('(prefers-reduced-motion: reduce)');}
 resize(width,height){this.width=Math.max(1,width);this.height=Math.max(1,height);const dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(width*dpr);this.canvas.height=Math.round(height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.zoom=null;}
 reset(){this.zoom=null;this.currentId=null;this.effect=null;}
 ellipse(x,y,rx,ry,fill,stroke=null,line=1.5){const c=this.ctx;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
 path(points,fill,stroke=null,line=1.5){const c=this.ctx;c.beginPath();points(c);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
 projection(game){
  const span=game.stumps[2].y-game.current.y,fit=Math.min(this.width/425,(this.height*.7-12)/(span*.74+80),1.5);
  if(this.zoom===null){this.zoom=fit;this.zoomFrom=fit;this.zoomTarget=fit;this.currentId=game.current.id;}
  if(this.currentId!==game.current.id){this.zoomFrom=this.zoom;this.zoomTarget=fit;this.currentId=game.current.id;}
  const t=clamp((game.clock-game.cameraAt)/CAMERA_MS);this.zoom=mix(this.zoomFrom,this.zoomTarget,1-(1-t)**3);
  const s=this.zoom;return {s,point:p=>({x:this.width/2+p.x*s,y:this.height*.79-(p.y-game.camera)*s*.74})};
 }
 shake(game,stump){if(this.reduced.matches||stump.id!==game.current.id||!stump.sinking||game.deadline===null)return {x:0,y:0};const urgency=1-clamp(game.sinkRemaining/SINK_MS);return {x:Math.sin(game.clock*.042)*(1+urgency*2),y:Math.sin(game.clock*.056)*urgency*1.5};}
 water(game){
  const c=this.ctx,w=this.width,h=this.height;c.clearRect(0,0,w,h);
  // Flat geometry and bounded wave strokes; no blur, particles or image textures.
  for(let i=0;i<10;i++){const y=(i*.119+.045)%1*h,x=(i*93%311)/311*w,shift=this.reduced.matches?0:Math.sin(game.clock*.00055+i)*5;c.strokeStyle=i%2?'#d0efde66':'#4f9d8f33';c.lineWidth=2;c.beginPath();c.moveTo(x-35+shift,y);c.bezierCurveTo(x-15+shift,y-4,x+5+shift,y+5,x+28+shift,y);c.stroke();}
  for(let i=0;i<6;i++){const right=i%2,x=right?w-12-(i*23%26):13+i*7%19,y=h*(.15+i*.14);this.ellipse(x,y,15+i%3*3,7,'#649c78');this.path(p=>{p.moveTo(x,y);p.lineTo(x+14,y-5);p.lineTo(x+10,y+5);},'#83b18a');if(i%3===0)this.ellipse(x-2,y-2,3,2,'#f6d6a0');}
 }
 stump(game,stump,index,projection){
  const c=this.ctx,{s,point}=projection,p=point(stump),shake=this.shake(game,stump),submerge=stump.id===game.current.id&&stump.sinking&&game.deadline!==null?clamp((game.clock-game.deadline)/500):0,r=stump.r*s,ry=r*.43,height=r*.77,x=p.x+shake.x,y=p.y+shake.y+submerge*65*s;c.save();c.globalAlpha=1-submerge;
  this.ellipse(x+5,y+height+8,r*1.13,ry*.8,'#306f6b26');
  c.strokeStyle='#d9eee0aa';c.lineWidth=1.5;this.ellipse(x,y+height+4,r*1.22,ry*.95,null,'#d8f2e099');
  const dark=stump.sinking;this.path(p=>{p.moveTo(x-r,y);p.bezierCurveTo(x-r,y+ry,x+r,y+ry,x+r,y);p.lineTo(x+r,y+height);p.bezierCurveTo(x+r,y+height+ry,x-r,y+height+ry,x-r,y+height);p.closePath();},dark?'#725042':'#a57b52',dark?'#543b38':'#795b40',2);
  for(const n of [-.65,-.2,.35,.7]){c.beginPath();c.moveTo(x+n*r,y+height*.38);c.lineTo(x+n*r+Math.sin(n*10)*3,y+height*.85);c.strokeStyle=dark?'#9c7660':'#c69a67';c.lineWidth=2;c.stroke();}
  this.ellipse(x,y,r,ry,dark?'#b78a67':'#e3c48b',dark?'#70503e':'#8d6c46',2);
  for(const k of [.74,.49,.22])this.ellipse(x-r*.05,y,r*k,ry*k,null,dark?'#8b654b':'#bc9966',1);
  this.ellipse(x-r*.08,y,2*s,s,dark?'#70503e':'#9b774e');
  if(index===1){this.ellipse(x,y,r+5,ry+3,null,'#fff5bd',2);this.path(p=>{p.moveTo(x-5*s,y-ry-13*s);p.lineTo(x,y-ry-7*s);p.lineTo(x+5*s,y-ry-13*s);},null,'#fff7c9',2);}
  const text=index===0?(this.zh?'腳下':'HERE'):index===1?(this.zh?'下一跳':'NEXT'):(this.zh?'再下一跳':'THEN');c.textAlign='center';c.font='600 11px "DM Sans",system-ui';c.fillStyle='#284e46';c.fillText(text,x,y+height+ry+19);
  if(dark){c.font='700 14px system-ui';c.fillStyle='#fff0cf';c.fillText('!',x+r*.62,y+height*.7);}c.restore();
 }
 frog(x,y,scale,{squat=0,stretch=0,lean=0,fall=0}={}){
  const c=this.ctx;c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.2-stretch*.12)*(1-fall*.55),scale*(1-squat*.24+stretch*.2)*(1-fall*.55));
  this.ellipse(0,1,24,5,'#4a704343');
  this.ellipse(-14,-1,11,4,'#609c52','#345d40');this.ellipse(14,-1,11,4,'#609c52','#345d40');
  this.ellipse(0,-16,22,18,'#82ba62','#355c42',2);this.ellipse(0,-12,13,9,'#d6e8a1');
  this.ellipse(-11,-31,10,11,'#93c96c','#355c42',2);this.ellipse(11,-31,10,11,'#93c96c','#355c42',2);
  this.ellipse(-11,-33,5,6,'#fff9dd');this.ellipse(11,-33,5,6,'#fff9dd');this.ellipse(-10,-32,2.8,4,'#274936');this.ellipse(12,-32,2.8,4,'#274936');
  this.ellipse(-17,-18,4,2,'#efb8a4');this.ellipse(17,-18,4,2,'#efb8a4');
  this.path(p=>{p.moveTo(-7,-17);p.quadraticCurveTo(0,-10,7,-17);},null,'#355c42',2);
  this.path(p=>{p.moveTo(-22,-14);p.lineTo(-27-stretch*5,-6+stretch*7);p.moveTo(22,-14);p.lineTo(27+stretch*5,-6+stretch*7);},null,'#497c49',3);c.restore();
 }
 crocodile(game,projection){
  const c=this.ctx,{point,s}=projection,f=game.fall,p=point(f),t=clamp((game.clock-f.at)/DROWN_MS),jump=Math.sin(Math.PI*clamp((t-.08)/.92))*35,open=Math.sin(Math.PI*clamp(t/.82)),k=Math.min(1.1,Math.max(.65,s*1.2));
  c.save();c.translate(p.x,p.y-jump);c.scale(k,k);
  this.ellipse(0,10,67,21,'#2b7d7833');
  for(let i=0;i<8;i++){const angle=i*Math.PI/4,r=18+t*65;this.ellipse(Math.cos(angle)*r,Math.sin(angle)*r*.4,3,2,`rgba(235,255,239,${1-t})`);}
  this.path(p=>{p.moveTo(-47,8);p.quadraticCurveTo(-86,12,-91,-6);p.quadraticCurveTo(-65,-4,-42,-15);},'#bc5450','#713f42',2);
  this.ellipse(0,3,55,25,'#e58170','#713f42',2);this.ellipse(0,-open*10,48,12+open*22,'#493542','#813f44',3);
  for(let i=0;i<7;i++){const x=-36+i*12;this.path(p=>{p.moveTo(x-4,-open*30);p.lineTo(x,10-open*30);p.lineTo(x+4,-open*30);p.closePath();},'#fff2c7');this.path(p=>{p.moveTo(x-4,14+open*8);p.lineTo(x,5+open*8);p.lineTo(x+4,14+open*8);p.closePath();},'#fff2c7');}
  this.path(p=>{p.moveTo(-53,-open*31-3);p.quadraticCurveTo(0,-open*31-31,53,-open*31-3);},null,'#d9665a',10);
  for(const x of [-24,24]){this.ellipse(x,-open*31-18,12,10,'#e78572','#713f42',2);this.ellipse(x,-open*31-20,6,6,'#ffebae');this.ellipse(x+1,-open*31-20,2.5,4,'#493542');}
  c.restore();
 }
 draw(game){
  this.water(game);const projection=this.projection(game),{s,point}=projection;
  for(let i=2;i>=0;i--)this.stump(game,game.stumps[i],i,projection);
  const frog=game.frog,p=point(frog),shake=['idle','charging','ready'].includes(game.state)?this.shake(game,game.current):{x:0,y:0};
  if(!['over','drowning'].includes(game.state)){
   if(game.state==='jumping')this.ellipse(p.x,p.y,20*s*(1-frog.lift/300),7*s,'#2c6b6b2b');
   this.frog(p.x+shake.x,p.y+shake.y-frog.lift*s,s*1.12,{squat:game.power,stretch:frog.stretch,lean:frog.lean});
  }else{const t=clamp((game.clock-game.fall.at)/DROWN_MS);if(t<.55)this.frog(p.x,p.y+t*18,s*1.12,{fall:t});this.crocodile(game,projection);}
  if(this.effect&&game.clock-this.effect.at<650){const e=this.effect,t=clamp((game.clock-e.at)/650),spot=point(game.current);this.ctx.globalAlpha=1-t;this.ellipse(spot.x,spot.y,game.current.r*s*(1+t*.5),game.current.r*s*.43*(1+t*.5),null,e.perfect?'#fff4ad':'#fff8dc',3);this.ctx.globalAlpha=1;}
 }
}
