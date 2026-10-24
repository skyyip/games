import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.BALANCE_BRIDGE_URL||'http://localhost:5173/balance-bridge/';
try{
  await mkdir('/tmp/balance-bridge-qa',{recursive:true});const c=await browser.newContext({viewport:{width:1200,height:1100},serviceWorkers:'block'}),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(base);await p.clock.install();await p.clock.pauseAt(new Date(Date.now()+1000));
  for(let index=0;index<5;index++){
    const state=await p.evaluate(async index=>{
      const {BalanceGame,EVENTS}=await import('./src/game.js'),{BridgeScene}=await import('./src/scene.js');
      document.querySelector('#idle-caption').hidden=true;document.querySelector('#planks').replaceChildren();const scene=new BridgeScene(document.querySelector('#scene')),game=new BalanceGame();game.start();game.event={...EVENTS[index],direction:1,startedAt:0};game.elapsed=1.5;game.phase=4;game.angle=.07*(index+1);scene.draw(game,3);
      return {roach:document.querySelector('#head-roach').getAttribute('opacity'),thorns:document.querySelector('#thorns').getAttribute('opacity'),bird:document.querySelector('#bird-splat').getAttribute('opacity'),wind:document.querySelector('#wind-lines').getAttribute('opacity'),bridge:document.querySelector('#bridge-deck').getAttribute('transform'),arm:document.querySelector('#arm-left').getAttribute('d'),pole:document.querySelector('#pole').getAttribute('transform')};
    },index);
    assert.equal(state.roach,index===4?'1':'0');assert.equal(state.thorns,index===2?'1':'0');assert.equal(state.bird,index===1?'1':'0');assert.equal(Number(state.wind)>0,index===0);assert.equal(state.bridge!=='translate(0 0)',index===3);assert.match(state.arm,/Q/);assert.match(state.pole,/rotate/);await p.locator('#world').screenshot({path:`/tmp/balance-bridge-qa/event-level-${index+1}.png`});console.log(`PASS severity ${index+1}: corresponding scene effect, articulated arms and pole`);
  }
  assert.deepEqual(errors,[]);console.log('PASS no uncaught scene errors');await c.close();
}finally{await browser.close();}
