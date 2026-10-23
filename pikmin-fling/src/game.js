export const COUNTS = Object.freeze([20,30,40]);

export class FlingGame {
  constructor({count=20,now=()=>performance.now()}={}) {
    this.now=now;this.reset(count);
  }
  reset(count=this.count) {
    if(!COUNTS.includes(count))throw new RangeError('Choose 20, 30 or 40 Pikmin.');
    this.count=count;this.state='idle';this.units=Array(count).fill('ready');
    this.startedAt=0;this.finishedTime=0;
  }
  get progress(){return this.units.filter(state=>state==='eaten').length;}
  get remaining(){return this.count-this.progress;}
  get elapsed(){return this.state==='playing'?this.now()-this.startedAt:this.finishedTime;}
  start() {
    if(this.state!=='idle')return false;
    this.startedAt=this.now();this.state='playing';return true;
  }
  launch(id) {
    if(this.state!=='playing'||this.units[id]!=='ready'||!Number.isInteger(id))return false;
    this.units[id]='flying';return true;
  }
  arrive(id) {
    if(this.state!=='playing'||this.units[id]!=='flying'||!Number.isInteger(id))return false;
    this.units[id]='eaten';
    if(this.progress===this.count){this.finishedTime=this.now()-this.startedAt;this.state='completed';}
    return true;
  }
}
