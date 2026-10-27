import {WORRIES} from './catalog.js';
// Active ritual time drives every deadline; pauses cannot extend a held gesture.
export const EVENT_DURATION=5400,TRAM_BEAT=700,HICCUP_HOLD_MS=1100;
export const EVENTS=[
 {id:'tram',name:['叮叮到！跟車鈴連中四拍，亂拍會重計。', 'Tram! Match four consecutive bell beats.'],icon:'🔔'},
 {id:'rain',name:['落雨！準確拖入棚中央，或按移棚三次。', 'Drag to awning centre, or shelter ×3.'],icon:'☂'},
 {id:'wind',name:['接拖鞋兩次，間隔 0.3–1.2 秒！', 'Catch twice, 0.3–1.2 seconds apart!'],icon:'🩴'},
 {id:'pigeon',name:['左掃→右掃，或先夾再拉闊！', 'Flick left → right, or pinch → spread!'],icon:'🕊'},
 {id:'receipt',name:['向上卷三次，或完整搓三次！', 'Roll upward three times, or rub three times!'],icon:'🧾'},
 {id:'auntie',name:['夾→拉闊→再夾，封住大聲公！', 'Pinch → spread → pinch to zip it shut!'],icon:'📣'},
 {id:'blackout',name:['先順時針，再逆時針畫圈發電！', 'Circle clockwise, then anti-clockwise!'],icon:'💡'},
 {id:'minibus',name:['按亮圈數字順序接三個硬幣，錯咗重接！', 'Catch the numbered coins in order; mistakes reset!'],icon:'🚐'},
 {id:'sneeze',name:['穩按肉丸 1.1 秒，或重扣三次！', 'Hold steady 1.1s, or heavy-whack three times!'],icon:'🐯'}];
const MOVES={...Object.fromEntries(WORRIES.filter(w=>w.weakness).map(w=>[w.id,w.weakness])),noise:'heavy',sleep:'circle','kam-friends':'pinch',family:'rub',love:'tap',commute:'heavy','blind-box':'rub',marksix:'circle'};
export const EVENT_MOVES={pigeon:['pinch',2],receipt:['rub',3],auntie:['pinch',3],blackout:['circle',2],sneeze:['heavy',3]};
export const EVENT_SEQUENCES={pigeon:[{gesture:'pinch'},{gesture:'spread'}],auntie:[{gesture:'pinch'},{gesture:'spread'},{gesture:'pinch'}],blackout:[{gesture:'circle',direction:'cw'},{gesture:'circle',direction:'ccw'}]};
export function eventGoal(event){return ({tram:4,rain:3,wind:2,minibus:3})[event?.type]??EVENT_MOVES[event?.type]?.[1]??1;}
export function eventStep(event){return EVENT_SEQUENCES[event?.type]?.[event.hits]??{gesture:EVENT_MOVES[event?.type]?.[0]};}
const matches=(step,gesture,direction)=>step?.gesture===gesture&&(!step.direction||step.direction===direction);
const stepPoints=(event,total)=>event.won?total-4*(eventGoal(event)-1):4;
export class RitualFlavour{
 constructor(random=Math.random){this.random=random;this.start('work');}
 start(kind){this.kind=kind;this.copies=[];this.copySerial=0;this.successfulHits=0;this.weaknessHits=0;this.copiesCleared=0;this.lastGesture='';this.eventsWon=0;const bag=EVENTS.map(e=>e.id),count=this.random()<.6?2:3;this.events=Array.from({length:count},(_,index)=>({id:index,type:bag.splice(Math.min(bag.length-1,Math.floor(this.random()*bag.length)),1)[0],at:[12000,32000,50000][index],won:false,hits:0,claimed:[],lastPulse:-1,lastAction:-Infinity,mistakes:0,order:[(index+1)%3,(index+2)%3,index%3],holdAt:null}));}
 eventAt(elapsed){return this.events.find(e=>elapsed>=e.at&&elapsed<e.at+EVENT_DURATION)??null;}
 view(elapsed){this.copies=this.copies.filter(c=>c.until>elapsed);let mood='ordinary';if(this.kind==='teammates'){const time=elapsed%5000;mood=time<1800?'helmet':time<3400?'sleeping':'snickering';}else if(this.kind==='stocks')mood=elapsed%6000>=2500&&elapsed%6000<4800?'falling':'rising';else if(this.kind==='work'||this.kind==='work-life')mood='copying';return {kind:this.kind,mood,copies:this.copies,event:this.eventAt(elapsed)};}
 win(event){if(event.won)return false;event.won=true;event.holdAt=null;this.eventsWon++;return true;}
 hit(elapsed,gesture,perfect,base,multiplier,{direction=null}={}){
  const {mood,event}=this.view(elapsed);let weak=false,protectedHit=false,copyCleared=false;
  if(this.kind==='teammates'){weak=mood==='snickering';protectedHit=!weak;}else if(this.kind==='stocks')weak=mood==='falling';else if(this.kind==='work-life')weak=Boolean(this.lastGesture&&this.lastGesture!==gesture);else if(this.kind==='work'){if(gesture==='heavy'&&this.copies.length){this.copies.shift();this.copiesCleared++;weak=copyCleared=true;}}else weak=MOVES[this.kind]===gesture&&(this.kind!=='love'||perfect);
  this.lastGesture=gesture;if(weak)this.weaknessHits++;let points=Math.round(base*multiplier*(protectedHit?.35:weak?1.4:1)),tram=false,eventProgress=false;
  if(event&&!event.won){
   if(event.type==='tram'){
    const offset=(elapsed-event.at)%TRAM_BEAT,pulse=Math.round((elapsed-event.at)/TRAM_BEAT),onBeat=Math.min(offset,TRAM_BEAT-offset)<=90;
    if(onBeat&&event.lastPulse!==pulse){event.hits=event.lastPulse===pulse-1?event.hits+1:1;event.lastPulse=pulse;points+=Math.round(8*multiplier);tram=eventProgress=true;if(event.hits>=4)this.win(event);}
    else if(!onBeat&&event.hits){event.hits=0;event.lastPulse=-1;event.mistakes++;}
   }else if(elapsed-event.lastAction>=180){
    const sequence=EVENT_SEQUENCES[event.type],goal=EVENT_MOVES[event.type],step=eventStep(event);
    if(sequence?.some(s=>s.gesture===gesture)){
     event.lastAction=elapsed;
     if(matches(step,gesture,direction)){event.hits++;eventProgress=true;}
     else{event.hits=matches(sequence[0],gesture,direction)?1:0;event.mistakes++;}
    }else if(!sequence&&goal?.[0]===gesture){event.hits++;event.lastAction=elapsed;eventProgress=true;}
    if(eventProgress){if(event.hits>=eventGoal(event))this.win(event);points+=Math.round(stepPoints(event,28)*multiplier);}
   }
  }
  this.successfulHits++;if((this.kind==='work'||this.kind==='work-life')&&this.successfulHits%4===0&&this.copies.length<2)this.copies.push({id:++this.copySerial,until:elapsed+4500});
  return {points,weak,protectedHit,copyCleared,tram,eventProgress,mood};
 }
 beginHold(elapsed){const event=this.eventAt(elapsed);if(!event||event.type!=='sneeze'||event.won)return false;event.holdAt=elapsed;return true;}
 cancelHold(){for(const event of this.events)event.holdAt=null;}
 resolve(action,id,elapsed){
  this.view(elapsed);if(action==='copy'){const index=this.copies.findIndex(c=>c.id===id);if(index<0)return 0;this.copies.splice(index,1);this.copiesCleared++;this.weaknessHits++;return 12;}
  const event=this.eventAt(elapsed);if(!event||event.won||action!==event.type)return 0;
  if(action==='minibus'){
   if(!Number.isInteger(id)||id<0||id>2||event.claimed.includes(id)||elapsed-event.lastAction<180)return 0;
   if(id!==event.order[event.hits]){event.claimed=[];event.hits=0;event.mistakes++;return 0;}
   event.lastAction=elapsed;event.claimed.push(id);event.hits++;if(event.hits===3)this.win(event);return event.won?24:4;
  }
  if(action==='sneeze'){const since=event.holdAt;event.holdAt=null;if(!Number.isFinite(since)||elapsed-since<HICCUP_HOLD_MS)return 0;event.hits=3;this.win(event);return 28;}
  if(action==='rain'){
   if(id?.mode==='drag'){if(!Number.isFinite(id.distance)||!Number.isFinite(id.error)||id.distance<40||id.error<0||id.error>32)return 0;event.hits=3;this.win(event);return 30;}
   if(elapsed-event.lastAction<180)return 0;event.lastAction=elapsed;event.hits++;if(event.hits===3)this.win(event);return stepPoints(event,30);
  }
  if(action==='wind'){
   const gap=elapsed-event.lastAction;if(gap<300)return 0;event.hits=event.hits&&gap<=1200?2:1;event.lastAction=elapsed;if(event.hits===2)this.win(event);return stepPoints(event,25);
  }
  if(action==='pigeon'){
   if(!['left','right'].includes(id)||elapsed-event.lastAction<180)return 0;
   event.lastAction=elapsed;const correct=id===(event.hits===0?'left':'right');if(!correct){event.hits=id==='left'?1:0;event.mistakes++;return 0;}event.hits++;if(event.hits===2)this.win(event);return stepPoints(event,28);
  }
  if(action==='receipt'){if(id!=='up'||elapsed-event.lastAction<180)return 0;event.lastAction=elapsed;event.hits++;if(event.hits===3)this.win(event);return stepPoints(event,28);}
  return 0;
 }
 snapshot(){return {weaknessHits:this.weaknessHits,copiesCleared:this.copiesCleared,eventsWon:this.eventsWon,events:this.events.map(e=>({type:e.type,won:e.won}))};}
}
