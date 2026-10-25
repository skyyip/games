// Result panels opt in with data-victory; their names stay literal and selectable.
const active=new Map();
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const trophy='<svg viewBox="0 0 52 56" focusable="false"><path d="M12 8H5v9q0 12 13 12M40 8h7v9q0 12-13 12" fill="none" stroke="#b37b24" stroke-width="4" stroke-linecap="round"/><path d="M13 5h26v16q0 15-13 17-13-2-13-17Z" fill="#f3ca63" stroke="#b3832c" stroke-width="2"/><path d="M18 9v12q0 8 5 11" fill="none" stroke="#fff0ac" stroke-width="3" stroke-linecap="round"/><path d="M23 37h6v9h-6Z" fill="#c49236"/><path d="M17 45h18v6H17Z" fill="#dfb357" stroke="#aa7624" stroke-width="1.5"/><path d="m26 12 2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8Z" fill="#fff0b0"/></svg>';
function stop(panel){
  const entry=active.get(panel);if(!entry)return;
  clearTimeout(entry.delay);clearTimeout(entry.cleanup);entry.burst?.remove();active.delete(panel);
}
function celebrate(panel){
  stop(panel);
  const name=panel.querySelector('[data-winner-name]');
  // Losing a maze is not a victory. Other solo games celebrate the completed run.
  if(!name||panel.querySelector('.is-lost')){if(name)name.hidden=true;return;}
  name.hidden=false;
  if(!name.querySelector(':scope > .champion-icon')){
    const label=document.createElement('span'),icon=document.createElement('span');
    label.className='champion-label';label.append(...name.childNodes);
    icon.className='champion-icon';icon.setAttribute('aria-hidden','true');icon.innerHTML=trophy;
    name.replaceChildren(icon,label);name.classList.add('champion-names');
  }
  const entry={};active.set(panel,entry);
  entry.delay=setTimeout(()=>{
    if(panel.hidden||reduced.matches)return;
    name.classList.remove('champion-enter');void name.offsetWidth;name.classList.add('champion-enter');
    const burst=document.createElement('div');burst.className='victory-confetti';burst.setAttribute('aria-hidden','true');
    for(let i=0;i<36;i++){
      const piece=document.createElement('i'),side=i%2?1:-1;
      piece.style.setProperty('--confetti-x',`${side*(25+(i*29)%175)}px`);
      piece.style.setProperty('--confetti-rise',`${-30-(i*19)%70}px`);
      piece.style.setProperty('--confetti-end',`${150+(i*17)%70}px`);
      piece.style.setProperty('--confetti-turn',`${side*(180+(i*73)%540)}deg`);
      piece.style.setProperty('--confetti-delay',`${i%6*35}ms`);
      piece.style.setProperty('--confetti-time',`${1500+i%7*85}ms`);
      piece.style.setProperty('--confetti-color',['#e6bb59','#dda1aa','#95bfa5','#9db9d3','#d1b0ce','#f0ce8d'][i%6]);burst.append(piece);
    }
    name.append(burst);entry.burst=burst;entry.cleanup=setTimeout(()=>{burst.remove();},2600);
  },Number(panel.dataset.victoryDelay)||0);
}
function initialize(){
  for(const panel of document.querySelectorAll('[data-victory]')){
    let visible=!panel.hidden;
    new MutationObserver(()=>{
      const next=!panel.hidden;if(next===visible)return;visible=next;
      next?celebrate(panel):stop(panel);
    }).observe(panel,{attributes:true,attributeFilter:['hidden']});
    if(visible)celebrate(panel);
  }
}
reduced.addEventListener('change',()=>{if(reduced.matches)for(const panel of active.keys())stop(panel);});
addEventListener('pagehide',()=>{for(const panel of active.keys())stop(panel);});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});else initialize();
