import {MahjongGame} from './game.js';
import {buildTiles,tileName,tileMarkup,tileOrder} from './tiles.js';
import {literal,enableOffline} from '../../grid-rush/src/party-ui.js';
import {translate} from '../../grid-rush/src/language.js';
const $=q=>document.querySelector(q),game=new MahjongGame();let focusTimer=0,layoutFrame=0;
for(let i=0;i<2;i++)$(`#name-${i}`).value=translate(`Player ${i+1}`);
const say=s=>{$('#announcements').textContent=s;};
const modeNames={turns:'Alternating turns',sudden:'Sudden death'};
function showTile(el,tile){el.innerHTML=tileMarkup(tile);el.setAttribute('aria-label',tileName(tile));el.removeAttribute('translate');}
function deck(){
  const tiles=game.tiles.length?game.tiles.slice(1):buildTiles().slice(1),container=$('#deck');
  if(container.children.length!==143||container.dataset.round!==String(game.target?.id??'setup')){container.replaceChildren(...tiles.map((tile,index)=>{const button=document.createElement('button');button.type='button';button.className='mahjong-tile';button.dataset.id=tile.id;button.dataset.position=index+1;return button;}));container.dataset.round=String(game.target?.id??'setup');}
  for(const button of container.children){const id=Number(button.dataset.id),opened=game.opened.find(p=>p.tile.id===id);button.disabled=game.state!=='choosing'||Boolean(opened);
    if(opened&&!button.classList.contains('opened')){button.innerHTML=`<span class="tile-face">${tileMarkup(opened.tile)}</span><span class="owner-dot" aria-hidden="true">${opened.player+1}</span>`;button.classList.add('opened',opened.fatal?'missed':'matched');button.setAttribute('aria-label',tileName(opened.tile));}
    else if(!opened){button.innerHTML='<span class="tile-back" aria-hidden="true"><span class="back-logo"></span></span>';button.setAttribute('aria-label',`Hidden tile ${button.dataset.position}`);}
  }
}
function history(){
  $('#history').replaceChildren(...game.opened.map(entry=>{const row=document.createElement('div');row.className='history-entry';const name=document.createElement('strong'),face=document.createElement('span');literal(name,game.players[entry.player]);face.textContent=tileName(entry.tile);row.append(name,face);return row;}));
}
function fitTable(){
  layoutFrame=0;
  const grid=$('#deck'),shell=$('#table'),style=getComputedStyle(shell),gridPadding=4;
  const width=shell.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight)-gridPadding;
  if(width<=0||!grid.children.length)return;
  const viewport=window.visualViewport?.height??innerHeight;
  const chrome=shell.offsetHeight-grid.offsetHeight;
  const margins=parseFloat(style.marginTop)+parseFloat(style.marginBottom);
  const height=Math.max(64,viewport-$('.target-row').offsetHeight-(matchMedia('(max-height:500px) and (min-aspect-ratio:4/3)').matches?34:44)-chrome-$('#status').offsetHeight-margins-12-gridPadding);
  const gap=width<500?1:2,total=grid.children.length;let best={columns:13,size:0};
  for(let columns=1;columns<=Math.min(32,total);columns++){
    const rows=Math.ceil(total/columns),size=Math.min(40,(width-gap*(columns-1))/columns,(height-gap*(rows-1))/rows*.73);
    if(size>best.size+.01||(Math.abs(size-best.size)<=.01&&total%columns===0&&total%best.columns!==0))best={columns,size};
  }
  const size=Math.max(2,best.size);
  grid.style.setProperty('--tile-columns',best.columns);grid.style.setProperty('--tile-w',`${size}px`);grid.style.setProperty('--tile-h',`${size/.73}px`);grid.style.setProperty('--tile-gap',`${gap}px`);
  grid.style.width=`${best.columns*size+(best.columns-1)*gap+gridPadding}px`;
}
function queueLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(fitTable);}
function render(){
  const setup=game.state==='setup';$('#settings').disabled=!setup;$('#start').hidden=!setup;$('#end-round').hidden=setup;$('#sidebar').classList.toggle('in-round',!setup);$('#turn-banner').hidden=game.state!=='choosing';$('#results').hidden=game.state!=='results';$('#table').dataset.state=game.state;
  const mode=setup?$('#mode').value:game.mode;$('#mode-label').textContent=modeNames[mode];$('.target-row').dataset.mode=mode;
  $('#target-goal').textContent=mode==='sudden'?'DODGE THIS LITTLE RANK':'MATCH THIS LITTLE RANK';
  $('#mode-note').textContent=mode==='sudden'?'Different rank is safe. The target rank means sudden death.':'Match the rank to pass. A different rank loses.';
  literal($('#turn-name'),setup?translate('Mahjong Match'):game.state==='results'?'':game.players[game.turn]);
  $('#phase-label').textContent=game.state==='choosing'?'ONE LITTLE TILE. YOUR LITTLE TURN.':'A TABLE OF LITTLE POSSIBILITIES';
  if(game.target){showTile($('#target'),game.target);$('#target-name').textContent=tileName(game.target);$('#target-rank').textContent=`Tile rank ${tileOrder(game.target)}`;}else{$('#target').textContent='?';$('#target').setAttribute('aria-label','Target tile');$('#target-name').textContent='A random tile appears when you start.';$('#target-rank').textContent='—';}
  if(game.state==='choosing'){literal($('#active-player'),game.players[game.turn]);$('#active-index').textContent=String(game.turn+1);}$('#remaining').textContent=`${game.remaining} tiles waiting`;
  $('#status').textContent=setup?'Choose matching or sudden death. Compare ranks, not suits.':game.state==='choosing'?(mode==='sudden'?'Choose a tile. Avoid the target rank.':'Choose a tile. Match the target rank to stay safe.'):(mode==='sudden'?'The target rank was revealed. The other player wins.':'A different rank was revealed. The other player wins.');
  deck();history();queueLayout();
}
function announceTurn(){say(`${game.players[game.turn]}, your turn. Reveal one tile.`);}
function start(){clearTimeout(focusTimer);game.start([0,1].map(i=>$(`#name-${i}`).value.trim()||translate(`Player ${i+1}`)),{mode:$('#mode').value});$('#deck').dataset.round='';render();$('.target-row').scrollIntoView({block:'start',behavior:'instant'});announceTurn();}
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);
$('#deck').addEventListener('click',event=>{const button=event.target.closest('.mahjong-tile');if(!button||!game.pick(Number(button.dataset.id)))return;
  if(game.state==='results'){const last=game.opened.at(-1);literal($('#winner-name'),game.players[game.winner]);$('#result-note').textContent=game.mode==='sudden'?'The target rank was hit. The player who revealed it loses.':'The ranks differ. The player who revealed the last tile loses.';showTile($('#result-target'),game.target);showTile($('#result-last'),last.tile);$('#result-target-rank').textContent=`Tile rank ${tileOrder(game.target)}`;$('#result-last-rank').textContent=`Tile rank ${tileOrder(last.tile)}`;$('#result-compare').textContent=last.match?'=':'≠';}
  render();if(game.state==='results'){focusTimer=setTimeout(()=>{if(game.state!=='results')return;$('#result-title').focus({preventScroll:true});$('#results').scrollIntoView({block:'nearest',behavior:'instant'});},350);say('This little round is over. The other player wins.');}else{announceTurn();if(event.detail===0)$('#deck .mahjong-tile:not(:disabled)')?.focus({preventScroll:true});}
});
function setup(){clearTimeout(focusTimer);game.reset();$('#deck').dataset.round='';render();$('#start').focus({preventScroll:true});}
$('#change').addEventListener('click',setup);$('#end-round').addEventListener('click',setup);$('#mode').addEventListener('change',render);render();enableOffline($('#offline-status'));
let panelWidth=0;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-panelWidth)>.5){panelWidth=width;queueLayout();}}).observe($('.play-panel'));
window.addEventListener('resize',queueLayout);window.visualViewport?.addEventListener('resize',queueLayout);document.fonts.ready.then(queueLayout);
