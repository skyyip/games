// Original neighbourhood comic props. Stable IDs survive saves, gifts and restores.
export const STREET_SKINS=[
 ['deadline-jelly','死線啫喱怪','Deadline jelly',1380,'#b9d5eb','jelly',1.85,'死線彈嚟彈去，今日拍到佢準時落地。','A wobbling deadline finally learns to land on time.'],
 ['ai-pigeon','AI亂答鴿','Hallucinating pigeon',1980,'#c5b8df','pigeon',2.05,'答非所問仲好自信，拍兩下先識講唔知道。','Very confident, very wrong. Two whacks teach it to say I do not know.'],
 ['meeting-octopus','開會八爪魚','Meeting octopus',2680,'#eda9b8','octopus',2.25,'八隻手開八個會，原來冇一隻手做緊嘢。','Eight arms, eight meetings, and absolutely no work done.'],
 ['parcel-void','失蹤包裹精','Missing parcel sprite',3480,'#e0bd86','parcel',2.45,'顯示已送達，原來送咗去隔籬宇宙。','Marked delivered. Unfortunately, to the next universe.']
].map(([id,nameZh,name,cost,color,shape,multiplier,description,descriptionEn])=>({id,nameZh,name,cost,color,shape,multiplier,description,descriptionEn,merit:0,series:'street-comedy'}));
export const STREET_WEAPONS=[
 ['clockoff-stamp','準時收工印','Clock-off stamp',640,0,4.7,220,'一印落去，所有「最後改少少」即刻結案。','One stamp closes every last tiny revision.'],
 ['mute-bell','群組靜音鈴','Group-chat mute bell',1280,200,5.2,430,'搖一搖，九十九個未讀一齊放假。','One ring sends ninety-nine notifications on holiday.'],
 ['noodle-lasso','車仔麵套索','Noodle lasso',2380,600,5.8,330,'一碗兜住所有藉口，記得唔好加辣。','A bowl catches every excuse. Hold the chilli.'],
 ['weekend-umbrella','週末結界遮','Weekend shield umbrella',3980,1200,6.5,510,'開遮擋住星期六朝早嗰封急件。','Shields your Saturday morning from urgent emails.']
].map(([id,nameZh,name,cost,merit,multiplier,tone,description,descriptionEn])=>({id,nameZh,name,cost,merit,multiplier,tone,description,descriptionEn,series:'street-comedy'}));
export const STREET_SECRET_KITS=[
 ['secret-mute-conch','已讀不回海螺','Read-receipt conch','🐚','聽海聲唔聽催單聲，連海鷗都準時收工。'],
 ['secret-break-clock','無限茶歇陀錶','Endless tea-break watch','🕰️','秒針行兩步就飲茶，老細追唔切。']
];
export const STREET_SECRET_DECOR=[
 ['secret-cloud-sofa','放空雲朵梳化','Daydream cloud sofa','☁️','煩惱坐低五分鐘，瞓醒唔記得嚟做乜。'],
 ['secret-bun-moon','菠蘿包月亮燈','Pineapple-bun moon lamp','🥐','今晚月光有牛油香，照亮你條收工路。']
];
export const STREET_PATRONS=[
 ['night-baker','凌晨出爐麵包叔','Midnight baker','🥖',1,.02,.01,0,'佢送你一個熱麵包，話人生唔使日日焗住做。','A warm bun and a reminder: you do not have to feel under pressure every day.'],
 ['library-catkeeper','圖書館養貓姐姐','Library cat keeper','📚',2,.02,.02,.05,'貓坐住你份OT文件，姐姐話：呢本書今日唔外借。','Her cat sits on the overtime file. That volume is not available for loan.'],
 ['ferry-captain','慢慢嚟渡輪船長','Take-it-easy ferry captain','⛴️',3,.03,.02,.08,'船長接走你一袋心事，下一班只載好消息。','The captain ferries away your worries. The next sailing carries good news.'],
 ['repair-granny','萬能修心婆婆','Fix-a-heart granny','🧵',4,.04,.03,.12,'婆婆幫你縫返個笑口，收費係今晚早啲瞓。','She stitches your smile back on. Payment: an early night.']
];
export const STREET_PATRON_LOOKS={
 'night-baker':['#e1b58c','#66524e','chef','bowl'],
 'library-catkeeper':['#acb9d8','#61556d','beret','brush'],
 'ferry-captain':['#91c5ce','#d6d2bf','cap','bus'],
 'repair-granny':['#c8abc8','#ded5c9','bun','basket']
};
export function streetCostume(id){return {
 'deadline-jelly':'<path d="M29 50q4-40 40-39 38-1 43 39l-12-6-10 6-11-6-12 6-13-6-12 6Z" fill="#90b6db"/><circle cx="70" cy="28" r="12" fill="#fff4ca"/><path d="M70 19v9l6 4" stroke="#675579" stroke-width="3" fill="none"/>',
 'ai-pigeon':'<path d="m33 42 10-19 14 16m27 0 17-17 7 21" fill="#98c6c5"/><path d="m58 73 12-9 13 9-13 10Z" fill="#e4b56f"/><path d="M40 100h60v26H40Z" fill="#637c96"/><text x="70" y="120" text-anchor="middle" fill="#fff4c9" font-size="18">AI?</text>',
 'meeting-octopus':'<path d="M40 111q-34 5-27 23t29-3m58-20q34 5 27 23t-29-3M48 125q-19 30-29 16m73-16q19 30 29 16" fill="#eda9b8"/><path d="M47 25h48v15H47Z" fill="#9b789d"/><path d="m58 23 6-10 9 10" fill="#f1d893"/>',
 'parcel-void':'<path d="m28 50 6-31h71l8 31-43-14Z" fill="#d5a169"/><path d="M37 105h65v28H37Z" fill="#b88857"/><path d="M67 105v28" stroke="#f4db9c" stroke-width="7"/><text x="70" y="28" text-anchor="middle" font-size="12" fill="#6a514d">404</text>'
}[id]??'';}
export function streetWeaponArt(id){
 const face='<path d="m48 53 5 2m14 0 5-2m-18 12q6 6 12 0" fill="none" stroke="#65534f" stroke-width="3" stroke-linecap="round"/>';
 return {
 'clockoff-stamp':'<path d="M46 15h28v37H46Z" fill="#b37b75"/><rect x="27" y="46" width="66" height="42" rx="8" fill="#d49b76" stroke="#68554a" stroke-width="3"/><path d="M21 88h78v14H21Z" fill="#8e6364"/>'+face,
 'mute-bell':'<path d="M25 78q12-10 11-32 0-33 24-33t24 33q-1 22 11 32Z" fill="#efd086" stroke="#80644d" stroke-width="3"/><path d="M48 80q12 28 24 0M60 94v19" fill="#c2a26b" stroke="#80644d" stroke-width="3"/>'+face,
 'noodle-lasso':'<ellipse cx="60" cy="40" rx="39" ry="26" fill="none" stroke="#ecc882" stroke-width="7"/><path d="M27 44q-12 50 39 42l23-12M24 75q36 55 72 0Z" fill="#9bc8c0" stroke="#617b78" stroke-width="3"/><path d="m73 26 21-23m-13 28 24-20" stroke="#b8906d" stroke-width="4"/>'+face,
 'weekend-umbrella':'<path d="M12 59q48-83 96 0l-16-6-16 6-16-6-16 6-16-6Z" fill="#b3a4d1" stroke="#6f647e" stroke-width="3"/><path d="M60 22v73q0 23 18 13" fill="none" stroke="#cba977" stroke-width="6" stroke-linecap="round"/>'+face
 }[id]??'';
}
