// The clock is the ritual's active elapsed time, so backgrounding freezes every window.
export const EVENT_DURATION=5400,TRAM_BEAT=700;
const MOVES={noise:'heavy',sleep:'circle','kam-friends':'pinch',family:'rub',love:'tap',commute:'heavy'};
export class RitualFlavour{
 constructor(random=Math.random){this.random=random;this.start('work');}
 start(kind){this.kind=kind;this.copies=[];this.copySerial=0;this.successfulHits=0;this.weaknessHits=0;this.copiesCleared=0;this.lastGesture='';this.eventsWon=0;const bag=['tram','rain','wind'],count=this.random()<.6?1:2;this.events=Array.from({length:count},(_,index)=>({id:index,type:bag.splice(Math.min(bag.length-1,Math.floor(this.random()*bag.length)),1)[0],at:index?29000:12000,won:false,hits:0}));}
 eventAt(elapsed){return this.events.find(e=>elapsed>=e.at&&elapsed<e.at+EVENT_DURATION)??null;}
 view(elapsed){
  this.copies=this.copies.filter(c=>c.until>elapsed);
  let mood='ordinary';if(this.kind==='teammates'){const time=elapsed%5000;mood=time<1800?'helmet':time<3400?'sleeping':'snickering';}else if(this.kind==='stocks')mood=elapsed%6000>=2500&&elapsed%6000<4800?'falling':'rising';else if(this.kind==='work'||this.kind==='work-life')mood='copying';
  return {kind:this.kind,mood,copies:this.copies,event:this.eventAt(elapsed)};
 }
 hit(elapsed,gesture,perfect,base,multiplier){
  const {mood,event}=this.view(elapsed);let weak=false,protectedHit=false,copyCleared=false;
  if(this.kind==='teammates'){weak=mood==='snickering';protectedHit=!weak;}
  else if(this.kind==='stocks')weak=mood==='falling';
  else if(this.kind==='work-life')weak=Boolean(this.lastGesture&&this.lastGesture!==gesture);
  else if(this.kind==='work'){if(gesture==='heavy'&&this.copies.length){this.copies.shift();this.copiesCleared++;weak=copyCleared=true;}}
  else weak=MOVES[this.kind]===gesture&&(this.kind!=='love'||perfect);
  this.lastGesture=gesture;if(weak)this.weaknessHits++;
  let points=Math.round(base*multiplier*(protectedHit?.35:weak?1.4:1));
  let tram=false;if(event?.type==='tram'&&!event.won){const offset=(elapsed-event.at)%TRAM_BEAT;if(Math.min(offset,TRAM_BEAT-offset)<=110){points+=Math.round(8*multiplier);event.hits++;tram=true;if(event.hits>=3){event.won=true;this.eventsWon++;}}}
  this.successfulHits++;
  if((this.kind==='work'||this.kind==='work-life')&&this.successfulHits%4===0&&this.copies.length<2)this.copies.push({id:++this.copySerial,until:elapsed+4500});
  return {points,weak,protectedHit,copyCleared,tram,mood};
 }
 resolve(action,id,elapsed){
  this.view(elapsed);
  if(action==='copy'){const index=this.copies.findIndex(c=>c.id===id);if(index<0)return 0;this.copies.splice(index,1);this.copiesCleared++;this.weaknessHits++;return 12;}
  const event=this.eventAt(elapsed);if(!event||event.won||action!==event.type||!['rain','wind'].includes(action))return 0;
  event.won=true;this.eventsWon++;return action==='rain'?30:25;
 }
 snapshot(){return {weaknessHits:this.weaknessHits,copiesCleared:this.copiesCleared,eventsWon:this.eventsWon,events:this.events.map(e=>({type:e.type,won:e.won}))};}
}
