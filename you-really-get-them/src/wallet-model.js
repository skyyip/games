import {CARDS,DRAW_COST,DUPLICATE_REFUND} from './gacha.js';
import {SKILLS} from './companions.js';
import {settleRun} from './settlement.js';
import {advanceProgress,evaluateContract} from './progression.js';
export const MAX_COINS=1000000000;
export const emptyWallet=()=>({coins:0,revision:0,lastOperation:'',bonds:{},contracts:[]});
export function normalizeCards(cards=[]){
 return [...new Set((Array.isArray(cards)?cards:[]).filter(id=>typeof id==='string').map(id=>CARDS.find(card=>card.id===id||card.name===id)?.id||id))].slice(0,200);
}
function validWallet(wallet){if(!Number.isSafeInteger(wallet.coins)||wallet.coins<0||wallet.coins>MAX_COINS||!Number.isSafeInteger(wallet.revision)||wallet.revision<0)throw Error('雲端錢包資料不完整，請稍後重試。')}
export function rewardWallet(wallet,receipt,cards){
 validWallet(wallet);
 const {result,completed,companionId='',contractId='none',timeouts=0,hintsUsed=0,skillUsed=false}=receipt;
 if((completed!==12&&result.hp!==0)||!Number.isInteger(result.hp)||result.hp<0||result.hp>100||!Number.isInteger(completed)||completed<1||completed>12||!Number.isInteger(result.correct)||result.correct<0||result.correct>completed||!['women','men','dog','cat'].includes(result.faction)||![timeouts,hintsUsed].every(Number.isInteger)||timeouts<0||timeouts>completed||hintsUsed<0||hintsUsed>2||typeof skillUsed!=='boolean')throw Error('結算資料未完成，請重新開始一局。');
 if(companionId&&(!SKILLS[companionId]||!normalizeCards(cards).includes(companionId)))throw Error('隊友收藏尚未同步，稍後會重試本局結算。');
 const companion=companionId?SKILLS[companionId]:null;
 if(skillUsed&&(!companion||companion.kind==='bonus'))throw Error('主動技能紀錄不符，未有改動SC。');
 const reward=settleRun(result.hp,result.faction,companion).coins;
 if(result.coins!==reward||wallet.coins+reward>MAX_COINS)throw Error('結算金額不符，未有改動雲端SC。');
 const contract=evaluateContract(contractId,{completed,timeouts,hintsUsed,skillUsed,hp:result.hp});
 const progress=advanceProgress(wallet,{completed,companionId,contract});
 const ranked=!(skillUsed&&['clue','time'].includes(companion?.kind));
 return {wallet:{...wallet,...progress,coins:wallet.coins+reward,revision:wallet.revision+1},operation:{kind:'run',delta:reward,revision:wallet.revision+1,hp:result.hp,completed,companionId,contractId:contract?.id||'none',contractEarned:!!contract?.earned,timeouts,hintsUsed,skillUsed,ranked},contract};
}
export function drawWallet(wallet,cards,cardId){
 validWallet(wallet);
 const card=CARDS.find(card=>card.id===cardId);if(!card)throw Error('抽卡資料無效，未有扣除SC。');
 if(wallet.coins<DRAW_COST)throw Object.assign(Error('雲端SC不足100，未有扣款。'),{code:'wallet/insufficient-funds'});
 const owned=normalizeCards(cards),duplicate=owned.includes(card.id),delta=-DRAW_COST+(duplicate?DUPLICATE_REFUND:0);
 return {wallet:{...wallet,coins:wallet.coins+delta,revision:wallet.revision+1},cards:duplicate?owned:[...owned,card.id],card,duplicate,operation:{kind:'draw',delta,revision:wallet.revision+1,cardId,cardName:card.name,duplicate}};
}
export function leaderboardUpdate(previous,result,user){
 const bestHp=Math.max(previous?.bestHp||0,result.hp);
 const bestCorrect=!previous||result.hp>previous.bestHp?result.correct:result.hp===previous.bestHp?Math.max(previous.bestCorrect||0,result.correct):previous.bestCorrect;
 return {uid:user.uid,faction:result.faction,displayName:(user.playerName||user.displayName||'玩家').slice(0,50),bestHp,bestCorrect,runs:(previous?.runs||0)+1};
}
