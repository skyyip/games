let scope='guest';
const fresh=()=>({coins:0,cards:[],runs:0,bestHp:0,equippedCard:null,bonds:{},contracts:[],pendingRewards:[],pendingDraw:null,walletRevision:-1});
const key=uid=>`${uid==='guest'?'yrgt-save-v1':'yrgt-save-v2'}:${uid}`;
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null')}catch{return null}};
export function setSaveScope(uid){scope=uid||'guest';try{localStorage.setItem('yrgt-last-account-v2',scope)}catch{}}
export function restoreSaveScope(){try{scope=localStorage.getItem('yrgt-last-account-v2')||'guest'}catch{scope='guest'}}
export function getSaveScope(){return scope}
export function loadSave(uid=scope){
 const current=read(key(uid));if(current)return {...fresh(),...current};
 // Preserve the old account file verbatim; its SC never enter the new wallet.
 const legacy=uid==='guest'?null:read(`yrgt-save-v1:${uid}`);
 return {...fresh(),...(legacy?{cards:legacy.cards||[],runs:legacy.runs||0,bestHp:legacy.bestHp||0,equippedCard:legacy.equippedCard||null}:{})};
}
export function save(data,uid=scope){try{localStorage.setItem(key(uid),JSON.stringify(data));return true}catch{return false}}
export function addCoins(n){const data=loadSave();data.coins+=n;save(data);return data}
export function addCard(card){const data=loadSave();if(!data.cards.includes(card))data.cards.push(card);save(data);return data}
