import {writeFile} from 'node:fs/promises';
import {harbourArt,bunArt,actorArt,climberRig} from '../src/art.js';
const embed=(art,x,y,w,h)=>art.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const tower=`<path d="M610 35v665m130-665v665m130-665v665" stroke="#b3a973" stroke-width="20"/><path d="M604 35v665m130-665v665m130-665v665" stroke="#e4d4a0" stroke-width="4"/>${[80,170,260,350,440,530,620].map(y=>`<path d="M585 ${y}h310" stroke="#b7a474" stroke-width="14"/><path d="M585 ${y-4}h310" stroke="#ead8a6" stroke-width="3"/>`).join('')}`;
const buns=Array.from({length:10},(_,i)=>embed(bunArt(['on-time','no-ot','no-overthinking','sleep-in','good-health','lucky-streak','happy-days','carefree'][i%8],'zh-Hant'),i%2?807:579,48+Math.floor(i/2)*113,98,98)).join('');
const cover=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 720">${embed(harbourArt(),0,0,1200,720)}${tower}${buns}<g transform="translate(744 387) scale(2.2) rotate(-8)">${climberRig()}</g>${embed(actorArt('overtime-hero','bun-flag','zh-Hant'),239,315,250,313)}<g fill="#e6bd66" stroke="#fff0ba" stroke-width="2"><circle cx="933" cy="323" r="12"/><circle cx="964" cy="351" r="9"/><circle cx="541" cy="249" r="10"/></g><path d="m1039 150 10 22 25 4-18 18 4 25-21-12-22 12 4-25-18-18 25-4Z" fill="#efd091"/></svg>`;
await writeFile(new URL('../assets/cover.svg',import.meta.url),cover);
