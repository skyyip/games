import {flightAt} from './game.js';
export class River {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=0;this.height=0;this.last={};new ResizeObserver(()=>this.resize()).observe(canvas);this.resize();}
  resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);this.width=r.width;this.height=r.height;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw(this.last);}
  project(progress){return {x:this.width*(.23+.66*progress**.78),y:this.height*(.77-.34*progress**.62)};}
  ellipse(x,y,rx,ry,fill,stroke){const c=this.ctx;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.stroke();}}
  draw(options={}){
    this.last=options;const c=this.ctx,w=this.width,h=this.height;if(!w||!h)return;
    c.clearRect(0,0,w,h);const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#e9e8d4');sky.addColorStop(.35,'#e5e4ce');sky.addColorStop(1,'#d5dfca');c.fillStyle=sky;c.fillRect(0,0,w,h);
    this.ellipse(w*.78,h*.15,28,28,'#f0c59f');
    for(const [base,color,offset] of [[.26,'#bfcab0',.02],[.32,'#91af9c',0],[.37,'#7a9b87',.13]]){
      c.beginPath();c.moveTo(0,h*base);c.bezierCurveTo(w*.2,h*(base-.13),w*.3,h*(base+.08),w*.5,h*(base-.04));c.bezierCurveTo(w*.7,h*(base-.15+offset),w*.86,h*(base+.08),w,h*(base-.05));c.lineTo(w,h*.43);c.lineTo(0,h*.43);c.closePath();c.fillStyle=color;c.fill();
    }
    const water=c.createLinearGradient(0,h*.35,0,h);water.addColorStop(0,'#9ab9ae');water.addColorStop(.5,'#b1cec0');water.addColorStop(1,'#c2d9c7');c.fillStyle=water;c.fillRect(0,h*.36,w,h*.64);
    c.lineWidth=1;for(let i=0;i<19;i++){const y=h*(.39+i*.027),x=(i*83%Math.max(w-50,1));c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+28,y-2,x+40,y+2,x+70,y);c.strokeStyle=i%3===0?'#e6ebd088':'#729d8f38';c.stroke();}
    for(const [x,y,scale] of [[.85,.55,.7],[.12,.46,.45]]){this.ellipse(w*x,h*y,18*scale,4*scale,'#749a73');c.beginPath();c.moveTo(w*x,h*y);c.lineTo(w*x+8*scale,h*y-5*scale);c.strokeStyle='#cadab1';c.stroke();}
    // A low, curved foreground bank frames the throwing hand without covering the river.
    c.beginPath();c.moveTo(0,h*.85);c.bezierCurveTo(w*.22,h*.87,w*.28,h*.96,w*.48,h);c.lineTo(0,h);c.closePath();c.fillStyle='#e2d3ad';c.fill();
    c.beginPath();c.moveTo(0,h*.84);c.bezierCurveTo(w*.2,h*.85,w*.32,h*.96,w*.48,h);c.strokeStyle='#f2e3c1';c.lineWidth=7;c.stroke();
    for(let i=0;i<8;i++){const x=14+i*9,y=h*(.9+i%3*.025);c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-4,y-20-i%2*9,x+4,y-31);c.strokeStyle=i%2?'#8b9b71':'#68866b';c.lineWidth=2;c.stroke();}
    this.ellipse(w*.10,h*.94,10,5,'#adae99');this.ellipse(w*.17,h*.965,14,7,'#b7baa3');
    if(!options.plan)return;
    const {plan,elapsed=0,result}=options,state=flightAt(plan,elapsed);
    c.save();c.setLineDash([3,7]);c.lineWidth=1.4;c.strokeStyle='#f9f6dd99';c.beginPath();
    const steps=80;for(let i=0;i<=steps;i++){const t=elapsed*i/steps,s=flightAt(plan,t),p=this.project(s.progress);const y=p.y-s.lift*h;i?c.lineTo(p.x,y):c.moveTo(p.x,y);}c.stroke();c.restore();
    for(const hit of plan.contacts){const age=elapsed-hit.time;if(age<0||age>1300)continue;const p=this.project(hit.progress),fade=1-age/1300,scale=1-hit.progress*.6;
      c.save();c.globalAlpha=fade;c.lineWidth=1.5;for(let ring=0;ring<3;ring++){const r=(8+age*.065-ring*6)*scale;if(r>1)this.ellipse(p.x,p.y,r,r*.28,null,ring===0?'#fff7da':'#e1f0d9');}
      if(age<220){c.strokeStyle='#fffce6';c.lineWidth=2;for(let i=0;i<5;i++){const dx=(i-2)*6*scale;const lift=Math.sin(age/220*Math.PI)*(17-Math.abs(i-2)*3)*scale;c.beginPath();c.moveTo(p.x+dx,p.y);c.lineTo(p.x+dx*1.3,p.y-lift);c.stroke();}}c.restore();
    }
    const p=this.project(state.progress),scale=(1-state.progress*.67),radius=17*scale;
    c.save();c.globalAlpha=1-state.sink;this.ellipse(p.x,p.y,radius*1.3,radius*.3,'#446e6240');
    c.translate(p.x,p.y-state.lift*h);c.rotate(plan.reduced?0:Math.sin(elapsed*.035)*.13);this.ellipse(0,0,radius*(result.settings.length/result.settings.width)**.2,radius*.54,'#f4e5c7','#6c8173');
    c.lineWidth=1;c.strokeStyle='#b9b49b';c.beginPath();c.ellipse(0,0,radius*.68,radius*.3,plan.reduced?0:elapsed*.018*(result.settings.spin/75),0,Math.PI*1.7);c.stroke();
    c.fillStyle='#fdf5db';this.ellipse(-radius*.32,-radius*.18,radius*.22,radius*.1,'#fff5dc');c.restore();
    if(state.sink>0){c.save();c.globalAlpha=1-state.sink*.8;this.ellipse(p.x,p.y,8+state.sink*23,2+state.sink*7,null,'#f7f1d4');c.restore();}
  }
}
