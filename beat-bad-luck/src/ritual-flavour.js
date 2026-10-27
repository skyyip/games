import {WORRIES} from './catalog.js';
// Opt in to one random surprise per ritual, resolved by one ordinary action.
export const EVENT_DURATION=5400,TRAM_BEAT=700,HICCUP_HOLD_MS=700;
export const EVENTS=[
 {id:'tram',name:['叮叮偷走張收工票，拍一下拎返！','Tram stole your clock-off ticket. Tap to reclaim it!'],icon:'🔔',gesture:'tap'},
 {id:'rain',name:['雨雲話想加班，掃走佢！','Rain cloud wants overtime. Swipe it away!'],icon:'☂',gesture:'heavy'},
 {id:'wind',name:['拖鞋搭錯風，拍一下接住！','Slipper caught the wrong wind. Tap to catch it!'],icon:'🩴',gesture:'tap'},
 {id:'pigeon',name:['白鴿搶鏡，一掃請佢落台！','Pigeon stole the scene. Swipe it off stage!'],icon:'🕊',gesture:'heavy'},
 {id:'receipt',name:['又一張最後修改版？掃走張單！','Another final revision? Swipe the receipt away!'],icon:'🧾',gesture:'heavy'},
 {id:'auntie',name:['大聲公講到冇氣，拍一下收咪！','Megaphone won’t stop. Tap to mute it!'],icon:'📣',gesture:'tap'},
 {id:'blackout',name:['燈膽扮瞓，拍一下叫醒！','Bulb’s pretending to sleep. Tap to wake it!'],icon:'💡',gesture:'tap'},
 {id:'minibus',name:['小巴司機找多個硬幣，拍一下接住！','Driver tossed your change. Tap to catch it!'],icon:'🚐',gesture:'tap'},
 {id:'sneeze',name:['牛丸準備打乞嗤，拍一下冚住！','Meatball’s about to sneeze. Tap to cover it!'],icon:'🐯',gesture:'tap'}
];
const MOVES={...Object.fromEntries(WORRIES.filter(w=>w.weakness).map(w=>[w.id,w.weakness])),noise:'heavy',sleep:'circle','kam-friends':'pinch',family:'rub',love:'tap',commute:'heavy','blind-box':'rub',marksix:'circle'};
export const EVENT_MOVES=Object.fromEntries(EVENTS.map(e=>[e.id,[e.gesture,1]]));
export const EVENT_SEQUENCES={};
export const eventGoal=()=>1;
export const eventStep=event=>({gesture:EVENT_MOVES[event?.type]?.[0]??'tap'});
export class RitualFlavour{
 constructor(random=Math.random){this.random=random;this.start('work');}
 start(kind,{randomEvents=false}={}){this.kind=kind;this.copies=[];this.copySerial=0;this.successfulHits=0;this.weaknessHits=0;this.copiesCleared=0;this.lastGesture='';this.eventsWon=0;const bag=EVENTS.map(e=>e.id);this.events=(randomEvents===true?[18000]:[]).map((at,id)=>({id,type:bag.splice(Math.min(bag.length-1,Math.floor(this.random()*bag.length)),1)[0],at,won:false,hits:0,claimed:[],lastAction:-Infinity,mistakes:0,holdAt:null}));}
 eventAt(elapsed){return this.events.find(e=>elapsed>=e.at&&elapsed<e.at+EVENT_DURATION)??null;}
 view(elapsed){this.copies=this.copies.filter(c=>c.until>elapsed);let mood='ordinary';if(this.kind==='teammates'){const time=elapsed%5000;mood=time<1800?'helmet':time<3400?'sleeping':'snickering';}else if(this.kind==='stocks')mood=elapsed%6000>=2500&&elapsed%6000<4800?'falling':'rising';else if(this.kind==='work'||this.kind==='work-life')mood='copying';return {kind:this.kind,mood,copies:this.copies,event:this.eventAt(elapsed)};}
 win(event){if(event.won)return false;event.won=true;event.hits=1;event.holdAt=null;this.eventsWon++;return true;}
 hit(elapsed,gesture,perfect,base,multiplier){
  const {mood,event}=this.view(elapsed);let weak=false,protectedHit=false,copyCleared=false;
  if(this.kind==='teammates'){weak=mood==='snickering';protectedHit=!weak;}else if(this.kind==='stocks')weak=mood==='falling';else if(this.kind==='work-life')weak=Boolean(this.lastGesture&&this.lastGesture!==gesture);else if(this.kind==='work'){if(gesture==='heavy'&&this.copies.length){this.copies.shift();this.copiesCleared++;weak=copyCleared=true;}}else weak=MOVES[this.kind]===gesture&&(this.kind!=='love'||perfect);
  this.lastGesture=gesture;if(weak)this.weaknessHits++;let points=Math.round(base*multiplier*(protectedHit?.35:weak?1.4:1)),eventProgress=false;
  if(event&&!event.won&&eventStep(event).gesture===gesture){this.win(event);points+=Math.round(28*multiplier);eventProgress=true;}
  this.successfulHits++;if((this.kind==='work'||this.kind==='work-life')&&this.successfulHits%4===0&&this.copies.length<2)this.copies.push({id:++this.copySerial,until:elapsed+4500});
  return {points,weak,protectedHit,copyCleared,tram:event?.type==='tram'&&eventProgress,eventProgress,mood};
 }
 beginHold(){return false;}
 cancelHold(){}
 resolve(action,id,elapsed){this.view(elapsed);if(action==='copy'){const at=this.copies.findIndex(c=>c.id===id);if(at<0)return 0;this.copies.splice(at,1);this.copiesCleared++;this.weaknessHits++;return 12;}const event=this.eventAt(elapsed);if(!event||event.won||action!==event.type)return 0;if(this.win(event))return 28;return 0;}
 snapshot(){return {weaknessHits:this.weaknessHits,copiesCleared:this.copiesCleared,eventsWon:this.eventsWon,events:this.events.map(e=>({type:e.type,won:e.won}))};}
}
