import {CAST,CORE,FRAGMENTS,SNOW,ACTIONS,CITY_EVENTS,ENDINGS,pair} from './content.js';
export const IDS=Object.keys(CAST),clamp=(n,min=0,max=100)=>Math.max(min,Math.min(max,n));
export const MEMORY=[{id:'snow',time:'07:10',text:pair('雪崩的呼叫','The avalanche call')},{id:'silence',time:'07:50',text:pair('救援機的沉默','The silent rescue radio')},{id:'dinner',time:'20:10',text:pair('無人抬頭的晚飯','The dinner nobody looked up from')}];
const copy=v=>JSON.parse(JSON.stringify(v));
export class CityGame{
 constructor(seed=Date.now()){this.s={version:1,seed:seed>>>0,stage:'snow',actor:'angus',snowDay:0,cityDay:1,actions:3,resources:{food:4,water:5,matches:3,blankets:2},money:220,trust:64,prices:30,unrest:25,solidarity:40,influence:15,investigation:0,memory:0,characters:Object.fromEntries(IDS.map(id=>[id,{health:76,sanity:82,guilt:4,humanity:68,ideals:65,confessed:false}])),inventory:[],journal:[],dinner:{step:0,proposer:null,responsibility:null,portion:null},musicDay:0,goodJams:0,pending:null,sequence:0,finalStep:0,finalStance:null,finalAccuracy:0,ending:null,allocationCount:0,events:[],choices:0};this.collect('ferry-ticket');this.log(pair('雪停之前，你們仍然有選擇。','Until the snow stops, you still have choices.'));}
 get actor(){return this.s.characters[this.s.actor];}
 get personality(){const p=this.actor;return p.humanity<40?'mask':p.guilt>60?'haunted':p.ideals>=65?'ember':'silent';}
 get card(){return SNOW[this.s.snowDay];}
 get currentEvent(){return CITY_EVENTS[this.s.events.at(-1)??0];}
 random(){this.s.seed=(Math.imul(this.s.seed,1664525)+1013904223)>>>0;return this.s.seed/4294967296;}
 log(text){this.s.journal.push(text);if(this.s.journal.length>80)this.s.journal.shift();}
 collect(id){if(!FRAGMENTS.some(f=>f.id===id)||this.s.inventory.includes(id))return false;this.s.inventory.push(id);return true;}
 discover(tag){let pool=FRAGMENTS.filter(f=>f.tag===tag&&!this.s.inventory.includes(f.id));if(!pool.length)pool=FRAGMENTS.filter(f=>!this.s.inventory.includes(f.id));if(!pool.length)return null;const f=pool[Math.floor(this.random()*pool.length)];this.collect(f.id);return f;}
 psyche(id,changes){const p=this.s.characters[id];for(const [key,value]of Object.entries(changes))p[key]=clamp(p[key]+value);}
 select(id){if(!IDS.includes(id)||this.s.stage!=='city'||this.s.pending)return false;this.s.actor=id;return true;}
 allocate(resource){if(this.s.stage!=='snow'||!(resource in this.s.resources)||this.s.resources[resource]<1||this.s.allocationCount>=2)return false;this.s.resources[resource]--;this.s.allocationCount++;const amount={food:10,water:8,matches:6,blankets:12}[resource];for(const id of IDS)this.psyche(id,{health:amount,sanity:0});this.log(pair('把有限的物資分給每一個人。體溫回來了，心事沒有。','You share a scarce supply. Warmth returns. Peace does not.'));return true;}
 snowChoice(id){
  if(this.s.stage!=='snow'||!this.card)return false;const choice=this.card.choices.find(c=>c[0]===id);if(!choice)return false;
  const effect=choice[3];for(const key of Object.keys(this.s.resources))if((effect[key]??0)+this.s.resources[key]<0)return false;
  for(const [key,value]of Object.entries(effect)){if(key in this.s.resources)this.s.resources[key]+=value;else if(key==='trust')this.s.trust=clamp(this.s.trust+value);else this.psyche(this.s.actor,{[key]:value});}
  if(choice[4])this.collect(choice[4]);this.discover('snow');this.s.choices++;this.log(pair(`${CAST[this.s.actor].name[0]}：${choice[1]}。`,`${CAST[this.s.actor].name[1]}: ${choice[2]}.`));
  const lack=(this.s.resources.food===0?2:0)+(this.s.resources.water===0?2:0);this.s.resources.food=Math.max(0,this.s.resources.food-1);this.s.resources.water=Math.max(0,this.s.resources.water-1);const cold=4+Math.floor(this.random()*4);for(const who of IDS)this.psyche(who,{health:-cold-lack,sanity:-2});
  this.log(pair(`${cold>=6?'暴風雪':'山風'}：每人健康 −${cold+lack}，理智 −2；糧與水各耗一份（如有）。`,`${cold>=6?'Blizzard':'Mountain wind'}: everyone loses ${cold+lack} health and 2 sanity. One food and water are consumed when available.`));
  this.s.snowDay++;this.s.allocationCount=0;this.s.actor=IDS[this.s.snowDay%3];
  if(IDS.some(who=>this.s.characters[who].health===0)){this.finish('whiteout');return true;}
  if(this.s.snowDay===4){this.s.stage='dinner';this.log(pair('家明的呼吸停了。沒有人說出那一句話，卻人人都聽見。','Ka Ming’s breathing stops. Nobody says it. Everyone hears it.'));}
  else if(this.s.snowDay>=SNOW.length)this.enterCity();return true;
 }
 dinnerChoice(value){
  if(this.s.stage!=='dinner')return false;const d=this.s.dinner;
  if(d.step===0){if(!IDS.includes(value)&&value!=='nobody')return false;d.proposer=value;d.step=1;return true;}
  if(d.step===1){if(!['together','alone','refuse'].includes(value))return false;d.responsibility=value;d.step=2;return true;}
  if(!['equal',...IDS,'refuse'].includes(value))return false;d.portion=value;const refused=value==='refuse'||d.responsibility==='refuse';
  for(const id of IDS){const extra=(d.proposer===id?7:0)+(d.responsibility==='alone'&&d.proposer===id?12:0)+(d.portion===id?10:0);this.psyche(id,{guilt:refused?12:29+extra,sanity:-10,humanity:refused?-2:-14-extra*.4,health:refused?-10:10});}
  if(d.proposer==='nobody'){for(const id of IDS)this.psyche(id,{guilt:4});this.s.trust=clamp(this.s.trust-6);}
  if(!refused)this.s.resources.food+=2;this.s.trust=clamp(this.s.trust+(refused?-2:d.responsibility==='together'?4:-9));this.collect('knife');d.step=3;
  this.log(refused?pair('你們拒絕那頓晚飯。代價不會因沉默而消失。','You refuse the meal. Silence does not remove its cost.'):pair('那頓晚飯之後，三個人再沒有以同樣的方式望向對方。','After that dinner, the three never look at each other in the same way again.'));
  if(IDS.some(id=>this.s.characters[id].health<=0))this.finish('whiteout');else this.s.stage='snow';return true;
 }
 enterCity(){this.s.stage='city';this.s.actor='angus';this.s.money=220+Math.floor(IDS.reduce((n,id)=>n+this.s.characters[id].health,0)/3);this.s.events.push(Math.floor(this.random()*CITY_EVENTS.length));this.log(pair('十五年後。三條人生，在同一座城市裡互相收取利息。','Fifteen years later. Three lives collect interest from one another in the same city.'));}
 canAct(id){if(this.s.stage!=='city'||this.s.pending)return false;if(id==='confess')return !this.actor.confessed;const a=ACTIONS[this.s.actor].find(a=>a.id===id);return !!a&&this.s.money>=a.cost&&(id!=='reconstruct'||this.s.inventory.length>=3);}
 act(id){
  if(!this.canAct(id))return false;const s=this.s,p=this.actor;const a=ACTIONS[s.actor].find(a=>a.id===id);s.money-=a?.cost??0;
  if(id==='reconstruct'){s.pending={kind:'memory',order:[...MEMORY].sort(()=>this.random()-.5).map(x=>x.id)};return true;}
  const change=(values)=>this.psyche(s.actor,values);let note;
  switch(id){
   case 'trade':{const win=this.random()>.32;s.money+=win?90:-Math.min(40,s.money);s.prices+=4;s.unrest+=2;change({humanity:-5,ideals:-2,guilt:4,sanity:-3});note=win?pair('交易獲利 $90；你買得到的東西更多，聽得見的聲音更少。','The trade earns $90. You can buy more and hear less.'):pair('交易最多虧損 $40。街坊仍然要付出更高的租金。','The trade loses up to $40. Neighbours still face higher rents.');this.discover('finance');break;}
   case 'acquire':s.influence+=12;s.prices+=9;s.unrest+=5;s.trust-=3;change({humanity:-8,guilt:6,sanity:-2});note=pair('併購完成。鼓佬的下一次談判會更艱難。','Acquisition complete. Bowman’s next negotiation becomes harder.');this.discover('finance');break;
   case 'protect':s.prices-=4;s.trust+=3;change({humanity:5,ideals:4,guilt:1,sanity:-1});note=pair('小店亮着燈。這不是贖罪，只是一個仍可作的決定。','The shop stays lit. Not atonement, just a choice still available.');this.discover('city');break;
   case 'cover':s.investigation-=8;s.trust-=5;change({humanity:-5,guilt:8,sanity:-4});note=pair('證詞被收起，卻在夢裡大聲重播。','The testimony is hidden, then plays louder in your dreams.');this.discover('finance');break;
   case 'strike':{const hard=s.unrest>=70||s.prices>=75;s.solidarity+=hard?2:8;s.unrest+=hard?8:4;s.prices-=2;s.money+=hard?0:20;s.trust+=hard?-2:2;change({ideals:5,humanity:2,guilt:2,sanity:hard?-7:-2});note=hard?pair('高物價與動盪令罷工受挫。你仍然站在原位。','High prices and unrest weaken the strike. You remain at your post.'):pair('工人守住一個班次，也守住了一點尊嚴。','The workers protect a shift, and a little dignity.');this.discover('community');break;}
   case 'bargain':s.money+=45;s.solidarity-=9;s.unrest-=8;s.trust-=4;change({ideals:-6,humanity:-3,guilt:5,sanity:-3});note=pair('街頭暫時安靜，飯盒上的名字卻少了幾個。','The streets quiet down. A few names disappear from the lunch list.');this.discover('community');break;
   case 'organize':s.solidarity+=9;s.trust+=5;change({ideals:5,humanity:4,guilt:1,sanity:-1});this.collect('union-leaflet');this.discover('community');note=pair('你再敲一次門。今次，有人肯開。','You knock once more. This time someone opens.');break;
   case 'witness':s.solidarity+=3;s.trust+=3;change({humanity:4,ideals:3,guilt:1,sanity:-1});this.discover('community');note=pair('故事沒有令你輕鬆，卻令你不能再假裝看不見。','The story offers no relief, but you can no longer pretend not to see.');break;
   case 'search':{s.memory+=14;s.investigation+=2;change({guilt:5,sanity:-5});this.collect(['music-box','tape-a','diary'].find(id=>!s.inventory.includes(id)));this.discover('memory');note=pair('舊旋律把一段時間還給你，也把重量一併還回來。','An old melody returns a piece of time, and all its weight.');break;}
   case 'family':s.money+=25;s.memory+=3;change({humanity:3,guilt:2,sanity:-2});this.discover('memory');note=pair('你完成工作，陪家人吃飯。窗外的雪聲仍然沒有停止。','You work and eat with your family. The snow outside does not stop.');break;
   case 'follow':s.memory+=9;change({guilt:4,sanity:-7});this.collect(CORE.find(id=>!s.inventory.includes(id)));this.discover('memory');note=pair('回聲引你找回一件東西。你開始不敢說那只是錯覺。','The echo leads to an object. You hesitate to call it imaginary.');break;
   case 'confess':p.confessed=true;s.investigation+=12;s.trust+=7;change({guilt:2,sanity:-3,humanity:5,ideals:3});this.collect('unsent-letter');this.discover('truth');note=pair('你向阿 Yan 說出自己的部分。說真話不會自動消除罪疚。','You tell Yan your part. Telling the truth does not automatically erase guilt.');break;
  }
  this.log(note);this.turn();return true;
 }
 resolveMemory(order){if(this.s.pending?.kind!=='memory')return false;const good=Array.isArray(order)&&order.join(',')==='snow,silence,dinner';this.s.pending=null;this.s.memory+=good?22:4;this.psyche('ronnie',{guilt:good?5:3,sanity:good?-9:-5});if(good){this.collect('diary');this.discover('truth');}this.log(good?pair('三個時間終於接上。最難的部分不是記得，而是承認。','Three times connect. Remembering is easier than admitting.'):pair('時間未能接上。你保留了碎片，卻仍未看見整幅圖。','The times do not connect. You keep the fragments, but not the whole picture.'));this.turn();return good;}
 cancelMemory(){if(this.s.pending?.kind==='memory'){this.s.pending=null;return true;}return false;}
 turn(){const s=this.s;s.choices++;s.actions--;for(const key of ['trust','prices','unrest','solidarity','influence','investigation','memory'])s[key]=clamp(s[key]);if(s.actions<=0){s.cityDay++;s.actions=3;s.investigation=clamp(s.investigation+4);s.prices=clamp(s.prices+1);s.unrest=clamp(s.unrest+(s.prices>60?4:1));for(const id of IDS)this.psyche(id,{sanity:-1});const e=Math.floor(this.random()*CITY_EVENTS.length);s.events.push(e);if(s.events.length>12)s.events.shift();if(CITY_EVENTS[e][2]==='yan')s.investigation=clamp(s.investigation+3);this.log(CITY_EVENTS[e][1]);}if(s.cityDay>12||s.investigation>=100)this.enterFinale();}
 beginMusic(final=false){const s=this.s;if(s.pending?.kind==='music')return s.pending;if(s.pending||(final?(s.stage!=='finale'||s.finalStep!==2):(s.stage!=='city'||s.musicDay===s.cityDay)))return null;s.sequence++;s.pending={kind:'music',token:'take-'+s.sequence,final};return s.pending;}
 completeMusic(token,{hits,perfect,total}){const s=this.s;if(s.pending?.kind!=='music'||s.pending.token!==token||![hits,perfect,total].every(Number.isInteger)||total<4||total>100||perfect<0||hits<perfect||hits>total)return false;const final=s.pending.final;s.pending=null;const accuracy=hits/total,coherent=s.trust>=35;const good=accuracy>=.65&&coherent;for(const id of IDS)this.psyche(id,good?{guilt:-9,sanity:12}:{guilt:1,sanity:0});if(good){s.goodJams++;s.trust=clamp(s.trust+4);this.discover('music');}this.log(good?pair('三個聲部接在一起。罪疚沒有消失，只是你們終於不再獨奏。','Three parts meet. Guilt remains, but you are no longer playing alone.'):!coherent?pair('節拍沒有錯，彼此的心卻未在同一個地方。','The timing is right. Your hearts are elsewhere.'):pair('今次沒有接上。留住這一拍，下一次再來。','This take falls apart. Keep the beat for next time.'));if(final){s.finalAccuracy=accuracy;this.finish(this.determineEnding());}else s.musicDay=s.cityDay;return {good,accuracy};}
 cancelMusic(){if(this.s.pending?.kind!=='music')return false;this.s.pending=null;return true;}
 abandonMusic(){if(this.s.pending?.kind==='music'){this.completeMusic(this.s.pending.token,{hits:0,perfect:0,total:12});return true;}return false;}
 enterFinale(){this.s.stage='finale';this.s.pending=null;this.s.finalStep=0;this.log(pair('最後一次邀約：一個舞台、三個人、一張永遠空着的椅子。','One last invitation: one stage, three people, one permanently empty chair.'));}
 finaleChoice(id){const s=this.s;if(s.stage!=='finale'||s.pending)return false;if(s.finalStep===0){if(!['community','sponsor','unplugged'].includes(id)||id==='community'&&s.money<100)return false;if(id==='community'){s.money-=100;s.trust=clamp(s.trust+8);s.solidarity=clamp(s.solidarity+8);}if(id==='sponsor'){s.money+=150;s.influence=clamp(s.influence+10);s.trust=clamp(s.trust-9);for(const who of IDS)this.psyche(who,{humanity:-6});}if(id==='unplugged')s.trust=clamp(s.trust+3);s.finalStep=1;return true;}
 if(s.finalStep===1&&['truth','cover','power','accuse'].includes(id)){s.finalStance=id;if(id==='truth'){s.trust=clamp(s.trust+5);for(const who of IDS)this.psyche(who,{humanity:3});}if(id==='accuse')s.trust=clamp(s.trust-16);s.finalStep=2;return true;}return false;}
 determineEnding(){const s=this.s,avg=k=>IDS.reduce((n,id)=>n+s.characters[id][k],0)/3;if((avg('sanity')<20||s.unrest>85)&&s.trust<35&&s.finalStance==='accuse')return 'ashes';if(s.finalStance==='power'&&(s.influence>=45||avg('humanity')<35))return 'empire';if(s.finalStance==='cover')return 'silence';if(s.trust<40)return 'fracture';const ready=IDS.every(id=>s.characters[id].confessed)&&avg('humanity')>=45&&avg('ideals')>=40&&s.memory>=65&&s.trust>=55&&s.goodJams>=2&&s.finalAccuracy>=.65;if(ready&&s.finalStance==='truth')return CORE.every(id=>s.inventory.includes(id))&&s.finalAccuracy>=.85?'parallel':'redemption';return 'unfinished';}
 finish(id){if(!ENDINGS[id]&&id!=='whiteout')return false;this.s.stage='ending';this.s.ending=id;this.s.pending=null;return true;}
 snapshot(){return copy(this.s);}
 static restore(input){
  const raw=typeof input==='string'?JSON.parse(input):input;if(!raw||raw.version!==1||!['snow','dinner','city','finale','ending'].includes(raw.stage)||!IDS.includes(raw.actor))throw Error('invalid-save');
  const g=new CityGame(1),s=g.s,numeric=['seed','snowDay','cityDay','actions','money','trust','prices','unrest','solidarity','influence','investigation','memory','musicDay','goodJams','sequence','finalStep','finalAccuracy','allocationCount','choices'];
  for(const key of numeric){if(!Number.isFinite(raw[key])||raw[key]<0)throw Error('invalid-save');s[key]=raw[key];}
  if(raw.seed>4294967295||raw.snowDay>6||raw.cityDay>13||raw.actions>3||raw.finalStep>2||raw.finalAccuracy>1||raw.money>1e9||raw.allocationCount>2)throw Error('invalid-save');
  for(const id of IDS){if(!raw.characters?.[id])throw Error('invalid-save');for(const key of ['health','sanity','guilt','humanity','ideals']){const value=raw.characters[id][key];if(!Number.isFinite(value)||value<0||value>100)throw Error('invalid-save');s.characters[id][key]=value;}s.characters[id].confessed=raw.characters[id].confessed===true;}
  for(const key of Object.keys(s.resources)){if(!Number.isInteger(raw.resources?.[key])||raw.resources[key]<0||raw.resources[key]>100)throw Error('invalid-save');s.resources[key]=raw.resources[key];}
  if(!Array.isArray(raw.inventory)||raw.inventory.length>FRAGMENTS.length||raw.inventory.some(id=>!FRAGMENTS.some(f=>f.id===id)))throw Error('invalid-save');s.inventory=[...new Set(raw.inventory)];
  s.journal=(Array.isArray(raw.journal)?raw.journal:[]).filter(p=>Array.isArray(p)&&p.length===2&&p.every(x=>typeof x==='string'&&x.length<=500)).slice(-80);
  const d=raw.dinner;if(!d||!Number.isInteger(d.step)||d.step<0||d.step>3||![null,'nobody',...IDS].includes(d.proposer)||![null,'together','alone','refuse'].includes(d.responsibility)||![null,'equal','refuse',...IDS].includes(d.portion))throw Error('invalid-save');s.dinner=copy(d);
  s.stage=raw.stage;s.actor=raw.actor;s.finalStance=['truth','cover','power','accuse'].includes(raw.finalStance)?raw.finalStance:null;s.ending=raw.ending;
  if(s.stage==='snow'&&s.snowDay>=6||s.stage==='ending'&&!ENDINGS[s.ending]&&s.ending!=='whiteout')throw Error('invalid-save');
  s.events=(Array.isArray(raw.events)?raw.events:[]).filter(i=>Number.isInteger(i)&&i>=0&&i<CITY_EVENTS.length).slice(-12);
  if(raw.pending?.kind==='music'&&typeof raw.pending.token==='string'&&raw.pending.token.length<80&&['city','finale'].includes(s.stage))s.pending={kind:'music',token:raw.pending.token,final:raw.pending.final===true&&s.stage==='finale'};
  else if(raw.pending?.kind==='memory'&&s.stage==='city'){const order=raw.pending.order;if(!Array.isArray(order)||order.length!==3||new Set(order).size!==3||order.some(id=>!MEMORY.some(m=>m.id===id)))throw Error('invalid-save');s.pending={kind:'memory',order:[...order]};}else s.pending=null;
  return g;
 }
}
