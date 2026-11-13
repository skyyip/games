// Actual built page, including setupModalChrome and every production stylesheet.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
try{
 for(const [width,height] of [[320,568],[390,844],[812,375],[1280,900]]){
  const c=await browser.newContext({viewport:{width,height},serviceWorkers:'block'});
  await c.addInitScript(()=>{window.BBL_FIREBASE_CONFIG=null;localStorage.setItem('beat-bad-luck.players.v1.name.local','測試玩家');});
  await c.route('https://www.googletagmanager.com/**',r=>r.fulfill({body:''}));const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(process.env.BBL_URL||'http://127.0.0.1:5436/games/beat-bad-luck/',{waitUntil:'networkidle'});
  await p.locator('#bbl-social-open').click();const close=p.locator('#bbl-social-dialog [data-bbl-close]');
  const layout=await close.evaluate(n=>{
   const b=n.getBoundingClientRect(),header=n.closest('header').getBoundingClientRect(),refresh=document.getElementById('bbl-social-refresh').getBoundingClientRect(),s=getComputedStyle(n),x=getComputedStyle(n,'::before'),matrix=new DOMMatrixReadOnly(x.transform==='none'?undefined:x.transform);
   const length=(v,size)=>v.endsWith('%')?parseFloat(v)*size/100:parseFloat(v);
   return {position:s.position,width:b.width,height:b.height,top:s.top,right:s.right,classes:n.className,header:header.toJSON(),button:b.toJSON(),refresh:refresh.toJSON(),dx:length(x.left,n.clientWidth)+parseFloat(x.width)/2+matrix.m41-n.clientWidth/2,dy:length(x.top,n.clientHeight)+parseFloat(x.height)/2+matrix.m42-n.clientHeight/2};
  });
  assert.match(layout.classes,/modal-close/);assert.equal(layout.position,'relative');assert.equal(parseFloat(layout.top)||0,0);assert.equal(parseFloat(layout.right)||0,0);assert.equal(layout.width,44);assert.equal(layout.height,44);assert(Math.abs(layout.dx)<1&&Math.abs(layout.dy)<1,JSON.stringify(layout));assert(layout.button.right<=layout.header.right&&layout.button.top>=layout.header.top&&layout.button.bottom<=layout.header.bottom,JSON.stringify(layout));
  await p.locator('#bbl-social-dialog').evaluate(async n=>{await Promise.all(n.getAnimations().map(a=>a.finished.catch(()=>{})));});await p.screenshot({path:'/tmp/bbl-social-chrome-'+width+'.png'});
  await close.click();await p.locator('#bbl-social-dialog').waitFor({state:'hidden'});assert.deepEqual(errors,[]);console.log('PASS production modal chrome '+width+'px: 44px header close button, pseudo-element centered in button, single click dismisses.');await c.close();
 }
}finally{await browser.close();}
