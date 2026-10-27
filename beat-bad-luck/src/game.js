import {SKINS,skinScoreMultiplier} from './skins.js';
import {ULTIMATE_DURATION,ULTIMATE_LIMIT,NICE_AT,NICE_WINDOW,COMBO_GRACE,chargeForCombo,comedyEnding} from './comedy-content.js';
import {RitualFlavour} from './ritual-flavour.js';
import {WORRIES,WEAPONS,FORTUNES,weaponScoreMultiplier} from './catalog.js';
export const PHASES=['incense','worry','beat','tiger','blessing','divination'];
export const DURATIONS={incense:8000,worry:7000,beat:68000,tiger:0,blessing:0,divination:0};
export const FINISHER_DURATION=ULTIMATE_DURATION,FINISHER_BUFFER=0;
export const FINISHER_STEPS=['tap'];
export const BEAT_INTERVAL=60000/108;
export const QTE_STEPS=[{at:4500,type:'double'},{at:11000,type:'heavy'},{at:17500,type:'rub'},{at:23500,type:'circle'},{at:29000,type:'pinch'},{at:35500,type:'circle'},{at:41000,type:'circle'},{at:47500,type:'heavy'},{at:56500,type:'pinch'},{at:61000,type:'circle'},{at:65000,type:'heavy'}];
const SPECIALS={rub:{min:3,power:6,points:28},circle:{min:5,power:8,points:40},pinch:{min:6,power:9,points:46}};
export class RitualGame{
  constructor({now=()=>performance.now(),random=Math.random}={}){this.now=now;this.random=random;this.reset();}
  reset(){this.phase='setup';this.phaseStarted=0;this.started=0;this.pausedAt=null;this.lit=new Set();this.blown=false;this.prepared=false;this.worry='';this.kind='work';this.randomEvents=false;this.weapon='bare-hand';this.look=0;this.skin='plain';this.hits=0;this.heavy=0;this.specials={rub:0,circle:0,pinch:0,hold:0,spread:0,cross:0,vee:0};this.rotations={cw:0,ccw:0};this.perfect=0;this.damage=0;this.combo=0;this.bestCombo=0;this.score=0;this.lastHit=-Infinity;this.strikes=new Map();this.qte=null;this.qteIndex=0;this.qteSuccess=0;this.porkMode='plain';this.dipped=false;this.tigerSmear=0;this.tigerBonus=0;this.purification=0;this.grains='rice';this.blocks=null;this.rolls=0;this.finisherBank=0;this.finisher=null;this.finisherWins=0;this.fed=false;this.fedAt=null;this.blessed=false;this.blessedAt=null;this.result=null;this.transitions=[];this.flavour=new RitualFlavour(this.random);this.moves={tap:0,heavy:0,rub:0,circle:0,pinch:0,hold:0,spread:0,cross:0,vee:0};this.perfectStreak=0;this.maxPerfectStreak=0;this.commission='';this.finisherCharge=0;this.finisherUses=0;this.finisherBonus=0;this.niceWins=0;this.assistCameo=null;this.skill={busy:()=>this.finisherBusy,cancelPointer(){},snapshot:()=>({weapon:this.weapon,attempts:this.finisherUses,wins:this.finisherWins,bonus:this.finisherBonus,unified:true})};}
  start({worry='The eighth revision',kind='work',weapon='bare-hand',commission='',skin='plain',randomEvents=false}={}){
    if(!WEAPONS.some(w=>w.id===weapon))throw new RangeError('Choose an available keepsake.');
    this.reset();this.randomEvents=randomEvents===true;this.skin=SKINS.some(s=>s.id===skin)?skin:'plain';this.worry=String(worry).trim().slice(0,64)||'The eighth revision';this.kind=WORRIES.some(w=>w.id===kind)?kind:'work';this.weapon=weapon;this.look=Math.min(2,Math.floor(this.random()*3));this.porkMode=this.random()<.5?'blood':'plain';this.grains=this.random()<.5?'rice':'beans';this.started=this.phaseStarted=this.now();this.phase='incense';this.commission=commission;this.flavour.start(this.kind,{randomEvents:this.randomEvents});
  }
  get finisherBusy(){return Boolean(this.finisher?.active);}
  get finisherTime(){return this.finisher?.active?Math.max(0,this.clock-this.finisher.at):0;}
  get scoreMultiplier(){return weaponScoreMultiplier(this.weapon)*skinScoreMultiplier(this.skin);}
  get clock(){return this.pausedAt??this.now();}
  get elapsed(){return this.phase==='beat'&&this.finisher?.active?this.finisher.beatAt:Math.max(0,this.clock-this.phaseStarted);}
  get remaining(){return Math.max(0,(DURATIONS[this.phase]??0)-this.elapsed);}
  get papers(){return Math.floor(this.damage/50);}
  get wear(){const elapsed=this.phase==='beat'?this.elapsed:['setup','incense','worry'].includes(this.phase)?0:DURATIONS.beat;return Math.min(1,Math.max(0,elapsed/DURATIONS.beat)*.45+Math.min(1,this.score/1800)*.55);}
  pause(){if(this.pausedAt!==null||!PHASES.includes(this.phase))return false;this.pausedAt=this.now();this.flavour.cancelHold();this.skill.cancelPointer();return true;}
  resume(){if(this.pausedAt===null)return false;const delta=this.now()-this.pausedAt;this.started+=delta;this.phaseStarted+=delta;if(this.finisher?.active)this.finisher.at+=delta;if(Number.isFinite(this.lastHit))this.lastHit+=delta;for(const [id,t]of this.strikes)this.strikes.set(id,t+delta);this.pausedAt=null;return true;}
  light(index){if(this.phase!=='incense'||this.pausedAt!==null||!Number.isInteger(index)||index<0||index>2)return false;const fresh=!this.lit.has(index);this.lit.add(index);return fresh;}
  blow(){if(this.phase!=='incense'||this.pausedAt!==null||(this.lit.size!==3||this.blown))return false;this.blown=true;return true;}
  nameWorry(text,kind=this.kind){if(this.phase!=='worry'||this.pausedAt!==null)return false;this.worry=String(text).trim().slice(0,64)||this.worry;this.kind=WORRIES.some(w=>w.id===kind)?kind:this.kind;this.flavour.start(this.kind,{randomEvents:this.randomEvents});return true;}
  confirm(){if(this.phase!=='worry'||this.pausedAt!==null||this.prepared)return false;this.prepared=true;return true;}
  hit({heavy=false,strength=.5,pointer='keyboard',gesture=heavy?'heavy':'tap',direction=null}={}){
    this.advance();if(this.phase!=='beat'||this.pausedAt!==null||this.skill.busy(this.elapsed)||this.finisherBusy||!['tap','heavy','rub','circle','pinch'].includes(gesture))return null;
    heavy=gesture!=='tap';direction=gesture==='circle'&&['cw','ccw'].includes(direction)?direction:null;
    const now=this.now();if(now-(this.strikes.get(pointer)??-Infinity)<55)return null;
    this.strikes.set(pointer,now);if(this.strikes.size>32)this.strikes=new Map([[pointer,now]]);
    const distance=this.elapsed%BEAT_INTERVAL,perfect=Math.min(distance,BEAT_INTERVAL-distance)<=95;
    this.combo=now-this.lastHit<=COMBO_GRACE?this.combo+1:1;this.lastHit=now;this.bestCombo=Math.max(this.bestCombo,this.combo);if(this.finisherUses<ULTIMATE_LIMIT)this.finisherCharge=Math.min(100,this.finisherCharge+chargeForCombo(this.combo));
    const special=SPECIALS[gesture];
    const effort=Math.max(0,Math.min(1,Number(strength)||0));
    const power=special?special.min+Math.round(effort*(special.power-special.min)):(heavy?3+Math.round(effort*4):1);
    const before=this.papers;this.hits++;if(heavy)this.heavy++;if(special)this.specials[gesture]++;if(perfect)this.perfect++;
    const basePoints=Math.round((special?special.points+(power-special.min)*2:(heavy?18+power*2:10))*(perfect?1.5:1)+Math.min(this.combo,30)*.3);const multiplier=this.scoreMultiplier,flavour=this.flavour.hit(this.elapsed,gesture,perfect,basePoints,multiplier,{direction}),points=flavour.points;this.score+=points;this.damage+=power*(flavour.protectedHit?.35:1);this.moves[gesture]++;if(direction)this.rotations[direction]++;this.perfectStreak=perfect&&!flavour.protectedHit?this.perfectStreak+1:0;this.maxPerfectStreak=Math.max(this.maxPerfectStreak,this.perfectStreak);
    let qteComplete=false;
    if(this.qte&&this.elapsed<=this.qte.ends){if(this.qte.type==='double'||(this.qte.type==='heavy'&&heavy)||this.qte.type===gesture)this.qte.progress++;if(this.qte.progress>=this.qte.required){this.score+=Math.round(30*multiplier);this.qteSuccess++;this.qte=null;qteComplete=true;}}
    return {perfect,power,points,...flavour,paperCleared:this.papers>before,qteComplete,heavy,gesture,direction,combo:this.combo};
  }
  activateSkill(){return this.startFinisher();}
  skillAction(type){return {ok:this.finisherAction(type==='tap'?'tap':type)};}
  beginInteraction(){this.advance();return this.phase==='beat'&&this.pausedAt===null&&this.flavour.beginHold(this.elapsed);}
  interact(action,id){this.advance();if(this.phase!=='beat'||this.pausedAt!==null||this.skill.busy(this.elapsed)||this.finisherBusy)return 0;const raw=this.flavour.resolve(action,id,this.elapsed),points=Math.round(raw*this.scoreMultiplier);this.score+=points;return points;}
  dip(){this.advance();if(this.phase!=='tiger'||this.pausedAt!==null||this.porkMode!=='blood'||this.dipped)return false;this.dipped=true;return true;}
  smearTiger(distance){this.advance();if(this.phase!=='tiger'||this.pausedAt!==null||this.fed||(this.porkMode==='blood'&&!this.dipped)||!Number.isFinite(distance)||distance<=0)return false;this.tigerSmear=Math.min(1,this.tigerSmear+Math.min(60,distance)/100);return true;}
  feed(){this.advance();if(this.phase!=='tiger'||this.pausedAt!==null||this.fed)return false;if(this.porkMode==='blood')this.dipped=true;if(this.tigerSmear>=.5&&!this.tigerBonus){this.tigerBonus=Math.round(20*this.scoreMultiplier);this.score+=this.tigerBonus;}this.fed=true;this.tigerSmear=1;this.fedAt=this.elapsed;return true;}
  purify(step){this.advance();if(this.phase!=='blessing'||this.pausedAt!==null||step!==this.purification||step>2)return false;this.purification++;if(this.purification===3){this.blessed=true;this.blessedAt=this.elapsed;}return true;}
  completeBlessing(){this.advance();if(this.phase!=='blessing'||this.pausedAt!==null||this.blessed)return false;this.purification=3;this.blessed=true;this.blessedAt=this.elapsed;return true;}
  bless(){return this.completeBlessing();}
  throwBlocks(){this.advance();if(this.phase!=='divination'||this.pausedAt!==null||this.blocks)return false;const roll=this.random(),faces=roll<.25?[0,1]:roll<.5?[1,0]:roll<.75?[0,0]:[1,1];this.rolls++;this.blocks={faces,rolling:true,at:this.elapsed,sacred:false};return true;}
  finisherAvailability(){if(this.phase!=='beat')return 'phase';if(this.pausedAt!==null)return 'paused';if(this.finisherBusy)return 'active';if(this.finisherUses>=ULTIMATE_LIMIT)return 'spent';return this.finisherCharge>=100?'ready':'charge';}
  canFinisher(){return this.finisherAvailability()==='ready';}
  startFinisher(){this.advance();if(!this.canFinisher())return false;this.finisher={at:this.clock,beatAt:this.elapsed,active:true,nice:false,won:false};this.finisherUses++;this.finisherCharge=0;return true;}
  finisherAction(type='tap'){if(this.phase!=='beat'||this.pausedAt!==null||!this.finisher?.active||type!=='tap'||this.finisher.nice)return false;if(Math.abs(this.finisherTime-NICE_AT)>NICE_WINDOW)return false;this.finisher.nice=true;return true;}
  finishFinisher(){const f=this.finisher;if(!f?.active||this.phase!=='beat'||this.pausedAt!==null||this.finisherTime<ULTIMATE_DURATION)return false;this.phaseStarted+=ULTIMATE_DURATION;if(Number.isFinite(this.lastHit))this.lastHit+=ULTIMATE_DURATION;for(const [id,t]of this.strikes)this.strikes.set(id,t+ULTIMATE_DURATION);f.active=false;f.won=true;f.completedAt=this.elapsed;this.finisherWins++;if(f.nice)this.niceWins++;const points=Math.round(250*this.scoreMultiplier)+ (f.nice?Math.round(25*this.scoreMultiplier):0);this.score+=points;this.finisherBonus+=points;return true;}
  advance(){
    if(this.pausedAt!==null||!PHASES.includes(this.phase))return false;
    if(this.phase==='beat'){
      if(this.finisherBusy){if(this.finisherTime>=ULTIMATE_DURATION)this.finishFinisher();else return false;}
      if(this.qte&&this.elapsed>this.qte.ends)this.qte=null;
      while(QTE_STEPS[this.qteIndex]&&this.elapsed>=QTE_STEPS[this.qteIndex].at){const {at,type}=QTE_STEPS[this.qteIndex++],window=SPECIALS[type]?3600:1600;if(this.elapsed<at+window)this.qte={type,progress:0,required:type==='double'?2:1,ends:at+window};}
    }
    if(this.phase==='divination'&&this.blocks?.rolling&&this.elapsed-this.blocks.at>=1200){this.blocks.rolling=false;this.blocks.sacred=this.blocks.faces[0]!==this.blocks.faces[1];if(this.blocks.sacred)this.blocks.completedAt=this.blocks.at+1200;else this.blocks.retryAt=this.blocks.at+1400;}
    if(this.phase==='divination'&&this.blocks&&!this.blocks.rolling&&!this.blocks.sacred&&this.elapsed>=this.blocks.retryAt){const faces=[0,1];this.rolls++;this.blocks={faces,rolling:true,at:this.elapsed,sacred:false,assisted:true};}
    const done=(this.phase==='tiger'?this.fed&&this.elapsed>=1500&&this.elapsed-this.fedAt>=450:this.phase==='divination'?this.blocks?.sacred&&this.elapsed-this.blocks.completedAt>=650:this.phase==='blessing'?this.blessed&&this.elapsed-this.blessedAt>=900:this.elapsed>=DURATIONS[this.phase])||(this.phase==='incense'&&this.blown&&this.elapsed>=2000)||(this.phase==='worry'&&this.prepared&&this.elapsed>=2000)||(this.phase==='tiger'&&this.fed&&this.elapsed>=1500&&this.elapsed-this.fedAt>=450)||(this.phase==='blessing'&&this.blessed&&this.elapsed>=1500&&this.elapsed-this.blessedAt>=900);
    if(done){this.next();return true;}return false;
  }
  next(){
    const index=PHASES.indexOf(this.phase);if(index<0)return;
    if(index===PHASES.length-1){this.phase='results';this.result={auspicious:true,skin:this.skin,rolls:this.rolls,finisherWins:this.finisherWins,niceWins:this.niceWins,endingId:comedyEnding(this.weapon,this.kind).id,score:this.score,kitSkill:this.skill.snapshot(),kind:this.kind,commission:this.commission,moves:{...this.moves},rotations:{...this.rotations},maxPerfectStreak:this.maxPerfectStreak,wear:this.wear,...this.flavour.snapshot(),hits:this.hits,heavy:this.heavy,perfect:this.perfect,bestCombo:this.bestCombo,papers:this.papers,qte:this.qteSuccess,gestures:{...this.specials},fed:this.fed,blessed:this.blessed,weapon:this.weapon,seconds:(this.now()-this.started)/1000,fortune:FORTUNES[Math.min(FORTUNES.length-1,Math.floor(this.random()*FORTUNES.length))]};}
    else{this.phase=PHASES[index+1];this.phaseStarted=this.now();}
    this.transitions.push(this.phase);
  }
}
