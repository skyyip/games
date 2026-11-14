import {RiverScene} from './scene.js';import {animal} from './animals.js';
// Shared portraits are rasterized once per species, size and display scale.
const portraits=new Map(),MAX_PORTRAITS=48;
export function paintAnimalPortrait(canvas,id,size=120){
 id=animal(id).id;const dpr=Math.min(globalThis.devicePixelRatio||1,2),portraitSize=Math.max(120,size),key=`${id}|${portraitSize}|${dpr}`;let cached=portraits.get(key);
 if(!cached){
  const source=document.createElement('canvas');source.width=source.height=384;const painter=new RiverScene(source);painter.paintAnimal(192,300,2.4,id,{});
  const {data,width,height}=source.getContext('2d').getImageData(0,0,384,384);let left=width,top=height,right=0,bottom=0;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(data[(y*width+x)*4+3]){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  cached=document.createElement('canvas');cached.width=cached.height=Math.max(1,Math.round(portraitSize*dpr));const w=right-left+1,h=bottom-top+1,fit=cached.width*.82/Math.max(w,h),dx=(cached.width-w*fit)/2,dy=(cached.height-h*fit)/2;
  cached.getContext('2d').drawImage(source,left,top,w,h,dx,dy,w*fit,h*fit);
  if(portraits.size>=MAX_PORTRAITS)portraits.delete(portraits.keys().next().value);portraits.set(key,cached);
 }
 portraits.delete(key);portraits.set(key,cached);canvas.width=canvas.height=Math.max(1,Math.round(size*dpr));canvas.getContext('2d').drawImage(cached,0,0,canvas.width,canvas.height);
}
export function renderAnimalIcon(node,id,size=40){
 id=animal(id).id;const key=`${id}|${size}|${Math.min(globalThis.devicePixelRatio||1,2)}`;if(node.dataset.portraitKey===key&&node.firstChild)return;
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');paintAnimalPortrait(canvas,id,size);node.replaceChildren(canvas);node.dataset.animalIcon=id;node.dataset.portraitKey=key;node.classList.add('animal-portrait');node.style.setProperty('--animal-icon-size',`${size}px`);
}

export function paintCompanionPortrait(canvas,id,size=120){const painter=new RiverScene(canvas);painter.resize(size,size);painter.paintRiverCompanion(size/2,size/2,size/100,id);}
