import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {CULTURE_CARDS} from '../src/economy.js';import {cultureCardImage,cultureCardCrop} from '../src/collection-ui.js';
test('all collectible scenes have unique atlas cells or original self-contained SVG scenes',()=>{
 const slots=new Set();for(const c of CULTURE_CARDS){const {column,row,columns,rows}=cultureCardCrop(c),url=cultureCardImage(c);assert(column>=0&&column<columns&&row>=0&&row<rows);slots.add(url+':'+column+':'+row);const webp=readFileSync(new URL(url));if(url.endsWith('.svg')){assert.match(webp.toString(),/viewBox="0 0 500 500"/);assert.deepEqual([column,row,columns,rows],[0,0,1,1]);assert(!/<(?:image|script)\b/.test(webp.toString()));}else{assert.equal(webp.toString('ascii',0,4),'RIFF');assert.equal(webp.toString('ascii',8,12),'WEBP');}assert(webp.length<1300000);}
 assert.equal(slots.size,CULTURE_CARDS.length);
});
