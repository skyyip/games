const TAU=Math.PI*2;
export const SHAPE_NAMES=['Little cloud','Wavy leaf','Petal party','Wonky star','Little comet','Soft crown','Curious pebble','Ripple heart'];
export function createShape(random=Math.random){
  const kind=Math.floor(random()*SHAPE_NAMES.length),phase=random()*TAU,sx=.24+random()*.055,sy=.22+random()*.065;
  const cx=.46+random()*.08,cy=.46+random()*.08,rotation=(random()-.5)*.8;
  const points=Array.from({length:160},(_,i)=>{
    const a=i/160*TAU;
    let r=1;
    if(kind===0)r=1+.15*Math.cos(5*a+phase)+.06*Math.sin(3*a);
    if(kind===1)r=1+.18*Math.cos(2*a)+.09*Math.sin(5*a+phase);
    if(kind===2)r=1+.21*Math.cos(6*a+phase);
    if(kind===3)r=1+.26*Math.cos(5*a+phase)+.04*Math.sin(2*a);
    if(kind===4)r=1+.28*Math.cos(a+phase)+.11*Math.cos(3*a+phase);
    if(kind===5)r=1+.2*Math.cos(3*a+phase)+.12*Math.sin(4*a);
    if(kind===6)r=1+.13*Math.cos(3*a+phase)+.1*Math.sin(2*a+.3);
    if(kind===7)r=1+.21*Math.sin(a)-.16*Math.cos(2*a)+.05*Math.cos(5*a+phase);
    const x=Math.cos(a)*r*sx,y=Math.sin(a)*r*sy;
    return {x:cx+x*Math.cos(rotation)-y*Math.sin(rotation),y:cy+x*Math.sin(rotation)+y*Math.cos(rotation)};
  });
  return {name:SHAPE_NAMES[kind],points:[...points,{...points[0]}]};
}

const SIZE=256,TOLERANCE=4;
function raster(strokes){
  const cells=new Set();
  for(const stroke of strokes){
    for(let i=0;i<stroke.length;i++){
      const a=stroke[Math.max(0,i-1)],b=stroke[i],dx=(b.x-a.x)*(SIZE-1),dy=(b.y-a.y)*(SIZE-1),steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)*1.5));
      for(let j=0;j<=steps;j++){
        const x=Math.round((a.x+(b.x-a.x)*j/steps)*(SIZE-1)),y=Math.round((a.y+(b.y-a.y)*j/steps)*(SIZE-1));
        if(x>=0&&x<SIZE&&y>=0&&y<SIZE)cells.add(y*SIZE+x);
      }
    }
  }
  return cells;
}
function dilate(cells){
  const mask=new Uint8Array(SIZE*SIZE);
  for(const cell of cells){const x=cell%SIZE,y=Math.floor(cell/SIZE);
    for(let dy=-TOLERANCE;dy<=TOLERANCE;dy++)for(let dx=-TOLERANCE;dx<=TOLERANCE;dx++)if(dx*dx+dy*dy<=TOLERANCE*TOLERANCE){const a=x+dx,b=y+dy;if(a>=0&&a<SIZE&&b>=0&&b<SIZE)mask[b*SIZE+a]=1;}
  }
  return mask;
}
export function validDrawing(strokes){return Array.isArray(strokes)&&strokes.length<=64&&strokes.every(s=>Array.isArray(s)&&s.length>0&&s.every(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=1&&p.y>=0&&p.y<=1))&&strokes.reduce((n,s)=>n+s.length,0)<=5000;}
export function scoreDrawing(target,strokes){
  if(!validDrawing(strokes)||!Array.isArray(target)||target.length<2)return {percent:0,coverage:0,precision:0};
  const goal=raster([target]),ink=raster(strokes);if(!ink.size)return {percent:0,coverage:0,precision:0};
  const goalMask=dilate(goal),inkMask=dilate(ink);
  const coverage=[...goal].reduce((n,p)=>n+inkMask[p],0)/goal.size,precision=[...ink].reduce((n,p)=>n+goalMask[p],0)/ink.size;
  const fraction=coverage+precision?2*coverage*precision/(coverage+precision):0;
  return {percent:Math.round(fraction*1000)/10,coverage,precision};
}
