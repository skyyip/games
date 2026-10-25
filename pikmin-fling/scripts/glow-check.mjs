import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({channel:'chrome',headless:true});
const base=process.env.PIKMIN_FLING_URL||'http://localhost:5173/pikmin-fling/';
const errors=[];let checks=0;
try{
  await mkdir('/tmp/pikmax-glow-qa',{recursive:true});
  for(const language of ['zh-Hant','en'])for(const mode of ['normal','challenge','timed']){
    const mobile=language==='zh-Hant';
    const context=await browser.newContext({viewport:mobile?{width:375,height:812}:{width:1440,height:1100},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce',serviceWorkers:'block'});
    await context.addInitScript(language=>{localStorage.setItem('playground.language.v1',language);Math.random=()=>0;},language);
    await context.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base);await page.locator('#start:not(:disabled)').waitFor();
    await page.locator(`input[value="${mode}"]`).check();
    assert.equal(await page.locator('#glow-points').isVisible(),mode==='timed');
    assert.equal(await page.locator('#glow-note').isVisible(),mode==='timed');
    if(mode==='timed')assert.match(await page.locator('#glow-note').innerText(),language==='en'?/only in 35s Rush/:/只有 35 秒衝刺/);
    const notes=await page.locator('.control-card .control-note:visible').evaluateAll(els=>els.map(e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom};}));
    for(let i=1;i<notes.length;i++)assert.ok(notes[i].top>=notes[i-1].bottom-1,'setup notes must not overlap');
    await page.clock.install();await page.clock.pauseAt(new Date(Date.now()+1000));
    await page.locator('#start').evaluate(el=>el.click());
    const liveGlow=()=>page.locator('.pikmin[data-type="glow"]:not(:disabled)');
    assert.equal(await liveGlow().count(),0);
    for(const jump of [4001,3001,3001])await page.clock.fastForward(jump);
    assert.equal(await liveGlow().count(),mode==='timed'?3:0);assert.equal(await page.locator('.pikmin').count(),35);
    const grass=await page.evaluate(()=>{const field=document.querySelector('#units').getBoundingClientRect(),left=document.querySelector('.fence-grass-left'),right=document.querySelector('.fence-grass-right');return {leftClear:left.getBoundingClientRect().right<field.left,rightClear:right.getBoundingClientRect().left>field.right,passThrough:[left,right].every(el=>getComputedStyle(el).pointerEvents==='none')};});
    assert.deepEqual(grass,{leftClear:true,rightClear:true,passThrough:true});
    if(mode==='timed'){
      await page.clock.fastForward(3001);assert.equal(await liveGlow().count(),3);
      for(const el of await liveGlow().all()){
        assert.equal(await el.locator('.rig-leg,.rig-wing').count(),0);
        assert.equal(await el.locator('.rig-glow-tail').count(),1);
        assert.equal(await el.locator('.rig-glow-halo').count(),1);
        assert.equal(await el.locator('.rig-glow-aura').evaluate(el=>getComputedStyle(el).filter),'blur(4px)');
        assert.equal(await el.locator('.rig-glow-aura').evaluate(el=>el.getAnimations().length),0);
        assert.equal(await el.locator('.rig-belly-stripe').count(),2);
        assert.equal(await el.evaluate(el=>el.style.getPropertyValue('--lift')),'-6px');
        assert.match(await el.getAttribute('aria-label'),language==='en'?/Glow/:/螢光/);
        const growth=await el.getAttribute('data-growth'),points={leaf:2,bud:3,flower:4}[growth];
        if(mode==='timed')assert.match(await el.getAttribute('aria-label'),language==='en'?new RegExp(`Worth ${points} points`):new RegExp(`值 ${points} 分`));
      }
      const target=liveGlow().first(),growth=await target.getAttribute('data-growth'),points={leaf:2,bud:3,flower:4}[growth];
      await target.focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('.flying-pikmin[data-sprite="glow"]').count(),1);
      assert.equal(await page.locator('.flying-pikmin[data-sprite="glow"] .rig-glow-halo').count(),1);
      assert.equal(await liveGlow().count()+await page.locator('.flying-pikmin[data-sprite="glow"]').count(),3);
      await page.clock.runFor(550);assert.equal(await liveGlow().count(),2);
      if(mode==='timed')assert.equal(await page.locator('#score').textContent(),String(points));
      await page.clock.fastForward(7001);assert.equal(await liveGlow().count(),3);
    }else{
      await page.clock.fastForward(30001);assert.equal(await liveGlow().count(),0);
      assert.equal(await page.locator('#results').isVisible(),false);
    }
    await page.screenshot({path:`/tmp/pikmax-glow-qa/${language}-${mode}.png`,fullPage:!mobile});
    await page.locator('.pikmin:not(:disabled)').evaluateAll(els=>els.forEach(el=>el.click()));await page.clock.runFor(550);
    await page.locator('#results').waitFor({state:'visible'});
    assert.equal(await page.locator('#fed').textContent(),'35');
    if(mode==='timed'){
      const score=Number(await page.locator('#final-time').textContent());assert.ok(score>9&&score<=140);
      const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('pikmin-fling.records.v4')));
      assert.equal(saved.timed[0].score,score);
    }
    await page.locator('#again').evaluate(el=>el.click());assert.equal(await liveGlow().count(),0);
    await context.close();checks++;console.log(`PASS ${language}/${mode}: timed-only Glow, soft aura, cap including flights, full clear, replay and grass field clearance`);
  }
  assert.deepEqual(errors,[]);console.log(`${checks} Glow browser scenarios passed without uncaught errors.`);
}finally{await browser.close();}
