import {MahjongGame} from './game.js';
import {buildTiles,tileName,tileMarkup,tileOrder} from './tiles.js';
import {literal,enableOffline} from '../../grid-rush/src/party-ui.js';
import {translate} from '../../grid-rush/src/language.js';
const $=q=>document.querySelector(q),game=new MahjongGame();let focusTimer=0,layoutFrame=0;
const playerColors=['#3664ad','#ad3d57'];
function markOwner(element,player){element.dataset.player=String(player+1);element.style.setProperty('--player-color',playerColors[player]);}
for(let i=0;i<2;i++){const input=$(`#name-${i}`);input.value=translate(`Player ${i+1}`);markOwner(input.closest('.player-row'),i);}
const say=s=>{$('#announcements').textContent=translate(s);};
const modeNames={turns:'Alternating turns',sudden:'Sudden death'};
function showTile(el,tile){el.innerHTML=tileMarkup(tile);el.setAttribute('aria-label',tileName(tile));el.removeAttribute('translate');}
function deck(){
  const tiles=game.tiles.length?game.tiles.slice(1):buildTiles().slice(1),container=$('#deck');
  if(container.children.length!==143||container.dataset.round!==String(game.target?.id??'setup')){container.replaceChildren(...tiles.map((tile,index)=>{const button=document.createElement('button');button.type='button';button.className='mahjong-tile';button.dataset.id=tile.id;button.dataset.position=index+1;return button;}));container.dataset.round=String(game.target?.id??'setup');}
  for(const button of container.children){const id=Number(button.dataset.id),opened=game.opened.find(p=>p.tile.id===id);button.disabled=game.state!=='choosing'||Boolean(opened);
    if(opened&&!button.classList.contains('opened')){button.innerHTML=`<span class="tile-face">${tileMarkup(opened.tile)}</span><span class="owner-dot" aria-hidden="true">${opened.player+1}</span>`;button.classList.add('opened');button.setAttribute('aria-label',tileName(opened.tile));}
    if(opened){markOwner(button,opened.player);button.setAttribute('aria-description',game.players[opened.player]);button.classList.toggle('missed',opened.fatal);button.classList.toggle('matched',!opened.fatal);}
    else if(!opened){delete button.dataset.player;button.style.removeProperty('--player-color');button.removeAttribute('aria-description');button.innerHTML='<span class="tile-back" aria-hidden="true"><span class="back-logo"></span></span>';button.setAttribute('aria-label',`Hidden tile ${button.dataset.position}`);}
  }
}
function history(){
  $('#history').replaceChildren(...game.opened.map(entry=>{const row=document.createElement('div');row.className='history-entry';markOwner(row,entry.player);const name=document.createElement('strong'),face=document.createElement('span');literal(name,game.players[entry.player]);face.textContent=tileName(entry.tile);if(game.mode==='turns'){const round=document.createElement('small');round.textContent=translate(`Round ${entry.round}`);name.append(round);}row.append(name,face);return row;}));
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
  const gap=3,total=grid.children.length;
  const columns=Math.max(1,Math.floor((width+gap)/(44+gap)));
  const best={columns:Math.min(columns,total)};
  const size=Math.min(56,(width-gap*(best.columns-1))/best.columns);

  grid.style.setProperty('--tile-columns',best.columns);grid.style.setProperty('--tile-w',`${size}px`);grid.style.setProperty('--tile-h',`${size/.73}px`);grid.style.setProperty('--tile-gap',`${gap}px`);
  grid.style.width=`${best.columns*size+(best.columns-1)*gap+gridPadding}px`;
}
function queueLayout(){cancelAnimationFrame(layoutFrame);layoutFrame=requestAnimationFrame(fitTable);}
function render(){
  const setup=game.state==='setup';$('#settings').disabled=!setup;$('#start').hidden=!setup;$('#end-round').hidden=setup;$('#sidebar').classList.toggle('in-round',!setup);$('#turn-banner').hidden=game.state!=='choosing';$('#results').hidden=game.state!=='results';$('#table').dataset.state=game.state;
  const mode=setup?$('#mode').value:game.mode;$('#mode-label').textContent=modeNames[mode];$('.target-row').dataset.mode=mode;
  $('#target-goal').textContent=mode==='turns'?'ONLY ONE MATCH WINS':'DODGE THIS LITTLE RANK';
  $('#mode-note').textContent=mode==='turns'?'Two reveals per round. Only one matching player wins.':'Random first player. Different ranks pass; matching rank loses.';
  $('#pair-label').textContent=setup?'One tile per turn':mode==='turns'?`Round ${game.round}`:`Draw order: ${game.startingPlayer+1} → ${2-game.startingPlayer}`;
  literal($('#turn-name'),setup?translate('Mahjong Match'):game.state==='results'?'':game.players[game.turn]);
  $('#phase-label').textContent=game.state==='choosing'?'ONE LITTLE TILE. YOUR LITTLE TURN.':'A TABLE OF LITTLE POSSIBILITIES';
  if(game.target){showTile($('#target'),game.target);$('#target-name').textContent=tileName(game.target);$('#target-rank').textContent=`Tile rank ${tileOrder(game.target)}`;}else{$('#target').textContent='?';$('#target').setAttribute('aria-label','Target tile');$('#target-name').textContent='A random tile appears when you start.';$('#target-rank').textContent='—';}
  if(game.state==='choosing'){literal($('#active-player'),game.players[game.turn]);$('#active-index').textContent=String(game.turn+1);markOwner($('#turn-banner'),game.turn);}$('#remaining').textContent=`${game.remaining} tiles waiting`;
  $('#status').textContent=mode==='sudden'?(setup?'Choose a mode. Compare ranks, not suits.':game.state==='choosing'?'Choose a tile. Avoid the target rank.':'The target rank was revealed. The other player wins.'):setup?'Two players reveal once each. Exactly one match wins; equal outcomes start another round.':game.state==='results'?(game.outcome==='draw'?'The last pair tied. Too few tiles remain for another pair.':'Only the matching player wins this round.'):game.turn===1?(game.opened.at(-1).match?'First tile matches. Player 2 reveals next.':'First tile differs. Player 2 reveals next.'):game.round>1?`Same outcome. Round ${game.round}: Player 1 reveals first.`:'Round 1: Player 1 reveals first, then Player 2.';
  deck();history();queueLayout();
}
function announceTurn(){say(`${game.players[game.turn]}, your turn. Reveal one tile.`);}
function start(){clearTimeout(focusTimer);game.start([0,1].map(i=>$(`#name-${i}`).value.trim()||translate(`Player ${i+1}`)),{mode:$('#mode').value});$('#deck').dataset.round='';render();$('.target-row').scrollIntoView({block:'start',behavior:'instant'});announceTurn();}
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);
$('#deck').addEventListener('click',event=>{const button=event.target.closest('.mahjong-tile');if(!button||!game.pick(Number(button.dataset.id)))return;
  if(game.state==='results')renderResults();
  render();if(game.state==='results'){focusTimer=setTimeout(()=>{if(game.state!=='results')return;$('#result-title').focus({preventScroll:true});$('#results').scrollIntoView({block:'nearest',behavior:'instant'});},350);say(game.outcome==='draw'?'The table is tied. Play again for a fresh chance.':`${game.players[game.winner]} wins.`);}else{announceTurn();if(event.detail===0)$('#deck .mahjong-tile:not(:disabled)')?.focus({preventScroll:true});}
});
function renderResults(){
  const pair=game.mode==='turns',draw=game.outcome==='draw',last=game.opened.at(-1);
  $('#results').dataset.victoryOutcome=draw?'draw':'win';
  $('#result-title').textContent=draw?'A little shared draw.':'A lucky little match.';
  literal($('#winner-name'),draw?'':game.players[game.winner]);
  $('#result-note').textContent=draw?'The last pair tied. Too few tiles remain for another pair.':pair?'Only the matching player wins this round.':'The target rank was hit. The player who revealed it loses.';
  showTile($('#result-target'),game.target);showTile($('#result-last'),last.tile);markOwner($('#result-last'),last.player);
  $('#result-target-rank').textContent=`Tile rank ${tileOrder(game.target)}`;$('#result-last-rank').textContent=`Tile rank ${tileOrder(last.tile)}`;
  $('#final-tiles').classList.toggle('is-pair',pair);$('#result-first-wrap').hidden=!pair;$('#result-compare').hidden=pair;
  $('#result-compare').textContent=last.match?'=':'≠';$('#result-last-outcome').hidden=!pair;
  if(pair){
    const first=game.opened.at(-2);literal($('#result-first-name'),game.players[0]);literal($('#result-last-name'),game.players[1]);showTile($('#result-first'),first.tile);markOwner($('#result-first'),first.player);
    $('#result-first-rank').textContent=`Tile rank ${tileOrder(first.tile)}`;
    $('#result-first-outcome').textContent=first.match?'Matches target':'Different rank';$('#result-last-outcome').textContent=last.match?'Matches target':'Different rank';
  }else{$('#result-last-name').removeAttribute('translate');$('#result-last-name').textContent='Last revealed';}
}
function setup(){clearTimeout(focusTimer);game.reset();$('#deck').dataset.round='';render();$('#start').focus({preventScroll:true});}
$('#change').addEventListener('click',()=>{
  setup();const mode=$('#mode');mode.focus({preventScroll:true});
  mode.closest('.select-row').scrollIntoView({block:'center',inline:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});$('#end-round').addEventListener('click',setup);$('#mode').addEventListener('change',render);render();enableOffline($('#offline-status'));
let panelWidth=0;new ResizeObserver(entries=>{const width=entries[0].contentRect.width;if(Math.abs(width-panelWidth)>.5){panelWidth=width;queueLayout();}}).observe($('.play-panel'));
window.addEventListener('resize',queueLayout);window.visualViewport?.addEventListener('resize',queueLayout);document.fonts.ready.then(queueLayout);
