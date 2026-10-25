// Regenerate the static landing cover from the same vector artwork as gameplay.
import {writeFile} from 'node:fs/promises';
import {spriteMarkup} from '../src/sprites.js';

const characters=[
  ['red','leaf',20,24,70],['yellow','bud',110,22,70],
  ['ice','flower',200,24,70],['rock','leaf',290,22,70],['white','flower',380,24,70],
  ['blue','bud',40,104,100],['purple','flower',140,104,100],
  ['glow','flower',240,90,100],['winged','flower',340,98,100],
];
const figures=characters.map(([type,growth,x,y,width])=>{
  const height=width*88/64;
  const groundY=type==='glow'||type==='winged'?104:y;
  return `<ellipse cx="${x+width/2}" cy="${groundY+height*.91}" rx="${width*.28}" ry="${width*.055}" fill="#497452" opacity=".15"/>`+
    spriteMarkup(type,growth).replace('<svg ',`<svg x="${x}" y="${y}" width="${width}" height="${height}" `);
}).join('\n');
const cover=`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="260" viewBox="0 0 480 260" fill="none" stroke-linecap="round" stroke-linejoin="round">
<title>Pikmax garden</title>
<defs><linearGradient id="garden" x2="0" y2="1"><stop stop-color="#e3f0cf"/><stop offset="1" stop-color="#bbd5aa"/></linearGradient></defs>
<style>.pikmin-art{overflow:visible}.pikmin-art[data-sprite=glow]{filter:drop-shadow(0 0 2px #cbff9155)}.rig-glow-aura{filter:blur(4px)}.halo-bloom{filter:blur(1.8px)}</style>
<path fill="url(#garden)" d="M0 0h480v260H0z"/>
<circle cx="426" cy="38" r="22" fill="#fff2b8" opacity=".8"/>
<path d="M0 104Q95 65 200 102T480 88V260H0Z" fill="#cde2b8"/>
<path d="M0 190Q115 150 243 187T480 172V260H0Z" fill="#c0d9aa"/>
<g fill="#f8ffed" opacity=".8"><circle cx="28" cy="154" r="2.5"/><circle cx="450" cy="134" r="3"/><circle cx="116" cy="208" r="2"/><circle cx="320" cy="64" r="2"/></g>
${figures}
<path d="M0 249Q106 240 240 248T480 247V260H0Z" fill="#b2cd9a"/>
<g fill="#fff4d4"><path d="m20 219 2-4 2 4 4 2-4 2-2 4-2-4-4-2Z"/><path d="m456 207 2-4 2 4 4 2-4 2-2 4-2-4-4-2Z"/></g>
</svg>\n`;
await writeFile(new URL('../assets/pikmax-cover.svg',import.meta.url),cover.replace(/[\t ]+$/gm,''));
console.log('Pikmax landing cover updated from all nine current character sprites.');
