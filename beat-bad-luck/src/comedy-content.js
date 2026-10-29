import {finisherScene} from './finisher-scenes.js';
// Original flyover slapstick: short callbacks, never private worry text.
export const ULTIMATE_DURATION=10000,ULTIMATE_LIMIT=Infinity,ULTIMATE_CHARGE=128,ULTIMATE_MULTIPLIER=3;
export const NICE_AT=1350,NICE_WINDOW=220;
const families=['palm','blade','spin','hammer','stamp','suction','sun','beauty','gadget','hound'];
const groups=['requirement','stocks','people','everyday'];
const groupFor=kind=>['work','work-life','ai-tokens'].includes(kind)?'requirement':kind==='stocks'||kind==='marksix'?'stocks':['teammates','kam-friends','family','love'].includes(kind)?'people':'everyday';
export function ultimateFamily(id){if(id==='beauty-fist')return 'beauty';if(id==='solar-torch')return 'sun';if(id==='plunger-nunchucks')return 'suction';if(id.includes('3000'))return 'gadget';if(id==='lassie')return 'hound';if(/stamp|token|seal|rebirth|marksix|triple/.test(id))return 'stamp';if(/knife|dagger|sword|spear|blade/.test(id))return 'blade';if(/wheel|pinwheel|nunchuck|record|whirl/.test(id))return 'spin';if(/hammer|mace|stool|spanner/.test(id))return 'hammer';return 'palm';}
const shows={
 palm:{name:['雙掌準時收工','Clock-off double palm'],prop:'🩴',setup:['雙拖就位，今日唔接 OT！','Slippers ready. Overtime denied!'],payoff:['啪！小人變咗夾心餅！','SLAP! A gremlin sandwich!']},
 blade:{name:['三紙串燒收工刀','Triple-paper clock-off blade'],prop:'✦',setup:['三張最後修改版，一齊排隊！','Three final revisions, form a queue!'],payoff:['一刀串晒，最後一次都冇用！','All skewered. Final-final means nothing!']},
 spin:{name:['無敵轉走內耗輪','Spin away the stewing'],prop:'🌀',setup:['風火輪開車，衰氣請落車！','The wheel is leaving. Bad vibes, get off!'],payoff:['轉到小人自己打卡收工！','Spun straight through the clock-off gate!']},
 hammer:{name:['一鎚落班大法','One mighty clock-off bonk'],prop:'💥',setup:['師傅話輕輕，隻鎚聽咗做勁勁！','Master said gentle. Hammer heard monumental!'],payoff:['小人扁到可以當書籤！','Flat enough to bookmark your day!']},
 stamp:{name:['今日唔批終極印','Ultimate application-denied seal'],prop:'印',setup:['小人舉牌上訴，師傅拎出個印。','Gremlin appeals. Master reaches for the stamp.'],payoff:['今日唔批！覆核都唔批！','DENIED! Appeal denied too!']},
 suction:{name:['吸實左右彈走','Suction slingshot'],prop:'🪠',setup:['吸到實一實，小人仲想扮路過？','Stuck fast. Still pretending to pass by?'],payoff:['啵！連件衰運都彈出片場！','POP! Bad luck launched off the set!']},
 sun:{name:['借個光照走歪理','Borrow-a-sunbeam beam'],prop:'☀',setup:['曬到光先威，陰天先尷尬兩下。','Sunshine first. Two awkward cloudy blinks.'],payoff:['曝光！小人啲藉口透明晒！','EXPOSED! Every excuse is see-through!']},
 beauty:{name:['還原靚靚唔肯散場','Too gorgeous to leave'],prop:'🪞',setup:['五拳化妝，連紙紋都當輪廓線！','Five makeup punches. Creases are contouring!'],payoff:['我靚到唔想落班！再照多陣！','Too gorgeous to leave! One more mirror moment!']},
 gadget:{name:['攞你命3000・膠梳投降式','3000 tools, one plastic comb'],prop:'梳',setup:['十二件工具展開！場面要夠大！','Twelve tools unfold! Maximum spectacle!'],payoff:['最後只得把膠梳？小人竟然自己投降！','Just a plastic comb? The gremlin surrenders anyway!']},
 hound:{name:['神犬叼走心塞','Fetch the fuss'],prop:'🐾',setup:['神犬拉茜出場，小人扮波波！','Lassie arrives. Gremlin pretends to be a ball!'],payoff:['好狗唔返工，衰運叼走唔使送！','Good dogs don’t do overtime. Bad luck fetched!']}
};
export function ultimateShow(id,kind='work'){const family=ultimateFamily(id),s=shows[family];return {...s,...finisherScene(id),family,ending:comedyEnding(id,kind)};}
const endings={
 requirement:['最後修改版已被封箱，膠紙寫住「聽朝先」。','The final revision is boxed up, labelled “tomorrow”.'],
 stocks:['股價仲有上落，你個心可以先落班。','Markets still wobble. Your heart can clock off.'],
 people:['小人改口話自己係臨時演員，師傅照樣請佢收工。','The gremlin claims it’s an extra. Master wraps its scene anyway.'],
 everyday:['衰運搭錯尾班車，今晚終於唔跟你返屋企。','Bad luck caught the wrong last bus. It won’t follow you home.']
};
export const ENDINGS=families.flatMap(family=>groups.map(group=>({id:`${family}:${group}`,name:shows[family].name,quote:[`${shows[family].payoff[0]} ${endings[group][0]}`,`${shows[family].payoff[1]} ${endings[group][1]}`]})));
export function comedyEnding(weapon,kind){return ENDINGS.find(e=>e.id===`${ultimateFamily(weapon)}:${groupFor(kind)}`);}
export const PAPER_ACTS={
 'blame-magistrate':[['本官冇錯，係張紙自己填錯！','Not my fault. The paper filled itself in!'],['我願意撤回……頭先嗰句都撤回！','I withdraw my statement… and that withdrawal!'],['官帽跌咗，甩鍋官改做執鍋官。','Hat gone. The blame magistrate now washes the pans.']],
 'fake-master':[['我識晒，只係未諗到點做！','I know everything. Just not how to do it!'],['師傅饒命！條假鬚係借返嚟！','Mercy! The mighty beard is borrowed!'],['高人變矮凳，鬍鬚自己提出離職。','The grand master becomes a footstool. His beard resigns.']],
 'unready-extra':[['我 ready！等我搵返份劇本先。','Ready! Just let me find the script.'],['可唔可以再排練一次投降？','Could I rehearse that surrender once more?'],['終於準備好，原來已經殺青。','Finally ready. Turns out the shoot is over.']]
};

export const RITUAL_CHANTS=['打你個小人頭，等你有氣都冇碇唞','打你個小人面，等你有面都冇處見','打你個小人眼，等你有眼睇唔見','打你個小人手，等你成世冇出頭','打你個小人腳，等你好人當賊辦，無鞋挽屐走','打你個小人心，等你好心變成歹心'];
export function createChantPicker(random=Math.random){let bag=[],last='';return ()=>{if(!bag.length){bag=[...RITUAL_CHANTS];for(let i=bag.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}if(bag[0]===last)[bag[0],bag[1]]=[bag[1],bag[0]];}last=bag.shift();return last;};}
