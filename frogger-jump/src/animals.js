import {skillFor} from './animal-skills.js';
export const ANIMALS=Object.freeze([
 {id:'frog',zh:'小青蛙',en:'Frog',price:0,emoji:'🐸',color:'#83bb62',skillZh:'荷葉清道',skillEn:'Lily sweep'},
 {id:'penguin',zh:'小企鵝',en:'Penguin',price:120,emoji:'🐧',color:'#83afc5',skillZh:'凍凍冰橋',skillEn:'Ice bridge'},
 {id:'bunny',zh:'棉花兔',en:'Bunny',price:140,emoji:'🐰',color:'#e0b1b4',skillZh:'軟綿氣墊',skillEn:'Soft landing'},
 {id:'monkey',zh:'蕉蕉猴',en:'Monkey',price:180,emoji:'🐵',color:'#b58a63',skillZh:'藤蔓開路',skillEn:'Vine rescue'},
 {id:'otter',zh:'小水獺',en:'Otter',price:160,emoji:'🦦',color:'#bd9b7b',skillZh:'浪花護航',skillEn:'Splash guard'},
 {id:'duck',zh:'蛋黃鴨',en:'Duckling',price:180,emoji:'🐥',color:'#edc75d',skillZh:'鴨鴨浮台',skillEn:'Floating raft'},
 {id:'cat',zh:'奶茶花貓',en:'Tabby cat',price:200,emoji:'🐱',color:'#d5a06d',skillZh:'肉球救場',skillEn:'Paw cushion'},
 {id:'panda',zh:'糯米熊貓',en:'Panda',price:240,emoji:'🐼',color:'#e9e4d5',skillZh:'竹竹護橋',skillEn:'Bamboo bridge'},
 {id:'fox',zh:'橙橙狐',en:'Little fox',price:480,emoji:'🦊',color:'#d68a59',skillZh:'狐尾掃掃',skillEn:'Tail sweep'},
 {id:'capybara',zh:'慢活水豚',en:'Capybara',price:320,emoji:'🦫',color:'#b6a083',skillZh:'淡定結界',skillEn:'Calm waters'},
 {id:'mochi',zh:'糯糯星鼠',en:'Mochi starmouse',price:520,emoji:'🐹',color:'#edcfca',skillZh:'星星勇氣',skillEn:'Star courage'},
 {id:'chiikawa',zh:'小可愛',en:'Chiikawa',price:680,emoji:'🐹',color:'#f1ccd6',skillZh:'勇氣應援',skillEn:'Courage cheer'},
 {id:'hachiware',zh:'小八',en:'Hachiware',price:720,emoji:'🐱',color:'#a5c6e7',skillZh:'好朋友搭橋',skillEn:'Friendship bridge'},
 {id:'usagi',zh:'兔兔',en:'Usagi',price:760,emoji:'🐰',color:'#f2dda1',skillZh:'呀哈彈跳',skillEn:'Yaha bounce'},
 {id:'kurimanju',zh:'栗子頭',en:'Kurimanju',price:800,emoji:'🌰',color:'#c49a76',skillZh:'栗子補給',skillEn:'Chestnut comfort'},
 {id:'rakko',zh:'海獺師傅',en:'Rakko',price:1200,emoji:'🦦',color:'#f5eee2',skillZh:'師傅斬浪',skillEn:'Master wavecut'},
 {id:'momonga',zh:'飛鼠',en:'Momonga',price:840,emoji:'🐿️',color:'#bfd3e6',skillZh:'大尾護航',skillEn:'Fluffy escort'},
 {id:'shisa',zh:'獅薩',en:'Shisa',price:880,emoji:'🦁',color:'#efc285',skillZh:'獅舞守護',skillEn:'Shisa ward'},
 {id:'shimajiro',zh:'味自慢大叔',en:'Shimajiro',price:920,emoji:'🍜',color:'#c8a58d',skillZh:'味自慢救援',skillEn:'Island rescue'},
 {id:'mermaid',zh:'美人魚',en:'Mermaid',price:960,emoji:'🧜',color:'#efb0b0',skillZh:'人魚之歌',skillEn:'Mermaid song'},
 {id:'hitoha',zh:'一葉',en:'Hitoha',price:1000,emoji:'🌱',color:'#b7c9ab',skillZh:'一葉引路',skillEn:'Leaf path'},
 {id:'futaba',zh:'二葉',en:'Futaba',price:1040,emoji:'🌿',color:'#9cbd99',skillZh:'雙葉結界',skillEn:'Twin-leaf ward'},
 {id:'elf-mage',zh:'悠悠長耳法師',en:'Wandering elf mage',price:1120,emoji:'🌱',color:'#e2eee0',skillZh:'魔法檢查',skillEn:'Magic inspection'},
 {id:'violet-mage',zh:'紫藤小法師',en:'Violet apprentice',price:1160,emoji:'🌱',color:'#bcacd7',skillZh:'沉著護盾',skillEn:'Steady shield'},
 {id:'red-warrior',zh:'緋紅小戰士',en:'Crimson warrior',price:1200,emoji:'🌱',color:'#d88f80',skillZh:'勇氣開路',skillEn:'Brave path'},
 {id:'red-sprout',zh:'小紅花朵',en:'Red bloom',price:220,emoji:'🌱',color:'#e98579',skillZh:'紅花開路',skillEn:'Red bloom'},
 {id:'blue-sprout',zh:'小藍花朵',en:'Blue bloom',price:260,emoji:'🌱',color:'#86bce4',skillZh:'藍葉護航',skillEn:'Blue leaf'},
 {id:'yellow-sprout',zh:'小黃花朵',en:'Yellow bloom',price:280,emoji:'🌱',color:'#eed26e',skillZh:'黃花氣墊',skillEn:'Yellow bloom'},
 {id:'black-sprout',zh:'小黑花朵',en:'Little black bloom',price:300,emoji:'✿',color:'#656779',skillZh:'黑花護根',skillEn:'Root shelter'},
 {id:'pink-sprout',zh:'小粉花朵',en:'Little pink bloom',price:340,emoji:'✿',color:'#efb1cb',skillZh:'粉花應援',skillEn:'Petal cheer'},
 {id:'white-sprout',zh:'小白花朵',en:'Little white bloom',price:360,emoji:'✿',color:'#fffaf0',skillZh:'白花淨道',skillEn:'White bloom sweep'},
 {id:'purple-sprout',zh:'小紫花朵',en:'Little purple bloom',price:400,emoji:'✿',color:'#b79bd9',skillZh:'紫花穩步',skillEn:'Steady petals'},
 {id:'ice-sprout',zh:'小冰花朵',en:'Little ice bloom',price:440,emoji:'❄',color:'#b4e8ed',skillZh:'冰花護航',skillEn:'Frost escort'},
 {id:'bloom-bunny',zh:'兔兔花苗',en:'Bloom bunny',price:1280,emoji:'🌱',color:'#edcaa2',skillZh:'花耳應援',skillEn:'Bloom cheer'},
 {id:'mage-otter',zh:'長耳魔法水獺',en:'Mage otter',price:1360,emoji:'🌱',color:'#bad6cd',skillZh:'水獺結界',skillEn:'Otter spell'},
 {id:'dawn-hero',zh:'曙光小勇者',en:'Dawn hero',price:1440,emoji:'⚔',color:'#91bed7',skillZh:'勇者遠躍',skillEn:'Hero leap'},
 {id:'stone-dwarf',zh:'磐石小矮人',en:'Stone dwarf',price:1520,emoji:'⚒',color:'#c68c70',skillZh:'磐石守橋',skillEn:'Stone anchor'},
 {id:'gentle-priest',zh:'和煦小牧師',en:'Gentle priest',price:1600,emoji:'☀',color:'#a3bda0',skillZh:'祈願浮葉',skillEn:'Prayer rescue'}
].map(a=>{const skill=skillFor(a.id);return {...a,ability:skill.type,descriptionZh:skill.descriptionZh,descriptionEn:skill.descriptionEn,...(skill.skillZh?{skillZh:skill.skillZh,skillEn:skill.skillEn}:{})};}));
export const animal=id=>ANIMALS.find(a=>a.id===id)??ANIMALS[0];
export const rewardCoins=(score,bonus=0)=>1+Math.max(0,Math.floor(score))*2+Math.floor(Math.max(0,score)/20)*10+Math.max(0,Math.min(Math.floor(bonus),Math.max(0,Math.floor(score))*3));

export function shopAnimals(ownedOnly=false,owned=[]){return ANIMALS.filter(a=>!ownedOnly||owned.includes(a.id)).slice().sort((a,b)=>a.price-b.price||a.id.localeCompare(b.id));}
export function motionFor(id){const i=ANIMALS.findIndex(a=>a.id===id);return {spring:1+(i%5)*.08,sway:((i%3)-1)*.06,kick:.7+(i%4)*.17,settle:1+(i%4)*.09};}
