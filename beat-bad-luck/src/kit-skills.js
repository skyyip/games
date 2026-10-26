import {EXTRA_KITS} from './kit-catalog.js';
import {beginExpanded,advanceExpanded,actExpanded,cancelExpanded} from './kit-gestures.js';
// Active ritual milliseconds drive skills, daylight and every input deadline.
export const SKILL_CHARGE=12,SKILL_LIMIT=4,SKILL_DURATION=7000,SKILL_RESULT=650,SKILL_REST=8000,SKILL_BONUS=50;
export const FIRST_SIX_KITS=['flying-dagger','plunger-nunchucks','beauty-fist','solar-torch','immunity-token','flipflop'];
export const KIT_SKILLS={...EXTRA_KITS,
 'flying-dagger':{name:['三紙連環刀','Triple paper toss'],hint:['準星亮起時，依次點中三張紙。','Tap each paper in order when its ring lights up.'],win:['三紙串燒！最後改一次都冇用！','Triple paper kebab! No more final revisions!']},
 'plunger-nunchucks':{name:['吸實彈走','Suction slingshot'],hint:['按住紙人，左右拉過兩邊，再鬆手彈飛。','Hold the paper, pull left and right, then release.'],win:['啵！黐住都要收工！','POP! Even the plunger is clocking off!']},
 'beauty-fist':{name:['越打越自戀','Vanity makeover'],hint:['點拍五次化妝，再點鏡子，照走自戀怪。','Tap five times for a makeover, then tap the mirror.'],win:['靚到唔記得返工！塊紙都皺埋！','Too gorgeous to work! Still a very crumpled paper!']},
 'solar-torch':{name:['借個光先','Borrow some sunshine'],hint:['把電筒拖到左邊陽光充電，再按「照一照」。','Drag the torch into the sunshine on the left, then Shine.'],win:['曬夠喇！歪理即刻曝光！','Fully sunbathed! Those excuses are exposed!']},
 'immunity-token':{name:['今日唔批','Application denied'],hint:['拖開牌，再把印章拖到虛線框；覆核一次都唔批。','Drag the token aside and stamp the dotted box. Deny its appeal too.'],win:['今日唔批！覆核都唔批！','DENIED! The appeal is denied too!']},
 flipflop:{name:['左右開工掌','Double slipper shift'],hint:['跟亮燈拍子，左、右、左、右交替點拍。','Follow the lit beat: left, right, left, right.'],win:['雙拖夾面！小人變夾心餅！','Double slipper sandwich! One flattened gremlin!']}
};
const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
const daylight=(a,b)=>[[0,1800],[3000,SKILL_DURATION]].reduce((sum,[lo,hi])=>sum+Math.max(0,Math.min(b,hi)-Math.max(a,lo)),0);
export class KitSkill{
 constructor(weapon){this.weapon=weapon;this.spec=KIT_SKILLS[weapon]??null;this.charge=0;this.attempts=0;this.wins=0;this.bonus=0;this.active=null;this.last=null;this.cooldown=0;this.beauty=0;}
 gain(){if(this.spec&&this.attempts<SKILL_LIMIT)this.charge=Math.min(SKILL_CHARGE,this.charge+1);if(this.weapon==='beauty-fist')this.beauty=Math.min(5,this.beauty+.25);}
 busy(elapsed){return Boolean(this.active||(this.last&&elapsed<this.last.at+SKILL_RESULT));}
 availability(elapsed,events=[],duration=90000){
  if(!this.spec||this.attempts>=SKILL_LIMIT)return 'spent';
  if(this.busy(elapsed))return 'busy';if(this.charge<SKILL_CHARGE)return 'charging';if(elapsed<this.cooldown)return 'rest';
  if(duration-elapsed<SKILL_DURATION+SKILL_RESULT)return 'ending';
  if(events.some(e=>elapsed<e.at+5400&&elapsed+SKILL_DURATION+SKILL_RESULT>e.at))return 'event';return 'ready';
 }
 start(elapsed,events,duration){if(this.availability(elapsed,events,duration)!=='ready')return false;this.attempts++;this.charge=0;this.last=null;this.active={at:elapsed,checked:elapsed,progress:0,held:false,left:0,right:0,pull:0,torchX:.76,chargeMs:0,tokenClear:false,stamps:0,lastInput:-Infinity,flashAt:-Infinity};if(this.spec.steps)beginExpanded(this.active,elapsed,this.attempts);return true;}
 finish(elapsed,won){if(!this.active)return false;const state=this.active;this.last={at:elapsed,won,progress:state.progress,stamps:state.stamps};this.active=null;this.cooldown=elapsed+SKILL_REST;if(won)this.wins++;return true;}
 advance(elapsed){const a=this.active;if(!a)return;if(this.spec.steps)advanceExpanded(this.spec,a,Math.min(elapsed,a.at+SKILL_DURATION));if(this.weapon==='solar-torch'&&a.torchX<=.4)a.chargeMs=Math.min(900,a.chargeMs+daylight(Math.max(0,a.checked-a.at),Math.min(SKILL_DURATION,elapsed-a.at)));a.checked=elapsed;if(elapsed>=a.at+SKILL_DURATION)this.finish(a.at+SKILL_DURATION,false);}
 cancelPointer(){if(this.active){this.active.held=false;this.active.left=0;this.active.right=0;this.active.pull=0;cancelExpanded(this.active);}}
 action(type,input={},elapsed){
  this.advance(elapsed);const a=this.active;if(!a)return {ok:false};if(this.spec.steps){const out=actExpanded(this.spec,a,type,input,elapsed);if(out.won)this.finish(elapsed,true);return {...out,raw:out.won?SKILL_BONUS:0};}const t=elapsed-a.at;let ok=false,won=false;
  if(this.weapon==='flying-dagger'&&type==='throw'&&elapsed-a.lastInput>=100){a.lastInput=elapsed;ok=input.index===a.progress&&Math.abs(t-(a.progress+1)*900)<=250;if(ok)won=++a.progress===3;}
  if(this.weapon==='flipflop'&&type==='slap'&&elapsed-a.lastInput>=100){a.lastInput=elapsed;ok=input.side===(a.progress%2?'right':'left')&&Math.abs(t-(a.progress+1)*600)<=240;if(ok)won=++a.progress===4;}
  if(this.weapon==='plunger-nunchucks'){
   if(type==='grab'){a.held=true;a.left=a.right=a.pull=0;ok=true;}
   if(type==='pull'&&a.held){const x=Math.max(-.7,Math.min(.7,Number(input.x)||0));a.pull=x;a.left=Math.min(a.left,x);a.right=Math.max(a.right,x);ok=true;}
   if(type==='release'&&a.held){a.held=false;ok=won=a.left<=-.15&&a.right>=.15;if(!won)a.pull=0;}
  }
  if(this.weapon==='beauty-fist'){
   if(type==='makeup'&&a.progress<5&&elapsed-a.lastInput>=90){a.lastInput=elapsed;a.progress++;this.beauty=Math.max(this.beauty,a.progress);ok=true;}
   if(type==='mirror'&&a.progress===5)ok=won=true;
  }
  if(this.weapon==='solar-torch'){
   if(type==='place'){a.torchX=clamp(input.x);ok=true;}
   if(type==='shine'){ok=won=a.chargeMs>=900;if(!won)a.flashAt=elapsed;}
  }
  if(this.weapon==='immunity-token'){
   if(type==='dismiss'&&Math.abs(Number(input.x))>=.18){a.tokenClear=true;ok=true;}
   if(type==='stamp'&&a.tokenClear&&Number.isFinite(input.x)&&Number.isFinite(input.y)&&Math.abs(input.x-.5)<=.18&&Math.abs(input.y-.45)<=.2){ok=true;a.stamps++;a.progress=a.stamps;a.tokenClear=false;won=a.stamps===2;}
  }
  if(won)this.finish(elapsed,true);return {ok,won,raw:won?SKILL_BONUS:0};
 }
 snapshot(){return {weapon:this.weapon,attempts:this.attempts,wins:this.wins,bonus:this.bonus};}
}
