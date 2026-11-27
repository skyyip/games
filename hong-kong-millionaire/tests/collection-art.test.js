import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {CULTURE_CARDS} from '../src/economy.js';import {cultureCardImage,cultureCardCrop} from '../src/collection-ui.js';
test('all collectible scenes have unique atlas cells or distinct original illustrations',()=>{
 const slots=new Set();for(const c of CULTURE_CARDS){const {column,row,columns,rows}=cultureCardCrop(c),url=cultureCardImage(c);assert(column>=0&&column<columns&&row>=0&&row<rows);slots.add(url+':'+column+':'+row);assert(url.endsWith('.webp'),c.id+' must use a comic illustration');const webp=readFileSync(new URL(url));assert.equal(webp.toString('ascii',0,4),'RIFF');assert.equal(webp.toString('ascii',8,12),'WEBP');assert(webp.length<1300000);}
 assert.equal(slots.size,CULTURE_CARDS.length);
});
test('village and craft cards use distinct detailed raster scenes instead of the simplified vectors',()=>{
 const cards=CULTURE_CARDS.filter(c=>['villages','crafts'].includes(c.series));assert.equal(cards.length,20);
 for(const card of cards){const url=cultureCardImage(card);assert(url.endsWith('.webp'),card.id);assert(url.includes('/card-'+card.id+'.webp'));assert.deepEqual(cultureCardCrop(card),{column:0,row:0,columns:1,rows:1});}
});
