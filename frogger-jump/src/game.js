import {animal} from './animals.js';
import {equipment} from './equipment.js';
import {VARIANTS,VARIANT_CHANCE,surface,dangerous} from './platforms.js';
import {fishPose,fishContact,jumpPoint} from './fish.js';
export {FISH_WARNING_MS,FISH_LEAP_MS,FISH_REST_MS} from './fish.js';
export const MAX_JUMP=540,CHARGE_UP_MS=1000,SINK_MS=2500,SPLASH_MS=420,DROWN_MS=1900,CAMERA_MS=520;
export const RIVER_RULES=Object.freeze({minGap:152,maxGap:208,normalRadius:58,smallChance:.09,sinkChance:.05,thornChance:.05,fishChance:.05,lilyChance:.4});
// Use the upcoming landing number, including pads already visible ahead.
export function riverRules(jump=1){
 const t=Math.max(0,Math.min(1,(jump-20)/80)),mix=(easy,normal)=>easy+(normal-easy)*t;
 return {...RIVER_RULES,minGap:mix(144,152),maxGap:mix(196,208),normalRadius:mix(62,58),smallRadius:mix(46,42),smallChance:mix(.05,.09),sinkChance:mix(.025,.05),thornChance:mix(.025,.05),fishChance:mix(.025,.05),variantChance:mix(.08,VARIANT_CHANCE)};
}
export const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
export function chargePower(ms){const t=Math.max(0,ms)/CHARGE_UP_MS%2;return t<=1?t:2-t;}
export function powerColor(power){const t=clamp(power),a=t<.5?[103,185,99]:[245,202,78],b=t<.5?[245,202,78]:[227,89,72],f=t<.5?t*2:(t-.5)*2;return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*f)).join(', ')})`;}
export class FroggerGame{
 constructor({random=Math.random,now=()=>performance.now()}={}){this.random=random;this.now=now;this.reset();}
 reset(){this.animal='frog';this.riderOffset={x:0,y:0};this.equippedSkill='';this.companion='';this.gearCharges=0;this.companionReady=false;this.doubleArmed=false;this.adjustArmed=false;this.rescueArmed=false;this.routeChosen=-1;this.skillCharges=0;this.skillSerial=0;this.state='ready';this.score=0;this.bonusCoins=0;this.softLanding=false;this.fishShield=false;this.fishHazard=null;this.slideUntil=0;this.stumps=[];this.events=[];this.jump=null;this.fall=null;this.chargeAt=0;this.deadline=null;this.anglerDeadline=null;this.landedAt=-Infinity;this.pausedAt=null;this.pausedTotal=0;this.cameraFrom=0;this.cameraTarget=0;this.cameraAt=-Infinity;this.route=null;this.run=0;}
 get clock(){return (this.pausedAt??this.now())-this.pausedTotal;}
 get paused(){return this.pausedAt!==null;}
 get current(){return this.stumps[0];}
 get targetIndex(){if(this.state==='jumping'&&this.jump)return this.jump.steps;return this.doubleArmed||this.stumps[1]?.thorns?2:1;}
 get routeOffer(){if(this.state!=='idle'||this.score<20||this.current.id%7!==0||this.routeChosen===this.current.id||this.targetIndex!==1||dangerous(this.target))return null;return {x:this.target.x>0?-120:120,y:this.target.y};}
 get riverFriend(){return this.score<20?null:this.target?.mailChallenge?'postfrog':['dragonfly','firefly','postfrog'][Math.floor(this.score/8)%3];}
 chooseRoute(reward=false){if(!this.routeOffer||this.paused)return false;const next=this.target,offer=this.routeOffer;this.routeChosen=this.current.id;if(reward){next.x=offer.x;next.r*=.85;next.rewardBonus=1;}else next.r=Math.min(90,next.r+8);this.syncFish();this.events.push({type:'route',reward});return true;}
 useEquipment(){this.update();if(this.paused||this.state!=='idle'||this.gearCharges<1||this.doubleArmed||this.adjustArmed||this.rescueArmed||!this.equippedSkill)return false;if(this.equippedSkill==='double')this.doubleArmed=true;if(this.equippedSkill==='adjust')this.adjustArmed=true;if(this.equippedSkill==='rescue')this.rescueArmed=true;this.gearCharges--;this.syncFish();this.events.push({type:'equipment',id:this.equippedSkill});return true;}
 get target(){return this.stumps[this.targetIndex];}
 get power(){return this.state==='charging'?chargePower(this.clock-this.chargeAt):0;}
 get sinkRemaining(){return this.deadline===null?null:Math.max(0,this.deadline-this.clock);}
 get fish(){return fishPose(this.fishHazard,this.clock);}
 get fishRemaining(){return this.fish?.remaining??null;}
 syncFish(at=this.clock){
  if(!this.target?.angler){this.fishHazard=null;return;}
  const key=`${this.current.id}:${this.target.id}`;
  if(this.fishHazard?.key!==key){this.fishHazard={key,x:(this.current.x+this.target.x)/2,y:(this.current.y+this.target.y)/2,at};this.events.push({type:'fish-warning'});}
 }
 randomUnit(){return Math.max(0,Math.min(.999999999,Number(this.random())||0));}
 start({animal:kind='frog',skill='',companion=''}={}){this.reset();this.animal=animal(kind).id;this.equippedSkill=equipment('skill',skill)?.id??'';this.companion=equipment('companion',companion)?.id??'';this.gearCharges=this.equippedSkill?1:0;this.companionReady=!!this.companion;this.skillCharges=1;this.state='idle';this.stumps=[{id:0,x:0,y:0,r:riverRules().normalRadius,sinking:false,thorns:false,angler:false,small:false,kind:'stump',route:'I'}];while(this.stumps.length<3)this.stumps.push(this.generate(this.stumps.at(-1),this.stumps.length));this.syncFish();return this.current;}
 generate(previous,index){
  const rules=riverRules(this.score+this.stumps.length);
  if(this.run<=0){const proposed=this.randomUnit()<.5?'I':'Z';this.route=proposed===this.route?(proposed==='I'?'Z':'I'):proposed;this.run=1+Math.floor(this.randomUnit()*2);}
  this.run--;let x=previous.x;
  if(this.route==='Z'){const sign=previous.x>70?-1:previous.x< -70?1:this.randomUnit()<.5?-1:1,span=96+this.randomUnit()*60;x=Math.max(-145,Math.min(145,previous.x+sign*span));}
  const y=previous.y+rules.minGap+this.randomUnit()*(rules.maxGap-rules.minGap),small=this.randomUnit()<rules.smallChance,r=small?rules.smallRadius+Math.floor(this.randomUnit()*8):rules.normalRadius,hazard=this.randomUnit();
  const busy=this.stumps.some(dangerous)||dangerous(previous);
  const sinking=!busy&&hazard<rules.sinkChance,thorns=!busy&&hazard>=rules.sinkChance&&hazard<rules.sinkChance+rules.thornChance&&!previous.thorns,angler=!busy&&hazard>=rules.sinkChance+rules.thornChance&&hazard<rules.sinkChance+rules.thornChance+rules.fishChance;
  let kind=this.randomUnit()<rules.lilyChance?'lily':'stump';const variant=this.randomUnit();if(variant<rules.variantChance&&!sinking&&!thorns&&!angler){kind=VARIANTS[Math.min(6,Math.floor(variant/rules.variantChance*7))];if(kind==='ice'&&busy)kind='shell';}
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
  if(kind==='mochi'){this.fishShield=true;next.thorns=false;widen(10);}
  if(kind==='chiikawa'){this.fishShield=true;this.softLanding=true;this.target.r=Math.min(90,this.target.r+6);this.target.small=false;}
  if(kind==='hachiware'){for(const pad of this.stumps.slice(1)){pad.thorns=false;stabilize(pad);}widen(8);}
  if(kind==='usagi'){stabilize(current);this.softLanding=true;this.target.r=Math.min(90,this.target.r+16);this.target.small=false;}
  const widenTarget=amount=>{this.target.r=Math.min(90,this.target.r+amount);this.target.small=false;};
  if(kind==='kurimanju'){stabilize(current);this.target.angler=false;widenTarget(14);}
  if(kind==='rakko'){stabilize(current);for(const pad of this.stumps.slice(1)){pad.thorns=false;stabilize(pad);}widen(6);}
  if(kind==='momonga'){stabilize(current);next.thorns=false;widen(8);this.fishShield=true;}
  if(kind==='shisa'){for(const pad of this.stumps.slice(1))pad.thorns=false;widenTarget(18);this.softLanding=true;}
  if(kind==='shimajiro'){for(const pad of [current,next]){stabilize(pad);pad.thorns=false;}widen(18);}
  if(kind==='mermaid'){for(const pad of this.stumps.slice(1)){pad.angler=false;pad.thorns=false;}widenTarget(12);this.softLanding=true;}
  if(kind==='hitoha'){next.thorns=false;stabilize(next);widen(20);}
  if(kind==='futaba'){for(const pad of this.stumps)stabilize(pad);this.fishShield=true;widenTarget(6);}
  if(['elf-mage','mage-otter'].includes(kind)){stabilize(current);next.thorns=false;widen(kind==='elf-mage'?14:8);if(kind==='mage-otter')this.fishShield=true;}
  if(kind==='violet-mage'){this.fishShield=true;widenTarget(10);}
  if(kind==='red-warrior'){stabilize(current);for(const pad of this.stumps.slice(1))pad.thorns=false;}
  if(kind==='red-sprout'){next.thorns=false;widen(12);}
  if(kind==='blue-sprout'){stabilize(current);next.angler=false;}
  if(kind==='yellow-sprout'){this.softLanding=true;widenTarget(8);}
  if(kind==='bloom-bunny'){next.thorns=false;widen(12);this.softLanding=true;}
  if(!current.sinking)this.deadline=null;if(!current.angler)this.anglerDeadline=null;
  this.syncFish();this.skillCharges--;this.skillSerial++;this.events.push({type:'skill',animal:kind,at:this.clock,point:{x:next.x,y:next.y},radius:next.r});return true;
 }
 beginCharge(){this.update();if(this.paused||this.state!=='idle'||this.clock+1e-7<this.slideUntil)return false;this.state='charging';this.chargeAt=this.clock;return true;}
 cancelCharge(){if(this.state!=='charging')return false;this.state='idle';return true;}
 release(){
  this.update();if(this.paused||this.state!=='charging')return false;
  const power=this.power,top=surface(this.current,this.clock),from={...top,x:top.x+this.riderOffset.x,y:top.y+this.riderOffset.y},duration=560+power*180,target=surface(this.target,this.clock+duration),length=distance(from,target);
  let travel=power*MAX_JUMP,error=Math.abs(travel-length),corrected='';
  const tolerance=target.r+(this.softLanding?12:0);
  const correction=this.adjustArmed?Math.min(28,error):this.companion==='ray'&&this.companionReady&&error>tolerance&&error<=tolerance+18?18:0;
  if(correction){travel+=Math.sign(length-travel)*correction;error=Math.abs(travel-length);corrected=this.adjustArmed?'adjust':'ray';if(corrected==='ray')this.companionReady=false;}
  const end={x:from.x+(target.x-from.x)*travel/length,y:from.y+(target.y-from.y)*travel/length};
  const middle=surface(this.stumps[1],this.clock+duration),thornHit=this.stumps[1].thorns&&distance(end,middle)<=middle.r,success=error<=target.r+(this.softLanding?12:0)+1e-7&&!thornHit;
  if(!success&&travel<from.r+8){const edge=from.r+8;end.x=from.x+(target.x-from.x)*edge/length;end.y=from.y+(target.y-from.y)*edge/length;}
  this.softLanding=false;this.adjustArmed=false;this.jump={at:this.clock,checkedAt:this.clock,shield:this.fishShield,duration,from:{x:from.x,y:from.y},end,visualEnd:{...end},success,error,power,travel,steps:this.targetIndex,corrected,failure:thornHit?'thorns':travel<length?'short':'long',cameraFrom:this.camera,cameraTo:from.y+(end.y-from.y)*.2};this.doubleArmed=false;this.fishShield=false;this.state='jumping';this.events.push({type:'jump',power,skipped:this.jump.steps-1});return true;
 }
 update(){
  if(this.paused)return;const now=this.clock;
  if(['idle','charging'].includes(this.state))this.syncFish();
  if(this.state==='jumping'){
   const contact=fishContact(this.jump,this.fishHazard,this.jump.checkedAt,now);this.jump.checkedAt=Math.min(now,this.jump.at+this.jump.duration);
   if(contact){
    if(this.jump.shield||this.companion==='shark'&&this.companionReady){if(!this.jump.shield)this.companionReady=false;this.jump.shield=false;this.fishHazard=null;this.target.angler=false;this.events.push({type:'fish-blocked'});}
    else this.drown({...contact.player,fish:contact.fish,airborne:true},'angler',contact.at);
   }
  }
  if(this.state==='jumping'&&now+1e-7>=this.jump.at+this.jump.duration){
   const landedAt=this.jump.at+this.jump.duration;this.cameraFrom=this.cameraTarget=this.jump.cameraTo;this.cameraAt=landedAt;
   if(this.jump.success){const skipped=this.jump.steps-1;this.score++;const skillEarned=this.score%20===0;if(skillEarned){this.skillCharges++;if(this.equippedSkill)this.gearCharges++;this.events.push({type:'skill-ready',score:this.score,charges:this.skillCharges});}this.stumps.splice(0,this.jump.steps);while(this.stumps.length<3)this.stumps.push(this.generate(this.stumps.at(-1),this.stumps.at(-1).id+1));this.state='idle';this.cameraTarget=this.current.y;this.landedAt=landedAt;const landingTop=surface(this.current,landedAt);this.riderOffset={x:this.jump.end.x-landingTop.x,y:this.jump.end.y-landingTop.y};const perfect=this.jump.error<=landingTop.r*.25,kind=this.current.kind;const bonus=Math.min(3,(perfect?(kind==='lotus'?1:kind==='shell'?3:0):0)+(this.current.rewardBonus??0)+(perfect&&this.current.mailChallenge?1:0));this.bonusCoins+=bonus;this.softLanding=perfect&&kind==='mushroom';if(kind==='duck'){this.current.slideAt=landedAt;this.current.slideX=Math.sign(this.target.x-this.current.x)*12;this.slideUntil=landedAt+440;}this.deadline=this.current.sinking?landedAt+(kind==='ice'?3500:SINK_MS):null;this.current.angler=false;this.anglerDeadline=null;if(this.score>=20&&this.score%24===0&&!dangerous(this.target))this.target.mailChallenge=true;this.syncFish(landedAt);this.events.push({type:'land',score:this.score,skipped,perfect,bonus,coins:2+bonus,kind,soft:this.softLanding,skillEarned,skillCharges:this.skillCharges});}
   else this.drown(this.jump.visualEnd,this.jump.failure,landedAt);
  }
  if(this.state==='idle'||this.state==='charging'){
   const at=this.deadline??Infinity;
   if(now+1e-7>=at)this.drown(surface(this.current,at),'sunk',at);
  }
  if(this.state==='drowning'&&now+1e-7>=this.fall.at+DROWN_MS){this.state='over';this.events.push({type:'over',score:this.score,reason:this.fall.reason});}
 }
 drown(point,reason,at=this.clock){if(['short','long','sunk'].includes(reason)&&(this.rescueArmed||this.companion==='hippo'&&this.companionReady)){if(this.rescueArmed)this.rescueArmed=false;else this.companionReady=false;const id=this.stumps.at(-1).id+1;this.stumps=[{id,x:point.x,y:point.y,r:62,kind:'lily',route:'I',reinforced:true}];while(this.stumps.length<3)this.stumps.push(this.generate(this.stumps.at(-1),this.stumps.at(-1).id+1));this.riderOffset={x:0,y:0};this.state='idle';this.deadline=null;this.slideUntil=0;this.cameraFrom=this.cameraTarget=point.y;this.cameraAt=at;this.landedAt=at;this.syncFish(at);this.events.push({type:'rescue'});return;}if(this.state==='jumping'){const j=this.jump,t=clamp((at-j.at)/j.duration);this.cameraFrom=this.cameraTarget=j.cameraFrom+(j.cameraTo-j.cameraFrom)*smooth(t);this.cameraAt=at;}this.cancelCharge();this.state='drowning';const j=this.jump,speed=reason==='long'?1:reason==='short'?.35:0;this.fall={...point,at,reason,velocity:j&&['short','long'].includes(reason)?{x:(j.end.x-j.from.x)/j.duration*speed,y:(j.end.y-j.from.y)/j.duration*speed}:{x:0,y:0}};this.events.push({type:'fall',reason});}
 pause(){if(this.paused||!['idle','charging','jumping','drowning'].includes(this.state))return false;this.cancelCharge();this.pausedAt=this.now();return true;}
 resume(){if(!this.paused)return false;this.pausedTotal+=this.now()-this.pausedAt;this.pausedAt=null;return true;}
 drainEvents(){return this.events.splice(0);}
 get needsAnimation(){return !this.paused&&(['charging','jumping','drowning'].includes(this.state)||this.state==='idle'&&(this.deadline!==null||this.fishHazard!==null||this.clock<this.cameraAt+CAMERA_MS||this.stumps.some(p=>['turtle','lotus','spinner'].includes(p.kind))||this.clock<this.landedAt+440||this.clock<this.slideUntil));}
 get camera(){if(this.state==='jumping'){const j=this.jump,t=clamp((this.clock-j.at)/j.duration);return j.cameraFrom+(j.cameraTo-j.cameraFrom)*t*t*(3-2*t);}const t=clamp((this.clock-this.cameraAt)/CAMERA_MS);return this.cameraFrom+(this.cameraTarget-this.cameraFrom)*smooth(t);}
 get frog(){
  if(this.state==='jumping'){
   const j=this.jump,t=clamp((this.clock-j.at)/j.duration);
   return {...jumpPoint(j,this.clock),stretch:Math.sin(Math.PI*t)*.8,kick:Math.sin(Math.PI*clamp(t/.4)),tuck:Math.sin(Math.PI*smooth((t-.18)/.64)),reach:Math.sin(Math.PI*clamp((t-.65)/.35)),squat:j.power*(1-smooth(t/.18)),lean:Math.sign(j.visualEnd.x-j.from.x)*Math.sin(Math.PI*t)*.14,blink:0,flightPhase:t};
  }
  const p=this.state==='drowning'||this.state==='over'?this.fall:surface(this.current,this.clock),age=this.clock-this.landedAt,landing=age>=0&&age<390?.64*Math.sin(Math.PI*clamp(age/170))*Math.exp(-age/400)-.12*Math.sin(Math.PI*clamp((age-170)/220)):0;
  const offset=['idle','charging','ready'].includes(this.state)?this.riderOffset:{x:0,y:0};return {...p,x:p.x+offset.x,y:p.y+offset.y,lift:0,landingPhase:age>=0&&age<390?age/390:null,stretch:0,kick:0,tuck:0,reach:0,lean:0,blink:age>=0&&age<150?Math.sin(Math.PI*age/150)*.85:0,squat:this.state==='charging'?this.power:landing};
 }
}
