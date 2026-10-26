import {SECRET_WEAPONS} from './ritual-rewards.js';
import {weaponArt,dollArt} from './art.js';
import {currentKitStep,kitAimTarget,kitBeatCue,assistedKitStroke,appendKitSample} from './kit-gestures.js';
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nest=(art,x,y,w,h)=>art.replace('<svg ',`<svg x="${x}" y="${y}" width="${w}" height="${h}" `);
const props={
 'bare-hand':'<path d="m33 105 15-12 14 15m190-3-15-12-14 15" fill="none" stroke="#efc6a1" stroke-width="10"/><path d="m43 70 6 9m-20 8 10 2m205-19-6 9m20 8-10 2" stroke="#efd18d" stroke-width="3"/>',
 'chalk-eraser':'<rect x="17" y="15" width="266" height="66" rx="7" fill="#32554a" stroke="#b4bda0"/><text x="44" y="54" font-size="30" fill="#f0dfaa">OT × 999</text><path d="m194 32 54 28m-54 0 54-28" stroke="#fff1c0" stroke-width="4"/>',
 spanner:'<g fill="none" stroke="#bec6b0" stroke-width="6"><circle cx="43" cy="67" r="23"/><path d="M43 34v15m0 36v15M10 67h15m36 0h15m-57-23 12 12m25 23 12 12m0-47-12 12M31 79 19 91"/></g><path d="M43 56v22m-11-11h22" stroke="#efd58c" stroke-width="5"/>',
 paper:'<path d="M20 20h260v59H20Z" fill="#e6d9b4" stroke="#bca67c"/><path d="M34 35h100m-100 14h223m-223 13h190" stroke="#7c8469" stroke-width="6"/><text x="176" y="39" fill="#985c47" font-size="12">EXTRA!</text>',
 bag:'<path d="m218 115 60 4-8 91-61-4Z" fill="#a87665" stroke="#e0c28e" stroke-width="3"/><path d="m222 118 5-21 35 2 6 21" fill="none" stroke="#ecd7ad" stroke-width="7"/><path d="m216 137 59 3m-60 22 59 3m-59 22 57 3" stroke="#e8d7ba" stroke-width="7"/><path d="m231 121-5 85m27-84-4 85" stroke="#81a5b2" stroke-width="7"/>',
 stool:'<path d="m49 142 38 66m-10-67-35 66m171-66 38 66m-10-67-35 66" stroke="#adbbb4" stroke-width="7"/><path d="M36 137h57m109 0h57" stroke="#e0b878" stroke-width="11" stroke-linecap="round"/>',
 sword:'<path d="M22 19h48v105H22Z" fill="#edcf87" stroke="#bc8e55"/><path d="m32 35 27 3-22 20 22 9-28 17m12-53v74" stroke="#ab5d49" stroke-width="4" fill="none"/>',
 stamp:'<g fill="none" stroke="#c8785a" stroke-width="3"><rect x="20" y="22" width="70" height="48" rx="4"/><rect x="210" y="58" width="70" height="48" rx="4"/><path d="m29 35 52 22m-52 0 52-22m139 37 52 22m-52 0 52-22"/></g>',
 mace:'<g fill="#f0d28e" stroke="#a76a50" stroke-width="2"><path d="m27 19 25 14-25 14Z"/><path d="m254 35 25 14-25 14Z"/><path d="m28 153 25 14-25 14Z"/></g><path d="M37 33h9m218 16h9m-236 118h9" stroke="#8c5d48" stroke-width="3"/>',
 record:'<circle cx="54" cy="68" r="42" fill="#273936" stroke="#a3b3a4" stroke-width="4"/><circle cx="54" cy="68" r="28" fill="none" stroke="#738f7b"/><circle cx="54" cy="68" r="13" fill="#d4a77b"/><path d="m18 144 45-10m-45 30 63-13" stroke="#d2c197" stroke-width="4"/>',
 pinwheel:'<path d="M16 43q42-24 72 0m-72 20q33-21 61-1m155 84q28-19 53-3m-50 21 41-8" fill="none" stroke="#c0d6bd" stroke-width="4" stroke-linecap="round"/><path d="m240 30 25 11-27 40-24-22Z" fill="#e0b38a" stroke="#af7860" stroke-width="2"/>',
 'iron-hammer':'<path d="M20 176h260v28H20Z" fill="#c6a174" stroke="#866648" stroke-width="4"/><path d="m87 182 13 10-18 10m125-20-15 10 18 10" fill="none" stroke="#795d48" stroke-width="3"/>',
 'fortune-child':'<path d="m22 175 14-11 16 14-10 22-17-7Zm228-11 19 10-4 23-17 6-11-22Z" fill="#e2bd82" stroke="#8ca896" stroke-width="3"/><circle cx="39" cy="153" r="5" fill="#edd18f"/><circle cx="255" cy="151" r="5" fill="#edd18f"/>',
 'hairdryer-shaver':'<path d="M25 92Q5 13 60 13q45 2 27 72l-13-29-19-24-8 36Z" fill="#b79b76" stroke="#76614c" stroke-width="3"/><path d="m219 38 56-13m-56 31 52-9" stroke="#accdbd" stroke-width="4"/>',
 'pepper-spray':'<g fill="#b4ccb2" opacity=".65"><circle cx="39" cy="56" r="20"/><circle cx="62" cy="46" r="24"/><circle cx="84" cy="66" r="22"/><circle cx="33" cy="140" r="17"/><circle cx="260" cy="49" r="24"/></g><path d="m30 46 22 9m190-13 22 9" stroke="#668e7c" stroke-width="3"/>',
 'pork-cleaver':'<rect x="18" y="151" width="264" height="58" rx="17" fill="#b99060" stroke="#805c40" stroke-width="4"/><path d="M74 160v39m76-39v39m76-39v39" stroke="#f0ce8c" stroke-width="3" stroke-dasharray="5 5"/>',
 'meteor-hammer':'<ellipse cx="150" cy="100" rx="126" ry="78" fill="none" stroke="#b8c7b0" stroke-width="3" stroke-dasharray="8 8"/><circle cx="38" cy="67" r="21" fill="#b6c6bd" stroke="#647e77" stroke-width="4"/><path d="m31 60 14 14m0-14-14 14" stroke="#e8d6aa" stroke-width="3"/>',
 'overlord-spear':'<path d="M20 93h260" stroke="#c8aa75" stroke-width="8"/><g fill="#efdab1" stroke="#a88259" stroke-width="3"><circle cx="65" cy="93" r="18"/><circle cx="150" cy="93" r="18"/><circle cx="235" cy="93" r="18"/></g>',
 'fish-gut-sword':'<path d="M18 17h76l-5 99-35 26-32-28Z" fill="#7c9a8b" stroke="#ced1ae" stroke-width="4"/><path d="m33 49 43 14m-43 4 36 12" stroke="#cbd5b5" stroke-width="3"/><path d="m226 22 45 23-45 23 9-23Z" fill="#d0b794" stroke="#84715a" stroke-width="3"/><circle cx="259" cy="43" r="3" fill="#4d5f54"/>',
 'jing-ke-dagger':'<path d="M18 19h264v52H18Z" fill="#eadab0" stroke="#b29160" stroke-width="3"/><path d="M20 16v58m260-58v58" stroke="#a87c4e" stroke-width="10"/><path d="M40 32h216m-216 17h188" stroke="#a8aa87" stroke-width="4"/>',
 'scholar-sword':'<path d="M17 18h80v122H17Z" fill="#ecdeb5" stroke="#ba9a69"/><path d="M29 42h55m-55 24h55m-55 24h55" stroke="#819278" stroke-width="4"/><path d="m31 54 49-15M31 78l49-15" stroke="#bf7056" stroke-width="3"/>',
 'smiling-half-step':'<path d="m24 171 19-12 22 17-8 29-25-6Z" fill="#d6bd8d" stroke="#86674b" stroke-width="3"/><path d="m235 39 13-10 12 10m-23 9q11 12 23 0" fill="none" stroke="#e5bd80" stroke-width="4"/>',
 'one-day-powder':'<g fill="#efddaf" stroke="#b59463" stroke-width="3"><path d="M18 65q3-51 43-40 26 10 23 40Z"/><path d="M224 60q3-51 43-40 26 10 23 40Z"/><path d="M22 193q3-51 43-40 26 10 23 40Z"/></g><path d="m43 34 4 20m205-25 4 20M47 162l4 20" stroke="#cfb17e" stroke-width="3"/>',
 'cotton-palm':'<path d="M23 190q12-67 56-64 32 4 35 64Z" fill="#e5c99d" stroke="#b79369" stroke-width="3"/><path d="m35 177 58-5m-56 13 52-5" stroke="#f5e2b6" stroke-width="4"/>',
 'oboi-guillotine':'<path d="M210 67q0-51 40-51t40 51Z" fill="#c2c9bb" stroke="#788b7c" stroke-width="4"/><path d="M215 70h70" stroke="#e5c382" stroke-width="8"/><path d="m230 19-4-11m24 8V2m20 17 5-12" stroke="#d6dfc6" stroke-width="3"/>',
 'thunder-beads':'<g fill="#d5c385" stroke="#9f8758" stroke-width="3"><circle cx="43" cy="48" r="19"/><circle cx="257" cy="60" r="19"/><circle cx="42" cy="172" r="19"/></g><path d="m37 36 8 10-9 9m207-16 8 10-9 9M36 161l8 10-9 9" fill="none" stroke="#f6e3a4" stroke-width="4"/>',
 'triple-trio':'<path d="M15 158h270m-270 17h270m-270 17h270" stroke="#9fbc98" stroke-width="3"/><path d="m238 138 12 9 14-12 13 10" fill="none" stroke="#edd093" stroke-width="5"/><path d="M268 125v75" stroke="#d4bd8d" stroke-width="3"/>',
 'fire-wheels':'<g fill="none" stroke="#dbac76" stroke-width="7"><circle cx="48" cy="158" r="33"/><circle cx="253" cy="156" r="33"/></g><path d="m17 150-12-19 27 9m191 7-10-22 30 12" fill="#d39577"/>',
 'marksix-snowball':'<g fill="#e8c47e" stroke="#ad8755" stroke-width="3"><circle cx="45" cy="52" r="26"/><circle cx="255" cy="52" r="26"/><circle cx="46" cy="174" r="26"/></g><g font-size="24" text-anchor="middle" fill="#8d6950"><text x="45" y="61">6</text><text x="255" y="61">8</text><text x="46" y="183">9</text></g>',
 'royal-salted-fish':'<path d="m18 41 52-20 27 25-27 23-52-19 9-5Z" fill="#d0bc98" stroke="#887155" stroke-width="3"/><circle cx="77" cy="43" r="4" fill="#4b5d53"/><path d="m15 113 64-13m-59 35 63-13m139-84 59 12" stroke="#b6cdb8" stroke-width="4"/>',
 'prank-box':'<path d="M17 149h81v57H17Zm184 0h81v57h-81Z" fill="#bb9270" stroke="#e5c38c" stroke-width="3"/><path d="m27 147 8-22 12 21 12-24 12 22 13-21" fill="none" stroke="#d6c894" stroke-width="4"/><text x="240" y="188" fill="#edd7a5" font-size="30">?</text>',
 'peace-pistol':'<g fill="none" stroke="#cfdaad" stroke-width="3"><circle cx="49" cy="57" r="28"/><path d="M49 29v56m0-28L29 77m20-20 20 20"/></g><path d="M251 28v76m0-74 34 9-34 13" fill="#e4cc8f" stroke="#bb9a63" stroke-width="3"/>',
 'ufo-rifle':'<ellipse cx="150" cy="25" rx="75" ry="16" fill="#97b4aa" stroke="#cdd6b7" stroke-width="4"/><path d="M111 23q1-40 39-40t39 40" fill="#b9d4c0" stroke="#6b9288" stroke-width="3"/><path d="m120 37-37 121m97-121 37 121" stroke="#cfe3b777" stroke-width="6"/>',
 'gadget-3000':'<path d="M17 140h70v61H17Z" fill="#899f8c" stroke="#d4c28d" stroke-width="3"/><path d="m27 155 14 11-11 14m24-25 14 11-11 14" fill="none" stroke="#e4c58c" stroke-width="4"/><path d="m224 35 16 18-15 17 17 18" stroke="#b7c8b5" stroke-width="7" fill="none"/>',
 'eiffel-flip':'<path d="m36 201 27-151 28 151m-47-45h39M51 115h25M31 200h65M63 50V29" fill="none" stroke="#c6b38c" stroke-width="5"/><path d="m241 54 24-13-2 27m-1-24q-29 1-29 26" fill="none" stroke="#dfca8a" stroke-width="4"/>',
 'purple-green-sword':'<path d="M40 68c-41-24-26-59 0-39 28-20 43 15 0 39M256 95c-41-24-26-59 0-39 28-20 43 15 0 39" fill="#d2a9c1" stroke="#a987a0" stroke-width="2"/><path d="m27 159 51-54m144 57 53-56" stroke="#adcfb0" stroke-width="5"/>',
 'golden-headband':'<ellipse cx="151" cy="35" rx="58" ry="19" fill="none" stroke="#dec079" stroke-width="9"/><path d="m130 33 9-7m30 7-9-7" stroke="#fff0bc" stroke-width="3"/><path d="M28 145h64v40H28Z" fill="#d2bc8e"/><text x="39" y="172" fill="#826a50" font-size="16">…?</text>',
 lassie:'<path d="m16 166 12-23 24-2 21 17-7 32-38 2Z" fill="#d7b78b" stroke="#8d7051" stroke-width="3"/><path d="m23 143-8-13-1 31m44-18 18-13-5 31" fill="#a37e5b"/><circle cx="30" cy="160" r="3" fill="#475b4b"/><circle cx="52" cy="160" r="3" fill="#475b4b"/><path d="m35 172 10 1-5 7Z" fill="#6a5541"/><path d="m228 54 13-14 19 8m-32 23 18-10 19 8" stroke="#d3c18e" stroke-width="4" fill="none"/>',
 'rebirth-paper':'<rect x="18" y="18" width="70" height="112" rx="4" fill="#ecd9aa" stroke="#b89460" stroke-width="3"/><path d="M29 41h46m-46 19h46m-46 19h46" stroke="#acaa82" stroke-width="4"/><path d="m222 43-6-26 17 11 15-23 15 23 17-11-6 26Z" fill="#dfbf75" stroke="#a68750" stroke-width="3"/>'
};
const choiceIcons={
 'bare-hand':['✋','合','🤚'],'fortune-child':['●','●','●'],'triple-trio':['①','②','③'],'marksix-snowball':['6','8','9'],'prank-box':['?','?','?'],'peace-pistol':['☮','☮','☮'],'smiling-half-step':['叮','☺','叮'],'scholar-sword':['✓','×','×'],'jing-ke-dagger':['卷','魚','✦'],'lassie':['●','●','⌁']
};
export function createExpandedKitUI({game,stage,act,local,announce}){
 let viewKey='',pointers=new Map(),samples=[],pinching=false,canvas=null;
 const active=()=>game.skill.active,spec=()=>game.skill.spec,step=()=>active()&&currentKitStep(spec(),active());
 const normalise=event=>{const r=canvas.getBoundingClientRect();return {x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};};
 const pathPoints=points=>points.map(p=>`${p[0]*300},${p[1]*220}`).join(' ');
 function secretPropArt(){const item=SECRET_WEAPONS.find(w=>w.id===game.weapon);return item?`<rect x="9" y="10" width="80" height="88" rx="14" fill="hsl(${item.secretIndex*27} 60% 75%)" stroke="#ffe9ad" stroke-width="3"/><text x="49" y="61" text-anchor="middle" font-size="37">${item.icon}</text><text x="49" y="84" text-anchor="middle" font-size="13" fill="#493b50">★ ${item.secretIndex+1}</text><path d="m226 15 7 14 15 2-11 10 3 15-14-7-13 7 3-15-11-10 15-2Z" fill="#ffe686"/>`:'';}
 function art(){return `<svg class="expanded-art" viewBox="0 0 300 220" aria-hidden="true"><path d="M0 203h300" stroke="#9c805f" stroke-width="12" opacity=".5"/><g class="expanded-props">${props[game.weapon]||secretPropArt()}</g><g class="expanded-paper">${nest(dollArt(game.kind,game.look),90,27,120,165)}</g><g class="expanded-tool">${nest(weaponArt(game.weapon),218,124,65,76)}</g></svg>`;}
 function guide(current){
  let body='';const color='#f0cf84';
  if(['swipe','rub','circle','trace','drag'].includes(current.type)){const path=assistedKitStroke(current);body+=`<polyline points="${pathPoints(path)}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="6 5" opacity=".8"/>`;if(current.type==='trace')body+=path.map((p,i)=>`<circle cx="${p[0]*300}" cy="${p[1]*220}" r="10" fill="#ead9ae" stroke="#866c4b"/><text x="${p[0]*300}" y="${p[1]*220+4}" text-anchor="middle" fill="#644d37" font-size="12.1">${i+1}</text>`).join('');if(current.type==='drag')body+=`<circle cx="${current.from[0]*300}" cy="${current.from[1]*220}" r="19" fill="#bcd6bb" stroke="#f4d793" stroke-width="3"/><text x="${current.from[0]*300}" y="${current.from[1]*220+5}" text-anchor="middle" fill="#3b6053" font-size="18">↗</text><circle cx="${current.to[0]*300}" cy="${current.to[1]*220}" r="24" fill="#e5d39833" stroke="${color}" stroke-width="4" stroke-dasharray="5 4"/>`;}
  if(current.type==='hold')body+='<circle cx="150" cy="98" r="40" fill="#29483e77" stroke="#dcca98" stroke-width="3" stroke-dasharray="5 5"/>';
  if(current.type==='pinch')body+='<path d="M40 100h55m-14-13 14 13-14 13m179-13h-55m14-13-14 13 14 13" fill="none" stroke="#f3d58e" stroke-width="5" stroke-linecap="round"/><circle cx="150" cy="100" r="32" fill="none" stroke="#e2bd77" stroke-width="4"/>';
  return `<svg class="expanded-guide" viewBox="0 0 300 220" preserveAspectRatio="none" aria-hidden="true">${body}<polyline id="expanded-ink" points="" fill="none" stroke="#b3dddf" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
 }
 function controls(current){
  const duration=['hold','aim'].includes(current.type);return `<div class="kit-actions expanded-actions">${duration?`<button type="button" class="kit-target" data-expanded="begin"><small>${local(current.type==='hold'?'開始蓄力':'鎖定準星',current.type==='hold'?'Start hold':'Lock target')}</small></button><button type="button" class="kit-target" data-expanded="release"><small>${local('鬆手完成','Release')}</small></button>`:`<button type="button" class="kit-target" data-expanded="assist"><small>${escape(local(current.label[0],current.label[1]))}</small></button>`}</div>`;
 }
 function buildStep(){
  const current=step();if(!current)return;const signature=spec();stage.dataset.scene=game.weapon;stage.dataset.pose=signature.pose;
  const choices=['tap','beat'].includes(current.type)?[0,1,2].map(i=>`<button type="button" class="kit-target expanded-choice" data-expanded-choice="${i}" style="left:${17+i*33}%"><span aria-hidden="true">${choiceIcons[game.weapon]?.[i]||'✦'}</span><small>${local(['左','中','右'][i],['Left','Middle','Right'][i])}</small></button>`).join(''):'';
  stage.querySelector('.expanded-layer').innerHTML=`<button type="button" id="expanded-canvas" aria-label="${escape(local(current.label[0],current.label[1]))}">${art()}${guide(current)}<span class="expanded-caption" translate="no">${escape(local(signature.tag[0],signature.tag[1]))}</span><span class="expanded-cursor" aria-hidden="true" hidden>${weaponArt(game.weapon)}</span></button>${choices}<span class="expanded-aim" aria-hidden="true">◎</span><span class="expanded-meter" aria-hidden="true"></span>${controls(current)}`;
  canvas=stage.querySelector('#expanded-canvas');viewKey=game.skill.attempts+':'+active().progress+':'+local('中','EN');
 }
 function render(){
  if(!spec()?.steps)return;const a=active();if(!a)return;const key=game.skill.attempts+':'+a.progress+':'+local('中','EN');if(viewKey!==key){const focused=stage.contains(document.activeElement);cancel();buildStep();if(focused)stage.querySelector('[data-expanded="assist"],[data-expanded="begin"],[data-expanded-choice]')?.focus({preventScroll:true});announce(local(step().label[0],step().label[1]));}
  const current=step(),e=a.extra;const hint=document.querySelector('#kit-hint'),title=document.querySelector('#kit-title');const label=local(current.label[0],current.label[1]);if(hint.textContent!==label)hint.textContent=label;const heading=`${local(spec().name[0],spec().name[1])} ${a.progress+1}/${spec().steps.length}`;if(title.textContent!==heading)title.textContent=heading;
  stage.dataset.expandedGesture=current.type;stage.style.setProperty('--expanded-progress',a.progress/spec().steps.length);
  for(const b of stage.querySelectorAll('[data-expanded-choice]')){const cue=Number(b.dataset.expandedChoice)===current.target&&(current.type==='tap'||kitBeatCue(current,a,game.elapsed));if(cue&&b.dataset.cue!=='true'&&current.type==='beat')game.skill.cuePending=true;b.dataset.cue=String(cue);}
  const target=stage.querySelector('.expanded-aim');target.hidden=current.type!=='aim';if(current.type==='aim'){const t=kitAimTarget(a,game.elapsed);target.style.left=`${t.x*100}%`;target.style.top=`${t.y*100*(1-48/stage.clientHeight)}%`;}
  const meter=stage.querySelector('.expanded-meter');meter.hidden=!['hold','aim'].includes(current.type);if(!meter.hidden){const fraction=current.type==='hold'&&e.pointerAt!==null?(game.elapsed-e.pointerAt)/current.ms:e.aimMs/current.ms;meter.textContent=fraction>=1?local('鬆手！','Release!'):Math.max(0,Math.round(fraction*100))+'%';meter.dataset.ready=String(fraction>=1);}
 }
 function cancel(){const held=[...pointers.entries()];pointers.clear();samples=[];pinching=false;for(const [id,item]of held)try{item.element.releasePointerCapture(id);}catch{}if(canvas){canvas.classList.remove('is-drawing');const cursor=canvas.querySelector('.expanded-cursor');if(cursor)cursor.hidden=true;}}
 function press(button){if(!spec()?.steps||!active())return false;const current=step(),key=button.dataset.expanded;
  if(button.dataset.expandedChoice!==undefined){act('choice',{index:Number(button.dataset.expandedChoice)});return true;}
  if(button.id!=='expanded-canvas'&&!key)return false;
  if(key==='release'){act('gesture-release');return true;}
  if(key==='begin'||['hold','aim'].includes(current.type)){const t=kitAimTarget(active(),game.elapsed);act('gesture-begin',{x:t.x,y:t.y,assist:current.type==='aim'});return true;}
  if(['tap','beat'].includes(current.type))act('choice',{index:current.target});
  else if(current.type==='pinch'){act('pinch-start',{distance:.7});act('pinch',{distance:.3});}
  else{const shape=assistedKitStroke(current),origin=shape[0];act('gesture-begin',{x:origin[0],y:origin[1]});act('gesture-stroke',{points:shape});}
  return true;
 }
 stage.addEventListener('pointerdown',event=>{
  if(!spec()?.steps||!active()||game.pausedAt!==null||event.button!==0||event.target.closest('button')?.id!=='expanded-canvas')return;
  event.preventDefault();event.stopImmediatePropagation();const p=normalise(event);pointers.set(event.pointerId,{...p,element:canvas});canvas.setPointerCapture(event.pointerId);canvas.classList.add('is-drawing');const current=step();
  if(current.type==='pinch'&&pointers.size===2){const [a,b]=[...pointers.values()];pinching=true;act('pinch-start',{distance:Math.hypot(a.x-b.x,a.y-b.y)});return;}
  if(pointers.size!==1)return;samples=[p];if(!['tap','beat','pinch'].includes(current.type))act('gesture-begin',p);
 },true);
 stage.addEventListener('pointermove',event=>{
  if(!pointers.has(event.pointerId)||!active())return;event.preventDefault();event.stopImmediatePropagation();const p=normalise(event),previous=pointers.get(event.pointerId);pointers.set(event.pointerId,{...p,element:previous.element});
  if(pointers.size>1)return;samples=appendKitSample(samples,p);const ink=canvas.querySelector('#expanded-ink');if(ink)ink.setAttribute('points',samples.map(t=>`${t.x*300},${t.y*220}`).join(' '));const cursor=canvas.querySelector('.expanded-cursor');cursor.hidden=false;cursor.style.left=`${p.x*100}%`;cursor.style.top=`${p.y*100}%`;if(step().type==='aim')act('gesture-move',p);
 },true);
 stage.addEventListener('pointerup',event=>{
  if(!pointers.has(event.pointerId)||!active())return;event.preventDefault();event.stopImmediatePropagation();const current=step(),p=normalise(event);
  if(current.type==='pinch'){let span=null;if(pinching&&pointers.size===2){pointers.set(event.pointerId,{...p,element:canvas});const [a,b]=[...pointers.values()];span=Math.hypot(a.x-b.x,a.y-b.y);}cancel();if(span!==null)act('pinch',{distance:span});return;}
  const points=[...samples,p];cancel();if(['hold','aim'].includes(current.type))act('gesture-release');else if(!['tap','beat'].includes(current.type))act('gesture-stroke',{points});
 },true);
 stage.addEventListener('pointercancel',()=>{if(spec()?.steps){cancel();game.skill.cancelPointer();}},true);
 return {build(){viewKey='';return '<div class="expanded-layer"></div>';},render,press,cancel,normalHit(){
  if(!spec()?.steps)return;const paper=document.querySelector('#paper-doll');paper.dataset.kit=game.weapon;let badge=paper.querySelector('.expanded-passive');if(!badge){badge=document.createElement('span');badge.className='expanded-passive';badge.setAttribute('aria-hidden','true');badge.innerHTML=weaponArt(game.weapon);paper.append(badge);}badge.dataset.pose=spec().pose;
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&(game.hits%3===0||game.hits===1)){const effects=document.querySelector('#effects');for(const old of [...effects.querySelectorAll('.expanded-echo')].slice(2))old.remove();const echo=document.createElement('span');echo.className='expanded-echo';echo.dataset.pose=spec().pose;echo.innerHTML=weaponArt(game.weapon);effects.append(echo);setTimeout(()=>echo.remove(),650);}
 }};
}
