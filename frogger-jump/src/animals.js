export const ANIMALS=Object.freeze([
 {id:'frog',zh:'小青蛙',en:'Frog',price:0,emoji:'🐸',color:'#83bb62',skillZh:'荷葉清道',skillEn:'Lily sweep',descriptionZh:'清走下一個落點的荊棘；沒有荊棘時，落腳面加大。',descriptionEn:'Clear thorns from the next pad; otherwise make its landing surface larger.'},
 {id:'penguin',zh:'小企鵝',en:'Penguin',price:280,emoji:'🐧',color:'#83afc5',skillZh:'凍凍冰橋',skillEn:'Ice bridge',descriptionZh:'加固腳下及下一個限時落點；沒有危險時，下一個落腳面加大。',descriptionEn:'Stabilize timed hazards underfoot and on the next pad; enlarge the next pad if neither needs rescue.'},
 {id:'bunny',zh:'棉花兔',en:'Bunny',price:320,emoji:'🐰',color:'#e0b1b4',skillZh:'軟綿氣墊',skillEn:'Soft landing',descriptionZh:'清走下一落點的荊棘，並將落腳面大幅加大。',descriptionEn:'Remove thorns and give the next pad a much bigger landing surface.'},
 {id:'monkey',zh:'蕉蕉猴',en:'Monkey',price:360,emoji:'🐵',color:'#b58a63',skillZh:'藤蔓開路',skillEn:'Vine rescue',descriptionZh:'藤蔓清除下一落點的所有機關，並綁穩落腳處。',descriptionEn:'Clear every hazard from the next pad and lash it safely in place.'},
 {id:'otter',zh:'小水獺',en:'Otter',price:400,emoji:'🦦',color:'#bd9b7b',skillZh:'浪花護航',skillEn:'Splash guard',descriptionZh:'嚇走腳下及前方的燈籠魚，同時加大下一個落腳面。',descriptionEn:'Scare away fish underfoot and ahead, and widen your next landing.'},
 {id:'duck',zh:'蛋黃鴨',en:'Duckling',price:440,emoji:'🐥',color:'#edc75d',skillZh:'鴨鴨浮台',skillEn:'Floating raft',descriptionZh:'加固腳下限時落點，清除下一落點荊棘並加闊少少。',descriptionEn:'Stabilize the timed pad underfoot, clear the next thorns and widen that landing.'},
 {id:'cat',zh:'奶茶花貓',en:'Tabby cat',price:480,emoji:'🐱',color:'#d5a06d',skillZh:'肉球救場',skillEn:'Paw cushion',descriptionZh:'清走下一落點荊棘並加闊；下一跳額外獲得軟綿保護。',descriptionEn:'Clear and widen the next thorny pad, with an extra soft-landing cushion for your next hop.'},
 {id:'panda',zh:'糯米熊貓',en:'Panda',price:520,emoji:'🐼',color:'#e9e4d5',skillZh:'竹竹護橋',skillEn:'Bamboo bridge',descriptionZh:'加固腳下與下一個限時落點，並加大下一個落腳面。',descriptionEn:'Stabilize timed hazards underfoot and ahead, and widen the next landing.'},
 {id:'fox',zh:'橙橙狐',en:'Little fox',price:960,emoji:'🦊',color:'#d68a59',skillZh:'狐尾掃掃',skillEn:'Tail sweep',descriptionZh:'掃走下一落點的全部機關，再加上下一跳軟綿保護。',descriptionEn:'Sweep every hazard off the next pad and cushion your next landing.'},
 {id:'capybara',zh:'慢活水豚',en:'Capybara',price:1000,emoji:'🦫',color:'#b6a083',skillZh:'淡定結界',skillEn:'Calm waters',descriptionZh:'清除腳下與下一落點的限時危險及荊棘，安心慢慢跳。',descriptionEn:'Clear timed hazards and thorns underfoot and on the next pad. Take a calmer hop.'},
 {id:'mochi',zh:'糯糯星鼠',en:'Mochi starmouse',price:1080,emoji:'🐹',color:'#edcfca',skillZh:'星星勇氣',skillEn:'Star courage',descriptionZh:'下一跳抵擋一次空中燈籠魚；清走下一落點荊棘並加闊。',descriptionEn:'Block one airborne fish on your next hop; clear the next thorns and widen the pad.'}
]);
export const animal=id=>ANIMALS.find(a=>a.id===id)??ANIMALS[0];
export const rewardCoins=(score,bonus=0)=>1+Math.max(0,Math.floor(score))*2+Math.floor(Math.max(0,score)/20)*10+Math.max(0,Math.min(Math.floor(bonus),Math.max(0,Math.floor(score))*3));
