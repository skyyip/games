import test from 'node:test';import assert from 'node:assert/strict';
import {emptyWallet,walletAction,legendTickets,drawnLegend,legendComplete,LEGEND_CARDS,LEGEND_THEME,STANDARD_CARDS,CULTURE_CARDS,NORMAL_CARDS,FOIL_CARDS,unlockedPrefixes,drawnCard} from '../src/economy.js';
test('hidden tickets count original unique cards and completed daily games, including old progress',()=>{
 const wallet=emptyWallet('u',1001);assert.deepEqual(legendTickets({games:4},wallet),{collected:0,games:4,earned:0,available:0});
 wallet.cards=Object.fromEntries(STANDARD_CARDS.slice(0,29).map(c=>[c.id,99]));Object.assign(wallet.cards,{unknown:99,[LEGEND_CARDS[0].id]:99,[STANDARD_CARDS[29].id]:0});
 delete wallet.legendDraws;assert.deepEqual(legendTickets({games:9},wallet),{collected:29,games:9,earned:2,available:2});
 wallet.legendDraws=1;assert.equal(legendTickets({games:10},wallet).available,2);assert.equal(legendTickets({games:0},wallet).available,0);
});
test('hidden tickets have an independent repeat-safe sequence, with 20 different cards per cycle',()=>{
 for(const seed of [0,1001,Date.UTC(2026,10,29)]){let wallet=emptyWallet('u',seed);const profile={games:200,total:0},first=drawnLegend(wallet),normal=drawnCard(wallet),gold=drawnCard(wallet,true);const cycles=[new Set(),new Set()];
  for(let i=0;i<40;i++){assert.equal(drawnLegend(wallet),drawnLegend({...wallet}));wallet=walletAction(profile,wallet,{type:'legend'});cycles[Math.floor(i/20)].add(wallet.item);assert.equal(wallet.legendDraws,i+1);assert.equal(wallet.spent,0);assert.equal(wallet.draws,0);assert.equal(wallet.normalDraws,0);assert.equal(drawnCard(wallet),normal);assert.equal(drawnCard(wallet,true),gold);}
  assert.equal(cycles[0].size,20);assert.equal(cycles[1].size,20);assert.equal(wallet.cards[first],2);assert.equal(legendTickets(profile,wallet).available,0);assert.throws(()=>walletAction(profile,wallet,{type:'legend'}),/legend-ticket-required/);
 }
});
test('normal and gold pools retain their exact original IDs and exclude hidden cards',()=>{
 assert.equal(STANDARD_CARDS.length,180);assert.equal(CULTURE_CARDS.length,200);assert.equal(NORMAL_CARDS.length,99);assert.equal(FOIL_CARDS.length,81);
 for(const card of LEGEND_CARDS){assert(!NORMAL_CARDS.includes(card.id));assert(!FOIL_CARDS.includes(card.id));assert(card.hidden&&card.foil&&card.clue&&card.story&&card.source.startsWith('https://'));}
});
test('the exclusive theme and prefix require all 20 cards and cannot be bought',()=>{
 const full={...emptyWallet('u',0),cards:Object.fromEntries(LEGEND_CARDS.map(c=>[c.id,1]))};assert(legendComplete(full));assert(unlockedPrefixes(full).some(s=>s.id==='legend'));
 assert.equal(walletAction({total:0},full,{type:'equip',slot:'theme',id:LEGEND_THEME.id}).theme,LEGEND_THEME.id);assert.equal(walletAction({total:0},full,{type:'equip',slot:'prefix',id:'legend'}).prefix,'legend');
 for(const c of LEGEND_CARDS){const missing={...full,cards:{...full.cards,[c.id]:0}};assert(!legendComplete(missing));assert.throws(()=>walletAction({total:1e9},missing,{type:'equip',slot:'theme',id:LEGEND_THEME.id}),/not-owned/);assert.throws(()=>walletAction({total:1e9},missing,{type:'equip',slot:'prefix',id:'legend'}),/not-owned/);}
 assert.throws(()=>walletAction({total:1e9},full,{type:'buy',id:LEGEND_THEME.id}),/already-owned/);
});
