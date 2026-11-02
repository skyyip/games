export const MAX_JUMP=420,CHARGE_UP_MS=950,SINK_MS=2500,DROWN_MS=1450,CAMERA_MS=520;
export const distance=(a,b)=>Math.hypot(b.x-a.x,b.y-a.y);
export function chargePower(ms){const t=Math.max(0,ms)/CHARGE_UP_MS%2;return t<=1?t:2-t;}
export function difficulty(index){return index<=10?{stage:1,r:48,minGap:164,maxGap:204,sink:0}:index<=30?{stage:2,r:Math.max(34,46-(index-10)*.6),minGap:186,maxGap:246,sink:.18}:{stage:3,r:28,minGap:216,maxGap:278,sink:.36};}
export class FroggerGame{
 constructor({random=Math.random,now=()=>performance.now()}={}){this.random=random;this.now=now;this.reset();}
 reset(){this.state='ready';this.score=0;this.stumps=[];this.events=[];this.jump=null;this.fall=null;this.chargeAt=0;this.deadline=null;this.pausedAt=null;this.pausedTotal=0;this.cameraFrom=0;this.cameraTarget=0;this.cameraAt=-Infinity;this.route=null;this.run=0;}
 get clock(){return (this.pausedAt??this.now())-this.pausedTotal;}
 get paused(){return this.pausedAt!==null;}
 get current(){return this.stumps[0];}
 get target(){return this.stumps[1];}
 get power(){return this.state==='charging'?chargePower(this.clock-this.chargeAt):0;}
 get sinkRemaining(){return this.deadline===null?null:Math.max(0,this.deadline-this.clock);}
 randomUnit(){return Math.max(0,Math.min(.999999999,Number(this.random())||0));}
 start(){this.reset();this.state='idle';this.stumps=[{id:0,x:0,y:0,r:48,sinking:false,route:'I'}];this.stumps.push(this.generate(this.current,1));this.stumps.push(this.generate(this.target,2));return this.current;}
 generate(previous,index){
  const d=difficulty(index);
  if(this.run<=0){const proposed=this.randomUnit()<.5?'I':'Z';this.route=proposed===this.route?(proposed==='I'?'Z':'I'):proposed;this.run=d.stage===1?1+Math.floor(this.randomUnit()*3):1+Math.floor(this.randomUnit()*2);}
  this.run--;let x=previous.x;
  if(this.route==='Z'){const sign=previous.x>70?-1:previous.x< -70?1:this.randomUnit()<.5?-1:1,span=d.stage===1?96+this.randomUnit()*48:124+this.randomUnit()*90;x=Math.max(-145,Math.min(145,previous.x+sign*span));}
  const y=previous.y+d.minGap+this.randomUnit()*(d.maxGap-d.minGap),sinking=this.randomUnit()<d.sink&&!(d.stage===2&&previous.sinking);
  return {id:index,x,y,r:d.r,sinking,route:this.route};
 }
 beginCharge(){this.update();if(this.paused||this.state!=='idle')return false;this.state='charging';this.chargeAt=this.clock;return true;}
 cancelCharge(){if(this.state!=='charging')return false;this.state='idle';return true;}
 release(){
  this.update();if(this.paused||this.state!=='charging')return false;
  const power=this.power,from=this.current,target=this.target,length=distance(from,target),travel=power*MAX_JUMP,error=Math.abs(travel-length),success=error<=target.r+1e-7;
  const end={x:from.x+(target.x-from.x)*travel/length,y:from.y+(target.y-from.y)*travel/length};
  this.jump={at:this.clock,duration:500+power*180,from:{x:from.x,y:from.y},end,visualEnd:success?{x:target.x,y:target.y}:end,success,error,power,travel};this.state='jumping';this.events.push({type:'jump',power});return true;
 }
 update(){
  if(this.paused)return;
  const now=this.clock;
  if(this.state==='jumping'&&now+1e-7>=this.jump.at+this.jump.duration){
   const landedAt=this.jump.at+this.jump.duration;
   if(this.jump.success){this.score++;this.stumps.shift();this.stumps.push(this.generate(this.stumps[1],this.current.id+2));this.state='idle';this.cameraFrom=this.cameraTarget;this.cameraTarget=this.current.y;this.cameraAt=landedAt;this.deadline=this.current.sinking?landedAt+SINK_MS:null;this.events.push({type:'land',score:this.score,perfect:this.jump.error<=this.current.r*.25});}
   else this.drown(this.jump.end,this.jump.travel<distance(this.jump.from,this.target)?'short':'long',landedAt);
  }
  if((this.state==='idle'||this.state==='charging')&&this.deadline!==null&&now+1e-7>=this.deadline)this.drown(this.current,'sunk',this.deadline);
  if(this.state==='drowning'&&now+1e-7>=this.fall.at+DROWN_MS){this.state='over';this.events.push({type:'over',score:this.score,reason:this.fall.reason});}
 }
 drown(point,reason,at=this.clock){this.cancelCharge();this.state='drowning';this.fall={x:point.x,y:point.y,at,reason};this.events.push({type:'fall',reason});}
 pause(){if(this.paused||!['idle','charging','jumping','drowning'].includes(this.state))return false;this.cancelCharge();this.pausedAt=this.now();return true;}
 resume(){if(!this.paused)return false;this.pausedTotal+=this.now()-this.pausedAt;this.pausedAt=null;return true;}
 drainEvents(){return this.events.splice(0);}
 get needsAnimation(){return !this.paused&&(['charging','jumping','drowning'].includes(this.state)||this.state==='idle'&&(this.deadline!==null||this.clock<this.cameraAt+CAMERA_MS));}
 get camera(){const t=Math.min(1,Math.max(0,(this.clock-this.cameraAt)/CAMERA_MS)),ease=1-(1-t)**3;return this.cameraFrom+(this.cameraTarget-this.cameraFrom)*ease;}
 get frog(){
  if(this.state==='jumping'){const j=this.jump,t=Math.min(1,Math.max(0,(this.clock-j.at)/j.duration));return {x:j.from.x+(j.visualEnd.x-j.from.x)*t,y:j.from.y+(j.visualEnd.y-j.from.y)*t,lift:Math.sin(Math.PI*t)*(90+j.power*65),stretch:Math.sin(Math.PI*t),lean:Math.sign(j.visualEnd.x-j.from.x)*Math.sin(Math.PI*t)*.18};}
  const p=this.state==='drowning'||this.state==='over'?this.fall:this.current;return {...p,lift:0,stretch:0,lean:0};
 }
}
