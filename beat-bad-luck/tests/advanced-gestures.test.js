import test from 'node:test';
import assert from 'node:assert/strict';
import {RitualGame,DURATIONS} from '../src/game.js';
import {RitualFlavour,EVENT_DURATION} from '../src/ritual-flavour.js';
const flavour=type=>{const f=new RitualFlavour(()=>0);f.events=[{...f.events[0],type}];return f;};
test('precise rain dragging needs real travel and a centred release; the keyboard alternative needs three spaced actions',()=>{
 const f=flavour('rain');for(const input of [{mode:'drag',distance:20,error:0},{mode:'drag',distance:80,error:33},{mode:'drag',distance:NaN,error:0},{mode:'drag',distance:100,error:-1}])assert.equal(f.resolve('rain',input,12000),0);
 assert.equal(f.eventsWon,0);assert.equal(f.resolve('rain',{mode:'drag',distance:80,error:31},12100),30);assert.equal(f.resolve('rain',{mode:'drag',distance:80,error:0},12101),0);
 const g=flavour('rain');assert.equal(g.resolve('rain',null,12000),4);assert.equal(g.resolve('rain',null,12020),0);assert.equal(g.resolve('rain',null,12200),4);assert.equal(g.resolve('rain',null,12400),22);assert.equal(g.eventsWon,1);
});
test('wind catches require a timed second catch and cannot be spammed or left indefinitely',()=>{
 const f=flavour('wind');assert.equal(f.resolve('wind',null,12000),4);assert.equal(f.resolve('wind',null,12299),0);assert.equal(f.resolve('wind',null,13300),4);assert.equal(f.events[0].hits,1);assert.equal(f.resolve('wind',null,13600),21);assert.equal(f.resolve('wind',null,14000),0);
});
test('pigeon flicks and circle generation reject the wrong order and award once',()=>{
 const f=flavour('pigeon');assert.equal(f.resolve('pigeon','right',12000),0);assert.equal(f.resolve('pigeon','left',12200),4);assert.equal(f.resolve('pigeon','right',12400),24);
 const g=flavour('blackout');g.hit(12000,'circle',false,10,1,{direction:'ccw'});assert.equal(g.events[0].hits,0);g.hit(12200,'circle',false,10,1,{direction:'cw'});g.hit(12400,'circle',false,10,1,{direction:'cw'});assert.equal(g.events[0].hits,1);g.hit(12600,'circle',false,10,1,{direction:'ccw'});assert.equal(g.eventsWon,1);
});
test('receipt flicks require the right direction and all event actions end at the original deadline',()=>{
 const f=flavour('receipt');assert.equal(f.resolve('receipt','down',12000),0);assert.equal(f.resolve('receipt','up',12000),4);assert.equal(f.resolve('receipt','up',12100),0);assert.equal(f.resolve('receipt','up',12200),4);assert.equal(f.resolve('receipt','up',12400),20);
 for(const type of ['rain','wind','pigeon','receipt','sneeze','minibus'])assert.equal(flavour(type).resolve(type,null,12000+EVENT_DURATION),0);
});
test('new rhythm prompts require their exact direction or gesture and preserve legacy circle weaknesses and scoring',()=>{
 let now=0;const game=new RitualGame({now:()=>now,random:()=>0});game.start({kind:'sleep'});now+=DURATIONS.incense;game.advance();now+=DURATIONS.worry;game.advance();const base=now;
 for(const [at,type,wrong,right]of [[35500,'clockwise',{gesture:'circle',direction:'ccw'},{gesture:'circle',direction:'cw'}],[41000,'counterclockwise',{gesture:'circle',direction:'cw'},{gesture:'circle',direction:'ccw'}],[65000,'hold',{gesture:'tap'},{gesture:'hold'}],[73000,'spread',{gesture:'pinch'},{gesture:'spread'}]]){now=base+at;game.advance();assert.equal(game.qte.type,type);assert.equal(game.hit({...wrong,pointer:'wrong'}).qteComplete,false);const result=game.hit({...right,pointer:'right'});assert.equal(result.qteComplete,true);if(right.gesture==='circle')assert.equal(result.weak,true);}
 assert.deepEqual(game.rotations,{cw:2,ccw:2});assert.equal(game.moves.hold,1);assert.equal(game.moves.spread,1);game.pause();assert.equal(game.hit({gesture:'hold'}),null);game.resume();now=base+DURATIONS.beat;game.advance();assert.equal(game.hit({gesture:'spread'}),null);
});
