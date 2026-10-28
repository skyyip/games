export function comicLuckyGlyph(){return '<svg class="comic-lucky-glyph" viewBox="0 0 160 150" aria-hidden="true" focusable="false"><path d="m21 58-15-8m14 29L4 87m135-29 15-8m-14 29 16 8" stroke="#ffd76f" stroke-width="6" stroke-linecap="round"/><rect x="24" y="9" width="112" height="125" rx="28" fill="#bd414c" stroke="#ffde87" stroke-width="5"/><path d="m36 31 9-9m72 91-9 9" stroke="#fff1b7" stroke-width="5" stroke-linecap="round"/><text x="80" y="104" text-anchor="middle" font-family="Iansui,system-ui,sans-serif" font-weight="900" font-size="95" stroke="#714341" stroke-width="1.5" paint-order="stroke" fill="#fff0ac">吉</text><circle cx="64" cy="112" r="3" fill="#693e43"/><circle cx="96" cy="112" r="3" fill="#693e43"/><path d="M73 118q7 8 14 0" fill="none" stroke="#693e43" stroke-width="3" stroke-linecap="round"/><ellipse cx="48" cy="115" rx="8" ry="4" fill="#f89997"/><ellipse cx="112" cy="115" rx="8" ry="4" fill="#f89997"/><path d="m120 3 3 7 8 2-8 3-3 7-2-7-8-3 8-2Z" fill="#fff1af"/></svg>';}
export function recordMedal(rank){const palette=[['#ffe58c','#aa722e'],['#e1eef4','#728997'],['#edb486','#996243']][rank-1];return `<svg viewBox="0 0 54 64" aria-hidden="true" focusable="false"><path d="m13 30-5 30 17-10 13 10 2-31" fill="${palette[1]}"/><circle cx="27" cy="25" r="22" fill="${palette[0]}" stroke="${palette[1]}" stroke-width="3"/><circle cx="27" cy="25" r="16" fill="none" stroke="${palette[1]}" stroke-width="1.5"/><path d="m12 17 4-5 8-3" fill="none" stroke="#fff9d9" stroke-width="3" stroke-linecap="round"/><text x="27" y="33" text-anchor="middle" font-family="system-ui,sans-serif" font-size="23" font-weight="900" fill="#5a4940">${rank}</text></svg>`;}

const patronLooks={
 waiter:['#78b8b0','#594d54','cap','mug'],driver:['#8fa6c4','#665461','cap','bus'],neighbour:['#d697a8','#66514a','bun','umbrella'],
 'bun-aunt':['#9ebd8a','#75685c','bun','lollipop'],sweeper:['#b79ac5','#d2d3d0','scarf','broom'],'fish-chef':['#72b3bc','#5b5562','chef','fish'],
 landlady:['#dd9f7d','#756478','rollers','megaphone'],scholar:['#9cc7a0','#655465','cap','brush'],director:['#8aa5bd','#6b505b','beret','clapper'],
 'star-master':['#c29dca','#d6d1b3','crown','star'],'extra-king':['#8fb99d','#6d5350','beret','hat'],
 'tram-tinkerer':['#70b5b4','#d4c6a9','cap','spanner'],'tofu-granny':['#ce9eb2','#e1d8ce','bun','bowl'],
 'delivery-hero':['#e6c768','#5b5763','hood','scooter'],'laundry-aunt':['#8aafd1','#64535a','scarf','basket'],
 'dim-sum-ref':['#c59272','#57545c','visor','whistle'],'night-nurse':['#a2c9b8','#6b5371','nurse','bandage'],
 'rooftop-gardener':['#9cb96c','#a8aba2','straw','melon'],'lantern-dragon':['#d38b94','#64576d','crown','lantern'],
 "golden-foot-ming":["#e7bc73", "#665247", "headband", "football"],
 "da-wen-see":["#a6c8d0", "#d8d5bf", "goggles", "torch"],
 "ghost-coach":["#b3b998", "#b6ad9e", "scarf", "crutch"],
 "agent-butcher":["#f0a6ae", "#4f5360", "cap", "cleaver"],
 "beggar-so":["#a4b78c", "#6e5c56", "straw", "gourd"],
 "autumn-fragrance":["#e8a3bf", "#64505e", "flower", "fan"],
 "agent-fat":["#8bc7bd", "#65566e", "spring", "invention"],
 "justice-bao":["#c49aca", "#585163", "official", "gavel"],
 "god-of-cooking":["#d78f7d", "#5d505b", "chef", "rice"],
 "little-treasure":["#dfbd70", "#5b5668", "crown", "abacus"],
 "kungfu-sing":["#e3cf9f", "#5f5058", "headband", "palm"],
 "tai-chi-landlord":["#a8bcd1", "#66615b", "cap", "taichi"]
};
const patronProps={
 mug:'<path d="M6 9h21v22q-10 8-21 0Z" fill="#fff0c8"/><path d="M27 13q16-2 10 11l-10 1M9 2l2-5m7 5 2-5" fill="none"/>',
 bus:'<rect x="1" y="7" width="35" height="25" rx="8" fill="#acd8ad"/><path d="M4 13h28v10H4Z" fill="#fff1cd"/><circle cx="9" cy="33" r="4" fill="#675a65"/><circle cx="28" cy="33" r="4" fill="#675a65"/>',
 umbrella:'<path d="M0 17q17-28 35 0l-9-3-8 4-9-4Z" fill="#f0c579"/><path d="M18 16v22q-8 7-10-2" fill="none"/>',
 lollipop:'<path d="m18 18 2 24" stroke-width="5"/><circle cx="17" cy="13" r="14" fill="#f0a8b7"/><path d="M11 8q18-6 13 9-5 9-13 0-5-7 6-7" fill="none" stroke="#fff0c7"/>',
 broom:'<path d="m25-5-9 29" stroke-width="6"/><path d="m8 20 17 4 1 17-26-8Z" fill="#e6c586"/><path d="m11 26-4 9m11-7-2 10" fill="none"/>',
 fish:'<path d="M1 22q15-24 28-2l10-9v24l-11-8Q9 41 1 22Z" fill="#9cc8cf"/><circle cx="10" cy="20" r="2" fill="#4d5261"/><path d="m16 18 3 5-4 7" fill="none"/>',
 megaphone:'<path d="m2 14 29-10v27L2 22Zm9 11 5 14h8l-3-16" fill="#ebc57e"/><path d="m36 10 6-3m-6 13 7 1" fill="none"/>',
 brush:'<path d="m28-4-16 29" stroke="#c69b6b" stroke-width="7"/><path d="M12 19q-17 1-10 21 15 0 17-15Z" fill="#615365"/>',
 clapper:'<rect x="1" y="12" width="34" height="26" rx="4" fill="#8bbcb1"/><path d="m0 9 32-13 4 9L4 18Z" fill="#fff0c9"/><path d="m8 4 8 7m5-12 8 7M7 25h21" fill="none"/>',
 star:'<path d="m18-1 6 12 14 2-10 10 2 14-12-7-13 7 3-14-10-10 14-2Z" fill="#ffdd81"/>',
 hat:'<path d="M3 27q1-25 16-23 13 2 13 23m-32 1h38" fill="#c79fc6"/><path d="M8 23h21" stroke="#fff0c9" stroke-width="5"/>',
 spanner:'<path d="m10 22 17-18 7 1 2 10-17 17-8 9-8-7Z" fill="#aec6cc"/><path d="m23 2 4 10 10-1" fill="none"/>',
 bowl:'<path d="M0 15h38q-1 25-19 25T0 15Z" fill="#a8d7ce"/><ellipse cx="19" cy="14" rx="18" ry="6" fill="#fff2d6"/><path d="m10 11 8-3 10 3" fill="none"/>',
 scooter:'<path d="m5 28 11-2 5-16h10l4 19H5Z" fill="#e999a7"/><path d="M23 7V0h10" fill="none"/><circle cx="9" cy="32" r="6" fill="#725d68"/><circle cx="32" cy="32" r="6" fill="#725d68"/>',
 basket:'<path d="m2 14 5 25h27l4-25Z" fill="#cda080"/><path d="M8 13q10-24 24 0M10 19v14m9-14v14m9-14v14" fill="none"/><path d="m9 7 8-3 3 15-8 1Zm16-1 8 3-4 13-9-2Z" fill="#b5d5bf"/>',
 whistle:'<path d="M4 14q10-10 20 0l10-3v11H21q-10 17-19 3Z" fill="#f0cf75"/><circle cx="12" cy="22" r="4" fill="#d68f9d"/><path d="m27 2 2-8m8 11 7-3" fill="none"/>',
 bandage:'<rect x="2" y="1" width="34" height="40" rx="9" fill="#fff1d2"/><rect x="9" y="10" width="20" height="20" rx="5" fill="#e5b3a5"/><path d="M19 13v13m-6-6h13" stroke="#fff6df" stroke-width="4"/>',
 melon:'<ellipse cx="20" cy="24" rx="17" ry="19" fill="#accd89"/><path d="M20 5V0l7-4M12 9q-8 18 0 29m15-29q8 18 0 29" fill="none"/><path d="m10 18 3-2m13 0 3 2m-13 9q4 5 8 0" fill="none"/>',
 lantern:'<path d="M19 0v7m0 30v9" stroke="#e9bf6e" stroke-width="4"/><rect x="1" y="7" width="36" height="30" rx="12" fill="#eaa19d"/><path d="M13 8q-8 15 0 28m13-28q8 15 0 28M5 22h28" fill="none" stroke="#ffe0a2"/>',
 "football":"<circle cx=\"18\" cy=\"20\" r=\"17\" fill=\"#fff3d5\"/><path d=\"m18 9 8 6-3 10H12L9 15Z\" fill=\"#647082\"/><path d=\"m3 13 6 2m17 0 7-4M12 25l-6 7m17-7 7 7M18 9V3\" fill=\"none\"/>",
 "torch":"<path d=\"m10 11 18 2-3 28-12-1Z\" fill=\"#f2c96e\"/><ellipse cx=\"19\" cy=\"10\" rx=\"14\" ry=\"8\" fill=\"#c2e3dc\"/><path d=\"m5 1-5-5m32 8 6-4M19-2v-6\" fill=\"none\" stroke=\"#f7ce70\"/><path d=\"m15 23 3 3 6-5\" fill=\"none\"/>",
 "crutch":"<path d=\"m6 0 28 7m-22-4 4 18 12-15M16 21l-6 20m4-27 13 3\" fill=\"none\" stroke=\"#c79f6c\" stroke-width=\"5\"/><path d=\"M4 39h12\" stroke=\"#826e85\" stroke-width=\"5\"/>",
 "cleaver":"<path d=\"m5 24 1-24h30v25Z\" fill=\"#d0e3db\"/><path d=\"m6 25 8 0v15H5Z\" fill=\"#c39375\"/><path d=\"m13 12 3-1m10 0 3 1m-13 5q5 6 10 0\" fill=\"none\"/><circle cx=\"30\" cy=\"5\" r=\"2\" fill=\"#7ba7a0\"/>",
 "gourd":"<path d=\"M12 1h13v8q17 8 4 15 20 20-9 20S-7 24 8 24Q-2 15 12 9Z\" fill=\"#e9c884\"/><path d=\"m6 24 25-1m-17 8 3-1m6 0 3 1\" fill=\"none\"/><path d=\"M15 1h8\" stroke=\"#91b9ac\" stroke-width=\"6\"/>",
 "fan":"<path d=\"M19 29 0 8Q19-10 38 8Z\" fill=\"#f2b7c9\"/><path d=\"M19 29V8m0 21L8 5m11 24L29 4m-10 26v12\" fill=\"none\"/><circle cx=\"19\" cy=\"10\" r=\"5\" fill=\"#fff1bd\"/>",
 "invention":"<path d=\"M2 20h34v18H2Z\" fill=\"#c5a4d3\"/><path d=\"m9 20-4-6 8-5-4-6 8-5m10 21 6-7-8-4 5-5\" fill=\"none\"/><circle cx=\"11\" cy=\"29\" r=\"3\" fill=\"#f2d98b\"/><circle cx=\"27\" cy=\"29\" r=\"3\" fill=\"#a8d7cb\"/>",
 "taichi":"<circle cx=\"19\" cy=\"19\" r=\"18\" fill=\"#fff2d7\"/><path d=\"M19 1c-24 0-24 36 0 36 12 0 12-18 0-18S7 1 19 1Z\" fill=\"#68717c\" stroke=\"none\"/><circle cx=\"19\" cy=\"10\" r=\"3\" fill=\"#fff2d7\"/><circle cx=\"19\" cy=\"28\" r=\"3\" fill=\"#68717c\"/>",
 "gavel":"<path d=\"m25 14-14 25\" stroke=\"#ba846a\" stroke-width=\"6\"/><path d=\"m8 5 8-8 21 17-8 9Z\" fill=\"#d5a878\"/><path d=\"m5 38 28-1 4 7H1Z\" fill=\"#b99075\"/><path d=\"m2 0-5-3m38 5 5-1\" fill=\"none\" stroke=\"#f4d386\"/>",
 "rice":"<path d=\"M0 18h38q-2 23-19 23T0 18Z\" fill=\"#e99fa9\"/><path d=\"M2 17q0-18 13-15 7-8 15 3 8-1 7 12Z\" fill=\"#fff5d4\"/><ellipse cx=\"20\" cy=\"12\" rx=\"10\" ry=\"7\" fill=\"#ffe9b5\"/><circle cx=\"20\" cy=\"12\" r=\"4\" fill=\"#efc65e\"/><path d=\"m10 24 4-1m10 0 4 1m-13 7q4 5 8 0\" fill=\"none\"/>",
 "abacus":"<rect x=\"0\" y=\"1\" width=\"37\" height=\"38\" rx=\"4\" fill=\"#d7ad78\"/><path d=\"M5 12h27M5 23h27m-19-18v29m12-29v29\" fill=\"none\"/><path d=\"M9 8h8m4 10h8M9 28h8\" stroke=\"#f6df91\" stroke-width=\"6\"/>",
 "palm":"<path d=\"m9 24-7-9q-2-6 4-4l5 5L9 0q1-6 5-2l3 16 1-20q3-5 6 0v20l3-16q4-3 6 2l-3 18 3-9q5-3 6 2l-5 21q-10 19-21 5Z\" fill=\"#ffd7a8\"/><path d=\"M18 25q12-7 12 3-2 8-9 4-5-3 1-5\" fill=\"none\" stroke=\"#d19ba4\"/>"
};
export function patronArt(id){
 const [coat,hair,hat,prop]=patronLooks[id]??patronLooks.waiter,elder=['tofu-granny','sweeper','rooftop-gardener','ghost-coach'].includes(id);
 const movieHats={official:'<path d="M26 30 8 23 6 31l23 8m53-9 23-7 2 8-24 8M30 34V12q25-15 49 0v22Z" fill="#b790c3"/><circle cx="55" cy="19" r="7" fill="#ffe3a0"/>',headband:'<path d="M24 34Q55 12 88 34l-3 8Q55 22 26 43Z" fill="#f0bb88"/><path d="m81 30 17-9-2 11 10 7-22 1" fill="#f0bb88"/>',goggles:'<path d="M24 26h63" stroke="#a3bdc6" stroke-width="9"/><rect x="30" y="13" width="21" height="18" rx="6" fill="#ccece0"/><rect x="59" y="13" width="21" height="18" rx="6" fill="#ccece0"/>',spring:'<path d="M29 32Q25 13 55 12t29 20Z" fill="#86b9af"/><path d="M55 13l-7-4 14-4-8-4" fill="none"/><circle cx="54" cy="2" r="3" fill="#ffe0a0"/>',flower:'<circle cx="29" cy="24" r="14" fill="#eec5ce"/><path d="M22 13q12-10 13 2 14-3 10 8-1 11-12 6-9 12-14 1-12-1-6-11Z" fill="#ef9faf"/><circle cx="28" cy="22" r="6" fill="#ffe6a0"/>'};
 const headwear=movieHats[hat]??(hat==='bun'?`<circle cx="37" cy="25" r="12" fill="${hair}"/><circle cx="76" cy="24" r="12" fill="${hair}"/>`:hat==='chef'?'<path d="M33 35V23q-15-16 2-18 9-12 20-3 17-9 24 6 14 3 5 19v8Z" fill="#fff4da"/>':hat==='hood'?`<path d="M24 58Q9 4 55 5t33 54Z" fill="${coat}"/>`:hat==='crown'?'<path d="m30 30-6-20 18 8L55 0l11 18 20-6-9 21Z" fill="#f3d37e"/>':hat==='nurse'?'<path d="m31 35-5-21q29-13 57 0l-7 21Z" fill="#f2f1d8"/><path d="M55 14v14m-7-7h14" stroke="#ce7d93" stroke-width="4"/>':hat==='rollers'?`<g fill="${hair}"><circle cx="32" cy="30" r="10"/><circle cx="45" cy="20" r="11"/><circle cx="63" cy="20" r="11"/><circle cx="78" cy="31" r="10"/></g>`:hat==='scarf'?`<path d="M23 44Q14 5 54 9t33 35l-15-9H35Z" fill="${coat}"/><path d="m78 35 17 6-8 16-12-16" fill="${coat}"/>`:hat==='straw'?'<path d="M27 31q2-29 29-26t27 26m-68 5q41-12 82 0" fill="#ead298" stroke-width="6"/>':`<path d="M27 31Q25 6 55 7t30 24Z" fill="${coat}"/><path d="M24 33h65" stroke="#f2d89e" stroke-width="6"/>`);
 return `<svg class="patron-portrait" data-patron="${Object.hasOwn(patronLooks,id)?id:'waiter'}" viewBox="0 0 120 140" aria-hidden="true" focusable="false">
  <ellipse cx="59" cy="132" rx="37" ry="5" fill="#3c65542b"/>
  <g stroke="#655365" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
   <path d="m40 120-7 11h20l3-12m12 0 3 12h19l-9-12" fill="#e7c77f"/>
   <path d="M32 81q-9 20-5 41 30 10 58 0 7-24-9-41Z" fill="${coat}"/>
   <path d="m42 83 14 12 15-12M56 96v24" fill="none" stroke="#fff0c7"/>
   <g class="patron-wave"><path d="m32 86-17-12-6 12 20 14" fill="${coat}"/><path d="M15 76 8 63q-5-4-5 1l2 9q-10-6-4 5l8 9Z" fill="#ffe5c7"/></g>
   ${headwear}
   <ellipse cx="56" cy="55" rx="32" ry="30" fill="#ffe4c5"/>
   <path d="M25 42q4-23 30-18t33 18l-12-9-12 4-9-8-11 9-8-5Z" fill="${hair}" stroke="none"/>
   ${elder?'<path d="M31 49h17v14H31Zm31 0h18v14H62Zm-14 5h14" fill="#ffffff44"/>':''}
   <path d="m34 54 4-3 5 3m24 0 5-3 5 3" fill="none" stroke-width="3"/>
   <path d="M44 67q12 4 24-1-2 18-13 17-10-1-11-16Z" fill="#a86379"/>
   <path d="M48 69h14" stroke="#fff8e4" stroke-width="4"/><path d="M50 79q5-7 10 0" fill="#f4a8b7" stroke="none"/>
   <ellipse cx="31" cy="65" rx="7" ry="4" fill="#eea4b0" stroke="none"/><ellipse cx="81" cy="65" rx="7" ry="4" fill="#eea4b0" stroke="none"/>
   <circle cx="56" cy="105" r="3" fill="#ffdd8f"/>
   <g class="patron-prop" transform="translate(77 86) rotate(-8)">${patronProps[prop]}</g>
  </g><path d="m105 35 2 5 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#e7cb79"/>
 </svg>`;
}
export function comicRewardArt(kind='trophy'){
 const shells={
  trophy:'<path d="M32 29Q5 16 15 48q4 12 23 9m50-28q27-13 17 19-4 12-23 9" fill="#efc164"/><path d="M31 25q29-9 58 0l-4 33q-5 27-25 29-24-4-26-29Z" fill="#ffda81"/><path d="m49 84-3 14h29l-4-14" fill="#e8b56b"/><rect x="32" y="98" width="58" height="20" rx="8" fill="#9fcbbb"/>',
  commission:'<path d="M31 18h57v95l-10-6-9 7-10-7-10 7-10-7-8 6Z" fill="#fff0c8"/><path d="m27 21 56-15 5 15-57 14Z" fill="#9ac8b5"/><path d="m38 20 10 9m8-14 10 9m8-14 9 9" fill="none" stroke="#fff2cb" stroke-width="5"/><path d="M42 92h34m-34 7h20" fill="none" stroke="#cf9c78"/>',
  title:'<path d="m38 75-8 46 27-14 17 16 11-50" fill="#edacb8"/><path d="m60 13 12 12 17 2 4 18 10 14-11 13-4 17-18 1-13 11-14-12-17-3-3-17-10-15 13-13 4-17 18-1Z" fill="#ffdb83"/><circle cx="59" cy="56" r="31" fill="#b3d6c3"/>',
  ending:'<path d="m28 48 10 69h48l10-69Z" fill="#efa5ac"/><path d="m41 50 6 63m13-63v63m18-63-4 63" fill="none" stroke="#fff0cc" stroke-width="9"/><g fill="#fff0c8"><circle cx="36" cy="39" r="15"/><circle cx="56" cy="29" r="17"/><circle cx="79" cy="33" r="17"/><circle cx="94" cy="44" r="12"/></g>',
  gift:'<rect x="25" y="42" width="70" height="72" rx="10" fill="#abd4bd"/><path d="M20 34h80v22H20Z" fill="#f0b4a1"/><path d="M53 34h16v80H53Z" fill="#ffe09a"/><path d="M61 33Q26 29 38 12q14-9 23 21 21-31 31-15 3 15-31 15Z" fill="#f4cf83"/>'
 };
 return `<svg class="reward-mascot reward-${Object.hasOwn(shells,kind)?kind:'trophy'}" viewBox="0 0 120 136" aria-hidden="true" focusable="false"><ellipse cx="61" cy="128" rx="35" ry="5" fill="#3d5d4b29"/><g stroke="#775565" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">${shells[kind]??shells.trophy}<path d="m28 78-14 4m78-4 14 4" fill="none"/><path d="m14 80-5-7-3 6-5 1 7 8 8-3m90-5 5-7 3 6 5 1-7 8-8-3" fill="#fff1d3"/><path d="m43 117-6 8h13m27-8 7 8H71" fill="none" stroke="#6e9a87" stroke-width="5"/><path d="m41 55 5-4 5 4" fill="none" stroke-width="3"/><ellipse cx="75" cy="54" rx="5" ry="7" fill="#5c465a" stroke="none"/><circle cx="73" cy="52" r="2" fill="#fff9df" stroke="none"/><ellipse cx="35" cy="67" rx="7" ry="4" fill="#e894a8" stroke="none"/><ellipse cx="87" cy="67" rx="7" ry="4" fill="#e894a8" stroke="none"/><path d="M49 66q13 5 24-1-2 24-13 23-10-1-11-22Z" fill="#a76780"/><path d="M53 68h14" stroke="#fff6db" stroke-width="5"/><path d="M55 82q6-8 12 0" fill="#f3a5b9" stroke="none"/></g><path d="m14 26 3 7 8 2-8 3-3 8-3-8-8-3 8-2Zm87 73 2 5 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="#efc870"/></svg>`;
}
