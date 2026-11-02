import assert from 'node:assert/strict';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true}),base=process.env.BEAT_BAD_LUCK_URL||'http://localhost:5260/beat-bad-luck/';
try{for(const motion of ['no-preference','reduce']){
 const c=await browser.newContext({viewport:{width:600,height:500},reducedMotion:motion,serviceWorkers:'block'}),p=await c.newPage();
 await p.route('**/__ghost-qa.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><html><head><link rel="stylesheet" href="combat-refresh.css"></head><body style="background:#244a40"><div id="beat-arena" style="position:relative;width:360px;height:300px"></div><div id="artboard" style="display:flex"></div></body></html>'}));
 await p.goto(new URL('__ghost-qa.html',base).href);
 const result=await p.evaluate(async()=>{
  const {createAmbientComics}=await import('./src/ambient-comics.js'),{comicGhostArt,GHOST_MOODS}=await import('./src/combat-art.js'),game={phase:'beat',elapsed:0,finisherBusy:false,pausedAt:null},ui=createAmbientComics({game}),seen=new Set();let max=0;
  for(let t=0;t<90000;t+=100){game.elapsed=t;ui.sync();const ghosts=[...document.querySelectorAll('.ambient-ghost')];max=Math.max(max,ghosts.length);if(document.querySelector('.ambient-paper,.ambient-zombie'))throw Error('removed background returned');if(ghosts.length>2)throw Error('too many ghosts');for(const ghost of ghosts){seen.add(ghost.dataset.emotion);if(!ghost.querySelector('.ghost-fangs'))throw Error('missing fangs');if(getComputedStyle(ghost).pointerEvents!=='none')throw Error('blocks input');}}
  game.phase='tiger';ui.sync();if(document.querySelector('.ambient-sprite'))throw Error('phase exit leaked ghosts');game.phase='beat';game.elapsed=0;ui.sync();game.elapsed=1300;ui.sync();const ghost=document.querySelector('.ambient-ghost');if(!ghost)throw Error('no ghost');game.pausedAt=1300;ui.sync();if(ghost.getAnimations().some(a=>a.playState==='running'))throw Error('paused animation running');game.pausedAt=null;ui.sync();
  game.finisherBusy=true;ui.sync();if(document.querySelector('.ambient-sprite'))throw Error('burst leaked ambient visitors');game.finisherBusy=false;game.elapsed=15000;ui.sync();ui.clear();if(document.querySelector('.ambient-sprite'))throw Error('cleanup failed');
  document.querySelector('#artboard').innerHTML=GHOST_MOODS.map(m=>`<figure style="margin:8px;color:#fff;text-align:center"><div style="width:110px">${comicGhostArt(m)}</div><figcaption>${m}</figcaption></figure>`).join('');
  return {max,moods:[...seen]};
 });
 assert(result.max>=1&&result.max<=2);assert.equal(result.moods.length,4);await p.screenshot({path:`/tmp/bbl-ghost-fangs-${motion}.png`});console.log(`PASS ${motion}: 90-second ghost-only lifecycle, two-ghost cap, all four fanged moods, no input interception, pause, burst and phase-exit cleanup.`);await c.close();
}}finally{await browser.close();}
