export const SKIP_KEY='your-dream-career.month-skips.v1',DAILY_SKIPS=12;
// The game's day follows Tokyo (UTC+9), independent of the life-save date.
export const skipDay=timestamp=>new Date(timestamp+9*3600000).toISOString().slice(0,10);
export class MonthSkipBudget{
 constructor({storage=null,now=()=>Date.now()}={}){this.storage=storage;this.now=now;this.memory=null;this.persistent=!!storage;}
 read(){
  const day=skipDay(this.now());let value=this.memory;
  if(this.storage)try{const raw=this.storage.getItem(SKIP_KEY);if(raw)value=JSON.parse(raw);}catch{this.persistent=false;}
  if(value?.day!==day||!Number.isInteger(value.used)||value.used<0||value.used>DAILY_SKIPS)value={day,used:0};
  this.memory=value;return value;
 }
 get remaining(){return DAILY_SKIPS-this.read().used;}
 consume(){const state=this.read();if(state.used>=DAILY_SKIPS)return false;this.memory={day:state.day,used:state.used+1};if(this.storage)try{this.storage.setItem(SKIP_KEY,JSON.stringify(this.memory));}catch{this.persistent=false;this.storage=null;}return true;}
}
