// Only preset IDs are shared. Private worry text never enters a gift or cooperation card.
export const GIFT_MESSAGES=[
 {id:'',zh:'不附留言',en:'No message'},
 {id:'rest',zh:'今日辛苦晒，記得休息。',en:'You worked hard today. Take a little rest.'},
 {id:'slipper',zh:'呢隻拖鞋借你出氣！',en:'Borrow this slipper and whack the stress away!'},
 {id:'together',zh:'有我撐你，衰運一齊打走！',en:'I have your back. Let’s whack bad luck together!'},
 {id:'tea',zh:'飲啖茶先，好運慢慢嚟。',en:'Take a sip of tea. Good luck takes its time.'}
];
export const giftMessage=(id,zh=true)=>(GIFT_MESSAGES.find(m=>m.id===id)??GIFT_MESSAGES[0])[zh?'zh':'en'];
export const validGiftMessage=id=>GIFT_MESSAGES.some(m=>m.id===id);
export const CHALLENGE_TARGET=3;
export const challengeWeek=now=>Math.floor((Math.floor((now+28800000)/86400000)+3)/7);
export const challengeWindow=week=>({start:(week*7-3)*86400000-28800000,end:(week*7+4)*86400000-28800000});
export const challengeComplete=c=>c?.joinedA&&c?.joinedB&&c.receiptsA.length>=CHALLENGE_TARGET&&c.receiptsB.length>=CHALLENGE_TARGET;
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function cooperationCard(c,zh=true){
 const line=zh?'宇宙加班王已被拍成準時收工王！':'The overtime boss has clocked off!';
 return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="620" viewBox="0 0 700 620"><rect width="700" height="620" rx="28" fill="#fff4d7"/><rect x="18" y="18" width="664" height="584" rx="20" fill="none" stroke="#877152" stroke-width="4"/><g font-family="system-ui,sans-serif" text-anchor="middle" fill="#344e43"><text x="350" y="70" font-size="28">${zh?'街坊拍檔・合作紀念卡':'NEIGHBOURHOOD · TEAMWORK CARD'}</text><rect x="50" y="100" width="600" height="280" rx="20" fill="#295449"/><g stroke="#ffd786" stroke-width="5" stroke-linejoin="round"><path d="m290 150 120 8-10 190-40-15-30 15-25-15-25 15Z" fill="#e4b88d"/><path d="m312 205 17 5m43 0 17-5m-63 48q25 30 48-2" fill="none"/><path d="m180 180 75 20-20 100-30 15-45-30Z" fill="#edb7c2"/><path d="m465 170 70 22-15 100-35 20-45-30Z" fill="#a9d4c5"/></g><text x="350" y="420" font-size="24">${escape(line)}</text><text x="350" y="466" font-size="23">${escape([...String(c.aName)].slice(0,20).join(''))} ＆ ${escape([...String(c.bName)].slice(0,20).join(''))}</text><text x="350" y="508" font-size="21">${zh?'各完成 3 場儀式・一齊準時收工':'3 rituals each · a shared little victory'}</text><text x="350" y="566" font-size="17">Your Playground · ${zh?'只分享預設對白，不包含心事':'Preset dialogue only. Private worries stay private.'}</text></g></svg>`;
}

export function cooperationBossArt(progress=0){
 const done=progress>=6,tired=progress>=3;
 return `<svg viewBox="0 0 90 110" aria-hidden="true" focusable="false"><g stroke="#786052" stroke-width="2.5" stroke-linejoin="round"><path d="m14 12 64 5-5 82-12-7-12 8-12-8-15 7Z" fill="${done?'#b6d9bc':'#f1cd99'}"/><path d="M35 15V5h20v11m-32 4 4 71m40-70-4 69" fill="none"/><path d="M30 53h31v20H30Zm10 0v-5h11v5" fill="#b98663"/>${done?'<path d="m29 35 5-4 5 4m12 0 5-4 5 4M38 43q8 8 15-1" fill="none"/>':tired?'<path d="m29 35 10 2m12 0 10-2M39 45h12" fill="none"/>':'<path d="m28 31 12 5m10 0 12-5M38 45q8-7 15 0" fill="none"/>'}</g>${done?'<path d="m5 17 3-7 3 7 7 3-7 3-3 7-3-7-7-3Z" fill="#f3c85d"/>':''}</svg>`;
}
