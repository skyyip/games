import {vertices,clamp,RADIUS} from './game.js';
export class FloatingScene {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=0;this.height=0;this.last={};new ResizeObserver(()=>this.resize()).observe(canvas);this.resize();}
  resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(this.width===r.width&&this.height===r.height&&this.dpr===dpr)return;this.dpr=dpr;this.width=r.width;this.height=r.height;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw(this.last);}
  project(p,game,z=0){const scale=Math.min(this.width*.38,this.height*.34),tx=game.tilt.x,ty=game.tilt.y,xx=p.x*Math.cos(tx)+p.y*Math.sin(ty)*Math.sin(tx),yy=p.y*Math.cos(ty),zz=-p.x*Math.sin(tx)+p.y*Math.sin(ty)*Math.cos(tx)+z,perspective=1/(1+zz*.12);return {x:this.width/2+xx*scale*perspective,y:this.height*.49+(yy*.79-zz*.42)*scale*perspective,scale:scale*perspective};}
  ellipse(x,y,rx,ry,fill,stroke,width=1){const c=this.ctx;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  path(points,fill,stroke,width=1){const c=this.ctx;c.beginPath();points.forEach((p,i)=>{i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);});c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  draw({game,time=0,reduced=false}={}){
    this.last={game,time,reduced};const c=this.ctx,w=this.width,h=this.height;if(!w||!h||!game)return;
    c.clearRect(0,0,w,h);const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#e4ebdf');sky.addColorStop(.6,'#f2edd9');sky.addColorStop(1,'#e3e4d0');c.fillStyle=sky;c.fillRect(0,0,w,h);
    this.ellipse(w*.79,h*.16,Math.min(w*.07,35),Math.min(w*.07,35),'#f5e8b7');
    for(let i=0;i<5;i++){const x=w*(.1+i*.22)+(reduced?0:Math.sin(time*.08+i)*7),y=h*(.18+(i%3)*.26);this.ellipse(x,y,36+i%2*15,9,'#fffbed9a');this.ellipse(x-8,y-6,18,12,'#fffbed9a');}
    const centre=this.project({x:0,y:0},game),scale=centre.scale;
    this.ellipse(w*.5,h*.78,scale*.78,scale*.13,'#61795717');this.ellipse(w*.5,h*.78,scale*.5,scale*.08,'#6179570e');
    const points=vertices(game.shape.id).map(p=>this.project(p,game)),lower=points.map(p=>({...p,y:p.y+Math.max(7,scale*.065)}));this.path(lower,'#7e9c81','#69896f');
    const glaze=c.createLinearGradient(centre.x-scale,centre.y-scale,centre.x+scale,centre.y+scale);glaze.addColorStop(0,'#d0dfbb');glaze.addColorStop(.45,'#b9cda4');glaze.addColorStop(1,'#97b28e');this.path(points,glaze,'#e1e7bf',3);
    c.save();this.path(points);c.clip();
    for(let n=-5;n<=5;n++){c.strokeStyle='#e1e9cd55';c.lineWidth=1;const a=this.project({x:n*.2,y:-1},game),b=this.project({x:n*.2,y:1},game);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();const q=this.project({x:-1,y:n*.2},game),r=this.project({x:1,y:n*.2},game);c.beginPath();c.moveTo(q.x,q.y);c.lineTo(r.x,r.y);c.stroke();}
    const ring=Array.from({length:50},(_,i)=>this.project({x:Math.cos(i/50*Math.PI*2)*.18,y:Math.sin(i/50*Math.PI*2)*.18},game));this.path(ring,null,'#e8edcf88',1);c.restore();
    const wind=game.events.find(e=>e.id==='wind');if(wind){c.save();c.globalAlpha=.6;c.strokeStyle='#fff9e6';c.lineWidth=2;for(let i=0;i<4;i++){const x=w*(.12+i*.21)+(reduced?0:Math.sin(time*3+i)*12),y=h*(.27+i%2*.18);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+20,y-6,x+45,y);c.stroke();}c.restore();}
    const parcel=game.pending?.id==='parcel'?game.pending:game.events.find(e=>e.id==='parcel');
    if(parcel){const active=game.events.includes(parcel),at=this.project({x:parcel.x*.48,y:parcel.y*.48},game),fall=active?0:clamp((parcel.at-game.elapsed)/1.3,0,1)*h*.6,s=Math.max(10,scale*.13);c.save();c.translate(at.x,at.y-fall);if(!active)c.rotate(Math.sin(time*4)*.12);c.fillStyle='#e1c49a';c.fillRect(-s/2,-s,s,s);c.strokeStyle='#af8d62';c.lineWidth=1;c.strokeRect(-s/2,-s,s,s);c.fillStyle='#91a987';c.fillRect(-2,-s,4,s);c.fillRect(-s/2,-s*.62,s,3);this.ellipse(-3,-s-2,4,2,null,'#8a9e78');this.ellipse(3,-s-2,4,2,null,'#8a9e78');c.restore();}
    const quake=game.events.find(e=>e.id==='quake');if(quake&&!reduced){c.strokeStyle='#b4956d77';c.lineWidth=1.5;for(const x of [centre.x-scale*1.1,centre.x+scale*1.1]){c.beginPath();c.moveTo(x,centre.y-10);c.lineTo(x-4,centre.y);c.lineTo(x+3,centre.y+8);c.stroke();}}
    const ball=game.ball,p=this.project(ball,game,RADIUS),fall=game.state==='ending'||game.state==='finished'?clamp(game.fallElapsed,0,1):0,r=Math.max(3.5,p.scale*RADIUS);
    if(fall<1){const x=p.x+ball.vx*fall*scale*.4,y=p.y+fall*fall*h*.7;c.save();c.globalAlpha=1-fall*.9;this.ellipse(p.x,p.y+r*.7,r*.92,r*.35,'#4e6b4b27');const gloss=c.createRadialGradient(x-r*.35,y-r*.4,.1,x,y,r);gloss.addColorStop(0,'#fff3df');gloss.addColorStop(.35,'#e8b5a5');gloss.addColorStop(.8,'#cf8e88');gloss.addColorStop(1,'#a5686d');this.ellipse(x,y,r,r,gloss,'#a46e70',1);this.ellipse(x-r*.3,y-r*.35,r*.24,r*.17,'#fff8e5');c.restore();}
  }
}
