import {SKINS,skinScoreMultiplier} from './skins.js';
import {ULTIMATE_DURATION,ULTIMATE_LIMIT,ULTIMATE_CHARGE,ULTIMATE_MULTIPLIER,comedyEnding} from './comedy-content.js';
import {BEAT_INTERVAL,RHYTHM_PERFECT} from './rhythm.js';
export {BEAT_INTERVAL} from './rhythm.js';
import {RitualFlavour} from './ritual-flavour.js';
import {WORRIES,WEAPONS,FORTUNES,weaponScoreMultiplier} from './catalog.js';
export const PHASES=['incense','worry','beat','tiger','blessing','divination'];
export const DURATIONS={incense:8000,worry:7000,beat:58000,tiger:0,blessing:0,divination:0};
export const FINISHER_DURATION=ULTIMATE_DURATION,FINISHER_BUFFER=0;
export const FINISHER_STEPS=['tap'];
export const GESTURE_POINTS=Object.freeze({tap:30,heavy:40,rub:60,circle:80,pinch:100});
export const COMBO_GRACE=1500;
const SPECIALS={rub:{min:3,power:6},circle:{min:5,power:8},pinch:{min:6,power:9}};
export class RitualGame{
  constructor({now=()=>performance.now(),random=Math.random}={}){this.now=now;this.random=random;this.reset();}
  reset(){this.phase='setup';this.phaseStarted=0;this.started=0;this.pausedAt=null;this.lit=new Set();this.blown=false;this.prepared=false;this.worry='';this.kind='work';this.randomEvents=false;this.weapon='bare-hand';this.look=0;this.skin='plain';this.hits=0;this.heavy=0;this.specials={rub:0,circle:0,pinch:0,hold:0,spread:0,cross:0,vee:0};this.rotations={cw:0,ccw:0};this.perfect=0;this.damage=0;this.combo=0;this.bestCombo=0;this.score=0;this.lastHit=-Infinity;this.strikes=new Map();this.finisherUnlocked=false;this.qteSuccess=0;this.porkMode='plain';this.dipped=false;this.tigerSmear=0;this.tigerBonus=0;this.purification=0;this.grains='rice';this.blocks=null;this.rolls=0;this.finisherBank=0;this.finisher=null;this.finisherWins=0;this.fed=false;this.fedAt=null;this.blessed=false;this.blessedAt=null;this.result=null;this.transitions=[];this.flavour=new RitualFlavour(this.random);this.moves={tap:0,heavy:0,rub:0,circle:0,pinch:0,hold:0,spread:0,cross:0,vee:0};this.perfectStreak=0;this.maxPerfectStreak=0;this.commission='';this.finisherCharge=0;this.finisherChain=0;this.finisherUses=0;this.finisherBonus=0;this.niceWins=0;this.assistCameo=null;this.skill={busy:()=>this.finisherBusy,cancelPointer(){},snapshot:()=>({weapon:this.weapon,attempts:this.finisherUses,wins:this.finisherWins,bonus:this.finisherBonus,unified:true})};}
  start({worry='The eighth revision',kind='work',weapon='bare-hand',commission='',skin='plain',randomEvents=false}={}){
    if(!WEAPONS.some(w=>w.id===weapon))throw new RangeError('Choose an available keepsake.');
    this.reset();this.randomEvents=randomEvents===true;this.skin=SKINS.some(s=>s.id===skin)?skin:'plain';this.worry=String(worry).trim().slice(0,64)||'The eighth revision';this.kind=WORRIES.some(w=>w.id===kind)?kind:'work';this.weapon=weapon;this.look=Math.min(2,Math.floor(this.random()*3));this.porkMode=this.random()<.5?'blood':'plain';this.grains=this.random()<.5?'rice':'beans';this.started=this.phaseStarted=this.now();this.phase='incense';this.commission=commission;this.flavour.start(this.kind,{randomEvents:this.randomEvents});
  }
  get finisherBusy(){return Boolean(this.finisher?.active);}
  get finisherTime(){return this.finisher?.active?Math.max(0,this.clock-this.finisher.at):0;}
  get scoreMultiplier(){return weaponScoreMultiplier(this.weapon)*skinScoreMultiplier(this.skin);}
  get clock(){return this.pausedAt??this.now();}
  get elapsed(){return Math.max(0,this.clock-this.phaseStarted);}
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
    this.advance();if(this.phase!=='beat'||this.pausedAt!==null||!['tap','heavy','rub','circle','pinch'].includes(gesture))return null;
    heavy=gesture!=='tap';direction=gesture==='circle'&&['cw','ccw'].includes(direction)?direction:null;
    const now=this.now();if(now-(this.strikes.get(pointer)??-Infinity)<55)return null;
    this.strikes.set(pointer,now);if(this.strikes.size>32)this.strikes=new Map([[pointer,now]]);
    // Rhythm is optional flavour, never an input gate or a base-score multiplier.
    const pulse=this.elapsed%BEAT_INTERVAL,perfect=Math.min(pulse,BEAT_INTERVAL-pulse)<=RHYTHM_PERFECT+1e-6;
    this.combo++;this.lastHit=now;this.bestCombo=Math.max(this.bestCombo,this.combo);this.qteSuccess++;
    if(!this.finisherBusy){this.finisherChain++;this.finisherCharge=Math.min(ULTIMATE_CHARGE,this.finisherChain);if(this.finisherChain>=ULTIMATE_CHARGE)this.finisherUnlocked=true;if(this.finisherUnlocked)this.finisherCharge=ULTIMATE_CHARGE;}
    const special=SPECIALS[gesture];
    const effort=Math.max(0,Math.min(1,Number(strength)||0));
    const power=special?special.min+Math.round(effort*(special.power-special.min)):(heavy?3+Math.round(effort*4):1);
    const before=this.papers;this.hits++;if(heavy)this.heavy++;if(special)this.specials[gesture]++;if(perfect)this.perfect++;
    const roll=this.random(),impactLevel=roll<.04?3:roll<.14?2:1,impactMultiplier=impactLevel===3?2:impactLevel===2?1.5:1;
    const basePoints=(GESTURE_POINTS[gesture]+Math.floor(Math.min(this.combo,30)*.3))*impactMultiplier;const multiplier=this.scoreMultiplier,flavour=this.flavour.hit(this.elapsed,gesture,perfect,basePoints,multiplier,{direction}),burstMultiplier=this.finisherBusy?ULTIMATE_MULTIPLIER:1,points=flavour.points*burstMultiplier;if(this.finisherBusy){this.finisher.hits++;this.finisherBonus+=points-flavour.points;}this.score+=points;this.damage+=power*impactMultiplier*(flavour.protectedHit?.35:1);this.moves[gesture]++;if(direction)this.rotations[direction]++;this.perfectStreak=perfect&&!flavour.protectedHit?this.perfectStreak+1:0;this.maxPerfectStreak=Math.max(this.maxPerfectStreak,this.perfectStreak);
    const qteComplete=false;
    return {perfect,power,impactLevel,impactMultiplier,...flavour,points,burstMultiplier,paperCleared:this.papers>before,qteComplete,heavy,gesture,direction,combo:this.combo};
  }
  activateSkill(){return this.startFinisher();}
  skillAction(type){return {ok:this.finisherAction(type==='tap'?'tap':type)};}
  beginInteraction(){this.advance();return this.phase==='beat'&&this.pausedAt===null&&this.flavour.beginHold(this.elapsed);}
  breakCombo(){this.combo=0;this.perfectStreak=0;if(!this.finisherUnlocked){this.finisherCharge=0;this.finisherChain=0;}}
  interact(action,id){
    this.advance();if(this.phase!=='beat'||this.pausedAt!==null)return 0;
    if(action==='copy'){
      this.flavour.view(this.elapsed);if(!this.flavour.copies.some(c=>c.id===id))return 0;
      const hit=this.hit({gesture:'tap',pointer:'copy-'+id});if(!hit)return 0;
      const extra=Math.round(this.flavour.resolve(action,id,this.elapsed)*this.scoreMultiplier);this.score+=extra;return hit.points+extra;
    }
    // Optional event controls have their own explicit instructions; they never build the combo.
    const raw=this.flavour.resolve(action,id,this.elapsed),points=Math.round(raw*this.scoreMultiplier);this.score+=points;return points;
  }
  dip(){this.advance();if(this.phase!=='tiger'||this.pausedAt!==null||this.porkMode!=='blood'||this.dipped)return false;this.dipped=true;return true;}
  smearTiger(distance){this.advance();if(this.phase!=='tiger'||this.pausedAt!==null||this.fed||(this.porkMode==='blood'&&!this.dipped)||!Number.isFinite(distance)||distance<=0)return false;this.tigerSmear=Math.min(1,this.tigerSmear+Math.min(60,distance)/100);return true;}
  feed(){this.advance();if(this.phase!=='tiger'||this.pausedAt!==null||this.fed)return false;if(this.porkMode==='blood')this.dipped=true;if(this.tigerSmear>=.5&&!this.tigerBonus){this.tigerBonus=Math.round(20*this.scoreMultiplier);this.score+=this.tigerBonus;}this.fed=true;this.tigerSmear=1;this.fedAt=this.elapsed;return true;}
  purify(step){this.advance();if(this.phase!=='blessing'||this.pausedAt!==null||step!==this.purification||step>2)return false;this.purification++;if(this.purification===3){this.blessed=true;this.blessedAt=this.elapsed;}return true;}
  completeBlessing(){this.advance();if(this.phase!=='blessing'||this.pausedAt!==null||this.blessed)return false;this.purification=3;this.blessed=true;this.blessedAt=this.elapsed;return true;}
  bless(){return this.completeBlessing();}
  throwBlocks(){this.advance();if(this.phase!=='divination'||this.pausedAt!==null||this.blocks)return false;const roll=this.random(),faces=roll<.25?[0,1]:roll<.5?[1,0]:roll<.75?[0,0]:[1,1];this.rolls++;this.blocks={faces,rolling:true,at:this.elapsed,sacred:false};return true;}
  finisherAvailability(){if(this.phase!=='beat')return 'phase';if(this.pausedAt!==null)return 'paused';if(this.finisherBusy)return 'active';return this.finisherUnlocked?'ready':'charge';}
  canFinisher(){return this.finisherAvailability()==='ready';}
  startFinisher(){this.advance();if(!this.canFinisher())return false;this.finisher={at:this.clock,active:true,hits:0,won:false};this.finisherUses++;this.finisherCharge=0;this.finisherChain=0;this.finisherUnlocked=false;return true;}
  finisherAction(){return false;}
  finishFinisher(){const f=this.finisher;if(!f?.active||this.phase!=='beat'||this.pausedAt!==null||(this.finisherTime<ULTIMATE_DURATION&&this.remaining>0))return false;f.active=false;f.won=true;f.completedAt=this.elapsed;this.finisherWins++;return true;}
  advance(){
    if(this.pausedAt!==null||!PHASES.includes(this.phase))return false;
    if(this.phase==='beat'){
      if(this.finisherBusy&&(this.finisherTime>=ULTIMATE_DURATION||this.remaining===0))this.finishFinisher();
      if(this.combo&&this.clock-this.lastHit>COMBO_GRACE)this.breakCombo();
    }
    if(this.phase==='divination'&&this.blocks?.rolling&&this.elapsed-this.blocks.at>=1200){this.blocks.rolling=false;this.blocks.sacred=this.blocks.faces[0]!==this.blocks.faces[1];if(this.blocks.sacred)this.blocks.completedAt=this.blocks.at+1200;else this.blocks.retryAt=this.blocks.at+1400;}
    if(this.phase==='divination'&&this.blocks&&!this.blocks.rolling&&!this.blocks.sacred&&this.elapsed>=this.blocks.retryAt){const faces=[0,1];this.rolls++;this.blocks={faces,rolling:true,at:this.elapsed,sacred:false,assisted:true};}
    const done=(this.phase==='tiger'?this.fed&&this.elapsed>=1500&&this.elapsed-this.fedAt>=450:this.phase==='divination'?this.blocks?.sacred&&this.elapsed-this.blocks.completedAt>=650:this.phase==='blessing'?this.blessed&&this.elapsed-this.blessedAt>=900:this.elapsed>=DURATIONS[this.phase])||(this.phase==='incense'&&this.blown&&this.elapsed>=2000)||(this.phase==='worry'&&this.prepared&&this.elapsed>=2000)||(this.phase==='tiger'&&this.fed&&this.elapsed>=1500&&this.elapsed-this.fedAt>=450)||(this.phase==='blessing'&&this.blessed&&this.elapsed>=1500&&this.elapsed-this.blessedAt>=900);
    if(done){this.next();return true;}return false;
  }
  next(){
    const index=PHASES.indexOf(this.phase);if(index<0)return;
    if(this.phase==='beat'&&this.finisher)this.finisher.active=false;
    if(index===PHASES.length-1){this.phase='results';this.result={auspicious:true,skin:this.skin,rolls:this.rolls,finisherWins:this.finisherWins,niceWins:this.niceWins,endingId:comedyEnding(this.weapon,this.kind).id,score:this.score,kitSkill:this.skill.snapshot(),kind:this.kind,commission:this.commission,moves:{...this.moves},rotations:{...this.rotations},maxPerfectStreak:this.maxPerfectStreak,wear:this.wear,...this.flavour.snapshot(),hits:this.hits,heavy:this.heavy,perfect:this.perfect,bestCombo:this.bestCombo,papers:this.papers,qte:this.qteSuccess,gestures:{...this.specials},fed:this.fed,blessed:this.blessed,weapon:this.weapon,seconds:(this.now()-this.started)/1000,fortune:FORTUNES[Math.min(FORTUNES.length-1,Math.floor(this.random()*FORTUNES.length))]};}
    else{this.phase=PHASES[index+1];this.phaseStarted=this.now();}
    this.transitions.push(this.phase);
  }
}
