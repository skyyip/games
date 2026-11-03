import {animal} from './animals.js';
import {VARIANTS,VARIANT_CHANCE,surface,dangerous} from './platforms.js';
export const MAX_JUMP=540,CHARGE_UP_MS=1000,SINK_MS=2500,FISH_WARNING_MS=2100,SPLASH_MS=420,DROWN_MS=1900,CAMERA_MS=520;
export const RIVER_RULES=Object.freeze({minGap:152,maxGap:208,normalRadius:58,smallChance:.09,sinkChance:.05,thornChance:.05,fishChance:.05,lilyChance:.4});
export const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export function chargePower(ms){const t=Math.max(0,ms)/CHARGE_UP_MS%2;return t<=1?t:2-t;}
export function powerColor(power){const t=clamp(power),a=t<.5?[103,185,99]:[245,202,78],b=t<.5?[245,202,78]:[227,89,72],f=t<.5?t*2:(t-.5)*2;return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*f)).join(', ')})`;}
export class FroggerGame{
 constructor({random=Math.random,now=()=>performance.now()}={}){this.random=random;this.now=now;this.reset();}
 reset(){this.animal='frog';this.skillCharges=0;this.skillSerial=0;this.state='ready';this.score=0;this.bonusCoins=0;this.softLanding=false;this.slideUntil=0;this.stumps=[];this.events=[];this.jump=null;this.fall=null;this.chargeAt=0;this.deadline=null;this.anglerDeadline=null;this.landedAt=-Infinity;this.pausedAt=null;this.pausedTotal=0;this.cameraFrom=0;this.cameraTarget=0;this.cameraAt=-Infinity;this.route=null;this.run=0;}
 get clock(){return (this.pausedAt??this.now())-this.pausedTotal;}
 get paused(){return this.pausedAt!==null;}
 get current(){return this.stumps[0];}
 get targetIndex(){return this.stumps[1]?.thorns?2:1;}
 get target(){return this.stumps[this.targetIndex];}
 get power(){return this.state==='charging'?chargePower(this.clock-this.chargeAt):0;}
 get sinkRemaining(){return this.deadline===null?null:Math.max(0,this.deadline-this.clock);}
 get fishRemaining(){return this.anglerDeadline===null?null:Math.max(0,this.anglerDeadline-this.clock);}
 randomUnit(){return Math.max(0,Math.min(.999999999,Number(this.random())||0));}
 start({animal:kind='frog'}={}){this.reset();this.animal=animal(kind).id;this.skillCharges=1;this.state='idle';this.stumps=[{id:0,x:0,y:0,r:RIVER_RULES.normalRadius,sinking:false,thorns:false,angler:false,small:false,kind:'stump',route:'I'}];while(this.stumps.length<3)this.stumps.push(this.generate(this.stumps.at(-1),this.stumps.length));return this.current;}
 generate(previous,index){
  if(this.run<=0){const proposed=this.randomUnit()<.5?'I':'Z';this.route=proposed===this.route?(proposed==='I'?'Z':'I'):proposed;this.run=1+Math.floor(this.randomUnit()*2);}
  this.run--;let x=previous.x;
  if(this.route==='Z'){const sign=previous.x>70?-1:previous.x< -70?1:this.randomUnit()<.5?-1:1,span=96+this.randomUnit()*60;x=Math.max(-145,Math.min(145,previous.x+sign*span));}
  const y=previous.y+RIVER_RULES.minGap+this.randomUnit()*(RIVER_RULES.maxGap-RIVER_RULES.minGap),small=this.randomUnit()<RIVER_RULES.smallChance,r=small?42+Math.floor(this.randomUnit()*8):RIVER_RULES.normalRadius,hazard=this.randomUnit();
  const busy=this.stumps.some(dangerous)||dangerous(previous);
  const sinking=!busy&&hazard<RIVER_RULES.sinkChance,thorns=!busy&&hazard>=RIVER_RULES.sinkChance&&hazard<RIVER_RULES.sinkChance+RIVER_RULES.thornChance&&!previous.thorns,angler=!busy&&hazard>=RIVER_RULES.sinkChance+RIVER_RULES.thornChance&&hazard<RIVER_RULES.sinkChance+RIVER_RULES.thornChance+RIVER_RULES.fishChance;
  let kind=this.randomUnit()<RIVER_RULES.lilyChance?'lily':'stump';const variant=this.randomUnit();if(variant<VARIANT_CHANCE&&!sinking&&!thorns&&!angler){kind=VARIANTS[Math.min(6,Math.floor(variant/VARIANT_CHANCE*7))];if(kind==='ice'&&busy)kind='shell';}
  return {id:index,x,y,r,small,kind,sinking:sinking||kind==='ice',thorns,angler,route:this.route};
 }
 useSkill(){
  this.update();if(this.paused||!['idle','charging'].includes(this.state)||this.skillCharges<1)return false;
  this.cancelCharge();const next=this.stumps[1],current=this.current,kind=this.animal;
  const stabilize=p=>{p.sinking=false;p.angler=false;p.reinforced=true;};
  const widen=amount=>{next.r=Math.min(90,next.r+amount);next.small=false;};
  if(kind==='frog'){if(next.thorns)next.thorns=false;else widen(10);}
  if(kind==='penguin'){const danger=current.sinking||current.angler||next.sinking||next.angler;stabilize(current);stabilize(next);if(!danger)widen(10);}
  if(kind==='bunny'){next.thorns=false;widen(22);}
  if(kind==='monkey'){next.thorns=false;stabilize(next);widen(6);}
  if(kind==='otter'){current.angler=false;next.angler=false;widen(12);next.guarded=true;}
  if(kind==='duck'){stabilize(current);next.thorns=false;widen(8);}
  if(kind==='cat'){next.thorns=false;widen(8);this.softLanding=true;}
  if(kind==='panda'){stabilize(current);stabilize(next);widen(14);}
  if(kind==='fox'){next.thorns=false;stabilize(next);this.softLanding=true;}
  if(kind==='capybara'){for(const pad of [current,next]){stabilize(pad);pad.thorns=false;}}
  if(!current.sinking)this.deadline=null;if(!current.angler)this.anglerDeadline=null;
  this.skillCharges--;this.skillSerial++;this.events.push({type:'skill',animal:kind,at:this.clock,point:{x:next.x,y:next.y},radius:next.r});return true;
 }
 beginCharge(){this.update();if(this.paused||this.state!=='idle'||this.clock+1e-7<this.slideUntil)return false;this.state='charging';this.chargeAt=this.clock;return true;}
 cancelCharge(){if(this.state!=='charging')return false;this.state='idle';return true;}
 release(){
  this.update();if(this.paused||this.state!=='charging')return false;
  const power=this.power,from=surface(this.current,this.clock),target=surface(this.target,this.clock+560+power*180),length=distance(from,target),travel=power*MAX_JUMP,error=Math.abs(travel-length),end={x:from.x+(target.x-from.x)*travel/length,y:from.y+(target.y-from.y)*travel/length};
  const thornHit=this.stumps[1].thorns&&distance(end,this.stumps[1])<=this.stumps[1].r,success=error<=target.r+(this.softLanding?12:0)+1e-7&&!thornHit;
  const obstacle=!success&&this.stumps.find(p=>distance(end,p)<p.r+18),waterEnd=obstacle?{x:obstacle.x+(obstacle.x>=0?-1:1)*(obstacle.r+34),y:obstacle.y-20}:end;
  this.softLanding=false;this.jump={at:this.clock,duration:560+power*180,from:{x:from.x,y:from.y},end,visualEnd:success?{x:target.x,y:target.y}:waterEnd,success,error,power,travel,steps:this.targetIndex,failure:thornHit?'thorns':travel<length?'short':'long',cameraFrom:this.camera,cameraTo:from.y+(success?target.y-from.y:end.y-from.y)*.2};this.state='jumping';this.events.push({type:'jump',power,skipped:this.targetIndex-1});return true;
 }
 update(){
  if(this.paused)return;const now=this.clock;
  if(this.state==='jumping'&&now+1e-7>=this.jump.at+this.jump.duration){
   const landedAt=this.jump.at+this.jump.duration;this.cameraFrom=this.cameraTarget=this.jump.cameraTo;this.cameraAt=landedAt;
   if(this.jump.success){const skipped=this.jump.steps-1;this.score++;if(this.score%20===0){this.skillCharges++;this.events.push({type:'skill-ready',charges:this.skillCharges});}this.stumps.splice(0,this.jump.steps);while(this.stumps.length<3)this.stumps.push(this.generate(this.stumps.at(-1),this.stumps.at(-1).id+1));this.state='idle';this.cameraTarget=this.current.y;this.landedAt=landedAt;const perfect=this.jump.error<=surface(this.current,landedAt).r*.25,kind=this.current.kind;const bonus=perfect?(kind==='lotus'?2:kind==='shell'?3:0):0;this.bonusCoins+=bonus;this.softLanding=perfect&&kind==='mushroom';if(kind==='duck'){this.current.slideAt=landedAt;this.current.slideX=Math.sign(this.target.x-this.current.x)*12;this.slideUntil=landedAt+440;}this.deadline=this.current.sinking?landedAt+(kind==='ice'?3500:SINK_MS):null;this.anglerDeadline=this.current.angler?landedAt+FISH_WARNING_MS:null;this.events.push({type:'land',score:this.score,skipped,perfect,bonus,kind,soft:this.softLanding});}
   else this.drown(this.jump.visualEnd,this.jump.failure,landedAt);
  }
  if(this.state==='idle'||this.state==='charging'){
   const at=Math.min(this.deadline??Infinity,this.anglerDeadline??Infinity);
   if(now+1e-7>=at)this.drown(surface(this.current,at),at===this.anglerDeadline?'angler':'sunk',at);
  }
  if(this.state==='drowning'&&now+1e-7>=this.fall.at+DROWN_MS){this.state='over';this.events.push({type:'over',score:this.score,reason:this.fall.reason});}
 }
 drown(point,reason,at=this.clock){this.cancelCharge();this.state='drowning';this.fall={x:point.x,y:point.y,at,reason};this.events.push({type:'fall',reason});}
 pause(){if(this.paused||!['idle','charging','jumping','drowning'].includes(this.state))return false;this.cancelCharge();this.pausedAt=this.now();return true;}
 resume(){if(!this.paused)return false;this.pausedTotal+=this.now()-this.pausedAt;this.pausedAt=null;return true;}
 drainEvents(){return this.events.splice(0);}
 get needsAnimation(){return !this.paused&&(['charging','jumping','drowning'].includes(this.state)||this.state==='idle'&&(this.deadline!==null||this.anglerDeadline!==null||this.clock<this.cameraAt+CAMERA_MS||this.stumps.some(p=>['turtle','lotus','spinner'].includes(p.kind))||this.clock<this.slideUntil));}
 get camera(){if(this.state==='jumping'){const j=this.jump,t=clamp((this.clock-j.at)/j.duration);return j.cameraFrom+(j.cameraTo-j.cameraFrom)*t*t*(3-2*t);}const t=clamp((this.clock-this.cameraAt)/CAMERA_MS);return this.cameraFrom+(this.cameraTarget-this.cameraFrom)*smooth(t);}
 get frog(){
  if(this.state==='jumping'){
   const j=this.jump,t=clamp((this.clock-j.at)/j.duration);
   return {x:j.from.x+(j.visualEnd.x-j.from.x)*t,y:j.from.y+(j.visualEnd.y-j.from.y)*t,lift:4*t*(1-t)*(92+j.power*62),stretch:Math.sin(Math.PI*t)*.8,kick:Math.sin(Math.PI*clamp(t/.4)),tuck:Math.sin(Math.PI*smooth((t-.18)/.64)),reach:Math.sin(Math.PI*clamp((t-.65)/.35)),squat:j.power*(1-smooth(t/.18)),lean:Math.sign(j.visualEnd.x-j.from.x)*Math.sin(Math.PI*t)*.14,blink:0};
  }
  const p=this.state==='drowning'||this.state==='over'?this.fall:surface(this.current,this.clock),age=this.clock-this.landedAt,landing=age>=0&&age<390?.64*Math.sin(Math.PI*clamp(age/170))*Math.exp(-age/400)-.12*Math.sin(Math.PI*clamp((age-170)/220)):0;
  return {...p,lift:0,stretch:0,kick:0,tuck:0,reach:0,lean:0,blink:age>=0&&age<150?Math.sin(Math.PI*age/150)*.85:0,squat:this.state==='charging'?this.power:landing};
 }
}
