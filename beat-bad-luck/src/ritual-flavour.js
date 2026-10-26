// Active ritual time drives every deadline; pauses cannot extend a held gesture.
export const EVENT_DURATION=5400,TRAM_BEAT=700;
export const EVENTS=[
 {id:'tram',name:['叮叮到！跟車鈴打中三拍。','Tram incoming! Match three bell beats.'],icon:'🔔'},
 {id:'rain',name:['突然落雨！紙人要搬去遮雨棚。','Rain! Move the paper worry under the awning.'],icon:'☂'},
 {id:'wind',name:['怪風吹甩拖鞋！快接住。','A gust stole the slipper! Catch it.'],icon:'🩴'},
 {id:'pigeon',name:['飛鴿送奶油！橫掃甩走，或用雙指夾。','Pigeon cream delivery! Swipe it away, or pinch.'],icon:'🕊'},
 {id:'receipt',name:['單據長過火龍！向上卷，或來回搓兩次。','Dragon-length receipt! Swipe up, or rub twice.'],icon:'🧾'},
 {id:'auntie',name:['街坊開演唱會！雙指夾兩次拉好拉鏈。','Auntie’s megaphone concert! Pinch twice to zip it.'],icon:'📣'},
 {id:'blackout',name:['電箱罷工！畫圈一次，人力發電！','The fuse box quit! Circle once to generate power.'],icon:'💡'},
 {id:'minibus',name:['小巴散銀飛到太空！接住三個不同硬幣。','Minibus coins in orbit! Catch three different coins.'],icon:'🚐'},
 {id:'sneeze',name:['白虎打嗝！按住肉丸 0.7 秒，或重扣兩次。','Tiger hiccups! Hold the meatball 0.7s, or heavy-whack twice.'],icon:'🐯'}];
const MOVES={noise:'heavy',sleep:'circle','kam-friends':'pinch',family:'rub',love:'tap',commute:'heavy'};
export const EVENT_MOVES={pigeon:['pinch',1],receipt:['rub',2],auntie:['pinch',2],blackout:['circle',1],sneeze:['heavy',2]};
export class RitualFlavour{
 constructor(random=Math.random){this.random=random;this.start('work');}
 start(kind){this.kind=kind;this.copies=[];this.copySerial=0;this.successfulHits=0;this.weaknessHits=0;this.copiesCleared=0;this.lastGesture='';this.eventsWon=0;const bag=EVENTS.map(e=>e.id),count=this.random()<.6?1:2;this.events=Array.from({length:count},(_,index)=>({id:index,type:bag.splice(Math.min(bag.length-1,Math.floor(this.random()*bag.length)),1)[0],at:index?29000:12000,won:false,hits:0,claimed:[],lastPulse:-1,holdAt:null}));}
 eventAt(elapsed){return this.events.find(e=>elapsed>=e.at&&elapsed<e.at+EVENT_DURATION)??null;}
 view(elapsed){this.copies=this.copies.filter(c=>c.until>elapsed);let mood='ordinary';if(this.kind==='teammates'){const time=elapsed%5000;mood=time<1800?'helmet':time<3400?'sleeping':'snickering';}else if(this.kind==='stocks')mood=elapsed%6000>=2500&&elapsed%6000<4800?'falling':'rising';else if(this.kind==='work'||this.kind==='work-life')mood='copying';return {kind:this.kind,mood,copies:this.copies,event:this.eventAt(elapsed)};}
 win(event){if(event.won)return false;event.won=true;event.holdAt=null;this.eventsWon++;return true;}
 hit(elapsed,gesture,perfect,base,multiplier){
  const {mood,event}=this.view(elapsed);let weak=false,protectedHit=false,copyCleared=false;
  if(this.kind==='teammates'){weak=mood==='snickering';protectedHit=!weak;}else if(this.kind==='stocks')weak=mood==='falling';else if(this.kind==='work-life')weak=Boolean(this.lastGesture&&this.lastGesture!==gesture);else if(this.kind==='work'){if(gesture==='heavy'&&this.copies.length){this.copies.shift();this.copiesCleared++;weak=copyCleared=true;}}else weak=MOVES[this.kind]===gesture&&(this.kind!=='love'||perfect);
  this.lastGesture=gesture;if(weak)this.weaknessHits++;let points=Math.round(base*multiplier*(protectedHit?.35:weak?1.4:1)),tram=false,eventProgress=false;
  if(event&&!event.won){if(event.type==='tram'){const offset=(elapsed-event.at)%TRAM_BEAT,pulse=Math.round((elapsed-event.at)/TRAM_BEAT);if(Math.min(offset,TRAM_BEAT-offset)<=110&&event.lastPulse!==pulse){event.lastPulse=pulse;points+=Math.round(8*multiplier);event.hits++;tram=eventProgress=true;if(event.hits>=3)this.win(event);}}
   else{const goal=EVENT_MOVES[event.type];if(goal?.[0]===gesture){event.hits++;eventProgress=true;const done=event.hits>=goal[1];points+=Math.round((done?28:4)*multiplier);if(done)this.win(event);}}}
  this.successfulHits++;if((this.kind==='work'||this.kind==='work-life')&&this.successfulHits%4===0&&this.copies.length<2)this.copies.push({id:++this.copySerial,until:elapsed+4500});
  return {points,weak,protectedHit,copyCleared,tram,eventProgress,mood};
 }
 beginHold(elapsed){const event=this.eventAt(elapsed);if(!event||event.type!=='sneeze'||event.won)return false;event.holdAt=elapsed;return true;}
 cancelHold(){for(const event of this.events)event.holdAt=null;}
 resolve(action,id,elapsed){
  this.view(elapsed);if(action==='copy'){const index=this.copies.findIndex(c=>c.id===id);if(index<0)return 0;this.copies.splice(index,1);this.copiesCleared++;this.weaknessHits++;return 12;}
  const event=this.eventAt(elapsed);if(!event||event.won||action!==event.type)return 0;
  if(action==='minibus'){event.claimed??=[];if(!Number.isInteger(id)||id<0||id>2||event.claimed.includes(id))return 0;event.claimed.push(id);event.hits=event.claimed.length;if(event.hits===3){this.win(event);return 24;}return 4;}
  if(action==='sneeze'){const since=event.holdAt;event.holdAt=null;if(!Number.isFinite(since)||elapsed-since<700)return 0;}
  if(!['rain','wind','pigeon','receipt','sneeze'].includes(action))return 0;
  this.win(event);return action==='rain'?30:action==='wind'?25:28;
 }
 snapshot(){return {weaknessHits:this.weaknessHits,copiesCleared:this.copiesCleared,eventsWon:this.eventsWon,events:this.events.map(e=>({type:e.type,won:e.won}))};}
}
