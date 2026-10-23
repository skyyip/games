export const MODES=Object.freeze(['normal','challenge']);
export const GROWTH=Object.freeze(['leaf','bud','flower']);
export const FLOWER_HOLD=220,CHAIN_HOLD=500;

export class FlingGame {
  constructor({mode='normal',now=()=>performance.now(),random=Math.random}={}) {
    this.now=now;this.random=random;this.reset(mode);
  }
  reset(mode=this.mode) {
    if(!MODES.includes(mode))throw new RangeError('Choose normal or challenge mode.');
    this.mode=mode;this.count=30;this.state='idle';
    const growth=[...Array(20).fill('leaf'),...Array(5).fill('bud'),...Array(5).fill('flower')];
    for(let i=growth.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[growth[i],growth[j]]=[growth[j],growth[i]];}
    this.units=growth.map(growth=>({growth,status:'ready'}));
    this.startedAt=0;this.finishedTime=0;this.nextChange=Infinity;
  }
  get progress(){return this.units.filter(unit=>unit.status==='eaten').length;}
  get remaining(){return this.count-this.progress;}
  get growthCounts(){return Object.fromEntries(GROWTH.map(growth=>[growth,this.units.filter(u=>u.status==='ready'&&u.growth===growth).length]));}
  get elapsed(){return this.state==='playing'?this.now()-this.startedAt:this.finishedTime;}
  start() {
    if(this.state!=='idle')return false;
    this.startedAt=this.now();this.state='playing';
    if(this.mode==='challenge')this.nextChange=this.startedAt+3000+this.random()*5000;
    return true;
  }
  advance(protectedIds=new Set()) {
    const now=this.now();
    if(this.state!=='playing'||this.mode!=='challenge'||now<this.nextChange)return [];
    // Choose from the old states, then apply together: no Pikmin changes twice in one wave.
    const changes=[];
    for(const [from,to,max] of [['bud','flower',5],['flower','leaf',5],['leaf','bud',10]]) {
      const eligible=this.units.flatMap((u,id)=>u.status==='ready'&&u.growth===from&&!protectedIds.has(id)?[id]:[]);
      const count=Math.min(eligible.length,1+Math.floor(this.random()*max));
      for(let i=0;i<count;i++) {
        const [id]=eligible.splice(Math.floor(this.random()*eligible.length),1);changes.push({id,to});
      }
    }
    for(const {id,to} of changes)this.units[id].growth=to;
    this.nextChange=now+3000+this.random()*5000;
    return changes.map(change=>change.id);
  }
  launch(ids,action={}) {
    if(this.state!=='playing'||!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!Number.isInteger(id)||this.units[id]?.status!=='ready'))return false;
    const growth=this.units[ids[0]].growth;
    const valid=action.kind==='chain'
      ? action.held>=CHAIN_HOLD && ids.every(id=>this.units[id].growth===growth)
      : ids.length===1 && (action.kind==='accessible' || (growth==='bud'
        ? action.kind==='double-tap'
        : action.kind==='fling' && (growth==='leaf'||action.held>=FLOWER_HOLD)));
    if(!valid)return false;
    for(const id of ids)this.units[id].status='flying';return true;
  }
  arrive(id) {
    if(this.state!=='playing'||!Number.isInteger(id)||this.units[id]?.status!=='flying')return false;
    this.units[id].status='eaten';
    if(this.progress===this.count){this.finishedTime=this.now()-this.startedAt;this.state='completed';this.nextChange=Infinity;}
    return true;
  }
}
