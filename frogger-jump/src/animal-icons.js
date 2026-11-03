import {RiverScene} from './scene.js';import {animal} from './animals.js';
// Shop previews and small icons share the same pose and drawing code.
export function paintAnimalPortrait(canvas,id,size=120){
 const painter=new RiverScene(canvas);painter.resize(size,size);painter.animal(size/2,size*103/120,size/120*1.25,animal(id).id,{});
}
export function renderAnimalIcon(node,id,size=40){
 id=animal(id).id;if(node.dataset.animalIcon===id&&node.firstChild)return;
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');paintAnimalPortrait(canvas,id,size);node.replaceChildren(canvas);node.dataset.animalIcon=id;node.classList.add('animal-portrait');node.style.setProperty('--animal-icon-size',`${size}px`);
}
