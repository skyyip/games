import {BALL_RADIUS,BOMB_RADIUS,clamp} from './game.js';
export function miniMaze(level){const cells=[];for(let y=0;y<level.size;y++)for(let x=0;x<level.size;x++)if(level.grid[y][x])cells.push(`<path d="M${x} ${y}h1v1h-1Z"/>`);return `<svg viewBox="-1 -1 19 19" aria-hidden="true"><rect x="-1" y="-1" width="19" height="19" rx="2" fill="#d3dfc5"/><g fill="#f5f4df">${cells.join('')}</g><circle cx="8.5" cy="15.5" r=".7" fill="#729c8b"/><circle cx="8.5" cy="1.5" r=".7" fill="#c79758"/></svg>`;}
export class MazeBoard {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=0;this.height=0;this.last={};this.fogAlpha=0;new ResizeObserver(()=>this.resize()).observe(canvas);this.resize();}
  resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);this.width=r.width;this.height=r.height;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);this.draw(this.last);}
  geometry(level){const size=Math.max(1,Math.min(this.width-16,this.height-16)),cell=size/level.size;return {size,cell,x:(this.width-size)/2,y:(this.height-size)/2};}
  round(x,y,w,h,r,fill,stroke){const c=this.ctx;c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
  circle(x,y,r,fill,stroke,width=1){const c=this.ctx;c.beginPath();c.arc(x,y,Math.max(.1,r),0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.lineWidth=width;c.strokeStyle=stroke;c.stroke();}}
  draw({game,time=0,reduced=false,dt=1/60}={}){
    this.last={game,time,reduced,dt};const c=this.ctx,w=this.width,h=this.height;if(!w||!h||!game)return;const {level}=game,g=this.geometry(level),s=g.cell;
    c.clearRect(0,0,w,h);c.fillStyle='#eaf0e1';c.fillRect(0,0,w,h);
    c.save();c.translate(g.x,g.y);this.round(-5,-3,g.size+10,g.size+10,13,'#b3bea0');this.round(-5,-6,g.size+10,g.size+10,13,'#d3ddbe','#aebd9b');
    this.round(0,0,g.size,g.size,9,'#eee8d3');c.save();this.round(0,0,g.size,g.size,8);c.clip();
    // A softly recessed floor and raised mint walls retain the readable cell geometry.
    for(let y=0;y<level.size;y++)for(let x=0;x<level.size;x++){
      const xx=x*s,yy=y*s;
      if(level.grid[y][x]){c.fillStyle=(x+y)%2?'#ede6cf':'#f0ead6';c.fillRect(xx,yy,s,s);c.fillStyle='#d8ccae38';c.fillRect(xx+s*.15,yy+s*.77,s*.33,.6);}
      else{c.fillStyle='#aebf98';c.fillRect(xx,yy+2,s,s);c.fillStyle='#c3d1ad';c.fillRect(xx,yy,s,s-2);if(level.grid[y+1]?.[x]){c.fillStyle='#96ab85';c.fillRect(xx,yy+s-3,s,3);}if(level.grid[y]?.[x+1]){c.fillStyle='#b0c29a';c.fillRect(xx+s-2,yy,2,s);}if(level.grid[y-1]?.[x]){c.fillStyle='#d5dfc0';c.fillRect(xx,yy,s,1.2);}}
    }
    const start={x:level.start.x*s,y:level.start.y*s},goal={x:level.goal.x*s,y:level.goal.y*s};
    this.circle(start.x,start.y,s*.32,'#d2e0cc','#97b299');this.circle(start.x,start.y,s*.11,'#9cbbaa');
    const pulse=game.pending&&!reduced?Math.sin(time*12)*.5+.5:0;
    this.circle(goal.x,goal.y,s*.39,game.pending?'#e5b69b':'#e8d4a5',game.pending?'#bb7f60':'#c5a16a',1.5);this.circle(goal.x,goal.y,s*.22,'#c4a77b');this.circle(goal.x-s*.05,goal.y-s*.05,s*.14,'#a18f6e');
    if(game.pending){this.circle(goal.x,goal.y,s*(.48+pulse*.13),null,`rgba(189,114,84,${.3+pulse*.4})`,1.5);}
    for(const bomb of game.bombs){const x=bomb.x*s,y=bomb.y*s,r=s*BOMB_RADIUS;
      this.circle(x+1,y+2,r,'#62776333');const shade=c.createRadialGradient(x-r*.3,y-r*.35,.5,x,y,r);shade.addColorStop(0,'#889783');shade.addColorStop(1,'#526950');this.circle(x,y,r,shade,'#4d624b');
      c.strokeStyle='#9d8060';c.lineWidth=Math.max(1,s*.05);c.beginPath();c.moveTo(x+r*.3,y-r*.8);c.quadraticCurveTo(x+r*.2,y-r*1.7,x+r*.9,y-r*1.5);c.stroke();
      this.circle(x+r*.9,y-r*1.5,Math.max(1,s*.05),'#e6bd77');if(!reduced){c.strokeStyle='#e0b16b';c.lineWidth=1;const t=bomb.phase;c.beginPath();c.moveTo(x+r*.9,y-r*1.5);c.lineTo(x+r*(1.1+.2*Math.sin(t)),y-r*(1.8+.2*Math.cos(t)));c.stroke();}
      this.circle(x-r*.22,y-r*.15,Math.max(.6,r*.1),'#dae2cf');this.circle(x+r*.22,y-r*.15,Math.max(.6,r*.1),'#dae2cf');
    }
    if(game.state==='setup')this.fogAlpha=0;else this.fogAlpha=reduced?game.fog:this.fogAlpha+(game.fog-this.fogAlpha)*(1-Math.exp(-Math.min(dt,.1)*7));
    if(this.fogAlpha>.005){c.save();c.globalAlpha=this.fogAlpha;c.fillStyle='#e6eade';c.fillRect(0,0,g.size,g.size);for(let i=0;i<13;i++){const x=((i*83+Math.sin(time*.18+i)*27)%g.size+g.size)%g.size,y=((i*117+Math.cos(time*.12+i)*24)%g.size+g.size)%g.size,r=g.size*(.13+i%3*.025);const cloud=c.createRadialGradient(x,y,0,x,y,r);cloud.addColorStop(0,'#f8f8e9dd');cloud.addColorStop(1,'#f5f7e500');this.circle(x,y,r,cloud);}c.restore();}
    const ball=game.ball,x=ball.x*s,y=ball.y*s,r=s*BALL_RADIUS;
    const ended=game.state==='ending'||game.state==='finished',win=game.outcome==='won',progress=ended?clamp(game.endElapsed/.9,0,1):0;
    if(!(ended&&!win&&progress>.1)){
      c.save();if(win&&ended){c.globalAlpha=1-progress;c.translate(x,y);c.scale(1-progress*.75,1-progress*.75);c.translate(-x,-y);}
      this.circle(x+1.5,y+2.2,r*1.08,'#45685329');const glass=c.createRadialGradient(x-r*.35,y-r*.4,.1,x,y,r);glass.addColorStop(0,'#edf8d7');glass.addColorStop(.35,'#b8ded0');glass.addColorStop(.8,'#7cb29d');glass.addColorStop(1,'#609783');this.circle(x,y,r,glass,'#537f6c',Math.max(.8,s*.035));
      c.save();c.translate(x,y);c.rotate((ball.x+ball.y)*2);c.strokeStyle='#d7efccbb';c.lineWidth=Math.max(.7,r*.17);c.beginPath();c.arc(0,0,r*.65,-1.1,1.4);c.stroke();c.restore();this.circle(x-r*.3,y-r*.38,r*.22,'#fffde8');c.restore();
    }
    const clearAge=game.elapsed-game.clearedAt;
    if(clearAge>=0&&clearAge<.7&&!reduced){c.save();c.globalAlpha=1-clearAge/.7;this.circle(x,y,12+clearAge*g.size*.9,null,'#f9f9df',2);c.restore();}
    if(ended&&!win&&progress<1){c.save();c.globalAlpha=1-progress;for(let i=0;i<12;i++){const a=i/12*Math.PI*2,spread=(6+progress*35),px=x+Math.cos(a)*spread,py=y+Math.sin(a)*spread;this.circle(px,py,(3+(1-progress)*7)*(i%2?.7:1),i%3?'#d6b48b':'#f0dfab');}c.restore();}
    if(ended&&win&&progress<1&&!reduced){c.save();c.globalAlpha=1-progress;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;c.fillStyle=['#c4ba8b','#9dbb91','#a7c8b9'][i%3];c.fillRect(x+Math.cos(a)*progress*40,y+Math.sin(a)*progress*35-10*progress,3,2);}c.restore();}
    c.restore();c.restore();
  }
}
