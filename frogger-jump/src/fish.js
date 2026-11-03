// World-space fish and player paths are shared by rendering and collision checks.
export const FISH_WARNING_MS=1200,FISH_LEAP_MS=900,FISH_REST_MS=1400,FISH_HEIGHT=150,FISH_HIT_RADIUS=34;
const clamp=v=>Math.max(0,Math.min(1,v));
export function fishPose(hazard,at){
 if(!hazard)return null;
 const cycle=FISH_WARNING_MS+FISH_LEAP_MS+FISH_REST_MS,age=Math.max(0,at-hazard.at)%cycle;
 const phase=age<FISH_WARNING_MS?'warning':age<FISH_WARNING_MS+FISH_LEAP_MS?'leaping':'submerged';
 const progress=clamp((age-FISH_WARNING_MS)/FISH_LEAP_MS);
 return {...hazard,phase,progress,lift:phase==='leaping'?10+Math.sin(Math.PI*progress)*FISH_HEIGHT:0,remaining:phase==='warning'?FISH_WARNING_MS-age:cycle-age};
}
export function jumpPoint(jump,at){
 const t=clamp((at-jump.at)/jump.duration);
 return {x:jump.from.x+(jump.visualEnd.x-jump.from.x)*t,y:jump.from.y+(jump.visualEnd.y-jump.from.y)*t,lift:4*t*(1-t)*(92+jump.power*62)};
}
export function fishContact(jump,hazard,from,to){
 // Sample the swept path too, so delayed frames cannot jump over a collision.
 if(!hazard)return null;
 const end=Math.min(to,jump.at+jump.duration),start=Math.max(from,jump.at);
 const count=Math.max(1,Math.ceil((end-start)/8));
 for(let i=0;i<=count;i++){
  const at=start+(end-start)*i/count,fish=fishPose(hazard,at),player=jumpPoint(jump,at);
  if(fish.phase==='leaping'&&Math.hypot(player.x-fish.x,player.y-fish.y,player.lift+24-fish.lift)<=FISH_HIT_RADIUS)return {at,fish,player};
 }
 return null;
}
