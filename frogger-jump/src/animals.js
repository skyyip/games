export const ANIMALS=Object.freeze([
 {id:'frog',zh:'小青蛙',en:'Frog',price:0,emoji:'🐸',color:'#83bb62',skillZh:'荷葉清道',skillEn:'Lily sweep',descriptionZh:'清走下一個落點的荊棘；沒有荊棘時，落腳面加大。',descriptionEn:'Clear thorns from the next pad; otherwise make its landing surface larger.'},
 {id:'penguin',zh:'小企鵝',en:'Penguin',price:80,emoji:'🐧',color:'#83afc5',skillZh:'凍凍冰橋',skillEn:'Ice bridge',descriptionZh:'加固腳下及下一個限時落點；沒有危險時，下一個落腳面加大。',descriptionEn:'Stabilize timed hazards underfoot and on the next pad; enlarge the next pad if neither needs rescue.'},
 {id:'bunny',zh:'棉花兔',en:'Bunny',price:120,emoji:'🐰',color:'#e0b1b4',skillZh:'軟綿氣墊',skillEn:'Soft landing',descriptionZh:'清走下一落點的荊棘，並將落腳面大幅加大。',descriptionEn:'Remove thorns and give the next pad a much bigger landing surface.'},
 {id:'monkey',zh:'蕉蕉猴',en:'Monkey',price:160,emoji:'🐵',color:'#b58a63',skillZh:'藤蔓開路',skillEn:'Vine rescue',descriptionZh:'藤蔓清除下一落點的所有機關，並綁穩落腳處。',descriptionEn:'Clear every hazard from the next pad and lash it safely in place.'},
 {id:'otter',zh:'小水獺',en:'Otter',price:200,emoji:'🦦',color:'#bd9b7b',skillZh:'浪花護航',skillEn:'Splash guard',descriptionZh:'嚇走腳下及前方的燈籠魚，同時加大下一個落腳面。',descriptionEn:'Scare away fish underfoot and ahead, and widen your next landing.'}
]);
export const animal=id=>ANIMALS.find(a=>a.id===id)??ANIMALS[0];
export const rewardCoins=score=>1+Math.max(0,Math.floor(score))*2+Math.floor(Math.max(0,score)/20)*10;
