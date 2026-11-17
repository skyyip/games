import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {CULTURE_CARDS} from '../src/economy.js';import {cultureCardImage,cultureCardCrop} from '../src/collection-ui.js';
test('all collectible scenes map once to four original square-cell atlases',()=>{
 const slots=new Set();for(const c of CULTURE_CARDS){const {column,row,columns,rows}=cultureCardCrop(c),url=cultureCardImage(c);assert(column>=0&&column<columns&&row>=0&&row<rows);slots.add(url+':'+column+':'+row);const webp=readFileSync(new URL(url));assert.equal(webp.toString('ascii',0,4),'RIFF');assert.equal(webp.toString('ascii',8,12),'WEBP');assert(webp.length<1300000);}
 assert.equal(slots.size,CULTURE_CARDS.length);
});
