// Permanent unlocks. Each river companion has one use per run.
export const COMPANIONS=Object.freeze([
 {id:'hippo',zh:'泡泡河馬',en:'Bubble hippo',price:1200,icon:'🦛',descriptionZh:'每局一次，在失足或平台下沉時自動托起臨時落點。',descriptionEn:'Once per run, automatically catch a missed hop or sinking pad.'},
 {id:'ray',zh:'滑翔魔鬼魚',en:'Gliding ray',price:1440,icon:'◈',descriptionZh:'每局一次，差距在18以內時自動滑翔修正；不保護其他危險。',descriptionEn:'Once per run, correct a near miss within 18 distance.'},
 {id:'crab',zh:'剪剪小河蟹',en:'Snipping river crab',price:1280,icon:'🦀',descriptionZh:'每局一次，自動剪走下一個落點的荊棘；沒有荊棘時保留支援。',descriptionEn:'Once per run, automatically clear thorns from the next pad; wait until needed.'},
 {id:'beaver',zh:'築橋小河狸',en:'Bridge beaver',price:1520,icon:'🦫',descriptionZh:'每局一次，自動加固首次踩到的限時落點；不防失足或燈籠魚。',descriptionEn:'Once per run, stabilize the first timed pad you stand on; no fall or fish protection.'},
 {id:'koi',zh:'招福小錦鯉',en:'Lucky koi',price:1600,icon:'🐟',descriptionZh:'每局一次，正中心落地額外加1青蛙幣；該次落點額外獎勵最多3幣，滿額時保留支援。',descriptionEn:'Once per run, add 1 Frog Coin on a centre landing; wait if the landing already has the maximum 3 bonus coins.'},
 {id:'shark',zh:'護航小鯊魚',en:'Guardian shark',price:1680,icon:'🦈',descriptionZh:'每局一次，動物護盾用完後替你擋住燈籠魚。',descriptionEn:'Once per run, block an anglerfish after your animal shield is spent.'}
]);
export const equipment=(type,id)=>type==='companion'?COMPANIONS.find(x=>x.id===id):undefined;
export function equipmentState(p){const ownedCompanions=[...new Set((Array.isArray(p.ownedCompanions)?p.ownedCompanions:[]).filter(id=>COMPANIONS.some(x=>x.id===id)))];return {ownedCompanions,companion:ownedCompanions.includes(p.companion)?p.companion:''};}
export function purchaseEquipment(p,type,id){if(typeof id!=='string'||type!=='companion')throw Error('unknown-item');const item=equipment(type,id);if(id&&!item)throw Error('unknown-item');const state=equipmentState(p),buy=!!id&&!state.ownedCompanions.includes(id);if(buy&&p.coins<item.price)throw Error('not-enough-coins');return {...p,...state,coins:p.coins-(buy?item.price:0),ownedCompanions:buy?[...state.ownedCompanions,id]:state.ownedCompanions,companion:id};}
