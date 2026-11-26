// Extract the generated, reviewed panel sheets into independent sharp card images.
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const source=process.argv[2];if(!source)throw Error('Usage: node scripts/package-culture-art.mjs <reviewed-sheet-directory>');
const assets=fileURLToPath(new URL('../assets/',import.meta.url));
const sheets=[
 ['villages-core',2,3,['peng-chau-lane','tai-o-bridge','lamma-bay','tsang-house','lai-chi-wo-foil','cheung-chau-pier-foil']],
 ['crafts-core',2,3,['bamboo-steamer','salt-crystals','eggroll-workshop','neon-workshop','paper-lion-foil','painted-porcelain-foil']],
 ['villages-extra',2,2,['kat-hing-courtyard','mui-wo-silvermine-foil','sha-tau-kok-lanterns','po-toi-shore-foil']],
 ['crafts-extra',2,2,['scissor-repair','dough-figurine-foil','minibus-signwriting','wedding-embroidery-foil']],
 ['new-local-six',2,3,['cross-harbour-bus','kai-tak-ferry-foil','hungry-ghost-theatre','hakka-unicorn-foil','sugar-onion-wrap','pineapple-bun-foil']],
 ['new-local-four',2,2,['fruit-market-crates','night-dai-pai-dong-foil','seafood-market','star-ferry-rope-foil']],
 ['new-theme-four',2,2,['theme-village','theme-island','theme-workshop']]
];
let count=0;
for(const [name,columns,rows,ids]of sheets){
 const input=resolve(source,'hkm-visual120-'+name+'.png'),[width,height]=execFileSync('magick',['identify','-format','%w %h',input],{encoding:'utf8'}).trim().split(' ').map(Number),w=width/columns,h=height/rows;
 if(!Number.isInteger(w)||!Number.isInteger(h)||w!==h||w<500)throw Error('Expected equal square panels of at least 500px: '+name);
 for(const [i,id]of ids.entries()){
  const dest=resolve(assets,(id.startsWith('theme-')?'':'card-')+id+'.webp');
  execFileSync('magick',[input,'-crop',w+'x'+h+'+'+(i%columns*w)+'+'+(Math.floor(i/columns)*h),'+repage','-shave','2x2','-quality','91','-define','webp:method=6',dest]);count++;
 }
}
console.log('Packaged '+count+' reviewed, independently cropped illustrations.');
