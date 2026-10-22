export const SHAPES = ['straight','parabola','wave','bend'];
export const SHAPE_NAMES = { straight:'Straight', parabola:'Parabola', wave:'Wavy', bend:'Rounded bend' };
const clamp = value => Math.max(0,Math.min(1,value));
const pathData = points => points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ');

export function measureLine(points) {
  const lengths = [0];
  for(let i=1;i<points.length;i++) lengths.push(lengths[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].y-points[i-1].y));
  const total=lengths.at(-1);
  if(!(total>0)) throw new RangeError('A line needs a positive length.');
  return { points, lengths, total, d:pathData(points) };
}

// A separate subpath preserves the exact segment under responsive scaling,
// without coupling its length to the visual stroke width or SVG dash units.
export function segmentPath(line, start, end) {
  const low=clamp(Math.min(start,end)),high=clamp(Math.max(start,end));
  if(low===high)return '';
  const points=[pointAt(line,low)];
  for(let i=1;i<line.points.length-1;i++) {
    const fraction=line.lengths[i]/line.total;
    if(fraction>low && fraction<high)points.push(line.points[i]);
  }
  points.push(pointAt(line,high));
  return pathData(points);
}

export function pointAt(line, fraction) {
  const distance=clamp(fraction)*line.total;
  let i=1;
  while(i<line.points.length-1 && line.lengths[i]<distance) i++;
  const a=line.points[i-1],b=line.points[i];
  const span=line.lengths[i]-line.lengths[i-1];
  const t=span?(distance-line.lengths[i-1])/span:0;
  return { x:a.x+(b.x-a.x)*t, y:a.y+(b.y-a.y)*t };
}

export function projectPoint(line, point) {
  let closest=Infinity, fraction=0;
  for(let i=1;i<line.points.length;i++) {
    const a=line.points[i-1],b=line.points[i],dx=b.x-a.x,dy=b.y-a.y;
    const squared=dx*dx+dy*dy;
    if(!squared) continue;
    const t=clamp(((point.x-a.x)*dx+(point.y-a.y)*dy)/squared);
    const distance=(point.x-a.x-dx*t)**2+(point.y-a.y-dy*t)**2;
    if(distance<closest) { closest=distance;fraction=(line.lengths[i-1]+Math.sqrt(squared)*t)/line.total; }
  }
  return clamp(fraction);
}

export function createLine(kind, random=Math.random) {
  if(!SHAPES.includes(kind)) throw new RangeError('Unknown line shape.');
  const flip=random()<.5?-1:1;
  const amplitude=65+random()*45;
  let points;
  if(kind==='straight') points=[{x:80,y:210-flip*30},{x:920,y:210+flip*30}];
  if(kind==='parabola') points=Array.from({length:161},(_,i)=>{
    const t=i/160;return {x:80+840*t,y:210+flip*(amplitude-8*amplitude*t*(1-t))};
  });
  if(kind==='wave') {
    const waves=1.25+random()*.75;
    points=Array.from({length:241},(_,i)=>{
      const t=i/240;return {x:80+840*t,y:210+flip*amplitude*Math.sin(t*Math.PI*2*waves)};
    });
  }
  if(kind==='bend') {
    const middle=380+random()*180;
    points=[{x:80,y:315},{x:middle-55,y:315}];
    const curve=(a,c,b)=>{
      for(let i=1;i<=32;i++) {
        const t=i/32,s=1-t;
        points.push({x:s*s*a.x+2*s*t*c.x+t*t*b.x,y:s*s*a.y+2*s*t*c.y+t*t*b.y});
      }
    };
    curve({x:middle-55,y:315},{x:middle,y:315},{x:middle,y:260});
    points.push({x:middle,y:160});
    curve({x:middle,y:160},{x:middle,y:105},{x:middle+55,y:105});
    points.push({x:920,y:105});
    if(flip<0) points=points.map(p=>({x:p.x,y:420-p.y}));
  }
  return {kind,...measureLine(points)};
}
