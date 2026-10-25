export const SIZE=17;
const key=(x,y)=>`${x},${y}`;
const neighbours=(x,y)=>[[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
function makeRoute(xs){
  const points=[{x:8,y:15}];let x=8,y=15;
  const line=(nx,ny)=>{while(x!==nx||y!==ny){x+=Math.sign(nx-x);y+=Math.sign(ny-y);points.push({x,y});}};
  line(xs[0],15);
  for(let i=1;i<xs.length;i++){line(x,15-i*2);line(xs[i],y);}
  line(x,1);line(8,1);return points;
}
const plans=[
  ['Mossy beginnings','A gentle first roll.',[2,2,4,4,2,2,2],[8,8,8,8,8,8,8],[14,14,12,12,14,14,14],6,8,.60],
  ['The winding courtyard','A few lovely little turns.',[4,2,2,4,4,2,4],[8,8,6,6,10,10,8],[12,14,14,12,12,14,12],10,7,.66],
  ['The misty garden','Find your way through the hush.',[2,4,2,4,2,4,2],[8,6,10,6,10,6,8],[14,12,14,12,14,12,14],12,6,.73],
  ['The meandering lanes','Keep a little room to dodge.',[4,2,4,4,2,4,2],[8,10,6,10,6,10,8],[12,14,12,12,14,12,14],14,5.5,.80],
  ['The cloudwood secret','One small marble. A grand adventure.',[2,4,2,4,2,4,2],[8,10,6,10,6,10,8],[12,14,12,14,12,14,12],16,5,.88],
];
export const LEVELS=Object.freeze(plans.map(([name,description,...rest],index)=>{
  const [a,b,c,branches,fogAt,bombSpeed]=rest,routes=[a,b,c].map(makeRoute),open=new Set(routes.flat().map(p=>key(p.x,p.y)));
  let seed=117+index*257;
  // Each decorative dead end adds exactly one edge, so it cannot add a route.
  for(let n=0;n<branches;n++){
    const candidates=[];for(let y=3;y<14;y++)for(let x=1;x<16;x++)if(!open.has(key(x,y))&&neighbours(x,y).filter(([xx,yy])=>open.has(key(xx,yy))).length===1)candidates.push({x,y});
    if(!candidates.length)break;seed=seed*16807%2147483647;const p=candidates[seed%candidates.length];open.add(key(p.x,p.y));
  }
  const grid=Array.from({length:SIZE},(_,y)=>Object.freeze(Array.from({length:SIZE},(_,x)=>open.has(key(x,y))?1:0)));
  return Object.freeze({id:index+1,name,description,size:SIZE,grid:Object.freeze(grid),routes:Object.freeze(routes.map(r=>Object.freeze(r.map(Object.freeze)))),start:Object.freeze({x:8.5,y:15.5}),goal:Object.freeze({x:8.5,y:1.5}),fogAt,bombSpeed,maxBombs:index<2?1:2});
}));
export function levelById(id){const level=LEVELS.find(l=>l.id===id);if(!level)throw new RangeError('Unknown maze.');return level;}
export function countRoutes(level){
  let count=0;const visited=new Set();
  function walk(x,y){if(x===8&&y===1){count++;return;}const id=key(x,y);visited.add(id);for(const [nx,ny] of neighbours(x,y))if(level.grid[ny]?.[nx]&&!visited.has(key(nx,ny)))walk(nx,ny);visited.delete(id);}
  walk(8,15);return count;
}
