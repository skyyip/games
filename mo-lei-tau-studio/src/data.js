export const TRAITS=[['loyalty','忠貞不渝'],['cunning','陰險奸詐'],['brotherhood','講義氣'],['humor','搞笑無厘頭'],['timid','膽小怕事'],['brave','勇字當頭'],['grit','堅持不懈'],['dream','有夢想追求'],['optimism','樂觀開朗'],['introversion','悲觀內向']];
export const MOVIES=[
 {id:'soccer',title:'少林足球',en:'Shaolin Soccer',tag:'熱血 × 夢想 × 波鞋',color:'#cfddd0',accent:'#47735f',symbol:'ball',budget:900,roles:['sing','iron','water','hands','leg','light'],logline:'做人如果冇夢想，同條鹹魚有咩分別？今次，連鹹魚都有經理人。',ending:'旋風球踢穿董事會，成個球場準時收工。'},
 {id:'scholar',title:'唐伯虎點秋香',en:'Flirting Scholar',tag:'才子 × 秋香 × 跑調',color:'#f3d8d1',accent:'#a3525d',symbol:'fan',budget:1200,roles:['tong','autumn','madam','sword','wah','maid'],logline:'才華未必即刻被睇見，但你個飯碗，大家一定聽得見。',ending:'一曲飯碗交響樂，評審唔識聽但全部起立。'},
 {id:'kungfu',title:'功夫',en:'Kung Fu Hustle',tag:'街坊 × 拖鞋 × 如來',color:'#ddd5e9',accent:'#75608c',symbol:'palm',budget:1600,roles:['kung','landlord','lady','beast','boss','coolie'],logline:'高手喺民間，真正大佬喺樓上催交租。',ending:'豬籠城寨開咗和氣茶樓，邪神負責洗碗。'}
];
const raw=[
 ['sing','soccer','阿星','大力金剛腿','hero','ENFP','獅子座','O',88,32,86,['生鏽球鞋','夢想足球','破洞練功襪']],
 ['iron','soccer','大師兄','鐵頭功打卡王','bald','ISTJ','水瓶座','A',72,38,67,['凹凸飯兜','頭頂安全帽','補腦牛奶']],
 ['water','soccer','三師兄','水上飄佛系派','round','ISFP','雙子座','B',61,34,73,['漂浮水泡','功夫小毛巾','防水午睡枕']],
 ['hands','soccer','四師兄','鬼影擒拿手','glasses','ISFJ','天秤座','AB',80,40,76,['守門手套','接盤吸塵機','萬用公雞碗']],
 ['leg','soccer','五師兄','地趟腿扮路過','cap','ENTP','白羊座','B',71,36,82,['跌打藥酒','滑行膝墊','彈簧拖鞋']],
 ['light','soccer','六師弟','輕功水桶腰','round','ESFP','射手座','O',68,35,78,['加大球衣','輕飄飄腰帶','士多汽水']],
 ['tong','scholar','唐伯虎','華安上班小號','scholar','ENTP','天秤座','AB',85,44,90,['九折賣身契','飯碗鼓棒','桃花摺扇']],
 ['autumn','scholar','秋香','全場唯一清醒','flower','ISFJ','水瓶座','A',84,46,85,['清醒花簪','秋香手帕','拒絕加班扇']],
 ['madam','scholar','華夫人','家規就是劇本','lady','ESTJ','摩羯座','O',87,47,71,['帳簿大全','傳家雞毛掃','威嚴髮簪']],
 ['sword','scholar','奪命書生','用劍改稿','villain','INTJ','天蠍座','AB',46,43,83,['書生小木劍','最終修改版','防笑書卷']],
 ['wah','scholar','華太師','退休未成功','elder','INFJ','金牛座','A',83,39,60,['皇上待辦清單','公雞茶杯','自動搖頭帽']],
 ['maid','scholar','石榴姐','絕代風華擔當','flower','ESFP','雙魚座','B',77,42,84,['桃花大胭脂','小巧照妖鏡','主角光環髮箍']],
 ['kung','kungfu','阿星','拖鞋覺醒中','hero','ENFP','獅子座','O',82,40,94,['街坊波板糖','佛系掌印','過期武功秘笈']],
 ['landlord','kungfu','包租公','耍太極式交租','elder','ISFP','天秤座','B',76,45,78,['睡衣腰帶','防走光皮帶','太極公雞碗']],
 ['lady','kungfu','包租婆','獅吼功催租版','lady','ESTJ','白羊座','O',92,48,82,['萬用拖鞋','大聲公髮卷','租單摺扇']],
 ['beast','kungfu','火雲邪神','高手但著人字拖','bald','INTP','水瓶座','AB',48,44,91,['膠拖鞋','捉蚊子筷子','世界高手報']],
 ['boss','kungfu','琛哥','舞步比計劃多','villain','ENTJ','天蠍座','A',59,41,74,['迷你斧頭','扭腰西裝','黑幫企劃書']],
 ['coolie','kungfu','苦力強','搬貨順手救場','cap','ISTP','金牛座','B',91,38,80,['鐵線小吊帶','一箱汽水','磨蝕工作鞋']]
];
export const CHARACTERS=raw.map(([id,movie,name,title,look,mbti,zodiac,blood,brave,acting,potential,props],i)=>({id,movie,name,title,look,mbti,zodiac,blood,gender:['autumn','madam','maid','lady'].includes(id)?'女':'男',acting,potential,luck:40+i*7%45,traits:{loyalty:58+i*7%40,cunning:20+i*11%65,brotherhood:55+i*9%42,humor:48+i*13%48,timid:100-brave,brave,grit:62+i*5%34,dream:65+i*7%30,optimism:55+i*11%40,introversion:18+i*3%42},props:props.map((name,n)=>({id:`${id}-${n}`,name,price:80+n*60,icon:['prop','spark','fan'][n]}))}));
export const JOBS=[{id:'dishes',name:'洗碗救片場',duration:5*60000,funds:160,coins:70,icon:'bowl',line:'洗到個碗照到你嘅主角光環。'},{id:'meatballs',name:'賣瀨尿牛丸',duration:15*60000,funds:420,coins:180,icon:'bowl',line:'牛丸彈走咗，片酬冇彈走。'},{id:'extra',name:'跑龍套唔跑數',duration:30*60000,funds:760,coins:340,icon:'clapper',line:'「路人甲」都可以有履歷表。'}];
export const EVENTS=[
 {id:'protection',title:'黑道嚟收「場地管理費」',detail:'對方帶住一部收款機，仲話可以分期。',checks:['brave','cunning'],success:['全組企出嚟，對方即刻改口借廁所。','遞咗張「反向收費」單，對方開始懷疑人生。'],fail:'全組夾錢請佢飲凍檸茶，總算冇阻開機。'},
 {id:'prop',title:'傳家道具突然失蹤',detail:'最後見到佢，同一粒牛丸一齊搭小巴。',checks:['loyalty','cunning'],success:['街坊幫手尋回，順便追返失蹤午餐。','用膠紙黐咗個替身，連導演都叫好。'],fail:'以公雞碗頂上，成場戲忽然好有茶記味。'},
 {id:'laugh',title:'全場笑場，導演都加入',detail:'一個臨演連續十八次講錯自己個名。',checks:['humor','grit'],success:['即興改成喜劇，笑聲自帶立體聲。','忍住笑一鏡到底，睫毛都演到震。'],fail:'NG 片段比正片更紅，宣傳部笑到瞓低。'},
 {id:'film',title:'膠卷受潮，變咗春卷',detail:'道具組話：「有啲酥脆，其實係藝術。」',checks:['dream','optimism'],success:['全組轉拍復古黑白片，影評人開始寫論文。','借街坊電話補拍，反而拍出生活感。'],fail:'加多層濾鏡，片名變成《潮到冇朋友》。'},
 {id:'deadline',title:'投資人突然要「最後改一次」',detail:'附件有 Final、Final2 同真係Final。',checks:['brotherhood','cunning'],success:['全組守住導演，投資人改為請飲奶茶。','將片名改做《最後一次》，完美交差。'],fail:'海報再印一次，牛丸已經做埋監製。'},
 {id:'cat',title:'片場貓坐咗導演椅',detail:'佢唔肯落嚟，仲要求魚柳全餐。',checks:['humor','loyalty'],success:['全組認真聽貓指示，意外拍出神作。','溫柔讓位，貓導演批准大家準時收工。'],fail:'片尾多咗三分鐘貓叫，但觀眾冇人投訴。'}
];
export const ENCOUNTERS={sing:{name:'星爺嚴師',title:'「你個角色，點解要出場？」',question:'導演話「再自然啲」，你會點做？',answers:['先理解角色想得到甚麼，再演一次','所有表情一齊用','叫個公雞碗做替身'],correct:0,reward:'演技上限永久升至 130，演技 +3。'},tat:{name:'達哥師傅',title:'「識驚，先識得揀條好路。」',question:'臨時多咗場戲，點樣幫全組？',answers:['同大家分工，留返啲氣拍好最後一鏡','假扮道具唔郁','將通告塞入飯碗'],correct:0,reward:'學會摸魚絕技：怕事值轉化為票房暴擊機率。'}};
export const character=id=>CHARACTERS.find(c=>c.id===id);
export const movie=id=>MOVIES.find(m=>m.id===id);
export const pick=(items,random=Math.random)=>items[Math.min(items.length-1,Math.floor(random()*items.length))];
