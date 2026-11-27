// Two supplied drafts: all 45 + 15 topics, with reviewed facts and authored visual clues.
import {SPOTLIGHT_IDS} from './visual-catalog.js';
const records=[
 {
  "id": "s01",
  "sourceNumber": 1,
  "tier": 2,
  "category": "街道・城市設計",
  "question": "石邊這排金屬件，最可能有甚麼用途？",
  "options": [
   "固定石欄上的扶手",
   "提供轉彎的觸覺提示",
   "防止滑板沿石邊磨滑",
   "讓石槽內積水排走"
  ],
  "answer": 2,
  "explanation": "圖中的金屬凸粒打斷原本連續的平滑石邊，屬防滑板磨滑裝置的常見形式。不是觸覺引路磚，亦不能把所有石邊金屬件都當成這種用途。",
  "hint": "留意凸粒有冇打斷一條可以滑行嘅直邊。",
  "source": {
   "label": "屋宇署・設計手冊及舊版本索引（暢通無阻的通道）",
   "url": "https://www.bd.gov.hk/tc/resources/codes-and-references/codes-and-design-manuals/index.html"
  },
  "art": "street-01",
  "modes": [
   "partial",
   "original"
  ],
  "review": "保留題材；限定圖中裝置，移除所有花槽均如此設計的概括。",
  "textQuestion": "花槽石壆邊緣的防滑板金屬凸粒，主要阻止哪種活動？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "連續石邊上等距的短金屬凸粒",
   "alt": "連續石邊上等距的短金屬凸粒",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s02",
  "sourceNumber": 2,
  "tier": 1,
  "category": "建築・公共空間",
  "question": "圖中門板留空的位置，最直接方便甚麼？",
  "options": [
   "加強門板的隔音能力",
   "阻隔清潔用水進入廁格",
   "讓門鎖能由外部自動開啟",
   "地面清潔及空氣流通"
  ],
  "answer": 3,
  "explanation": "廁格門底空隙可方便地面清潔及空氣流通，也可能讓人察覺異常。各場地須兼顧私隱與無障礙設計，沒有一個適用所有公廁的統一高度，亦不應自行鑽門施救。",
  "hint": "睇清楚空位喺門頂、門邊定門底。",
  "source": {
   "label": "屋宇署・設計手冊及舊版本索引（暢通無阻的通道）",
   "url": "https://www.bd.gov.hk/tc/resources/codes-and-references/codes-and-design-manuals/index.html"
  },
  "art": "street-02",
  "modes": [
   "partial",
   "original"
  ],
  "review": "刪除統一高度及保證救援說法，改問可觀察的空隙效果。",
  "textQuestion": "廁格門底留有空隙，哪組實用影響最合理？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "門板下緣與地面之間的空隙",
   "alt": "門板下緣與地面之間的空隙",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s03",
  "sourceNumber": 3,
  "tier": 2,
  "category": "道路・街頭標記",
  "question": "辨認地面字樣，哪個配對正確？",
  "options": [
   "巴士停車處；非獲准車輛不應停車",
   "行人過路處；所有車輛可停車",
   "上落貨車位；只限私家車停車",
   "的士候客處；只限巴士停車"
  ],
  "answer": 0,
  "explanation": "圖中巴士停車處的標記須連同現場標誌理解。運輸署列明巴士站等地點不准停車，特許使用者除外；不應把停車限制改寫成所有其他車輛一律禁止駛過。",
  "hint": "先還原地上嘅英文字，唔好只憑黃線估。",
  "source": {
   "label": "運輸署・不准停車的地點",
   "url": "https://www.td.gov.hk/tc/road_safety/road_users_code/index/chapter_5_for_all_drivers/where_not_to_stop_/index.html"
  },
  "art": "street-03",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "修正原稿把不准停車誤寫為一概不准駛入。",
  "textQuestion": "巴士站停車處內，非獲准使用車輛應遵守哪項限制？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "黃色BUS STOP字樣及站邊標記",
   "alt": "黃色BUS STOP字樣及站邊標記",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原地面倒轉字樣，哪個用途配對正確？",
   "overview": {
    "x": 220,
    "y": 205,
    "width": 360,
    "height": 90
   }
  }
 },
 {
  "id": "s04",
  "sourceNumber": 4,
  "tier": 2,
  "category": "建築・公共空間",
  "question": "只看這段頂部輪廓，哪件事較難做到？",
  "options": [
   "沿着欄杆看清邊界",
   "在頂部穩妥平放物件",
   "看見欄杆後方的景物",
   "辨認欄杆的立柱位置"
  ],
  "answer": 1,
  "explanation": "圓管頂部沒有寬闊的平面，物件較難穩妥擺放；但這不是所有欄杆的唯一設計動機。不要坐上欄杆或在高處擺放雜物。",
  "hint": "比較圓弧頂同平板頂可以放幾穩。",
  "source": {
   "label": "屋宇署・設計手冊及舊版本索引（暢通無阻的通道）",
   "url": "https://www.bd.gov.hk/tc/resources/codes-and-references/codes-and-design-manuals/index.html"
  },
  "art": "street-04",
  "modes": [
   "partial",
   "original"
  ],
  "review": "刪除全港欄杆統一防坐動機，改考圖示形狀的直接效果。",
  "textQuestion": "欄杆頂部呈圓管而不是平板，哪件事相對較難？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "欄杆頂部向下彎的圓弧邊",
   "alt": "欄杆頂部向下彎的圓弧邊",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s05",
  "sourceNumber": 5,
  "tier": 1,
  "category": "交通・日常設計",
  "question": "這對裝置一高一低，最直接照顧甚麼？",
  "options": [
   "同一車輛前後輪的高度",
   "乘客分別支付入場與泊車費",
   "不同車輛駕駛座的高度",
   "同一卡片不同的付款密碼"
  ],
  "answer": 2,
  "explanation": "不同高度的讀卡位置方便不同車身及駕駛座高度的司機伸手拍卡。並非每個停車場均採同一設計，也不是讓同一程車重複付款。",
  "hint": "想像坐跑車同坐客貨車，伸手位置有咩唔同。",
  "source": {
   "label": "消費者委員會・消費資訊",
   "url": "https://www.consumer.org.hk/tc"
  },
  "art": "street-05",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "限定圖中雙層配置，不虛構所有停車場的規格。",
  "textQuestion": "停車場同一入口設不同高度的拍卡器，主要照顧甚麼差異？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "同一柱上兩塊一高一低的感應面板",
   "alt": "同一柱上兩塊一高一低的感應面板",
   "crop": {
    "x": 320,
    "y": 140,
    "width": 160,
    "height": 210
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s06",
  "sourceNumber": 6,
  "tier": 1,
  "category": "交通・乘車日常",
  "question": "沿圖中箭嘴排隊，中央應留給誰？",
  "options": [
   "等候上車的第三條隊",
   "職員放置清潔器材",
   "候車乘客停放大行李",
   "先下車的乘客"
  ],
  "answer": 3,
  "explanation": "兩側排隊及中央留空讓下車乘客先離開，減少上落客互相阻擋。應按現場標線排隊、先落後上，不必將此包裝成固定的流體力學定律。",
  "hint": "兩邊入，中間條直路要先畀人出。",
  "source": {
   "label": "港鐵・乘客服務",
   "url": "https://www.mtr.com.hk/ch/customer/services/index.php"
  },
  "art": "street-06",
  "modes": [
   "partial",
   "original"
  ],
  "review": "保留先落後上；移除未量證的縮短停站幅度。",
  "textQuestion": "月台排隊箭嘴向車門兩側展開，中央留空是為了甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "車門中央直行箭嘴與兩側候車箭嘴",
   "alt": "車門中央直行箭嘴與兩側候車箭嘴",
   "crop": {
    "x": 250,
    "y": 175,
    "width": 300,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s07",
  "sourceNumber": 7,
  "tier": 2,
  "category": "交通・香港地理",
  "question": "認出三種顏色的車，哪個地點三者皆可到？",
  "options": [
   "香港國際機場客運大樓",
   "灣仔會議展覽中心",
   "旺角朗豪坊",
   "赤柱市集"
  ],
  "answer": 0,
  "explanation": "按運輸署資料，三類的士均可在機場客運大樓、港珠澳大橋香港口岸和迪士尼樂園提供服務。新界的士前往指定地點仍須使用准許路線，不等於可在全港自由行走。",
  "hint": "三種顏色服務範圍唔同，但有共同嘅交通樞紐。",
  "source": {
   "label": "運輸署・的士服務",
   "url": "https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/taxi/index_t.html"
  },
  "art": "street-07",
  "modes": [
   "blurred",
   "original"
  ],
  "review": "核對運輸署准許服務地點；不用「突破禁區」誤導。",
  "textQuestion": "哪個地點可由紅色、綠色及藍色三類香港的士提供服務？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "並排的紅、綠、藍色車身與頂燈",
   "alt": "並排的紅、綠、藍色車身與頂燈",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s08",
  "sourceNumber": 8,
  "tier": 2,
  "category": "交通・車廂設計",
  "question": "車尾這段隆起地板下，通常要容納甚麼？",
  "options": [
   "供乘客上層行李托運",
   "後置引擎及傳動等機件",
   "供落車門板收回的空間",
   "供車頂集電桿轉向的機件"
  ],
  "answer": 1,
  "explanation": "不少後置引擎柴油巴士的尾部機械設備佔用空間，影響車尾地板及座位安排。電動、不同底盤及不同年代車型不可一概而論。",
  "hint": "望吓呢段台階係靠近前門定車尾。",
  "source": {
   "label": "九巴・乘客服務",
   "url": "https://www.kmb.hk/"
  },
  "art": "street-08",
  "modes": [
   "partial",
   "original"
  ],
  "review": "限定後置柴油車型，不聲稱所有巴士用同一底盤。",
  "textQuestion": "後置引擎柴油雙層巴士的下層車尾地板較高，常與甚麼有關？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "後輪附近升高的地板與向上兩級台階",
   "alt": "後輪附近升高的地板與向上兩級台階",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s09",
  "sourceNumber": 9,
  "tier": 1,
  "category": "交通・車廂設計",
  "question": "圖中兩種地板顏色，最直接讓你辨認甚麼？",
  "options": [
   "不同票價座位的範圍",
   "所有優先座的年齡限制",
   "車門旁與車廂中央的不同區域",
   "上車與下車的付費金額"
  ],
  "answer": 2,
  "explanation": "圖示用色塊區分門區及內部通道。實際列車設計各異；乘客宜向車廂內移動、保持車門暢通，不能聲稱這是港鐵所有地板的唯一官方心理設計。",
  "hint": "比較兩種色塊同車門位置嘅關係。",
  "source": {
   "label": "港鐵・乘客服務",
   "url": "https://www.mtr.com.hk/ch/customer/services/index.php"
  },
  "art": "street-09",
  "modes": [
   "original"
  ],
  "review": "移除未獲確認的潛意識設計動機，改問可見分區。",
  "textQuestion": "車廂地面用兩種顏色區分車門附近與中央，能提供甚麼視覺資訊？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "車門旁深色地板與車廂中央淺色地板",
   "alt": "車門旁深色地板與車廂中央淺色地板",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s10",
  "sourceNumber": 10,
  "tier": 2,
  "category": "交通・城市文化",
  "question": "這條車身折線與紅色塗裝，對應哪個主題？",
  "options": [
   "海港波浪",
   "山峰輪廓",
   "鐵路網絡",
   "城市脈搏"
  ],
  "answer": 3,
  "explanation": "九巴發展里程記錄2017年推出紅巴，主題為「城市脈搏」。插畫只借紅色與脈搏折線作辨識線索，不把每條線的位置附會成官方指定的窗框意義。",
  "hint": "條折線令人聯想起一種有節奏嘅訊號。",
  "source": {
   "label": "九巴・發展里程",
   "url": "https://www.kmb.hk/milestones.html"
  },
  "art": "street-10",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "採九巴官方主題；刪除未證實的車窗與樓梯連線象徵。",
  "textQuestion": "2017年九巴推出紅色車身「紅巴」，配合哪個官方主題？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "紅色車身上的銀白色脈搏形折線",
   "alt": "紅色車身上的銀白色脈搏形折線",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s11",
  "sourceNumber": 11,
  "tier": 2,
  "category": "飲食・香港味道",
  "question": "圖中包身切開後露出的甜餡，常見起源說法是？",
  "options": [
   "把剩麵包碎混合糖等做餡",
   "以雞蛋黃與雞油為唯一餡料",
   "以雞尾酒浸過的完整葡萄作餡",
   "以炒碎雞肉與洋蔥作鹹餡"
  ],
  "answer": 0,
  "explanation": "常見說法是麵包師傅把剩餘麵包加工成甜餡，雞尾包後來常有椰絲等材料。起源、年代和配方有不同版本，不能把單一傳說當成唯一確證。",
  "hint": "睇吓餡料係細碎嘅甜餡，定一整件肉。",
  "source": {
   "label": "香港旅遊發展局・香港飲食文化",
   "url": "https://www.discoverhongkong.com/tc/explore/dining.html"
  },
  "art": "street-11",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "把起源標為常見說法，刪除唯一發明年代與固定原始配方。",
  "textQuestion": "雞尾包餡料的常見起源說法，與哪種節省食材做法有關？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "長形麵包的切面露出淺黃色碎粒餡",
   "alt": "長形麵包的切面露出淺黃色碎粒餡",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s12",
  "sourceNumber": 12,
  "tier": 2,
  "category": "飲食・茶記科學",
  "question": "圖中這個先做的步驟，主要避免甚麼？",
  "options": [
   "減少茶葉在杯內繼續發酵",
   "冷杯吸走飲品的部分熱量",
   "阻止牛奶在壺內受熱",
   "使瓷杯與飲品永遠同溫"
  ],
  "answer": 1,
  "explanation": "預熱杯子可減少冷杯最初從飲品吸熱。厚瓷有較大的熱容量，但未預熱時也會吸熱；不能把厚壁一律說成比所有材料更隔熱。",
  "hint": "杯本身凍冰冰時，熱飲要先分啲熱力畀佢。",
  "source": {
   "label": "香港旅遊發展局・香港飲食文化",
   "url": "https://www.discoverhongkong.com/tc/explore/dining.html"
  },
  "art": "street-12",
  "modes": [
   "original"
  ],
  "review": "修正厚杯必然保溫的絕對物理說法；改考預熱。",
  "textQuestion": "沖熱奶茶前先用熱水暖瓷杯，最直接可減少哪種熱量損失？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "熱水先倒入空瓷杯，旁邊奶茶仍在壺中",
   "alt": "熱水先倒入空瓷杯，旁邊奶茶仍在壺中",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s13",
  "sourceNumber": 13,
  "tier": 2,
  "category": "生活・物件觀察",
  "question": "圖中套疊位置留了小空隙，有何實用效果？",
  "options": [
   "讓水桶裝水時能同時排水",
   "使桶內容量刻度更精確",
   "較易分開，減少兩桶卡緊",
   "方便把提手當作密封蓋"
  ],
  "answer": 2,
  "explanation": "止疊凸緣或間隔設計可防止桶身套得過深，利於分開。不是所有紅色塑膠桶的每條橫紋都為此而設，也不能只憑品牌或顏色推斷結構。",
  "hint": "要睇套疊接觸位，唔係見到紅色就估品牌。",
  "source": {
   "label": "消費者委員會・消費資訊",
   "url": "https://www.consumer.org.hk/tc"
  },
  "art": "street-13",
  "modes": [
   "partial",
   "original"
  ],
  "review": "限定有止疊凸緣的示意，不推定某品牌所有橫紋的唯一用途。",
  "textQuestion": "套疊水桶若有止疊凸緣留出間隙，最直接有何好處？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "兩個套疊桶口之間的凸緣與小間隙",
   "alt": "兩個套疊桶口之間的凸緣與小間隙",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s14",
  "sourceNumber": 14,
  "tier": 1,
  "category": "飲食・街頭文化",
  "question": "認出這個器物的外形，最常見於哪類舖頭？",
  "options": [
   "中式醬油店",
   "街市香燭舖",
   "傳統米行",
   "涼茶舖"
  ],
  "answer": 3,
  "explanation": "葫蘆形金屬容器是部分傳統涼茶舖的視覺標記，可與盛載涼茶的器具結合。造型及實際用途因店舖而異，不能保證所有裝飾葫蘆都盛着熱飲。",
  "hint": "上下兩個肚，中間收窄，係邊類老店常見嘅輪廓？",
  "source": {
   "label": "香港旅遊發展局・香港飲食文化",
   "url": "https://www.discoverhongkong.com/tc/explore/dining.html"
  },
  "art": "street-14",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "保留文化物件辨識，不把民俗象徵或保溫性能說成統一功能。",
  "textQuestion": "傳統涼茶舖常見葫蘆形金屬壺，通常與哪類飲品有關？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "上下圓鼓、中間收腰的金色容器與壺嘴",
   "alt": "上下圓鼓、中間收腰的金色容器與壺嘴",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s15",
  "sourceNumber": 15,
  "tier": 2,
  "category": "生活・物件觀察",
  "question": "圖中杯底中央有凹位，倒扣時可能怎樣？",
  "options": [
   "凹位仍可能積水，需要瀝乾",
   "凹位一定會令水自動蒸發",
   "杯底有凹位即代表可放明火",
   "凹位能把膠杯變成保溫瓶"
  ],
  "answer": 0,
  "explanation": "杯底凹陷的製造及結構用途因杯款而異；倒扣時凹位可能形成積水位置。原稿「必定避免杯底積水」並不成立，清潔後應按實際形狀瀝乾。",
  "hint": "杯倒轉咗，原本向下嘅凹位而家向邊？",
  "source": {
   "label": "食物安全中心・食物安全資訊",
   "url": "https://www.cfs.gov.hk/tc_chi/"
  },
  "art": "street-15",
  "modes": [
   "original"
  ],
  "review": "修正凹底一定避免積水的倒置說法，不虛構製造商設計理由。",
  "textQuestion": "杯底有凹槽時，倒扣晾乾應留意甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "倒扣膠杯底部朝上的圓形凹坑與一滴水",
   "alt": "倒扣膠杯底部朝上的圓形凹坑與一滴水",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s16",
  "sourceNumber": 16,
  "tier": 2,
  "category": "街道・標牌解碼",
  "question": "讀圖中H下方的數字，所示距離是多少米？",
  "options": [
   "5.2米",
   "2.5米",
   "150米",
   "15米"
  ],
  "answer": 1,
  "explanation": "這類消防栓指示牌可提供喉管尺寸及距離等資訊；本圖下方示例為2.5米，不要與上方150混淆。圖是教學示意，實際標牌按現場規格閱讀，不可自行操作消防供水設施。",
  "hint": "先搵橫線下面嗰組數字，小數點都要睇清。",
  "source": {
   "label": "水務署・敷設水管實務手冊",
   "url": "https://www.wsd.gov.hk/filemanager/en/content_1456/Manual%20of%20Mainlaying%20Practice%20%28Amendment%20No.%201_2021%29.pdf"
  },
  "art": "street-16",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "保留標牌與上下數字辨識，限定示例單位，不把所有黃牌當成相同制式。",
  "textQuestion": "圖示消防供水指示牌H下方寫2.5，這個數字以米表示距離。距離是多少？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "H下方橫線以下寫着2.5，上方為150",
   "alt": "黃色牌上有H、上方150與下方2.5，鏡像模式時整牌左右反轉",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "先還原倒轉標牌，再讀H下方距離：幾多米？",
   "overview": {
    "x": 270,
    "y": 90,
    "width": 260,
    "height": 320
   }
  }
 },
 {
  "id": "s17",
  "sourceNumber": 17,
  "tier": 2,
  "category": "建築・天氣應變",
  "question": "兩側長槽與疊起的板材，應配成甚麼裝置？",
  "options": [
   "升降機門的導軌",
   "商舖鐵閘的捲軸",
   "阻擋洪水的防洪板",
   "展示架的掛價錢牌"
  ],
  "answer": 2,
  "explanation": "槽道讓相配的防洪板定位，配合密封和固定減少水流入。須由合適人員按裝置程序部署，並兼顧安全通行，並非任何凹槽都可自行塞板防洪。",
  "hint": "睇埋板材同門框，兩件嘢係點樣配合。",
  "source": {
   "label": "港鐵・氣候變化與自然環境",
   "url": "https://www.mtr.com.hk/sustainability/ch/climate-and-nature.html"
  },
  "art": "street-17",
  "modes": [
   "partial",
   "original"
  ],
  "review": "限定有配套防洪板的凹槽；不保證任意入口完全防水。",
  "textQuestion": "入口兩側金屬槽配合可插入的防洪板，有甚麼作用？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "入口側邊直槽及槽內一小段銀色板材",
   "alt": "入口側邊直槽及槽內一小段銀色板材",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s18",
  "sourceNumber": 18,
  "tier": 2,
  "category": "建築・維修常識",
  "question": "圖中外牆喉管接駁位有滲漏，應怎辦？",
  "options": [
   "用布包住後長期不再理會",
   "自行爬出外牆拆走喉管",
   "認為外露喉管永遠不用保養",
   "通知管理方安排合適人員檢查維修"
  ],
  "answer": 3,
  "explanation": "外露管道較容易看見部分滲漏，但仍需合適的檢查、維修及安全工作安排。不能聲稱所有大廈排污渠都外露，或外露就能杜絕臭氣及病菌。",
  "hint": "留意水漬出現喺接駁位，處理要兼顧高空安全。",
  "source": {
   "label": "屋宇署・樓宇保養及維修",
   "url": "https://www.bd.gov.hk/tc/safety-inspection/"
  },
  "art": "street-18",
  "modes": [
   "original"
  ],
  "review": "不把外露等同衛生保證；以合理報修取代危險自行處理。",
  "textQuestion": "外露排水管發現滲漏後，哪個處理方向合適？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "外牆喉管接駁口旁的水滴及深色滲痕",
   "alt": "外牆喉管接駁口旁的水滴及深色滲痕",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s19",
  "sourceNumber": 19,
  "tier": 2,
  "category": "街道・日常設計",
  "question": "圖中屋頂與管口的組合，主要有甚麼用途？",
  "options": [
   "讓雨水流向去水位置",
   "把空氣吹進候車亭",
   "替頂棚提供隔熱電源",
   "收集巴士車輪的震動"
  ],
  "answer": 0,
  "explanation": "有斜度的頂板配合溝槽和去水管，可將雨水導往預定位置。不同候車亭排水方向不一，不可說全港都向行人路後方傾斜。",
  "hint": "水會順斜面向低處流，睇吓低處有冇管。",
  "source": {
   "label": "九巴・乘客服務",
   "url": "https://www.kmb.hk/"
  },
  "art": "street-19",
  "modes": [
   "partial",
   "original"
  ],
  "review": "刪除所有亭頂一律向後傾斜的概括，以示意排水路徑出題。",
  "textQuestion": "候車亭頂板有斜度並接往去水管，這個組合主要做甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "傾斜頂板低端連着垂直去水管",
   "alt": "傾斜頂板低端連着垂直去水管",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s20",
  "sourceNumber": 20,
  "tier": 2,
  "category": "康樂・設施設計",
  "question": "池邊這排狹長格柵，主要接收甚麼？",
  "options": [
   "池底沉沙，直接排入街渠",
   "溢出的池水，送往循環處理",
   "泳池補水，直接流入更衣室",
   "泳客用水，直接流入飲水機"
  ],
  "answer": 1,
  "explanation": "溢水槽收集溢出的表面池水，配合循環、過濾與水質管理。格柵不是休息座位，亦不保證單靠溢水槽便可清除全部污染。",
  "hint": "格柵同水面咁接近，先諗水會流去邊。",
  "source": {
   "label": "康文署・公眾游泳池",
   "url": "https://www.lcsd.gov.hk/tc/beach/swim-intro.html"
  },
  "art": "street-20",
  "modes": [
   "partial",
   "original"
  ],
  "review": "保留表面水循環用途；不把減浪或消毒說成絕對成效。",
  "textQuestion": "泳池池邊溢水槽接收表面水，通常連接哪個處理程序？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "水面旁狹長排水格柵與向槽流動的水線",
   "alt": "水面旁狹長排水格柵與向槽流動的水線",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s21",
  "sourceNumber": 21,
  "tier": 2,
  "category": "交通・拍卡考眼力",
  "question": "看清兩部機器的字樣，正確拍卡次序是？",
  "options": [
   "上車前綠色出站，下車後橙色入站",
   "只需在橙色機拍一次，不用出站",
   "上車前橙色入站，下車後綠色出站",
   "只在到站後任選一部機拍兩次"
  ],
  "answer": 2,
  "explanation": "八達通乘客須在登車站入站收費器確認，到目的地後在出站收費器確認。機身橙綠有助辨認，仍應看入站／出站標示；不是兩部都在上車前拍。",
  "hint": "先分清入站同出站，唔好見綠燈就當綠色機。",
  "source": {
   "label": "港鐵・正確使用車票",
   "url": "https://www.mtr.com.hk/ch/customer/main/correct-use-ticket.html"
  },
  "art": "street-21",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "修正按站數退差額的簡化說法，以官方入出站確認流程為準。",
  "textQuestion": "輕鐵八達通橙色入站機與綠色出站機，正確拍卡次序是甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "橙色機寫入站ENTRY，綠色機寫出站EXIT",
   "alt": "橙色機寫入站ENTRY，綠色機寫出站EXIT",
   "crop": {
    "x": 210,
    "y": 190,
    "width": 380,
    "height": 85
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原兩部機的倒轉字樣，正確拍卡次序是？",
   "overview": {
    "x": 215,
    "y": 185,
    "width": 370,
    "height": 90
   }
  }
 },
 {
  "id": "s22",
  "sourceNumber": 22,
  "tier": 2,
  "category": "交通・車廂設計",
  "question": "兩片重疊接片會相對移動，最配合哪個情況？",
  "options": [
   "列車切換不同軌距",
   "車輪在路軌上調整直徑",
   "列車車頂在入隧道時降高",
   "車廂過彎時轉動，仍保留可步行地面"
  ],
  "answer": 3,
  "explanation": "車廂之間需要容許一定角度和位移，活動接片等結構維持通行面。不同車型接頭各異；不應把手、鞋尖或物件放近活動縫隙。",
  "hint": "諗吓兩節車卡過彎，唔會永遠排成一直線。",
  "source": {
   "label": "港鐵・乘客服務",
   "url": "https://www.mtr.com.hk/ch/customer/services/index.php"
  },
  "art": "street-22",
  "modes": [
   "partial",
   "original"
  ],
  "review": "不把全港列車一律描述為相同兩片半圓板；不承諾縫隙完全無風險。",
  "textQuestion": "車廂連接處可相對移動的地板接片，主要兼顧甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "車廂接縫兩側互相覆疊的圓弧金屬接片",
   "alt": "車廂接縫兩側互相覆疊的圓弧金屬接片",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s23",
  "sourceNumber": 23,
  "tier": 2,
  "category": "交通・拍卡考眼力",
  "question": "圖中車門旁另一部指定機器，標示要做甚麼？",
  "options": [
   "按路線條款領取分段車費回贈",
   "重新扣除一次全程車費",
   "為下一程預先繳付按金",
   "查詢八達通所有者的姓名"
  ],
  "answer": 0,
  "explanation": "適用路線可在指定位置拍卡取得分段收費回贈，須符合路線、區段、付款工具及拍卡安排。並非每條巴士線均適用，亦不是任意按距離退費。",
  "hint": "睇清楚機身係寫回贈，定係上車付款。",
  "source": {
   "label": "九巴・八達通轉乘與分段收費優惠",
   "url": "https://www.kmb.hk/fare.html"
  },
  "art": "street-23",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "限定指定路線及條款，不承諾所有行程按實際里數退款。",
  "textQuestion": "指定巴士雙向分段收費路線，下車拍指定回贈器一般為了甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "車門旁裝置印有回贈REBATE字樣",
   "alt": "車門旁裝置印有回贈REBATE字樣",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原機身字樣，這次拍卡應處理甚麼？",
   "overview": {
    "x": 325,
    "y": 185,
    "width": 150,
    "height": 105
   }
  }
 },
 {
  "id": "s24",
  "sourceNumber": 24,
  "tier": 1,
  "category": "交通・城市老朋友",
  "question": "圖中車窗的開啟方式，主要有甚麼直接用途？",
  "options": [
   "把窗固定為密封隔音結構",
   "室外空氣",
   "擴大雨刷在玻璃上的範圍",
   "改變車頂集電桿的接線角度"
  ],
  "answer": 1,
  "explanation": "可開啟窗戶為車廂提供自然通風。不同車輛及天氣安排各異，乘客不可自行伸身或物件出窗，也不能保證開窗一定令所有玻璃不起霧。",
  "hint": "睇吓窗邊打開咗嘅窄縫。",
  "source": {
   "label": "香港電車・電車文化",
   "url": "https://www.hktramways.com/tc/"
  },
  "art": "street-24",
  "modes": [
   "partial",
   "original"
  ],
  "review": "限定非空調舊車設計，不作除霧或安全的絕對承諾。",
  "textQuestion": "舊式非空調電車可推開前窗，主要有甚麼直接效果？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "擋風玻璃向外傾開，窗邊留有通風縫",
   "alt": "擋風玻璃向外傾開，窗邊留有通風縫",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s25",
  "sourceNumber": 25,
  "tier": 1,
  "category": "交通・旅客設施",
  "question": "座位旁這個架，主要是哪類旅客設施？",
  "options": [
   "只供報紙與車票的展示",
   "用作乘客上層座位的腳踏",
   "供旅客放穩行李的層架",
   "供職員暫放清潔廢水"
  ],
  "answer": 2,
  "explanation": "機場快綫有服務旅客的行李設施，行李應放穩並保持通道暢通。沒有依據說每張車票都分配專屬座位或嚴格保證人人有位，不應以不設吊環推導該承諾。",
  "hint": "個架夠放旅行喼，唔係要塞滿條走廊。",
  "source": {
   "label": "港鐵・機場快綫簡介",
   "url": "https://www.mtr.com.hk/ch/customer/services/airport_express_index.html"
  },
  "art": "street-25",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "移除機場快綫保證每人指定座位及控制售票的錯誤推論。",
  "textQuestion": "機場快綫車廂的行李架，主要讓旅客怎樣放置大型行李？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "車廂座位旁的層架放着一個直立旅行喼",
   "alt": "車廂座位旁的層架放着一個直立旅行喼",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s26",
  "sourceNumber": 26,
  "tier": 1,
  "category": "飲食・水吧工藝",
  "question": "壺上懸着這個布袋，主要隔開甚麼？",
  "options": [
   "咖啡粉與咖啡機零件",
   "糖粒與冰水",
   "奶泡與熱牛奶",
   "茶渣與茶湯"
  ],
  "answer": 3,
  "explanation": "布袋用於過濾茶渣，反覆沖濾是港式奶茶工藝的一部分。茶袋需妥善清潔及維護，並非越舊或不清洗就必然更香滑。",
  "hint": "細碎茶葉要留低，茶湯就要流落壺。",
  "source": {
   "label": "非物質文化遺產辦事處・港式奶茶製作技藝",
   "url": "https://www.icho.hk/tc/web/icho/home.html"
  },
  "art": "street-26",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "不宣稱越舊越好；移除未證實的纖維孔隙與茶油保證。",
  "textQuestion": "港式奶茶用棉布茶袋反覆濾茶，這個步驟主要隔開甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "掛在金屬圈上的長布袋，茶湯流入壺內",
   "alt": "掛在金屬圈上的長布袋，茶湯流入壺內",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s27",
  "sourceNumber": 27,
  "tier": 2,
  "category": "飲食・香港味道",
  "question": "圖中層次讓麵少浸在湯裏，主要想保留甚麼？",
  "options": [
   "較爽彈的口感",
   "凍硬如雪條的狀態",
   "油炸後完全乾燥的外殼",
   "生麵粉原封不動的味道"
  ],
  "answer": 0,
  "explanation": "一些雲吞麵店以雲吞承托麵條，減少麵條長時間泡湯而軟脹。盛法、湯匙位置及麵量因店而異，並非每店都遵守一套固定層次。",
  "hint": "麵浸湯太耐會有咩變化？",
  "source": {
   "label": "香港旅遊發展局・香港飲食文化",
   "url": "https://www.discoverhongkong.com/tc/explore/dining.html"
  },
  "art": "street-27",
  "modes": [
   "original"
  ],
  "review": "保留常見擺放思路，避免把所有店及湯匙位置統一化。",
  "textQuestion": "雲吞放下、麵放上的上桌方式，有助維持麵條哪項口感？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "碗內雲吞在下、麵條較高並露出湯面",
   "alt": "碗內雲吞在下、麵條較高並露出湯面",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s28",
  "sourceNumber": 28,
  "tier": 2,
  "category": "生活・安全設計",
  "question": "認出圖中最長的一腳，接駁次序有甚麼作用？",
  "options": [
   "讓火線先接通再接零線",
   "接地連接可先接通、後斷開",
   "使插頭內毋須裝設保險絲",
   "讓所有三腳插頭都無需接地"
  ],
  "answer": 1,
  "explanation": "標準接地腳較長，使接地先接通、後斷開，並可配合插座安全活門。部分雙重絕緣電器用絕緣開門腳，不代表它有金屬接地連接；不可自行改裝插頭。",
  "hint": "三腳唔係同一長度，留意最長嗰支先接觸。",
  "source": {
   "label": "機電工程署・家居電氣安全手冊",
   "url": "https://www.emsd.gov.hk/tc/electricity_safety/publications/general/household_electrical_safety_handbook/part_2/2_1/index.html"
  },
  "art": "street-28",
  "modes": [
   "partial",
   "original"
  ],
  "review": "區分金屬接地腳與絕緣開門腳，不宣稱所有三腳電器都接地。",
  "textQuestion": "英式三腳插頭的接地腳通常較長，與哪個安全次序有關？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "三腳插頭上方一腳明顯長於另外兩腳",
   "alt": "三腳插頭上方一腳明顯長於另外兩腳",
   "crop": {
    "x": 270,
    "y": 150,
    "width": 260,
    "height": 140
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s29",
  "sourceNumber": 29,
  "tier": 2,
  "category": "生活・光學觀察",
  "question": "圖中小鏡筒能廣角看門外，哪個說法正確？",
  "options": [
   "光線只能單向傳播，永不反向",
   "所有貓眼都靠人體靜電變透明",
   "鏡片組改變視野，並非絕對單向保密",
   "鏡片能保證門外永遠看不見室內"
  ],
  "answer": 2,
  "explanation": "光學貓眼以鏡片組取得較廣視野，反向觀看的成像與亮度不同；但光路可逆，不能把它當成絕對單向的私隱保證。需要私隱可採合適遮蓋，勿假設門外永遠看不見。",
  "hint": "廣角鏡同真正單向傳光係兩回事。",
  "source": {
   "label": "消費者委員會・消費資訊",
   "url": "https://www.consumer.org.hk/tc"
  },
  "art": "street-29",
  "modes": [
   "original"
  ],
  "review": "修正光學單向且永不外洩的錯誤說法，不給不實私隱保證。",
  "textQuestion": "大門防盜眼從屋內看有廣角，但反方向通常難看清，哪個說法正確？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "門板中的圓形廣角鏡與鏡筒邊緣",
   "alt": "門板中的圓形廣角鏡與鏡筒邊緣",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s30",
  "sourceNumber": 30,
  "tier": 1,
  "category": "飲食・包裝觀察",
  "question": "圖中兩款包裝手感不同，可直接證明甚麼？",
  "options": [
   "玻璃樽必定多加兩成黃豆",
   "紙盒裝一定未經安全處理",
   "玻璃樽一定加入二氧化碳",
   "不能單憑包裝手感判斷配方濃度"
  ],
  "answer": 3,
  "explanation": "包裝材質、溫度、配方與加工方式都可能影響體驗。玻璃較冷的觸感不能證明飲品更濃；應看產品成分和營養標籤，不虛構品牌特別配方或零氣味保證。",
  "hint": "樽身凍唔凍，同入面落幾多黃豆唔係同一件事。",
  "source": {
   "label": "食物安全中心・食物安全資訊",
   "url": "https://www.cfs.gov.hk/tc_chi/"
  },
  "art": "street-30",
  "modes": [
   "original"
  ],
  "review": "移除未經品牌證實的濃度、殺菌及紙盒異味比較，改考證據判斷。",
  "textQuestion": "同一飲品的玻璃樽與紙盒包裝，能否單憑手感斷定玻璃樽配方更濃？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "並排的玻璃瓶及紙盒，均沒有成分數字",
   "alt": "並排的玻璃瓶及紙盒，均沒有成分數字",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s31",
  "sourceNumber": 31,
  "tier": 2,
  "category": "道路・方向考眼力",
  "question": "按地面這句提示，應先留意哪個方向？",
  "options": [
   "右方，並繼續留意其他來車",
   "左方，按鏡中箭嘴直接判斷",
   "背後，只看候車乘客",
   "前方，只看對面路緣"
  ],
  "answer": 0,
  "explanation": "圖中的LOOK RIGHT意為望右。香港靠左行車，但不同路口、單程路或交通安排會影響來車方向，不能一律只望某一邊；須依現場提示及交通情況安全過路。",
  "hint": "先把英文字還原，唔好跟住反轉畫面嘅箭嘴就行。",
  "source": {
   "label": "運輸署・道路使用者守則",
   "url": "https://www.td.gov.hk/tc/road_safety/road_users_code/index.html"
  },
  "art": "street-31",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "把鏡像方向與實際提示分清，不用含糊的左右上落口訣。",
  "textQuestion": "過路處地面寫LOOK RIGHT，按該字樣應先留意哪個方向？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "LOOK RIGHT字樣及指向原圖右方的箭嘴",
   "alt": "LOOK RIGHT字樣及指向原圖右方的箭嘴",
   "crop": {
    "x": 205,
    "y": 210,
    "width": 390,
    "height": 70
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原倒轉地面字樣後，提示你先留意哪邊？",
   "overview": {
    "x": 205,
    "y": 200,
    "width": 390,
    "height": 120
   }
  }
 },
 {
  "id": "s32",
  "sourceNumber": 32,
  "tier": 2,
  "category": "道路・過路安全",
  "question": "綠色人像開始閃動時，尚未開始過路的行人應怎辦？",
  "options": [
   "立即衝出馬路，趕在紅燈前跑完",
   "不要開始過路；已在路上的應繼續小心通過",
   "一律停在行車線中央不再移動",
   "只憑聲音快慢，完全不用看燈"
  ],
  "answer": 1,
  "explanation": "綠色人像閃動表示過路時段將結束，未開始過路者不應起步；已在路上者應小心繼續到安全位置。發聲裝置與燈號配合，不能把不同階段的聲音簡化成由慢突然轉快。",
  "hint": "未開始同已行到路中間，處理並唔相同。",
  "source": {
   "label": "運輸署・電子行人過路發聲裝置",
   "url": "https://www.td.gov.hk/tc/transport_in_hong_kong/pedestrians/pedestrian_crossing_facilities/electronic_audible_traffic_signal/index_t.html"
  },
  "art": "street-32",
  "modes": [
   "text"
  ],
  "review": "修正原稿聲頻描述與鼓勵加速衝燈的風險，按官方過路規則出題。",
  "textOnly": true
 },
 {
  "id": "s33",
  "sourceNumber": 33,
  "tier": 2,
  "category": "街道・城市設計",
  "question": "認出底座有鎖的這種柱，哪個用法合理？",
  "options": [
   "任何司機均可自行拆柱進入",
   "商戶可隨時拆除以擴大攤位",
   "由獲授權人員按需要開放受控通道",
   "固定鎖孔只供清洗時排水"
  ],
  "answer": 2,
  "explanation": "可拆式柱讓管理方按緊急、維修或獲准進出安排控制通道。不是任何人都可自行開鎖，亦不能保證每條行人街都使用同款柱或同一把鎖。",
  "hint": "有鎖代表受控制，唔係叫大家隨意拔走。",
  "source": {
   "label": "運輸署・道路使用者守則",
   "url": "https://www.td.gov.hk/tc/road_safety/road_users_code/index.html"
  },
  "art": "street-33",
  "modes": [
   "partial",
   "original"
  ],
  "review": "保留受控通道彈性，不假設所有柱只為消防或可供商戶自行拆卸。",
  "textQuestion": "有鎖的可拆卸防撞柱，與固定柱相比提供哪種管理彈性？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "圓形鐵柱底座的鎖孔與可分離接縫",
   "alt": "圓形鐵柱底座的鎖孔與可分離接縫",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s34",
  "sourceNumber": 34,
  "tier": 2,
  "category": "建築・香港家居",
  "question": "部分住宅外鐵閘配內門，談通風時亦應留意哪項安全？",
  "options": [
   "鐵閘可代替所有防火門和逃生要求",
   "裝兩道門就永遠不用檢查門鎖",
   "任何樓宇都可隨意改動走火通道",
   "防火門不應因通風而長期被楔開"
  ],
  "answer": 3,
  "explanation": "部分家庭以鐵閘配內門兼顧通風及訪客交流，但不可推論每戶依法必須有雙門。防火門、走火通道和外開門位置仍須按樓宇規定處理，通風不能取代防火要求。",
  "hint": "通風方便之外，諗埋走火同防煙。",
  "source": {
   "label": "屋宇署・樓宇保養及維修",
   "url": "https://www.bd.gov.hk/tc/safety-inspection/"
  },
  "art": "street-34",
  "modes": [
   "text"
  ],
  "review": "不鼓勵把防火門長開；不把雙門稱為全港法定標配。",
  "textOnly": true
 },
 {
  "id": "s35",
  "sourceNumber": 35,
  "tier": 2,
  "category": "街道・招牌文化",
  "question": "圖中支架生鏽的懸臂招牌，最需關注甚麼？",
  "options": [
   "結構及墮物對公眾的安全風險",
   "霓虹氣體是否在全球一律禁用",
   "是否用了所有舊招牌相同字體",
   "是否一律干擾機場導航系統"
  ],
  "answer": 0,
  "explanation": "招牌受建築規管及安全維護要求約束。部分符合條件的舊小型違例招牌可按檢核計劃處理，不是所有霓虹招牌都須因某一同時發生的政策一律清拆。",
  "hint": "先睇掛住個招牌嘅支架，唔係只睇霓虹顏色。",
  "source": {
   "label": "屋宇署・招牌監管制度",
   "url": "https://www.bd.gov.hk/tc/building-works/signboards/signboard-control-system/index.html"
  },
  "art": "street-35",
  "modes": [
   "original"
  ],
  "review": "採屋宇署現行招牌監管說明，避免捏造單一政策觸發事件。",
  "textQuestion": "香港招牌安全檢核或清拆，最直接保障甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "懸臂招牌的生鏽螺栓與鬆脫支架",
   "alt": "懸臂招牌的生鏽螺栓與鬆脫支架",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s36",
  "sourceNumber": 36,
  "tier": 3,
  "category": "文化・城市聲音",
  "question": "曾為港鐵錄製經典英語廣播的Cheri Chan，中文名是甚麼？",
  "options": [
   "鄭子誠",
   "陳如茵",
   "李慧玲",
   "林欣"
  ],
  "answer": 1,
  "explanation": "教育工作者陳如茵曾為港鐵等錄製廣播。不同年代、路線及臨時廣播可能採其他聲音，不應把所有英語廣播都說成同一人，也沒有依據稱她當時是港鐵職員。",
  "hint": "佢亦從事英語教育，唔係網片中模仿廣播嘅人。",
  "source": {
   "label": "香港01・港鐵廣播聲音與陳如茵的訪問",
   "url": "https://www.hk01.com/即時娛樂/467770/"
  },
  "art": "street-36",
  "modes": [
   "text"
  ],
  "review": "修正「前港鐵職員」身份；不聲稱所有現有英語廣播均同一人錄製。",
  "textOnly": true
 },
 {
  "id": "s37",
  "sourceNumber": 37,
  "tier": 2,
  "category": "交通・車廂科技",
  "question": "巴士樓梯客流感應器估算上層餘位，應怎樣理解顯示數字？",
  "options": [
   "等同每張椅子都必有重量感應器",
   "數字保證百分百準確且永不延遲",
   "是輔助估算，仍須留意現場座位及安全",
   "數字為零也可坐在上層樓梯"
  ],
  "answer": 2,
  "explanation": "部分車型利用樓梯客流或其他感應方式估算上層餘位，不同系統及車型可能有差異。顯示可有誤差或延遲，不能憑數字推斷所有座位裝置或在樓梯停留。",
  "hint": "感應器係輔助，不係保證你一定有張凳。",
  "source": {
   "label": "九巴・乘客服務",
   "url": "https://www.kmb.hk/"
  },
  "art": "street-37",
  "modes": [
   "text"
  ],
  "review": "移除所有新車一律同款感應器及精準無誤的承諾。",
  "textOnly": true
 },
 {
  "id": "s38",
  "sourceNumber": 38,
  "tier": 2,
  "category": "交通・城市老朋友",
  "question": "留意圖中車頂接觸位置，這情況俗稱甚麼？",
  "options": [
   "失壓",
   "轉轍",
   "回廠",
   "甩辮"
  ],
  "answer": 3,
  "explanation": "電車以集電桿從架空線取電，脫離接觸線俗稱甩辮，須由職員安全處理。並非因每次轉彎必然發生，乘客不可觸碰電線或嘗試重放集電桿。",
  "hint": "長桿就好似一條搭上電線嘅辮。",
  "source": {
   "label": "香港電車・電車文化",
   "url": "https://www.hktramways.com/tc/"
  },
  "art": "street-38",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "保留甩辮術語，不鼓勵乘客模仿操作。",
  "textQuestion": "電車集電桿脫離架空接觸線，俗稱甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "車頂斜向集電桿與架空電線之間有明顯空隙",
   "alt": "車頂斜向集電桿與架空電線之間有明顯空隙",
   "crop": {
    "x": 350,
    "y": 85,
    "width": 250,
    "height": 145
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s39",
  "sourceNumber": 39,
  "tier": 2,
  "category": "交通・乘車安全",
  "question": "年滿15歲的小巴乘客坐在有安全帶的座位，佩戴責任如何？",
  "options": [
   "乘客有責任正確佩戴可用的安全帶",
   "只需車長提醒後才有佩戴責任",
   "只有前排乘客需要佩戴",
   "車速低便可自行解除安全帶"
  ],
  "answer": 0,
  "explanation": "公共小巴乘客須按規定使用已安裝的安全帶；年滿15歲者須為自身佩戴負責。兒童安排、豁免及損壞情況另有規定，不宜用「任何乘客全責」概括。發現損壞應通知司機並在安全可行情況下改坐。",
  "hint": "題目特別講明年滿15歲、有可用安全帶。",
  "source": {
   "label": "運輸署・公共小巴後座安全帶問與答",
   "url": "https://www.td.gov.hk/filemanager/en/content_4949/plbnet08.pdf"
  },
  "art": "street-39",
  "modes": [
   "text"
  ],
  "review": "限定年齡及可用安全帶，不列易變罰款或把所有兒童情境一概歸責。",
  "textOnly": true
 },
 {
  "id": "s40",
  "sourceNumber": 40,
  "tier": 2,
  "category": "交通・尺寸考眼力",
  "question": "讀圖中三個尺寸，長闊高總和是多少？",
  "options": [
   "140厘米",
   "150厘米",
   "110厘米",
   "90厘米"
  ],
  "answer": 1,
  "explanation": "60＋50＋40＝150厘米。按運輸署指引，放在的士乘客車廂而長闊高總和超過140厘米的行李涉及附加費；另有行李位置及豁免安排，輪椅、拐杖等按官方規定處理。",
  "hint": "三邊都要加，唔係只加正面兩條邊。",
  "source": {
   "label": "運輸署・的士收費表",
   "url": "https://www.td.gov.hk/tc/transport_in_hong_kong/public_transport/taxi/taxi_fare_of_hong_kong/index.html"
  },
  "art": "street-40",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "改為可驗算的三邊觀察題；保留140厘米指引，不固定所有車種行李費。",
  "textQuestion": "行李三邊為60、50、40厘米，長闊高總和是多少？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "旅行喼旁三個尺寸數字60、50、40厘米",
   "alt": "旅行喼旁三個尺寸數字60、50、40厘米",
   "crop": {
    "x": 210,
    "y": 165,
    "width": 380,
    "height": 130
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原倒轉尺寸數字，再算長闊高總和是多少？",
   "overview": {
    "x": 210,
    "y": 80,
    "width": 380,
    "height": 240
   }
  }
 },
 {
  "id": "s41",
  "sourceNumber": 41,
  "tier": 2,
  "category": "飲食・街頭工藝",
  "question": "圖中上下合起再反轉的模具，主要令蛋漿怎樣？",
  "options": [
   "讓模具內的蛋白蛋黃分離",
   "把未熟蛋漿全部甩出模外",
   "流向另一半模面，較均勻分布",
   "把所有氣泡只集中在一面"
  ],
  "answer": 2,
  "explanation": "翻模有助尚未凝固的蛋漿分布到兩面凹槽，配合火候形成雞蛋仔形狀。配方、模具與操作時間不一，不能說不在固定秒數反轉就必然失敗或保證每顆完全中空。",
  "hint": "先睇模入面係平面，定一個個半球凹槽。",
  "source": {
   "label": "香港旅遊發展局・香港飲食文化",
   "url": "https://www.discoverhongkong.com/tc/explore/dining.html"
  },
  "art": "street-41",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "移除固定秒數、一定中空及不用翻便一定半圓的絕對說法。",
  "textQuestion": "雞蛋仔合模後轉動烤模，主要幫助蛋漿怎樣分布？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "連成片的半球凹槽與合模翻轉弧線",
   "alt": "連成片的半球凹槽與合模翻轉弧線",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s42",
  "sourceNumber": 42,
  "tier": 2,
  "category": "飲食・點心工藝",
  "question": "圖中半透明點心邊緣的褶紋，主要兼顧甚麼？",
  "options": [
   "以每褶數字決定蒸煮分鐘",
   "以褶紋取代加熱和保鮮",
   "符合全港統一十三褶法例",
   "收口包餡及塑造外形"
  ],
  "answer": 3,
  "explanation": "蝦餃捏褶是收口及塑形工藝，褶數會隨師傅、大小和風格而異。沒有一個法定的十二或十三褶標準，食物安全亦不能單靠褶數保證。",
  "hint": "睇褶位點樣把薄皮收埋。",
  "source": {
   "label": "香港旅遊發展局・香港飲食文化",
   "url": "https://www.discoverhongkong.com/tc/explore/dining.html"
  },
  "art": "street-42",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "保留工藝觀察，刪除固定褶數為普遍標準及保證不爆餡的說法。",
  "textQuestion": "蝦餃澄麵皮上捏褶，通常同時兼顧哪兩件事？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "半透明彎月形外皮與邊緣的密褶",
   "alt": "半透明彎月形外皮與邊緣的密褶",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s43",
  "sourceNumber": 43,
  "tier": 1,
  "category": "飲食・標籤考眼力",
  "question": "讀清標籤，兩樽合共多少毫升？",
  "options": [
   "200毫升",
   "100毫升",
   "500毫升",
   "1,000毫升"
  ],
  "answer": 0,
  "explanation": "圖示每樽100毫升，兩樽合計200毫升。香港常見益力多產品有100毫升規格，但不同市場及產品可有不同包裝，不能捏造品牌只准迷你樽的唯一科學原因。",
  "hint": "先睇每樽嘅標示，再乘兩樽。",
  "source": {
   "label": "惠康・益力多100毫升產品標示",
   "url": "https://www.wellcome.com.hk/en/p/Yakult%20Lactic%20Drink%2010%20X%20100ML%20%28Random%20Packaging%29/i/113309134.html"
  },
  "art": "street-43",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "採產品容量可驗算資訊，刪除從不推出其他規格及糖分保證。",
  "textQuestion": "標籤寫100mL的一樽乳酸飲品，兩樽共有多少毫升？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "兩個小瓶，正面各印100mL",
   "alt": "兩個小瓶，正面各印100mL",
   "crop": {
    "x": 245,
    "y": 195,
    "width": 310,
    "height": 105
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原倒轉容量標籤，兩樽合共多少毫升？",
   "overview": {
    "x": 245,
    "y": 205,
    "width": 310,
    "height": 70
   }
  }
 },
 {
  "id": "s44",
  "sourceNumber": 44,
  "tier": 2,
  "category": "飲食・煮食觀察",
  "question": "圖中瓦煲底部的金黃薄層，還需要控制甚麼？",
  "options": [
   "只需煲身有鐵線便一定成功",
   "火力、時間和水分",
   "只需加入食用金粉",
   "只需把生米完全不加熱"
  ],
  "answer": 1,
  "explanation": "飯焦形成與鍋底溫度、含水量及時間有關。瓦煲的熱性質與金屬鍋不同，但不能保證永不燒焦，亦不能聲稱金屬鍋無法做出飯焦。",
  "hint": "香脆同燒焦只差火候同水分，唔係認住個煲就得。",
  "source": {
   "label": "香港旅遊發展局・香港飲食文化",
   "url": "https://www.discoverhongkong.com/tc/explore/dining.html"
  },
  "art": "street-44",
  "modes": [
   "partial",
   "original"
  ],
  "review": "保留煲仔飯題材，不宣稱粗陶必然均勻或不會瞬間焦苦。",
  "textQuestion": "煲仔飯瓦煲有蓄熱特性，飯焦是否只需換上瓦煲就保證成功？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "瓦煲剖面底部金黃色飯焦薄層",
   "alt": "瓦煲剖面底部金黃色飯焦薄層",
   "crop": {
    "x": 260,
    "y": 265,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s45",
  "sourceNumber": 45,
  "tier": 1,
  "category": "飲食・茶記文化",
  "question": "圖中兩壺倒進同一杯，調成甚麼組合？",
  "options": [
   "檸檬茶與橙汁",
   "可樂與豆漿",
   "奶茶與咖啡",
   "可可與椰汁"
  ],
  "answer": 2,
  "explanation": "港式鴛鴦結合奶茶與咖啡，配比因店舖和口味而異。歷史起源有不同流傳說法，不把碼頭工人或某個固定年代寫成唯一可證實的發明原因。",
  "hint": "一壺有茶味，一壺有咖啡味。",
  "source": {
   "label": "香港旅遊發展局・香港飲食文化",
   "url": "https://www.discoverhongkong.com/tc/explore/dining.html"
  },
  "art": "street-45",
  "modes": [
   "original"
  ],
  "review": "保留飲品組合，不聲稱固定黃金比例或唯一勞工起源。",
  "textQuestion": "茶餐廳飲品「鴛鴦」由哪兩種飲品混合？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "兩壺棕色深淺不同的飲品同時倒入杯中",
   "alt": "兩壺棕色深淺不同的飲品同時倒入杯中",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s46",
  "sourceNumber": 46,
  "tier": 2,
  "category": "道路・隱藏科技",
  "question": "這組封閉切線形狀，最可能藏着哪種設施？",
  "options": [
   "用來量度貨車總重的地磅",
   "讓柏油熱脹冷縮的伸縮縫",
   "供道路雨水流走的排水槽",
   "偵測車輛的感應線圈"
  ],
  "answer": 3,
  "explanation": "感應線圈可偵測車輛，供交通燈控制或相關交通系統使用。並非每個路口都以同一方式即時調節綠燈，部分系統另用影像、雷達等感測。",
  "hint": "睇下切線係咪圍成封閉圈，而唔係一路延伸嘅伸縮縫。",
  "source": {
   "label": "機電工程署・交通燈與感應線圈",
   "url": "https://www.emsd.gov.hk/minisites/voice/tc/issue20/cvoicelink_web01_6.html"
  },
  "art": "street-46",
  "modes": [
   "partial",
   "original"
  ],
  "review": "限定感應線圈功能，不把所有路口一概說成即時AI調燈。",
  "textQuestion": "停車線前路面埋設的感應線圈，通常偵測甚麼供交通控制使用？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "柏油路上成封閉長方形的黑色切線與引線",
   "alt": "柏油路上成封閉長方形的黑色切線與引線",
   "crop": {
    "x": 240,
    "y": 175,
    "width": 320,
    "height": 125
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s47",
  "sourceNumber": 47,
  "tier": 2,
  "category": "道路・視覺設計",
  "question": "圖中這圈淺色輪廓，主要有助甚麼？",
  "options": [
   "讓燈組與複雜背景更易分辨",
   "令三種燈色的電壓一樣",
   "顯示此處一定設有衝燈相機",
   "標記交通燈的維修年份"
  ],
  "answer": 0,
  "explanation": "背板及對比邊界有助交通信號從背景中顯現。實際背板規格及反光配置因設施而異，不要把白邊當成中央控制或固定降溫功能的代碼。",
  "hint": "唔好只睇燈色，試吓留意成組燈同背景嘅分界。",
  "source": {
   "label": "運輸署・道路使用者守則",
   "url": "https://www.td.gov.hk/tc/road_safety/road_users_code/index.html"
  },
  "art": "street-47",
  "modes": [
   "partial",
   "original"
  ],
  "review": "保留對比辨識用途，刪除全港所有燈箱一律相同的概括。",
  "textQuestion": "交通燈黑色背板外的白色邊框，主要有助甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "黑色燈組背板外的一圈白色輪廓",
   "alt": "黑色燈組背板外的一圈白色輪廓",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s48",
  "sourceNumber": 48,
  "tier": 2,
  "category": "道路・明暗適應",
  "question": "圖中洞口前這個結構，主要緩和甚麼變化？",
  "options": [
   "讓車輛適應突然改變的車道寬度",
   "由明亮環境進入較暗環境的變化",
   "替所有入隧道車輛自動減速",
   "把洞內廢氣完全擋回隧道"
  ],
  "answer": 1,
  "explanation": "隧道入口的照明與部分遮光設計有助明暗過渡及看清前方。不同隧道採用不同措施，不能說香港每條隧道都有相同百葉棚或保證不會出現視覺適應問題。",
  "hint": "太陽下同洞入面，光暗相差好大。",
  "source": {
   "label": "運輸署・道路使用者守則",
   "url": "https://www.td.gov.hk/tc/road_safety/road_users_code/index.html"
  },
  "art": "street-48",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "限定圖示遮光結構，不逐名聲稱所有隧道均有同款棚。",
  "textQuestion": "隧道入口設過渡遮光結構，通常有助駕駛者適應甚麼？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "隧道洞口前一排遮光條及由亮至暗的路面",
   "alt": "隧道洞口前一排遮光條及由亮至暗的路面",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s49",
  "sourceNumber": 49,
  "tier": 2,
  "category": "道路・應變物資",
  "question": "先辨認箱上字樣，這類物料可協助做甚麼？",
  "options": [
   "用來吸走路面積水的消毒粉",
   "替拋錨車輛補充的備用油",
   "吸附路面油漬，減低滑溜風險",
   "供車輛自行補胎的橡膠粒"
  ],
  "answer": 2,
  "explanation": "砂等合適物料可協助吸附油污及控制滑溜風險，實際事故由相關人員處理。不能鼓勵途人進入車道，也不把砂箱描述成適用所有燃料火災的滅火工具。",
  "hint": "字樣指向一種顆粒狀物料，唔係油箱。",
  "source": {
   "label": "運輸署・道路使用者守則",
   "url": "https://www.td.gov.hk/tc/road_safety/road_users_code/index.html"
  },
  "art": "street-49",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "刪除市民可用砂撲油火的概括指導，限定道路事故專業處理。",
  "textQuestion": "路旁標示SAND的砂箱，在漏油事故時可供合適人員作甚麼用途？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "箱面SAND字樣與蓋邊少量細顆粒",
   "alt": "箱面SAND字樣與蓋邊少量細顆粒",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原箱上倒轉字樣，這類物料可協助做甚麼？",
   "overview": {
    "x": 250,
    "y": 205,
    "width": 300,
    "height": 100
   }
  }
 },
 {
  "id": "s50",
  "sourceNumber": 50,
  "tier": 2,
  "category": "道路・觸覺提示",
  "question": "認出路邊這組凸紋，主要有甚麼作用？",
  "options": [
   "以條紋直接指示綠燈剩餘秒數",
   "保證所有輪胎在雨天不打滑",
   "用圓點數目表示路口編號",
   "透過觸感提示接近車路邊界"
  ],
  "answer": 3,
  "explanation": "下斜路緣附近的觸覺警示帶協助辨識邊界。凸點與長條紋各有作用，須按現場配置理解；顏色不一定全為黃色，亦不能用觸覺磚代替交通燈指示。",
  "hint": "比較圓點同一路延伸嘅長條紋。",
  "source": {
   "label": "建築署・觸覺警示帶",
   "url": "https://www.archsd.gov.hk/archsd/html/ua2-chinese/sc-pdf/ASD_UA2_4.6.pdf"
  },
  "art": "street-50",
  "modes": [
   "partial",
   "original"
  ],
  "review": "保留邊界提示，移除所有路口必定同一顏色及配置的說法。",
  "textQuestion": "下斜路緣邊的凸點警示帶，主要向視障人士提供甚麼資訊？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "下斜路緣前一排整齊凸點，旁邊另有長條紋",
   "alt": "下斜路緣前一排整齊凸點，旁邊另有長條紋",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s51",
  "sourceNumber": 51,
  "tier": 2,
  "category": "建築・天氣應變",
  "question": "圖中入口高起並裝板，主要想減少甚麼？",
  "options": [
   "街道積水流入地底車站",
   "列車在站內自動改變軌距",
   "空調把車站吹離地面",
   "乘客手機的訊號外洩"
  ],
  "answer": 0,
  "explanation": "港鐵資料提及大部分出入口高於街面，並配合防洪板、防水門等措施。仍有無障礙通道及不同場地設計，不能稱所有入口都有樓梯、必高於歷史最高水位或絕不水浸。",
  "hint": "街面啲水想流入地下，入口有咩阻擋？",
  "source": {
   "label": "港鐵・氣候變化與自然環境",
   "url": "https://www.mtr.com.hk/sustainability/ch/climate-and-nature.html"
  },
  "art": "street-51",
  "modes": [
   "original"
  ],
  "review": "修正所有入口必有梯級及高於歷史最高水位線的過度說法。",
  "textQuestion": "港鐵部分入口提高地台並可部署防洪板，主要降低甚麼風險？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "街面積水、抬高入口與橫向防洪板",
   "alt": "街面積水、抬高入口與橫向防洪板",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s52",
  "sourceNumber": 52,
  "tier": 2,
  "category": "交通・緊急裝備",
  "question": "這件車上應急工具，哪個使用方法正確？",
  "options": [
   "只要見到玻璃，平日也可試敲",
   "只在緊急時依指定車窗及現場指示使用",
   "不看指示，一律敲任何窗正中央",
   "玻璃一碎，便保證沒有割傷風險"
  ],
  "answer": 1,
  "explanation": "逃生錘須配合指定緊急出口及該車的使用指示。車窗材料、標示和工具不同，不能保證所有玻璃都敲四角即碎，或碎片完全沒有傷害風險。",
  "hint": "先搵配套指示，唔係見到錘就任意敲。",
  "source": {
   "label": "運輸署・道路使用者守則",
   "url": "https://www.td.gov.hk/tc/road_safety/road_users_code/index.html"
  },
  "art": "street-52",
  "modes": [
   "blurred",
   "partial",
   "original"
  ],
  "review": "移除所有車窗一律強化玻璃及碎片無銳角的保證。",
  "textQuestion": "巴士緊急逃生錘應如何使用？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "固定座內紅柄小錘與指定車窗標示",
   "alt": "固定座內紅柄小錘與指定車窗標示",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s53",
  "sourceNumber": 53,
  "tier": 2,
  "category": "街道・投寄考眼力",
  "question": "讀清兩個投信口，寄往東京應選哪一類？",
  "options": [
   "本港郵件",
   "只收包裹的窗口",
   "外地郵件",
   "只收現金的窗口"
  ],
  "answer": 2,
  "explanation": "東京屬外地目的地；按郵筒實際標示分類投寄有助初步分流。郵筒類型及投信口標示各異，沒有自動秤重拒收郵資不足郵件的普遍機制。",
  "hint": "唔好只睇畫面左邊右邊，要讀目的地分類。",
  "source": {
   "label": "香港郵政・郵筒與郵件投寄",
   "url": "https://www.hongkongpost.hk/tc/sending_mail/"
  },
  "art": "street-53",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "保留分類用途，不宣稱所有郵筒均雙口或有自動秤重功能。",
  "textQuestion": "雙投信口分本港與外地時，寄往東京的平郵信應選哪類投信口？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "兩個口分寫本港LOCAL與外地OVERSEAS",
   "alt": "兩個口分寫本港LOCAL與外地OVERSEAS",
   "crop": {
    "x": 205,
    "y": 200,
    "width": 390,
    "height": 90
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原投信口倒轉字樣，寄往東京應選哪一類？",
   "overview": {
    "x": 205,
    "y": 177,
    "width": 390,
    "height": 120
   }
  }
 },
 {
  "id": "s54",
  "sourceNumber": 54,
  "tier": 3,
  "category": "天氣・香港常識",
  "question": "黑色暴雨警告指廣泛地區已錄得或預料有雨勢持續，每小時雨量超過多少？",
  "options": [
   "30毫米",
   "50毫米",
   "100毫米",
   "70毫米"
  ],
  "answer": 3,
  "explanation": "天文台黑色暴雨警告表示廣泛地區已錄得或預料會有每小時超過70毫米的豪雨，而且雨勢可能持續。黃、紅門檻分別為30及50毫米；局部一個站的數字不一定等於全港警告。",
  "hint": "黑雨比紅雨嘅50毫米門檻再高一級。",
  "source": {
   "label": "天文台・暴雨警告系統",
   "url": "https://www.hko.gov.hk/tc/publica/gen_pub/rain.htm"
  },
  "art": "street-54",
  "modes": [
   "text"
  ],
  "review": "保留官方門檻及廣泛地區、預料和持續條件，不把單站數字等同發警告。",
  "textOnly": true
 },
 {
  "id": "s55",
  "sourceNumber": 55,
  "tier": 2,
  "category": "生活・公共服務",
  "question": "公立醫院急症室分流第一類「危殆」病人的目標診治安排是甚麼？",
  "options": [
   "毋須等候，即時診治",
   "先到先得，按登記時間排隊",
   "所有病人一律等候15分鐘",
   "等齊五類病人才統一診治"
  ],
  "answer": 0,
  "explanation": "急症室按病情分流，危殆類別毋須等候，會即時獲得治理。這是分流服務安排，並非病人自行揀類別，也不能用遊戲題目判斷真實病情。",
  "hint": "危殆係最急嗰級，唔係普通先到先得。",
  "source": {
   "label": "醫院管理局・急症室服務及分流",
   "url": "https://www.ha.org.hk/visitor/ha_serviceguide_details.asp?Content_ID=10051&Lang=CHIB5"
  },
  "art": "street-55",
  "modes": [
   "text"
  ],
  "review": "按醫管局服務資料；不用虛構最低分鐘數及自行診斷暗示。",
  "textOnly": true
 },
 {
  "id": "s56",
  "sourceNumber": 56,
  "tier": 2,
  "category": "飲食・茶記點餐",
  "question": "按圖中餐牌，換指定品牌麵應怎樣付款？",
  "options": [
   "因為全港法例規定統一加4元",
   "依標示加4元，先確認有無其他條件",
   "因為所有品牌麵都要另付授權費",
   "因為所有廚師依法必須逐包煮"
  ],
  "answer": 1,
  "explanation": "品牌麵加價屬店舖餐牌及成本定價安排。品牌、包裝、份量和經營成本各異，沒有全港固定加價，也不能捏造品牌授權費或必須逐包連味粉單獨烹煮的規定。",
  "hint": "睇清餐牌寫嘅金額，唔好把店規當成全港法例。",
  "source": {
   "label": "消費者委員會・消費資訊",
   "url": "https://www.consumer.org.hk/tc"
  },
  "art": "street-56",
  "modes": [
   "mirrored",
   "original"
  ],
  "review": "移除逐包單獨烹煮及品牌授權費的無依據因果，改成實用讀餐牌。",
  "textQuestion": "茶記餐牌寫「轉指定品牌麵加4元」，應如何理解？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "餐牌一行轉指定品牌麵＋$4",
   "alt": "餐牌一行轉指定品牌麵＋$4",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal",
   "mirroredPrompt": "還原餐牌倒轉字樣，換指定品牌麵應怎樣付款？",
   "overview": {
    "x": 230,
    "y": 190,
    "width": 340,
    "height": 130
   }
  }
 },
 {
  "id": "s57",
  "sourceNumber": 57,
  "tier": 2,
  "category": "生活・食水常識",
  "question": "香港食水處理加入適量氟化物，主要目的為何？",
  "options": [
   "取代所有食水消毒程序",
   "使所有礦物質完全消失",
   "協助預防蛀牙",
   "保證任何人永遠不會蛀牙"
  ],
  "answer": 2,
  "explanation": "香港自1961年起依衞生建議在食水加入氟化物，目的是保護牙齒、預防蛀牙。它不同於消毒用氯，亦不能取代刷牙、飲食管理或牙科照護。",
  "hint": "氟化物同牙齒有關，唔好同消毒用嘅氯混淆。",
  "source": {
   "label": "水務署・食水處理",
   "url": "https://www.wsd.gov.hk/tc/core-businesses/operation-and-maintenance-of-waterworks/water-treatment/index.html"
  },
  "art": "street-57",
  "modes": [
   "text"
  ],
  "review": "保留1961年及預防目的，不重複未核實研究百分比或保證個人效果。",
  "textOnly": true
 },
 {
  "id": "s58",
  "sourceNumber": 58,
  "tier": 2,
  "category": "街市・色彩觀察",
  "question": "觀察帶子與葉片的配色，哪個判斷合理？",
  "options": [
   "紅帶是已通過農藥檢測的標記",
   "紅色保證葉片在常溫不會腐壞",
   "綁帶顏色可判斷蔬菜的產地",
   "對比明顯，但不能證明蔬菜較新鮮"
  ],
  "answer": 3,
  "explanation": "紅與綠並置形成鮮明色彩對比，但新鮮度須看食材狀況及儲存等資訊。不能因此斷言所有檔販都基於同一心理學動機選紅帶，也不能把顏色當安全認證。",
  "hint": "顏色可以襯托，唔等於品質證書。",
  "source": {
   "label": "食物安全中心・食物安全資訊",
   "url": "https://www.cfs.gov.hk/tc_chi/"
  },
  "art": "street-58",
  "modes": [
   "partial",
   "original"
  ],
  "review": "把主觀效果與檔販歷史動機分開，不以配色推定安全或新鮮。",
  "textQuestion": "紅帶綁綠葉蔬菜時，紅綠配色最直接有何視覺效果？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "綠葉中間一道紅色綑帶",
   "alt": "綠葉中間一道紅色綑帶",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s59",
  "sourceNumber": 59,
  "tier": 2,
  "category": "飲食・唐餅文化",
  "question": "看切面中的細薑片，主要增添哪種風味？",
  "options": [
   "辛香與微酸的層次",
   "濃郁的咖啡焦香",
   "純粹的鹹辣椒味",
   "明顯的薄荷清涼感"
  ],
  "answer": 0,
  "explanation": "部分餅家的皮蛋酥會加入子薑，與皮蛋、蓮蓉形成風味對比；配方因店舖而異。不能說酸薑必然化學中和所有氨味，或所有皮蛋酥完全沒有蛋味。",
  "hint": "薑片嘅風味，唔同蓮蓉嘅甜味。",
  "source": {
   "label": "奇華餅家・傳統唐餅",
   "url": "https://keewah.com/hk/"
  },
  "art": "street-59",
  "modes": [
   "partial",
   "original"
  ],
  "review": "保留常見配料但不統一所有品牌配方；刪除完全去氨味的化學保證。",
  "textQuestion": "部分皮蛋酥在蓮蓉與皮蛋之外加入子薑，主要增添哪種風味？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "酥皮剖面的深色皮蛋、蓮蓉與淡粉色薑片",
   "alt": "酥皮剖面的深色皮蛋、蓮蓉與淡粉色薑片",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 },
 {
  "id": "s60",
  "sourceNumber": 60,
  "tier": 2,
  "category": "生活・置業讀圖",
  "question": "看圖中戶門界線，哪個空間不應攤入單位實用面積？",
  "options": [
   "單位內睡房的樓面",
   "門外公用升降機大堂",
   "單位內客廳的樓面",
   "單位內廚房的樓面"
  ],
  "answer": 1,
  "explanation": "一手住宅銷售規管要求以實用面積表達單位面積及單價，以利比較。公用升降機大堂等不應攤分計入單位實用面積；牆、露台等如何計算另有法定定義，不等於只量可行走的淨地面。",
  "hint": "先搵單位大門，分清私人單位同門外公用地方。",
  "source": {
   "label": "政府新聞公報・採用實用面積表達住宅面積及售價",
   "url": "https://www.info.gov.hk/gia/general/201405/21/P201405210482.htm"
  },
  "art": "street-60",
  "modes": [
   "original"
  ],
  "review": "限定一手住宅銷售；不把實用面積簡化為所有建築物買賣或純室內淨面積。",
  "textQuestion": "一手住宅價單以實用面積表達面積和呎價，圖中哪個範圍不應攤分計入？",
  "focus": {
   "x": 50,
   "y": 50
  },
  "observation": {
   "clue": "單位邊界、戶門及門外公用升降機大堂",
   "alt": "單位邊界、戶門及門外公用升降機大堂",
   "crop": {
    "x": 260,
    "y": 195,
    "width": 280,
    "height": 110
   },
   "mirrorAxis": "horizontal"
  }
 }
];
export const STREET_OBSERVATION_QUESTIONS=Object.freeze(records.map(q=>Object.freeze({...q,options:Object.freeze(q.options),modes:Object.freeze(SPOTLIGHT_IDS.includes(q.id)?[...q.modes,'spotlight']:q.modes),source:Object.freeze(q.source),...(q.observation?{focus:Object.freeze(q.focus),observation:Object.freeze({...q.observation,crop:Object.freeze(q.observation.crop)})}:{})})));
