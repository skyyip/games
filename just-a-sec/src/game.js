export class TimeGame {
  constructor({random=Math.random,now=()=>performance.now()}={}) {
    this.random=random;this.now=now;this.reset();
  }
  reset() {
    this.state='setup';this.players=[];this.target=null;this.turn=0;this.guesses=[];this.startedAt=null;this.input=null;
  }
  start(names) {
    if(!Array.isArray(names)||names.length<2||names.length>6||names.some(name=>typeof name!=='string'))throw new TypeError('Choose 2–6 players.');
    this.players=names.map((name,index)=>name.trim().slice(0,24)||`Player ${index+1}`);
    this.target=Math.floor(this.random()*20)+1;
    this.turn=0;this.guesses=[];this.startedAt=null;this.input=null;this.state='handoff';
  }
  ready() {if(this.state!=='handoff')return false;this.state='ready';return true;}
  press(input) {
    if(this.state!=='ready'||input==null)return false;
    this.startedAt=this.now();this.input=input;this.state='holding';return true;
  }
  release(input) {
    if(this.state!=='holding'||input!==this.input)return false;
    const elapsed=Math.max(0,Math.round(this.now()-this.startedAt));
    this.guesses.push({index:this.turn,name:this.players[this.turn],elapsed,error:Math.abs(elapsed-this.target*1000)});
    this.startedAt=null;this.input=null;this.state='locked';return true;
  }
  cancel() {
    if(this.state!=='holding')return false;
    this.startedAt=null;this.input=null;this.state='ready';return true;
  }
  next() {
    if(this.state!=='locked')return false;
    if(this.turn===this.players.length-1)this.state='results';
    else {this.turn++;this.state='handoff';}
    return true;
  }
  get results() {return this.state==='results'?[...this.guesses].sort((a,b)=>a.error-b.error||a.index-b.index):[];}
  get winners() {const results=this.results;return results.filter(result=>result.error===results[0].error);}
}
