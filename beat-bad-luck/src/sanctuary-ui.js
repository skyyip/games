export {comicLuckyGlyph,recordMedal} from './celebration-art.js';
import {playerLevel,levelBadgeArt} from './player-level.js';
import {getLanguage} from '../../grid-rush/src/language.js';
let scrollSerial=0;
export function prepareScrollRegions(){
 for(const details of document.querySelectorAll('details:not(.preparation-step):not(.preparation-catalog):not(.skin-chooser):not(#my-stall)')){
  if(!details.querySelector(':scope > summary'))continue;
  let body=details.querySelector(':scope > .accordion-scroll');
  if(!body){body=document.createElement('div');body.className='accordion-scroll';const summary=details.querySelector(':scope > summary');summary.id ||= 'accordion-heading-'+(++scrollSerial);body.setAttribute('role','region');body.setAttribute('aria-labelledby',summary.id);body.tabIndex=0;for(const child of [...details.childNodes])if(child!==summary)body.append(child);details.append(body);}
 }
 for(const panel of document.querySelectorAll('[role=tabpanel]')){panel.classList.add('tab-scroll');panel.tabIndex=0;}
}
export function renderPlayerLevel(state){
 const zh=getLanguage()==='zh-Hant',info=playerLevel(state.merit);
 for(const portrait of document.querySelectorAll('.fong-intro .master-portrait')){let badge=portrait.querySelector('.player-level-badge');if(!badge){badge=document.createElement('div');badge.className='player-level-badge';badge.setAttribute('role','img');portrait.prepend(badge);}badge.hidden=false;badge.dataset.milestone=String(info.milestone);if(badge.dataset.level!==String(info.level)){badge.dataset.level=String(info.level);badge.innerHTML=levelBadgeArt(info.level);}badge.setAttribute('aria-label',`${info.level} · ${info.name[zh?0:1]}`);badge.title=badge.getAttribute('aria-label');}
 let display=document.querySelector('#player-level');if(!display){display=document.createElement('section');display.id='player-level';display.className='player-level';display.innerHTML='<div><b id="player-level-label" translate="no"></b><small id="player-level-name" translate="no"></small></div><progress max="1" value="0"></progress><small id="player-level-progress" translate="no"></small>';document.querySelector('.stall-wallet').append(display);}
 display.querySelector('b').textContent=zh?`師傅等級 ${info.level} / 168`:`Master level ${info.level} / 168`;
 display.querySelector('#player-level-name').textContent=info.name[zh?0:1];display.style.setProperty('--level-label-hue',String((Math.floor(info.level/10)*27+12)%360));display.querySelector('progress').value=info.progress;display.querySelector('progress').setAttribute('aria-label',zh?'下一級功德進度':'Merit progress to the next level');
 display.querySelector('#player-level-progress').textContent=info.next===null?(zh?'168 級圓滿！全橋底都叫你師傅。':'Level 168! The whole flyover calls you Master.'):(zh?`累積 ${info.merit.toLocaleString()} 功德 · 下級 ${info.next.toLocaleString()} · 每 10 級晉升稱號`:`${info.merit.toLocaleString()} merit · next ${info.next.toLocaleString()} · new title every 10 levels`);
}
let criticalTimer;
export function showCriticalHit(hit){
 const paper=document.querySelector('#paper-doll'),arena=document.querySelector('#beat-arena'),feedback=document.querySelector('#hit-feedback');clearTimeout(criticalTimer);paper.dataset.critical=String(hit.impactLevel);feedback.querySelector('.critical-comic')?.remove();arena.querySelector('.critical-flying-prop')?.remove();if(hit.impactLevel===1)return;
 const zh=getLanguage()==='zh-Hant',badge=document.createElement('span');badge.className='critical-comic critical-'+hit.impactLevel;badge.innerHTML=`<b>${hit.impactLevel}X</b><span></span>`;badge.querySelector('span').textContent=(hit.impactLevel===3?(zh?'靈魂彈出嚟！×2':'Soul off duty! ×2'):(zh?'假牙笑甩！×1.5':'Denture launch! ×1.5'))+` · +${hit.points}`;feedback.replaceChildren(badge);
 const prop=document.createElement('span');prop.className='critical-flying-prop critical-prop-'+hit.impactLevel;prop.setAttribute('aria-hidden','true');prop.textContent=hit.impactLevel===3?'👻':'⌣';arena.append(prop);
 criticalTimer=setTimeout(()=>{badge.remove();prop.remove();paper.dataset.critical='1';if(!feedback.textContent.trim())feedback.textContent=zh?'自由出招，繼續拍散衰氣！':'Whack freely. Keep it going!';},1250);
}
