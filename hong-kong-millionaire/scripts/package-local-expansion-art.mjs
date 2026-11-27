// Crop reviewed Hong Kong comic sheets without modifying their original files.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const inputs=process.argv.slice(2);
if(inputs.length!==5)throw Error('Usage: node scripts/package-local-expansion-art.mjs <city.png> <harbour.png> <crafts.png> <taio-correction.png> <bridge-correction.png>');
const groups=[['green-minibus-corner','airport-express-foil','rabbit-lantern','tai-o-dragonboat-foil','cart-noodle-stall','egg-tart-counter-foil'],['newspaper-kiosk','rainy-arcade-foil','container-port','stonecutters-bridge-foil','yim-tin-tsai-chapel','tung-ping-chau-foil'],['bamboo-birdcage-maker','man-wa-seal-foil']];
const assets=fileURLToPath(new URL('../assets/',import.meta.url));
for(const [i,input]of inputs.slice(0,3).entries()){
 const [width,height]=execFileSync('magick',['identify','-format','%w %h',resolve(input)],{encoding:'utf8'}).trim().split(' ').map(Number),size=width/2,rows=groups[i].length/2;
 if(!Number.isInteger(size)||height!==size*rows||size<512)throw Error('Expected equal square panels of at least 512px: '+input);
 for(const [j,id]of groups[i].entries())execFileSync('magick',[resolve(input),'-crop',`${size}x${size}+${j%2*size}+${Math.floor(j/2)*size}`,'+repage','-shave','2x2','-quality','91','-define','webp:method=6',resolve(assets,'card-'+id+'.webp')]);
}
for(const [id,input]of [['tai-o-dragonboat-foil',inputs[3]],['stonecutters-bridge-foil',inputs[4]]]){
 const [w,h]=execFileSync('magick',['identify','-format','%w %h',resolve(input)],{encoding:'utf8'}).trim().split(' ').map(Number);if(w!==h||w<512)throw Error('Expected a reviewed square correction: '+input);
 execFileSync('magick',[resolve(input),'-shave','2x2','-quality','91','-define','webp:method=6',resolve(assets,'card-'+id+'.webp')]);
}
console.log('Packaged 14 Hong Kong comic cards, including the reviewed Tai O parade and monopole bridge corrections.');
