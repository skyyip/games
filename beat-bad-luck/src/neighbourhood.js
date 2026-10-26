// Local-only stories, cosmetics and postcard keepsakes. No custom worry text is saved.
export const STORIES=[
 {id:'bus',name:['準時收工小巴線','The home-on-time minibus'],icon:'🚐',gift:['準時收工路牌','Home-on-time bus stop'],chapters:[
  {kind:'commute',name:['最後一班車，等埋我！','Wait for me, last bus!'],text:['幫司機打走延誤怪：命中 8 次。','Help the driver with 8 whacks.'],goal:'hits',need:8},
  {kind:'commute',name:['唔好再塞喺路口','No more junction jams'],text:['用重扣清走路障，擊中弱點 3 次。','Heavy-whack the delay monster’s weakness 3 times.'],goal:'weaknessHits',need:3},
  {kind:'commute',name:['今晚有熱湯飲','Home before the soup gets cold'],text:['成功處理 1 次橋底突發事件。','Successfully handle one flyover event.'],goal:'eventsWon',need:1}]},
 {id:'cafe',name:['伙記的超複雜落單','The waiter’s impossible order'],icon:'☕',gift:['零漏單茶餐廳餐牌','The no-missing-orders menu'],chapters:[
  {kind:'work',name:['少甜走冰多奶走奶？','Less sweet, no ice, extra milk, no milk?'],text:['用至少 2 種手勢，命中 8 次。','Land 8 whacks using at least 2 gestures.'],goal:'variety',need:2,hits:8},
  {kind:'work',name:['又話最後改一次','One final revision… again'],text:['消除 3 張影印小人紙。','Clear 3 photocopied paper worries.'],goal:'copiesCleared',need:3},
  {kind:'noise',name:['嘈到聽唔到落單','Too noisy to hear the orders'],text:['完成 5 次完美節奏命中。','Land 5 perfectly timed whacks.'],goal:'perfect',need:5},
  {kind:'work-life',name:['收工！全餐啱晒','Off duty! Every order correct'],text:['五種手勢各成功使用一次。','Use all five gestures at least once.'],goal:'variety',need:5}]},
 {id:'neighbour',name:['隔籬街的一把傘','An umbrella from next door'],icon:'☂',gift:['街坊共享遮架','The neighbourhood umbrella stand'],chapters:[
  {kind:'family',name:['一家人先飲杯茶','Tea first, family fuss later'],text:['用來回搓安撫家庭怪，命中弱點 3 次。','Rub the family fuss’s weakness 3 times.'],goal:'weaknessHits',need:3},
  {kind:'love',name:['留返一句好說話','Save a kind word'],text:['完成 4 次完美節奏命中。','Land 4 perfectly timed whacks.'],goal:'perfect',need:4},
  {kind:'family',name:['雨停，一齊返屋企','The rain stopped. Let’s head home'],text:['命中 8 次，並餵白虎及完成祈福。','Land 8 whacks, feed the tiger and bless the talisman.'],goal:'kindness',need:8}]}];
export const CHALLENGES=[
 {id:'rhythm',name:['橋底節奏王','Flyover rhythm royal'],detail:['連續 10 次完美節奏命中','Land 10 perfect whacks in a row'],stamp:'拍',look:'gold',lookName:['金光節奏邊框','Golden rhythm trim']},
 {id:'hands',name:['一掌收工','One palm, off duty'],detail:['用徒手完成一章街坊委託','Complete a commission chapter with bare hands'],stamp:'掌',look:'flower',lookName:['收工小花章','Off-duty flower badge']},
 {id:'five',name:['拖鞋宗師','Slipper grandmaster'],detail:['一局使用齊五種手勢','Use all five gestures in one ritual'],stamp:'勁',look:'raincoat',lookName:['平安小雨帽','Little peace rain hat']}];
export const SCENES=[
 {id:'snack',name:['牛丸失竊現場','The missing meatball mystery'],needs:['cat','beef-balls','tiger'],actors:['cat','beef-balls','tiger'],line:['招財貓：「我冇食！」老虎：「你個嘴有汁。」','Cat: “Wasn’t me!” Tiger: “Your whiskers say otherwise.”']},
 {id:'charge',name:['香蕉滿電奇蹟','The banana charging miracle'],needs:['electric-banana','paper-iphone-duo'],actors:['electric-banana','paper-iphone-duo'],line:['香蕉遙控一按，紙紮手機：電量 1000%！','One banana click. Paper phone battery: 1000%!']},
 {id:'emperor',name:['狗皇帝登基','His Majesty, the dog'],needs:['dragon-throne','beggar-dog-rice'],companion:'lassie',actors:['dragon-throne','beggar-dog-rice','lassie'],line:['拉茜：「朕今日只批雙餸狗飯。」','Lassie: “Today, the court approves extra dinner.”']}];
const MOVES=['tap','heavy','rub','circle','pinch'],cap=(v,max)=>Number.isFinite(v)?Math.max(0,Math.min(max,Math.floor(v))):0;
export const freshNeighbourhood=()=>({active:'',replay:false,chapters:Object.fromEntries(STORIES.map(s=>[s.id,0])),challenges:[],title:'',look:'',scenes:[],layout:[],companions:[],album:[]});
export function readNeighbourhood(raw,{weapons=[],decor=[],owned=[]}={}){
 const next=freshNeighbourhood();if(!raw||typeof raw!=='object'){if(owned.includes('lassie'))next.companions=['lassie'];return next;}
 for(const story of STORIES)next.chapters[story.id]=cap(raw.chapters?.[story.id],story.chapters.length);
 if(STORIES.some(s=>s.id===raw.active&&(next.chapters[s.id]<s.chapters.length||raw.replay===true))){next.active=raw.active;next.replay=raw.replay===true;}
 next.challenges=CHALLENGES.filter(c=>Array.isArray(raw.challenges)&&raw.challenges.includes(c.id)).map(c=>c.id);next.title=next.challenges.includes(raw.title)?raw.title:'';next.look=CHALLENGES.some(c=>next.challenges.includes(c.id)&&c.look===raw.look)?raw.look:'';
 next.scenes=SCENES.filter(s=>Array.isArray(raw.scenes)&&raw.scenes.includes(s.id)).map(s=>s.id);next.companions=owned.includes('lassie')||(Array.isArray(raw.companions)&&raw.companions.includes('lassie'))?['lassie']:[];
 next.layout=[...new Set(Array.isArray(raw.layout)?raw.layout.filter(id=>decor.includes(id)):[])].slice(0,27);
 next.album=(Array.isArray(raw.album)?raw.album:[]).filter(e=>e&&typeof e.id==='string'&&weapons.includes(e.weapon)&&Number.isFinite(e.at)).slice(0,24).map(e=>({id:e.id.slice(0,80),kind:typeof e.kind==='string'?e.kind.slice(0,20):'work',weapon:e.weapon,score:cap(e.score,1000000),hits:cap(e.hits,1000000),perfect:cap(e.perfect,1000000),wear:Math.max(0,Math.min(1,Number(e.wear)||0)),move:MOVES.includes(e.move)?e.move:'tap',stamp:CHALLENGES.some(c=>c.id===e.stamp)?e.stamp:'',at:cap(e.at,8640000000000000)}));return next;
}
export function acceptStory(state,id,{replay=false}={}){const story=STORIES.find(s=>s.id===id),done=story&&(state.chapters[id]??0)>=story.chapters.length;return story&&(!done||replay)?{...state,active:id,replay:Boolean(done)}:null;}
export function storyGoal(chapter,result){const variety=MOVES.filter(m=>(result.moves?.[m]??0)>0).length;return chapter.goal==='variety'?variety>=chapter.need&&result.hits>=(chapter.hits??0):chapter.goal==='kindness'?result.hits>=chapter.need&&result.fed&&result.blessed:(result[chapter.goal]??0)>=chapter.need;}
export function finishNeighbourhood(state,result,{id,now}){
 let next={...state,chapters:{...state.chapters},challenges:[...state.challenges],album:[...state.album]};const story=STORIES.find(s=>s.id===state.active),chapter=story?.chapters[state.replay?story.chapters.length-1:state.chapters[story.id]??0];let completed=null;
 if(chapter&&result.commission===story.id&&result.kind===chapter.kind&&storyGoal(chapter,result)){if(!state.replay)next.chapters[story.id]++;completed={story:story.id,chapter:next.chapters[story.id],finished:next.chapters[story.id]===story.chapters.length,replay:state.replay};if(completed.finished){next.active='';next.replay=false;}}
 const earned=[];for(const challenge of CHALLENGES){const success=challenge.id==='rhythm'?result.maxPerfectStreak>=10:challenge.id==='hands'?Boolean(completed&&result.weapon==='bare-hand'):MOVES.every(m=>(result.moves?.[m]??0)>0);if(success&&!next.challenges.includes(challenge.id)){next.challenges.push(challenge.id);earned.push(challenge.id);next.title ||=challenge.id;next.look ||=challenge.look;}}
 const move=MOVES.reduce((a,b)=>(result.moves?.[b]??0)>(result.moves?.[a]??0)?b:a,'tap');
 const entry={id,kind:result.kind??'work',weapon:result.weapon,score:result.score,hits:result.hits??0,perfect:result.perfect??0,wear:Math.max(0,Math.min(1,result.wear??0)),move,stamp:earned[0]??next.title,at:now};
 if(!next.album.some(e=>e.id===id))next.album=[entry,...next.album].slice(0,24);return {state:next,completed,earned,entry};
}
export function placedLayout(state,decor){const ids=Object.keys(decor).filter(id=>decor[id]>0);return [...state.layout.filter(id=>ids.includes(id)),...ids.filter(id=>!state.layout.includes(id))];}
export function placeDecoration(state,decor,id,slot){const layout=placedLayout(state,decor);const from=layout.indexOf(id);if(from<0||!Number.isInteger(slot)||slot<0||slot>=layout.length)return null;layout.splice(from,1);layout.splice(slot,0,id);return {...state,layout};}
export function availableScenes(state,decor){return SCENES.filter(scene=>scene.needs.every(id=>decor[id]>0)&&(!scene.companion||state.companions.includes(scene.companion)));}
export function discoverScenes(state,decor){const layout=placedLayout(state,decor),adjacent=(a,b)=>{const x=layout.indexOf(a),y=layout.indexOf(b);return x>=0&&y>=0&&Math.abs(x%3-y%3)+Math.abs(Math.floor(x/3)-Math.floor(y/3))===1;};const found=availableScenes(state,decor).filter(scene=>state.layout.length&&scene.needs.slice(1).every(id=>adjacent(scene.needs[0],id)));const scenes=[...new Set([...state.scenes,...found.map(s=>s.id)])];return scenes.length===state.scenes.length?state:{...state,scenes};}
export function personalFortune(entry){
 if(entry.kind==='work'&&entry.weapon==='iron-hammer')return ['需求可以再改，你今晚可以先收工。','The requirements can wait. Your evening starts now.'];
 const lines={work:['最後改一次，係指今日最後一次。','One final revision means the final one for today.'],stocks:['股價有上落，你值得食餐好。','Prices rise and fall. You still deserve a good dinner.'],teammates:['隊友未必醒，你可以先清醒收工。','Your teammate may nap. You can clock off wide awake.'],commute:['尾班車等緊你，唔使帶埋煩惱上車。','The last bus is waiting. Leave the worry off the passenger list.'],family:['屋企唔使爭第一，留句好話就得。','At home, a kind word beats winning the argument.'],love:['值得被溫柔對待，今日由自己開始。','You deserve gentleness. Start with yourself today.']};
 return lines[entry.kind]??(entry.move==='circle'?['兜完個圈，煩惱唔使跟住轉。','You finished the circle. Your worry need not go around again.']:entry.perfect>=10?['拍子啱晒，今晚輪到你慢慢歎。','Perfect timing. Now take your time this evening.']:['煩惱留喺紙度，你帶笑容返屋企。','Leave the worry on paper. Take your smile home.']);
}
