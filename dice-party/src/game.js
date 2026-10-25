export const MODES=['high','low','poker'];
export const HAND_NAMES=['','High dice','One pair','Two pairs','Three of a kind','Straight (five dice)','Full house','Four of a kind','Five of a kind'];
export function randomDie(){
  // Rejection sampling gives each face equal probability with Web Crypto.
  if(globalThis.crypto?.getRandomValues){const value=new Uint32Array(1),limit=4294967292;do{crypto.getRandomValues(value);}while(value[0]>=limit);return value[0]%6+1;}
  return Math.floor(Math.random()*6)+1;
}
export function evaluateHand(dice){
  if(!Array.isArray(dice)||dice.length!==5||dice.some(d=>!Number.isInteger(d)||d<1||d>6))throw new RangeError('Poker requires five valid dice.');
  const groups=[...new Set(dice)].map(face=>({face,count:dice.filter(d=>d===face).length})).sort((a,b)=>b.count-a.count||b.face-a.face);
  const count=groups.map(g=>g.count),unique=[...new Set(dice)].sort((a,b)=>a-b),straight=unique.length===5&&unique[4]-unique[0]===4;
  let tier=count[0]===5?8:count[0]===4?7:count[0]===3&&count[1]===2?6:straight?5:count[0]===3?4:count[0]===2&&count[1]===2?3:count[0]===2?2:1;
  const key=[tier,...(straight?[unique[4]]:groups.map(g=>g.face))];
  return {tier,name:HAND_NAMES[tier],key};
}
export function compareKeys(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const diff=(a[i]??0)-(b[i]??0);if(diff)return Math.sign(diff);}return 0;}
export function resultKey(dice,mode){const total=dice.reduce((a,b)=>a+b,0);return mode==='poker'?evaluateHand(dice).key:[mode==='low'?-total:total];}
export class DiceGame {
  constructor({roll=randomDie,now=()=>performance.now()}={}){this.roll=roll;this.now=now;this.reset();}
  reset(){this.state='setup';this.players=[];this.turn=0;this.mode='high';this.count=1;this.answers=[];this.pending=null;this.until=null;}
  start(names,{count=1,mode='high'}={}){
    if(!Array.isArray(names)||names.length<2||names.length>6||names.some(n=>typeof n!=='string'))throw new TypeError('Choose 2–6 players.');
    if(!MODES.includes(mode)||!Number.isInteger(count)||count<1||count>5||(mode==='poker'&&count!==5))throw new RangeError('Choose valid dice and rules.');
    this.players=names.map((n,i)=>n.trim().slice(0,24)||`Player ${i+1}`);this.mode=mode;this.count=count;this.turn=0;this.answers=[];this.pending=null;this.state='handoff';
  }
  ready(){if(this.state!=='handoff')return false;this.state='ready';return true;}
  shake(){
    if(this.state!=='ready')return false;
    const dice=Array.from({length:this.count},()=>this.roll());if(dice.some(d=>!Number.isInteger(d)||d<1||d>6))throw new RangeError('Invalid die roll.');
    this.pending=dice;this.until=this.now()+1200+(this.count-1)*80;this.state='rolling';return true;
  }
  advance(){
    if(this.state!=='rolling'||this.now()<this.until)return false;
    const dice=this.pending;this.answers.push({index:this.turn,name:this.players[this.turn],dice:[...dice],total:dice.reduce((a,b)=>a+b,0),key:resultKey(dice,this.mode),hand:this.mode==='poker'?evaluateHand(dice).name:null,detail:this.mode==='poker'?describeDice(dice):null});
    this.pending=null;this.state='locked';return true;
  }
  next(){if(this.state!=='locked')return false;this.turn++;this.state=this.turn===this.players.length?'results':'handoff';return true;}
  get results(){return this.state==='results'?[...this.answers].sort((a,b)=>compareKeys(b.key,a.key)||a.index-b.index):[];}
  get winners(){const r=this.results;return r.filter(a=>compareKeys(a.key,r[0]?.key??[])===0);}
}

export function describeDice(dice){
 const hand=evaluateHand(dice),groups=[...new Set(dice)].map(face=>({face,count:dice.filter(n=>n===face).length})).sort((a,b)=>b.count-a.count||b.face-a.face),a=groups[0].face,b=groups[1]?.face;
 switch(hand.tier){case 2:return `One pair: ${a}`;case 3:return `Two pairs: ${a} and ${b}`;case 4:return `Three dice: ${a}`;case 5:return `Five-dice straight: ${Math.min(...dice)}–${Math.max(...dice)}`;case 6:return `Full house: ${a} over ${b}`;case 7:return `Four dice: ${a}`;case 8:return `Five dice: ${a}`;default:return `High die: ${a}`;}
}
