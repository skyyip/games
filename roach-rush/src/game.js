export const DOUBLE_TAP=350,MOUSE_HOLD=500,SWIPE_DISTANCE=28;
export const FLYING_POINTS=Object.freeze({small:3,big:4});
export const ANT_FLICK_SPEED=.25,MAX_ANTS=5,MAX_MICE=4;
export const ANT_PENALTY=3,SPRAY_DELAY=220;
export const DURATIONS=Object.freeze([120,180]),ITEM_USES=3;
export const HOLES=Object.freeze([{x:.065,y:.09},{x:.065,y:.93},{x:.935,y:.93},{x:.935,y:.09}]);
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const angleDifference=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export class RoachGame {
  constructor({duration=120,random=Math.random,now=()=>performance.now()}={}){this.random=random;this.now=now;this.holes=HOLES;this.bounds={left:.055,right:.945,top:.065,bottom:.935};this.reset(duration);}
  setGeometry(holes){
    this.holes=holes.map(point=>({...point}));
    this.bounds={left:Math.min(...holes.map(p=>p.x)),right:Math.max(...holes.map(p=>p.x)),top:Math.min(...holes.map(p=>p.y)),bottom:Math.max(...holes.map(p=>p.y))};
  }
  reset(duration=this.duration){
    if(!DURATIONS.includes(duration))throw new RangeError('Choose 120 or 180 seconds.');
    this.duration=duration;this.state='idle';this.entities=new Map();this.score=0;this.stats={small:0,big:0,flying:0,mice:0,antsHit:0,antsFlicked:0,sprayed:0,antsSprayed:0,trapped:0};this.id=0;this.startedAt=0;this.updatedAt=0;this.mouseHoles=[];this.spawnHole=0;this.spraysLeft=ITEM_USES;this.sprayClouds=[];this.trapsLeft=ITEM_USES;this.traps=new Map();this.trapId=0;
  }
  get sprayUsed(){return this.spraysLeft===0;}
  get sprayCloud(){return this.sprayClouds.at(-1)||null;}
  get remaining(){return this.state==='idle'?this.duration*1000:Math.max(0,this.duration*1000-(this.now()-this.startedAt));}
  start(){
    this.reset();this.state='playing';this.startedAt=this.updatedAt=this.now();
    for(let hole=0;hole<HOLES.length;hole++)this.spawnRoach(hole);
    this.nextRoach=this.now()+750;this.nextMouse=this.now()+6000+this.random()*3000;
    this.nextAnt=this.now()+12000+this.random()*6000;
  }
  expire(){if(this.state==='playing'&&this.remaining<=0){this.state='finished';return true;}return false;}
  active(){this.expire();return this.state==='playing';}
  create(type,hole){
    const now=this.now(),origin=this.holes[hole],heading=Math.atan2(.5-origin.x,-(.5-origin.y));
    const entity={id:this.id++,type,hole,x:origin.x,y:origin.y,heading,desired:heading,phase:this.random()*Math.PI*2,mode:'ground',flight:0,
      size:type==='roach'?(this.random()<.65?'small':'big'):type,turnAt:now+1200+this.random()*1800,transitionAt:now+2500+this.random()*4000,dazedUntil:0,lastTap:null};
    this.entities.set(entity.id,entity);return entity;
  }
  spawnRoach(hole){return this.create('roach',hole);}
  spawnAnt(hole=Math.floor(this.random()*HOLES.length)){
    const ants=[...this.entities.values()].filter(e=>e.type==='ant');
    if(ants.length>=MAX_ANTS)return null;
    const ant=this.create('ant',hole);ant.heading+=(ant.id%3-1)*.25;ant.desired=ant.heading;return ant;
  }
  spawnMouse(){
    if([...this.entities.values()].filter(e=>e.type==='mouse').length>=MAX_MICE)return null;
    if(!this.mouseHoles.length){
      this.mouseHoles=HOLES.map((_,index)=>index);
      for(let i=this.mouseHoles.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.mouseHoles[i],this.mouseHoles[j]]=[this.mouseHoles[j],this.mouseHoles[i]];}
    }
    return this.create('mouse',this.mouseHoles.pop());
  }
  advance(frozen=new Set()){
    const events={spawned:[],changed:[],sprayed:[],trapped:[],sprayReleased:false,finished:this.expire()};
    if(this.state!=='playing')return events;
    const now=this.now(),dt=clamp((now-this.updatedAt)/1000,0,.05),{left,right,top,bottom}=this.bounds;this.updatedAt=now;
    if(now>=this.nextRoach){
      if([...this.entities.values()].filter(e=>e.type==='roach').length<24){events.spawned.push(this.spawnRoach(this.spawnHole));this.spawnHole=(this.spawnHole+1)%HOLES.length;}
      this.nextRoach=now+650+this.random()*400;
    }
    if(now>=this.nextMouse){
      if([...this.entities.values()].filter(e=>e.type==='mouse').length<MAX_MICE)events.spawned.push(this.spawnMouse());
      this.nextMouse=now+7500+this.random()*4500;
    }
    if(now>=this.nextAnt){
      const ant=this.spawnAnt();if(ant)events.spawned.push(ant);
      this.nextAnt=now+2000+this.random()*6000;
    }
    const mouseSteps=new Map();
    for(const entity of this.entities.values()){
      if(frozen.has(entity.id)||now<entity.dazedUntil)continue;
      if(entity.type==='mouse')mouseSteps.set(entity.id,{x:entity.x,y:entity.y});
      if(entity.type==='roach'&&now>=entity.transitionAt){
        if(entity.mode==='flying'){entity.mode='ground';entity.transitionAt=now+2500+this.random()*4000;events.changed.push(entity.id);}
        else if(this.random()<.45){entity.mode='flying';entity.transitionAt=now+2600+this.random()*3000;events.changed.push(entity.id);}
        else entity.transitionAt=now+1800+this.random()*3500;
      }
      if(now>=entity.turnAt){entity.desired=entity.heading+(this.random()-.5)*Math.PI*1.6;entity.turnAt=now+700+this.random()*1600;}
      entity.heading+=angleDifference(entity.desired,entity.heading)*Math.min(1,dt*4);
      const speed=entity.type==='mouse'?.32:entity.type==='ant'?.08:entity.mode==='flying'?.17:entity.size==='big'?.075:.11;
      entity.x+=Math.sin(entity.heading)*speed*dt;entity.y-=Math.cos(entity.heading)*speed*dt;
      if(entity.x<left||entity.x>right||entity.y<top||entity.y>bottom){
        entity.x=clamp(entity.x,left,right);entity.y=clamp(entity.y,top,bottom);
        entity.desired=Math.atan2(.5-entity.x,-(.5-entity.y))+(this.random()-.5)*.6;
        entity.heading+=angleDifference(entity.desired,entity.heading)*.45;
      }
      entity.phase+=dt*(entity.type==='mouse'?15:entity.type==='ant'?10:entity.mode==='flying'?25:12);
      entity.flight+=(Number(entity.mode==='flying')-entity.flight)*Math.min(1,dt*6);
    }
    for(const cloud of this.sprayClouds)if(!cloud.applied&&now>=cloud.releaseAt){
      cloud.applied=true;events.sprayReleased=true;
      for(const entity of [...this.entities.values()])if(['roach','ant'].includes(entity.type)&&((entity.x-cloud.x)/cloud.radiusX)**2+((entity.y-cloud.y)/cloud.radiusY)**2<=1){
        const ant=entity.type==='ant';events.sprayed.push(this.award(entity,ant?'antsSprayed':'sprayed',ant?-ANT_PENALTY:1));
      }
    }
    for(const trap of this.traps.values())if(trap.armed){
      for(const mouse of this.entities.values())if(mouse.type==='mouse'&&!frozen.has(mouse.id)){
        const from=mouseSteps.get(mouse.id)||mouse;
        const normalize=p=>({x:(p.x-trap.x)/trap.radiusX,y:(p.y-trap.y)/trap.radiusY});
        if(distanceToSegment({x:0,y:0},normalize(from),normalize(mouse))<=1){
          trap.armed=false;this.traps.delete(trap.id);events.trapped.push({...this.award(mouse,'trapped',6),trapId:trap.id});break;
        }
      }
    }
    // Gentle separation between free ground creatures keeps touch targets reachable.
    const ground=[...this.entities.values()].filter(e=>e.mode==='ground');
    for(let i=0;i<ground.length;i++)for(let j=i+1;j<ground.length;j++){
      const a=ground[i],b=ground[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),gap=a.type==='mouse'||b.type==='mouse'?.085:.065;
      if(d>=gap||d===0)continue;
      const push=(gap-d)*.18,ax=dx/d*push,ay=dy/d*push;
      if(!frozen.has(a.id)&&now>=a.dazedUntil){a.x=clamp(a.x-ax,left,right);a.y=clamp(a.y-ay,top,bottom);}
      if(!frozen.has(b.id)&&now>=b.dazedUntil){b.x=clamp(b.x+ax,left,right);b.y=clamp(b.y+ay,top,bottom);}
    }
    return events;
  }
  award(entity,kind,points){
    if(!this.entities.delete(entity.id))return null;
    this.score+=points;this.stats[kind]++;return {id:entity.id,kind,points,x:entity.x,y:entity.y};
  }
  tap(id){
    if(!this.active())return null;const entity=this.entities.get(id);
    if(entity?.type==='ant')return this.award(entity,'antsHit',-ANT_PENALTY);
    if(!entity||entity.type!=='roach'||entity.mode!=='ground')return null;
    if(entity.size==='small')return this.award(entity,'small',1);
    const now=this.now();
    if(entity.lastTap!==null&&now-entity.lastTap<=DOUBLE_TAP)return this.award(entity,'big',2);
    entity.lastTap=now;entity.dazedUntil=now+DOUBLE_TAP;return {id,kind:'primed',points:0};
  }
  swipe(id,distance){
    if(!this.active()||distance<SWIPE_DISTANCE)return null;
    const entity=this.entities.get(id);
    if(entity?.type==='ant')return this.award(entity,'antsHit',-ANT_PENALTY);
    return entity?.type==='roach'&&entity.mode==='flying'?this.award(entity,'flying',FLYING_POINTS[entity.size]):null;
  }
  catchMouse(id,held,inCage){
    if(!this.active()||held<MOUSE_HOLD||!inCage)return null;
    const entity=this.entities.get(id);return entity?.type==='mouse'?this.award(entity,'mice',6):null;
  }
  flickAnt(id,distance,speed){
    if(!this.active()||distance<SWIPE_DISTANCE||speed<ANT_FLICK_SPEED)return null;
    const entity=this.entities.get(id);
    return entity?.type==='ant'?this.award(entity,'antsFlicked',0):null;
  }
  useSpray(area){
    if(!this.active()||this.sprayUsed||!validArea(area))return null;
    this.spraysLeft--;const cloud={...area,releaseAt:this.now()+SPRAY_DELAY,applied:false};this.sprayClouds.push(cloud);return cloud;
  }
  placeTrap(area){
    if(!this.active()||this.trapsLeft<=0||!validArea(area))return null;
    const trap={...area,id:this.trapId++,armed:true};this.traps.set(trap.id,trap);this.trapsLeft--;return trap;
  }
  dropAnt(id,x,y){const entity=this.entities.get(id);if(entity?.type==='ant'){entity.x=clamp(x,this.bounds.left,this.bounds.right);entity.y=clamp(y,this.bounds.top,this.bounds.bottom);}}
  dropMouse(id,x,y){const entity=this.entities.get(id);if(entity?.type==='mouse'){entity.x=clamp(x,this.bounds.left,this.bounds.right);entity.y=clamp(y,this.bounds.top,this.bounds.bottom);}}
}
function validArea(area){return area&&['x','y','radiusX','radiusY'].every(k=>Number.isFinite(area[k]))&&area.x>=0&&area.x<=1&&area.y>=0&&area.y<=1&&area.radiusX>0&&area.radiusY>0&&area.radiusX<=1&&area.radiusY<=1;}
export function distanceToSegment(point,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,t=clamp(((point.x-a.x)*dx+(point.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);
  return Math.hypot(point.x-a.x-dx*t,point.y-a.y-dy*t);
}
export function antFlick(points,end){
  const last=points.at(-1);if(!last||end.t-last.t>140)return null;
  const from=points.find(p=>end.t-p.t<=140)||last,dx=end.x-from.x,dy=end.y-from.y,distance=Math.hypot(dx,dy),speed=distance/Math.max(1,end.t-from.t);
  return distance>=SWIPE_DISTANCE&&speed>=ANT_FLICK_SPEED?{dx,dy,distance,speed}:null;
}
