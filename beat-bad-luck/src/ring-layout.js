// Compute only at birth/resize; live rings keep their positions and clocks.
export function placeBurstRing(width,height,occupied,position,{assisted=false}={}){
 const insetX=width*.1,insetY=height*.1;
 const spot=layoutRing(width*.8,height*.8,occupied.map(p=>({...p,x:p.x-insetX,y:p.y-insetY})),position,assisted);
 return spot?{...spot,x:spot.x+insetX,y:spot.y+insetY}:null;
}
function layoutRing(width,height,occupied,position,assisted){
 // Leave enough room for three 44px touch targets even in the smaller inner area.
 const pad=6,gap=8,baseSize=Math.max(44,Math.min(96,(width-pad*2-gap*2)/3,(height-pad*2-gap)/2,Math.min(width,height)-pad*2-88-gap*2-2));
 // Enlarge the second burst's artwork and hit area together; crowded rings
 // still shrink individually to preserve the gap and stay inside the arena.
 const firstSize=assisted?Math.max(44,Math.min(baseSize*1.2,width-pad*2,height-pad*2)):baseSize;
 const fits=(x,y,size)=>occupied.every(p=>Math.abs(x-p.x)>=(size+p.size)/2+gap||Math.abs(y-p.y)>=(size+p.size)/2+gap);
 // Reserve spare touch targets before accepting a larger random position.
 // Otherwise two enlarged rings could leave no safe space for the third.
 const reserveSize=44,reserveLeft=pad+reserveSize/2,reserveTop=pad+reserveSize/2;
 const reserves=[reserveLeft,width/2,width-reserveLeft].flatMap(x=>[reserveTop,height/2,height-reserveTop].map(y=>({x,y,size:reserveSize})));
 const separate=(a,b)=>Math.abs(a.x-b.x)>=(a.size+b.size)/2+gap||Math.abs(a.y-b.y)>=(a.size+b.size)/2+gap;
 function roomForRemaining(placed,remaining){
  if(remaining<=0)return true;
  return reserves.some(p=>placed.every(other=>separate(p,other))&&roomForRemaining([...placed,p],remaining-1));
 }
 const canPlace=(x,y,size)=>fits(x,y,size)&&(!assisted||roomForRemaining([...occupied,{x,y,size}],2-occupied.length));
 for(let size=firstSize;;size=Math.max(44,size-8)){
  const left=pad+size/2,top=pad+size/2,spanX=Math.max(0,width-pad*2-size),spanY=Math.max(0,height-pad*2-size);
  // Low-discrepancy alternatives spread crowded spawns without consuming gameplay RNG.
  for(let i=0;i<80;i++){
   const x=left+((position.x+i*.61803398875)%1)*spanX,y=top+((position.y+i*.38196601125)%1)*spanY;
   if(canPlace(x,y,size))return {x,y,size};
  }
  if(size===44)break;
 }
 // Exhaust the smallest safe touch targets before giving up on a cramped layout.
 const size=44,left=pad+size/2,top=pad+size/2,right=width-pad-size/2,bottom=height-pad-size/2;
 for(const x of [left,right])for(const y of [top,bottom])if(canPlace(x,y,size))return {x,y,size};
 if(assisted)for(const p of reserves)if(canPlace(p.x,p.y,p.size))return p;
 for(let y=top;y<=bottom;y+=4)for(let x=left;x<=right;x+=4)if(canPlace(x,y,size))return {x,y,size};
 return null;
}
