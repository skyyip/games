// Export the reviewed six-scene sheets, retaining every generated original.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {CULTURE_CARDS} from '../src/economy.js';
const inputs=process.argv.slice(2),cards=CULTURE_CARDS.slice(112,160),assets=fileURLToPath(new URL('../assets/',import.meta.url));
if(inputs.length!==10||cards.length!==48)throw Error('Usage: node scripts/package-adventure-art.mjs <A.png> ... <H.png> <tunnel-correction.png> <lion-rock-correction.png>');
for(const [i,input]of inputs.entries()){
 const path=resolve(input),[w,h]=execFileSync('magick',['identify','-format','%w %h',path],{encoding:'utf8'}).trim().split(' ').map(Number);
 if(i<8){
  const size=w/3;if(!Number.isInteger(size)||h!==size*2||size<512)throw Error('Expected a reviewed 3×2 sheet: '+input);
  for(let j=0;j<6;j++){
   if(i===0&&j===0||i===4&&j===4)continue;
   execFileSync('magick',[path,'-crop',`${size}x${size}+${j%3*size}+${Math.floor(j/3)*size}`,'+repage','-shave','2x2','-resize','508x508','-quality','91','-define','webp:method=6',resolve(assets,'card-'+cards[i*6+j].id+'.webp')]);
  }
 }else{
  if(w!==h||w<1024)throw Error('Expected a reviewed square correction: '+input);
  const card=cards[i===8?0:28];
  execFileSync('magick',[path,'-shave','2x2','-resize','508x508','-quality','91','-define','webp:method=6',resolve(assets,'card-'+card.id+'.webp')]);
 }
}
console.log('Packaged 48 original comic cards, including two reviewed landmark corrections.');
