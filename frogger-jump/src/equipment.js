// Permanent unlocks. Each equipped item has one use per run; skills recharge every 20 landings.
export const SKILLS=Object.freeze([
 {id:'double',zh:'跨兩格',en:'Double hop',price:640,icon:'↗↗',descriptionZh:'下一跳主動瞄準第二個落點，仍需掌握蓄力。',descriptionEn:'Aim at the second pad for your next hop; you still control power.'},
 {id:'adjust',zh:'空中微調',en:'Air adjustment',price:800,icon:'〰',descriptionZh:'預先啟用，下一跳最多修正28距離；差太遠仍會落水。',descriptionEn:'Arm before jumping; correct up to 28 distance on your next hop.'},
 {id:'rescue',zh:'緊急浮葉',en:'Rescue leaf',price:1000,icon:'☘',descriptionZh:'啟用一次保護，失足或平台下沉時浮葉接住你；不防魚嘴與荊棘。',descriptionEn:'Arm one rescue from a missed hop or sinking pad; fish and thorns still hurt.'}
]);
export const COMPANIONS=Object.freeze([
 {id:'hippo',zh:'泡泡河馬',en:'Bubble hippo',price:1200,icon:'🦛',descriptionZh:'每局一次，在失足或平台下沉時自動托起臨時落點。',descriptionEn:'Once per run, automatically catch a missed hop or sinking pad.'},
 {id:'ray',zh:'滑翔魔鬼魚',en:'Gliding ray',price:1440,icon:'◈',descriptionZh:'每局一次，差距在18以內時自動滑翔修正；不保護其他危險。',descriptionEn:'Once per run, correct a near miss within 18 distance.'},
 {id:'shark',zh:'護航小鯊魚',en:'Guardian shark',price:1680,icon:'🦈',descriptionZh:'每局一次，動物護盾用完後替你擋住燈籠魚。',descriptionEn:'Once per run, block an anglerfish after your animal shield is spent.'}
]);
export const equipment=(type,id)=>(type==='skill'?SKILLS:COMPANIONS).find(x=>x.id===id);
export function equipmentState(p){const ownedSkills=[...new Set((Array.isArray(p.ownedSkills)?p.ownedSkills:[]).filter(id=>SKILLS.some(x=>x.id===id)))],ownedCompanions=[...new Set((Array.isArray(p.ownedCompanions)?p.ownedCompanions:[]).filter(id=>COMPANIONS.some(x=>x.id===id)))];return {ownedSkills,equippedSkill:ownedSkills.includes(p.equippedSkill)?p.equippedSkill:'',ownedCompanions,companion:ownedCompanions.includes(p.companion)?p.companion:''};}
export function purchaseEquipment(p,type,id){if(typeof id!=='string'||!['skill','companion'].includes(type))throw Error('unknown-item');const item=equipment(type,id);if(id&&!item)throw Error('unknown-item');const state=equipmentState(p),owned=type==='skill'?'ownedSkills':'ownedCompanions',selected=type==='skill'?'equippedSkill':'companion',buy=!!id&&!state[owned].includes(id);if(buy&&p.coins<item.price)throw Error('not-enough-coins');return {...p,...state,coins:p.coins-(buy?item.price:0),[owned]:buy?[...state[owned],id]:state[owned],[selected]:id};}
