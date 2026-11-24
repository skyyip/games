export const DRAW_COST=100;
export const DUPLICATE_REFUND=25;
export const RARITIES=[
 {id:'N',name:'普卡',rate:57},
 {id:'R',name:'稀有卡',rate:30},
 {id:'SR',name:'超稀有',rate:10},
 {id:'SSR',name:'神級閃卡',rate:3}
];
export const CARDS=[
 {id:'w_1',name:'傲嬌雙馬尾',art:0,rarity:'R',desc:'口頭禪是「我才沒有生氣呢！」'},
 {id:'w_2',name:'名偵探女友',art:1,rarity:'SR',desc:'憑藉一根頭髮就能還原完整案發現場',skill:'微表情透視：刪除 2 個錯誤選項（技能尚未啟用）'},
 {id:'w_3',name:'白月光天使',art:2,rarity:'SSR',desc:'傳說中永遠講道理、不翻舊帳的夢幻生物',skill:'免死金牌：抵銷一次一擊必殺（技能尚未啟用）'},
 {id:'m_1',name:'鋼鐵直男',art:3,rarity:'R',desc:'大腦裡只有一個齒輪在轉的純真生物'},
 {id:'m_2',name:'電競肝帝',art:4,rarity:'SR',desc:'發誓「再打最後一場就去睡覺」的男人'},
 {id:'m_3',name:'傳說霸總',art:5,rarity:'SSR',desc:'自帶黑卡與「女人妳成功引起我注意」氣場'},
 {id:'d_1',name:'短腿柯基',art:6,rarity:'R',desc:'底盤過低，每次上下樓梯都像在爬山'},
 {id:'d_2',name:'拆家哈士奇',art:7,rarity:'SR',desc:'西伯利亞裝修大隊長，專精沙發爆破',skill:'混亂邪惡：重排選項，通關賞金翻倍（技能尚未啟用）'},
 {id:'d_3',name:'倔強柴將軍',art:8,rarity:'SSR',desc:'散步一旦啟動煞車，八匹馬都拉不動'},
 {id:'c_1',name:'十橘九胖',art:9,rarity:'R',desc:'只要聽見開罐器聲響就能光速瞬移'},
 {id:'c_2',name:'虛空黑貓',art:10,rarity:'SR',desc:'完美融入陰影，只露出兩顆發光大眼'},
 {id:'c_3',name:'仙氣布偶皇',art:11,rarity:'SSR',desc:'顏值即正義，看你宛如看卑微兩腳獸',skill:'時間凍結：倒數計時凍結 6 秒（技能尚未啟用）'},
 {id:'w_4',name:'珍奶續命員',art:0,atlas:'new',rarity:'N',desc:'今日情緒穩定，全靠杯底最後一粒珍珠'},
 {id:'m_4',name:'電車瞓覺王',art:1,atlas:'new',rarity:'N',desc:'過站不是失誤，是延長午睡的策略'},
 {id:'d_4',name:'空碗控訴犬',art:2,atlas:'new',rarity:'N',desc:'碗空了三分鐘，已經準備召開記者會'},
 {id:'c_4',name:'紙箱業主',art:3,atlas:'new',rarity:'N',desc:'貓窩不用，免費紙箱卻要永久持有'},
 {id:'w_5',name:'餐牌選擇困難',art:4,atlas:'new',rarity:'N',desc:'睇咗十分鐘，最後都係「同你一樣」'},
 {id:'m_5',name:'樹枝見習勇者',art:5,atlas:'new',rarity:'N',desc:'裝備零成本，拯救世界全靠想像力'},
 {id:'d_5',name:'散步手掣犬',art:6,atlas:'new',rarity:'N',desc:'一坐低，整條街即時進入暫停畫面'},
 {id:'c_5',name:'鍵盤監工',art:7,atlas:'new',rarity:'N',desc:'每份文件必須先經過貓掌審批'},
 {id:'w_6',name:'雨天搬運隊長',art:8,atlas:'new',rarity:'R',desc:'左手兩袋、右手雨傘，隊友仲喺度問攰唔攰'},
 {id:'m_6',name:'開樽蓋英雄',art:9,atlas:'new',rarity:'R',desc:'拯救世界之前，先幫你開呢樽花生醬'},
 {id:'d_6',name:'拖鞋尋寶員',art:10,atlas:'new',rarity:'R',desc:'每次迎接你返屋企，都附送一隻失蹤拖鞋'},
 {id:'c_6',name:'水杯測試官',art:11,atlas:'new',rarity:'R',desc:'地心吸力一日未驗證，本喵一日唔收工'},
 {id:'w_7',name:'零食案情分析師',art:12,atlas:'new',rarity:'SR',desc:'用紅線連起所有線索，只為查出誰吃了最後一塊餅'},
 {id:'m_7',name:'鑊氣料理大師',art:13,atlas:'new',rarity:'SR',desc:'廚房只有三平方米，出餐氣勢卻有三百坪'},
 {id:'d_7',name:'星際柯基司令',art:14,atlas:'new',rarity:'SSR',desc:'征服宇宙的第一步，是確保太空糧準時供應'},
 {id:'c_7',name:'沙發宇宙皇帝',art:15,atlas:'new',rarity:'SSR',desc:'整個客廳都在版圖內，你只能租用沙發邊緣'},
 {id:'d_8',name:'博美保安隊長',art:0,atlas:'pets',rarity:'N',desc:'體積係迷你裝，門鐘警報卻係演唱會級'},
 {id:'d_9',name:'比格聞案專員',art:1,atlas:'pets',rarity:'N',desc:'跟住一隻襪的氣味，查出全家洗衣動線'},
 {id:'d_10',name:'金毛迎賓主任',art:2,atlas:'pets',rarity:'R',desc:'你只係落樓倒垃圾，佢已準備好重逢典禮'},
 {id:'d_11',name:'臘腸梳化長租客',art:3,atlas:'pets',rarity:'R',desc:'四隻腳都好短，租用梳化的面積卻好長'},
 {id:'d_12',name:'邊牧戰術教練',art:4,atlas:'pets',rarity:'SR',desc:'波已按顏色排好，正在等你交訓練功課'},
 {id:'d_13',name:'貴婦紙巾造型師',art:5,atlas:'pets',rarity:'SR',desc:'髮型一絲不亂，地板已完成紙巾雪景工程'},
 {id:'d_14',name:'薩摩耶雲端艦長',art:6,atlas:'pets',rarity:'SSR',desc:'微笑已連上雲端，掉毛量足夠再造三朵雲'},
 {id:'d_15',name:'斑點消防超人',art:7,atlas:'pets',rarity:'SSR',desc:'披風一揚，第一宗任務係救返梳化底個波'},
 {id:'c_8',name:'英短包裹驗收官',art:8,atlas:'pets',rarity:'N',desc:'快遞未拆，業權已經由貓屁股完成轉讓'},
 {id:'c_9',name:'暹羅深夜主唱',art:9,atlas:'pets',rarity:'N',desc:'凌晨三點開騷，全屋都係被邀請的觀眾'},
 {id:'c_10',name:'美短鍵盤總監',art:10,atlas:'pets',rarity:'R',desc:'你打完一千字，佢一掌幫你加咗六行句號'},
 {id:'c_11',name:'異短梳化抱枕',art:11,atlas:'pets',rarity:'R',desc:'睇落似抱枕，抱之前仍然要本人批准'},
 {id:'c_12',name:'緬因城堡領主',art:12,atlas:'pets',rarity:'SR',desc:'城堡可以係玩具，氣場必須按真皇宮計'},
 {id:'c_13',name:'孟加拉紙箱探險家',art:13,atlas:'pets',rarity:'SR',desc:'野外探險路線：紙箱入口到紙箱另一個入口'},
 {id:'c_14',name:'挪威森林守護者',art:14,atlas:'pets',rarity:'SSR',desc:'守護遠古森林，順便守住窗邊最佳曬太陽位'},
 {id:'c_15',name:'斯芬克斯太陽王',art:15,atlas:'pets',rarity:'SSR',desc:'頭冠可以發光，瞓覺仍然要霸住最暖張被'},
 {id:'w_8',name:'毛毯充電員',art:0,atlas:'life',rarity:'N',desc:'今日社交電量歸零，熱茶同毛毯正在搶修'},
 {id:'w_9',name:'雨夜掃街達人',art:1,atlas:'life',rarity:'R',desc:'落雨可以淋濕條街，唔可以淋濕我袋雞蛋仔'},
 {id:'w_10',name:'行程控場總監',art:2,atlas:'life',rarity:'SR',desc:'三個行事曆互相打交，佢仲有空幫你訂埋位'},
 {id:'w_11',name:'休息結界女王',art:3,atlas:'life',rarity:'SSR',desc:'鬧鐘都要先預約，先可以打擾本宮休息'},
 {id:'m_8',name:'最後薯條守衛',art:4,atlas:'life',rarity:'N',desc:'呢條唔係普通薯條，係本餐最後的尊嚴'},
 {id:'m_9',name:'傢俬組裝勇者',art:5,atlas:'life',rarity:'R',desc:'凳終於企得穩，多出嚟粒螺絲先核對清楚再慶功'},
 {id:'m_10',name:'公園大導演',art:6,atlas:'life',rarity:'SR',desc:'只係幫你影張相，個姿勢已經準備攞金像獎'},
 {id:'m_11',name:'星際補眠法師',art:7,atlas:'life',rarity:'SSR',desc:'宇宙可以繼續膨脹，佢堅持再瞓五分鐘'},
 {id:'d_16',name:'雪納瑞試味總編',art:8,atlas:'life',rarity:'N',desc:'碗未擺低，兩撇鬍鬚已經準備發表食評'},
 {id:'d_17',name:'西施沙龍紅星',art:9,atlas:'life',rarity:'R',desc:'髮型未完成，影相檔期已經排到下個禮拜'},
 {id:'d_18',name:'阿富汗秀髮巨星',art:10,atlas:'life',rarity:'SR',desc:'風扇只開一格，客廳已經變咗洗頭水廣告'},
 {id:'d_19',name:'聖伯納雪山救援王',art:11,atlas:'life',rarity:'SSR',desc:'穿過風雪去救援，放工仍然想你幫佢搓肚腩'},
 {id:'c_16',name:'俄藍廚房門神',art:12,atlas:'life',rarity:'N',desc:'門關咗三分鐘，已經準備向罐頭部提出申訴'},
 {id:'c_17',name:'阿比書架巡察員',art:13,atlas:'life',rarity:'R',desc:'站得高唔代表望得遠，但可以望清你偷食乜'},
 {id:'c_18',name:'德文星艦通訊官',art:14,atlas:'life',rarity:'SR',desc:'兩隻耳仔接收全宇宙訊號，唯獨聽唔到「落嚟」'},
 {id:'c_19',name:'安哥拉月宮館長',art:15,atlas:'life',rarity:'SSR',desc:'藏書三千卷，最鍾意瞓喺你而家要睇嗰頁'}
];
export function rollRarity(value){
 if(value<.57)return 'N';
 if(value<.87)return 'R';
 if(value<.97)return 'SR';
 return 'SSR';
}
export function purchaseDraw(state,random=Math.random){
 if(state.coins<DRAW_COST)return null;
 const rarity=rollRarity(random()),pool=CARDS.filter(card=>card.rarity===rarity);
 const card=pool[Math.floor(random()*pool.length)];
 const duplicate=state.cards.includes(card.id)||state.cards.includes(card.name);
 return {card,duplicate,save:{...state,coins:state.coins-DRAW_COST+(duplicate?DUPLICATE_REFUND:0),cards:duplicate?[...state.cards]:[...state.cards,card.id]}};
}
