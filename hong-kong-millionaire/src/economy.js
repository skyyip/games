import {hkDay} from './game.js';
import {LEGEND_CARDS,LEGEND_THEME,LEGEND_COLLECTION_STEP,LEGEND_GAMES_STEP,legendComplete} from './legend-cards.js';
export {LEGEND_CARDS,LEGEND_THEME,legendComplete} from './legend-cards.js';
export const DRAW_PRICE=10000,GOLD_PRICE=80000,WEEKEND_PASS_PRICE=80000,WEEKEND_LIMIT=5,RETRY_PRICE=100000;
export const SERIES=Object.freeze([{id:'transport',name:'交通工具',prefix:'交通達人'},{id:'heritage',name:'非物質文化遺產',prefix:'非遺守護者'},{id:'snacks',name:'街頭小吃',prefix:'食神'},{id:'streets',name:'老街日常',prefix:'老街收藏家'},{id:'harbour',name:'海港遊蹤',prefix:'海港漫遊者'},{id:'villages',name:'圍村與離島',prefix:'村落地膽'},{id:'crafts',name:'匠人手作',prefix:'手藝收藏家'},{id:'adventure',name:'山水探險家',prefix:'山水探險家'},{id:'legend',name:'香港傳說・隱藏典藏',prefix:'香江傳奇'}]);
// Shared date-derived offer: identical on every device; Firestore recomputes it.
export function retryDiscount(day=hkDay()){const seed=(day*48271+1013904223)%2147483647;return 5+((seed*48271+1013904223)%2147483647)%5;}
export const retryPrice=(day=hkDay())=>RETRY_PRICE/10*retryDiscount(day);
const tourism='https://www.discoverhongkong.com/tc/culture.html',ich='https://www.icho.hk/tc/web/icho/home.html';
const cards=[
 ['hotdog','transport','熱狗巴士',false,'「熱狗」是香港人對昔日沒有空調巴士的俗稱，記錄公共交通設備的變遷。',tourism],
 ['old-ferry','transport','昔日天星小輪',false,'維港渡輪連起兩岸日常生活；傳統雙頭船身及可翻轉椅背是經典設計。','https://www.starferry.com.hk/tc'],
 ['new-ferry','transport','今日維港渡輪',false,'渡輪由舊款走到新款，船艙一路變，靠窗睇海嗰個位一樣最搶手。返工搭船，都可以偷到一陣海風。','https://www.starferry.com.hk/tc'],
 ['first-metro','transport','第一代地鐵',false,'香港地下鐵路在1979年開始服務；早期不銹鋼座椅成為許多人的集體回憶。','https://www.mtr.com.hk/ch/customer/services/index.php'],
 ['whiteplate-foil','transport','白牌車檔案',true,'「白牌車」常指未取得所需許可、卻取酬載客的私家車。車牌睇落平平無奇，背後原來有一段香港交通故事。','https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/taxi/index.html'],
 ['tram-foil','transport','叮叮金光',true,'電車自1904年起服務港島。叮叮既是交通工具，也是香港街道節奏的一部分。','https://www.hktramways.com/tc/'],
 ['bun-tower','heritage','搶包山',false,'長洲太平清醮嘅搶包山，睇住選手向上爬，圍觀都忍唔住握實拳頭。平時買包排隊，呢度攞包要講身手。',ich],
 ['fire-dragon','heritage','大坑舞火龍',false,'大坑舞火龍與中秋節慶相連，社區成員以協作延續這項傳統。',ich],
 ['mahjong-carving','heritage','手雕麻雀',false,'手工麻雀雕刻結合刻字、着色及磨整工序，每粒牌都留下工藝痕跡。',ich],
 ['bamboo-theatre','heritage','戲棚竹藝',false,'竹材一紮一綁，搭出街坊睇大戲嘅戲棚。台上唱得精彩，台下撐場嘅搭棚功夫一樣有戲。',ich],
 ['flower-foil','heritage','花牌閃耀',true,'花牌以竹篾、彩紙及文字傳遞祝賀和心意，是街坊文化的一部分。',ich],
 ['floating-colour-foil','heritage','飄色童夢',true,'長洲飄色巧妙隱藏支撐結構，以服飾構成巡遊場景，承載社區合作與節慶記憶。',ich],
 ['rice-roll','snacks','豬腸粉',false,'豬腸粉是米漿製成的卷狀粉食，名字來自外形，並非以豬腸作原料。',tourism],
 ['egg-waffle','snacks','雞蛋仔',false,'一底雞蛋仔，外脆內軟，未行出街口已經少咗半底。話好帶返屋企分享，通常都要再買一底。',tourism],
 ['dog-noodle','snacks','狗仔粉',false,'狗仔粉指形狀短小的粉條及其湯食，名稱並不代表加入狗肉。',tourism],
 ['bowl-pudding','snacks','缽仔糕',false,'缽仔糕以小缽蒸製，常見米漿與糖等材料，有紅豆與其他款式。',tourism],
 ['milk-tea-foil','snacks','絲襪奶茶',true,'以布袋反覆濾茶的港式奶茶留下飲食記憶；布袋並非真正絲襪。',ich],
 ['lemon-tea-foil','snacks','凍檸茶時光',true,'茶、冰及檸檬配上長柄茶匙，是茶餐廳的熟悉組合；各店茶底與調味都有不同。',tourism],
 ['postbox','streets','街角郵筒',false,'郵筒讓書信在城市中流動；香港郵筒的外觀與款式隨年代及位置有所不同。','https://www.hongkongpost.hk/tc/home/index.html'],
 ['stationery','streets','屋邨文具舖',false,'鉛筆、練習簿、擦膠排滿架，文具舖老闆仲記得你係邊間學校。細個話買支筆，最後總會望多兩眼貼紙。',tourism],
 ['folding-gate','streets','摺閘與花磚',false,'金屬摺閘與紙皮石是香港舊街常見的建築細節，各區用途和年代不盡相同。',tourism],
 ['birdcage','streets','鳥籠茶敘',false,'提住雀籠、飲啖茶，慢慢傾出一朝早嘅街坊情。雀仔一開聲，隔籬枱都有話題。',tourism],
 ['pawn-neon-foil','streets','霓虹蝠鼠金錢',true,'傳統當舖招牌常見蝙蝠與錢幣意象，透過諧音寄託祝願。',tourism],
 ['enamel-mug-foil','streets','紅白藍街坊袋',true,'紅白藍袋、搪瓷杯、轉轉風車，幾件小物就裝滿幾代人嘅回憶。未必值好多錢，但望住就諗起屋企。',tourism],
 ['island-pier','harbour','離島碼頭',false,'渡輪碼頭一邊連住市區，一邊連住離島生活。對遊客係出發去玩，對街坊係熟悉嘅返屋企路。',tourism],
 ['harbour-tram','harbour','叮叮海旁行',false,'電車穿梭港島街道，雙層車廂與架空電纜構成熟悉的城市輪廓。','https://www.hktramways.com/tc/'],
 ['sampan','harbour','避風塘舢舨',false,'舢舨與漁船展現香港水上生活的一面，今天部分地區仍可見這些船隻。',tourism],
 ['junk-sunset','harbour','紅帆夕照',false,'紅帆映住維港晚霞，海風一吹，個人都自動慢半拍。同一個海港，返工望同放假望，心情可以差好遠。',tourism],
 ['lighthouse-foil','harbour','燈塔與海風',true,'海面一點燈光，替來往船隻認住方向。城市愈夜愈熱鬧，燈塔就一直默默當值。','https://www.mardep.gov.hk/tc/'],
 ['harbour-night-foil','harbour','維港星夜',true,'維港夜景來自兩岸建築、船隻與水面倒影的交織，每次渡海都能發現不同風景。',tourism],
 ["peng-chau-lane","villages","坪洲小巷",false,"坪洲小巷連住海邊，轉個彎又見一間街坊小店。城市催你行快啲，小島就請你慢慢嚟。","https://www.gohk.gov.hk/tc/districts/is.php"],
 ["tai-o-bridge","villages","大澳橫水橋",false,"大澳橫水橋連接水道兩旁社區，來往街巷與棚屋一帶的步伐，寫下水鄉日常。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-tai-o-village.html"],
 ["lamma-bay","villages","榕樹灣日常",false,"榕樹灣嘅碼頭、食店同海風，砌成南丫島嘅日常。諗住落船行兩步，轉頭已經坐低叫嘢食。","https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Lamma+Island"],
 ["tsang-house","villages","曾大屋青磚",false,"曾大屋嘅青磚、天井同圍牆，留住沙田客家圍村嘅生活痕跡。市區高樓愈起愈高，呢度嘅故事就藏喺磚縫之間。","https://www.amo.gov.hk/tc/home/index.html"],
 ["lai-chi-wo-foil","villages","荔枝窩古樹",true,"荔枝窩嘅客家村落依住樹林，老樹同村屋一齊守住歲月。嚟到先發現，最值得留低嘅可能係一陣清靜。","https://www.gohk.gov.hk/tc/search/spot.php"],
 ["cheung-chau-pier-foil","villages","長洲碼頭夜航",true,"船燈同街燈照住長洲碼頭，有人出發，有人返屋企。遊客仲掛住影夜景，街坊已經諗緊今晚食乜。","https://www.sunferry.com.hk/zh/"],
 ["bamboo-steamer","crafts","竹蒸籠手藝",false,"傳統蒸籠以竹材製作，兼顧透氣、保溫與蒸氣疏導。一籠點心上枱之前，器物早已默默做足後勤。","https://www.icho.hk/documents/Education/edu_booklet/edu_booklet_2.pdf"],
 ["salt-crystals","crafts","鹽田結晶",false,"西貢鹽田梓保留曬鹽的文化記憶。海水、陽光與工序，讓看似平凡的鹽粒多了一層地方故事。","https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Yim+Tin+Tsai"],
 ["eggroll-workshop","crafts","手工蛋卷",false,"蛋漿烘成薄片後趁熱捲起，放涼後成為酥脆蛋卷。師傅手勢俐落，慢半拍就可能由蛋卷變碎餅。","https://www.wenweipo.com/a/202603/22/AP69bf4840e4b04d7d56d995d2.html"],
 ["neon-workshop","crafts","霓虹屈管",false,"霓虹光管製作及造型技藝，把玻璃管塑成街頭文字與圖案。欣賞光影，也記住招牌背後的匠人。","https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf"],
 ["paper-lion-foil","crafts","紙紮醒獅",true,"竹篾做骨、紙張做面，再落一筆精神彩繪，醒獅就有晒神氣。師傅未敲鑼，個獅頭已經好似想出場。","https://www.icho.hk/tc/web/icho/home.html"],
 ["painted-porcelain-foil","crafts","廣彩瓷光",true,"廣彩在瓷器上繪飾彩色圖案，花鳥與金彩展現工藝心思；它不等同只用鈷藍線條裝飾的青花。","https://www.icho.hk/tc/web/icho/home.html"],
 ["light-rail-car","transport","輕鐵月台",false,"月台、架空電線同熟悉車影，串起新界西北嘅日常。聽到車聲就加快腳步，街坊隻腳比鬧鐘更準時。","https://www.mtr.com.hk/ch/customer/services/lt_bus_index.html",false],
 ["peak-tram-foil","transport","山頂纜車斜陽",true,"山頂纜車自1888年起沿住斜坡上落，陪香港變咗一個又一個模樣。坐低望出窗，樓宇好似一齊打斜企。","https://www.thepeak.com.hk/zh-hant/heritage/history-of-the-peak-tram",false],
 ["flower-cannon","heritage","花炮祝願",false,"花炮會嘅精巧裝飾，裝滿街坊祝願，亦靠眾人一齊出力。平時各有各忙，做起廟會就齊心夾手夾腳。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["paper-windmill-foil","heritage","車公風車",true,"車公廟外風車轉呀轉，街坊帶住平安轉運嘅心意而來。未講今年有幾順，手上嗰個已經轉得好起勁。","https://www.discoverhongkong.com/tc/explore/attractions/che-kung-temple.html",false],
 ["siu-mai-skewer","snacks","街角燒賣",false,"一串黃皮燒賣，加豉油定辣油，街坊各有堅持。明明話只係醫肚，食完又忍唔住望多眼魚蛋。","https://www.discoverhongkong.com/tc/explore/dining.html",false],
 ["red-bean-ice-foil","snacks","紅豆冰時光",true,"紅豆、奶、碎冰層層疊起，長匙一攪就係冰室午後。最忙嗰刻，大概係要救返杯底最後幾粒紅豆。","https://www.discoverhongkong.com/tc/explore/dining.html",false],
 ["shoe-repair-stall","streets","街坊補鞋檔",false,"鞋楦、線軸與磨亮的工具，留住小店師傅修補日常的手勢。一雙舊鞋多走一程，亦多留一段街坊故事。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["letter-writer-foil","streets","代客寫信",true,"昔日街頭一張小桌、幾張信紙，就幫人把心事寫成家書。唔知點開口嘅說話，交到師傅手上就慢慢成句。","https://www.hkmemory.hk/tc/",false],
 ["typhoon-shelter","harbour","銅鑼灣避風塘",false,"銅鑼灣避風塘泊滿船影，繁華街道旁邊又係另一種生活節奏。岸上車聲咁急，水面倒影就慢慢搖。","https://www.mardep.gov.hk/tc/pub_services/npocguide.html",false],
 ["lei-yue-mun-foil","harbour","鯉魚門夜潮",true,"鯉魚門嘅渡船、石礦同漁港記憶，隨兩岸燈火一齊映落海。一路望夜景，個胃亦一路提醒你附近有海鮮。","https://www.discoverhongkong.com/tc/explore/neighbourhoods/lei-yue-mun.html",false],
 ["kat-hing-courtyard","villages","吉慶圍庭院",false,"錦田吉慶圍嘅圍牆同村門，記住村落幾代人嘅生活。望過去係一幅古老建築，行近先感受到仲有人住嘅日常。","https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Kat+Hing+Wai",false],
 ["mui-wo-silvermine-foil","villages","梅窩銀礦灣",true,"梅窩海灣、碼頭與山巒，讓離島日常多了一份慢步調。昔日銀礦與今日海邊生活，共用同一段地方記憶。","https://www.discoverhongkong.com/tc/explore/neighbourhoods/mui-wo.html",false],
 ["scissor-repair","crafts","磨剪手藝",false,"剪刀交到磨剪師傅手上，幾下熟練手勢，又可以繼續開工。用慣嘅工具唔捨得換，街坊都識嗰種感情。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["dough-figurine-foil","crafts","麵塑小人物",true,"麵糰喺師傅指尖捏、搓、點、壓，轉眼變成有表情嘅小人物。你仲未諗到整乜，人哋已經整好個髮型。","https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf",false],
 ["cross-harbour-bus","transport","過海巴士日常",false,"車窗外嘅隧道入口，連起港九兩岸每日嘅返工路。上車諗住瞓一陣，醒返又要準備打卡。","https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/buses/index.html",false],
 ["kai-tak-ferry-foil","transport","啟德碼頭海風",true,"啟德海濱遇上渡輪，舊岸線同新風景一齊入鏡。返程唔一定要趕，吹多一陣海風先。","https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/ferries/service_details/",false],
 ["hungry-ghost-theatre","heritage","盂蘭戲台",false,"戲棚、紙紮同街坊協力，延續潮籍盂蘭勝會嘅社區傳統。台上一段戲，台下有成班人默默張羅。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["hakka-unicorn-foil","heritage","坑口麒麟彩",true,"西貢坑口客家麒麟舞，彩色麒麟伴住鼓鑼送上祝福。一聽到熱鬧聲，街坊未見到隊伍已經探頭望。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["sugar-onion-wrap","snacks","糖蔥餅小攤",false,"鬆脆糖蔥藏在薄餅皮裡，配上椰絲與芝麻，捲起一口懷舊。名字有蔥，實際主角卻是糖。","https://www.thinkhk.com/article/2019-11/01/37256.html",false],
 ["pineapple-bun-foil","snacks","菠蘿油暖意",true,"酥皮菠蘿包夾住厚切牛油，冰室下午茶即刻到位。話好切開兩份，落刀嗰陣先發現自己唔太想分。","https://www.discoverhongkong.com/tc/explore/dining.html",false],
 ["fruit-market-crates","streets","果欄木箱",false,"油麻地果欄木箱疊住木箱，鮮果同搬運身影忙個不停。你仲喺夢入面，人哋已經幫城市備好早餐水果。","https://www.discoverhongkong.com/tc/explore/neighbourhoods/yau-ma-tei.html",false],
 ["night-dai-pai-dong-foil","streets","大牌檔鑊氣",true,"爐火一響、鑊氣一升，鐵枱旁邊嘅街坊又加多碟。話好隨便食啲，最後張枱照樣擺到滿。","https://www.discoverhongkong.com/tc/explore/dining.html",false],
 ["seafood-market","harbour","魚市場晨光",false,"清晨漁船靠岸，魚筐同忙碌身影接住上場。城市未完全醒，魚市場已經熱鬧過你部電話嘅鬧鐘。","https://www.fmo.org.hk/",false],
 ["star-ferry-rope-foil","harbour","碼頭船繩",true,"纜繩、木柱、小輪水花，砌成一趟熟悉嘅維港航程。明明日日都經過，今日都想再影多張。","https://www.starferry.com.hk/tc",false],
 ["sha-tau-kok-lanterns","villages","沙頭角魚燈",false,"沙頭角魚燈色彩鮮明，帶住社區記憶游進街巷。平時魚喺水入面游，節慶就輪到街坊提住佢行。","https://www.discoverhongkong.com/tc/neighbourhoods/sha-tau-kok.html",false],
 ["po-toi-shore-foil","villages","蒲台石岸",true,"蒲台島花崗岩岸邊，海浪一下一下拍出節奏。遠望小島好似好靜，行近先知海風都有好多說話。","https://www.discoverhongkong.com/tc/explore/great-outdoor/po-toi-island.html",false],
 ["minibus-signwriting","crafts","小巴水牌",false,"小巴目的地水牌一筆一畫寫出嚟，字體都帶住街頭性格。平時淨係顧住睇去邊，今日終於睇真啲師傅手勢。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["wedding-embroidery-foil","crafts","裙褂金繡",true,"金銀線喺紅布上繡出吉祥圖案，一針一線都係裙褂手藝。大日子最搶眼嘅細節，原來早就有人耐心準備。","https://www.icho.hk/tc/web/icho/home.html",false],
 ["green-minibus-corner","transport","綠Van轉角",false,"綠Van轉過街角，又接住一程街坊日常。路口景物未睇清，熟客已經準備叫「有落」。","https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/minibuses/index.html",false],
 ["airport-express-foil","transport","機場快綫晨光",true,"機場快綫連住市區同機場，行李喼裝住出發嘅期待，同返嚟嘅手信。去程怕遲，回程最怕個喼唔夠位。","https://www.mtr.com.hk/ch/customer/services/airport_express_index.html",false],
 ["rabbit-lantern","heritage","兔仔燈籠",false,"竹篾、紙材與一雙巧手，把中秋的期待紮成兔仔燈。呢隻兔唔使餵紅蘿蔔，最怕反而係落雨。","https://www.icho.hk/tc/web/icho/representative_list_paper_crafting.html",false],
 ["tai-o-dragonboat-foil","heritage","大澳龍舟遊涌",true,"大澳端午龍舟遊涌由漁業行會延續，龍舟與神艇沿水道巡遊。岸邊一聲招呼，水鄉街坊又聚埋一齊。","https://www.icho.hk/tc/web/icho/representative_list_taio.html",false],
 ["cart-noodle-stall","snacks","車仔麵小攤",false,"配料逐樣揀、醬汁各有個性，一碗車仔麵裝得落街坊口味。平日選擇困難，去到麵檔卻忽然好有主見。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-man-kee-cart-noodles.html",false],
 ["egg-tart-counter-foil","snacks","蛋撻出爐",true,"金黃蛋撻排滿餅盤，酥皮與蛋香寫下香港餅店的下午茶。袋住帶走之前，通常先同自己談判要買幾多個。","https://hk.science.museum/tc/web/scm/online-explore/qkpost-roadshow-food/eggtart.html",false],
 ["newspaper-kiosk","streets","街角報紙檔",false,"報紙、雜誌加聲「早晨」，小小報檔就係街坊資訊站。未打開報紙，老闆可能已經同你講咗半個頭條。","https://www.hkmemory.hk/",false],
 ["rainy-arcade-foil","streets","騎樓雨夜",true,"騎樓下的傘尖、水光與暖燈，替一場香港驟雨留個溫柔側面。趕路可以快，收遮記得唔好濺到隔籬位街坊。","https://www.discoverhongkong.com/tc/culture.html",false],
 ["container-port","harbour","貨櫃碼頭",false,"貨櫃同吊機排出香港港口嘅熟悉輪廓。遠望好似積木，背後就係專業團隊一更接一更嘅功夫。","https://www.mardep.gov.hk/tc/materials-and-publications/publications/hk-fact-sheet/index.html",false],
 ["stonecutters-bridge-foil","harbour","昂船洲橋影",true,"昂船洲大橋橫跨藍巴勒海峽，橋影同船影一齊畫出港口夜景。日頭顧住趕路，夜晚先發現原來咁靚。","https://hkie.org.hk/ea/tc/project/98",false],
 ["yim-tin-tsai-chapel","villages","鹽田梓小堂",false,"鹽田梓聖若瑟小堂旁嘅村路，串起小島社區嘅記憶。沿住路慢慢行，先發現一個轉角都可以留低好耐。","https://www.gohk.gov.hk/en/spots/spot_detail.php?spot=Yim+Tin+Tsai",false],
 ["tung-ping-chau-foil","villages","東平洲層岩",true,"東平洲層層沉積岩，好似大自然翻開嘅一本厚書。行到海邊望真啲，先知石頭都可以咁有層次。","https://www.geopark.gov.hk/tc/discover/attractions/tung-ping-chau",false],
 ["bamboo-birdcage-maker","crafts","竹籠細作",false,"幼細竹絲經師傅削、屈、穿合，慢慢變成精巧竹籠。望落輕巧，做起上嚟就考眼力、手力同耐性。","https://www.heritagemuseum.gov.hk/tc/resources/e_materials/birdcage.html",false],
 ["man-wa-seal-foil","crafts","文華里刻印",true,"文華里圖章街嘅刻印手藝，將心思收進小小印面。字可以細，落刀嗰份專注就一啲都唔少。","https://www.hkcd.com.hk/hkcdweb/content/2022/08/20/content_1359958.html",false],
 ["red-taxi-corner","transport","轉角紅的",false,"紅色車身配銀頂，是不少街坊對市區的士的熟悉印象。平時話趕時間，坐低之後反而先諗起自己未食早餐。","https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/taxi/details_of_taxi_operating_areas_/",false],
 ["ngong-ping-cabin-foil","transport","昂坪雲間行",true,"纜車連起東涌與昂坪，山巒與海面慢慢在腳下展開。平日開十個視窗都唔夠，今日一扇車窗已經望到唔想眨眼。","https://www.np360.com.hk/tc/cable-cars",false],
 ["poon-choi-courtyard","heritage","圍村食盆",false,"盆菜逐層打好，街坊與族人圍坐同享，食物把一桌人聚埋一齊。話好每樣夾少少，個碗總係自己愈疊愈高。","https://www.icho.hk/tc/web/icho/representative_list_sek_pun.html",false],
 ["tin-hau-procession-foil","heritage","天后誕旗海",true,"鼓鑼、旗幟與巡遊隊伍，連起香港不同社區的天后誕傳統。人未行到街口，熱鬧聲已經先同街坊打招呼。","https://www.icho.hk/tc/web/icho/representative_list_tin_hau.html",false],
 ["tofu-pudding-stall","snacks","街坊豆腐花",false,"滑嫩豆腐花配上甜甜糖水，一碗就盛住熟悉的街頭甜品時光。話要慢慢食，匙羹就好似有自己嘅行程。","https://www.discoverhongkong.com/tc/food-and-drink/must-try-traditional-hong-kong-desserts.html",false],
 ["wife-cake-foil","snacks","老婆餅酥香",true,"層層酥皮包住冬蓉餡，元朗老婆餅的香氣由餅盤飄到街口。買來做手信之前，先同自己談判可唔可以試一件。","https://www.hangheung.com.hk/pages/hangheung-wife-cake",false],
 ["tenement-mailboxes","streets","唐樓信箱",false,"一格格信箱排在唐樓入口，收藏每戶人家的生活消息。以為會收到遠方明信片，轉頭又係水電煤單。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-the-blue-house.html",false],
 ["gas-lamp-steps-foil","streets","煤氣燈石階",true,"都爹利街石階旁的四盞煤氣路燈，替中環夜色留下一點暖光。行程可以趕，望到靚燈就想借多半分鐘。","https://www.amo.gov.hk/tc/historic-buildings/monuments/hong-kong-island/monuments_08/index.html",false],
 ["noon-day-gun","harbour","銅鑼灣午炮",false,"告士打道海旁的午炮延續報時傳統，炮聲與港灣景色一起走進城市記憶。報時可以準，打工人幾時放飯就未必。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-noon-day-gun.html",false],
 ["tsing-ma-bridge-foil","harbour","青馬橋暮色",true,"青馬大橋以懸索跨越海面，連接青衣與馬灣，橋影和船影一齊映進暮色。睇橋想慢慢，趕返工又希望快快。","https://www.hyd.gov.hk/tc/information_corner/trivia/longest_span_bridge/index.html",false],
 ["lam-tsuen-wishes","villages","林村許願時光",false,"老樹旁的仿真許願樹與許願架，讓林村的掛願習俗繼續陪住街坊。願望可以好宏大，準時收工亦值得寫低。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-lam-tsuen-wishing-tree.html",false],
 ["tung-chung-fort-foil","villages","東涌炮台舊影",true,"石牆與古炮記下東涌的清代海防故事，山影與海風替畫面留住舊時氣氛。平時最驚電話催交功課，昔日守城真係另一種責任。","https://www.amo.gov.hk/tc/historic-buildings/monuments/outlying-islands/monuments_07/index.html",false],
 ["scales-workshop","crafts","秤號巧手",false,"一盤、一砣、一枝桿，師傅把手工與刻度慢慢磨準。問一件貨有幾多斤兩，靠工具，唔靠吹水。","https://zolimacitymag.com/forgotten-hong-kong-icon-handmade-traditional-chinese-scales/",false],
 ["floral-button-foil","crafts","盤扣花韻",true,"布條在指尖盤成花形鈕扣，小小一粒，收起中式服裝的細緻手藝。你仲喺度解耳機線，師傅已經把線條盤成花。","https://www.icho.hk/tc/web/icho/past_event35.html",false],
 ["hong-kong-rickshaw","transport","人力車街頭舊影",false,"木輪、車篷與街道身影，畫出香港昔日人力車的生活記憶。今日叫車靠手機，舊時一程路，背後是另一種勞動與城市節奏。","https://www.hkmemory.hk/tc/collections-ecexperience-early_motion_pictures-lives_of_residents.html",false],
 ["whitty-tram-depot-foil","transport","屈地街車廠",true,"電車、路軌與架空電線在屈地街車廠交織。叮叮陪街坊出門，返到車廠，原來都有一班人替佢準備下一程。","https://www.hktramways.com/tc/contact-us",false],
 ["hakka-mountain-song","heritage","客家山歌",false,"客家山歌在村落聚會與節慶中傳唱，對答之間留住地方語言。你仲喺度諗下一句，對面街坊已經唱埋個押韻。","https://www.lcsd.gov.hk/CE/CulturalService/Programme/tc/music/programs_1291.html",false],
 ["cantonese-opera-dan-foil","heritage","粵劇水袖",true,"水袖一揚，台上眉眼已經講緊故事；唱腔、身段與戲服一同構成粵劇的舞台語言。觀眾未睇晒節目單，心情已經入咗戲。","https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf#page=5",false],
 ["imitation-fin-soup","snacks","街角碗仔翅",false,"粉絲、菇絲與湯羹盛滿一小碗，是街角熟悉的碗仔翅。明明話只買嚟醫肚，食完又開始望隔籬檔。","https://www.library.gov.mo/uploads/attachment/2026-01/16753696757e5656e7.pdf",false],
 ["grid-waffle-foil","snacks","格仔餅小確幸",true,"圓餅烘出格紋，夾住牛油、花生醬與煉奶等熟悉配搭。個餅一對摺，減肥計劃都跟住摺埋一陣。","https://www.daydaycook.com/zh-Hant/recipe/walffle",false],
 ["estate-laundry","streets","屋邨晾衫日常",false,"彩色窗格、晾衫架與樓下街坊，砌出屋邨生活的一頁。天晴最先開會的，可能係一家人的衫。","https://www.housingauthority.gov.hk/tc/common/pdf/about-us/housing-authority/ha-paper-library/SHC6-14.pdf",false],
 ["staircase-locksmith-foil","streets","樓梯舖配匙",true,"鎖匙胚、夾具與手上的銼刀，留住配匙檔的細心工夫。平時最想搵匙開門，今日先慢慢望清楚師傅怎樣配好一條匙。","https://www.dotdotnews.com/a/202611/25/AP6b051318e4b091a65a30872f.html",false],
 ["shau-kei-wan-slipway","harbour","筲箕灣修船排",false,"船排上的木船、工具與工匠，把海港故事接回岸上。海面看起來風平浪靜，岸邊師傅早已開工整好下一程。","https://www.cache.org.hk/download/cpg_tt7_shaukeiwalker_A6.pdf",false],
 ["blake-pier-foil","harbour","赤柱卜公碼頭",true,"綠色鐵柱與長屋頂，沿海邊留住卜公碼頭的歷史意境。坐低吹陣海風，連平日催你趕路的時間都好似慢咗。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-stanley-blake-pier.html",false],
 ["sam-tung-uk-courtyard","villages","三棟屋庭院",false,"青磚、天井與屋脊，留住荃灣三棟屋的客家村落記憶。窗外城市一路長高，庭院仍然替舊故事留住一片天。","https://www.amo.gov.hk/tc/historic-buildings/monuments/new-territories/monuments_10/index.html",false],
 ["fong-yuen-study-hall-foil","villages","芳園書室舊影",true,"馬灣芳園書室的歷史建築，記下島上教育的一段歲月。海風可以吹散暑氣，功課就算以前都唔會自己做完。","https://www.heritage.gov.hk/tc/revitalisation-scheme/batch-vi-of-revitalisation-scheme/virtual-tour-on-batch-vi-historic-buildings/fong-yuen-study-hall/index.html",false],
 ["gilded-woodcarving","crafts","金漆木雕",false,"花鳥紋樣在木面一刀一刀成形，再以金彩帶出層次。香港木雕手藝曾服務招牌與神像佛具，一塊木背後有好多耐性。","https://hkctp.com.hk/news/id/3192",false],
 ["opera-headdress-foil","crafts","盔頭珠光",true,"珠飾、絨球與細緻骨架，拼成戲台上的華麗盔頭。台前一轉身閃閃發光，台後原來有無數次細心穿針引線。","https://cantonese.edmundtai.com/資料庫首頁",false],
 // Collection expansion; cards retain stable IDs and require full-set ownership.
 ["cross-harbour-tunnel-portal","transport","紅隧入口舊影",false,"紅隧連起紅磡與銅鑼灣，巴士同私家車一齊鑽過海底。張卡替昔日車流定格，唔使連塞車時間都收藏埋。","https://www.td.gov.hk/tc/transport_in_hong_kong/tunnels_and_bridges_n/intro/index.html",false],
 ["airport-baggage-tractor","transport","機場行李車",false,"機場行李拖車細細架，拖住一串行李喺停機坪默默開工。你個篋比你早落機，原來仲有下一程接駁。","https://www.hongkongairport.com/tc/media-centre/news-stories-updates/AET",false],
 ["mid-levels-escalator-foil","transport","半山扶梯流光",true,"中環至半山自動扶梯穿過斜路與街巷，將返工腳步同街角風景串埋一齊。雙腳終於可以短暫放工，對眼繼續沿途開工。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-central-mid-levels-escalator.html",false],
 ["hung-hom-platform-foil","transport","紅磡月台舊影",true,"銀色車身、綠色腰線與長長月台，重拾昔日紅磡車站的鐵路記憶。以前趕車望住個鐘，今日睇張卡先捨得慢慢望。","https://www.mtr.com.hk/ch/customer/services/index.php",false],
 ["pulling-milk-tea","heritage","港式拉茶手勢",false,"布袋濾茶、茶壺來回，港式奶茶嘅茶香藏喺師傅手勢入面。你話少奶少甜，水吧話收到，隻手照樣行雲流水。","https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf",false],
 ["naam-yam-recital","heritage","南音說唱",false,"地水南音以粵語說唱道出人物與世情，琴弦伴住一句句故事。未有短片自動播放之前，街坊已經識得坐定定追劇情。","https://www.lcsd.gov.hk/CE/CulturalService/Programme/tc/music/programs_1291.html",false],
 ["pixiu-dance-foil","heritage","舞貔貅彩陣",true,"舞貔貅以靈活步法、鑼鼓節奏與彩繪獸身，帶出新界鄉村的節慶熱鬧。佢同舞獅各有身段，唔好見到毛茸茸就亂認親戚。","https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf",false],
 ["chiu-chow-gongs-foil","heritage","潮州鑼鼓",true,"潮州鑼鼓將大鼓、鑼、鈸與嗩吶等聲音交織，替節慶與社區活動添氣勢。未見到隊伍，對耳已經收到出場通知。","https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf",false],
 ["curry-fishballs","snacks","咖喱魚蛋",false,"一鑊咖喱汁滾住魚蛋，竹籤一篤，街頭小食模式即刻啟動。明明話買幾粒過口癮，最後連醬汁都唔捨得放過。","https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html",false],
 ["roasted-sweet-potato","snacks","煨番薯暖意",false,"街角烤爐飄出番薯甜香，紙袋一接過手就有冬天嘅溫度。話買嚟暖手，通常暖唔夠兩分鐘已經食咗半個。","https://www.discoverhongkong.com/tc/food-and-drink.html",false],
 ["stuffed-three-treasures-foil","snacks","煎釀三寶",true,"茄子、青椒、豆腐配上魚肉餡，煎出街頭小食嘅香氣。叫三寶唔代表只可以揀三件，選擇困難先係真正隱藏款。","https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html",false],
 ["sugared-egg-puff-foil","snacks","沙翁糖霜",true,"沙翁係炸得鬆身、外面沾糖嘅蛋香甜點，圓碌碌一個就勾起舊式餅店回憶。食完嘴角有糖，想扮冇偷食都幾難。","https://words.hk/zidin/%E6%B2%99%E7%BF%81",false],
 ["estate-chess-corner","streets","屋邨棋局",false,"石枱一盤象棋，樹蔭下幾位街坊就有半日話題。落棋嗰位諗緊下一步，圍觀嗰幾位已經替佢諗到下星期。","https://www.discoverhongkong.com/tc/culture.html",false],
 ["barber-pole-shop","streets","老式理髮舖",false,"旋轉燈柱、老椅與大鏡，留住香港老式理髮舖的熟悉模樣。你只係想剪短少少，師傅順便替你整理埋街坊近況。","https://www.discoverhongkong.com/tc/culture/henry-golding-hong-kong-itinerary.html",false],
 ["shanghai-street-kitchenware-foil","streets","上海街廚具",true,"鑊、蒸籠與茶壺排滿上海街廚具舖，廚房裝備喺度一件件搵齊。行入去之前唔識煮飯，行出嚟至少識得欣賞一隻靚鑊。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-shanghai-street-kitchenware.html",false],
 ["sham-shui-po-fabric-foil","streets","深水埗布街",true,"深水埗布料與衣飾配件店聚埋一區，基隆街一帶細細粒鈕扣都有好多選擇。諗住補粒鈕，最後連幻想中嗰件衫都設計埋。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-ki-lung-street.html",false],
 ["central-public-pier","harbour","中環碼頭海風",false,"中環碼頭一帶，船聲、海風同等船的人拼出維港日常。平日嫌等人耐，望住海嗰陣又會話：唔急，慢慢嚟。","https://www.starferry.com.hk/tc",false],
 ["western-cargo-pier","harbour","西環貨運碼頭舊影",false,"貨板、吊機與船隻，記下西區公眾貨物裝卸區的工作風景。相入面嘅海好靜，碼頭工友手上嘅工作就從來唔會自動暫停。","https://www.mardep.gov.hk/tc/public-services/port-services/pcwa/index.html",false],
 ["kap-shui-mun-bridge-foil","harbour","汲水門橋晨光",true,"汲水門大橋以拉索托住橋面，跨過馬灣與大嶼山之間的海峽。返工望橋同放假望橋，明明同一道風景，心情可以差咁遠。","https://www.td.gov.hk/tc/transport_in_hong_kong/tunnels_and_bridges_n/location_map/index.html",false],
 ["maritime-museum-model-foil","harbour","船模裡的海港",true,"精細船模將船身、桅杆與繩索縮入展櫃，讓香港航海故事有了立體模樣。海風吹唔到入嚟，想出海嘅心情反而吹得更大。","https://www.hkmaritimemuseum.org/plan-your-visit",false],
 ["tsui-sing-lau","villages","聚星樓舊影",false,"屏山聚星樓以六角青磚塔身留住鄉村歷史，旁邊已經換過好多代街景。行得急只會見到座塔，慢慢望先會見到時間。","https://www.amo.gov.hk/tc/heritage-trails/ping-shan-heritage-trail/tsui-sing-lau-pagoda/index.html",false],
 ["sheung-cheung-wai-gate","villages","上璋圍門樓",false,"上璋圍門樓連住屏山圍村的青磚屋與巷道，記下鄧氏族人的聚居故事。入到舊街巷，連講電話把聲都不自覺細咗。","https://www.amo.gov.hk/tc/heritage-trails/ping-shan-heritage-trail/index.html",false],
 ["yi-tai-study-hall-foil","villages","二帝書院庭院",true,"錦田二帝書院的青磚、天井與屋瓦，留下鄉村重視教育的痕跡。以前讀書抬頭望見屋簷，今日返學抬頭多數先睇鐘。","https://www.amo.gov.hk/tc/historic-buildings/monuments/new-territories/monuments_47/index.html",false],
 ["tap-mun-temple-foil","villages","塔門古廟",true,"塔門天后古廟與海傍村落相伴，寫下漁民生活和信仰的故事。落船聞到海味，行多幾步又撞見一段比船程更長的歷史。","https://cco.gov.hk/tc/project-sites/tap-mun",false],
 ["shoemaking-last","crafts","皮鞋木楦",false,"木楦撐起鞋形，皮料經裁剪、縫合與修整，慢慢變成合腳的皮鞋。試鞋嗰陣你話爭少少，師傅就認真處理嗰少少。","https://www.leatherism.net/product-page/diy-course-shoes-brogues",false],
 ["hand-painted-shop-sign","crafts","手繪招牌",false,"筆鋒、留白與店名，一筆筆寫出老店的門面。未識記街號之前，香港人早就識講：行到嗰塊靚招牌轉彎。","https://hkctp.com.hk/news/id/3200",false],
 ["copperware-hammering-foil","crafts","手敲銅光",true,"昔日銅器工匠靠槌打與修整，將銅片慢慢敲成器物。張卡留住叮叮噹噹的手藝記憶，每一下都唔係按個復原掣就可以重做。","https://www.hkcd.com/hkcdweb/content/2022/12/30/content_1380058.html",false],
 ["letterpress-typesetting-foil","crafts","活字墨香",true,"金屬活字逐粒排入版框，再沾墨壓印，紙上文字先有了重量。今日打錯字撳退格，以前排錯一粒，對手同對眼都要加班。","https://printart-contemp.org.hk/tc/visit/",false],
 ["lion-rock","adventure","獅子山",false,"獅子山俯望九龍，岩峰輪廓好似一頭伏住的獅子。山腳每日趕住開工，山上嗰位就一直專心望住香港。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-lion-rock-country-park.html",false],
 ["tai-mo-shan","adventure","大帽山雲海",false,"大帽山高處常見雲霧，山脊與雷達站構成香港熟悉的山頂輪廓。平日嫌返工睇唔到前景，呢度望住雲海反而捨不得走。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-tai-mo-shan.html",false],
 ["kowloon-peak","adventure","飛鵝山",false,"飛鵝山又稱九龍峰，山勢與九龍東的城市樓群互相映襯。地面覺得高到不得了的大廈，喺山景入面都變成細格仔。","https://www.discoverhongkong.com/tc/attractions/hong-kong-after-dark.html",false],
 ["high-junk-peak","adventure","釣魚翁",false,"清水灣一帶的釣魚翁以尖削山形引人注目，山海景色同場出現。名字似去釣魚，張卡真正釣住嘅係你個放假心情。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-high-junk-peak.html",false],
 ["castle-peak","adventure","青山",false,"青山聳立屯門一帶，岩石山勢與山下城市砌成鮮明對比。英文叫Castle Peak，收藏嘅係香港山景，唔使喺圖入面搵城堡。","https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Castle+Peak",false],
 ["lantau-peak","adventure","鳳凰山",false,"鳳凰山的高峻山峰立於大嶼山，雲霧與晨光讓山線時隱時現。日出未必肯準時露面，但張卡會替你留住一抹金光。","https://www.hiking.gov.hk/promote/info/id/WTlaMHl6akpNYk9BRGViczlXaFZhQT09/map_type/1",false],
 ["sunset-peak-foil","adventure","大東山芒海",true,"秋日大東山的芒草映住夕光，山間石屋替金色山坡添一點歲月感。風吹一下，成片山都識得自己做閃卡效果。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-sunset-peak.html",false],
 ["ma-on-shan-foil","adventure","馬鞍山雙峰",true,"馬鞍山的雙峰與鞍形山脊，替新界東畫出一條有個性的天際線。平日只記得車站名，原來個名背後仲有真山做主角。","https://www.afcd.gov.hk/tc_chi/country/cou_vis/cou_vis_cou/cou_vis_cou_mos/cou_vis_cou_mos.html",false],
 ["pat-sin-leng-foil","adventure","八仙嶺連峰",true,"八仙嶺連綿山峰俯望船灣淡水湖一帶，起伏山線好似一排靜靜排隊的朋友。仙人各有名字，張卡就先替你留低成幅山水。","https://www.afcd.gov.hk/tc_chi/country/cou_vis/cou_vis_cou/cou_vis_cou_psl/cou_vis_cou_psl.html",false],
 ["dragons-back-foil","adventure","龍脊海天",true,"龍脊沿港島東南起伏伸展，石澳一帶的山與海同框。城市每日叫你條腰坐直，呢條山脊就彎得好有型。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-dragon-s-back.html",false],
 ["repulse-bay","adventure","淺水灣",false,"淺水灣的弧形沙灘與背後山坡樓宇，拼出港島南熟悉的海岸風景。平日望手機望到攰，望一陣海先知對眼都想放假。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-repulse-bay.html",false],
 ["stanley-main-beach","adventure","赤柱正灘",false,"赤柱正灘面向開揚海灣，岸邊水上活動器材替海景添上顏色。個人仲喺市區，張卡已經幫你個心預先去咗赤柱。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-hk/beach-address-south.html",false],
 ["big-wave-bay-hk-island","adventure","大浪灣（港島）",false,"港島大浪灣依住青綠山坡，沙灘同浪花構成另一種香港節奏。呢張收藏嘅係石澳附近嗰個大浪灣，唔好同西貢同名海灣認錯親戚。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-dragon-s-back-viewing-point.html",false],
 ["cheung-sha-beach","adventure","長沙海岸",false,"大嶼山南岸長沙的沙灘沿海伸展，山坡、村屋與海浪一齊慢落嚟。平日嫌條隊太長，呢度條海岸線長就只會覺得正。","https://www.discoverhongkong.com/tc/outdoors/10-beaches-to-visit-in-hong-kong.html",false],
 ["silverstrand-beach","adventure","銀線灣",false,"西貢銀線灣的小海灣被山坡與住宅圍住，沙灘留住一段近城市的海風。名字聽落好貴氣，張卡最想收藏嘅其實係一陣清閒。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-sk.html",false],
 ["shek-o-beach","adventure","石澳泳灘",false,"石澳泳灘旁邊的低矮村屋與山坡，將香港海邊畫得格外有生活感。影完海景仲想望多兩眼彩色屋仔，記憶卡都想申請加班。","https://www.discoverhongkong.com/tc/outdoors/10-beaches-to-visit-in-hong-kong.html",false],
 ["ham-tin-wan-foil","adventure","咸田灣海風",true,"咸田灣位於西貢大浪灣一帶，遠山、沙岸與浪花展現香港郊野另一面。平日訊息一浪接一浪，呢張卡只想畀你聽真正海浪。","https://www.discoverhongkong.com/tc/outdoors.html",false],
 ["clear-water-bay-second-foil","adventure","清水灣第二灣",true,"清水灣第二灣的弧形沙岸依住山坡，碧綠海面替卡面添上通透層次。每日待辦清單好長，望住海嗰一秒就先清空個腦。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-sk.html",false],
 ["hap-mun-bay-foil","adventure","橋咀廈門灣",true,"橋咀洲廈門灣又稱半月灣，彎彎沙岸配上山林與海水，收進卡裡都覺得開揚。個名有廈門，張卡收藏嘅仍然係香港西貢。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-sk.html",false],
 ["chung-hom-kok-foil","adventure","舂坎角",true,"舂坎角泳灘藏於港島南的小海灣，山坡、沙岸與瞭望台砌成安靜一角。市區鐘聲催你趕，海浪就只係一下一下慢慢嚟。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-hk/beach-address-south.html",false],
 // Snack and nature additions; full-category ownership still gates each prefix.
 ["fried-squid-skewer","snacks","炸魷魚鬚",false,"炸到金黃的魷魚鬚，配竹籤與紙袋，就係香港街頭熟悉的香口誘惑。你話買嚟一路行一路食，通常未行到街口已經食完。","https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html",false],
 ["beef-offal-pot","snacks","柱侯牛雜",false,"牛雜與蘿蔔喺濃香醬汁裡慢慢炆，細細碗都裝得落街角的暖意。原本話只係買蘿蔔，聞到香味之後，預算就自然有彈性。","https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html",false],
 ["roasted-chestnut-cart","snacks","糖炒栗子",false,"大鐵鑊裡栗子翻滾，熱氣同甜香搶先替小販打招呼。冬天最難嘅選擇：係先剝栗子，定係繼續攬住個暖紙袋。","https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html",false],
 ["peanut-sesame-candy","snacks","花生芝麻糖",false,"花生、芝麻與糖漿壓成一塊塊脆糖，切開就係舊式糖果舖的香氣。話好只食一小塊，塊糖碎開咗，又多咗幾個合理藉口。","https://www.discoverhongkong.com/tc/food-and-drink.html",false],
 ["white-sugar-sponge-cake","snacks","白糖糕",false,"白糖糕由米漿發酵蒸成，雪白糕身藏住細密孔洞，是香港懷舊糕點之一。外表好似好低調，咬落先知佢有自己一套甜蜜說服力。","https://guide.michelin.com/hk/zh_HK/article/features/must-eat-traditional-desserts-hong-kong",false],
 ["dragon-beard-candy-foil","snacks","龍鬚糖雪絲",true,"糖絲拉到幼如龍鬚，再裹入花生等餡料，小小一件就係手藝。食之前驚整散，食之後先發現嘴角已經自帶白色鬍鬚。","https://www.icho.hk/tc/web/icho/2024_meet_the_masters.html",false],
 ["mango-pomelo-sago-foil","snacks","楊枝甘露",true,"芒果、柚肉與西米配上香滑湯底，砌成香港甜品店熟悉的楊枝甘露。明明正餐話飽到行唔郁，甜品一到，個胃又識得自行擴建。","https://www.discoverhongkong.com/tc/food-and-drink/must-try-traditional-hong-kong-desserts.html",false],
 ["hong-kong-egg-sandwich-foil","snacks","滑蛋三文治",true,"鬆軟白麵包夾住香滑炒蛋，茶餐廳的簡單配搭一樣令人掛住。諗住叫份輕食，結果第一啖就開始計劃下次早餐。","https://www.discoverhongkong.com/tc/food-and-drink.html",false],
 ["deep-fried-stinky-tofu-foil","snacks","臭豆腐小檔",true,"臭豆腐炸出香脆外層，再點上醬汁，是香港街頭小吃的鮮明角色。未見到檔口，個鼻已經幫你導航；有人即刻行快兩步，有人即刻排隊。","https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html",false],
 ["fried-sesame-ball-foil","snacks","煎堆芝麻香",true,"金黃煎堆外面裹住芝麻，糯米皮炸得香脆，餡料配搭各有特色。圓碌碌一粒唔算大，點知咬落去，開心可以膨脹咁多。","https://hkccda.org/2022/04/13/26foodcul/",false],
 ["sharp-peak","adventure","蚺蛇尖",false,"西貢蚺蛇尖的尖削輪廓，從層層綠嶺間突圍而出，山海同框格外有氣勢。名字有條蛇，張卡收藏嘅就係自然山線，唔使驚佢突然郁。","https://www.hiking.gov.hk/content/fatal_detail/id/13",false],
 ["mount-parker","adventure","柏架山",false,"柏架山位於港島東，綠色山坡與鰂魚涌一帶樓群互相映襯。樓下講效率，山上講風景；同一個香港，原來可以有兩種節奏。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-mount-parker.html",false],
 ["tates-cairn","adventure","大老山天際",false,"大老山的天氣雷達在山頂觀察雨區，白色圓罩成為山線上的熟悉記號。你出門先問落唔落雨，佢已經默默幫香港望咗好耐。","https://www.hko.gov.hk/tc/aviat/amt/tc_radar.htm",false],
 ["kau-nga-ling-foil","adventure","狗牙嶺山線",true,"大嶼山狗牙嶺的岩脊起伏尖峭，像鋸齒般伸向綠色山谷。名字聽落好惡，遠遠欣賞山線，已經夠有霸氣。","https://www.landsd.gov.hk/doc/en/mapping/ehkg/MapPages/GeoPDF/SS09_LantauIsland.pdf",false],
 ["tai-to-yan-foil","adventure","大刀屻青脊",true,"新界大刀屻以狹長起伏的山脊見稱，青山與鄉郊谷地在兩旁鋪開。名字有刀，張卡最鋒利嘅功能就係一眼切走少少返工壓力。","https://www.discoverhongkong.com/tc/place-to-go/travel.guide-tai-to-yan.html",false],
 ["silvermine-bay","adventure","銀礦灣晨光",false,"銀礦灣位於大嶼山梅窩，弧形沙岸、村屋與青山一齊迎接海風。平日鬧鐘叫極唔起，見到呢幅晨光，個心已經偷偷早起咗。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-is.html",false],
 ["golden-beach","adventure","黃金泳灘",false,"屯門黃金泳灘的沙岸連住海濱景色，陽光將海面照出一點金色。名字好似好富貴，張卡收藏嘅其實係唔使睇時間的放假心情。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-tm.html",false],
 ["deep-water-bay-foil","adventure","深水灣海色",true,"深水灣位於港島南，彎彎沙岸背靠綠色山坡，替繁忙城市留出一片海。手機裡啲訊息仲喺度排隊，對眼就想先俾海景插個隊。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-hk/beach-address-south.html",false],
 ["butterfly-beach-foil","adventure","蝴蝶灣樹影",true,"屯門蝴蝶灣的海邊公園、樹蔭與沙岸，記下街坊散步望海的日常。唔使每次放假都追大場面，一張凳、一陣海風，已經可以坐得好認真。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-tm.html",false],
 ["turtle-cove-foil","adventure","龜背灣綠岸",true,"大潭一帶的龜背灣藏於港島南的綠色海岸，細小沙灣被山坡輕輕圍住。名字有龜，風景就請你慢慢睇；張卡唔會催你交功課。","https://www.lcsd.gov.hk/tc/beach/index/beach-location-hk/beach-address-south.html",false]
];
export const STANDARD_CARDS=Object.freeze(cards.map(([id,series,name,foil,story,source,prefixRequired=true])=>Object.freeze({id,series,name,foil,story,source,...(prefixRequired?{}:{prefixRequired:false})})));
export const CULTURE_CARDS=Object.freeze([...STANDARD_CARDS,...LEGEND_CARDS]);
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
 {"id":"theme-workshop","kind":"theme","name":"香港手作坊","price":130000,"description":"竹編、瓷彩與溫暖工枱色，展示純外觀的匠人風格。"},
 {"id":"frame-minibus","kind":"frame","name":"小巴水牌框","price":38000,"description":"紅綠水牌、窗角與手寫筆觸，帶住街坊節奏出場。"},
 {"id":"frame-dimsum","kind":"frame","name":"茶樓蒸籠框","price":52000,"description":"竹蒸籠編紋與熱騰騰點心，把一盅兩件戴上頭像。"},
 {"id":"frame-bauhinia","kind":"frame","name":"洋紫荊花框","price":75000,"description":"紫紅花瓣與葉脈環繞，留住香港街角的春色。"},
 {"id":"frame-lion","kind":"frame","name":"醒獅彩繡框","price":110000,"description":"彩獅眉眼、繡紋與金線，醒目上榜但不增加答題能力。"},
 {"id":"frame-rooster-bowl","kind":"frame","name":"雞公碗彩瓷框","price":45000,"description":"紅冠雞、綠葉與青花瓷邊，框住一份港式餐桌記憶。"},
 {"id":"frame-mahjong","kind":"frame","name":"麻雀開枱框","price":58000,"description":"筒子與索子圍成一圈，牌面熱鬧，答題照樣靠自己。"},
 {"id":"frame-bus-stop","kind":"frame","name":"巴士站牌框","price":76000,"description":"紅黃站牌色、金屬鉚釘與迷你巴士，街坊身份隨時到站。"},
 {"id":"frame-flower-window","kind":"frame","name":"唐樓鐵窗框","price":98000,"description":"墨綠鐵花與暖金細節，將舊唐樓窗邊的風景戴上頭像。"},
 {"id":"theme-neon-rain","kind":"theme","name":"雨夜霓虹街","price":110000,"description":"雨傘、騎樓與霓虹倒影，答題區保留清晰淺色紙面。"},
 {"id":"theme-estate","kind":"theme","name":"屋邨晨光","price":150000,"description":"彩色窗格、街場與樹蔭，把街坊的早晨放進背景。"},
 {"id":"theme-teahouse","kind":"theme","name":"一盅兩件","price":190000,"description":"蒸籠、茶壺與茶樓暖光，替今日挑戰留一席街坊位。"},
 {"id":"exit-tram","kind":"exit","name":"叮叮載你走","price":60000,"description":"割禾青後，叮叮停站接你離場；放低緊張，下一程再嚟。"},
 {"id":"exit-ferry","kind":"exit","name":"小輪慢慢走","price":70000,"description":"割禾青後，小輪隨水波輕晃離岸，帶住獎金吹陣海風。"},
 {"id":"exit-gondola","kind":"exit","name":"纜車上山抖抖","price":90000,"description":"割禾青後，纜車沿斜索上山，安全帶走本局的收穫。"}
]);
const gearKindOrder={frame:0,theme:1,exit:2};
export const DISPLAY_GEAR=Object.freeze([...GEAR,LEGEND_THEME].sort((a,b)=>gearKindOrder[a.kind]-gearKindOrder[b.kind]||(a.price??0)-(b.price??0)));
export const NORMAL_CARDS=Object.freeze(STANDARD_CARDS.filter(c=>!c.foil).map(c=>c.id));
export const FOIL_CARDS=Object.freeze(STANDARD_CARDS.filter(c=>c.foil).map(c=>c.id));
export const cardById=id=>CULTURE_CARDS.find(c=>c.id===id);
export const gearById=id=>GEAR.find(c=>c.id===id);
export const walletBalance=(profile,wallet)=>Math.max(0,(profile?.total??0)+(wallet?.bonus??0)-(wallet?.spent??0));
export const unlockedPrefixes=wallet=>SERIES.filter(s=>CULTURE_CARDS.filter(c=>c.series===s.id).every(c=>(wallet?.cards?.[c.id]??0)>0));
export function legendTickets(profile,wallet){const collected=STANDARD_CARDS.filter(c=>(wallet?.cards?.[c.id]??0)>0).length,games=profile?.games??0,earned=Math.floor(collected/LEGEND_COLLECTION_STEP)+Math.floor(games/LEGEND_GAMES_STEP);return {collected,games,earned,available:Math.max(0,earned-(wallet?.legendDraws??0))};}
export function drawnLegend(wallet){const n=wallet.legendDraws??0,seed=Math.floor(wallet.createdAt?.toMillis?.()??wallet.createdAt??0);return LEGEND_CARDS[(seed%20+(n%20)*7+Math.floor(n/20)*3)%20].id;}
export function weekendKey(day=hkDay()){const weekday=(day+4)%7;return weekday===0?day-1:day+(6-weekday+7)%7;}
export const isWeekend=(day=hkDay())=>[0,6].includes((day+4)%7);
export function emptyWallet(uid,stamp){return {uid,spent:0,bonus:0,draws:0,normalDraws:0,legendDraws:0,cards:{},owned:[],frame:'none',theme:'default',exit:'default',prefix:'',pass:-1,passUses:0,retryBoughtDay:-1,retryUsedDay:-1,practiceDay:-1,practiceEarned:0,activeSession:'',activeKind:'',activeRoom:'',revision:0,op:'create',item:'',receipt:'',createdAt:stamp,updatedAt:stamp};}
const gcd=(a,b)=>b?gcd(b,a%b):a;
const stride=n=>{let step=5;while(gcd(step,n)!==1)step++;return step;};
// Equal weights within each rarity, with an exact 23:2 (92%:8%) ratio.
const drawDivisor=gcd(23*FOIL_CARDS.length,2*NORMAL_CARDS.length);
export const NORMAL_WEIGHT=23*FOIL_CARDS.length/drawDivisor,FOIL_WEIGHT=2*NORMAL_CARDS.length/drawDivisor;
export const GOLD_STRIDE=stride(FOIL_CARDS.length),DRAW_SLOTS=NORMAL_CARDS.length*NORMAL_WEIGHT+FOIL_CARDS.length*FOIL_WEIGHT,DRAW_COLUMNS=25,DRAW_ROWS=DRAW_SLOTS/DRAW_COLUMNS;
const drawMix=(n,key)=>((((n*n+1)*48271+key)%2147483647)*48271+1013904223)%2147483647;
// Reversible modular rounds shuffle the entire weighted deck without a stored array.
// This is reproducible pseudorandomness, not a secret or cryptographic RNG.
export function normalDrawSlot(wallet){
 const count=wallet.normalDraws??0,stamp=Math.floor(wallet.createdAt?.toMillis?.()??wallet.createdAt??0),key=(stamp%2147483647+Math.floor(count/DRAW_SLOTS)*104729)%2147483647;
 let left=count%DRAW_COLUMNS,right=Math.floor(count%DRAW_SLOTS/DRAW_COLUMNS);
 for(const [a,b]of [[17,101],[307,701],[1201,1999]]){left=(left+drawMix(right,key+a))%DRAW_COLUMNS;right=(right+drawMix(left,key+b))%DRAW_ROWS;}
 return right*DRAW_COLUMNS+left;
}
export function drawnCard(wallet,gold=false){
 const seed=Math.floor(wallet.createdAt?.toMillis?.()??wallet.createdAt??0);
 if(gold)return FOIL_CARDS[(seed+wallet.draws*GOLD_STRIDE)%FOIL_CARDS.length];
 const slot=normalDrawSlot(wallet),common=NORMAL_CARDS.length*NORMAL_WEIGHT;return slot<common?NORMAL_CARDS[Math.floor(slot/NORMAL_WEIGHT)]:FOIL_CARDS[Math.floor((slot-common)/FOIL_WEIGHT)];
}
export function walletAction(profile,wallet,action,day=hkDay()){
 const next={...wallet,revision:wallet.revision+1,op:action.type,item:action.id??'',receipt:action.requestId??wallet.receipt};let cost=0;
 if(action.type==='buy'){const gear=gearById(action.id);if(!gear||wallet.owned.includes(gear.id))throw Error('already-owned');cost=gear.price;next.owned=[...wallet.owned,gear.id];}
 else if(action.type==='draw'||action.type==='gold'){cost=action.type==='gold'?GOLD_PRICE:DRAW_PRICE;next.item=drawnCard(wallet,action.type==='gold');next.cards={...wallet.cards,[next.item]:(wallet.cards[next.item]??0)+1};next.draws++;if(action.type==='draw')next.normalDraws=(wallet.normalDraws??0)+1;}
 else if(action.type==='legend'){if(legendTickets(profile,wallet).available<1)throw Error('legend-ticket-required');next.item=drawnLegend(wallet);next.cards={...wallet.cards,[next.item]:(wallet.cards[next.item]??0)+1};next.legendDraws=(wallet.legendDraws??0)+1;}
 else if(action.type==='equip'){
  if(action.slot==='prefix'){if(action.id!==''&&!unlockedPrefixes(wallet).some(s=>s.id===action.id))throw Error('not-owned');next.prefix=action.id;}
  else{if(!['frame','theme','exit'].includes(action.slot))throw Error('invalid-item');const reset=action.slot==='frame'?'none':'default',legendTheme=action.slot==='theme'&&action.id===LEGEND_THEME.id&&legendComplete(wallet);if(action.id!==reset&&!legendTheme&&(!wallet.owned.includes(action.id)||gearById(action.id)?.kind!==action.slot))throw Error('not-owned');next[action.slot]=action.id;}
  next.item=action.slot;
 }else if(action.type==='pass'){if(action.day!==undefined&&(!Number.isInteger(action.day)||weekendKey(action.day)!==weekendKey(day)))throw Error('quote-expired');if(wallet.pass===weekendKey(day))throw Error('already-owned');cost=WEEKEND_PASS_PRICE;next.pass=weekendKey(day);next.passUses=0;}
 else if(action.type==='retry-ticket'){if(wallet.retryBoughtDay===day)throw Error('retry-bought');if(action.day!==undefined&&action.day!==day)throw Error('quote-expired');cost=retryPrice(day);if(action.price!==undefined&&action.price!==cost)throw Error('quote-expired');next.retryBoughtDay=day;}
 else throw Error('invalid-item');
 if(walletBalance(profile,wallet)<cost)throw Error('insufficient-balance');next.spent+=cost;return next;
}
export function prefixedTitle(wallet,title){const prefix=unlockedPrefixes(wallet).find(s=>s.id===wallet?.prefix)?.prefix;return (prefix?'【'+prefix+'】':'')+title;}
export const practiceReward=correct=>Math.min(5000,Math.max(0,correct)*500);
export function randomSeed(){const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]%1000000000;}
