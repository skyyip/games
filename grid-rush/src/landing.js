import {readFavourites,saveFavourites,toggleFavourite} from './favourites.js';
import {reducedMotion} from './playground-ui.js';

const grid=document.querySelector('.grid');
const cards=new Map([...grid.querySelectorAll('.game-card')].map(card=>[card.dataset.game,card]));
const moves=new Set(),stars=new Map();
let storage,revision=0;
try{storage=window.localStorage;}catch{/* Favourites still work for this visit. */}
let {state}=readFavourites(storage,[...cards.keys()]);

function cancelMoves() {
  for(const animation of moves)animation.cancel();
  moves.clear();
}

function render(animate=false) {
  const before=new Map([...cards.values()].map(card=>[card,card.getBoundingClientRect()]));
  cancelMoves();
  const focused=document.activeElement;
  for(const id of state.order) {
    const card=cards.get(id),button=card.querySelector('.favourite-button');
    const selected=state.favourites.includes(id),name=card.querySelector('h2').textContent;
    button.disabled=false;button.setAttribute('aria-pressed',String(selected));
    button.title=`${selected?'Remove':'Add'} ${name} ${selected?'from':'to'} favourites`;
    grid.append(card);
  }
  if(focused?.matches('.favourite-button'))focused.focus({preventScroll:true});
  if(!animate || reducedMotion.matches)return [];
  // Animate the wrapper; the card's existing parallax surface stays independent.
  const after=new Map([...cards.values()].map(card=>[card,card.getBoundingClientRect()]));
  const pending=[];
  for(const [card,first] of before) {
    const last=after.get(card),x=first.left-last.left,y=first.top-last.top;
    if(!x && !y && first.height===last.height)continue;
    const animation=card.animate([
      {transform:`translate(${x}px,${y}px) scale(${first.width/last.width},${first.height/last.height})`},
      {transform:'translate(0,0) scale(1)'},
    ],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
    moves.add(animation);
    pending.push(animation.finished.catch(()=>{}).finally(()=>moves.delete(animation)));
  }
  return pending;
}

function animateStar(button,selected) {
  for(const animation of stars.get(button)||[])animation.cancel();
  if(reducedMotion.matches)return;
  const icon=button.querySelector('svg'),rays=button.querySelector('.star-rays');
  const iconAnimation=icon.animate(selected?[
    {transform:'scale(.65) rotate(-25deg)'},{transform:'scale(1.28) rotate(12deg)',offset:.55},{transform:'scale(1) rotate(0)'},
  ]:[
    {transform:'scale(1) rotate(0)'},{transform:'scale(.7) rotate(-16deg)',offset:.35},{transform:'scale(1.08) rotate(5deg)',offset:.75},{transform:'scale(1) rotate(0)'},
  ],{duration:selected?420:320,easing:'cubic-bezier(.2,.8,.2,1)'});
  const active=[iconAnimation];
  if(selected)active.push(rays.animate([{opacity:0,transform:'scale(.65)'},{opacity:1,offset:.25},{opacity:0,transform:'scale(1.45)'}],{duration:420,easing:'ease-out'}));
  stars.set(button,active);
  Promise.allSettled(active.map(animation=>animation.finished)).then(()=>{if(stars.get(button)===active)stars.delete(button);});
}

grid.addEventListener('click',async event=>{
  const button=event.target.closest('.favourite-button');
  if(!button)return;
  const card=button.closest('.game-card'),id=card.dataset.game,current=++revision;
  state=toggleFavourite(state,id);
  const saved=saveFavourites(storage,state),selected=state.favourites.includes(id);
  const pending=render(true);
  animateStar(button,selected);
  document.querySelector('#favourite-announcement').textContent=`${card.querySelector('h2').textContent} ${selected?'added to favourites and moved to the start':'removed from favourites and moved to the end'}.${saved?'':' Saved for this visit.'}`;
  await Promise.allSettled(pending);
  if(current===revision && document.activeElement===button && event.detail===0)button.scrollIntoView({block:'nearest',behavior:reducedMotion.matches?'auto':'smooth'});
});

function cancelAnimations() {
  cancelMoves();
  for(const active of stars.values())for(const animation of active)animation.cancel();
  stars.clear();
}
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)cancelAnimations();});
window.addEventListener('resize',cancelMoves);
window.addEventListener('pagehide',cancelAnimations);
render();
