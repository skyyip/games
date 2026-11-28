# 彩色閃卡與小吃／山水擴充（2026-11-28）

原有160張卡的完整欄位保留；新增20張獨立港式漫畫WebP。街頭小吃與山水探險家各由20增至30張，各新增5文化卡／5閃卡；山水新增5山嶺及5海灘。其餘六類各20張，全冊180張（99文化卡／81閃卡）。

## 原圖與匯出

原創image_gen插畫採細緻墨線、水彩／水粉、暖紙、玉綠、朱紅與赭黃。A至E均為二欄二列四格，按左上、右上、左下、右下匯出；每格裁邊2px後縮成508px、WebP品質91、method6。白糖糕初稿過於鬆散像蛋糕，改用獨立插畫呈現濕潤、半透明、表面光滑與細長發酵孔的米糕質感，取代B1。原始PNG保持不變；插畫為文化意境，並非精確地圖、現場照片或開放狀態資料。

重現：`node scripts/package-colour-180-art.mjs <A.png> <B.png> <C.png> <D.png> <E.png> <white-cake-correction.png>`。原48張卡的舊匯出腳本固定使用112–159記錄，擴充後仍可重現。

| 組別 | 原PNG | SHA-256 |
|---|---|---|
| A | exec-e1aeffcf-2468-4ef3-93df-e811c0f85473.png | d43e66ef74eba102b295a83c7f4b195752206659e3a937463cbeb39453351a16 |
| B | exec-51d93d9d-7433-41af-bfd5-48ed51fe259a.png | 92b7b5e5432dd1231954897c96423d81058b1d7574f47f54265b2948e67ebd41 |
| C | exec-e61e53dd-c232-4c08-ad11-ad577c5ef425.png | 481d54918da14551cf8f2ef6fb45802b8f412a62835c4a49e7ede45c09f8175d |
| D | exec-8feb0223-2cce-46fb-9525-348233e2c021.png | 0bc9f30a061a15f43e5b5adbb04d66e6a56aeac884b76a8826cc5c7ea59802f8 |
| E | exec-a1605f47-ce91-4b88-9bb5-1e78dda268f4.png | 4e2108c77ccc4d5848cbe4d733bd7f4d36286c14823b83449f8a0e53e036ebec |
| white-cake-correction | exec-7fa0e959-8fe1-468d-80cc-e9eeec4d5dc5.png | 0907cb0b3271a038beef496ec161607619b9544dddb7b63168c9a886a9df6464 |

## 新卡審閱

食物介紹以香港街頭與茶餐廳的日常為背景，不聲稱所有食物都起源於香港；地名及簡介參照漁護署、旅發局、地政總署、天文台、康文署及文化資料。蚺蛇尖與狗牙嶺只作山景收藏，不提供登山路線或難度保證。

| 格 | 分類 | 卡名 | 類型 | WebP | 故事 | 延伸閱讀 |
|---|---|---|---|---|---|---|
| A1 | 街頭小吃 | 炸魷魚鬚 | 文化卡 | `card-fried-squid-skewer.webp` | 炸到金黃的魷魚鬚，配竹籤與紙袋，就係香港街頭熟悉的香口誘惑。你話買嚟一路行一路食，通常未行到街口已經食完。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html) |
| A2 | 街頭小吃 | 柱侯牛雜 | 文化卡 | `card-beef-offal-pot.webp` | 牛雜與蘿蔔喺濃香醬汁裡慢慢炆，細細碗都裝得落街角的暖意。原本話只係買蘿蔔，聞到香味之後，預算就自然有彈性。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html) |
| A3 | 街頭小吃 | 糖炒栗子 | 文化卡 | `card-roasted-chestnut-cart.webp` | 大鐵鑊裡栗子翻滾，熱氣同甜香搶先替小販打招呼。冬天最難嘅選擇：係先剝栗子，定係繼續攬住個暖紙袋。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html) |
| A4 | 街頭小吃 | 花生芝麻糖 | 文化卡 | `card-peanut-sesame-candy.webp` | 花生、芝麻與糖漿壓成一塊塊脆糖，切開就係舊式糖果舖的香氣。話好只食一小塊，塊糖碎開咗，又多咗幾個合理藉口。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink.html) |
| B1修正 | 街頭小吃 | 白糖糕 | 文化卡 | `card-white-sugar-sponge-cake.webp` | 白糖糕由米漿發酵蒸成，雪白糕身藏住細密孔洞，是香港懷舊糕點之一。外表好似好低調，咬落先知佢有自己一套甜蜜說服力。 | [來源](https://guide.michelin.com/hk/zh_HK/article/features/must-eat-traditional-desserts-hong-kong) |
| B2 | 街頭小吃 | 龍鬚糖雪絲 | 閃卡 | `card-dragon-beard-candy-foil.webp` | 糖絲拉到幼如龍鬚，再裹入花生等餡料，小小一件就係手藝。食之前驚整散，食之後先發現嘴角已經自帶白色鬍鬚。 | [來源](https://www.icho.hk/tc/web/icho/2024_meet_the_masters.html) |
| B3 | 街頭小吃 | 楊枝甘露 | 閃卡 | `card-mango-pomelo-sago-foil.webp` | 芒果、柚肉與西米配上香滑湯底，砌成香港甜品店熟悉的楊枝甘露。明明正餐話飽到行唔郁，甜品一到，個胃又識得自行擴建。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink/must-try-traditional-hong-kong-desserts.html) |
| B4 | 街頭小吃 | 滑蛋三文治 | 閃卡 | `card-hong-kong-egg-sandwich-foil.webp` | 鬆軟白麵包夾住香滑炒蛋，茶餐廳的簡單配搭一樣令人掛住。諗住叫份輕食，結果第一啖就開始計劃下次早餐。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink.html) |
| C1 | 街頭小吃 | 臭豆腐小檔 | 閃卡 | `card-deep-fried-stinky-tofu-foil.webp` | 臭豆腐炸出香脆外層，再點上醬汁，是香港街頭小吃的鮮明角色。未見到檔口，個鼻已經幫你導航；有人即刻行快兩步，有人即刻排隊。 | [來源](https://www.discoverhongkong.com/tc/food-and-drink/must-try-street-food-in-hong-kong.html) |
| C2 | 街頭小吃 | 煎堆芝麻香 | 閃卡 | `card-fried-sesame-ball-foil.webp` | 金黃煎堆外面裹住芝麻，糯米皮炸得香脆，餡料配搭各有特色。圓碌碌一粒唔算大，點知咬落去，開心可以膨脹咁多。 | [來源](https://hkccda.org/2022/04/13/26foodcul/) |
| C3 | 山水探險家 | 蚺蛇尖 | 文化卡 | `card-sharp-peak.webp` | 西貢蚺蛇尖的尖削輪廓，從層層綠嶺間突圍而出，山海同框格外有氣勢。名字有條蛇，張卡收藏嘅就係自然山線，唔使驚佢突然郁。 | [來源](https://www.hiking.gov.hk/content/fatal_detail/id/13) |
| C4 | 山水探險家 | 柏架山 | 文化卡 | `card-mount-parker.webp` | 柏架山位於港島東，綠色山坡與鰂魚涌一帶樓群互相映襯。樓下講效率，山上講風景；同一個香港，原來可以有兩種節奏。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-mount-parker.html) |
| D1 | 山水探險家 | 大老山天際 | 文化卡 | `card-tates-cairn.webp` | 大老山的天氣雷達在山頂觀察雨區，白色圓罩成為山線上的熟悉記號。你出門先問落唔落雨，佢已經默默幫香港望咗好耐。 | [來源](https://www.hko.gov.hk/tc/aviat/amt/tc_radar.htm) |
| D2 | 山水探險家 | 狗牙嶺山線 | 閃卡 | `card-kau-nga-ling-foil.webp` | 大嶼山狗牙嶺的岩脊起伏尖峭，像鋸齒般伸向綠色山谷。名字聽落好惡，遠遠欣賞山線，已經夠有霸氣。 | [來源](https://www.landsd.gov.hk/doc/en/mapping/ehkg/MapPages/GeoPDF/SS09_LantauIsland.pdf) |
| D3 | 山水探險家 | 大刀屻青脊 | 閃卡 | `card-tai-to-yan-foil.webp` | 新界大刀屻以狹長起伏的山脊見稱，青山與鄉郊谷地在兩旁鋪開。名字有刀，張卡最鋒利嘅功能就係一眼切走少少返工壓力。 | [來源](https://www.discoverhongkong.com/tc/place-to-go/travel.guide-tai-to-yan.html) |
| D4 | 山水探險家 | 銀礦灣晨光 | 文化卡 | `card-silvermine-bay.webp` | 銀礦灣位於大嶼山梅窩，弧形沙岸、村屋與青山一齊迎接海風。平日鬧鐘叫極唔起，見到呢幅晨光，個心已經偷偷早起咗。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-is.html) |
| E1 | 山水探險家 | 黃金泳灘 | 文化卡 | `card-golden-beach.webp` | 屯門黃金泳灘的沙岸連住海濱景色，陽光將海面照出一點金色。名字好似好富貴，張卡收藏嘅其實係唔使睇時間的放假心情。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-tm.html) |
| E2 | 山水探險家 | 深水灣海色 | 閃卡 | `card-deep-water-bay-foil.webp` | 深水灣位於港島南，彎彎沙岸背靠綠色山坡，替繁忙城市留出一片海。手機裡啲訊息仲喺度排隊，對眼就想先俾海景插個隊。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-hk/beach-address-south.html) |
| E3 | 山水探險家 | 蝴蝶灣樹影 | 閃卡 | `card-butterfly-beach-foil.webp` | 屯門蝴蝶灣的海邊公園、樹蔭與沙岸，記下街坊散步望海的日常。唔使每次放假都追大場面，一張凳、一陣海風，已經可以坐得好認真。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-nt/beach-address-tm.html) |
| E4 | 山水探險家 | 龜背灣綠岸 | 閃卡 | `card-turtle-cove-foil.webp` | 大潭一帶的龜背灣藏於港島南的綠色海岸，細小沙灣被山坡輕輕圍住。名字有龜，風景就請你慢慢睇；張卡唔會催你交功課。 | [來源](https://www.lcsd.gov.hk/tc/beach/index/beach-location-hk/beach-address-south.html) |

## 閃卡配色

已持有閃卡的卡冊外框與底色採藍、紫、粉、金漸層，詳情視窗使用同色系靜態彩底；稀有度標記有清晰深紫文字。原插畫、柔和金屬掃光、星芒、跟隨光暈、圓角裁切及不傾斜卡框保留。減少動態時仍有彩色底；未持有閃卡仍維持灰階及普通視窗底色。普通文化卡保持原來紙色。
