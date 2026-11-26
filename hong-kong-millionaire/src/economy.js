import {hkDay} from './game.js';
export const DRAW_PRICE=10000,GOLD_PRICE=80000,WEEKEND_PASS_PRICE=80000,WEEKEND_LIMIT=5,RETRY_PRICE=100000;
export const SERIES=Object.freeze([{id:'transport',name:'交通工具',prefix:'叮叮地膽'},{id:'heritage',name:'非物質文化遺產',prefix:'非遺守護者'},{id:'snacks',name:'街頭小吃',prefix:'食神'},{id:'streets',name:'老街日常',prefix:'老街收藏家'},{id:'harbour',name:'海港遊蹤',prefix:'海港漫遊者'},{id:'villages',name:'圍村與離島',prefix:'村落地膽'},{id:'crafts',name:'匠人手作',prefix:'手藝收藏家'}]);
// Shared date-derived offer: identical on every device; Firestore recomputes it.
export function retryDiscount(day=hkDay()){const seed=(day*48271+1013904223)%2147483647;return 5+((seed*48271+1013904223)%2147483647)%5;}
export const retryPrice=(day=hkDay())=>RETRY_PRICE/10*retryDiscount(day);
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
 ['lemon-tea-foil','snacks','凍檸茶時光',true,'茶、冰及檸檬配上長柄茶匙，是茶餐廳的熟悉組合；各店茶底與調味都有不同。',tourism],
 ['postbox','streets','街角郵筒',false,'郵筒讓書信在城市中流動；香港郵筒的外觀與款式隨年代及位置有所不同。','https://www.hongkongpost.hk/tc/home/index.html'],
 ['stationery','streets','屋邨文具舖',false,'鉛筆、練習簿與街坊問候，組成小店的日常；插畫是原創情境，並非特定店舖。',tourism],
 ['folding-gate','streets','摺閘與花磚',false,'金屬摺閘與紙皮石是香港舊街常見的建築細節，各區用途和年代不盡相同。',tourism],
 ['birdcage','streets','鳥籠茶敘',false,'養雀、賞雀與飲茶交流記錄了一種社交生活；欣賞文化亦要尊重動物福利。',tourism],
 ['pawn-neon-foil','streets','霓虹蝠鼠金錢',true,'傳統當舖招牌常見蝙蝠與錢幣意象，透過諧音寄託祝願。',tourism],
 ['enamel-mug-foil','streets','紅白藍街坊袋',true,'紅白藍編織袋、搪瓷杯與風車，承載不同世代的日常記憶；這是文化插畫組合。',tourism],
 ['island-pier','harbour','離島碼頭',false,'渡輪碼頭接連離島居民與市區。航線、船型及服務時間須以營辦商最新資料為準。',tourism],
 ['harbour-tram','harbour','叮叮海旁行',false,'電車穿梭港島街道，雙層車廂與架空電纜構成熟悉的城市輪廓。','https://www.hktramways.com/tc/'],
 ['sampan','harbour','避風塘舢舨',false,'舢舨與漁船展現香港水上生活的一面，今天部分地區仍可見這些船隻。',tourism],
 ['junk-sunset','harbour','紅帆夕照',false,'中式帆船與維港構成香港常見旅遊意象；圖中帆船是原創文化示意。',tourism],
 ['lighthouse-foil','harbour','燈塔與海風',true,'燈塔和助航設施為海上航行提供參考；插畫並非特定燈塔的工程或航海資料。','https://www.mardep.gov.hk/tc/'],
 ['harbour-night-foil','harbour','維港星夜',true,'維港夜景來自兩岸建築、船隻與水面倒影的交織，每次渡海都能發現不同風景。',tourism],
 ["peng-chau-lane","villages","坪洲小巷",false,"坪洲的街巷與海岸，保留島上生活和昔日工業的記憶。卡面是原創小島情境，不是特定街道實景。","https://www.gohk.gov.hk/tc/districts/is.php"],
 ["tai-o-bridge","villages","大澳橫水橋",false,"大澳橫水橋連接水道兩旁社區，來往街巷與棚屋一帶的步伐，寫下水鄉日常。","https://www.discoverhongkong.com/tc/explore/neighbourhoods/tai-o.html"],
 ["lamma-bay","villages","榕樹灣日常",false,"榕樹灣是南丫島的重要聚落，街坊、碼頭與海邊食店交織成離島生活。圖中店舖並非特定商戶。","https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Lamma+Island"],
 ["tsang-house","villages","曾大屋青磚",false,"曾大屋是沙田著名的客家圍村建築，青磚、天井與圍牆留下宗族聚居的歷史。插畫不作建築測繪用途。","https://www.amo.gov.hk/tc/home/index.html"],
 ["lai-chi-wo-foil","villages","荔枝窩古樹",true,"荔枝窩的客家村落與周邊樹林，呈現人與自然相依的社區記憶。閃光只屬視覺效果，不增加答題能力。","https://www.gohk.gov.hk/tc/search/spot.php"],
 ["cheung-chau-pier-foil","villages","長洲碼頭夜航",true,"碼頭的船燈與街燈，連起長洲街坊出入市區的日常。卡面記錄海邊氣氛，並非即時航班資訊。","https://www.sunferry.com.hk/zh/"],
 ["bamboo-steamer","crafts","竹蒸籠手藝",false,"傳統蒸籠以竹材製作，兼顧透氣、保溫與蒸氣疏導。一籠點心上枱之前，器物早已默默做足後勤。","https://www.icho.hk/documents/Education/edu_booklet/edu_booklet_2.pdf"],
 ["salt-crystals","crafts","鹽田結晶",false,"西貢鹽田梓保留曬鹽的文化記憶。海水、陽光與工序，讓看似平凡的鹽粒多了一層地方故事。","https://www.discoverhongkong.com/tc/explore/neighbourhoods/yim-tin-tsai.html"],
 ["eggroll-workshop","crafts","手工蛋卷",false,"蛋漿烘成薄片後趁熱捲起，放涼後成為酥脆蛋卷。師傅手勢俐落，慢半拍就可能由蛋卷變碎餅。","https://www.wenweipo.com/a/202603/22/AP69bf4840e4b04d7d56d995d2.html"],
 ["neon-workshop","crafts","霓虹屈管",false,"霓虹光管製作及造型技藝，把玻璃管塑成街頭文字與圖案。欣賞光影，也記住招牌背後的匠人。","https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf"],
 ["paper-lion-foil","crafts","紙紮醒獅",true,"竹篾、紙張與彩繪組成傳統紮作的生動面貌。醒獅圖案是本遊戲原創演繹，不指特定派別或師傅作品。","https://www.icho.hk/tc/web/icho/home.html"],
 ["painted-porcelain-foil","crafts","廣彩瓷光",true,"廣彩在瓷器上繪飾彩色圖案，花鳥與金彩展現工藝心思；它不等同只用鈷藍線條裝飾的青花。","https://www.icho.hk/tc/web/icho/home.html"],
 ["light-rail-car","transport","輕鐵月台",false,"黃色車身、月台與架空電線，記錄新界西北居民的日常節奏。插畫不代表特定車型或即時班次。","https://www.mtr.com.hk/ch/customer/services/light_rail_index.html",false],
 ["peak-tram-foil","transport","山頂纜車斜陽",true,"斜坡上的纜車連起中環與山頂，自1888年起見證城市變化。卡面是原創情境，並非工程或車型圖。","https://www.thepeak.com.hk/zh-hant/heritage/history-of-the-peak-tram",false],
 ["flower-cannon","heritage","花炮祝願",false,"傳統花炮會以裝飾精巧的花炮寄託社區祝願，背後連繫街坊協作及廟會文化。卡面描繪紙藝裝飾，不提供燃放示範。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["paper-windmill-foil","heritage","車公風車",true,"風車轉動的聲音，承載街坊祈求平安轉運的心意。閃光只是視覺效果，不保證運程或答題成功。","https://www.discoverhongkong.com/tc/explore/attractions/che-kung-temple.html",false],
 ["siu-mai-skewer","snacks","街角燒賣",false,"蒸氣升起，一串黃皮魚肉燒賣配醬汁，就是熟悉的街頭小食時刻。各店配方不同，名稱不保證配料完全一樣。","https://www.discoverhongkong.com/tc/explore/dining.html",false],
 ["red-bean-ice-foil","snacks","紅豆冰時光",true,"紅豆、奶與碎冰層層堆起，長匙一拌，把冰室午後慢慢攪勻。卡面不含品牌或固定食譜。","https://www.discoverhongkong.com/tc/explore/dining.html",false],
 ["shoe-repair-stall","streets","街坊補鞋檔",false,"鞋楦、線軸與磨亮的工具，留住小店師傅修補日常的手勢。一雙舊鞋多走一程，亦多留一段街坊故事。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["letter-writer-foil","streets","代客寫信",true,"紙筆、信封與小桌子，記錄昔日代客寫信及填表的街頭服務。插畫是歷史情境，不代表今天仍在營業的店檔。","https://www.hkmemory.hk/tc/",false],
 ["typhoon-shelter","harbour","銅鑼灣避風塘",false,"密密泊下的船隻與防波堤，讓繁華市區旁留住水上生活的畫面。插畫不作泊船或惡劣天氣航行指引。","https://www.mardep.gov.hk/tc/pub_services/npocguide.html",false],
 ["lei-yue-mun-foil","harbour","鯉魚門夜潮",true,"狹窄海峽兩岸的燈火，連起渡船、石礦與漁港的城市記憶。卡面為原創海岸夜景，不是指定店舖實景。","https://www.discoverhongkong.com/tc/explore/neighbourhoods/lei-yue-mun.html",false],
 ["kat-hing-courtyard","villages","吉慶圍庭院",false,"錦田吉慶圍以圍牆、村門與聚落歷史聞名。圖中庭院是文化情境演繹，不作私人村屋或建築測繪用途。","https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Kat+Hing+Wai",false],
 ["mui-wo-silvermine-foil","villages","梅窩銀礦灣",true,"梅窩海灣、碼頭與山巒，讓離島日常多了一份慢步調。昔日銀礦與今日海邊生活，共用同一段地方記憶。","https://www.discoverhongkong.com/tc/explore/neighbourhoods/mui-wo.html",false],
 ["scissor-repair","crafts","磨剪手藝",false,"磨石、剪刀與熟練手勢，記錄傳統磨剪服務。圖案只作文化收藏，並非刀具操作或維修教學。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["dough-figurine-foil","crafts","麵塑小人物",true,"小小麵糰在手中變成繽紛人物，捏、搓、點、壓都藏着師傅眼力。角色為原創，不仿照真人或影視人物。","https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf",false]
];
export const CULTURE_CARDS=Object.freeze(cards.map(([id,series,name,foil,story,source,prefixRequired=true])=>Object.freeze({id,series,name,foil,story,source,...(prefixRequired?{}:{prefixRequired:false})})));
export const GEAR=Object.freeze([
 {id:'frame-rwb',kind:'frame',name:'紅白藍膠袋框',price:20000,description:'紅白藍條紋，帶住街坊回憶上榜。'},
 {id:'frame-neon',kind:'frame',name:'霓虹燈招牌框',price:100000,description:'柔和霓虹光暈；減少動態效果設定下保持靜態。'},
 {id:'frame-gold',kind:'frame',name:'百萬支票鑲金框',price:500000,description:'用金邊記住你的長期挑戰。'},
 {id:'theme-cafe',kind:'theme',name:'茶餐廳冰室風',price:80000,description:'紙皮石背景與清晰餐牌字體，不改選項位置或作答時間。'},
 {id:'theme-ink',kind:'theme',name:'九龍街頭墨字風',price:250000,description:'致敬街頭文字文化的原創墨線，不複製曾灶財真跡。'},
 {id:'frame-jade',kind:'frame',name:'叮叮翡翠窗框',price:60000,description:'翡翠綠窗格、黃銅鉚釘與電車綠邊，框住一張街坊名片。'},
 {id:'frame-harbour',kind:'frame',name:'海港星光框',price:150000,description:'靛藍海浪、星光與船繩細節，把維港夜色戴上頭像。'},
 {id:'frame-lantern',kind:'frame',name:'花燈團圓框',price:120000,description:'朱紅燈籠、金線和流蘇，帶一點節慶的暖意。'},
 {id:'theme-harbour',kind:'theme',name:'維港星夜風',price:160000,description:'靛藍海港、細緻星光與暖金窗燈，題目保持清晰的淺色紙面。'},
 {id:'theme-tram',kind:'theme',name:'叮叮綠窗風',price:100000,description:'電車綠、黃銅窗框與軌道幾何，陪你遊走港島。'},
 {id:'theme-lantern',kind:'theme',name:'廟街花燈風',price:180000,description:'朱紅、暖金與燈籠花紋，留住香港夜市的熱鬧。'},
 {id:'theme-porcelain',kind:'theme',name:'青花瓷磚風',price:120000,description:'鈷藍釉線、細花與米白瓷磚，將冰室花紋放進日常答題。'},
 {id:'exit-redvan',kind:'exit',name:'紅Van接你走',price:50000,description:'割禾青後紅Van載你離場，支援裝置可播放「落車啦唔該！」。'},
 {"id":"frame-ferry","kind":"frame","name":"天星船繩框","price":42000,"description":"綠白船身與船繩結，裝起一程渡海回憶。"},
 {"id":"frame-waffle","kind":"frame","name":"雞蛋仔金邊框","price":56000,"description":"一格格金黃泡泡，街頭小食也可以做頭像邊框。"},
 {"id":"frame-bamboo","kind":"frame","name":"竹藝巧手框","price":68000,"description":"竹節與綁結細節，向本地傳統手藝致意。"},
 {"id":"frame-tile","kind":"frame","name":"唐樓花磚框","price":90000,"description":"墨綠與橘紅花磚，將舊街樓梯的記憶帶上榜。"},
 {"id":"theme-village","kind":"theme","name":"圍村青磚風","price":140000,"description":"青磚、屋脊與榕樹剪影，配清晰淺色答題紙面。"},
 {"id":"theme-island","kind":"theme","name":"離島海風","price":170000,"description":"碼頭欄杆、小船與海藍色，留住慢一拍的島上日常。"},
 {"id":"theme-workshop","kind":"theme","name":"香港手作坊","price":130000,"description":"竹編、瓷彩與溫暖工枱色，展示純外觀的匠人風格。"}
]);
const gearKindOrder={frame:0,theme:1,exit:2};
export const DISPLAY_GEAR=Object.freeze([...GEAR].sort((a,b)=>gearKindOrder[a.kind]-gearKindOrder[b.kind]||a.price-b.price));
export const NORMAL_CARDS=Object.freeze(CULTURE_CARDS.filter(c=>!c.foil).map(c=>c.id));
export const FOIL_CARDS=Object.freeze(CULTURE_CARDS.filter(c=>c.foil).map(c=>c.id));
export const cardById=id=>CULTURE_CARDS.find(c=>c.id===id);
export const gearById=id=>GEAR.find(c=>c.id===id);
export const walletBalance=(profile,wallet)=>Math.max(0,(profile?.total??0)+(wallet?.bonus??0)-(wallet?.spent??0));
export const unlockedPrefixes=wallet=>SERIES.filter(s=>CULTURE_CARDS.filter(c=>c.series===s.id&&c.prefixRequired!==false).every(c=>(wallet?.cards?.[c.id]??0)>0));
export function weekendKey(day=hkDay()){const weekday=(day+4)%7;return weekday===0?day-1:day+(6-weekday+7)%7;}
export const isWeekend=(day=hkDay())=>[0,6].includes((day+4)%7);
export function emptyWallet(uid,stamp){return {uid,spent:0,bonus:0,draws:0,cards:{},owned:[],frame:'none',theme:'default',exit:'default',prefix:'',pass:-1,passUses:0,retryBoughtDay:-1,retryUsedDay:-1,practiceDay:-1,practiceEarned:0,activeSession:'',activeKind:'',activeRoom:'',revision:0,op:'create',item:'',receipt:'',createdAt:stamp,updatedAt:stamp};}
const gcd=(a,b)=>b?gcd(b,a%b):a;
const stride=n=>{let step=5;while(gcd(step,n)!==1)step++;return step;};
export const GOLD_STRIDE=stride(FOIL_CARDS.length),DRAW_SLOTS=NORMAL_CARDS.length*10+FOIL_CARDS.length;
export function drawnCard(wallet,gold=false){
 const seed=Math.floor(wallet.createdAt?.toMillis?.()??wallet.createdAt??0);
 if(gold)return FOIL_CARDS[(seed+wallet.draws*GOLD_STRIDE)%FOIL_CARDS.length];
 const slot=(seed+wallet.draws*37)%DRAW_SLOTS;return slot<NORMAL_CARDS.length*10?NORMAL_CARDS[Math.floor(slot/10)]:FOIL_CARDS[slot-NORMAL_CARDS.length*10];
}
export function walletAction(profile,wallet,action,day=hkDay()){
 const next={...wallet,revision:wallet.revision+1,op:action.type,item:action.id??'',receipt:action.requestId??wallet.receipt};let cost=0;
 if(action.type==='buy'){const gear=gearById(action.id);if(!gear||wallet.owned.includes(gear.id))throw Error('already-owned');cost=gear.price;next.owned=[...wallet.owned,gear.id];}
 else if(action.type==='draw'||action.type==='gold'){cost=action.type==='gold'?GOLD_PRICE:DRAW_PRICE;next.item=drawnCard(wallet,action.type==='gold');next.cards={...wallet.cards,[next.item]:(wallet.cards[next.item]??0)+1};next.draws++;}
 else if(action.type==='equip'){
  if(action.slot==='prefix'){if(action.id!==''&&!unlockedPrefixes(wallet).some(s=>s.id===action.id))throw Error('not-owned');next.prefix=action.id;}
  else{if(!['frame','theme','exit'].includes(action.slot))throw Error('invalid-item');const reset=action.slot==='frame'?'none':'default';if(action.id!==reset&&(!wallet.owned.includes(action.id)||gearById(action.id)?.kind!==action.slot))throw Error('not-owned');next[action.slot]=action.id;}
  next.item=action.slot;
 }else if(action.type==='pass'){if(wallet.pass===weekendKey(day))throw Error('already-owned');cost=WEEKEND_PASS_PRICE;next.pass=weekendKey(day);next.passUses=0;}
 else if(action.type==='retry-ticket'){if(wallet.retryBoughtDay===day)throw Error('retry-bought');if(action.day!==undefined&&action.day!==day)throw Error('quote-expired');cost=retryPrice(day);if(action.price!==undefined&&action.price!==cost)throw Error('quote-expired');next.retryBoughtDay=day;}
 else throw Error('invalid-item');
 if(walletBalance(profile,wallet)<cost)throw Error('insufficient-balance');next.spent+=cost;return next;
}
export function prefixedTitle(wallet,title){const prefix=SERIES.find(s=>s.id===wallet?.prefix)?.prefix;return (prefix?'【'+prefix+'】':'')+title;}
export const practiceReward=correct=>Math.min(5000,Math.max(0,correct)*500);
export function randomSeed(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%1000000000;}
