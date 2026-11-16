import {hkDay} from './game.js';
export const SERIES=Object.freeze([{id:'transport',name:'交通工具',prefix:'叮叮地膽',icon:'🚋'},{id:'heritage',name:'非物質文化遺產',prefix:'非遺守護者',icon:'🏮'},{id:'snacks',name:'街頭小吃',prefix:'食神',icon:'🥣'}]);
const tourism='https://www.discoverhongkong.com/tc/explore.html',ich='https://www.icho.hk/tc/web/icho/home.html';
const cards=[
 ['hotdog','transport','熱狗巴士',false,'「熱狗」是香港人對昔日沒有空調巴士的俗稱，記錄公共交通設備的變遷。',tourism],
 ['old-ferry','transport','昔日天星小輪',false,'維港渡輪連起兩岸日常生活；傳統雙頭船身及可翻轉椅背是經典設計。','https://www.starferry.com.hk/tc'],
 ['new-ferry','transport','今日維港渡輪',false,'渡輪服務持續演變，不同年代的設備有所不同，不能把舊船配置視為所有現役船隻的標準。','https://www.starferry.com.hk/tc'],
 ['first-metro','transport','第一代地鐵',false,'香港地下鐵路在1979年開始服務；早期不銹鋼座椅成為許多人的集體回憶。','https://www.mtr.com.hk/ch/customer/services/index.php'],
 ['whiteplate-foil','transport','白牌車檔案',true,'「白牌車」常指未取得所需許可而取酬載客的私家車；這是交通史話題，不代表合法出租服務。','https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/taxi/index.html'],
 ['tram-foil','transport','叮叮金光',true,'電車自1904年起服務港島。叮叮既是交通工具，也是香港街道節奏的一部分。','https://www.hktramways.com/tc/'],
 ['bun-tower','heritage','搶包山',false,'搶包山是長洲太平清醮最廣為人知的活動之一，實際賽事有專門安全及競賽安排。',ich],
 ['fire-dragon','heritage','大坑舞火龍',false,'大坑舞火龍與中秋節慶相連，社區成員以協作延續這項傳統。',ich],
 ['mahjong-carving','heritage','手雕麻雀',false,'手工麻雀雕刻結合刻字、着色及磨整工序，每粒牌都留下工藝痕跡。',ich],
 ['bamboo-theatre','heritage','戲棚竹藝',false,'傳統戲棚結合竹材、結構及捆紮工藝，不是幾根普通竹籤就能承重的工程。',ich],
 ['flower-foil','heritage','花牌閃耀',true,'花牌以竹篾、彩紙及文字傳遞祝賀和心意，是街坊文化的一部分。',ich],
 ['floating-colour-foil','heritage','飄色童夢',true,'長洲飄色巧妙隱藏支撐結構，以服飾構成巡遊場景，承載社區合作與節慶記憶。',ich],
 ['rice-roll','snacks','豬腸粉',false,'豬腸粉是米漿製成的卷狀粉食，名字來自外形，並非以豬腸作原料。',tourism],
 ['egg-waffle','snacks','雞蛋仔',false,'泡狀小格連成雞蛋仔，外脆內軟是街頭即製小食的特色。各店配方各異。',tourism],
 ['dog-noodle','snacks','狗仔粉',false,'狗仔粉指形狀短小的粉條及其湯食，名稱並不代表加入狗肉。',tourism],
 ['bowl-pudding','snacks','缽仔糕',false,'缽仔糕以小缽蒸製，常見米漿與糖等材料，有紅豆與其他款式。',tourism],
 ['milk-tea-foil','snacks','絲襪奶茶',true,'以布袋反覆濾茶的港式奶茶留下飲食記憶；布袋並非真正絲襪。',ich],
 ['lemon-tea-foil','snacks','凍檸茶時光',true,'茶、冰及檸檬配上長柄茶匙，是茶餐廳的熟悉組合；各店茶底與調味都有不同。',tourism]
];
export const CULTURE_CARDS=Object.freeze(cards.map(([id,series,name,foil,story,source])=>Object.freeze({id,series,name,foil,story,source})));
export const GEAR=Object.freeze([
 {id:'frame-rwb',kind:'frame',name:'紅白藍膠袋框',price:20000,description:'紅白藍條紋，帶住街坊回憶上榜。'},
 {id:'frame-neon',kind:'frame',name:'霓虹燈招牌框',price:100000,description:'柔和霓虹光暈；減少動態效果設定下保持靜態。'},
 {id:'frame-gold',kind:'frame',name:'百萬支票鑲金框',price:500000,description:'用金邊記住你的長期挑戰。'},
 {id:'theme-cafe',kind:'theme',name:'茶餐廳冰室風',price:80000,description:'紙皮石背景與清晰餐牌字體，不改選項位置或作答時間。'},
 {id:'theme-ink',kind:'theme',name:'九龍街頭墨字風',price:250000,description:'致敬街頭文字文化的原創墨線，不複製曾灶財真跡。'},
 {id:'exit-redvan',kind:'exit',name:'紅Van接你走',price:50000,description:'割禾青後紅Van載你離場，支援裝置可播放「落車啦唔該！」。'}
]);
export const NORMAL_CARDS=Object.freeze(CULTURE_CARDS.filter(c=>!c.foil).map(c=>c.id));
export const FOIL_CARDS=Object.freeze(CULTURE_CARDS.filter(c=>c.foil).map(c=>c.id));
export const cardById=id=>CULTURE_CARDS.find(c=>c.id===id);
export const gearById=id=>GEAR.find(c=>c.id===id);
export const walletBalance=(profile,wallet)=>Math.max(0,(profile?.total??0)+(wallet?.bonus??0)-(wallet?.spent??0));
export const unlockedPrefixes=wallet=>SERIES.filter(s=>CULTURE_CARDS.filter(c=>c.series===s.id).every(c=>(wallet?.cards?.[c.id]??0)>0));
export function weekendKey(day=hkDay()){const weekday=(day+4)%7;return weekday===0?day-1:day+(6-weekday+7)%7;}
export const isWeekend=(day=hkDay())=>[0,6].includes((day+4)%7);
export function emptyWallet(uid,stamp){return {uid,spent:0,bonus:0,draws:0,cards:{},owned:[],frame:'none',theme:'default',exit:'default',prefix:'',pass:-1,passUses:0,practiceDay:-1,practiceEarned:0,activeSession:'',activeKind:'',activeRoom:'',revision:0,op:'create',item:'',receipt:'',createdAt:stamp,updatedAt:stamp};}
export function drawnCard(wallet,gold=false){
 const seed=Math.floor(wallet.createdAt?.toMillis?.()??wallet.createdAt??0);
 if(gold)return FOIL_CARDS[(seed+wallet.draws*5)%FOIL_CARDS.length];
 const slot=(seed+wallet.draws*37)%126;return slot<120?NORMAL_CARDS[Math.floor(slot/10)]:FOIL_CARDS[slot-120];
}
export function walletAction(profile,wallet,action,day=hkDay()){
 const next={...wallet,revision:wallet.revision+1,op:action.type,item:action.id??'',receipt:action.requestId??wallet.receipt};let cost=0;
 if(action.type==='buy'){const gear=gearById(action.id);if(!gear||wallet.owned.includes(gear.id))throw Error('already-owned');cost=gear.price;next.owned=[...wallet.owned,gear.id];}
 else if(action.type==='draw'||action.type==='gold'){cost=action.type==='gold'?50000:5000;next.item=drawnCard(wallet,action.type==='gold');next.cards={...wallet.cards,[next.item]:(wallet.cards[next.item]??0)+1};next.draws++;}
 else if(action.type==='equip'){
  if(action.slot==='prefix'){if(action.id!==''&&!unlockedPrefixes(wallet).some(s=>s.id===action.id))throw Error('not-owned');next.prefix=action.id;}
  else{if(!['frame','theme','exit'].includes(action.slot))throw Error('invalid-item');const reset=action.slot==='frame'?'none':'default';if(action.id!==reset&&(!wallet.owned.includes(action.id)||gearById(action.id)?.kind!==action.slot))throw Error('not-owned');next[action.slot]=action.id;}
  next.item=action.slot;
 }else if(action.type==='pass'){if(wallet.pass===weekendKey(day))throw Error('already-owned');cost=100000;next.pass=weekendKey(day);next.passUses=0;}
 else throw Error('invalid-item');
 if(walletBalance(profile,wallet)<cost)throw Error('insufficient-balance');next.spent+=cost;return next;
}
export function prefixedTitle(wallet,title){const prefix=SERIES.find(s=>s.id===wallet?.prefix)?.prefix;return (prefix?'【'+prefix+'】':'')+title;}
export const practiceReward=correct=>Math.min(5000,Math.max(0,correct)*500);
export function randomSeed(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%1000000000;}
