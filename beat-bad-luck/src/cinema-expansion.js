// Original flyover slapstick inspired by Hong Kong film situations, not copied dialogue.
export const CINEMA_DECOR=[
 ['movie-fishball-fountain','超彈牛丸噴水池','Bouncy meatball fountain','🍡',1900,1.38,'牛丸彈到半空扮噴泉，招財貓戴泳帽排隊沖涼。'],
 ['movie-rent-lion-bell','包租婆靜音門鐘','Landlady quiet doorbell','🔕',2600,1.8,'門鐘先深呼吸，再用紙條嗌交租；成條街終於聽到自己心聲。'],
 ['movie-court-gavel','九品自動驚堂木','Nine-rank automatic gavel','⚖️',3300,2.16,'驚堂木一拍，所有「最後修改版」自動改名「準時收工版」。'],
 ['movie-scholar-chickens','唐伯虎八雞報喜圖','Scholar’s eight lucky chickens','🐔',4200,2.7,'八隻雞輪流做才子，第九隻只負責追討出場費。'],
 ['movie-lingling-fridge','凌凌漆流動肉檔','Secret agent’s mobile butcher stall','🥩',5200,3.24,'特工暗號係半斤免加班，雪櫃一開全是已批准假紙。'],
 ['movie-hat-rack','百變星君變形帽架','Shape-shifting comedy hat rack','🎩',6500,3.9,'帽架扮完老細再扮員工，最後自己批准自己放假。'],
 ['movie-kungfu-estate','豬籠城寨迷你街坊樓','Mini kung-fu neighbourhood','🏘️',8200,5.1,'樓上練獅吼，樓下練隔音；管理員用拖鞋維持宇宙和平。'],
 ['movie-moonlight-box','月光寶盒準時收工鐘','Moonlight clock-off box','🕰️',10100,6.6,'只可以返去收工嗰分鐘；想返工？寶盒話佢冇呢個功能。'],
 ['movie-royal-inventor','零零發無用發明展架','Royal useless-invention display','🧰',12400,8.4,'太陽能夜燈照住隱形雨遮，展架已經笑到申請工傷。'],
 ['movie-god-cook-canteen','食神自助加餸飯堂','Comedy chef’s extra-rice canteen','🍱',14500,10.2,'黯然銷魂飯自己加蛋，牛丸做侍應，所有加班單當墊碟紙。'],
].map(([id,nameZh,name,icon,cost,rate,description],index)=>({id,nameZh,name,icon,cost,rate,description,descriptionEn:'An original Hong Kong film-comedy prop. Even the scenery refuses overtime.',expanded:true,cinemaIndex:index}));
export const CINEMA_SECRET_KITS=[
 ['secret-comb-3001','攞你命3001膠梳','All-in-one 3001 plastic comb','🪮','十幾件法器一齊展開，最後只剩膠梳；小人怕亂髮，自動投降。'],
 ['secret-wig-lion','包租婆假髮獅吼','Landlady’s roaring wig','🦁','假髮先嗌一聲收工，真頭髮即刻跟住請年假。'],
 ['secret-rice-spoon','食神加蛋神羹','Comedy chef’s egg spoon','🥄','一羹拍走霉運，一羹加蛋；小人要求打包唔好走蔥。'],
 ['secret-court-gavel','九品甩鍋驚堂木','Blame-court comic gavel','🔨','驚堂木拍到個鍋自己認罪，仲主動填埋離職表。'],
 ['secret-chicken-feather','唐伯虎代筆雞毛掃','Scholar’s chicken-feather brush','🪶','八隻雞一齊代筆，寫出同一句：今日唔改稿。'],
 ['secret-clockoff-key','月光準時收工匙','Moonlight clock-off key','🗝️','開到所有收工門，唯獨老細個會議室自動反鎖。'],
];
export const CINEMA_SECRET_DECOR=[
 ['secret-soy-witness','牛丸證人豉油樽','Meatball witness soy bottle','🫙','一滴豉油落去，牛丸證人承認自己其實係大老闆。'],
 ['secret-landlord-chair','包租婆零租躺椅','Landlady’s rent-free recliner','🪑','坐低先收租，點知一坐就瞓到下個月。'],
 ['secret-time-clock','月光倒轉打卡機','Moonlight reverse time clock','⏳','只打收工卡，返工卡一律退件：劇本冇寫。'],
 ['secret-piano-no-rent','功夫免租鋼琴','Kung-fu rent-free piano','🎹','彈一粒音，租單少一行；彈到尾業主都加入大合唱。'],
 ['secret-bun-rocket','百變菠蘿包火箭','Shape-shifting bun rocket','🚀','火箭起飛先抹牛油，導航目的地永遠係你屋企。'],
 ['secret-stunt-fish','鹹魚特技替身台','Salted-fish stunt platform','🐟','鹹魚自己翻身，仲話危險動作請由鹹魚完成。'],
];
export const CINEMA_TITLES=[
 ['cinema-chef','食神打包王','Takeaway comedy chef','一局重扣 12 次並餵飽白虎','Use 12 heavy whacks and feed the tiger','飯','chef'],
 ['cinema-landlady','包租婆低音炮','Landlady bass cannon','一局完成 25 次完美節奏','Land 25 perfectly timed hits','吼','lantern'],
 ['cinema-agent','凌凌漆準時切件','Agent clock-off cleaver','用凌凌漆豬肉刀命中 30 次','Land 30 hits with the pork cleaver','切','hammer'],
 ['cinema-scholar','唐伯虎五招點秋香','Scholar of five moves','一局用齊五類手勢並達 50 連擊','Use all five moves and reach a 50 combo','才','flower'],
 ['cinema-moonlight','月光寶盒轉圈王','Moonlight circle master','一局完成 12 次轉圈','Use 12 circle moves','轉','whirl'],
 ['cinema-court','九品收工判官','Clock-off court judge','一局達到 88 連擊','Reach an 88-hit combo','判','paper-crown'],
 ['cinema-prank','整蠱片場動作指導','Prank-set action director','一局來回搓 12 次及雙指夾 6 次','Use 12 rubs and 6 pinches','戲','projector'],
 ['cinema-kungfu','功夫一掌打卡','Kung-fu clock-off palm','徒手命中 100 次並完成餵虎祈福','Land 100 bare-hand hits, feed and bless','掌','gold'],
].map(([id,zh,en,detail,detailEn,stamp,look])=>({id,name:[zh,en],detail:[detail,detailEn],stamp,look,lookName:[zh+'徽章',en+' badge'],goal:'cinema'}));
export function cinemaTitleMet(id,r){const m=r.moves??{};return ({
 'cinema-chef':m.heavy>=12&&r.fed,'cinema-landlady':r.perfect>=25,'cinema-agent':r.weapon==='pork-cleaver'&&r.hits>=30,
 'cinema-scholar':['tap','heavy','rub','circle','pinch'].every(k=>m[k]>0)&&r.bestCombo>=50,
 'cinema-moonlight':m.circle>=12,'cinema-court':r.bestCombo>=88,'cinema-prank':m.rub>=12&&m.pinch>=6,
 'cinema-kungfu':r.weapon==='bare-hand'&&r.hits>=100&&r.fed&&r.blessed,
 })[id]??false;}
export function cinemaDecorArt(id){const item=CINEMA_DECOR.find(d=>d.id===id);if(!item)return '';const colours=['#f6bd92','#b7dac6','#cbbfe9','#f6d98b'];return `<g stroke="#65516a" stroke-width="3" stroke-linejoin="round"><path d="M16 32Q60 9 104 32v62q-44 24-88 0Z" fill="${colours[item.cinemaIndex%4]}"/><path d="m13 32 47-17 47 17-47 15Z" fill="#ffe4a3"/><text x="60" y="81" text-anchor="middle" font-size="44" stroke="none">${item.icon}</text><path d="m24 95 7 2m58-2 7-2M47 101q13 8 26-1" fill="none" stroke-linecap="round"/><path d="m94 11 4 10 11 2-10 5-2 10-5-9-10-3 9-5Z" fill="#fff3bb"/></g>`;}
