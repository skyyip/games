import test from 'node:test';import assert from 'node:assert/strict';
import {buildDeck,shuffleDeck,pokerHand,bigTwoHand,singleCard,compareKeys,describeHand} from '../src/cards.js';import {PokerGame} from '../src/game.js';
const c=(rank,suit=0)=>({rank,suit,id:suit*13+rank-2}),compare=(a,b)=>compareKeys(pokerHand(a).key,pokerHand(b).key);
test('a shuffled deck has all 52 unique cards, four suits and thirteen ranks',()=>{const deck=shuffleDeck(()=>.3);assert.equal(deck.length,52);assert.equal(new Set(deck.map(c=>c.id)).size,52);for(let suit=0;suit<4;suit++)assert.equal(deck.filter(c=>c.suit===suit).length,13);assert.deepEqual([...deck].sort((a,b)=>a.id-b.id),buildDeck());});
test('all nine stud categories follow ordinary five-card poker order',()=>{
  const hands=[[c(14),c(13,1),c(9,2),c(7,3),c(3)],[c(5),c(5,1),c(14),c(9),c(3)],[c(5),c(5,1),c(9),c(9,1),c(14)],[c(5),c(5,1),c(5,2),c(9),c(14)],[c(4),c(5,1),c(6,2),c(7,3),c(8)],[c(2),c(4),c(7),c(9),c(13)],[c(5),c(5,1),c(5,2),c(9),c(9,1)],[c(5),c(5,1),c(5,2),c(5,3),c(14)],[c(10,3),c(11,3),c(12,3),c(13,3),c(14,3)]];
  for(let i=0;i<hands.length;i++){assert.equal(pokerHand(hands[i]).tier,i+1);if(i)assert.equal(compare(hands[i],hands[i-1]),1);}
});
test('aces can be low only in A2345 and suits do not break stud ties',()=>{
  const wheel=[c(14),c(2,1),c(3,2),c(4,3),c(5)],six=[c(2),c(3,1),c(4,2),c(5,3),c(6)];assert.equal(pokerHand(wheel).key[1],5);assert.equal(compare(six,wheel),1);
  const a=[c(14),c(13,1),c(9,2),c(8,3),c(3)],b=[c(14,2),c(13,3),c(9),c(8,1),c(3,1)];assert.equal(compare(a,b),0);
});
test('stud comparisons use pairs, triples and all kickers before declaring a tie',()=>{
  const a=[c(9),c(9,1),c(14),c(13),c(5)],b=[c(9,2),c(9,3),c(14,1),c(12),c(11)];assert.equal(compare(a,b),1);
  assert.throws(()=>pokerHand([c(2),c(2),c(4),c(5),c(6)]),RangeError);
});
test('Big Two puts two above ace, uses the stated straight order, and separates legal five-card combinations',()=>{
  assert.equal(compareKeys(singleCard(c(2),{twoHigh:true}),singleCard(c(14,3),{twoHigh:true})),1);
  const low=[c(3),c(4,1),c(5,2),c(6,3),c(7)],high=[c(11),c(12,1),c(13,2),c(14,3),c(2)];assert.equal(bigTwoHand(low).tier,1);assert.equal(bigTwoHand(high).tier,1);assert.equal(compareKeys(bigTwoHand(high).key,bigTwoHand(low).key),1);
  assert.equal(bigTwoHand([c(14),c(2,1),c(3,2),c(4,3),c(5)]).tier,0);
  const full=[c(3),c(3,1),c(3,2),c(4),c(4,1)],four=[c(3),c(3,1),c(3,2),c(3,3),c(4)];assert.equal(bigTwoHand(full).tier,3);assert.equal(bigTwoHand(four).tier,4);assert.equal(bigTwoHand([c(3),c(4),c(5),c(6),c(7)]).tier,5);
});
test('single-card duels default to ace high with the correct suit order',()=>{assert.equal(compareKeys(singleCard(c(14)),singleCard(c(2,3))),1);assert.equal(compareKeys(singleCard(c(14,3)),singleCard(c(14,2))),1);});
test('players start choosing and consecutive picks alternate automatically; duplicate picks keep the same turn',()=>{
  const game=new PokerGame();assert.equal(game.pick(0),false);game.start(['A','B']);assert.equal(game.state,'choosing');assert.equal(game.pick(0),true);assert.equal(game.turn,1);assert.equal(game.pick(0),false);assert.equal(game.turn,1);assert.equal(game.pick(1),true);assert.equal(game.turn,0);assert.equal(game.state,'choosing');assert.deepEqual(game.hands.map(h=>h.length),[1,1]);assert.deepEqual(game.results,[]);
});
test('every mode supports uninterrupted alternating turns for two through six players',()=>{
  for(const mode of ['stud','big-two','single'])for(let count=2;count<=6;count++){const game=new PokerGame();game.start(Array.from({length:count},(_,i)=>`Player ${i+1}`),{mode});const picks=count*(mode==='single'?1:5);for(let id=0;id<picks;id++){assert.equal(game.state,'choosing');assert.equal(game.turn,id%count);assert.equal(game.pick(id),true);}assert.equal(game.state,'results');assert.equal(game.results.length,count);assert.ok(game.winners.length>=1);assert.ok(game.hands.every(h=>h.length===(mode==='single'?1:5)));assert.equal(game.pick(40),false);}
});
test('validation, literal names and reset are safe',()=>{const game=new PokerGame();assert.throws(()=>game.start(['A']),TypeError);assert.throws(()=>game.start(['A','B'],{mode:'other'}),RangeError);game.start(['<script>','B']);assert.equal(game.players[0],'<script>');assert.equal(game.pick(-1),false);game.reset();assert.equal(game.pick(0),false);assert.equal(game.used.size,0);});

test('result descriptions identify matching ranks and wheel high cards without changing hand rankings',()=>{assert.equal(describeHand([c(12),c(12,1),c(14),c(9),c(3)]),'One pair: Q');assert.equal(describeHand([c(12),c(12,1),c(12,2),c(9),c(9,1)]),'Full house: Q over 9');assert.equal(describeHand([c(14),c(2,1),c(3,2),c(4,3),c(5)]),'Straight: 5 high');assert.equal(describeHand([c(12,3)],{mode:'single'}),'Single card: Q ♠');});
