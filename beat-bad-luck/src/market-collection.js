// Original night-market neighbours and everyday-life comic props.
export const MARKET_SKINS=[
 ['wifi-sloth','斷線樹懶','Offline sloth',1660,'#bca995','sloth',1.95,'轉圈圈轉足半日，原來佢連咗去隔籬棵樹。','Half a day buffering. It connected to the wrong tree.'],
 ['bubble-tea-crab','漏單珍奶蟹','Missing-order boba crab',2280,'#daa0aa','boba-crab',2.15,'八隻腳送餐，杯珍奶仲未搵到條飲管。','Eight legs delivering tea. Still looking for the straw.'],
 ['subscription-onion','自動續費洋蔥','Auto-renew onion',3080,'#d0b3e5','onion',2.35,'剝開一層又一層，全部都係忘記取消嘅訂閱。','Every layer reveals another subscription you forgot to cancel.'],
 ['captcha-cloud','驗證碼烏雲','CAPTCHA cloud',3880,'#a9c4d4','captcha',2.55,'叫你揀九格交通燈，揀到盞燈都退休。','Pick every traffic light. The lights retired before you finished.'],
 ['parking-bun','違泊菠蘿包','Double-parked bun',4480,'#e8c27c','parking',2.65,'話買個包就走，個包已經學識倒車。','Just buying a bun, it says. The bun has already learnt to reverse.'],
 ['spam-mushroom','廣告彈窗菇','Pop-up mushroom',5080,'#d6a8a0','mushroom',2.75,'撳走一個彈兩個，原來佢開緊蘑菇分店。','Close one, two more appear. It is opening mushroom franchises.']
].map(([id,nameZh,name,cost,color,shape,multiplier,description,descriptionEn])=>({id,nameZh,name,cost,color,shape,multiplier,description,descriptionEn,merit:0,series:'street-comedy'}));
export const MARKET_WEAPONS=[
 ['boba-mallet','珍奶搖搖錘','Boba shake mallet',800,0,4.85,260,'搖到藉口變珍珠，今日唔收加料費。','Shake excuses into pearls. No topping surcharge today.'],
 ['offline-fan','斷網清心扇','Offline peace fan',1150,100,5.12,360,'一扇關 Wi-Fi，兩扇收工去街。','One fan switches off Wi-Fi. Two fans get you out the door.'],
 ['sickleave-pillow','病假護心枕','Rest-day pillow',2200,450,5.77,190,'枕頭蓋住催單，唔舒服就好好抖吓。','Muffles the chasing messages. Feeling unwell? Rest properly.'],
 ['ricecooker-shield','電飯煲護盾','Rice-cooker shield',3150,800,6.23,280,'飯熟先傾，所有急件請等保溫燈。','Dinner first. Urgent messages can wait for the keep-warm light.'],
 ['keyboard-fish','鍵盤鹹魚劍','Keyboard salted-fish blade',4600,2000,6.79,540,'Ctrl 加鹹魚，貼上全新收工理由。','Control plus salted fish: paste a brand-new reason to clock off.'],
 ['lasttrain-whistle','尾班車準點哨','Last-train whistle',5100,2500,6.9,620,'一吹即到站，唔好畀煩惱拖你錯過尾班車。','One whistle brings the train. No worry gets to make you miss it.']
].map(([id,nameZh,name,cost,merit,multiplier,tone,description,descriptionEn])=>({id,nameZh,name,cost,merit,multiplier,tone,description,descriptionEn,series:'street-comedy'}));
export const MARKET_SECRET_KITS=[
 ['secret-shift-compass','收工指南針','Clock-off compass','🧭','指針永遠指向屋企，連迷路藉口都識返歸。','Always points home. Even lost excuses find their way back.'],
 ['secret-tidy-vacuum','煩惱吸塵機','Worry vacuum','🧹','吸走一地碎念，塵袋打開係一堆放假申請。','Vacuums up the grumbling. The dust bag is full of leave requests.'],
 ['secret-fortune-remote','好運轉台掣','Good-luck channel remote','📺','將無限加班台轉去今晚早啲瞓，廣告都唔敢催你。','Switches overtime TV to an early night. Even the adverts stop nagging.']
];
export const MARKET_SECRET_DECOR=[
 ['secret-tea-fountain','奶茶許願噴泉','Milk-tea wish fountain','🫖','噴泉只噴奶茶香，願望係全條街一齊準時食飯。','A fountain of milk-tea fragrance. Its wish: dinner on time for the whole street.'],
 ['secret-cat-busstop','招財貓巴士站','Lucky-cat bus stop','🐈','招財貓揮手就有車，衰運排錯隊上咗去返工。','The cat waves a bus over. Bad luck joins the wrong queue and goes to work.'],
 ['secret-weekend-planet','長週末小行星','Long-weekend planet','🪐','一日有三個星期六，個鬧鐘已經申請退休。','Three Saturdays in a day. The alarm clock has applied for retirement.']
];
export const MARKET_PATRONS=[
 ['umbrella-mender','補遮慢活叔','Slow-living umbrella mender','☂️',1,.01,.01,0,'佢補好你把遮，順手將急字縫成慢字，話落雨都唔使同自己鬥快。','He fixes your umbrella and stitches hurry into take it easy. No need to race yourself in the rain.'],
 ['toydoc-aunt','玩具診所姨姨','Toy-clinic auntie','🧸',2,.02,.02,.05,'姨姨幫公仔縫返個笑口，仲話你都可以偶爾甩線，唔使日日扮新淨。','She stitches a smile onto a toy. Loose threads are allowed; nobody has to look brand-new every day.'],
 ['noodle-poet','雲吞麵詩人','Wonton-noodle poet','🍜',2,.02,.02,.05,'佢用竹昇麵寫首收工詩，押韻押到粒雲吞都想放假，最後請你加底。','He writes a clock-off poem in noodles. Even the wonton wants a holiday, so he treats you to extra noodles.'],
 ['nightbus-guide','夜更巴士引路人','Night-bus guide','🚌',3,.03,.03,.08,'尾班車開之前佢會叫醒你，話今日做得夠多，下一站可以唔諗工作。','She wakes you before the last bus. You have done enough today; the next stop can be free of work.'],
 ['rooftop-astronomer','天台觀星婆婆','Rooftop astronomer granny','🔭',4,.04,.04,.12,'婆婆話星星都唔係每晚見到，睇唔見唔代表冇光，順手塞粒糖入你袋。','Stars are not visible every night, she says. Unseen does not mean unlit. She slips a sweet into your pocket.'],
 ['holiday-postman','長假期郵差','Long-holiday postman','💌',5,.05,.05,.15,'佢送嚟一封冇死線嘅信，內容只有慢慢嚟三個字，郵票上面隻貓已經瞓著。','He delivers a letter with no deadline: take your time. The cat on the stamp has already fallen asleep.']
];
export const MARKET_PATRON_LOOKS={
 'umbrella-mender':['#8fb8b1','#bbb8ab','cap','umbrella'],
 'toydoc-aunt':['#dab4ca','#735c65','bun','basket'],
 'noodle-poet':['#b5c993','#66536d','chef','bowl'],
 'nightbus-guide':['#9baed2','#625d70','beret','bus'],
 'rooftop-astronomer':['#baa9d9','#ded3c5','scarf','torch'],
 'holiday-postman':['#e9bf8e','#76635b','cap','fan']
};
export function marketCostume(id){return {
 'wifi-sloth':'<path d="M38 47q-8-32 31-31 40 0 34 31l-18-5-15 8-15-8Z" fill="#7d6b64"/><path d="m36 59 25 13m43-13L79 72" stroke="#8a7569" stroke-width="12"/><path d="M53 111q17-27 34 0m-25-8 8-13 8 13" fill="none" stroke="#e9d38d" stroke-width="4"/>',
 'bubble-tea-crab':'<path d="M32 53 8 37l2-17 10 10 10-10 1 17m77 16 24-16-2-17-10 10-10-10-1 17" fill="#d88a9d"/><path d="m40 128-21 10m21-20-25 3m85 7 21 10m-21-20 25 3" stroke="#d88a9d" stroke-width="6"/><path d="m54 104 4 29h25l4-29Z" fill="#eddbb7"/><path d="m74 103 9-16" stroke="#b5d8d2" stroke-width="5"/>',
 'subscription-onion':'<path d="M32 43q-3-30 38-36 42 7 38 36L84 29 70 38 55 28Z" fill="#ae87bb"/><path d="m55 11 6 18m10-20v19m14-15-5 17" fill="none" stroke="#e8d2ec" stroke-width="3"/><path d="M47 108h46v22H47Z" fill="#f2dfbd"/><path d="m56 115 25 0m-25 7h17" stroke="#a17aab" stroke-width="3"/>',
 'captcha-cloud':'<path d="M29 46q-23-23 1-30 8-25 30-13 25-13 34 9 29-3 22 27l-18 2-17-8-15 8-17-9Z" fill="#dae6e7"/><g fill="#f4dca5" stroke="#758899" stroke-width="2"><rect x="45" y="104" width="15" height="14"/><rect x="62" y="104" width="15" height="14"/><rect x="79" y="104" width="15" height="14"/><rect x="45" y="120" width="15" height="14"/><rect x="62" y="120" width="15" height="14"/><rect x="79" y="120" width="15" height="14"/></g>',
 'parking-bun':'<path d="M28 45q4-39 42-39 37 0 42 39Z" fill="#ddb46e"/><path d="m43 23 53 16m-48-27 51 15M51 10 37 36m30-29L52 41m33-31L68 42m33-26L86 42" fill="none" stroke="#fff0c0" stroke-width="3"/><circle cx="70" cy="117" r="17" fill="#829fbb"/><path d="M65 128v-22q18-3 12 10H65" fill="none" stroke="#fff2c7" stroke-width="4"/>',
 'spam-mushroom':'<path d="M20 47q-2-48 50-45 53-3 50 45Z" fill="#b87580"/><g fill="#f5e0c3"><circle cx="45" cy="24" r="8"/><circle cx="77" cy="15" r="7"/><circle cx="98" cy="31" r="9"/></g><path d="M44 103h52v30H44Z" fill="#f6e9ca"/><path d="m82 109 8 8m0-8-8 8M49 124h32" stroke="#a36a78" stroke-width="3"/>'
}[id]??'';}
const cheeks='<path d="m43 55 5-2m24 0 5 2m-24 10q7 7 14 0" fill="none" stroke="#61535b" stroke-width="3" stroke-linecap="round"/>';
export function marketWeaponArt(id){return {
 'boba-mallet':'<path d="m57 70-13 39 15 5 13-40" fill="#b89671" stroke="#75624f" stroke-width="3"/><path d="m20 22 75 7-5 48-76-7Z" fill="#dbadc3" stroke="#856a7d" stroke-width="3"/><path d="m36 23 1-17 10 1-1 18" fill="#b6d8d7"/><g fill="#745d72"><circle cx="30" cy="61" r="5"/><circle cx="48" cy="65" r="5"/><circle cx="70" cy="65" r="5"/></g>'+cheeks,
 'offline-fan':'<path d="m60 71-6 41h12l-6-41L13 31q48-40 94 0Z" fill="#a8d1bc" stroke="#658b7b" stroke-width="3"/><path d="m60 71-27-51m27 51V11m0 60 27-51" stroke="#d7e4b9" stroke-width="3"/><path d="m42 39 37 0m-32 7h27m-20 7h13" stroke="#67898a" stroke-width="4"/>'+cheeks,
 'sickleave-pillow':'<path d="M14 28q45 9 92 0-8 32 0 65-48-8-92 0 9-35 0-65Z" fill="#b9c8e7" stroke="#788aa8" stroke-width="3"/><path d="M23 36q37 8 74 0m-73 48q37-6 73 0" fill="none" stroke="#e4ebdf" stroke-width="3"/>'+cheeks+'<path d="m84 44 10-10m0 10L84 34" stroke="#f6e4b5" stroke-width="3"/>',
 'ricecooker-shield':'<path d="M24 47q-16 4-13 27h14m71-27q16 4 13 27H95" fill="none" stroke="#b9d0c4" stroke-width="7"/><rect x="23" y="33" width="74" height="65" rx="21" fill="#e7c19f" stroke="#8e7161" stroke-width="3"/><ellipse cx="60" cy="34" rx="37" ry="13" fill="#f8e7bd"/><path d="M47 22v-9h26v9" fill="none" stroke="#8d9e98" stroke-width="7"/>'+cheeks+'<rect x="47" y="78" width="26" height="10" rx="4" fill="#9ec2ae"/>',
 'keyboard-fish':'<path d="m28 90 61-65 15 3-5 17-57 61Z" fill="#a6c8bd" stroke="#647c80" stroke-width="3"/><path d="m75 38 13 14m-23-3 13 14m-23-3 13 14m-23-3 13 14m-23-3 13 14" stroke="#e4e5ca" stroke-width="5"/><path d="m19 93 28 11m-14-4-9 13" stroke="#ac8e7a" stroke-width="8"/><path d="m95 23 8-16 7 17" fill="#83a9aa"/><circle cx="94" cy="32" r="3" fill="#526472"/>',
 'lasttrain-whistle':'<path d="M20 45q20-17 43 2l36-13 4 23-38 7q-7 33-34 17T20 45Z" fill="#edc77f" stroke="#8f7659" stroke-width="3"/><circle cx="42" cy="62" r="12" fill="#b5d2ca"/><path d="m24 86-8 18m70-85 3-13m13 18 11-9" stroke="#bfd9cf" stroke-width="4" fill="none"/>'+cheeks,
 'secret-shift-compass':'<circle cx="60" cy="65" r="42" fill="#e9c987" stroke="#95734d" stroke-width="4"/><circle cx="60" cy="65" r="33" fill="#fff0c9"/><path d="m60 33 13 32-13 31-13-31Z" fill="#b2a1d0" stroke="#756080" stroke-width="2"/><path d="M49 21V10h22v11" fill="none" stroke="#95734d" stroke-width="5"/><circle cx="60" cy="65" r="5" fill="#f2dd91"/>',
 'secret-tidy-vacuum':'<path d="M33 68q-18-58 22-56t31 54" fill="none" stroke="#9db3bc" stroke-width="7"/><rect x="19" y="59" width="51" height="43" rx="16" fill="#c5b6d8" stroke="#816f91" stroke-width="3"/><path d="m85 64 4 32m-13 4h28" fill="none" stroke="#a1bab2" stroke-width="8"/><circle cx="33" cy="103" r="8" fill="#77838b"/><circle cx="59" cy="103" r="8" fill="#77838b"/>'+cheeks,
 'secret-fortune-remote':'<rect x="32" y="9" width="56" height="102" rx="16" fill="#abcbb6" stroke="#698873" stroke-width="3"/><circle cx="60" cy="38" r="13" fill="#f0d49d"/><path d="M60 29v18m-9-9h18" stroke="#a07a61" stroke-width="4"/><g fill="#e5bdc9"><circle cx="47" cy="70" r="6"/><circle cx="73" cy="70" r="6"/><circle cx="47" cy="91" r="6"/><circle cx="73" cy="91" r="6"/></g>'
}[id]??'';}
export function marketDecorArt(id){return {
 'secret-tea-fountain':'<path d="M22 75q38 22 76 0l-9 28H31Z" fill="#a5c9c5" stroke="#6b8a85" stroke-width="3"/><path d="M47 60h26v25H47Z" fill="#bba0c9"/><path d="M36 27h48l-6 36H42Z" fill="#edc59f" stroke="#9b7963" stroke-width="3"/><path d="M83 33q24-3 13 20l-16 4M45 13q-9 14-21 47m35-50q0 20-1 22m15-19q14 13 24 45" fill="none" stroke="#e7c38d" stroke-width="5"/>'+cheeks,
 'secret-cat-busstop':'<path d="M16 38h89l-9-18H28Z" fill="#aebed9" stroke="#788998" stroke-width="3"/><path d="M25 40v69m70-69v69M18 108h85" stroke="#b9c8b7" stroke-width="5"/><path d="M39 94V69q-9-22 11-25l8-15 10 15q21-2 18 25v25Z" fill="#f0d2a4" stroke="#a08c70" stroke-width="3"/><path d="m47 61 5-3m16 0 5 3m-20 13q7 8 14 0M74 75q18-28 18-5" fill="none" stroke="#8e7466" stroke-width="3"/>',
 'secret-weekend-planet':'<circle cx="60" cy="61" r="34" fill="#c3b1dd" stroke="#88759e" stroke-width="3"/><ellipse cx="60" cy="63" rx="56" ry="15" fill="none" stroke="#edce92" stroke-width="8" transform="rotate(-20 60 63)"/><path d="m42 44 8-3m20 0 8 3m-26 8q8 8 16 0" fill="none" stroke="#75627f" stroke-width="3"/><path d="m24 13 3 8 8 3-8 3-3 8-3-8-8-3 8-3m68 66 2 6 6 2-6 2-2 6-2-6-6-2 6-2" fill="#f1dca3"/>'
}[id]??'';}
