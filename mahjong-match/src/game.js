import {shuffleTiles,matchingTiles} from './tiles.js';
export const MODES=['turns','sudden'];
export class MahjongGame {
  constructor({random=Math.random}={}){this.random=random;this.reset();}
  reset(){this.state='setup';this.players=[];this.turn=0;this.startingPlayer=0;this.round=1;this.tiles=[];this.target=null;this.opened=[];this.winner=null;this.loser=null;this.outcome=null;this.mode='turns';}
  start(names,{mode='turns'}={}){
    if(!Array.isArray(names)||names.length!==2||names.some(n=>typeof n!=='string'))throw new TypeError('Choose two players.');
    if(!MODES.includes(mode))throw new RangeError('Choose a matching mode.');
    this.reset();this.players=names.map((n,i)=>n.trim().slice(0,24)||`Player ${i+1}`);this.tiles=shuffleTiles(this.random);this.target=this.tiles[0];this.mode=mode;this.turn=mode==='sudden'&&this.random()>=.5?1:0;this.startingPlayer=this.turn;this.state='choosing';
  }
  get remaining(){return this.tiles.length?this.tiles.length-1-this.opened.length:143;}
  pick(id){
    if(this.state!=='choosing'||!Number.isInteger(id)||id===this.target.id||this.opened.some(p=>p.tile.id===id))return false;
    const tile=this.tiles.find(t=>t.id===id);if(!tile)return false;
    const match=matchingTiles(tile,this.target),entry={tile,player:this.turn,round:this.round,match,fatal:false};this.opened.push(entry);
    if(this.mode==='sudden'){
      if(match){entry.fatal=true;this.finish(1-this.turn);}else this.turn=1-this.turn;
    }else if(this.turn===0){
      // Both players always get one reveal before this pair is compared.
      this.turn=1;
    }else{
      const first=this.opened.at(-2);
      if(first.match!==match){
        const winner=first.match?0:1;
        (winner===0?entry:first).fatal=true;this.finish(winner);
      }else if(this.remaining<2){
        // An incomplete pair cannot give either player a fair winning chance.
        this.state='results';this.outcome='draw';
      }else{this.round++;this.turn=0;}
    }
    return true;
  }
  finish(winner){this.winner=winner;this.loser=1-winner;this.outcome='win';this.state='results';}
}
