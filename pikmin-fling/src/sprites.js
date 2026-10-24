import { TYPES } from './characters.js';

const colors={red:['#e95b4d','#a94038'],yellow:['#f3d166','#a98c32'],blue:['#67a7e2','#3f6eaa'],
  ice:['#a6e1ef','#659eaf'],rock:['#8a929a','#505d69'],winged:['#eda1bd','#b56e92'],white:['#faf8e9','#a6b2a2']};

function limb(kind,side,fill,outline) {
  const leg=kind==='leg',left=side==='left',x=leg?(left?26:38):(left?23:41);
  const y=leg?64:49,tipX=leg?(left?24:40):(left?14:50),tipY=leg?77:60;
  return `<g class="rig-${kind} rig-${kind}-${side}" style="transform-origin:${x}px ${y}px">
    <path d="M${x} ${y}Q${x} ${tipY-4} ${tipX} ${tipY}" fill="none" stroke="${outline}" stroke-width="5" stroke-linecap="round"/>
    <path d="M${x} ${y}Q${x} ${tipY-4} ${tipX} ${tipY}" fill="none" stroke="${fill}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="${tipX+(left?-1:1)}" cy="${tipY}" rx="${leg?4:2.7}" ry="2.2" fill="${fill}" stroke="${outline}" stroke-width="1"/>
  </g>`;
}

export function spriteMarkup(type,growth) {
  if(!TYPES.includes(type)||!['leaf','bud','flower'].includes(growth))throw new RangeError('Unknown character sprite');
  const [fill,outline]=colors[type],winged=type==='winged',rock=type==='rock',white=type==='white';
  const head=rock?'M24 25L40 26L48 39L43 64L32 70L20 61L17 40Z':
    type==='ice'?'M25 25L39 25L46 38L41 50L43 65L32 70L21 65L23 50L18 38Z':
    white?'M32 25C44 25 44 45 39 49C44 69 20 69 25 49C20 45 20 25 32 25Z':
    'M32 24C47 24 48 45 41 50C48 74 16 74 23 50C16 45 17 24 32 24Z';
  const sprout=growth==='leaf'?'<path d="M31 15C14 17 15 4 15 4S30 1 31 15Z" fill="#85bc68" stroke="#568451" stroke-width="1.3"/>':
    growth==='bud'?'<ellipse cx="32" cy="10" rx="5.5" ry="7" fill="#fff2d2" stroke="#a7a27b" stroke-width="1.3"/>':
    `<g fill="${white||winged?'#f8d3e1':'#fffdf1'}" stroke="#b8b29e" stroke-width=".8">${[[32,3],[38,7],[36,14],[28,14],[26,7]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="4.6" ry="4.2"/>`).join('')}<circle cx="32" cy="9" r="3.1" fill="#f3cc66" stroke="none"/></g>`;
  const wings=winged?`<g class="rig-wings" fill="#f8ffffe8" stroke="#b0c5ce" stroke-width="1.2">
    <path class="rig-wing rig-wing-left" d="M24 48C6 47 4 23 13 24C21 25 26 36 24 48Z"/>
    <path class="rig-wing rig-wing-right" d="M40 48C58 47 60 23 51 24C43 25 38 36 40 48Z"/>
  </g>`:'';
  return `<svg class="pikmin-art" viewBox="0 0 64 88" aria-hidden="true" focusable="false" data-sprite="${type}" data-stage="${growth}">
    <g class="rig-motion">
      ${wings}${limb('leg','left',fill,outline)}${limb('leg','right',fill,outline)}
      <g class="rig-body">
        ${limb('arm','left',fill,outline)}${limb('arm','right',fill,outline)}
        ${type==='yellow'?`<path d="M23 34C7 23 9 43 22 43M41 34C57 23 55 43 42 43" fill="${fill}" stroke="${outline}" stroke-width="1.4"/>`:''}
        <path d="${head}" fill="${fill}" stroke="${outline}" stroke-width="1.5" stroke-linejoin="round"/>
        ${type==='ice'?'<path d="M25 27L31 43L20 39M31 43L43 64L32 69M31 43L43 37" fill="none" stroke="#e9fbff" stroke-width="1.2"/>':''}
        ${rock?'<path d="M25 27L33 42L45 39M33 42L23 61L33 66M33 42L39 61" fill="none" stroke="#abb4ba" stroke-width="1.3"/>':''}
        <g class="rig-eyes">
          <ellipse cx="26" cy="37" rx="${white?4.2:winged?5.7:4.4}" ry="${winged?6.8:5.8}" fill="${white?'#d54959':'#fffdf8'}"/>
          <ellipse cx="38" cy="37" rx="${white?4.2:winged?5.7:4.4}" ry="${winged?6.8:5.8}" fill="${white?'#d54959':'#fffdf8'}"/>
          <g class="rig-pupils" fill="${white?'#a62f43':winged?'#559ed7':'#354653'}"><ellipse cx="27" cy="38" rx="2.2" ry="3.1"/><ellipse cx="39" cy="38" rx="2.2" ry="3.1"/></g>
          <g fill="#fff"><circle cx="25" cy="35" r="1.2"/><circle cx="37" cy="35" r="1.2"/></g>
        </g>
        ${type==='red'?`<path d="M35 43L49 46L35 48Z" fill="${fill}" stroke="${outline}" stroke-width="1"/>`:''}
        ${type==='blue'?'<path d="M28 47Q32 51 36 47" fill="#8fc7ed" stroke="#4a77a5" stroke-width="1.4"/>':''}
        <g class="rig-sprout"><path d="M32 26Q27 18 32 10" fill="none" stroke="#598b54" stroke-width="2" stroke-linecap="round"/>${sprout}</g>
      </g>
    </g>
  </svg>`;
}

export function createSprite(type,growth) {
  const template=document.createElement('template');
  template.innerHTML=spriteMarkup(type,growth);
  return template.content.firstElementChild;
}
