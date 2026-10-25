import {createShape,scoreDrawing,validDrawing} from './shapes.js';
export const VIEW_TIME=3000;
export class MemoryGame {
  constructor({random=Math.random,now=()=>performance.now()}={}){this.random=random;this.now=now;this.reset();}
  reset(){this.state='setup';this.players=[];this.turn=0;this.answers=[];this.shape=null;this.viewUntil=null;}
  start(names){
    if(!Array.isArray(names)||names.length<2||names.length>6||names.some(n=>typeof n!=='string'))throw new TypeError('Choose 2–6 players.');
    this.players=names.map((n,i)=>n.trim().slice(0,24)||`Player ${i+1}`);this.shape=createShape(this.random);this.turn=0;this.answers=[];this.viewUntil=null;this.state='handoff';
  }
  view(){if(this.state!=='handoff')return false;this.viewUntil=this.now()+VIEW_TIME;this.state='viewing';return true;}
  get remaining(){return this.state==='viewing'?Math.max(0,this.viewUntil-this.now()):0;}
  advance(){if(this.state!=='viewing'||this.now()<this.viewUntil)return false;return this.hide();}
  hide(){if(this.state!=='viewing')return false;this.state='drawing';this.viewUntil=null;return true;}
  submit(strokes){
    if(this.state!=='drawing'||!validDrawing(strokes)||!strokes.some(s=>s.length>1))return false;
    this.answers.push({index:this.turn,name:this.players[this.turn],drawing:structuredClone(strokes),...scoreDrawing(this.shape.points,strokes)});this.state='locked';return true;
  }
  next(){if(this.state!=='locked')return false;this.turn++;this.state=this.turn===this.players.length?'results':'handoff';return true;}
  get results(){return this.state==='results'?[...this.answers].sort((a,b)=>b.percent-a.percent||a.index-b.index):[];}
  get winners(){const r=this.results;return r.filter(a=>a.percent===r[0]?.percent);}
}
