// Permanent unlocks. Each equipped general skill and companion has one use per run.
export const SKILLS=Object.freeze([
 {id:'double',zh:'跨兩格',en:'Double hop',price:640,icon:'↗↗',descriptionZh:'下一跳主動瞄準第二個落點，仍需掌握蓄力。',descriptionEn:'Aim at the second pad for your next hop; you still control power.'},
 {id:'adjust',zh:'空中微調',en:'Air adjustment',price:800,icon:'〰',descriptionZh:'預先啟用，下一跳最多修正28距離；差太遠仍會落水。',descriptionEn:'Arm before jumping; correct up to 28 distance on your next hop.'},
 {id:'prune',zh:'荊棘剪刀',en:'Thorn shears',price:720,icon:'✂',descriptionZh:'立即清走前方兩個落點的荊棘，下一落點加闊8；每局一次。',descriptionEn:'Clear thorns from both upcoming pads and widen the next by 8, once per run.'},
 {id:'anchor',zh:'穩穩船錨',en:'Steady anchor',price:880,icon:'⚓',descriptionZh:'立即加固腳下與下一個限時落點；保留魚燈與荊棘，每局一次。',descriptionEn:'Stabilize timed pads underfoot and ahead; fish and thorns remain, once per run.'},
 {id:'shield',zh:'泡泡護盾',en:'Bubble shield',price:960,icon:'◇',descriptionZh:'下一跳擋住一次燈籠魚；不防落水、下沉或荊棘，每局一次。',descriptionEn:'Block one fish during the next hop; falls, sinking and thorns still hurt, once per run.'},
 {id:'rescue',zh:'緊急浮葉',en:'Rescue leaf',price:1000,icon:'☘',descriptionZh:'啟用一次保護，失足或平台下沉時浮葉接住你；不防魚嘴與荊棘。',descriptionEn:'Arm one rescue from a missed hop or sinking pad; fish and thorns still hurt.'}
]);
export const COMPANIONS=Object.freeze([
 {id:'hippo',zh:'泡泡河馬',en:'Bubble hippo',price:1200,icon:'🦛',descriptionZh:'每局一次，在失足或平台下沉時自動托起臨時落點。',descriptionEn:'Once per run, automatically catch a missed hop or sinking pad.'},
 {id:'ray',zh:'滑翔魔鬼魚',en:'Gliding ray',price:1440,icon:'◈',descriptionZh:'每局一次，差距在18以內時自動滑翔修正；不保護其他危險。',descriptionEn:'Once per run, correct a near miss within 18 distance.'},
 {id:'crab',zh:'剪剪小河蟹',en:'Snipping river crab',price:1280,icon:'🦀',descriptionZh:'每局一次，自動剪走下一個落點的荊棘；沒有荊棘時保留支援。',descriptionEn:'Once per run, automatically clear thorns from the next pad; wait until needed.'},
 {id:'beaver',zh:'築橋小河狸',en:'Bridge beaver',price:1520,icon:'🦫',descriptionZh:'每局一次，自動加固首次踩到的限時落點；不防失足或燈籠魚。',descriptionEn:'Once per run, stabilize the first timed pad you stand on; no fall or fish protection.'},
 {id:'koi',zh:'招福小錦鯉',en:'Lucky koi',price:1600,icon:'🐟',descriptionZh:'每局一次，正中心落地額外加1青蛙幣；該次落點額外獎勵最多3幣，滿額時保留支援。',descriptionEn:'Once per run, add 1 Frog Coin on a centre landing; wait if the landing already has the maximum 3 bonus coins.'},
 {id:'shark',zh:'護航小鯊魚',en:'Guardian shark',price:1680,icon:'🦈',descriptionZh:'每局一次，動物護盾用完後替你擋住燈籠魚。',descriptionEn:'Once per run, block an anglerfish after your animal shield is spent.'}
]);
export const equipment=(type,id)=>(type==='skill'?SKILLS:COMPANIONS).find(x=>x.id===id);
export function equipmentState(p){const ownedSkills=[...new Set((Array.isArray(p.ownedSkills)?p.ownedSkills:[]).filter(id=>SKILLS.some(x=>x.id===id)))],ownedCompanions=[...new Set((Array.isArray(p.ownedCompanions)?p.ownedCompanions:[]).filter(id=>COMPANIONS.some(x=>x.id===id)))];return {ownedSkills,equippedSkill:ownedSkills.includes(p.equippedSkill)?p.equippedSkill:'',ownedCompanions,companion:ownedCompanions.includes(p.companion)?p.companion:''};}
export function purchaseEquipment(p,type,id){if(typeof id!=='string'||!['skill','companion'].includes(type))throw Error('unknown-item');const item=equipment(type,id);if(id&&!item)throw Error('unknown-item');const state=equipmentState(p),owned=type==='skill'?'ownedSkills':'ownedCompanions',selected=type==='skill'?'equippedSkill':'companion',buy=!!id&&!state[owned].includes(id);if(buy&&p.coins<item.price)throw Error('not-enough-coins');return {...p,...state,coins:p.coins-(buy?item.price:0),[owned]:buy?[...state[owned],id]:state[owned],[selected]:id};}
