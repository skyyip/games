import {PokerGame} from './game.js';
import {buildDeck,rankLabel,SUITS,SYMBOLS} from './cards.js';
import {mountPlayers,literal,enableOffline} from '../../grid-rush/src/party-ui.js';
import {translate} from '../../grid-rush/src/language.js';
const $=q=>document.querySelector(q),game=new PokerGame(),players=mountPlayers($('#players'));
const playerColors=['#3664ad','#ad3d57','#267660','#7950a5','#996315','#23778c'];
const modes={stud:'Five-card stud','big-two':'Big Two: five-card comparison',single:'Single-card duel'};
const say=s=>{$('#announcements').textContent=s;};
function face(card){const label=rankLabel(card.rank),suit=SYMBOLS[card.suit];return `<span class="card-face ${card.suit===0||card.suit===2?'red':''}"><span class="card-corner">${label}<span>${suit}</span></span><span class="card-suit">${suit}</span><span class="card-corner bottom">${label}<span>${suit}</span></span></span>`;}
function mini(card){const el=document.createElement('span');el.className=`mini-card ${card.suit===0||card.suit===2?'red':''}`;el.textContent=`${rankLabel(card.rank)}${SYMBOLS[card.suit]}`;el.setAttribute('translate','no');return el;}
function renderDeck(){
  const deck=game.deck.length?game.deck:buildDeck(),container=$('#deck');
  if(container.children.length!==52||container.dataset.round!==String(game.deck[0]?.id??'setup')){
    container.replaceChildren(...deck.map((card,index)=>{const button=document.createElement('button');button.type='button';button.className='playing-card';button.dataset.id=card.id;button.dataset.position=index+1;return button;}));container.dataset.round=String(game.deck[0]?.id??'setup');
  }
  for(const button of container.children){const id=Number(button.dataset.id),card=deck.find(c=>c.id===id),owner=game.hands.findIndex(hand=>hand.some(c=>c.id===id)),picked=owner!==-1;
    button.disabled=game.state!=='choosing'||picked;
    if(picked){button.style.setProperty('--player-color',playerColors[owner]);button.setAttribute('aria-describedby',`hand-player-${owner}`);}else{button.style.removeProperty('--player-color');button.removeAttribute('aria-describedby');}
    if(picked&&!button.classList.contains('is-picked')){button.innerHTML=face(card)+`<span class="owner-dot" aria-hidden="true">${owner+1}</span>`;button.classList.add('is-picked');}
    else if(!picked){button.innerHTML='<span class="card-back" aria-hidden="true"><span class="back-logo"></span></span>';button.classList.remove('is-picked');}
    button.setAttribute('aria-label',picked?`Card: ${rankLabel(card.rank)} of ${SUITS[card.suit]}`:`Hidden card ${button.dataset.position}`);
  }
}
function renderHands(){
  $('#hands').replaceChildren(...game.players.map((name,index)=>{const row=document.createElement('div');row.className=`hand-row${game.turn===index?' is-current':''}`;const heading=document.createElement('div'),label=document.createElement('b'),count=document.createElement('small'),chips=document.createElement('div');row.style.setProperty('--player-color',playerColors[index]);label.id=`hand-player-${index}`;literal(label,name);count.textContent=`${game.hands[index].length} / ${game.handSize}`;heading.append(label,count);chips.className='hand-chips';chips.append(...game.hands[index].map(mini));row.append(heading,chips);return row;}));
}
function render(){
  const setup=game.state==='setup';$('#settings').disabled=!setup;$('#start').hidden=!setup;$('#end-round').hidden=setup;$('#sidebar').classList.toggle('in-round',!setup);$('#turn-banner').hidden=game.state!=='choosing';$('#results').hidden=game.state!=='results';$('#table').dataset.state=game.state;
  $('#turn-name').textContent=setup?translate('Pocket Poker'):game.state==='results'?'':game.players[game.turn];$('#turn-name').setAttribute('translate','no');
  $('#phase-label').textContent=game.state==='choosing'?'ONE LITTLE CHOICE AT A TIME':game.state==='results'?'YOUR LITTLE HANDS, REVEALED':'THE CARDS ARE WAITING';
  $('#mode-label').textContent=modes[setup?$('#mode').value:game.mode];$('#round-count').textContent=`${game.used.size} / 52`;
  if(game.state==='choosing'){literal($('#active-player'),game.players[game.turn]);$('#active-index').textContent=String(game.turn+1);$('#turn-banner').style.setProperty('--player-color',playerColors[game.turn]);}
  $('#status').textContent=setup?'Choose your friends and a way to compare.':game.state==='choosing'?'Reveal one card. The turn passes automatically.':'Everyone has a hand. Compare your little bits of luck.';
  $('#mode-note').textContent=$('#mode').value==='stud'?'Collect five cards. The best poker hand wins.':$('#mode').value==='big-two'?'Collect five cards. Valid Big Two combinations beat unmade hands; see the table’s exact rules.':'Choose one card each. Aces are high; equal ranks compare suits.';
  renderDeck();renderHands();
}
function announceTurn(){say(`${game.players[game.turn]}, your turn. Reveal one card.`);}
function start(){game.start(players.names,{mode:$('#mode').value});$('#deck').dataset.round='';render();$('#table').scrollIntoView({block:'center',behavior:'instant'});announceTurn();}
$('#start').addEventListener('click',start);$('#again').addEventListener('click',start);$('#mode').addEventListener('change',render);
$('#deck').addEventListener('click',event=>{const button=event.target.closest('.playing-card');if(!button||!game.pick(Number(button.dataset.id)))return;if(game.state==='results')results();render();if(game.state==='results'){$('#result-title').focus({preventScroll:true});$('#results').scrollIntoView({block:'nearest',behavior:'instant'});}else{announceTurn();if(event.detail===0)$('#deck .playing-card:not(:disabled)')?.focus({preventScroll:true});}});
function results(){
  const winners=game.winners;$('#result-title').textContent=winners.length>1?'A lovely shared win.':'A lovely little hand.';literal($('#winner-names'),winners.map(w=>w.name).join(' & '));
  const results=game.results;$('#standings').replaceChildren(...results.map(result=>{const row=document.createElement('li');row.className=`standing${winners.some(w=>w.index===result.index)?' is-winner':''}`;row.style.setProperty('--player-color',playerColors[result.index]);const place=document.createElement('span');place.textContent=String(results.findIndex(r=>JSON.stringify(r.key)===JSON.stringify(result.key))+1).padStart(2,'0');const person=document.createElement('div'),name=document.createElement('strong'),hand=document.createElement('small'),cards=document.createElement('div');literal(name,result.name);hand.className='hand-name';hand.textContent=result.detail;cards.className='hand-chips';cards.append(...result.cards.map(mini));person.append(name,hand,cards);row.append(place,person);return row;}));say('All hands are complete. The results are ready.');
}
function setup(){game.reset();$('#deck').dataset.round='';render();$('#start').focus({preventScroll:true});}
$('#change').addEventListener('click',()=>{
  setup();
  const mode=$('#mode');mode.focus({preventScroll:true});
  mode.closest('.select-row').scrollIntoView({block:'center',inline:'nearest',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
$('#end-round').addEventListener('click',setup);render();enableOffline($('#offline-status'));
