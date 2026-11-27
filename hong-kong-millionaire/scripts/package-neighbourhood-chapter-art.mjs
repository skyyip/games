// Export reviewed original comic panels; keep generated source sheets untouched.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const inputs=process.argv.slice(2);
if(inputs.length!==5)throw Error('Usage: node scripts/package-neighbourhood-chapter-art.mjs <city.png> <street.png> <harbour.png> <crafts.png> <gun-correction.png>');
const groups=[['red-taxi-corner','ngong-ping-cabin-foil','poon-choi-courtyard','tin-hau-procession-foil'],['tofu-pudding-stall','wife-cake-foil','tenement-mailboxes','gas-lamp-steps-foil'],['noon-day-gun','tsing-ma-bridge-foil','lam-tsuen-wishes','tung-chung-fort-foil'],['scales-workshop','floral-button-foil']];
const assets=fileURLToPath(new URL('../assets/',import.meta.url));
for(const [i,input]of inputs.slice(0,4).entries()){
 const [w,h]=execFileSync('magick',['identify','-format','%w %h',resolve(input)],{encoding:'utf8'}).trim().split(' ').map(Number),size=w/2;
 if(!Number.isInteger(size)||h!==w||size<512)throw Error('Expected a reviewed two-by-two square sheet: '+input);
 for(const [j,id]of groups[i].entries())execFileSync('magick',[resolve(input),'-crop',`${size}x${size}+${j%2*size}+${Math.floor(j/2)*size}`,'+repage','-shave','2x2','-quality','91','-define','webp:method=6',resolve(assets,'card-'+id+'.webp')]);
}
const [w,h]=execFileSync('magick',['identify','-format','%w %h',resolve(inputs[4])],{encoding:'utf8'}).trim().split(' ').map(Number);
if(w!==h||w<512)throw Error('Expected a reviewed square Noonday Gun correction');
execFileSync('magick',[resolve(inputs[4]),'-shave','2x2','-quality','91','-define','webp:method=6',resolve(assets,'card-noon-day-gun.webp')]);
console.log('Packaged14 Hong Kong comic cards with the reviewed fixed-pedestal Noonday Gun.');
