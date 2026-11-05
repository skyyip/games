// Test helper reads durable state through the same IndexedDB schema, without a product debug object.
export async function readLife(page,key='career-365.save.v1'){
 await page.waitForFunction(()=>document.getElementById('save-state')?.textContent!=='儲存中…');
 return page.evaluate(async key=>{const raw=localStorage.getItem(key);if(!raw)return null;const value=JSON.parse(raw);if(!key.startsWith('career-365.save.v1'))return value;const db=await new Promise((ok,no)=>{const r=indexedDB.open('career-365.lives.v2',1);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});try{const tx=db.transaction(['lives','panels'],'readonly'),meta=await new Promise((ok,no)=>{const r=tx.objectStore('lives').get(key);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});if(!meta)return value;const panels=await new Promise((ok,no)=>{const r=tx.objectStore('panels').getAll(IDBKeyRange.bound([key,meta.run,0],[key,meta.run,8000]));r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});return {...meta.state,panels};}finally{db.close();}},key);
}
export async function seedLife(page,key,state){await page.evaluate(async({key,state})=>{const db=await new Promise((ok,no)=>{const r=indexedDB.open('career-365.lives.v2',1);r.onupgradeneeded=()=>{r.result.createObjectStore('lives');r.result.createObjectStore('panels');};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});await new Promise((ok,no)=>{const tx=db.transaction(['lives','panels'],'readwrite');tx.objectStore('lives').delete(key);tx.objectStore('panels').delete(IDBKeyRange.bound([key,'',0],[key,'\uffff',8000]));tx.oncomplete=ok;tx.onerror=()=>no(tx.error);});db.close();localStorage.setItem(key,JSON.stringify(state));},{key,state});}
export async function installLifeHelpers(browser){
 const create=browser.newContext.bind(browser);browser.newContext=async options=>{const context=await create(options);await context.addInitScript(`globalThis.__careerTestRead=${browserRead.toString()};globalThis.__careerTestWrite=${browserWrite.toString()};`);return context;};
}
async function browserRead(key){for(let i=0;i<500&&document.getElementById('save-state')?.textContent==='儲存中…';i++)await new Promise(r=>setTimeout(r,10));const raw=localStorage.getItem(key);if(!raw)return null;const value=JSON.parse(raw);if(!key.startsWith('career-365.save.v1'))return value;const db=await new Promise((ok,no)=>{const r=indexedDB.open('career-365.lives.v2',1);r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});try{const tx=db.transaction(['lives','panels'],'readonly'),meta=await new Promise(ok=>{const r=tx.objectStore('lives').get(key);r.onsuccess=()=>ok(r.result);});if(!meta)return value;const panels=await new Promise(ok=>{const r=tx.objectStore('panels').getAll(IDBKeyRange.bound([key,meta.run,0],[key,meta.run,8000]));r.onsuccess=()=>ok(r.result);});return {...meta.state,panels};}finally{db.close();}}
async function browserWrite(key,value){let state;try{state=JSON.parse(value);}catch{}if(key.startsWith('career-365.save.v1')&&Array.isArray(state?.panels)){const db=await new Promise((ok,no)=>{const r=indexedDB.open('career-365.lives.v2',1);r.onupgradeneeded=()=>{r.result.createObjectStore('lives');r.result.createObjectStore('panels');};r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});await new Promise((ok,no)=>{const tx=db.transaction(['lives','panels'],'readwrite');tx.objectStore('lives').delete(key);tx.objectStore('panels').delete(IDBKeyRange.bound([key,'',0],[key,'\uffff',8000]));tx.oncomplete=ok;tx.onerror=()=>no(tx.error);});db.close();}localStorage.setItem(key,value);}
export async function clickAndWait(locator,options){await locator.click(options);await locator.page().waitForFunction(()=>document.getElementById('save-state')?.textContent!=='儲存中…');}
export async function openLifeControl(page,selector){
 const control=page.locator(selector);
 while(await page.locator('.reading-dialog[open]').count()&&!await control.evaluate(n=>!!n.closest('.reading-dialog[open]')))await page.keyboard.press('Escape');
 if(!await control.isVisible()){
  const dialog=await control.evaluate(n=>n.closest('dialog')?.id);
  if(dialog==='life-choices-dialog'&&!await page.locator('#life-choices-dialog').isVisible())await clickAndWait(page.locator('#life-choices-open'));
  const parents=await control.locator('xpath=ancestor::details').all(),summary=await control.evaluate(n=>n.tagName==='SUMMARY');for(const details of parents.slice(0,summary?-1:undefined))if(await details.getAttribute('open')===null)await clickAndWait(details.locator(':scope > summary'));
 }
 await clickAndWait(control);
}

// Exercise the real task controls. Expected choices come from the saved task's published materials.
export async function prepareVocationalTask(page){
 const {LifeGame}=await import('../src/game.js'),{taskMaterial}=await import('../src/vocation.js');
 let state=await readLife(page),g=LifeGame.restore(state);if(g?.s.pending?.id!=='vocational-task')throw Error('Expected vocational task');
 for(const kind of ['clue','mentor'])if(!state.pending.vocation[kind]){await clickAndWait(page.locator(`[data-vocation-inspect="${kind}"]`));if(await page.locator('.reading-dialog').count())await page.locator('.reading-dialog .dialog-close').last().click();}
 state=await readLife(page);g=LifeGame.restore(state);const material=taskMaterial(g);
 if(state.pending.vocation.answer===null){await clickAndWait(page.locator(`[data-vocation-answer="${material.order.indexOf(material.question.answer)}"]`));if(await page.locator('.reading-dialog').count())await page.locator('.reading-dialog .dialog-close').last().click();}
 if(await page.locator('#vocation-revise').count()){if(!await page.locator('#vocation-revise').isVisible())await page.locator('#vocation-answer-open').click();await clickAndWait(page.locator('#vocation-revise'));}
 return material;
}
export async function completeVocationalTask(page,approach=null){const material=await prepareVocationalTask(page),index=material.choices.findIndex(c=>c.approach===(approach??material.pressure.fit));await clickAndWait(page.locator(`[data-vocation-choice="${index}"]`));return readLife(page);}
