import {flightAt,throwVelocity,descendingTime,RIM_HEIGHT,POT_DEPTH,MOUTH_RADIUS,clamp} from './game.js';
export class Court {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=0;this.height=0;this.last={};new ResizeObserver(()=>this.resize()).observe(canvas);this.resize();}
  resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);this.width=r.width;this.height=r.height;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw(this.last);}
  project(x,z,h=0){const scale=1/(1+z*.12);return {x:this.width/2+x*this.width*.28*scale,y:this.height*.89-z*this.height*.13*scale-h*Math.min(this.width*.28,this.height*.21)*scale,scale};}
  ellipse(x,y,rx,ry,fill,stroke,width=1){const c=this.ctx;c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  path(points,fill,stroke,width=1){const c=this.ctx;c.beginPath();for(const [i,p] of points.entries()){i?c.lineTo(...p):c.moveTo(...p);}if(fill){c.closePath();c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}}
  background(time,reduced){
    const c=this.ctx,w=this.width,h=this.height;
    const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#f2e6da');sky.addColorStop(.45,'#f0dfd0');sky.addColorStop(1,'#dfc8b9');c.fillStyle=sky;c.fillRect(0,0,w,h);
    this.ellipse(w*.79,h*.14,Math.min(w*.06,33),Math.min(w*.06,33),'#faefc9');
    c.fillStyle='#dfc7bc';c.fillRect(0,h*.3,w,h*.08);c.fillStyle='#e9d4c4';c.fillRect(0,h*.30,w,3);c.fillStyle='#cdb1a5';c.fillRect(0,h*.375,w,3);
    // Soft archways and distant greenery frame a quiet, tiled courtyard.
    for(const [x,s] of [[.10,.9],[.90,1]]){const bw=w*.11,by=h*.30;c.beginPath();c.moveTo(w*x-bw/2,by);c.lineTo(w*x-bw/2,by-h*.11);c.bezierCurveTo(w*x-bw/2,by-h*.23,w*x+bw/2,by-h*.23,w*x+bw/2,by-h*.11);c.lineTo(w*x+bw/2,by);c.closePath();c.fillStyle='#cfb9b5';c.fill();c.strokeStyle='#e6cbbf';c.lineWidth=5;c.stroke();
      c.save();c.translate(w*x,by);this.ellipse(0,-h*.055,bw*.35,h*.038,'#a0ac91');this.ellipse(-bw*.2,-h*.07,bw*.22,h*.05,'#b0b795');this.ellipse(bw*.2,-h*.095,bw*.21,h*.04,'#99a78b');c.restore();}
    c.strokeStyle='#bd9b8a50';c.lineWidth=1;
    for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(w*.5+i*w*.032,h*.38);c.lineTo(w*.5+i*w*.30,h);c.stroke();}
    for(let i=1;i<9;i++){const y=h*(.38+.70*(i/9)**1.7);c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    c.strokeStyle='#fff1dc44';for(let i=2;i<8;i++){const y=h*(.38+.70*(i/9)**1.7)+2;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    c.strokeStyle='#b79b8d';c.lineWidth=1;c.beginPath();c.moveTo(w*.28,0);c.quadraticCurveTo(w*.52,h*.18,w*.74,0);c.stroke();
    for(let i=0;i<6;i++){const x=w*(.31+i*.075),y=h*(.04+Math.sin(i/5*Math.PI)*.044),s=Math.min(13,w*.017);this.path([[x,y],[x+s,y+1],[x+s*.5,y+s*1.4]],['#c9b2ce','#bdc4a1','#e4bf8e'][i%3]);}
    // A watering can, a potted sprout and a few pebbles make the edges feel lived in.
    const unit=Math.min(w*.1,h*.14);c.save();c.translate(w*.08,h*.56);c.rotate(-.08);c.fillStyle='#aebba2';c.fillRect(-unit*.35,-unit*.35,unit*.7,unit*.6);this.ellipse(0,-unit*.35,unit*.35,unit*.1,'#bec8ad');c.strokeStyle='#91a38d';c.lineWidth=3;c.beginPath();c.ellipse(-unit*.42,-unit*.08,unit*.24,unit*.23,0,0,Math.PI*2);c.stroke();this.path([[unit*.3,-unit*.16],[unit*.75,-unit*.45],[unit*.8,-unit*.35],[unit*.38,unit*.05]],'#9eaf97');c.restore();
    c.save();c.translate(w*.91,h*.56);const s=unit*.8;this.path([[-s*.4,0],[s*.4,0],[s*.29,s*.45],[-s*.28,s*.45]],'#c88f77');this.ellipse(0,0,s*.43,s*.1,'#e0ae8d');c.strokeStyle='#8c9e79';c.lineWidth=2;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-s*.1,-s*.3,s*.08,-s*.8);c.stroke();this.ellipse(-s*.19,-s*.42,s*.25,s*.12,'#acb590');this.ellipse(s*.24,-s*.59,s*.25,s*.12,'#94a786');c.restore();
    for(const [x,y,r] of [[.17,.82,4],[.84,.73,3],[.12,.87,2]])this.ellipse(w*x,h*y,r,r*.6,'#cbb7a4');
    if(!reduced){const x=w*(.06+((time*.007)%1)*.88),y=h*(.19+Math.sin(time*.5)*.012);c.strokeStyle='#bfa58c55';c.lineWidth=1;c.beginPath();c.moveTo(x-5,y);c.quadraticCurveTo(x,y-5,x+5,y);c.stroke();}
  }
  pot(game,reduced,time=0){
    const c=this.ctx,w=this.width,h=this.height,x=game?.potX||0,depth=game?.potDepth??POT_DEPTH,p=this.project(x,depth),rim=this.project(x,depth,RIM_HEIGHT),rx=w*.28*p.scale*MOUTH_RADIUS,body=rx*1.35;
    const ry=Math.max(5,Math.abs(this.project(x,depth+MOUTH_RADIUS,RIM_HEIGHT).y-this.project(x,depth-MOUTH_RADIUS,RIM_HEIGHT).y)/2),bodyH=p.y-rim.y;
    const hit=game?.impact?.kind==='hit',age=game?game.elapsed-(game.impact?.at??-100):100,bounce=hit&&age>=0&&age<.55&&!reduced?Math.sin(age/.55*Math.PI)*.09:0;
    this.ellipse(p.x,p.y+4,body*1.15,body*.19,'#83686b26');
    c.save();c.translate(p.x,p.y);c.scale(1+bounce,1+bounce);c.translate(0,-bodyH);
    this.ellipse(-body*.44,bodyH*.93,body*.21,bodyH*.13,'#b295bd');this.ellipse(body*.44,bodyH*.93,body*.21,bodyH*.13,'#b295bd');
    c.strokeStyle='#b293c0';c.lineWidth=Math.max(5,rx*.19);c.beginPath();c.ellipse(body*.95,bodyH*.40,body*.38,bodyH*.29,-.25,0,Math.PI*2);c.stroke();c.strokeStyle='#d7bddc';c.lineWidth=2;c.stroke();
    const glaze=c.createLinearGradient(-body,0,body,bodyH);glaze.addColorStop(0,'#eed6ed');glaze.addColorStop(.55,'#d3b2db');glaze.addColorStop(1,'#b897ca');
    c.beginPath();c.moveTo(-rx,-1);c.bezierCurveTo(-body*1.15,bodyH*.25,-body*.99,bodyH*.84,-body*.56,bodyH);c.quadraticCurveTo(0,bodyH*1.13,body*.56,bodyH);c.bezierCurveTo(body*.99,bodyH*.84,body*1.15,bodyH*.25,rx,-1);c.closePath();c.fillStyle=glaze;c.fill();c.lineWidth=1.2;c.strokeStyle='#9f7fad';c.stroke();
    this.ellipse(0,0,rx+3,ry+3,'#d9c1df','#aa89b8',1.2);this.ellipse(0,-.5,rx*.96,ry*.81,'#83718f');this.ellipse(0,1,rx*.80,ry*.52,'#95839e');
    c.strokeStyle='#e9d7e9';c.lineWidth=Math.max(2,rx*.07);c.beginPath();c.moveTo(-body*.66,bodyH*.25);c.quadraticCurveTo(-body*.83,bodyH*.5,-body*.61,bodyH*.7);c.stroke();
    // Only tails remain visible once an arrow has passed through the opening.
    const tails=game?.landed||[];
    for(const [i,tail] of tails.entries()){const tx=clamp(tail.x/MOUTH_RADIUS,-.8,.8)*rx+(i-2)*rx*.06,tilt=Math.sin(i*3.2)*.18;c.save();c.translate(tx,-1+(tail.z||0)/MOUTH_RADIUS*ry*.6);c.rotate(tilt);c.strokeStyle=tail.type==='color'?'#b19ac9':'#b99968';c.lineWidth=Math.max(2,rx*.06);c.beginPath();c.moveTo(0,1);c.lineTo(0,-bodyH*(.45+i%3*.12));c.stroke();c.strokeStyle=tail.type==='color'?'#d5a1ab':'#cbb38b';c.beginPath();c.moveTo(0,-bodyH*.35);c.lineTo(-4,-bodyH*.43);c.moveTo(0,-bodyH*.35);c.lineTo(4,-bodyH*.43);c.stroke();c.restore();}
    c.strokeStyle='#e0c9e3';c.lineWidth=3;c.beginPath();c.ellipse(0,0,rx,ry,0,0,Math.PI);c.stroke();
    const fy=bodyH*.55,eye=rx*.24,smiling=hit&&age>=0&&age<1.1;
    const crying=Boolean(game?.impact)&&!hit&&age>=0&&age<1.5,blink=!reduced&&Math.sin(time*1.15)>.996;
    this.ellipse(0,fy+bodyH*.09,rx*.67,bodyH*.29,'#f9e9f0');
    c.strokeStyle='#685671';c.lineWidth=Math.max(1.3,rx*.05);c.lineCap='round';
    if(crying){for(const ex of [-eye,eye]){c.beginPath();c.moveTo(ex-rx*.09,fy);c.quadraticCurveTo(ex,fy+rx*.07,ex+rx*.09,fy-rx*.025);c.stroke();
      const inward=ex<0?1:-1;c.beginPath();c.moveTo(ex-inward*rx*.08,fy-rx*.13);c.quadraticCurveTo(ex,fy-rx*.17,ex+inward*rx*.07,fy-rx*.21);c.stroke();}}
    else if(smiling||blink){for(const ex of [-eye,eye]){c.beginPath();c.moveTo(ex-rx*.08,fy);c.quadraticCurveTo(ex,fy-rx*.12,ex+rx*.08,fy);c.stroke();}}
    else{for(const ex of [-eye,eye]){this.ellipse(ex,fy,Math.max(1.8,rx*.065),Math.max(2.2,rx*.085),'#685671');this.ellipse(ex-rx*.018,fy-rx*.027,Math.max(.6,rx*.024),Math.max(.7,rx*.028),'#fffdfb');}}
    this.ellipse(-rx*.43,fy+5,rx*.17,rx*.09,'#efb3c8');this.ellipse(rx*.43,fy+5,rx*.17,rx*.09,'#efb3c8');
    c.strokeStyle='#7d648b';c.lineWidth=1.5;c.beginPath();
    if(crying){c.moveTo(-rx*.13,fy+rx*.28);c.quadraticCurveTo(0,fy+rx*.10,rx*.13,fy+rx*.28);c.stroke();
      for(const [i,ex] of [-eye,eye].entries()){const fall=reduced?.45:((age*1.6+i*.35)%1);c.strokeStyle='#83c8e6';c.lineWidth=Math.max(2,rx*.07);c.beginPath();c.moveTo(ex,fy+rx*.05);c.quadraticCurveTo(ex-rx*.025,fy+rx*.17,ex,fy+rx*.24);c.stroke();
        c.save();c.globalAlpha=reduced?.85:1-fall*.65;this.ellipse(ex,fy+rx*(.27+fall*.17),rx*.055,rx*.08,'#83c8e6');this.ellipse(ex-rx*.012,fy+rx*(.25+fall*.17),rx*.016,rx*.025,'#e3f9ff');c.restore();}}
    else{c.moveTo(-rx*(smiling?.17:.1),fy+6);c.quadraticCurveTo(0,fy+(smiling?16:10),rx*(smiling?.17:.1),fy+6);if(smiling){c.closePath();c.fillStyle='#8b658d';c.fill();this.ellipse(0,fy+10,rx*.08,rx*.035,'#eab4bc');}else c.stroke();}
    c.save();c.translate(body*.59,bodyH*.33);c.rotate(.3);this.path([[0,-4],[1.5,-1.5],[4,0],[1.5,1.5],[0,4],[-1.5,1.5],[-4,0],[-1.5,-1.5]],'#f3e6c7');c.restore();c.restore();
    if(hit&&age>=0&&age<.85){
      const progress=age/.85;c.save();c.globalAlpha=1-progress;
      for(let i=0;i<10;i++){const angle=i/10*Math.PI*2,speed=17+i%3*5,px=rim.x+Math.cos(angle)*speed*progress*2.7,py=rim.y-8-Math.sin(angle)*speed*progress-30*progress+35*progress*progress;c.save();c.translate(px,py);c.rotate(progress*(i%2?5:-5));c.fillStyle=['#d79fa8','#b3b995','#dfc382','#b69bc7'][i%4];c.fillRect(-2,-1,4,2.5);c.restore();}c.restore();
    }
  }
  arrow(position,next,type,opacity=1){
    const c=this.ctx,dx=next.x-position.x,dy=next.y-position.y,length=Math.min(this.width*.16,this.height*.16,68)*position.scale,angle=Math.atan2(dy,dx);
    c.save();c.globalAlpha=opacity;c.translate(position.x,position.y);c.rotate(angle);const gradient=c.createLinearGradient(-length,0,0,0);for(const [at,color] of [[0,'#a89bc7'],[.33,'#9cbba7'],[.66,'#e2c37e'],[1,'#d29694']])gradient.addColorStop(at,color);
    c.lineCap='round';c.strokeStyle=type==='color'?gradient:'#b28e5f';c.lineWidth=Math.max(2,3.7*position.scale);c.beginPath();c.moveTo(-length,0);c.lineTo(0,0);c.stroke();
    c.fillStyle=type==='color'?'#d9a0ab':'#bea174';c.beginPath();c.moveTo(2,0);c.lineTo(-7,-3);c.lineTo(-7,3);c.closePath();c.fill();c.strokeStyle=type==='color'?'#ac94bf':'#b49b78';c.lineWidth=2*position.scale;c.beginPath();c.moveTo(-length*.8,0);c.lineTo(-length*.95,-5*position.scale);c.moveTo(-length*.8,0);c.lineTo(-length*.95,5*position.scale);c.moveTo(-length*.6,0);c.lineTo(-length*.75,-5*position.scale);c.moveTo(-length*.6,0);c.lineTo(-length*.75,5*position.scale);c.stroke();c.restore();
  }
  draw(options={}){
    this.last=options;if(!this.width||!this.height)return;const {game,aim=null,reduced=false,time=0}=options,c=this.ctx;
    c.clearRect(0,0,this.width,this.height);this.background(time,reduced);
    if(aim&&game?.ready){const f=throwVelocity(aim),end=descendingTime(f.vy)*.56;c.save();c.setLineDash([2,7]);c.strokeStyle='#fff9edc0';c.lineWidth=2;c.beginPath();for(let i=0;i<=28;i++){const p=flightAt(f,end*i/28),v=this.project(p.x,p.z,p.h);i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y);}c.stroke();c.restore();}
    const f=game?.flight;
    let arrow=null,behind=false;
    if(f){const t=Math.max(0,game.elapsed-f.started),p=flightAt(f,t),n=flightAt(f,t+.015);arrow={p:this.project(p.x,p.z,p.h),n:this.project(n.x,n.z,n.h),type:f.type};behind=p.z>(game.potDepth??POT_DEPTH);
      c.save();c.globalAlpha=.3;c.setLineDash([2,6]);c.strokeStyle=f.type==='color'?'#baa0ce':'#a98d6b';c.lineWidth=1.2;c.beginPath();for(let i=0;i<=24;i++){const q=flightAt(f,t*i/24),v=this.project(q.x,q.z,q.h);i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y);}c.stroke();c.restore();
    }
    if(arrow&&behind)this.arrow(arrow.p,arrow.n,arrow.type);
    this.pot(game,reduced,time);
    if(arrow&&!behind)this.arrow(arrow.p,arrow.n,arrow.type);
    const impact=game?.impact,age=impact?game.elapsed-impact.at:100;
    if(impact&&impact.kind!=='hit'&&age>=0&&age<.7){const bounce=impact.kind==='rim',x=impact.x+(bounce?Math.sign(impact.x-impact.potX||1)*age*.7:age*.15),z=impact.z+(bounce?-age*.7:0),height=Math.max(0,impact.h+(bounce?1.5*age:0)-4.9*age*age),p=this.project(x,z,height),n={...p,x:p.x+Math.sin(age*7+1)*3,y:p.y+4};this.arrow(p,n,impact.type,1-age/.7);}
  }
}
