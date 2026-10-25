import {WISHES,ACTORS,PROPS} from './catalog.js';
export const ROUND_SECONDS=60,PARADE_SECONDS=18;
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export class BunGame{
 constructor({random=Math.random}={}){this.random=random;this.reset();}
 reset(){this.state='idle';this.elapsed=0;this.x=150;this.targetX=150;this.vx=0;this.y=0;this.angle=0;this.angularVelocity=0;this.direction=0;this.stun=0;this.score=0;this.grabs=0;this.slips=0;this.byWish=Object.fromEntries(WISHES.map(w=>[w.id,0]));this.buns=[];this.hazards=[];this.rivals=[];this.nextRow=0;this.nextRival=9;this.serial=0;this.result=null;this.maxHeight=0;this.accumulator=0;this.notices=[];}
 start(){this.reset();this.state='playing';this.spawnAhead();}
 pause(){if(this.state!=='playing')return false;this.state='paused';this.direction=0;return true;}
 resume(){if(this.state!=='paused')return false;this.state='playing';return true;}
 abandon(){this.reset();}
 steer(x){if(this.state==='playing'&&Number.isFinite(x))this.targetX=clamp(x,38,262);}
 setDirection(n){this.direction=this.state==='playing'&&Number.isFinite(n)?clamp(n,-1,1):0;}
 spawnAhead(){
  while(this.nextRow*64<Math.max(this.y,0)+650){
   const row=this.nextRow++,y=68+row*64,empty=Math.floor(clamp(this.random(),0,.999999)*3);
   for(let lane=0;lane<3;lane++)if(lane!==empty){const wish=WISHES[Math.floor(clamp(this.random(),0,.999999)*WISHES.length)];this.buns.push({id:`bun-${this.serial++}`,wish:wish.id,x:54+lane*96,y:y+(lane%2)*9});}
   if(row>2&&row%5===3){const lane=(empty+1)%3;this.hazards.push({id:`wet-${row}`,x:54+lane*96,y:y+32,hit:false});}
  }
  this.buns=this.buns.filter(b=>b.y>this.y-250);this.hazards=this.hazards.filter(b=>b.y>this.y-250);
 }
 canReach(bun){return this.state==='playing'&&this.stun<=0&&Math.abs(bun.x-this.x)<=78&&Math.abs(bun.y-this.y)<=112;}
 grab(id){
  const index=this.buns.findIndex(b=>b.id===id);if(index<0||!this.canReach(this.buns[index]))return null;
  const bun=this.buns.splice(index,1)[0],wish=WISHES.find(w=>w.id===bun.wish);this.score+=wish.points;this.grabs++;this.byWish[wish.id]++;return {...bun,points:wish.points,name:wish.name};
 }
 slip(kind,direction=1){if(this.stun>0)return;this.slips++;this.y=Math.max(0,this.y-38);this.vx+=direction*70;this.angularVelocity+=direction*.7;this.stun=.85;this.notices.push({type:'slip',kind});}
 advance(seconds){
  if(this.state!=='playing'||!Number.isFinite(seconds)||seconds<=0)return [];
  this.notices=[];this.accumulator+=Math.min(seconds,ROUND_SECONDS-this.elapsed);const dt=1/120;
  while(this.accumulator+1e-9>=dt&&this.state==='playing'){
   this.accumulator-=dt;this.elapsed=Math.min(ROUND_SECONDS,this.elapsed+dt);
   this.targetX=clamp(this.targetX+this.direction*180*dt,38,262);const acceleration=(this.targetX-this.x)*18-this.vx*8;this.vx+=acceleration*dt;this.x=clamp(this.x+this.vx*dt,28,272);
   const gust=this.elapsed<6?0:Math.sin(this.elapsed*.73)*.35;this.angularVelocity+=(-this.angle*9-this.angularVelocity*4+this.vx*.014+gust)*dt;this.angle=clamp(this.angle+this.angularVelocity*dt,-1,1);
   if(this.stun>0)this.stun=Math.max(0,this.stun-dt);else this.y+=34*(1-Math.abs(this.angle)*.3)*dt;
   this.maxHeight=Math.max(this.maxHeight,this.y);if(Math.abs(this.angle)>.88)this.slip('balance',-Math.sign(this.angle));
   for(const wet of this.hazards)if(!wet.hit&&Math.abs(wet.x-this.x)<26&&Math.abs(wet.y-this.y)<24&&this.stun<=0){wet.hit=true;this.slip('bamboo',this.x<150?1:-1);}
   if(this.elapsed>=this.nextRival){const side=this.random()<.5?-1:1;this.rivals.push({id:`rival-${this.serial++}`,x:side<0?54:246,base:side<0?70:230,y:this.y+190,age:0,hit:false});this.nextRival=this.elapsed+7+this.random()*3;}
   for(const rival of this.rivals){rival.age+=dt;rival.y-=10*dt;rival.x=clamp(rival.base+Math.sin(rival.age*1.1)*55,35,265);if(!rival.hit&&Math.abs(rival.x-this.x)<31&&Math.abs(rival.y-this.y)<34&&this.stun<=0){rival.hit=true;this.slip('rival',this.x<rival.x?-1:1);}}
   this.rivals=this.rivals.filter(r=>r.y>this.y-180&&r.age<24);this.spawnAhead();
   if(this.elapsed+1e-7>=ROUND_SECONDS){this.elapsed=ROUND_SECONDS;this.state='finished';this.direction=0;this.result={score:this.score,grabs:this.grabs,slips:this.slips,height:Math.round(this.maxHeight)/100,seconds:ROUND_SECONDS,byWish:{...this.byWish}};this.notices.push({type:'finished'});}
  }
  return this.notices;
 }
 get remaining(){return Math.max(0,ROUND_SECONDS-this.elapsed);}
}
export class ParadeGame{
 constructor(){this.state='idle';this.elapsed=0;this.claps=new Set();this.result=null;}
 start({actor='apprentice',prop='bun-flag'}={}){const a=ACTORS.find(x=>x.id===actor),p=PROPS.find(x=>x.id===prop);if(!a||!p)throw new RangeError('Choose a parade outfit.');this.state='playing';this.elapsed=0;this.claps=new Set();this.actor=actor;this.prop=prop;this.result=null;}
 clap(id){if(this.state!=='playing'||!Number.isInteger(id)||id<0||id>5||this.claps.has(id))return false;this.claps.add(id);return true;}
 pause(){if(this.state!=='playing')return false;this.state='paused';return true;}
 resume(){if(this.state!=='paused')return false;this.state='playing';return true;}
 abandon(){this.state='idle';this.result=null;}
 advance(seconds){if(this.state!=='playing'||!Number.isFinite(seconds)||seconds<=0)return false;this.elapsed=Math.min(PARADE_SECONDS,this.elapsed+seconds);if(this.elapsed<PARADE_SECONDS)return false;const laughs=6+this.claps.size+ACTORS.find(x=>x.id===this.actor).laughs+PROPS.find(x=>x.id===this.prop).laughs;this.result={laughs,fortune:Math.ceil(laughs/3),claps:this.claps.size};this.state='finished';return true;}
 get remaining(){return Math.max(0,PARADE_SECONDS-this.elapsed);}
}
