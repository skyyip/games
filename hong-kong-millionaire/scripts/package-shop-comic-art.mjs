// Split the two reviewed 2 × 3 illustration sheets; keep the source sheets intact.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const inputs=process.argv.slice(2);
if(inputs.length!==2)throw Error('Usage: node scripts/package-shop-comic-art.mjs <transport-heritage-snacks.png> <streets-harbour-gacha.png>');
const groups=[['card-light-rail-car','card-peak-tram-foil','card-flower-cannon','card-paper-windmill-foil','card-siu-mai-skewer','card-red-bean-ice-foil'],['card-shoe-repair-stall','card-letter-writer-foil','card-typhoon-shelter','card-lei-yue-mun-foil','gacha-colour','gacha-gold']];
const assets=fileURLToPath(new URL('../assets/',import.meta.url));
for(const [i,input]of inputs.entries()){
 const [width,height]=execFileSync('magick',['identify','-format','%w %h',resolve(input)],{encoding:'utf8'}).trim().split(' ').map(Number),size=width/2;
 if(!Number.isInteger(size)||height!==size*3||size<512)throw Error('Expected six square panels of at least 512px: '+input);
 for(const [j,id]of groups[i].entries())execFileSync('magick',[resolve(input),'-crop',`${size}x${size}+${j%2*size}+${Math.floor(j/2)*size}`,'+repage','-shave','2x2','-quality','91','-define','webp:method=6',resolve(assets,id+'.webp')]);
}
console.log('Packaged 10 comic cards and 2 general-purpose gacha covers.');
