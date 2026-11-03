import {RiverScene} from './scene.js';import {animal} from './animals.js';
// Shared portraits are rasterized once per species, size and display scale.
const portraits=new Map(),MAX_PORTRAITS=48;
export function paintAnimalPortrait(canvas,id,size=120){
 id=animal(id).id;const dpr=Math.min(globalThis.devicePixelRatio||1,2),key=`${id}|${size}|${dpr}`;let cached=portraits.get(key);
 if(!cached){
  cached=document.createElement('canvas');const painter=new RiverScene(cached);painter.resize(size,size);painter.paintAnimal(size/2,size*103/120,size/120*1.25,id,{});
  if(portraits.size>=MAX_PORTRAITS)portraits.delete(portraits.keys().next().value);portraits.set(key,cached);
 }
 canvas.width=cached.width;canvas.height=cached.height;canvas.getContext('2d').drawImage(cached,0,0);
}
export function renderAnimalIcon(node,id,size=40){
 id=animal(id).id;const key=`${id}|${size}|${Math.min(globalThis.devicePixelRatio||1,2)}`;if(node.dataset.portraitKey===key&&node.firstChild)return;
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');paintAnimalPortrait(canvas,id,size);node.replaceChildren(canvas);node.dataset.animalIcon=id;node.dataset.portraitKey=key;node.classList.add('animal-portrait');node.style.setProperty('--animal-icon-size',`${size}px`);
}
