import {salaryReference} from './economy.js';
// Local career catalogue; salaries are HKD reference proxies with source metadata.
export const SKILLS = {
  craft: '實作', tech: '科技', care: '照護', art: '創意', people: '人際', analysis: '分析',
};

const catalogue = [
  ['food', '餐飲料理', 'Food & hospitality', 'craft', 36000, '🍳', '備料、試味並完成今日餐點',
    '星級主廚|西餐廚師|中餐廚師|日式料理師傅|義式料理師傅|泰式料理師傅|素食主廚|甜點師|麵包師|拉麵師傅|壽司師傅|調酒師|咖啡師|侍酒師|團膳廚師|食品雕刻師|外燴廚師|巧克力師'],
  ['trades', '工藝修繕', 'Skilled trades', 'craft', 41000, '🔧', '檢查工具、丈量現場並完成修繕',
    '水電工|木工|泥作師傅|油漆師傅|焊接技師|冷凍空調技師|電梯維修員|汽車維修技師|機車維修技師|自行車維修師|鎖匠|玻璃安裝師|磁磚鋪設師|防水工程師傅|屋頂修繕師|招牌製作師|家具修復師|鐘錶維修師'],
  ['software', '軟體科技', 'Software', 'tech', 65000, '💻', '釐清需求、編寫程式並測試版本',
    '前端工程師|後端工程師|全端工程師|行動應用工程師|遊戲程式設計師|軟體測試工程師|網站可靠性工程師|雲端工程師|資安工程師|資料工程師|機器學習工程師|區塊鏈工程師|嵌入式軟體工程師|資料庫管理師|系統分析師|DevOps工程師|無障礙軟體工程師|開源維護工程師'],
  ['hardware', '硬體製造', 'Hardware & manufacturing', 'tech', 55000, '⚙️', '校正設備、檢驗規格並追查異常',
    '半導體製程工程師|晶片設計工程師|電子工程師|電機工程師|機械工程師|機器人工程師|自動化工程師|光學工程師|通訊工程師|電池研發工程師|材料工程師|工業工程師|品質工程師|製造技術員|精密加工技師|模具設計師|積體電路佈局工程師|設備維護工程師'],
  ['health', '醫療專業', 'Healthcare', 'care', 72000, '🩺', '評估個案、記錄狀況並安排照護',
    '家庭醫師|急診醫師|外科醫師|兒科醫師|精神科醫師|牙醫師|藥師|護理師|物理治療師|職能治療師|語言治療師|呼吸治療師|醫事檢驗師|醫事放射師|營養師|聽力師|驗光師|助產師'],
  ['support', '生活照護', 'Community care', 'care', 35000, '🤝', '傾聽需求、提供陪伴並記錄服務',
    '居家照顧服務員|托育人員|保母|社會工作師|心理師|長照個案管理師|安寧照護協調員|復健助理|特教助理員|就業服務員|手語翻譯員|早療教保員|家庭支持工作者|社區關懷據點員|失智照護員|身障生活支持員|兒童課後照顧員|醫務社工'],
  ['education', '教育學習', 'Education', 'people', 43000, '📚', '準備教材、帶領練習並回饋學習',
    '幼兒園教師|國小教師|國文教師|英文教師|數學教師|歷史教師|地理教師|物理教師|化學教師|生物教師|音樂教師|美術教師|體育教師|特殊教育教師|大學講師|成人教育講師|華語教師|職業訓練講師'],
  ['visual', '視覺設計', 'Visual design', 'art', 42000, '🎨', '蒐集靈感、繪製草稿並修改作品',
    '平面設計師|品牌設計師|字體設計師|插畫家|漫畫家|動畫師|角色設計師|遊戲美術設計師|介面設計師|使用者體驗設計師|網頁設計師|包裝設計師|書籍設計師|資訊圖像設計師|動態圖像設計師|刺青師|壁畫藝術家|概念美術師'],
  ['media', '影視傳播', 'Media', 'art', 40000, '🎬', '規劃題材、製作內容並校對成品',
    'YouTuber|實況主|Podcast主持人|紀錄片導演|電影導演|攝影師|攝影指導|剪輯師|錄音師|音效設計師|配音員|編劇|製片|新聞記者|新聞主播|廣播主持人|字幕翻譯師|燈光師'],
  ['performance', '表演音樂', 'Performance', 'art', 35000, '🎭', '暖身、排練節目並與團隊磨合',
    '舞台劇演員|影視演員|舞者|編舞家|歌手|作曲家|作詞人|音樂製作人|鋼琴家|小提琴家|爵士鼓手|吉他手|樂團指揮|街頭藝人|魔術師|脫口秀演員|偶戲師|舞台監督'],
  ['commerce', '商務營運', 'Business', 'people', 47000, '📋', '協調需求、追蹤進度並回覆合作夥伴',
    '業務代表|客戶成功經理|專案經理|產品經理|採購專員|人力資源專員|招募顧問|企業培訓師|公關專員|活動企劃|行銷企劃|社群經理|搜尋引擎優化專員|電商營運專員|品牌經理|商務開發經理|客服專員|會展專員'],
  ['finance', '財務法務', 'Finance & law', 'analysis', 58000, '⚖️', '核對資料、分析風險並撰寫報告',
    '會計師|記帳士|財務分析師|精算師|稽核員|稅務顧問|銀行行員|授信審查員|風險管理師|保險核保員|證券分析師|理財規劃師|法務專員|律師|專利師|法遵專員|不動產估價師|反洗錢分析師'],
  ['science', '科學研究', 'Science', 'analysis', 57000, '🔬', '閱讀文獻、進行實驗並整理數據',
    '物理研究員|化學研究員|生物研究員|天文研究員|地質學家|海洋研究員|氣象預報員|生態研究員|數學研究員|統計學家|考古學家|人類學家|社會研究員|經濟研究員|食品科學研究員|神經科學研究員|量子計算研究員|公共衛生研究員'],
  ['architecture', '建築空間', 'Built environment', 'craft', 51000, '🏗️', '勘查場地、繪製圖面並確認施工',
    '建築師|室內設計師|景觀設計師|都市計畫師|土木工程師|結構工程師|測量技師|工地主任|工程估算師|建築模型師|建築資訊模型工程師|消防設備師|照明設計師|聲學顧問|古蹟修復師|展場設計師|園藝景觀施工員|道路養護技術員'],
  ['transport', '交通物流', 'Transport & logistics', 'craft', 44000, '🚚', '檢查安全、安排路線並確認交付',
    '公車司機|計程車司機|貨車司機|聯結車司機|機車快遞員|外送員|列車駕駛|捷運站務員|航空機師|空服員|航空地勤|航管員|船長|輪機員|港口裝卸員|倉儲管理員|報關專員|物流調度員'],
  ['nature', '農漁環境', 'Land & environment', 'craft', 34000, '🌱', '觀察環境、照料生產並記錄收成',
    '稻農|蔬菜農|果農|茶農|花農|養蜂人|菇類栽培員|畜牧場管理員|養豬技術員|乳牛飼養員|家禽飼養員|水產養殖員|漁船船員|林務員|樹藝師|環境工程師|污水處理員|資源回收分類員'],
  ['animals', '動物服務', 'Animal services', 'care', 35000, '🐾', '觀察動物狀態、清潔環境並安排照顧',
    '獸醫師|獸醫助理|寵物美容師|訓犬師|寵物保姆|遛狗師|動物園保育員|野生動物救傷員|動物行為顧問|馬術教練|馬房管理員|水族飼育員|導盲犬訓練師|動物收容所管理員|寵物食品研發員|寵物攝影師|畜牧獸醫防疫員|寵物溝通師'],
  ['service', '門市旅遊', 'Retail & travel', 'people', 33000, '🛍️', '迎接客人、處理需求並整理現場',
    '門市店員|超商店長|書店店員|花藝師|美髮師|美容師|美甲師|芳療師|旅館櫃檯員|房務員|禮賓司|導遊|領隊|旅遊行程規劃師|婚禮顧問|殯葬禮儀師|房屋仲介|汽車銷售顧問'],
  ['public', '公共服務', 'Public service', 'people', 45000, '🏛️', '處理民眾需求、執行勤務並留下紀錄',
    '消防員|警察|救護技術員|海巡人員|災害防救專員|戶政事務員|圖書館員|檔案管理員|博物館策展人|文物保存員|公共政策研究員|地方創生專員|社區營造工作者|議員助理|外交事務人員|移民事務員|監所管理員|郵務士'],
  ['sport', '運動休閒', 'Sports & recreation', 'people', 37000, '🏃', '暖身訓練、指導動作並評估進步',
    '健身教練|瑜伽老師|皮拉提斯老師|游泳教練|潛水教練|衝浪教練|攀岩教練|登山嚮導|籃球教練|足球教練|棒球教練|網球教練|羽球教練|運動防護員|運動裁判|電競選手|電競教練|棋藝老師'],
  ['newventures', '新興與創業', 'New ventures', 'tech', 48000, '🚀', '驗證點子、測試產品並回應市場',
    '元宇宙建築師|AI詠唱師|雞排店老闆|無人機飛手|永續發展顧問'],
  ['ai', 'AI與智能應用', 'AI & intelligent applications', 'tech', 33000, '🤖', '界定任務、核對資料並驗證智能系統的輸出',
    'AI應用工程師|生成式AI工程師|AI代理工程師|大型語言模型工程師|RAG知識庫工程師|AI模型評測員|AI安全測試員|AI資料標註師|AI訓練資料策展員|AI治理專員|AI倫理研究員|AI產品經理|AI自動化顧問|AI對話設計師|合成資料工程師|AI算力營運工程師'],
  ['funeral', '殯儀與善終服務', 'Funeral & end-of-life services', 'care', 24724, '🕯️', '確認家屬意願、核對授權並尊重地完成告別服務',
    '殯儀統籌師|遺體修復師|遺體化妝師|入殮師|殯儀司儀|火化場技術員|骨灰安置顧問|寵物善終服務員'],
  ['forensics', '法醫與鑑證', 'Forensic science', 'analysis', 33000, '🔎', '核對個案授權、保全證據紀錄並審慎表達鑑證結論',
    '法醫|法醫毒理分析員|鑑證科學主任|數碼鑑證分析員|法醫人類學研究員|法醫昆蟲學研究員'],
  ['experience', '品評與體驗研究', 'Sensory & experience research', 'people', 16500, '📝', '依研究規範記錄觀察，分清個人感受與可驗證證據',
    '試吃員|神秘顧客|感官品評員|香氛評測員|寢具試睡員|遊戲在地化測試員|無障礙體驗測試員|主題樂園體驗評測員|旅宿品質稽核員|產品使用者研究員'],

];

export const CATEGORIES = catalogue.map(([id, zh, en, skill, salary, emoji, routine]) => ({
  id, zh, en, skill, salary:salaryReference(id,zh).salary, emoji, routine,
}));

export const JOBS = catalogue.flatMap(([category, , , skill, salary, emoji, routine, names]) =>
  names.split('|').map((name, index) => ({
    id: `${category}-${String(index + 1).padStart(2, '0')}`,
    name, en: '', category, skill,
    ...salaryReference(category,name),
    emoji, routine,
  })),
);

export const MAJORS = [
  { name: '量子力學', skill: 'analysis' },
  { name: '母豬產後護理', skill: 'care' },
  { name: '古代文學', skill: 'art' },
  { name: '資訊工程', skill: 'tech' },
  { name: '餐飲管理', skill: 'craft' },
  { name: '心理學', skill: 'care' },
  { name: '商業管理', skill: 'people' },
  { name: '視覺傳達設計', skill: 'art' },
  { name: '機械工程', skill: 'craft' },
  { name: '統計與資料科學', skill: 'analysis' },
  { name: '社會工作', skill: 'care' },
  { name: '傳播與媒體', skill: 'people' },
  { name: '環境科學', skill: 'analysis' },
  { name: '人工智慧應用', skill: 'tech' },
  { name: '舞台表演', skill: 'art' },
  { name: '運動休閒管理', skill: 'people' },
  { name: '建築與空間', skill: 'craft' },
  { name: '外語與跨文化溝通', skill: 'people' },
];

// Choices are deterministic, local game consequences; all amounts are fictional.
export const EVENT_DECK = [
  { id: 'blame', title: '鍋從天上來', scene: 'office', text: '共同專案出了錯，主管在會議上把責任全推給你。會議紀錄還在你的資料夾裡。', choices: [
    { label: '整理紀錄，私下釐清責任', effects: { stress: 5, reputation: 7, iq: 1 } },
    { label: '當場反駁，請大家看證據', effects: { stress: 10, reputation: 4, contacts: -2, eq: 1 } },
    { label: '先扛住，換取團隊的感謝', effects: { stress: 12, contacts: 3, reputation: -3 } },
  ] },
  { id: 'promotion', title: '升職附贈責任', scene: 'office', text: '你獲得代理主管機會，津貼到手，但接下來幾週要替團隊協調加班。', choices: [
    { label: '接下職位，練習帶人', effects: { cash: 9000, stress: 13, eq: 2, reputation: 5 } },
    { label: '先談清楚人力與工時', effects: { cash: 4000, stress: 4, jq: 2, reputation: 2 } },
    { label: '婉拒，保留生活空間', effects: { stress: -8, health: 3, reputation: -2 } },
  ] },
  { id: 'crush', title: '茶水間的心動', scene: 'relationship', text: '同事約你週末喝咖啡。你也有好感，但你們下週還要一起提案。', choices: [
    { label: '赴約，先聊聊彼此的界線', effects: { cash: -500, contacts: 3, eq: 2, stress: -3 } },
    { label: '改約團體聚會，慢慢認識', effects: { cash: -300, contacts: 4, stress: -1 } },
    { label: '禮貌婉拒，保持工作關係', effects: { stress: -2, contacts: -1, reputation: 1 } },
  ] },
  { id: 'hallucination', title: 'AI信心滿滿地編造', scene: 'technology', text: '模擬AI助手交來漂亮報告，引用的研究卻查無此文。離交件只剩一個下午。', choices: [
    { label: '逐項查證，刪除無法證實的內容', effects: { stress: 7, iq: 3, reputation: 5 } },
    { label: '延期交付，重新找可靠資料', effects: { cash: -1500, stress: 3, reputation: 2, iq: 2 } },
    { label: '保留草稿，請同事共同審核', effects: { contacts: 2, stress: 4, eq: 1, reputation: 2 } },
  ] },
  { id: 'outage', title: '更新後全站白畫面', scene: 'technology', text: '新版本上線，畫面只剩一片白。同事在群組傳來一個冒煙的鍵盤貼圖。', choices: [
    { label: '回復舊版，再追查原因', effects: { cash: -1200, stress: 6, iq: 2, reputation: 4 } },
    { label: '和團隊通宵修復', effects: { stress: 14, health: -6, contacts: 2, reputation: 5 } },
  ] },
  { id: 'supplier', title: '原料坐地起價', scene: 'business', text: '固定供應商突然漲價。你的小生意仍有訂單，但利潤正在變薄。', choices: [
    { label: '吸收成本，維持品質', effects: { cash: -4500, reputation: 5, stress: 3 } },
    { label: '透明調價，說明原因', effects: { cash: 1500, reputation: -1, jq: 2, stress: 4 } },
    { label: '花時間試用新供應商', effects: { cash: -1800, stress: 7, iq: 1, contacts: 2 } },
  ] },
  { id: 'safety', title: '安全帽不是裝飾', scene: 'industry', text: '現場設備發出異音，趕工的夥伴卻想繼續作業。你可以要求停機檢查。', choices: [
    { label: '停機並通報，確認安全', effects: { cash: -2000, stress: 3, health: 3, reputation: 6 } },
    { label: '先撤離現場，找專業人員', effects: { cash: -1000, reputation: 3, contacts: -1, pq: 1 } },
  ] },
  { id: 'badreview', title: '一星評論上門', scene: 'business', text: '顧客留下尖銳負評，附圖顯示確實有一處疏失。留言區正等著你的回應。', choices: [
    { label: '承認問題，退款並改善流程', effects: { cash: -2200, reputation: 6, eq: 2, stress: 3 } },
    { label: '私訊道歉，提供重做服務', effects: { cash: -1200, reputation: 3, contacts: 1, stress: 5 } },
    { label: '先暫停接單，全面檢查', effects: { cash: -4000, stress: -2, reputation: 4, iq: 1 } },
  ] },
  { id: 'classgap', title: '聚餐的帳單', scene: 'relationship', text: '朋友選了一間超出你預算的餐廳。有人說「這一餐又沒多少」，你看了看錢包。', choices: [
    { label: '直接說預算，提議平價選項', effects: { eq: 2, stress: -2, contacts: 1 } },
    { label: '照樣參加，享受這次聚會', effects: { cash: -2800, contacts: 3, stress: 3 } },
    { label: '這次不去，改約朋友散步', effects: { cash: -100, contacts: 1, health: 2 } },
  ] },
  { id: 'hometown', title: '家鄉與大城市', scene: 'life', text: '家人希望你回鄉照應，城市裡的工作卻正有發展。你得安排新的生活節奏。', choices: [
    { label: '固定返鄉，暫時保留工作', effects: { cash: -3200, stress: 5, contacts: 3, eq: 1 } },
    { label: '試談遠端安排', effects: { cash: -1500, stress: 2, jq: 2, reputation: -1 } },
    { label: '資助在地照顧服務', effects: { cash: -5000, stress: -3, contacts: 2 } },
  ] },
  { id: 'startup', title: '雞排攤的第一天', scene: 'business', text: '朋友邀你試辦週末雞排攤。計畫表很熱血，成本表只有三行。', choices: [
    { label: '先做小量試賣，記錄所有成本', effects: { cash: -3000, jq: 3, iq: 1, stress: 4 } },
    { label: '出資擴大攤位，衝一波人潮', effects: { cash: -9000, contacts: 4, stress: 10, reputation: 3 } },
    { label: '幫忙宣傳，暫不投資', effects: { cash: -300, contacts: 2, eq: 1 } },
  ] },
  { id: 'viral', title: '突然變成迷因', scene: 'media', text: '你工作時認真的表情被剪成迷因，意外爆紅。品牌來訊息，老闆也來訊息。', choices: [
    { label: '接合適合作，先確認使用授權', effects: { cash: 6000, reputation: 4, stress: 7, jq: 2 } },
    { label: '用幽默回應，分享工作知識', effects: { contacts: 4, reputation: 5, stress: 4, eq: 1 } },
    { label: '要求移除涉及隱私的片段', effects: { stress: -5, contacts: -1, reputation: 1 } },
  ] },
  { id: 'mentor', title: '師傅的老筆記', scene: 'learning', text: '資深師傅願意教你一套實務技巧，條件是每週留下半天一起整理工具與筆記。', choices: [
    { label: '投入時間，跟著反覆練習', effects: { cash: -1200, stress: 4, pq: 3, contacts: 3, reputation: 2 } },
    { label: '先自學，再帶問題請教', effects: { cash: -500, iq: 2, pq: 1, stress: 2 } },
  ] },
  { id: 'burnout', title: '鬧鐘響了五次', scene: 'health', text: '你最近連休息都在想工作。今天醒來，身體和腦袋都像沒充到電。', choices: [
    { label: '請假休息，重新安排工作量', effects: { cash: -1800, health: 9, stress: -14 } },
    { label: '和主管談優先順序', effects: { stress: -8, eq: 2, reputation: 1, contacts: -1 } },
    { label: '照常上班，晚上提早睡', effects: { cash: 1000, health: -3, stress: 5 } },
  ] },
  { id: 'rent', title: '租約更新通知', scene: 'life', text: '房東調高租金。住處離公司很近，但你的每月結餘已經不多。', choices: [
    { label: '搬遠一點，花時間通勤', effects: { cash: 2000, stress: 5, health: -2 } },
    { label: '分租空間，與室友協調生活', effects: { cash: 1500, contacts: 2, eq: 1, stress: 3 } },
    { label: '先續租，換取穩定作息', effects: { cash: -3000, stress: -4, health: 2 } },
  ] },
  { id: 'credit', title: '簡報上少了你的名字', scene: 'office', text: '合作提案被稱讚，但發表者忘了提到你的貢獻。下週還有下一次會議。', choices: [
    { label: '私下溝通，補上貢獻紀錄', effects: { stress: 3, eq: 2, reputation: 4 } },
    { label: '下次主動報告自己的部分', effects: { stress: 6, reputation: 6, jq: 1 } },
    { label: '把成果整理成作品集', effects: { cash: -600, iq: 1, reputation: 3, stress: 2 } },
  ] },
  { id: 'gossip', title: '群組裡的小道消息', scene: 'office', text: '同事傳來另一位同事的私生活八卦，邀你一起評論。你們明天還要合作。', choices: [
    { label: '轉回工作話題', effects: { eq: 2, reputation: 3, contacts: -1 } },
    { label: '明確表示不轉傳私事', effects: { stress: 3, reputation: 5, contacts: -2 } },
    { label: '離開群組，直接約人對談', effects: { stress: -3, contacts: -1, eq: 1 } },
  ] },
  { id: 'inventory', title: '庫存多到能蓋城堡', scene: 'industry', text: '訂貨數字多打了一個零。貨還能用，但倉庫已經無法好好走路。', choices: [
    { label: '協商退貨，承擔運費', effects: { cash: -2400, stress: 4, reputation: 2, jq: 2 } },
    { label: '辦限量促銷，花時間清庫存', effects: { cash: -4000, contacts: 3, stress: 8, jq: 2 } },
    { label: '與同行交換需要的物料', effects: { cash: -1200, contacts: 4, stress: 5 } },
  ] },
  { id: 'automation', title: '新工具來了', scene: 'technology', text: '公司導入自動化工具。例行任務變少，主管卻開始期待大家處理更複雜的問題。', choices: [
    { label: '學會工具，也查核輸出', effects: { cash: -1600, iq: 3, reputation: 4, stress: 4 } },
    { label: '整理人類審核流程，帶同事上手', effects: { eq: 2, contacts: 3, reputation: 5, stress: 6 } },
    { label: '維持熟悉流程，暫緩轉型', effects: { stress: -3, reputation: -3, pq: 1 } },
  ] },
  { id: 'community', title: '鄰里的修理日', scene: 'community', text: '社區辦免費修繕活動，缺人幫忙。你可以出力，也可以把週末留給自己。', choices: [
    { label: '帶工具去幫忙', effects: { cash: -700, contacts: 5, reputation: 5, pq: 1, health: -1 } },
    { label: '捐物資，保留休息時間', effects: { cash: -1200, reputation: 3, stress: -3 } },
    { label: '這週先照顧自己的生活', effects: { stress: -5, health: 3, contacts: -1 } },
  ] },
  { id: 'market', title: '市場一片紅綠燈', scene: 'market', text: '模擬市場波動，群組每個人都像專家。你原先的虛擬資產配置讓你有點睡不好。', choices: [
    { label: '降低部位，接受模擬損失', effects: { cash: -2500, stress: -7, jq: 2 } },
    { label: '照原計畫持有，關掉推播', effects: { stress: -2, iq: 1, jq: 1 } },
    { label: '先補足生活預備金', effects: { cash: -1000, stress: -5, jq: 3 } },
  ] },
  { id: 'virtualgame', title: '虛擬牌桌的邀請', scene: 'leisure', text: '朋友邀你玩遊戲內的虛擬籌碼牌局。今晚只玩固定額度，輸贏都不影響現實金錢。', choices: [
    { label: '花小額遊戲幣參加聚會', effects: { cash: -500, contacts: 3, stress: -3 } },
    { label: '只旁觀，幫大家準備點心', effects: { cash: -150, contacts: 2, eq: 1, stress: -2 } },
    { label: '改約免費的桌遊之夜', effects: { contacts: 1, stress: -4, jq: 1 } },
  ] },
  { id: 'access', title: '有人進不了門', scene: 'community', text: '活動場地只有樓梯，一位使用輪椅的參加者在門口等待。你手上還有很多待辦。', choices: [
    { label: '立即改到可進出的場地', effects: { cash: -2500, stress: 5, reputation: 7, eq: 2 } },
    { label: '與對方討論可行安排並補足設備', effects: { cash: -1600, contacts: 3, reputation: 4, stress: 4 } },
  ] },
  { id: 'reunion', title: '同學會的成績單', scene: 'life', text: '同學們聊薪水、房子和職稱。你也有自己的進步，只是它們不全寫在薪資單上。', choices: [
    { label: '分享自己的小成就，也聽大家說', effects: { eq: 3, contacts: 3, stress: -3 } },
    { label: '請教有興趣的轉職經驗', effects: { cash: -500, iq: 2, contacts: 4, stress: 2 } },
    { label: '提早離席，做自己喜歡的事', effects: { cash: -200, health: 2, stress: -6, contacts: -1 } },
  ] },
];

EVENT_DECK.push(
 {id:'layoff',title:'部門重組，名單沒有先打招呼',scene:'office',text:'公司要縮編。有人只看職稱，你決定拿出能解決問題的證據。',choices:[{label:'動用人脈與實績，爭取內部調職',effects:{contacts:-5,reputation:8,stress:12,jq:3}},{label:'收下遣散支持，回學徒期重整技能',effects:{cash:12000,stress:8,jq:5}}]},
 {id:'opportunity',title:'轉角有一張沒貼出去的徵才紙',scene:'opportunity',text:'你比別人早一步看見新的合作空缺。這次，要用甚麼換機會？',choices:[{label:'帶著作品提案，踏實接一個小案',effects:{cash:4000,reputation:8,stress:5,jq:1}},{label:'介紹給同行，留下下一次的緣分',effects:{contacts:5,eq:2,stress:-3}}]}
);
