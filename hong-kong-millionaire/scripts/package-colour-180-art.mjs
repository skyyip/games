// Export twenty reviewed comic scenes without changing the generated originals.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CULTURE_CARDS} from '../src/economy.js';
const inputs=process.argv.slice(2),cards=CULTURE_CARDS.slice(160,180),assets=fileURLToPath(new URL('../assets/',import.meta.url));
if(inputs.length!==6||cards.length!==20)throw Error('Usage: node scripts/package-colour-180-art.mjs <A.png> <B.png> <C.png> <D.png> <E.png> <white-cake-correction.png>');
for(const [i,input]of inputs.slice(0,5).entries()){
 const path=resolve(input),[w,h]=execFileSync('magick',['identify','-format','%w %h',path],{encoding:'utf8'}).trim().split(' ').map(Number),size=w/2;
 if(w!==h||!Number.isInteger(size)||size<512)throw Error('Expected a reviewed square 2×2 sheet: '+input);
 for(let j=0;j<4;j++){
  if(i===1&&j===0)continue;
  execFileSync('magick',[path,'-crop',`${size}x${size}+${j%2*size}+${Math.floor(j/2)*size}`,'+repage','-shave','2x2','-resize','508x508','-quality','91','-define','webp:method=6',resolve(assets,'card-'+cards[i*4+j].id+'.webp')]);
 }
}
const correction=resolve(inputs[5]),[cw,ch]=execFileSync('magick',['identify','-format','%w %h',correction],{encoding:'utf8'}).trim().split(' ').map(Number);
if(cw!==ch||cw<1024)throw Error('Expected a reviewed square rice-cake correction.');
execFileSync('magick',[correction,'-shave','2x2','-resize','508x508','-quality','91','-define','webp:method=6',resolve(assets,'card-'+cards[4].id+'.webp')]);
console.log('Packaged twenty original comic scenes: ten snacks and ten mountain/coastal cards.');
