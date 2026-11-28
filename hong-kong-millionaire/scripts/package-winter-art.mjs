// Export reviewed comic sheets without overwriting the generated originals.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const inputs=process.argv.slice(2),assets=fileURLToPath(new URL('../assets/',import.meta.url));
if(inputs.length!==7)throw Error('Usage: node scripts/package-winter-art.mjs <A.png> <B.png> <C.png> <D.png> <E.png> <F.png> <locksmith-correction.png>');
const groups=[
 ['card-hong-kong-rickshaw','card-whitty-tram-depot-foil','card-hakka-mountain-song','card-cantonese-opera-dan-foil'],
 ['card-imitation-fin-soup','card-grid-waffle-foil','card-estate-laundry',null],
 ['card-shau-kei-wan-slipway','card-blake-pier-foil','card-sam-tung-uk-courtyard','card-fong-yuen-study-hall-foil'],
 ['card-gilded-woodcarving','card-opera-headdress-foil','theme-neon-rain','theme-estate'],
 ['theme-teahouse','exit-tram','exit-ferry','exit-gondola'],
 ['frame-rooster-bowl','frame-mahjong','frame-bus-stop','frame-flower-window']
];
for(const [i,names]of groups.entries()){
 const [w,h]=execFileSync('magick',['identify','-format','%w %h',resolve(inputs[i])],{encoding:'utf8'}).trim().split(' ').map(Number),size=w/2;
 if(!Number.isInteger(size)||w!==h||size<512)throw Error('Expected a reviewed2x2 square sheet: '+inputs[i]);
 for(const [j,name]of names.entries()){
  if(!name)continue;
  const args=[resolve(inputs[i]),'-crop',`${size}x${size}+${j%2*size}+${Math.floor(j/2)*size}`,'+repage'];
  if(!name.startsWith('frame-'))args.push('-shave',name.startsWith('exit-')?'4x4':'2x2');
  if(name.startsWith('exit-'))args.push('-trim','+repage','-bordercolor','none','-border','4');
  if(name.startsWith('theme-'))args.push('-background','#fff9e5','-alpha','remove','-alpha','off');
  execFileSync('magick',[...args,'-quality','91','-define','webp:method=6',resolve(assets,name+'.webp')]);
 }
}
execFileSync('magick',[resolve(inputs[6]),'-shave','2x2','-quality','91','-define','webp:method=6',resolve(assets,'card-staircase-locksmith-foil.webp')]);
console.log('Packaged14 comic cards,3 themes,4 transparent avatar frames and3 exit sprites.');
