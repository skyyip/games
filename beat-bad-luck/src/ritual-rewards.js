// Original comic homages; no film stills, recordings or private worries are stored.
const kits=[
 ['secret-loudspeaker','收工獅吼咪','Off-duty lion-roar mic','📢','一嗌收工，連個鐘都打卡走先。'],
 ['secret-lollipop','初戀波板糖','First-love lollipop','🍭','唔使等有錢先食糖，今日已經夠甜。'],
 ['secret-drumstick','濟公偷笑雞髀','Laughing monk drumstick','🍗','雞髀未咬，小人已經話自己齋戒。'],
 ['secret-zero-knife','零零發發光刀','Zero-zero shining blade','🔪','刀未出鞘，張單已經自動分期收工。'],
 ['secret-flower','唐伯虎捽花手','Scholar flower hand','🌺','捽兩下，份 Requirement 自己識背唐詩。'],
 ['secret-rubber','逃學粉筆炮','Truant chalk cannon','🧽','黑板話唔想返學，小人即刻做值日生。'],
 ['secret-taxi','國產飛天的士錶','Flying taxi meter','🚕','衰運跳錶太快？一掌送佢落車。'],
 ['secret-shoe','功夫拖鞋雲','Kung-fu slipper cloud','🩴','踩住拖鞋上雲端，唔包加班接送。'],
 ['secret-fan','包租婆降噪扇','Landlady silence fan','🪭','扇兩下，是非嘴自己轉飛行模式。'],
 ['secret-coconut','椰殼如來掌','Coconut peace palm','🥥','掌心有椰香，小人扁到想做椰撻。'],
 ['secret-sausage','食神反彈腸','Bouncy chef sausage','🌭','打到飛起都彈返嚟，連衰運都話飽。'],
 ['secret-remote','月光加班遙控','Moonlight overtime remote','🎛️','撳暫停唔係偷懶，係幫宇宙慳電。'],
 ['secret-umbrella','大內密探漏雨遮','Secret agent leaky umbrella','☂️','遮唔到雨，但遮到老細個已讀。'],
 ['secret-gong','大話收工鑼','Tall-tale clock-off gong','🔔','敲一下：今日所有最後一次正式散場。'],
 ['secret-tram','叮叮太空飛拖','Cosmic tram slipper','🚋','跨越三條街，準時返屋企食飯。']];
const decor=[
 ['secret-wonton','會行路雲吞車','Walking wonton cart','🥟','雲吞自己排隊買自己，生意好到離譜。'],
 ['secret-bus','永不飛站小巴','Never-skip minibus','🚐','司機唔飛站，連衰運都唔敢上車。'],
 ['secret-duck','笑到反肚鴨','Laughing upside-down duck','🦆','笑到反肚唔係失業，係表演藝術。'],
 ['secret-bowl','食神搶咪飯碗','Singing chef bowl','🍚','碗飯自己唱 K，配菜負責和音。'],
 ['secret-rose','如花梳妝櫃','Comedian vanity cabinet','🪞','照鏡唔收錢，自信加到爆煲。'],
 ['secret-lion','隔音獅子頭','Soundproof lion head','🦁','包租婆一開聲，佢即刻戴耳塞。'],
 ['secret-moon','月光茶記月球','Moonlit café planet','🌕','月球都開茶記，凍奶茶唔使加二。'],
 ['secret-pig','戴假鬚乳豬','Moustached roast pig','🐷','佢話自己係道具，唔好叫廚房。'],
 ['secret-goose','鵝頸橋鵝老闆','Flyover goose boss','🪿','老闆只識鵝鵝叫，批假反而快咗。'],
 ['secret-seal','自動批准玉璽','Auto-approval seal','🪭','所有假紙自動批准，唔包股票升。'],
 ['secret-tv','懷舊雪花電視','Retro snowstorm TV','📺','冇訊號都笑到收唔到聲。'],
 ['secret-fish','鹹魚夢想魚缸','Salted-fish dream tank','🐟','做人冇夢想？條魚話先瞓晏覺。'],
 ['secret-star','星級掃地僧','Star-rated sweeping monk','🧹','掃走霉運順便掃走未讀通知。'],
 ['secret-pineapple','菠蘿油時光機','Pineapple-bun time machine','🍍','返去五分鐘前，食多個菠蘿油。'],
 ['secret-chair','導演喊收工龍椅','Director clock-off throne','🎬','一坐低就喊 Cut，連煩惱都殺青。']];
export const SECRET_WEAPONS=kits.map(([id,nameZh,name,icon,description],i)=>({id,nameZh,name,icon,description,descriptionEn:'A ridiculous Hong Kong cinema-inspired keepsake. Even bad luck needs a day off.',hidden:true,cost:1800+i*240,merit:0,multiplier:3.5+i*.18,tone:190+i*24,secretIndex:i}));
export const SECRET_DECOR=decor.map(([id,nameZh,name,icon,description],i)=>({id,nameZh,name,icon,description,descriptionEn:'A tiny comedy set for your stall. The neighbours insist on an encore.',hidden:true,expanded:true,cost:2500+i*350,rate:1.2+i*.12,secretIndex:i}));
export const PATRONS=[
 ['waiter','暖心茶記伙記','Kind café waiter','☕',1,.01,0,0],['driver','準點小巴司機','Punctual minibus driver','🚐',1,0,.01,0],['neighbour','通情達理街坊','Thoughtful neighbour','☂',1,.02,0,0],
 ['bun-aunt','波板糖阿姐','Lollipop auntie','🍭',2,0,.02,.05],['sweeper','掃走 OT 老僧','Overtime-sweeping monk','🧹',2,.02,.02,0],['fish-chef','鹹魚翻生主廚','Salted-fish revival chef','🐟',3,.03,0,.08],
 ['landlady','低聲獅吼房東','Soft-roaring landlady','🦁',3,0,.03,.10],['scholar','準時交稿才子','On-time scholar','🌺',4,.04,.04,.12],['director','一 Take 過導演','One-take director','🎬',4,.04,0,.12],['star-master','宇宙收工貴人','Cosmic off-duty patron','🌟',5,.05,.05,.15]
].map(([id,nameZh,name,icon,stars,oil,merit,discount])=>({id,nameZh,name,icon,stars,oil,merit,discount,weight:[0,40,24,12,5,1][stars],story:`${nameZh}：「唔使驚，今日有我撐你；啲衰運自己識搭尾班車走。」`}));
export const MASTER_COMMENTS=['你呢下掌力，保鮮紙都想申請工傷。','小人話想上訴，我話窗口已經收工。','你打得咁準，樓下叮叮都想請你揸車。','衰運已經打包，運費到付，唔好簽收。','睇你個氣勢，隔籬鹹魚都彈起身叫加油。','唔好再內耗喇，個煲都畀你煲到辭職。','今日收工有聲，宇宙都要幫你熄燈。','張紙皺啫，你嘅前途唔皺。','呢招打落去，Requirement 自己改名做 Optional。','煩惱話佢只係臨時工，我話一樣要走。','你個笑容勁過必殺技，記得照吓鏡。','小人未瞓，你可以先瞓；佢冇你份租約。','呢度唔包中六合彩，但包你笑多兩聲。','個帽都笑到甩線，師傅今晚要補鑊。','你一拍，白虎都自動拎飯盒排隊。','今日嘅霉運已殺青，聽日唔好叫佢返工。','恭喜晒，衰運已讀不回。','咁多心事都放低咗，隻拖鞋終於可以抖吓。','呢個姿勢，龍椅都讓位畀你坐。','笑住收工啦，老細都要充電㗎。'];
export function comicDescription(item){return item.description??COMIC_LINES[item.id]??`${item.nameZh??item.name}：「我只係一件道具，點知一出場就畀衰運搶住攞簽名。」`}
export function patronBuffs(state){const list=PATRONS.filter(f=>state.friends?.includes(f.id));return {oil:Math.min(.05,list.reduce((a,b)=>Math.max(a,b.oil),0)),merit:Math.min(.05,list.reduce((a,b)=>Math.max(a,b.merit),0)),discount:Math.max(0,...(state.coupons??[]).filter(c=>c.uses>0).map(c=>c.discount))};}
export function weightedPatron(available,random){const total=available.reduce((a,b)=>a+b.weight,0);let roll=random()*total;return available.find(f=>(roll-=f.weight)<0)??available.at(-1);}
export const hkDay=now=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(now));

export function patronBuffText(f,zh=true){const bits=[];if(f.oil)bits.push(zh?`香油錢 +${Math.round(f.oil*100)}%`:`Oil +${Math.round(f.oil*100)}%`);if(f.merit)bits.push(zh?`功德 +${Math.round(f.merit*100)}%`:`Merit +${Math.round(f.merit*100)}%`);if(f.discount)bits.push(zh?`入場禮：一張 ${(10*(1-f.discount)).toFixed(1)} 折券`:`Welcome gift: one ${Math.round(f.discount*100)}% off coupon`);return bits.join(' · ');}

const COMIC_LINES={
 'bare-hand':'師傅零成本，同小人打個收工招呼。',flipflop:'拖鞋有導航，專送衰運落街。',paper:'今日頭條：小人宣布拒絕加班。',bag:'是非打包，唔使餐具唔使追問。',stool:'凳未摺，小人已自動企定認錯。',sword:'符畫完，歪理自動簽離職信。',stamp:'啱啱蓋完，個宇宙都批你放假。',mace:'唔係榴槤，係衰運嘅按摩棒。',record:'呢隻碟只播：今晚準時返屋企。',pinwheel:'一轉，小人啲歪理全部風乾。','iron-hammer':'鎚一鎚，Requirement 都識講唔該。','fortune-child':'童子負責轉運，唔負責轉嫁工作。','triple-trio':'三T未開跑，衰運先輸咗個馬鼻。','marksix-snowball':'唔保證中獎，保證小人冇得加注。','rebirth-paper':'投胎表格填完，呢世都要先收工。','chalk-eraser':'擦走 OT，連黑板都叫你食飯。',spanner:'擰走歪理，剩低一粒良心螺絲。','solar-torch':'陰天照樣閃兩下，尷尬都當特效。','hairdryer-shaver':'髮型未吹靚，小人鬍鬚先投降。','plunger-nunchucks':'吸住內耗，啵一聲送佢去旅行。','pepper-spray':'一噴，小人即刻自己戴返口罩。','pork-cleaver':'阿漆個飯盒加餸，衰運先被切片。','flying-dagger':'小李唔送外賣，呢刀只送走歪理。','meteor-hammer':'流星劃過，小人即刻許願早退。','overlord-spear':'霸王槍一揮，啲 KPI 自己列隊請假。','fish-gut-sword':'魚腸劍唔煮湯，專斬無理追問。','jing-ke-dagger':'匕首先問路，小人已自動開城門。','scholar-sword':'書生拔劍前，已用道理打贏三成。','smiling-half-step':'行半步先笑，未夠半步已收工。','one-day-powder':'含包唔含 OT，食完記得抹嘴。','cotton-palm':'掌力軟綿綿，小人扁到做枕頭。','beauty-fist':'打到越嚟越靚，小人開始要出場費。','oboi-guillotine':'血滴子落嚟，小人個假髮先走佬。','thunder-beads':'朱茜粒珠未滾，歪理先爆笑。','fire-wheels':'星爺風火輪，一轉收工兩轉加餸。','royal-salted-fish':'御賜鹹魚在此，小人即刻鞠躬。','prank-box':'開箱即驚喜，收埋你份 OT 先。','peace-pistol':'署長支槍冇火藥，只有和平收工聲。','ufo-rifle':'太空都唔收 OT，小人請自行返航。','gadget-3000':'攞你命3000？今次只攞走衰運。','eiffel-flip':'翻完再翻，煩惱暈到唔記得追你。','purple-green-sword':'寶劍一亮，已讀即刻變撤回。','golden-headband':'箍住唔係你個頭，係無窮嘅要求。',lassie:'拉茜唔會食隊友，乖過隔籬部門。','immunity-token':'免死可以傾，OT 申請今日唔批。',
 radio:'電台只播收工歌，老細打嚟都係留言。',neon:'光管眨一眨，小人以為自己上咗紅地氈。',incense:'煙唔係訊號差，係衰運準備登出。',cat:'招財唔招 OT，隻貓都有職業操守。',tiger:'老虎瞓晏覺，唔准煩惱叫醒佢。',aquarium:'條魚吸財吸到打嗝，唔包幫你炒股。','three-stars':'福祿壽開會，議程得一項：開飯。','money-tree':'棵樹唔識回覆電郵，值得學習。',amethyst:'水晶一閃，煩惱即刻扮透明。','beef-balls':'牛丸有彈性，deadline 冇得彈。','street-wings':'雞翼話未熟，衰運已經自動埋單。','sweet-mantou':'饅頭個心太甜，小人甜到講唔出歪理。','jigong-chicken':'濟公食完笑一笑，雞都話唔使找。','beggar-dog-rice':'蘇乞兒請埋拉茜開飯，龍椅都要排隊。','honest-red-bean-bun':'食完會講真話：我真係想收工。','shy-lollipop':'棒棒糖怕醜，小人見到都面紅。','melancholy-rice':'黯然係飯名，唔係你今日嘅心情。','butter-guillotine':'奶油未溶，歪理先滑走。','electric-banana':'香蕉通電，小人即刻自動充良心。','lucky-coins':'銅錢轉兩轉，衰運跌埋車錢。','paper-doll':'公仔話自己係代班，唔接受加鐘。','bagua-array':'八卦陣唔收八卦，請去隔籬排隊。','lucky-roast-pig':'乳豬戴住假鬚，話自己只係臨記。','paper-iphone-duo':'部紙電話永遠有電，永遠唔覆 OT。','landscape-rock':'座山唔郁都咁有前途，慢啲唔使驚。','sushi-1000':'一千件花之戀，浪漫到白虎想轉行。','dragon-throne':'坐龍椅都要喊 Cut，今日準時殺青。'
};
