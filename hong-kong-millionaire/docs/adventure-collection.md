# 八類二十張收藏擴充（2026-11-28）

新增48張，總數160張；八類各20張。原有七類各加2張文化卡與2張閃卡，新「山水探險家」含10張山嶺、10張海灘卡（12文化卡／8閃卡）。全套共89文化卡、71閃卡。所有新卡均為獨立508×508港式漫畫WebP，不覆蓋原112張卡。插畫為原創文化意境，並非地理測量圖、現場照片或開放狀態指引。

## 生成與匯出

圖像由image_gen生成，暖紙墨線與水彩／水粉，玉綠、赭黃與朱紅。A至H為1536×1024、三欄兩列六格；按下表順序由左至右、由上至下匯出。每格四邊裁2px後輸出508px，WebP品質91、method6。原始PNG留在生成目錄。

紅隧入口初稿誤作磚拱門，改用低矮混凝土門口；獅子山初稿過度擬人，改用天然花崗岩輪廓。E組重新生成並核對，避免生成輸出路徑重複造成題材錯置。兩張獨立修正圖以實際尺寸裁邊後縮成508px；匯出腳本會跳過被取代的格。

重現：`node scripts/package-adventure-art.mjs <A.png> <B.png> <C.png> <D.png> <E.png> <F.png> <G.png> <H.png> <紅隧修正.png> <獅子山修正.png>`。

| 組別 | 原始PNG | SHA-256 |
|---|---|---|
| A | exec-3f42ca80-0053-41ac-80b8-b50b103c0dd0.png | 0aaa686164ce7bb870cd2ed2478b8b77e9f45be80078f64beb0c50ca10d5208c |
| B | exec-cc917f77-8899-4ceb-b647-4ba795fa1e69.png | 88494c94e7ef372a08094b90ff1aad406f9b669ddd2ac8d345fab4831e9d7e97 |
| C | exec-eec75684-34fa-4f4f-86a0-731150b53780.png | 99ff86851dedfe7703a88c5eb5fcaee2677f72a0915bd20b5d446cfc24ea2575 |
| D | exec-e3181fd9-566e-4d0d-b1cd-1abf4ffa8671.png | 2513bae6817c5f2324ac248deeee51e3afe1cba9861523a69e6b399f15592dba |
| E | exec-76cd0b23-fbc3-4307-aa23-2a98315d92b7.png | d50d7607464a9061f897665001c66163c31deed11e05861ce552c4cdcfae4efc |
| F | exec-d32d1526-cc29-4ae3-afe7-58bdb92f9d01.png | e32eb7dc20c0e80a2a81ce9ce2ff08ab441a7d52cbe51268c9a3519d0ec1950f |
| G | exec-163f8dc8-6b4b-487f-b16b-62261e740530.png | 6c337e911c151baac1f7f2c5f65b5bdcb719741b683973890ecc9e1c18f52270 |
| H | exec-905d09d6-f90f-4d29-a325-61d860607f36.png | 66e48d3edc915d73b9b09118949b6578bc1d6f3a0a22126f24155ac70433c3e4 |
| A-correction | exec-e2a48879-f8d8-47e3-ace6-f65c77b74c75.png | 04d98f3d1bfac9f40d1b60e46a2a40b0cbdf570bcd386c2a40aeac2918af93ba |
| E-correction | exec-0abcdc83-eedc-4e36-a773-11c59bfe88c3.png | d015dfdce33f8e3d1b2178a5f89cb8da826146f9cb8814b1c6414df196aa5497 |

## 新卡審閱

山水名稱與簡介參照漁護署、康文署、香港旅遊發展局及地方文物資料；大浪灣清楚標明港島，與西貢大浪灣區分。銅器描述昔日工藝，不聲稱已結業店舖仍營業；汲水門橋採拉索橋意象，不混用青馬懸索橋。全部卡片只作收藏，不影響作答時間或答案。

| 格 | 分類 | 卡名 | 種類 | ID／WebP | 故事 | 延伸閱讀 |
|---|---|---|---|---|---|---|
| A修正 | 交通工具 | 紅隧入口舊影 | 文化卡 | `card-cross-harbour-tunnel-portal.webp` | 紅隧連起紅磡與銅鑼灣，巴士同私家車一齊鑽過海底。張卡替昔日車流定格，唔使連塞車時間都收藏埋。 | [來源](https://www.td.gov.hk/tc/transport_in_hong_kong/tunnels_and_bridges_n/intro/index.html) |
| A2 | 交通工具 | 機場行李車 | 文化卡 | `card-airport-baggage-tractor.webp` | 機場行李拖車細細架，拖住一串行李喺停機坪默默開工。你個篋比你早落機，原來仲有下一程接駁。 | [來源](https://www.hongkongairport.com/tc/media-centre/news-stories-updates/AET) |
| A3 | 交通工具 | 半山扶梯流光 | 閃卡 | `card-mid-levels-escalator-foil.webp` | 中環至半山自動扶梯穿過斜路與街巷，將返工腳步同街角風景串埋一齊。雙腳終於可以短暫放工，對眼繼續沿途開工。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-central-mid-levels-escalator.html) |
| A4 | 交通工具 | 紅磡月台舊影 | 閃卡 | `card-hung-hom-platform-foil.webp` | 銀色車身、綠色腰線與長長月台，重拾昔日紅磡車站的鐵路記憶。以前趕車望住個鐘，今日睇張卡先捨得慢慢望。 | [來源](https://www.mtr.com.hk/ch/customer/services/index.php) |
| A5 | 非物質文化遺產 | 港式拉茶手勢 | 文化卡 | `card-pulling-milk-tea.webp` | 布袋濾茶、茶壺來回，港式奶茶嘅茶香藏喺師傅手勢入面。你話少奶少甜，水吧話收到，隻手照樣行雲流水。 | [來源](https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf) |
| A6 | 非物質文化遺產 | 南音說唱 | 文化卡 | `card-naam-yam-recital.webp` | 地水南音以粵語說唱道出人物與世情，琴弦伴住一句句故事。未有短片自動播放之前，街坊已經識得坐定定追劇情。 | [來源](https://www.lcsd.gov.hk/CE/CulturalService/Programme/tc/music/programs_1291.html) |
| B1 | 非物質文化遺產 | 舞貔貅彩陣 | 閃卡 | `card-pixiu-dance-foil.webp` | 舞貔貅以靈活步法、鑼鼓節奏與彩繪獸身，帶出新界鄉村的節慶熱鬧。佢同舞獅各有身段，唔好見到毛茸茸就亂認親戚。 | [來源](https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf) |
| B2 | 非物質文化遺產 | 潮州鑼鼓 | 閃卡 | `card-chiu-chow-gongs-foil.webp` | 潮州鑼鼓將大鼓、鑼、鈸與嗩吶等聲音交織，替節慶與社區活動添氣勢。未見到隊伍，對耳已經收到出場通知。 | [來源](https://www.icho.hk/documents/Intangible-Cultural-Heritage-Inventory/2024/ich_inventory_2024_cn.pdf) |
| B3 | 街頭小吃 | 咖喱魚蛋 | 文化卡 | `card-curry-fishballs.webp` | 一鑊咖喱汁滾住魚蛋，竹籤一篤，街頭小食模式即刻啟動。明明話買幾粒過口癮，最後連醬汁都唔捨得放過。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html) |
| B4 | 街頭小吃 | 煨番薯暖意 | 文化卡 | `card-roasted-sweet-potato.webp` | 街角烤爐飄出番薯甜香，紙袋一接過手就有冬天嘅溫度。話買嚟暖手，通常暖唔夠兩分鐘已經食咗半個。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink.html) |
| B5 | 街頭小吃 | 煎釀三寶 | 閃卡 | `card-stuffed-three-treasures-foil.webp` | 茄子、青椒、豆腐配上魚肉餡，煎出街頭小食嘅香氣。叫三寶唔代表只可以揀三件，選擇困難先係真正隱藏款。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html) |
| B6 | 街頭小吃 | 沙翁糖霜 | 閃卡 | `card-sugared-egg-puff-foil.webp` | 沙翁係炸得鬆身、外面沾糖嘅蛋香甜點，圓碌碌一個就勾起舊式餅店回憶。食完嘴角有糖，想扮冇偷食都幾難。 | [來源](https://words.hk/zidin/%E6%B2%99%E7%BF%81) |
| C1 | 老街日常 | 屋邨棋局 | 文化卡 | `card-estate-chess-corner.webp` | 石枱一盤象棋，樹蔭下幾位街坊就有半日話題。落棋嗰位諗緊下一步，圍觀嗰幾位已經替佢諗到下星期。 | [來源](https://www.discoverhongkong.com/tc/culture.html) |
| C2 | 老街日常 | 老式理髮舖 | 文化卡 | `card-barber-pole-shop.webp` | 旋轉燈柱、老椅與大鏡，留住香港老式理髮舖的熟悉模樣。你只係想剪短少少，師傅順便替你整理埋街坊近況。 | [來源](https://www.discoverhongkong.com/tc/culture/henry-golding-hong-kong-itinerary.html) |
| C3 | 老街日常 | 上海街廚具 | 閃卡 | `card-shanghai-street-kitchenware-foil.webp` | 鑊、蒸籠與茶壺排滿上海街廚具舖，廚房裝備喺度一件件搵齊。行入去之前唔識煮飯，行出嚟至少識得欣賞一隻靚鑊。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-shanghai-street-kitchenware.html) |
| C4 | 老街日常 | 深水埗布街 | 閃卡 | `card-sham-shui-po-fabric-foil.webp` | 深水埗布料與衣飾配件店聚埋一區，基隆街一帶細細粒鈕扣都有好多選擇。諗住補粒鈕，最後連幻想中嗰件衫都設計埋。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-ki-lung-street.html) |
| C5 | 海港遊蹤 | 中環碼頭海風 | 文化卡 | `card-central-public-pier.webp` | 中環碼頭一帶，船聲、海風同等船的人拼出維港日常。平日嫌等人耐，望住海嗰陣又會話：唔急，慢慢嚟。 | [來源](https://www.starferry.com.hk/tc) |
| C6 | 海港遊蹤 | 西環貨運碼頭舊影 | 文化卡 | `card-western-cargo-pier.webp` | 貨板、吊機與船隻，記下西區公眾貨物裝卸區的工作風景。相入面嘅海好靜，碼頭工友手上嘅工作就從來唔會自動暫停。 | [來源](https://www.mardep.gov.hk/tc/public-services/port-services/pcwa/index.html) |
| D1 | 海港遊蹤 | 汲水門橋晨光 | 閃卡 | `card-kap-shui-mun-bridge-foil.webp` | 汲水門大橋以拉索托住橋面，跨過馬灣與大嶼山之間的海峽。返工望橋同放假望橋，明明同一道風景，心情可以差咁遠。 | [來源](https://www.td.gov.hk/tc/transport_in_hong_kong/tunnels_and_bridges_n/location_map/index.html) |
| D2 | 海港遊蹤 | 船模裡的海港 | 閃卡 | `card-maritime-museum-model-foil.webp` | 精細船模將船身、桅杆與繩索縮入展櫃，讓香港航海故事有了立體模樣。海風吹唔到入嚟，想出海嘅心情反而吹得更大。 | [來源](https://www.hkmaritimemuseum.org/plan-your-visit) |
| D3 | 圍村與離島 | 聚星樓舊影 | 文化卡 | `card-tsui-sing-lau.webp` | 屏山聚星樓以六角青磚塔身留住鄉村歷史，旁邊已經換過好多代街景。行得急只會見到座塔，慢慢望先會見到時間。 | [來源](https://www.amo.gov.hk/tc/heritage-trails/ping-shan-heritage-trail/tsui-sing-lau-pagoda/index.html) |
| D4 | 圍村與離島 | 上璋圍門樓 | 文化卡 | `card-sheung-cheung-wai-gate.webp` | 上璋圍門樓連住屏山圍村的青磚屋與巷道，記下鄧氏族人的聚居故事。入到舊街巷，連講電話把聲都不自覺細咗。 | [來源](https://www.amo.gov.hk/tc/heritage-trails/ping-shan-heritage-trail/index.html) |
| D5 | 圍村與離島 | 二帝書院庭院 | 閃卡 | `card-yi-tai-study-hall-foil.webp` | 錦田二帝書院的青磚、天井與屋瓦，留下鄉村重視教育的痕跡。以前讀書抬頭望見屋簷，今日返學抬頭多數先睇鐘。 | [來源](https://www.amo.gov.hk/tc/historic-buildings/monuments/new-territories/monuments_47/index.html) |
| D6 | 圍村與離島 | 塔門古廟 | 閃卡 | `card-tap-mun-temple-foil.webp` | 塔門天后古廟與海傍村落相伴，寫下漁民生活和信仰的故事。落船聞到海味，行多幾步又撞見一段比船程更長的歷史。 | [來源](https://cco.gov.hk/tc/project-sites/tap-mun) |
| E1 | 匠人手作 | 皮鞋木楦 | 文化卡 | `card-shoemaking-last.webp` | 木楦撐起鞋形，皮料經裁剪、縫合與修整，慢慢變成合腳的皮鞋。試鞋嗰陣你話爭少少，師傅就認真處理嗰少少。 | [來源](https://www.leatherism.net/product-page/diy-course-shoes-brogues) |
| E2 | 匠人手作 | 手繪招牌 | 文化卡 | `card-hand-painted-shop-sign.webp` | 筆鋒、留白與店名，一筆筆寫出老店的門面。未識記街號之前，香港人早就識講：行到嗰塊靚招牌轉彎。 | [來源](https://hkctp.com.hk/news/id/3200) |
| E3 | 匠人手作 | 手敲銅光 | 閃卡 | `card-copperware-hammering-foil.webp` | 昔日銅器工匠靠槌打與修整，將銅片慢慢敲成器物。張卡留住叮叮噹噹的手藝記憶，每一下都唔係按個復原掣就可以重做。 | [來源](https://www.hkcd.com/hkcdweb/content/2022/12/30/content_1380058.html) |
| E4 | 匠人手作 | 活字墨香 | 閃卡 | `card-letterpress-typesetting-foil.webp` | 金屬活字逐粒排入版框，再沾墨壓印，紙上文字先有了重量。今日打錯字撳退格，以前排錯一粒，對手同對眼都要加班。 | [來源](https://printart-contemp.org.hk/tc/visit/) |
| E修正 | 山水探險家 | 獅子山 | 文化卡 | `card-lion-rock.webp` | 獅子山俯望九龍，岩峰輪廓好似一頭伏住的獅子。山腳每日趕住開工，山上嗰位就一直專心望住香港。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-lion-rock-country-park.html) |
| E6 | 山水探險家 | 大帽山雲海 | 文化卡 | `card-tai-mo-shan.webp` | 大帽山高處常見雲霧，山脊與雷達站構成香港熟悉的山頂輪廓。平日嫌返工睇唔到前景，呢度望住雲海反而捨不得走。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-tai-mo-shan.html) |
| F1 | 山水探險家 | 飛鵝山 | 文化卡 | `card-kowloon-peak.webp` | 飛鵝山又稱九龍峰，山勢與九龍東的城市樓群互相映襯。地面覺得高到不得了的大廈，喺山景入面都變成細格仔。 | [來源](https://www.discoverhongkong.com/tc/attractions/hong-kong-after-dark.html) |
| F2 | 山水探險家 | 釣魚翁 | 文化卡 | `card-high-junk-peak.webp` | 清水灣一帶的釣魚翁以尖削山形引人注目，山海景色同場出現。名字似去釣魚，張卡真正釣住嘅係你個放假心情。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-high-junk-peak.html) |
| F3 | 山水探險家 | 青山 | 文化卡 | `card-castle-peak.webp` | 青山聳立屯門一帶，岩石山勢與山下城市砌成鮮明對比。英文叫Castle Peak，收藏嘅係香港山景，唔使喺圖入面搵城堡。 | [來源](https://www.gohk.gov.hk/tc/spots/spot_detail.php?spot=Castle+Peak) |
| F4 | 山水探險家 | 鳳凰山 | 文化卡 | `card-lantau-peak.webp` | 鳳凰山的高峻山峰立於大嶼山，雲霧與晨光讓山線時隱時現。日出未必肯準時露面，但張卡會替你留住一抹金光。 | [來源](https://www.hiking.gov.hk/promote/info/id/WTlaMHl6akpNYk9BRGViczlXaFZhQT09/map_type/1) |
| F5 | 山水探險家 | 大東山芒海 | 閃卡 | `card-sunset-peak-foil.webp` | 秋日大東山的芒草映住夕光，山間石屋替金色山坡添一點歲月感。風吹一下，成片山都識得自己做閃卡效果。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-sunset-peak.html) |
| F6 | 山水探險家 | 馬鞍山雙峰 | 閃卡 | `card-ma-on-shan-foil.webp` | 馬鞍山的雙峰與鞍形山脊，替新界東畫出一條有個性的天際線。平日只記得車站名，原來個名背後仲有真山做主角。 | [來源](https://www.afcd.gov.hk/tc_chi/country/cou_vis/cou_vis_cou/cou_vis_cou_mos/cou_vis_cou_mos.html) |
| G1 | 山水探險家 | 八仙嶺連峰 | 閃卡 | `card-pat-sin-leng-foil.webp` | 八仙嶺連綿山峰俯望船灣淡水湖一帶，起伏山線好似一排靜靜排隊的朋友。仙人各有名字，張卡就先替你留低成幅山水。 | [來源](https://www.afcd.gov.hk/tc_chi/country/cou_vis/cou_vis_cou/cou_vis_cou_psl/cou_vis_cou_psl.html) |
| G2 | 山水探險家 | 龍脊海天 | 閃卡 | `card-dragons-back-foil.webp` | 龍脊沿港島東南起伏伸展，石澳一帶的山與海同框。城市每日叫你條腰坐直，呢條山脊就彎得好有型。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-dragon-s-back.html) |
| G3 | 山水探險家 | 淺水灣 | 文化卡 | `card-repulse-bay.webp` | 淺水灣的弧形沙灘與背後山坡樓宇，拼出港島南熟悉的海岸風景。平日望手機望到攰，望一陣海先知對眼都想放假。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-repulse-bay.html) |
| G4 | 山水探險家 | 赤柱正灘 | 文化卡 | `card-stanley-main-beach.webp` | 赤柱正灘面向開揚海灣，岸邊水上活動器材替海景添上顏色。個人仲喺市區，張卡已經幫你個心預先去咗赤柱。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-hk/beach-address-south.html) |
| G5 | 山水探險家 | 大浪灣（港島） | 文化卡 | `card-big-wave-bay-hk-island.webp` | 港島大浪灣依住青綠山坡，沙灘同浪花構成另一種香港節奏。呢張收藏嘅係石澳附近嗰個大浪灣，唔好同西貢同名海灣認錯親戚。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-dragon-s-back-viewing-point.html) |
| G6 | 山水探險家 | 長沙海岸 | 文化卡 | `card-cheung-sha-beach.webp` | 大嶼山南岸長沙的沙灘沿海伸展，山坡、村屋與海浪一齊慢落嚟。平日嫌條隊太長，呢度條海岸線長就只會覺得正。 | [來源](https://www.discoverhongkong.com/tc/outdoors/10-beaches-to-visit-in-hong-kong.html) |
| H1 | 山水探險家 | 銀線灣 | 文化卡 | `card-silverstrand-beach.webp` | 西貢銀線灣的小海灣被山坡與住宅圍住，沙灘留住一段近城市的海風。名字聽落好貴氣，張卡最想收藏嘅其實係一陣清閒。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-sk.html) |
| H2 | 山水探險家 | 石澳泳灘 | 文化卡 | `card-shek-o-beach.webp` | 石澳泳灘旁邊的低矮村屋與山坡，將香港海邊畫得格外有生活感。影完海景仲想望多兩眼彩色屋仔，記憶卡都想申請加班。 | [來源](https://www.discoverhongkong.com/tc/outdoors/10-beaches-to-visit-in-hong-kong.html) |
| H3 | 山水探險家 | 咸田灣海風 | 閃卡 | `card-ham-tin-wan-foil.webp` | 咸田灣位於西貢大浪灣一帶，遠山、沙岸與浪花展現香港郊野另一面。平日訊息一浪接一浪，呢張卡只想畀你聽真正海浪。 | [來源](https://www.discoverhongkong.com/tc/outdoors.html) |
| H4 | 山水探險家 | 清水灣第二灣 | 閃卡 | `card-clear-water-bay-second-foil.webp` | 清水灣第二灣的弧形沙岸依住山坡，碧綠海面替卡面添上通透層次。每日待辦清單好長，望住海嗰一秒就先清空個腦。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-sk.html) |
| H5 | 山水探險家 | 橋咀廈門灣 | 閃卡 | `card-hap-mun-bay-foil.webp` | 橋咀洲廈門灣又稱半月灣，彎彎沙岸配上山林與海水，收進卡裡都覺得開揚。個名有廈門，張卡收藏嘅仍然係香港西貢。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-sk.html) |
| H6 | 山水探險家 | 舂坎角 | 閃卡 | `card-chung-hom-kok-foil.webp` | 舂坎角泳灘藏於港島南的小海灣，山坡、沙岸與瞭望台砌成安靜一角。市區鐘聲催你趕，海浪就只係一下一下慢慢嚟。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-hk/beach-address-south.html) |
