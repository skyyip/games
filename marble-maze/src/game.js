import {LEVELS,levelById} from './levels.js';
export const BALL_RADIUS=.22,BOMB_RADIUS=.22,PAIR_WINDOW=1.5,SHAKE_GAP=.22;
export const clamp=(n,min=-1,max=1)=>Math.max(min,Math.min(max,n));
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function segmentDistance(a,b){const dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,t=den?clamp(-(a.x*dx+a.y*dy)/den,0,1):0;return Math.hypot(a.x+t*dx,a.y+t*dy);}
export function routeAt(route,progress){const last=route.length-1,t=clamp(progress,0,last),i=Math.min(Math.floor(t),last-1),f=t-i;return {x:route[i].x+.5+(route[i+1].x-route[i].x)*f,y:route[i].y+.5+(route[i+1].y-route[i].y)*f};}
export function moveBall(ball,grid,dt){
  ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;let hit=false;
  for(let pass=0;pass<3;pass++)for(let y=Math.floor(ball.y-BALL_RADIUS);y<=Math.floor(ball.y+BALL_RADIUS);y++)for(let x=Math.floor(ball.x-BALL_RADIUS);x<=Math.floor(ball.x+BALL_RADIUS);x++){
    if(grid[y]?.[x])continue;
    const px=clamp(ball.x,x,x+1),py=clamp(ball.y,y,y+1),dx=ball.x-px,dy=ball.y-py,d=Math.hypot(dx,dy);
    if(d>=BALL_RADIUS)continue;
    let nx,ny,depth;
    if(d>1e-9){nx=dx/d;ny=dy/d;depth=BALL_RADIUS-d;}
    else{const sides=[{v:ball.x-x,nx:-1,ny:0},{v:x+1-ball.x,nx:1,ny:0},{v:ball.y-y,nx:0,ny:-1},{v:y+1-ball.y,nx:0,ny:1}].sort((a,b)=>a.v-b.v);({nx,ny}=sides[0]);depth=BALL_RADIUS+sides[0].v;}
    ball.x+=nx*(depth+1e-6);ball.y+=ny*(depth+1e-6);const v=ball.vx*nx+ball.vy*ny;if(v<0){ball.vx-=v*1.18*nx;ball.vy-=v*1.18*ny;}hit=true;
  }
  return hit;
}
export class MazeGame {
  constructor({random=Math.random}={}){this.random=random;this.reset();}
  reset(levelId=1){
    this.level=levelById(levelId);this.state='setup';this.ball={...this.level.start,vx:0,vy:0};this.input={x:0,y:0};this.elapsed=0;this.accumulator=0;this.fog=0;this.fogStarted=null;this.nextFog=this.level.fogAt;this.shakes=0;this.lastShake=-Infinity;this.clearedAt=-Infinity;this.bombs=[];this.pending=null;this.nextBomb=8;this.bombId=0;this.lastRoute=-1;this.outcome=null;this.endElapsed=0;this.wallHits=0;this.shakeImpacts=0;
  }
  start(levelId=this.level.id){this.reset(levelId);this.state='playing';}
  setInput(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)){this.input={x:0,y:0};return;}const n=Math.max(1,Math.hypot(x,y));this.input={x:clamp(x/n),y:clamp(y/n)};}
  pause(){if(this.state!=='playing')return false;this.state='paused';this.input={x:0,y:0};this.accumulator=0;return true;}
  resume(){if(this.state!=='paused')return false;this.state='playing';return true;}
  abandon(){this.state='setup';this.input={x:0,y:0};this.bombs=[];this.pending=null;}
  shake(vector={x:1,y:0}){
    if(this.state!=='playing'||this.elapsed-this.lastShake<SHAKE_GAP)return null;
    const x=Number.isFinite(vector.x)?vector.x:0,y=Number.isFinite(vector.y)?vector.y:0,n=Math.hypot(x,y);
    if(n<.001)return null;
    this.ball.vx+=x/n*2.5;this.ball.vy+=y/n*2.5;const speed=Math.hypot(this.ball.vx,this.ball.vy);if(speed>6){this.ball.vx*=6/speed;this.ball.vy*=6/speed;}
    this.shakeImpacts++;this.shakes=this.elapsed-this.lastShake<=PAIR_WINDOW?this.shakes+1:1;this.lastShake=this.elapsed;
    if(this.shakes>=2){this.shakes=0;if(this.fogStarted!==null){this.fog=0;this.fogStarted=null;this.nextFog=this.elapsed+Math.max(7,14-this.level.id);this.clearedAt=this.elapsed;return 'cleared';}}
    return 'shake';
  }
  end(outcome){this.outcome=outcome;this.state='ending';this.endElapsed=0;this.input={x:0,y:0};}
  advance(seconds){
    const events=[];if(!['playing','ending'].includes(this.state)||!Number.isFinite(seconds)||seconds<=0)return events;
    if(seconds>.5&&this.state==='playing'){this.pause();return ['suspended'];}
    this.accumulator+=Math.min(seconds,.5);const dt=1/120;
    while(this.accumulator+1e-9>=dt&&['playing','ending'].includes(this.state)){
      this.accumulator-=dt;
      if(this.state==='ending'){this.endElapsed+=dt;if(this.endElapsed>=.9){this.state='finished';events.push('finished');}continue;}
      this.elapsed+=dt;if(this.elapsed-this.lastShake>PAIR_WINDOW)this.shakes=0;
      if(this.fogStarted===null&&this.elapsed>=this.nextFog){this.fogStarted=this.elapsed;events.push('fog');}
      if(this.fogStarted!==null)this.fog=Math.min(.93,(this.elapsed-this.fogStarted)/7*.93);
      if(!this.pending&&this.elapsed>=this.nextBomb&&this.bombs.length<this.level.maxBombs){
        const choices=[0,1,2].filter(i=>i!==this.lastRoute),route=choices[Math.floor(clamp(this.random(),0,.999999)*choices.length)];
        this.pending={route,at:this.elapsed+1.6};this.nextBomb=this.elapsed+11+this.random()*4;events.push('warning');
      }
      if(this.pending&&this.elapsed>=this.pending.at){const route=[...this.level.routes[this.pending.route]].reverse();this.lastRoute=this.pending.route;this.bombs.push({id:++this.bombId,route,index:this.pending.route,progress:0,...routeAt(route,0),phase:0});this.pending=null;events.push('bomb');}
      const before={x:this.ball.x,y:this.ball.y};
      this.ball.vx+=(this.input.x*16.5-this.ball.vx*3.2)*dt;this.ball.vy+=(this.input.y*16.5-this.ball.vy*3.2)*dt;
      if(moveBall(this.ball,this.level.grid,dt))this.wallHits++;
      let collision=false;
      for(const bomb of this.bombs){const old={x:bomb.x,y:bomb.y};bomb.progress+=this.level.bombSpeed*dt;Object.assign(bomb,routeAt(bomb.route,bomb.progress));bomb.phase+=dt*7;
        if(segmentDistance({x:before.x-old.x,y:before.y-old.y},{x:this.ball.x-bomb.x,y:this.ball.y-bomb.y})<=BALL_RADIUS+BOMB_RADIUS)collision=true;
      }
      this.bombs=this.bombs.filter(b=>b.progress<b.route.length-1+.6);
      if(collision){this.end('lost');events.push('lost');}
      else if(distance(this.ball,this.level.goal)<.32){this.end('won');events.push('won');}
    }
    return events;
  }
}
export function formatTime(seconds){const h=Math.floor(Math.max(0,Number.isFinite(seconds)?seconds:0)*100+1e-7);return `${String(Math.floor(h/6000)).padStart(2,'0')}:${String(Math.floor(h/100)%60).padStart(2,'0')}.${String(h%100).padStart(2,'0')}`;}
export function topThree(rows){return Array.isArray(rows)?rows.filter(r=>r&&Number.isFinite(r.seconds)&&r.seconds>0&&Number.isSafeInteger(r.at)&&r.at>=0&&r.at<=8.64e15).map(r=>({seconds:r.seconds,at:r.at})).sort((a,b)=>a.seconds-b.seconds||a.at-b.at).slice(0,3):[];}
export function readRecords(raw){const blank=()=>Object.fromEntries(LEVELS.map(l=>[l.id,[]]));try{const data=JSON.parse(raw);if(data?.version===1)return Object.fromEntries(LEVELS.map(l=>[l.id,topThree(data.levels?.[l.id])]));}catch{}return blank();}
export function addRecord(records,levelId,seconds,at){levelById(levelId);const row=topThree([{seconds,at}]);if(!row.length)throw new RangeError('Invalid record.');return {...records,[levelId]:topThree([...(records[levelId]||[]),row[0]])};}
