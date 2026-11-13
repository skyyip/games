// Route spacing and the local platform top use different perspective depths.
export const ROUTE_DEPTH=.74,PAD_DEPTH=.43;
const clamp=v=>Math.max(0,Math.min(1,v));
export const ease=v=>{v=clamp(v);return v*v*(3-2*v);};
const smallFeet=new Set(['chiikawa','hachiware','usagi','kurimanju','rakko','momonga','shisa','shimajiro','hitoha','futaba']);
const tallFriends=new Set(['elf-mage','violet-mage','red-warrior','red-sprout','blue-sprout','yellow-sprout','bloom-bunny','mage-otter']);
export function soleOffset(kind,{squat=0,stretch=0}={}){
 const base=kind==='mermaid'?10.8:tallFriends.has(kind)?4:smallFeet.has(kind)||kind==='mochi'?4.65:5;
 const compression=kind==='frog'?.24:tallFriends.has(kind)?.18:smallFeet.has(kind)||kind==='mermaid'?.21:.2;
 return base*(1-squat*compression+stretch*(kind==='frog'?.12:tallFriends.has(kind)?.08:.1));
}
export function landingOffset(top,offset={x:0,y:0},age=Infinity){
 const length=Math.hypot(offset.x,offset.y),rim=Math.max(0,top.r-6),limit=length>rim&&length?rim/length:1;
 const shell=top.kind==='shell',flower=top.kind==='lotus',squash=top.kind==='mushroom'&&age>=0&&age<500?Math.sin(Math.PI*age/500)*.16:0;
 return {x:offset.x*limit*(shell?.83:flower?.9:1)*(1+squash*.2),y:-offset.y*limit*PAD_DEPTH*(shell?.67:flower?.9:1)*(1-squash)};
}
