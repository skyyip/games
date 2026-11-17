export const FRIENDS=Object.freeze([
 {id:'uncle',name:'水吧阿叔',detail:'茶記老友・快人快語',icon:'tea',greeting:'喂，我忙緊沖奶茶！聽住呢個方向：',goodbye:'線索畀咗你，最後答案自己話事。'},
 {id:'hiker',name:'行山好友',detail:'郊遊拍檔・觀察入微',icon:'mountain',greeting:'慢慢睇，就好似搵路標咁。留意：',goodbye:'行山唔靠亂衝，答題都一樣。'},
 {id:'guard',name:'看更伯伯',detail:'屋邨街坊・慢條斯理',icon:'lantern',greeting:'後生，伯伯同你慢慢拆解：',goodbye:'唔使心急，對清題目先。'},
 {id:'joker',name:'醒目損友',detail:'嘴硬心軟・有料照講',icon:'bao',greeting:'今次唔整蠱你，認真講線索：',goodbye:'我負責打氣，你負責最後答案！'}
]);
export const friendById=id=>FRIENDS.find(f=>f.id===id)??FRIENDS[0];
export function friendHint(id,hint){const f=friendById(id);return {name:f.name,intro:f.greeting,hint,ending:f.goodbye};}
const hash=text=>{let n=2166136261;for(const c of String(text))n=Math.imul(n^c.codePointAt(0),16777619);return n>>>0;};
export function hostPrompt(run){
 if(!run||run.phase!=='playing')return '';
 const lines=run.index>=13?['上到呢一步，信你嘅觀察。最後答案？','百萬之路近在眼前，錦囊仲用唔用？','呢一步，你話事。睇清楚，最後答案？']:run.index>=9?['保險線過咗，每一步都要睇清楚。','直覺定線索？最後答案由你決定。','仲有冇忽略咗嘅細節？最後答案？']:run.index>=4?['先睇清楚，再信自己。最後答案？','穩陣都係一種實力，最後答案？']:['準備好就鎖定，最後答案？'];
 return lines[hash(run.day+':'+run.index)%lines.length];
}
export function resultBadges(run){
 if(run?.phase!=='finished')return [];
 const badges=[];
 if(run.reason==='wrong'&&run.correct===14)badges.push({id:'rollercoaster',name:'過山車苦主',line:'由五十萬回到保險線，膽識已經滿分。'});
 if(run.reason==='wrong'&&run.index===0&&run.correct===0)badges.push({id:'visitor',name:'遊客體驗卡',line:'下一站，香港通！街坊聽日再嚟。'});
 if(run.reason==='wrong'&&[run.halfFor,run.phoneFor,run.audienceFor].every(n=>n>=0))badges.push({id:'all-in',name:'錦囊用盡都搏過',line:'朋友、觀眾都問過，今場真係搏盡。'});
 if(run.reason==='walk'&&run.payout>=8000)badges.push({id:'wise',name:'識收手街坊',line:'帶住獎金離場，識停都係智慧。'});
 if(run.reason==='timeout')badges.push({id:'clock',name:'時間管理練習生',line:'今次差少少，下一回快半步。'});
 if(run.reason==='complete'&&[run.halfFor,run.phoneFor,run.audienceFor].every(n=>n===-1))badges.push({id:'solo',name:'無錦囊地膽',line:'十五題全中，三個錦囊原封不動！'});
 return badges.slice(0,2);
}
export const stageFor=(index,count=15)=>index>=Math.ceil(count*2/3)?'final':index>=Math.ceil(count/3)?'tense':'warm';
export function friendPortrait(id){const color={uncle:'#81aaa1',hiker:'#e5ad5c',guard:'#7397b3',joker:'#d98b7c'}[id]??'#81aaa1';return '<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><g stroke="#29483e" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 100q3-31 39-31t39 31" fill="'+color+'"/><ellipse cx="50" cy="44" rx="29" ry="32" fill="#ffe0b5"/><path d="M22 34q0-27 28-27t28 27" fill="'+(id==='guard'?'#d1d5c9':'#4d4939')+'"/>'+(id==='hiker'?'<path d="M18 29q4-25 32-25t32 25H18l69 5" fill="#d7784d"/>':id==='guard'?'<path d="M19 27h62l-6-14H27Z" fill="#e4c568"/><circle cx="50" cy="21" r="4" fill="#7397b3"/>':'')+'<ellipse cx="37" cy="48" rx="2" ry="3" fill="#29483e"/><ellipse cx="63" cy="48" rx="2" ry="3" fill="#29483e"/>'+(id==='joker'?'<path d="M28 43h16v12H28Zm28 0h16v12H56Zm-12 2h12" fill="#708e85"/>':'')+'<path d="M43 61q7 7 14 0" fill="none"/><circle cx="28" cy="58" r="4" fill="#e8a491" stroke="none"/><circle cx="72" cy="58" r="4" fill="#e8a491" stroke="none"/>'+(id==='uncle'?'<path d="M40 57q10-10 20 0q-10 6-20 0" fill="#514a39"/>':'')+'<path d="m41 77 9 12 9-12" fill="#fff7dc"/></g></svg>';}
