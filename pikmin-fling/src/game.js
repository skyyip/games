import { BASE_TYPES } from './characters.js';

export const MODES=Object.freeze(['normal','challenge','timed']);
export const GROWTH=Object.freeze(['leaf','bud','flower']);
export const FLOWER_HOLD=600,CHAIN_HOLD=200;
export const ROUND_LIMIT=30000;
export const POINTS=Object.freeze({leaf:1,bud:2,flower:3});
export const ROUND_COUNT=35,MAX_GLOW=3,MAX_SCORE=ROUND_COUNT*4;
export const unitPoints=unit=>POINTS[unit.growth]+(unit.type==='glow'?1:0);

export class FlingGame {
  constructor({mode='normal',now=()=>performance.now(),random=Math.random}={}) {
    this.now=now;this.random=random;this.reset(mode);
  }
  reset(mode=this.mode) {
    if(!MODES.includes(mode))throw new RangeError('Choose a valid game mode.');
    this.mode=mode;this.count=ROUND_COUNT;this.state='idle';this.score=0;
    const growth=[...Array(25).fill('leaf'),...Array(5).fill('bud'),...Array(5).fill('flower')];
    for(let i=growth.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[growth[i],growth[j]]=[growth[j],growth[i]];}
    this.units=growth.map(growth=>({growth,type:BASE_TYPES[Math.floor(this.random()*BASE_TYPES.length)],status:'ready'}));
    this.startedAt=0;this.finishedTime=0;this.nextChange=Infinity;this.nextGlow=Infinity;this.endReason=null;
  }
  get progress(){return this.units.filter(unit=>unit.status==='eaten').length;}
  get remaining(){return this.count-this.progress;}
  get activeGlow(){return this.units.filter(u=>u.type==='glow'&&u.status!=='eaten').length;}
  get growthCounts(){return Object.fromEntries(GROWTH.map(growth=>[growth,this.units.filter(u=>u.status==='ready'&&u.growth===growth).length]));}
  get elapsed(){return this.state==='playing'?Math.min(this.now()-this.startedAt,this.mode==='timed'?ROUND_LIMIT:Infinity):this.finishedTime;}
  get remainingTime(){return Math.max(0,ROUND_LIMIT-this.elapsed);}
  expire() {
    if(this.state!=='playing'||this.mode!=='timed'||this.now()-this.startedAt<ROUND_LIMIT)return false;
    this.finishedTime=ROUND_LIMIT;this.state='completed';this.endReason='timeout';this.nextChange=Infinity;this.nextGlow=Infinity;
    return true;
  }
  start() {
    if(this.state!=='idle')return false;
    this.startedAt=this.now();this.state='playing';
    if(this.mode!=='normal')this.nextChange=this.startedAt+3000+this.random()*5000;
    this.nextGlow=this.startedAt+4000+this.random()*4000;
    return true;
  }
  advance(protectedIds=new Set()) {
    this.expire();
    const now=this.now();
    if(this.state!=='playing')return [];
    // Choose from the old states, then apply together: no Pikmax changes twice in one wave.
    const changes=[];
    if(this.mode!=='normal'&&now>=this.nextChange){
      for(const [from,to,max] of [['bud','flower',5],['flower','leaf',5],['leaf','bud',10]]) {
        const eligible=this.units.flatMap((u,id)=>u.status==='ready'&&u.growth===from&&!protectedIds.has(id)?[id]:[]);
        const count=Math.min(eligible.length,1+Math.floor(this.random()*max));
        for(let i=0;i<count;i++) {
          const [id]=eligible.splice(Math.floor(this.random()*eligible.length),1);changes.push({id,to});
        }
      }
      for(const {id,to} of changes)this.units[id].growth=to;
      this.nextChange=now+3000+this.random()*5000;
    }
    const changed=changes.map(change=>change.id);
    if(now>=this.nextGlow){
      if(this.activeGlow<MAX_GLOW){
        const eligible=this.units.flatMap((u,id)=>u.status==='ready'&&u.type!=='glow'&&!protectedIds.has(id)&&!changed.includes(id)?[id]:[]);
        if(eligible.length){const id=eligible[Math.floor(this.random()*eligible.length)];this.units[id].type='glow';changed.push(id);}
      }
      // Schedule from now: returning from a hidden tab cannot release a burst.
      this.nextGlow=now+3000+this.random()*4000;
    }
    return changed;
  }
  launch(ids,action={}) {
    this.expire();
    if(this.state!=='playing'||!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length||ids.some(id=>!Number.isInteger(id)||this.units[id]?.status!=='ready'))return false;
    const growth=this.units[ids[0]].growth;
    const valid=action.kind==='chain'
      ? action.held>=CHAIN_HOLD && ids.every(id=>this.units[id].growth===growth&&this.units[id].type===this.units[ids[0]].type) && (growth!=='flower'||ids.length>1||action.held>=FLOWER_HOLD)
      : ids.length===1 && (action.kind==='accessible' || (growth==='bud'
        ? action.kind==='double-tap'
        : action.kind==='fling' && (growth==='leaf'||action.held>=FLOWER_HOLD)));
    if(!valid)return false;
    for(const id of ids)this.units[id].status='flying';return true;
  }
  arrive(id) {
    this.expire();
    if(this.state!=='playing'||!Number.isInteger(id)||this.units[id]?.status!=='flying')return false;
    this.units[id].status='eaten';
    if(this.mode==='timed')this.score+=unitPoints(this.units[id]);
    if(this.progress===this.count){this.finishedTime=this.elapsed;this.state='completed';this.endReason='cleared';this.nextChange=Infinity;this.nextGlow=Infinity;}
    return true;
  }
}
