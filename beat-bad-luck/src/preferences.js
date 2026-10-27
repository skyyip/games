import {WEAPONS} from './catalog.js';
export const PREFERENCES_KEY='beat-bad-luck.preferences.v1';
const sections=['stories','challenges','layout','scenes','album'];
export function readPreferences(raw){
 const p={sound:true,voice:false,randomEvents:false,learned:[],section:'stories',positions:{}};
 try{const x=JSON.parse(raw);if(!x||x.version!==1)return p;if(typeof x.sound==='boolean')p.sound=x.sound;if(typeof x.voice==='boolean')p.voice=x.voice;if(typeof x.randomEvents==='boolean')p.randomEvents=x.randomEvents;
 p.learned=WEAPONS.filter(w=>Array.isArray(x.learned)&&x.learned.includes(w.id)).map(w=>w.id);if(sections.includes(x.section))p.section=x.section;
 for(const id of sections)if(Number.isFinite(x.positions?.[id]))p.positions[id]=Math.max(0,Math.min(100000,x.positions[id]));
 }catch{}return p;
}
export function createPreferences(){
 let storage;try{storage=localStorage;}catch{}let state;try{state=readPreferences(storage?.getItem(PREFERENCES_KEY));}catch{state=readPreferences(null);}
 return {get value(){return state;},update(next){state=readPreferences(JSON.stringify({version:1,...state,...next}));try{storage?.setItem(PREFERENCES_KEY,JSON.stringify({version:1,...state}));}catch{}return state;}};
}
