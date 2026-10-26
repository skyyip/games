// Browser checks exercise the paper directly; gesture hints never invoke moves.
export async function paperGesture(page,type){
 const r=await page.locator('#hit-zone').boundingBox(),cx=r.x+r.width/2,cy=r.y+r.height*.45;
 if(type==='pinch'||type==='spread'){
  const session=await page.context().newCDPSession(page);
  try{
   const touch=(kind,d)=>session.send('Input.dispatchTouchEvent',{type:kind,touchPoints:d===null?[]:[{id:1,x:cx-d,y:cy},{id:2,x:cx+d,y:cy}]});
   if(type==='pinch'){await touch('touchStart',50);for(let d=45;d>=25;d-=5)await touch('touchMove',d);}else{await touch('touchStart',25);for(let d=30;d<=45;d+=5)await touch('touchMove',d);}await touch('touchEnd',null);
  }finally{await session.detach();}
  return;
 }
 let points;
 if(type==='hold'){await page.mouse.move(cx,cy);await page.mouse.down();await page.clock.runFor(750);await page.mouse.up();return;}
 if(type==='circle'||type==='circle-ccw'){const radius=Math.min(r.width,r.height)*.3;points=Array.from({length:41},(_,i)=>[cx+radius*Math.cos(i/40*Math.PI*2*(type==='circle-ccw'?-1:1)),cy+radius*Math.sin(i/40*Math.PI*2*(type==='circle-ccw'?-1:1))]);}
 else if(type==='rub')points=[cx-36,cx+36,cx-36,cx+36,cx-36].map(x=>[x,cy]);
 else if(type==='heavy')points=[[cx-40,cy],[cx+40,cy]];
 else throw new RangeError('Unknown paper gesture: '+type);
 await page.mouse.move(...points[0]);await page.mouse.down();for(const point of points.slice(1))await page.mouse.move(...point);await page.mouse.up();
}
