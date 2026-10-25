import { TYPES } from './characters.js';

const CROWN_SCALE=1.32;

const colors={red:['#e95b4d','#a94038'],yellow:['#f3d166','#a98c32'],blue:['#67a7e2','#3f6eaa'],
  ice:['#a6e1ef','#659eaf'],rock:['#8a929a','#505d69'],winged:['#eda1bd','#b56e92'],white:['#faf8e9','#a6b2a2'],purple:['#c5a3e1','#806295'],glow:['#b2f16f','#6ba548']};

function limb(kind,side,fill,outline,bracelet=false) {
  const leg=kind==='leg',left=side==='left',middle=side==='middle',x=leg?(middle?32:left?24:40):(left?17:47);
  const y=leg?68:49,tipX=leg?(middle?32:left?23:41):(bracelet?(left?6:58):(left?10:54)),tipY=leg?(middle?80:77):(bracelet?60:59);
  return `<g class="rig-${kind} rig-${kind}-${side}" style="transform-origin:${x}px ${y}px">
    <path d="M${x} ${y}Q${x} ${tipY-4} ${tipX} ${tipY}" fill="none" stroke="${outline}" stroke-width="5" stroke-linecap="round"/>
    <path d="M${x} ${y}Q${x} ${tipY-4} ${tipX} ${tipY}" fill="none" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="${tipX+(middle?0:left?-1:1)}" cy="${tipY}" rx="${leg?4:2.7}" ry="2.2" fill="${fill}" stroke="${outline}" stroke-width="1"/>
    ${bracelet?`<g class="rig-bracelet" transform="translate(${left?9:55} 58.7) rotate(${left?58:-58})"><ellipse rx="3.5" ry="1.9" fill="#ffdc82" stroke="#9c714b" stroke-width=".85"/><path d="M-2-.5Q0-1.7 2-.5" fill="none" stroke="#fff4cf" stroke-width=".8" stroke-linecap="round"/><circle cx="-1.8" r="1" fill="#f5adc7"/><circle cy=".5" r="1" fill="#fff4d1"/><circle cx="1.8" r="1" fill="#b1e7dd"/><path d="M0 3C-3 0-4 3 0 5C4 3 3 0 0 3Z" fill="#f1a6c1" stroke="#ac7394" stroke-width=".5"/></g>`:''}
  </g>`;
}

function glowMarkup(growth,sprout){
  const [fill,outline]=colors.glow;
  const arms=['left','right'].map(side=>{const left=side==='left',x=left?26:38,tip=left?17:47;return `<g class="rig-arm rig-arm-${side}" style="transform-origin:${x}px 57px"><path d="M${x} 57Q${left?24:40} 63 ${tip} 68" fill="none" stroke="${outline}" stroke-width="3.8" stroke-linecap="round"/><path d="M${x} 57Q${left?24:40} 63 ${tip} 68" fill="none" stroke="${fill}" stroke-width="2.4" stroke-linecap="round"/><path d="M${tip} 68l${left?-3:3} 2m${left?3:-3}-2-1 4m1-4 2 3" fill="none" stroke="${outline}" stroke-width=".9" stroke-linecap="round"/></g>`;}).join('');
  return `<svg class="pikmin-art" viewBox="0 0 64 88" aria-hidden="true" focusable="false" data-sprite="glow" data-stage="${growth}">
    <g class="rig-motion"><g class="rig-glow-aura" fill="#d5ffa5" opacity=".6"><ellipse cx="32" cy="46" rx="23" ry="28" opacity=".28"/><ellipse cx="31" cy="45" rx="17" ry="22" opacity=".2"/></g>
      <g class="rig-body">${arms}
        <g class="rig-glow-tail"><path d="M27 68C26 78 32 84 43 78C37 79 36 74 36 69Z" fill="${fill}" stroke="${outline}" stroke-width="1.3" stroke-linejoin="round"/></g>
        <path d="M27 54C22 59 23 68 27 71C30 74 35 73 38 69C42 63 37 57 36 54Z" fill="${fill}" stroke="${outline}" stroke-width="1.5"/>
        <ellipse cx="29" cy="63" rx="4" ry="7" fill="#f1ffd8" opacity=".2"/>
        <g class="rig-belly-stripes" fill="#59634e" opacity=".9"><path class="rig-belly-stripe" d="M24.5 58.5Q32 60.5 39 58.5L39.3 61.3Q32 63.3 24.5 61.3Z"/><path class="rig-belly-stripe" d="M24.8 65Q32 67 38.8 65L37.4 67.8Q32 69.5 26 67.8Z"/></g>
        <path class="rig-glow-head" d="M32 22C29 26 18 28 15 40C12 52 21 57 32 56C43 57 52 52 49 40C46 28 35 26 32 22Z" fill="${fill}" stroke="${outline}" stroke-width="1.5" stroke-linejoin="round"/>
        <path d="M20 37Q23 30 29 28" fill="none" stroke="#f0ffd4" stroke-width="3" stroke-linecap="round" opacity=".55"/>
        <g class="rig-eyes"><ellipse cx="25" cy="41" rx="6.5" ry="7" fill="#3954df"/><ellipse cx="39" cy="41" rx="4.4" ry="4.9" fill="#3954df"/><g class="rig-pupils" fill="#84fff1"><ellipse cx="24" cy="40" rx="3.2" ry="3.7"/><circle cx="38" cy="40" r="1.2"/></g></g>
        <path d="M29 50Q32 52.5 35 50" fill="none" stroke="#629548" stroke-width="1.1" stroke-linecap="round"/>
        <g class="rig-glow-halo" transform="rotate(-7 32 20)"><ellipse class="halo-bloom" cx="32" cy="20" rx="13" ry="3" fill="none" stroke="#ffe8a1" stroke-width="3" opacity=".45"/><ellipse cx="32" cy="20" rx="12.5" ry="2.6" fill="none" stroke="#d6b65c" stroke-width="1.1" opacity=".55"/><path d="M19.5 20a12.5 2.6 0 0 0 25 0" fill="none" stroke="#ffe9a4" stroke-width="1.5" stroke-linecap="round"/></g>
        <g class="rig-sprout"><path d="${growth==='bud'?`M32 25V${10+7*CROWN_SCALE}`:'M32 25Q30 17 32 10'}" fill="none" stroke="#75b940" stroke-width="2.4" stroke-linecap="round"/><g class="rig-crown" transform="translate(32 10) scale(${CROWN_SCALE}) translate(-32 -10)">${sprout}</g></g>
      </g>
    </g>
  </svg>`;
}

export function spriteMarkup(type,growth) {
  if(!TYPES.includes(type)||!['leaf','bud','flower'].includes(growth))throw new RangeError('Unknown character sprite');
  const [fill,outline]=colors[type],winged=type==='winged',rock=type==='rock',white=type==='white';
  const slim=type==='red'||type==='blue'||winged;
  // Rounded silhouettes share the same rig; slim types keep their facial features.
  const head=rock?'M23 24L41 25L51 38L49 59L42 70L25 73L14 62L12 40Z':
    type==='purple'?'M32 23C46 23 51 31 51 40C51 45 48 48 46 50C55 57 55 69 43 73C37 75 27 75 21 73C9 69 9 57 18 50C16 48 13 45 13 40C13 31 18 23 32 23Z':
    type==='ice'?'M23 24L41 24L50 37L46 49L50 63L42 72L22 72L14 63L18 49L14 37Z':
    slim?'M32 23C42 23 47 30 47 39C47 44 45 47 43 49C48 56 49 67 40 71C35 73 29 73 24 71C15 67 16 56 21 49C19 47 17 44 17 39C17 30 22 23 32 23Z':
    white?'M32 24C47 24 49 42 43 49C50 55 50 66 41 70C36 72 28 72 23 70C14 66 14 55 21 49C15 42 17 24 32 24Z':
    'M32 23C44 23 49 30 49 39C49 44 47 47 45 49C51 55 53 67 42 71C36 73 28 73 22 71C11 67 13 55 19 49C17 47 15 44 15 39C15 30 20 23 32 23Z';
  const sprout=growth==='leaf'?'<path d="M31 15C14 17 15 4 15 4S30 1 31 15Z" fill="#85bc68" stroke="#568451" stroke-width="1.3"/>':
    growth==='bud'?'<ellipse cx="32" cy="10" rx="5.5" ry="7" fill="#fff2d2" stroke="#a7a27b" stroke-width="1.3"/>':
    type==='glow'?`<g fill="#ffe567" stroke="#d7b73b" stroke-width=".7">${[0,72,144,216,288].map(angle=>`<path d="M31 8C26 5 28 0 32-1C36 1 36 5 33 8Z" transform="rotate(${angle} 32 9)"/>`).join('')}<circle cx="32" cy="9" r="3.1" fill="#f2c33f" stroke="none"/></g>`:
    `<g fill="${white||winged?'#f8d3e1':'#fffdf1'}" stroke="#b8b29e" stroke-width=".8">${[[32,3],[38,7],[36,14],[28,14],[26,7]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4.6" ry="4.2"/>`).join('')}<circle cx="32" cy="9" r="3.1" fill="#f3cc66" stroke="none"/></g>`;
  if(type==='glow')return glowMarkup(growth,sprout);
  const wings=winged?`<g class="rig-wings" fill="#f8ffffe8" stroke="#b0c5ce" stroke-width="1.2">
    <path class="rig-wing rig-wing-left" d="M24 48C6 47 4 23 13 24C21 25 26 36 24 48Z"/>
    <path class="rig-wing rig-wing-right" d="M40 48C58 47 60 23 51 24C43 25 38 36 40 48Z"/>
  </g>`:'';
  return `<svg class="pikmin-art" viewBox="0 0 64 88" aria-hidden="true" focusable="false" data-sprite="${type}" data-stage="${growth}">
    <g class="rig-motion">
      ${wings}${type==='yellow'?`<g class="rig-tail"><path d="M43 62C54 66 62 60 57 54C54 50 49 53 52 56" fill="none" stroke="${outline}" stroke-width="5.5" stroke-linecap="round"/><path d="M43 62C54 66 62 60 57 54C54 50 49 53 52 56" fill="none" stroke="${fill}" stroke-width="3.3" stroke-linecap="round"/></g>`:''}${limb('leg','left',fill,outline)}${limb('leg','right',fill,outline)}
      ${white?limb('leg','middle',fill,outline):''}
      <g class="rig-body">
        ${limb('arm','left',fill,outline,type==='purple')}${limb('arm','right',fill,outline,type==='purple')}
        ${type==='blue'?`<g class="rig-ears" stroke="${outline}" stroke-width="1.3"><g class="rig-ear-left" transform="translate(21 29) scale(.8) translate(-21 -29) rotate(-18 21 22)"><ellipse cx="21" cy="22" rx="4.8" ry="8" fill="${fill}"/><ellipse cx="21" cy="21.5" rx="2.5" ry="4.8" fill="#f4becb" stroke="none"/></g><g class="rig-ear-right" transform="translate(43 29) scale(.8) translate(-43 -29) rotate(18 43 22)"><ellipse cx="43" cy="22" rx="4.8" ry="8" fill="${fill}"/><ellipse cx="43" cy="21.5" rx="2.5" ry="4.8" fill="#f4becb" stroke="none"/></g></g>`:''}
        ${type==='yellow'?`<path d="M19 34C3 23 5 45 18 43M45 34C61 23 59 45 46 43" fill="${fill}" stroke="${outline}" stroke-width="1.4"/>`:''}
        <path d="${head}" fill="${fill}" stroke="${outline}" stroke-width="1.5" stroke-linejoin="round"/>
        <ellipse cx="29" cy="61" rx="${white?8:slim?8.5:10}" ry="7.5" fill="#fffdf1" opacity="${white?.5:.18}"/>
        ${type==='red'?`<g class="rig-navel" transform="translate(32 63) scale(1.35) translate(-32 -63)"><ellipse cx="32" cy="63" rx="2.4" ry="2.2" fill="#ffd0bd" opacity=".5"/><path d="M32.8 61.5C30.6 61 30.1 63.8 32.6 64.1" fill="none" stroke="${outline}" stroke-width="1.1" stroke-linecap="round"/></g>`:''}
        <path d="M21 33Q23 28 28 28" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".35"/>
        ${type==='ice'?'<path d="M24 26L31 44L16 38M31 44L48 63L40 70M31 44L48 37" fill="none" stroke="#e9fbff" stroke-width="1.2"/>':''}
        ${rock?'<path d="M24 26L33 43L49 38M33 43L16 61L26 70M33 43L42 69" fill="none" stroke="#abb4ba" stroke-width="1.3"/>':''}
        <g fill="${white?'#efa3b3':'#ffc0b4'}" opacity="${white?.65:.55}"><ellipse cx="20" cy="44" rx="3.7" ry="2.1"/><ellipse cx="44" cy="44" rx="3.7" ry="2.1"/></g>
        <g class="rig-eyes">
          <ellipse cx="26" cy="37" rx="${white?4.2:winged?5.7:4.4}" ry="${winged?6.8:5.8}" fill="${white?'#d54959':'#fffdf8'}"/>
          <ellipse cx="38" cy="37" rx="${white?4.2:winged?5.7:4.4}" ry="${winged?6.8:5.8}" fill="${white?'#d54959':'#fffdf8'}"/>
          <g class="rig-pupils" fill="${white?'#a62f43':winged?'#559ed7':'#354653'}"><ellipse cx="27" cy="38" rx="2.2" ry="3.1"/><ellipse cx="39" cy="38" rx="2.2" ry="3.1"/></g>
          <g fill="#fff"><circle cx="25" cy="35" r="1.2"/><circle cx="37" cy="35" r="1.2"/></g>
        </g>
        ${winged?`<g class="rig-brows" fill="none" stroke="${outline}" stroke-width="1.4" stroke-linecap="round"><path d="M21.5 28Q25 25 28.5 28M35.5 28Q39 25 42.5 28"/></g>`:''}
        ${type==='red'?`<path d="M35 43L49 46L35 48Z" fill="${fill}" stroke="${outline}" stroke-width="1"/>`:''}
        ${rock?'<path class="rig-moustache" d="M32 46C29 42 26 47 22 44C22 49 28 51 32 47C36 51 42 49 42 44C38 47 35 42 32 46Z" fill="#35414b" stroke="#2d3842" stroke-width=".6" stroke-linejoin="round"/>':''}
        ${type==='blue'?'<path d="M28 47Q32 52 36 47" fill="#8fc7ed" stroke="#4a77a5" stroke-width="1.4"/>':`<path d="M29 ${rock?51:48}Q32 ${rock?53.5:50.5} 35 ${rock?51:48}" fill="none" stroke="${outline}" stroke-width="1.1" stroke-linecap="round"/>`}
        ${type==='ice'?'<g class="rig-bowtie" stroke="#ab6e91" stroke-width="1" stroke-linejoin="round"><path d="M31 55C28 53 22 49 22 53V58C22 62 28 58 31 56ZM33 55C36 53 42 49 42 53V58C42 62 36 58 33 56Z" fill="#efa6c1"/><path d="M25 53.5L29 55M39 53.5L35 55" fill="none" stroke="#ffe3ef" stroke-width="1.3" stroke-linecap="round"/><ellipse cx="32" cy="55.7" rx="2.5" ry="2.7" fill="#f7d49c"/></g>':''}
        <g class="rig-sprout"><path d="${growth==='bud'?`M32 26V${10+7*CROWN_SCALE}`:'M32 26Q27 18 32 10'}" fill="none" stroke="#598b54" stroke-width="2" stroke-linecap="round"/><g class="rig-crown" transform="translate(32 10) scale(${CROWN_SCALE}) translate(-32 -10)">${sprout}</g></g>
      </g>
    </g>
  </svg>`;
}

export function createSprite(type,growth) {
  const template=document.createElement('template');
  template.innerHTML=spriteMarkup(type,growth);
  return template.content.firstElementChild;
}
