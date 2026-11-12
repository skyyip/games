import {playerName} from './player-state.js';
let name='';
export function getPlayerName(){return name;}
export function setPlayerName(value){name=playerName(value);document.dispatchEvent(new Event('bbl:namechange'));return name;}
export function renderPlayerGreeting(node,zh=true){if(!node)return;const question=zh?'今日有咩令你心塞？':'What is weighing on you today?';if(node.dataset.name===name&&node.dataset.greetingLang===String(zh))return;node.dataset.name=name;node.dataset.greetingLang=String(zh);node.setAttribute('translate','no');node.replaceChildren();if(name){const strong=document.createElement('strong');strong.className='bbl-player-name';strong.textContent=name;node.append(strong,document.createTextNode(zh?'！':'! '));}node.append(document.createTextNode(question));}
