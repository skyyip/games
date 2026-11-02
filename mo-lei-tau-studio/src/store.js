import {create} from 'zustand';
import {fresh,hydrate,apply,SAVE_KEY} from './game.js';
let initial,persistent=true,closeTimer;try{initial=hydrate(localStorage.getItem(SAVE_KEY));}catch{initial=fresh();persistent=false;}
export const useGame=create((set,get)=>({state:initial,persistent,toast:null,modal:null,closing:false,sound:false,cloudStatus:'local',busy:false,
 dispatch(action){try{const {state,notice}=apply(get().state,action);let saved=get().persistent;try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{saved=false;}set({state,persistent:saved,toast:notice?{text:notice,id:Date.now()}:null});return state;}catch(error){set({toast:{text:error.message,id:Date.now()}});return null;}},
 notify(text){set({toast:{text,id:Date.now()}});},open(modal){clearTimeout(closeTimer);set({modal,closing:false});},close(){if(get().closing)return;set({closing:true});const delay=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches?0:180;closeTimer=setTimeout(()=>set({modal:null,closing:false}),delay);},toggleSound(){set({sound:!get().sound});},reset(){const state=fresh();try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{}set({state,modal:null});}
}));
