// Compute only at birth/resize; live rings keep their positions and clocks.
export function placeBurstRing(width,height,occupied,position){
 const insetX=width*.1,insetY=height*.1;
 const spot=layoutRing(width*.8,height*.8,occupied.map(p=>({...p,x:p.x-insetX,y:p.y-insetY})),position);
 return spot?{...spot,x:spot.x+insetX,y:spot.y+insetY}:null;
}
function layoutRing(width,height,occupied,position){
 // Leave enough room for three 44px touch targets even in the smaller inner area.
 const pad=6,gap=8,firstSize=Math.max(44,Math.min(96,(width-pad*2-gap*2)/3,(height-pad*2-gap)/2,Math.min(width,height)-pad*2-88-gap*2-2));
 const fits=(x,y,size)=>occupied.every(p=>Math.abs(x-p.x)>=(size+p.size)/2+gap||Math.abs(y-p.y)>=(size+p.size)/2+gap);
 for(let size=firstSize;;size=Math.max(44,size-8)){
  const left=pad+size/2,top=pad+size/2,spanX=Math.max(0,width-pad*2-size),spanY=Math.max(0,height-pad*2-size);
  // Low-discrepancy alternatives spread crowded spawns without consuming gameplay RNG.
  for(let i=0;i<80;i++){
   const x=left+((position.x+i*.61803398875)%1)*spanX,y=top+((position.y+i*.38196601125)%1)*spanY;
   if(fits(x,y,size))return {x,y,size};
  }
  if(size===44)break;
 }
 // Exhaust the smallest safe touch targets before giving up on a cramped layout.
 const size=44,left=pad+size/2,top=pad+size/2,right=width-pad-size/2,bottom=height-pad-size/2;
 for(const x of [left,right])for(const y of [top,bottom])if(fits(x,y,size))return {x,y,size};
 for(let y=top;y<=bottom;y+=4)for(let x=left;x<=right;x+=4)if(fits(x,y,size))return {x,y,size};
 return null;
}
