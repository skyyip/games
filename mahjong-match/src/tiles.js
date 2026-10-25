export const GROUPS=['Characters','Circles','Bamboos','Winds','Dragons','Seasons','Flowers'];
export function tileKind(kind){
  if(!Number.isInteger(kind)||kind<0||kind>=42)throw new RangeError('Choose a valid tile.');
  if(kind<27)return {kind,group:Math.floor(kind/9),rank:kind%9+1};
  if(kind<31)return {kind,group:3,rank:kind-27};
  if(kind<34)return {kind,group:4,rank:kind-31};
  return {kind,group:kind<38?5:6,rank:kind<38?kind-34:kind-38};
}
export function buildTiles(){return Array.from({length:144},(_,id)=>({id,...tileKind(id<136?Math.floor(id/4):34+id-136)}));}
export function shuffleTiles(random=Math.random){const tiles=buildTiles();for(let i=tiles.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[tiles[i],tiles[j]]=[tiles[j],tiles[i]];}return tiles;}
export const tileOrder=tile=>tile.group<3?tile.rank:tile.rank+1;
export function matchingTiles(a,b){
  if(!a||!b)return false;
  return tileOrder(a)===tileOrder(b);
}
const CHINESE=['一','二','三','四','五','六','七','八','九'];
export function tileName(tile){return tile.group===0?`${tile.rank} Characters`:tile.group===1?`${tile.rank} Circles`:tile.group===2?`${tile.rank} Bamboos`:tile.group===3?['East wind','South wind','West wind','North wind'][tile.rank]:tile.group===4?['Red dragon','Green dragon','White dragon'][tile.rank]:tile.group===5?['Spring','Summer','Autumn','Winter'][tile.rank]:['Plum blossom','Orchid','Chrysanthemum','Bamboo blossom'][tile.rank];}
export function tileMarkup(tile){
  if(tile.group>=5)return `<span class="season-index">${tile.rank+1}</span><span class="tile-symbol ${tile.group===5?'season':'flower'}">${(tile.group===5?['春','夏','秋','冬']:['梅','蘭','菊','竹'])[tile.rank]}</span>`;
  if(tile.group===0)return `<span class="tile-number">${CHINESE[tile.rank-1]}</span><span class="tile-wan">萬</span>`;
  if(tile.group===3)return `<span class="tile-symbol wind">${['東','南','西','北'][tile.rank]}</span>`;
  if(tile.group===4)return tile.rank===2?'<span class="white-dragon"></span>':`<span class="tile-symbol ${tile.rank===0?'red':'green'}">${['中','發'][tile.rank]}</span>`;
  const spots=tile.rank===1?[[32,32]]:tile.rank===2?[[32,16],[32,48]]:tile.rank===3?[[16,16],[32,32],[48,48]]:tile.rank===4?[[16,16],[48,16],[16,48],[48,48]]:tile.rank===5?[[16,16],[48,16],[32,32],[16,48],[48,48]]:tile.rank===6?[[16,13],[48,13],[16,32],[48,32],[16,51],[48,51]]:tile.rank===7?[[32,9],[16,24],[48,24],[16,39],[48,39],[16,54],[48,54]]:tile.rank===8?[[18,10],[46,10],[18,25],[46,25],[18,40],[46,40],[18,55],[46,55]]:[[12,12],[32,12],[52,12],[12,32],[32,32],[52,32],[12,52],[32,52],[52,52]];
  return `<svg viewBox="0 0 64 64" aria-hidden="true">${spots.map(([x,y],i)=>tile.group===1?`<circle cx="${x}" cy="${y}" r="${tile.rank===1?17:6}" fill="none" stroke="${['#22536b','#a12630','#235536'][i%3]}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="${tile.rank===1?10:2}" fill="${['#22536b','#a12630','#235536'][i%3]}"/>`:`<path d="M${x} ${y-5}v10m-3-8h6m-6 6h6" fill="none" stroke="${i%3===1?'#ad2936':'#235536'}" stroke-width="3" stroke-linecap="round"/>`).join('')}</svg>`;
}
