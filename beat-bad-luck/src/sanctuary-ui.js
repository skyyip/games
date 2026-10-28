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
 let display=document.querySelector('#player-level');if(!display){display=document.createElement('section');display.id='player-level';display.className='player-level';display.setAttribute('aria-labelledby','player-level-label');display.innerHTML='<div class="player-level-heading"><div class="player-level-primary"><b id="player-level-label" translate="no"></b></div><small id="player-level-name" translate="no"></small></div><progress max="1" value="0"></progress><small id="player-level-progress" translate="no"></small>';document.querySelector('.stall-wallet').append(display);}
 let badge=display.querySelector('.player-level-badge');if(!badge){badge=document.createElement('div');badge.className='player-level-badge';badge.setAttribute('role','img');display.querySelector('.player-level-primary').prepend(badge);}badge.hidden=false;badge.dataset.milestone=String(info.milestone);if(badge.dataset.level!==String(info.level)){badge.dataset.level=String(info.level);badge.innerHTML=levelBadgeArt(info.level);}badge.setAttribute('aria-label',`${info.level} · ${info.name[zh?0:1]}`);badge.title=badge.getAttribute('aria-label');
 display.querySelector('b').textContent=zh?`師傅等級 ${info.level} / 168`:`Master level ${info.level} / 168`;
 display.querySelector('#player-level-name').textContent=info.name[zh?0:1];display.style.setProperty('--level-label-hue',String((Math.floor(info.level/10)*27+12)%360));display.querySelector('progress').value=info.progress;display.querySelector('progress').setAttribute('aria-label',zh?'下一級功德進度':'Merit progress to the next level');
 display.querySelector('#player-level-progress').textContent=info.next===null?(zh?'168 級圓滿！全橋底都叫你師傅。':'Level 168! The whole flyover calls you Master.'):(zh?`累積 ${info.merit.toLocaleString(undefined,{maximumFractionDigits:2})} 功德 · 下級 ${info.next.toLocaleString(undefined,{maximumFractionDigits:2})} · 每 10 級晉升稱號`:`${info.merit.toLocaleString(undefined,{maximumFractionDigits:2})} merit · next ${info.next.toLocaleString(undefined,{maximumFractionDigits:2})} · new title every 10 levels`);
}
let criticalTimer;
export function clearCriticalHit(){
 clearTimeout(criticalTimer);
 document.querySelector('#beat-arena .critical-comic')?.remove();
 document.querySelector('#beat-arena .critical-flying-prop')?.remove();
 const paper=document.querySelector('#paper-doll');if(paper)paper.dataset.critical='1';
}
export function showCriticalHit(hit){
 const paper=document.querySelector('#paper-doll'),arena=document.querySelector('#beat-arena'),zone=document.querySelector('#hit-zone');paper.dataset.critical=String(hit.impactLevel);if(hit.impactLevel===1)return;
 clearCriticalHit();paper.dataset.critical=String(hit.impactLevel);
 const badge=document.createElement('span');badge.className='critical-comic critical-'+hit.impactLevel;badge.setAttribute('aria-hidden','true');badge.innerHTML=`<b>${hit.impactLevel}X</b>`;zone.append(badge);
 const prop=document.createElement('span');prop.className='critical-flying-prop critical-prop-'+hit.impactLevel;prop.setAttribute('aria-hidden','true');prop.textContent=hit.impactLevel===3?'👻':'⌣';arena.append(prop);
 criticalTimer=setTimeout(clearCriticalHit,1250);
}
