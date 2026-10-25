import {WORRIES,WEAPONS,FORTUNES,weaponScoreMultiplier} from './catalog.js';
export const PHASES=['incense','worry','beat','tiger','blessing'];
export const DURATIONS={incense:8000,worry:7000,beat:45000,tiger:7000,blessing:5000};
export const BEAT_INTERVAL=60000/108;
export const QTE_STEPS=[{at:4500,type:'double'},{at:11000,type:'heavy'},{at:17500,type:'rub'},{at:23500,type:'circle'},{at:29000,type:'pinch'},{at:35500,type:'rub'},{at:41000,type:'circle'}];
const SPECIALS={rub:{min:3,power:6,points:28},circle:{min:5,power:8,points:40},pinch:{min:6,power:9,points:46}};
export class RitualGame{
  constructor({now=()=>performance.now(),random=Math.random}={}){this.now=now;this.random=random;this.reset();}
  reset(){this.phase='setup';this.phaseStarted=0;this.started=0;this.pausedAt=null;this.lit=new Set();this.blown=false;this.prepared=false;this.worry='';this.kind='work';this.weapon='flipflop';this.look=0;this.hits=0;this.heavy=0;this.specials={rub:0,circle:0,pinch:0};this.perfect=0;this.damage=0;this.combo=0;this.bestCombo=0;this.score=0;this.lastHit=-Infinity;this.strikes=new Map();this.qte=null;this.qteIndex=0;this.qteSuccess=0;this.fed=false;this.fedAt=null;this.blessed=false;this.blessedAt=null;this.result=null;this.transitions=[];}
  start({worry='The eighth revision',kind='work',weapon='flipflop'}={}){
    if(!WEAPONS.some(w=>w.id===weapon))throw new RangeError('Choose an available keepsake.');
    this.reset();this.worry=String(worry).trim().slice(0,64)||'The eighth revision';this.kind=WORRIES.some(w=>w.id===kind)?kind:'work';this.weapon=weapon;this.look=Math.min(2,Math.floor(this.random()*3));this.started=this.phaseStarted=this.now();this.phase='incense';
  }
  get clock(){return this.pausedAt??this.now();}
  get elapsed(){return Math.max(0,this.clock-this.phaseStarted);}
  get remaining(){return Math.max(0,(DURATIONS[this.phase]??0)-this.elapsed);}
  get papers(){return Math.floor(this.damage/50);}
  get wear(){const elapsed=this.phase==='beat'?this.elapsed:['setup','incense','worry'].includes(this.phase)?0:DURATIONS.beat;return Math.min(1,Math.max(0,elapsed/DURATIONS.beat)*.45+Math.min(1,this.score/1800)*.55);}
  pause(){if(this.pausedAt!==null||!PHASES.includes(this.phase))return false;this.pausedAt=this.now();return true;}
  resume(){if(this.pausedAt===null)return false;const delta=this.now()-this.pausedAt;this.started+=delta;this.phaseStarted+=delta;if(Number.isFinite(this.lastHit))this.lastHit+=delta;for(const [id,t]of this.strikes)this.strikes.set(id,t+delta);this.pausedAt=null;return true;}
  light(index){if(this.phase!=='incense'||this.pausedAt!==null||!Number.isInteger(index)||index<0||index>2)return false;const fresh=!this.lit.has(index);this.lit.add(index);return fresh;}
  blow(){if(this.phase!=='incense'||this.pausedAt!==null||(this.lit.size!==3||this.blown))return false;this.blown=true;return true;}
  nameWorry(text,kind=this.kind){if(this.phase!=='worry'||this.pausedAt!==null)return false;this.worry=String(text).trim().slice(0,64)||this.worry;this.kind=WORRIES.some(w=>w.id===kind)?kind:this.kind;return true;}
  confirm(){if(this.phase!=='worry'||this.pausedAt!==null||this.prepared)return false;this.prepared=true;return true;}
  hit({heavy=false,strength=.5,pointer='keyboard',gesture=heavy?'heavy':'tap'}={}){
    this.advance();if(this.phase!=='beat'||this.pausedAt!==null||!['tap','heavy','rub','circle','pinch'].includes(gesture))return null;
    heavy=gesture!=='tap';
    const now=this.now();if(now-(this.strikes.get(pointer)??-Infinity)<55)return null;
    this.strikes.set(pointer,now);if(this.strikes.size>32)this.strikes=new Map([[pointer,now]]);
    const distance=this.elapsed%BEAT_INTERVAL,perfect=Math.min(distance,BEAT_INTERVAL-distance)<=95;
    this.combo=now-this.lastHit<=800?this.combo+1:1;this.lastHit=now;this.bestCombo=Math.max(this.bestCombo,this.combo);
    const special=SPECIALS[gesture];
    const effort=Math.max(0,Math.min(1,Number(strength)||0));
    const power=special?special.min+Math.round(effort*(special.power-special.min)):(heavy?3+Math.round(effort*4):1);
    const before=this.papers;this.damage+=power;this.hits++;if(heavy)this.heavy++;if(special)this.specials[gesture]++;if(perfect)this.perfect++;
    const basePoints=Math.round((special?special.points+(power-special.min)*2:(heavy?18+power*2:10))*(perfect?1.5:1)+Math.min(this.combo,30)*.3);const multiplier=weaponScoreMultiplier(this.weapon),points=Math.round(basePoints*multiplier);this.score+=points;
    let qteComplete=false;
    if(this.qte&&this.elapsed<=this.qte.ends){if(this.qte.type==='double'||(this.qte.type==='heavy'&&heavy)||this.qte.type===gesture)this.qte.progress++;if(this.qte.progress>=this.qte.required){this.score+=Math.round(30*multiplier);this.qteSuccess++;this.qte=null;qteComplete=true;}}
    return {perfect,power,points,paperCleared:this.papers>before,qteComplete,heavy,gesture,combo:this.combo};
  }
  feed(){this.advance();if(this.phase!=='tiger'||this.pausedAt!==null||this.fed)return false;this.fed=true;this.fedAt=this.elapsed;return true;}
  bless(){this.advance();if(this.phase!=='blessing'||this.pausedAt!==null||this.blessed)return false;this.blessed=true;this.blessedAt=this.elapsed;return true;}
  advance(){
    if(this.pausedAt!==null||!PHASES.includes(this.phase))return false;
    if(this.phase==='beat'){
      if(this.qte&&this.elapsed>this.qte.ends)this.qte=null;
      while(QTE_STEPS[this.qteIndex]&&this.elapsed>=QTE_STEPS[this.qteIndex].at){const {at,type}=QTE_STEPS[this.qteIndex++],window=SPECIALS[type]?3600:1600;if(this.elapsed<at+window)this.qte={type,progress:0,required:type==='double'?2:1,ends:at+window};}
    }
    const done=this.elapsed>=DURATIONS[this.phase]||(this.phase==='incense'&&this.blown&&this.elapsed>=2000)||(this.phase==='worry'&&this.prepared&&this.elapsed>=2000)||(this.phase==='tiger'&&this.fed&&this.elapsed>=1500&&this.elapsed-this.fedAt>=450)||(this.phase==='blessing'&&this.blessed&&this.elapsed>=1500&&this.elapsed-this.blessedAt>=900);
    if(done){this.next();return true;}return false;
  }
  next(){
    const index=PHASES.indexOf(this.phase);if(index<0)return;
    if(index===PHASES.length-1){this.phase='results';this.result={score:this.score,hits:this.hits,heavy:this.heavy,perfect:this.perfect,bestCombo:this.bestCombo,papers:this.papers,qte:this.qteSuccess,gestures:{...this.specials},fed:this.fed,blessed:this.blessed,weapon:this.weapon,seconds:(this.now()-this.started)/1000,fortune:FORTUNES[Math.min(FORTUNES.length-1,Math.floor(this.random()*FORTUNES.length))]};}
    else{this.phase=PHASES[index+1];this.phaseStarted=this.now();}
    this.transitions.push(this.phase);
  }
}
