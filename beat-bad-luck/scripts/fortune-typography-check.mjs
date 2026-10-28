// Validate enlarged lower fortune text for every helper in both languages.
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
import {postcardSvg} from '../src/postcard.js';
import {WEAPONS} from '../src/catalog.js';
const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:620,height:920}});let checked=0;const failures=[];
for(const lang of ['zh-Hant','en']){for(const [index,w]of WEAPONS.entries()){
 const svg=postcardSvg({kind:'work',weapon:w.id,at:Date.parse('2026-10-28T12:23:00Z'),score:987654+index,wear:.8},lang);await p.setContent(svg);
 const data=await p.locator('svg>text').evaluateAll(nodes=>nodes.filter(n=>Number(n.getAttribute('y'))>=648).map(n=>{const r=n.getBBox();return {text:n.textContent,x:r.x,right:r.x+r.width,y:r.y,bottom:r.y+r.height,font:n.getAttribute('font-size')};}));
 for(const text of data)if(text.x<21||text.right>579||text.bottom>882)failures.push({lang,weapon:w.id,...text});
 for(let i=0;i<data.length-1;i++)if(data[i].bottom>data[i+1].y)failures.push({lang,weapon:w.id,overlap:[data[i],data[i+1]]});checked++;
 if(w.id==='rebirth-paper')await p.screenshot({path:`/tmp/bbl-fortune-larger-${lang}.png`});
}}
console.log({checked,failures});await b.close();assert.deepEqual(failures,[]);
