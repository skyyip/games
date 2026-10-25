import {shuffleDeck,pokerHand,bigTwoHand,singleCard,compareKeys} from './cards.js';
export const MODES=['stud','big-two','single'];
export class PokerGame {
  constructor({random=Math.random}={}){this.random=random;this.reset();}
  reset(){this.state='setup';this.mode='stud';this.players=[];this.hands=[];this.deck=[];this.used=new Set();this.turn=0;this.last=null;this.twoHigh=false;}
  start(names,{mode='stud',twoHigh=false}={}){
    if(!Array.isArray(names)||names.length<2||names.length>6||names.some(n=>typeof n!=='string'))throw new TypeError('Choose 2–6 players.');
    if(!MODES.includes(mode))throw new RangeError('Choose a valid mode.');
    this.players=names.map((n,i)=>n.trim().slice(0,24)||`Player ${i+1}`);this.mode=mode;this.twoHigh=Boolean(twoHigh);this.hands=names.map(()=>[]);this.deck=shuffleDeck(this.random);this.used=new Set();this.turn=0;this.last=null;this.state='choosing';
  }
  get handSize(){return this.mode==='single'?1:5;}
  pick(id){
    if(this.state!=='choosing'||!Number.isInteger(id)||this.used.has(id))return false;
    const card=this.deck.find(c=>c.id===id);if(!card)return false;
    this.used.add(id);this.hands[this.turn].push(card);this.last={player:this.turn,card};
    if(this.hands.every(h=>h.length===this.handSize)){this.state='results';return true;}
    this.turn=(this.turn+1)%this.players.length;return true;
  }
  get results(){
    if(this.state!=='results')return [];
    return this.hands.map((cards,index)=>({index,name:this.players[index],cards:[...cards],...(this.mode==='single'?{nameOfHand:'Single-card duel',key:singleCard(cards[0],{twoHigh:this.twoHigh})}:this.mode==='stud'?{nameOfHand:pokerHand(cards).name,key:pokerHand(cards).key}:{nameOfHand:bigTwoHand(cards).name,key:bigTwoHand(cards).key})})).sort((a,b)=>compareKeys(b.key,a.key)||a.index-b.index);
  }
  get winners(){const r=this.results;return r.filter(p=>compareKeys(p.key,r[0]?.key??[])===0);}
}
