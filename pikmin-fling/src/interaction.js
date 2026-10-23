import {COUNTS} from './game.js';

export const TYPES=Object.freeze(['red','yellow','blue','white','rock','winged']);
export const TYPE_NAMES={red:'Red',yellow:'Yellow',blue:'Blue',white:'White',rock:'Rock',winged:'Winged'};

export function createRoster(count,random=Math.random) {
  if(!COUNTS.includes(count))throw new RangeError('Unsupported Pikmin count.');
  const slots=Array.from({length:40},(_,i)=>i);
  for(let i=slots.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]];}
  return slots.slice(0,count).map((slot,id)=>({id,slot,type:TYPES[Math.floor(random()*TYPES.length)]}));
}

export function isUpwardSwipe(from,to) {
  const up=from.y-to.y,side=Math.abs(to.x-from.x),duration=Math.max(1,to.t-from.t);
  return up>=14 && up>=side*.65 && (up>=24 || up/duration>=.18);
}

export function flightPoint(from,to,t) {
  const arc=Math.abs(to.y-from.y)*.28+90;
  return {x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t-4*arc*t*(1-t)};
}
