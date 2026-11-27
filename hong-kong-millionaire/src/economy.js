import {hkDay} from './game.js';
export const DRAW_PRICE=20000,GOLD_PRICE=80000,WEEKEND_PASS_PRICE=80000,WEEKEND_LIMIT=5,RETRY_PRICE=100000;
export const SERIES=Object.freeze([{id:'transport',name:'交通工具',prefix:'交通達人'},{id:'heritage',name:'非物質文化遺產',prefix:'非遺守護者'},{id:'snacks',name:'街頭小吃',prefix:'食神'},{id:'streets',name:'老街日常',prefix:'老街收藏家'},{id:'harbour',name:'海港遊蹤',prefix:'海港漫遊者'},{id:'villages',name:'圍村與離島',prefix:'村落地膽'},{id:'crafts',name:'匠人手作',prefix:'手藝收藏家'}]);
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
 ["man-wa-seal-foil","crafts","文華里刻印",true,"文華里圖章街嘅刻印手藝，將心思收進小小印面。字可以細，落刀嗰份專注就一啲都唔少。","https://www.hkcd.com.hk/hkcdweb/content/2022/08/20/content_1359958.html",false]
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
 {"id":"theme-workshop","kind":"theme","name":"香港手作坊","price":130000,"description":"竹編、瓷彩與溫暖工枱色，展示純外觀的匠人風格。"},
 {"id":"frame-minibus","kind":"frame","name":"小巴水牌框","price":38000,"description":"紅綠水牌、窗角與手寫筆觸，帶住街坊節奏出場。"},
 {"id":"frame-dimsum","kind":"frame","name":"茶樓蒸籠框","price":52000,"description":"竹蒸籠編紋與熱騰騰點心，把一盅兩件戴上頭像。"},
 {"id":"frame-bauhinia","kind":"frame","name":"洋紫荊花框","price":75000,"description":"紫紅花瓣與葉脈環繞，留住香港街角的春色。"},
 {"id":"frame-lion","kind":"frame","name":"醒獅彩繡框","price":110000,"description":"彩獅眉眼、繡紋與金線，醒目上榜但不增加答題能力。"}
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
