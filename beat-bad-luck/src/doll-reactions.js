import {getLanguage} from '../../grid-rush/src/language.js';
import {reactionQuote} from './doll-quips.js';
export {reactionQuote} from './doll-quips.js';
export function createDollReactions({game}){
 const bubble=document.createElement('p');bubble.id='doll-reaction';bubble.hidden=true;bubble.setAttribute('aria-hidden','true');bubble.setAttribute('translate','no');document.querySelector('#beat-arena').append(bubble);let phase='',bucket=-1,until=0;
 return {sync(){if(game.phase!==phase){phase=game.phase;bucket=-1;bubble.hidden=true;delete document.querySelector('#paper-doll').dataset.reaction;}if(phase!=='beat'){bubble.hidden=true;return;}const next=Math.min(7,Math.floor(game.hits/12));if(game.hits>0&&next!==bucket&&!game.finisherBusy){bucket=next;until=game.elapsed+2400;bubble.textContent=(['😤','😵','😅','🥹'][Math.min(3,Math.floor(game.hits/24))])+' '+reactionQuote(game.kind,game.hits,getLanguage()==='zh-Hant');bubble.hidden=false;document.querySelector('#paper-doll').dataset.reaction=String(Math.min(3,Math.floor(game.hits/24)));}if(game.elapsed>until||game.finisherBusy)bubble.hidden=true;}};
}
