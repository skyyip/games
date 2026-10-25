export const SUITS=['Diamonds','Clubs','Hearts','Spades'];
export const SYMBOLS=['♦','♣','♥','♠'];
export const RANK_LABELS={11:'J',12:'Q',13:'K',14:'A'};
export const rankLabel=rank=>RANK_LABELS[rank]??String(rank);
export const bigRank=rank=>rank===2?15:rank;
export function buildDeck(){return Array.from({length:52},(_,id)=>({id,suit:Math.floor(id/13),rank:id%13+2}));}
export function shuffleDeck(random=Math.random){const deck=buildDeck();for(let i=deck.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
export const compareKeys=(a,b)=>{for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]??0)-(b[i]??0);if(d)return Math.sign(d);}return 0;};
export const HAND_NAMES=['No five-card combination','High card','One pair','Two pairs','Three of a kind','Poker straight','Flush','Full house','Four of a kind','Straight flush'];
export function pokerHand(cards){
  if(!Array.isArray(cards)||cards.length!==5||cards.some(c=>!c||!Number.isInteger(c.rank)||c.rank<2||c.rank>14||!Number.isInteger(c.suit)||c.suit<0||c.suit>3)||new Set(cards.map(c=>`${c.rank}:${c.suit}`)).size!==5)throw new RangeError('Choose five unique cards.');
  const ranks=cards.map(c=>c.rank).sort((a,b)=>b-a),unique=[...new Set(ranks)],flush=cards.every(c=>c.suit===cards[0].suit);
  const straight=unique.length===5?(unique[0]-unique[4]===4?unique[0]:unique.join(',')==='14,5,4,3,2'?5:0):0;
  const groups=unique.map(rank=>({rank,count:ranks.filter(r=>r===rank).length})).sort((a,b)=>b.count-a.count||b.rank-a.rank);
  const counts=groups.map(g=>g.count),tier=straight&&flush?9:counts[0]===4?8:counts[0]===3&&counts[1]===2?7:flush?6:straight?5:counts[0]===3?4:counts[0]===2&&counts[1]===2?3:counts[0]===2?2:1;
  return {tier,name:HAND_NAMES[tier],key:[tier,...(straight?[straight]:flush?ranks:groups.map(g=>g.rank))],straight,flush,groups};
}
export function singleCard(card,{twoHigh=false}={}){return [twoHigh?bigRank(card.rank):card.rank,card.suit];}
export function bigTwoHand(cards){
  pokerHand(cards); // Validate the five-card deck constraints first.
  const values=cards.map(c=>bigRank(c.rank)).sort((a,b)=>b-a),unique=[...new Set(values)];
  const straight=unique.length===5&&unique[0]-unique[4]===4,flush=cards.every(c=>c.suit===cards[0].suit);
  const groups=unique.map(rank=>({rank,count:values.filter(v=>v===rank).length})).sort((a,b)=>b.count-a.count||b.rank-a.rank);
  const tier=straight&&flush?5:groups[0].count===4?4:groups[0].count===3&&groups[1].count===2?3:flush?2:straight?1:0;
  const singles=[...cards].sort((a,b)=>compareKeys(singleCard(b,{twoHigh:true}),singleCard(a,{twoHigh:true}))).flatMap(c=>singleCard(c,{twoHigh:true}));
  const key=[tier,...(straight?[unique[0],cards.find(c=>bigRank(c.rank)===unique[0]).suit]:tier===4?[groups[0].rank,...singles]:tier===3?groups.map(g=>g.rank):singles)];
  return {tier,name:['Unmade hand','Big Two straight','Flush','Full house','Four of a kind','Straight flush'][tier],key};
}
