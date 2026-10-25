import {shuffleTiles,matchingTiles} from './tiles.js';
export const MODES=['turns','sudden'];
export class MahjongGame {
  constructor({random=Math.random}={}){this.random=random;this.reset();}
  reset(){this.state='setup';this.players=[];this.turn=0;this.tiles=[];this.target=null;this.opened=[];this.winner=null;this.loser=null;this.mode='turns';}
  start(names,{mode='turns'}={}){
    if(!Array.isArray(names)||names.length!==2||names.some(n=>typeof n!=='string'))throw new TypeError('Choose two players.');
    if(!MODES.includes(mode))throw new RangeError('Choose a matching mode.');
    this.players=names.map((n,i)=>n.trim().slice(0,24)||`Player ${i+1}`);this.tiles=shuffleTiles(this.random);this.target=this.tiles[0];this.turn=0;this.opened=[];this.winner=null;this.loser=null;this.mode=mode;this.state='choosing';
  }
  get remaining(){return this.tiles.length?this.tiles.length-1-this.opened.length:143;}
  pick(id){
    if(this.state!=='choosing'||!Number.isInteger(id)||id===this.target.id||this.opened.some(p=>p.tile.id===id))return false;
    const tile=this.tiles.find(t=>t.id===id);if(!tile)return false;
    const match=matchingTiles(tile,this.target),fatal=this.mode==='sudden'?match:!match;this.opened.push({tile,player:this.turn,match,fatal});
    if(fatal){this.loser=this.turn;this.winner=1-this.turn;this.state='results';}
    else this.turn=1-this.turn;
    return true;
  }
}
