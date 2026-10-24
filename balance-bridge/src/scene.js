import {FALL_ANGLE,FALL_DURATION,clamp} from './game.js';
const svgNS='http://www.w3.org/2000/svg';
export const eventArt=Object.fromEntries(Object.entries({
  wind:'<path d="M5 15h21q8 0 6-6-2-5-7-2M3 22h23M8 29h17q8 0 6 5" fill="none"/><path d="M8 9q-3-7-7-5 0 7 7 5" fill="#a7ba8b" stroke="none"/>',
  bird:'<path d="M8 23q-4-7 4-12 7-4 13 4l9 2-7 6q-3 10-14 6Z" fill="#efd29b"/><path d="M14 17q-3 9 6 8" fill="#d9aa7b"/><circle cx="23" cy="15" r="1.5" fill="#46634e" stroke="none"/><path d="M10 32q-4 5 0 5 4 0 0-5" fill="#fffdf2"/>',
  thorns:'<path d="M20 35V8m0 16-8-7m8 12 8-8M7 34h26" fill="none"/><path d="m17 15 3-9 4 9m-13 7-4-9 9 4m8 7 9-9-3 12" fill="#aec18d"/>',
  bridge:'<path d="M5 12v23m30-23v23M5 26q15 10 30 0M5 15q15 10 30 0" fill="none"/><path d="m12 19 1 10m7-8v10m8-12-1 10" stroke-width="3"/><path d="m11 5 4-3m5 5V2m5 3 4-2" fill="none" stroke-width="1.5"/>',
  roach:'<ellipse cx="12" cy="16" rx="10" ry="5" transform="rotate(-28 12 16)" fill="#f5f0d7"/><ellipse cx="28" cy="16" rx="10" ry="5" transform="rotate(28 28 16)" fill="#f5f0d7"/><path d="m15 23-7 6m8-2-7 7m16-11 7 6m-8-2 7 7M17 11 12 4m11 7 5-7" fill="none"/><ellipse cx="20" cy="22" rx="8" ry="12" fill="#d6b684"/><circle cx="17" cy="17" r="1.5" fill="#46634e" stroke="none"/><circle cx="23" cy="17" r="1.5" fill="#46634e" stroke="none"/>'
}).map(([key,art])=>[key,`<svg viewBox="0 0 40 40" aria-hidden="true" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${art}</svg>`]));
export class BridgeScene {
  constructor(root){this.root=root;this.nodes=new Map();this.planks=[];for(let i=0;i<22;i++){const p=document.createElementNS(svgNS,'path');root.querySelector('#planks').append(p);this.planks.push(p);}}
  node(id){if(!this.nodes.has(id))this.nodes.set(id,this.root.querySelector(`#${id}`));return this.nodes.get(id);}
  attr(id,name,value){this.node(id).setAttribute(name,value);}
  draw(game,seconds,reduced=false){
    const walking=['playing','paused','falling','finished'].includes(game.state),phase=walking?game.phase:seconds*.8;
    const active=game.state==='playing',event=game.event,t=event?game.elapsed-event.startedAt:0;
    const fall=clamp(game.fallElapsed/FALL_DURATION,0,1),angle=game.angle*180/Math.PI;
    const jitter=active&&event&&!reduced?Math.sin(t*(18+event.level*4))*event.level*.3:0;
    const bridgeJitter=active&&event?.id==='bridge'&&!reduced?Math.sin(t*28)*4:0;
    this.attr('bridge-deck','transform',`translate(${bridgeJitter} 0)`);
    const x=450+(game.state==='falling'||game.state==='finished'?game.fallSide*(fall*170+fall*fall*35):0);
    const y=452+(game.state==='falling'||game.state==='finished'?fall*fall*330:!reduced&&walking?Math.sin(phase*2)*1.2:0);
    this.attr('walker-position','transform',`translate(${x+bridgeJitter} ${y})`);
    this.attr('walker-position','opacity',String(1-Math.max(0,(fall-.5)*2)));
    this.attr('walker-lean','transform',`rotate(${angle+jitter+game.fallSide*fall*65})`);
    const step=active&&!reduced?Math.sin(phase):0;
    this.attr('leg-front','d',`M0-69 Q${9+step*10} -35 ${11+step*7} ${-Math.max(0,step)*13}`);
    this.attr('leg-back','d',`M0-69 Q${-9-step*10} -35 ${-11-step*7} ${-Math.max(0,-step)*13}`);
    const poleAngle=-angle*.36+(active&&!reduced?Math.sin(phase*.5)*1.6:0);
    this.attr('pole','transform',`rotate(${poleAngle} 0 -110)`);
    const r=poleAngle*Math.PI/180;
    this.attr('arm-left','d',`M0-117 Q-27 -96 ${-56*Math.cos(r)} ${-110-56*Math.sin(r)}`);
    this.attr('arm-right','d',`M0-117 Q27 -96 ${56*Math.cos(r)} ${-110+56*Math.sin(r)}`);
    const worried=Math.abs(game.angle)>FALL_ANGLE*.48||Boolean(event);
    this.attr('mouth','d',fall?'M-4-138q4-7 8 0q-4 7-8 0':worried?'M-4-136q4-5 8 0':'M-4-138q4 4 8 0');
    this.attr('brows','opacity',worried?'1':'0');this.attr('brows','d',worried?'M-11-153l7-3m8 0 7 3':'M-11-153h7m8 0h7');
    this.attr('walker-shadow','opacity',String(.2*(1-fall)));
    const move=walking?game.elapsed*.18:0;
    this.planks.forEach((p,i)=>{const progress=((i/22+move)%1)**1.5,y=276+progress*374,half=11+(y-266)/384*19;p.setAttribute('d',`M${450-half} ${y}h${half*2}`);});
    const parallax=reduced?0:game.angle*8;
    this.attr('mountains-back','transform',`translate(${-parallax*.25} 0)`);this.attr('mountains-front','transform',`translate(${-parallax*.6} 0)`);
    this.attr('far-clouds','transform',`translate(${reduced?0:Math.sin(seconds*.09)*8} 0)`);this.attr('foreground-clouds','transform',`translate(${-parallax} 0)`);
    this.attr('wind-lines','opacity',event?.id==='wind'?String(Math.min(1,t*3)*.85):'0');
    this.attr('wind-lines','transform',`translate(${reduced?0:Math.sin(t*3)*35} 0)`);
    this.attr('thorns','opacity',event?.id==='thorns'?'1':'0');
    this.attr('event-bird','opacity',event?.id==='bird'&&t<2?'1':'0');
    this.attr('event-bird','transform',`translate(${260+t*155} ${164+Math.sin(t*3)*12})`);
    this.attr('bird-wing','transform',`rotate(${reduced?0:Math.sin(t*24)*42} -4 0)`);
    this.attr('bird-splat','opacity',event?.id==='bird'&&t>.85?'1':'0');
    this.attr('head-roach','opacity',event?.id==='roach'?'1':'0');
    const flying=event?.id==='roach'?Math.max(0,1-t/.85):0;
    this.attr('head-roach','transform',`translate(${5+flying*170} ${-193-flying*65}) rotate(${flying*20})`);
    this.attr('roach-wing-left','transform',`rotate(${reduced?0:Math.sin(t*48)*(flying?45:12)} -3 -2)`);
    this.attr('roach-wing-right','transform',`rotate(${reduced?0:-Math.sin(t*48)*(flying?45:12)} 3 -2)`);
  }
}
