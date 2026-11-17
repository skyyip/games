export const AUDIO_QUESTIONS=Object.freeze([
 {id:'sound-tram',art:'tram',audio:'sound-tram',question:'兩下金屬鈴聲，加上車輪的節奏，最像哪個街頭情境？',options:['電車在路軌上行駛並響鈴','渡輪在海上鳴笛','茶餐廳攪拌凍飲','街坊洗麻雀'],answer:0,caption:'兩下清脆金屬鈴聲，背後有規律的車輪敲擊聲。',explanation:'這段原創音效以雙鈴和路軌節奏模擬叮叮電車。它不是某款電車的實地錄音。'},
 {id:'sound-ferry',art:'ferry',audio:'sound-ferry',question:'低沉長鳴、流水與金屬碰撞，最像哪個情境？',options:['巴士乘客按落車鐘','酒樓搬動餐具','小輪靠近碼頭','行人過路聲響'],answer:2,caption:'先有低沉長鳴，伴隨水聲及幾下金屬鏈碰撞聲。',explanation:'水聲、低沉鳴笛及鏈條碰撞構成碼頭情境。這是情境重製，並非天星小輪官方汽笛樣本。'},
 {id:'sound-bus',art:'bus-route-sheet',audio:'sound-bus',question:'車輛低鳴中傳來一聲短電子提示，最像誰做了甚麼？',options:['船長拉響汽笛','巴士乘客按下落車鐘','街坊用匙羹攪冰茶','電車司機連響金屬鈴'],answer:1,caption:'低沉車輛背景聲中，出現一聲短而清晰的電子「叮」。',explanation:'音效模擬巴士乘客按落車鐘的情境。不同車款提示聲不同，不以這段重製音辨認車型。'},
 {id:'sound-crossing',art:'yellow-box',audio:'sound-crossing',question:'規律的電子敲擊由慢變密，最像哪種街道設施？',options:['戲棚開鑼前的鑼鼓','電車路軌接縫','店舖拉下鐵閘','有聲行人過路裝置'],answer:3,caption:'乾脆的電子敲擊持續重複，後半段的節奏明顯加快。',explanation:'這段原創節奏模擬行人過路聲響裝置。真正過路時應留意現場交通燈及環境，不能靠遊戲音效判斷。'},
 {id:'sound-mahjong',art:'calligraphy',audio:'sound-mahjong',question:'密集的硬物碰撞後，傳來幾下整齊疊放聲，最像甚麼？',options:['街坊洗牌及疊起麻雀','維港渡輪鳴笛','巴士報站前提示','電車司機響鈴'],answer:0,caption:'一連串短促硬物碰撞聲，接着是幾下分明的疊放敲擊。',explanation:'洗牌與疊牌的碰撞節奏用來模擬麻雀桌情境。重點是辨認聲音組合，不是辨認某一副牌的材質。'},
 {id:'sound-cafe',art:'milk',audio:'sound-cafe',question:'冰塊、倒水與匙羹碰杯的組合，最像哪個日常情境？',options:['碼頭收起鐵鏈','茶餐廳準備凍飲','車輪經過路軌接縫','行人燈轉換提示'],answer:1,caption:'冰塊落杯，接着有倒飲料的流水聲及匙羹輕碰杯邊。',explanation:'這組原創聲音模擬茶餐廳製作凍飲。單一碰撞聲可能相似，所以題目考察整段聲音組合。'}
].map(q=>Object.freeze({...q,options:Object.freeze(q.options)})));
export {SPOTLIGHT_IDS as SCRATCH_IDS} from './visual-catalog.js';
export const PRACTICE_MS=25000,PRACTICE_COUNT=5,GRID_WIDTH=40,GRID_HEIGHT=25,GRID_SIZE=1000;
export function brushCells(cells,x,y,radius=2){
 const next=new Set(cells);for(let row=Math.max(0,Math.floor(y-radius));row<=Math.min(GRID_HEIGHT-1,Math.ceil(y+radius));row++)for(let col=Math.max(0,Math.floor(x-radius));col<=Math.min(GRID_WIDTH-1,Math.ceil(x+radius));col++)if((col+.5-x)**2+(row+.5-y)**2<=radius*radius)next.add(row*GRID_WIDTH+col);return [...next].sort((a,b)=>a-b);
}
export const scratchStars=(correct,cells)=>!correct||cells.length>GRID_SIZE*.5?0:cells.length<=GRID_SIZE*.2?3:cells.length<=GRID_SIZE*.35?2:1;
export function validPractice(value,questionIds,now=Date.now()){
 if(!value||!['audio','scratch'].includes(value.kind)||!['ready','playing','reveal','finished'].includes(value.phase)||!Array.isArray(value.qids)||value.qids.length!==PRACTICE_COUNT||new Set(value.qids).size!==PRACTICE_COUNT||!value.qids.every(id=>questionIds.includes(id))||!Number.isInteger(value.index)||value.index<0||value.index>=PRACTICE_COUNT||!Array.isArray(value.answers)||value.answers.length>PRACTICE_COUNT||!Array.isArray(value.cells)||value.cells.length>GRID_SIZE||new Set(value.cells).size!==value.cells.length||!value.cells.every(n=>Number.isInteger(n)&&n>=0&&n<GRID_SIZE)||!Number.isFinite(value.startedAt)||now-value.startedAt>86400000||value.startedAt>now+60000||value.questionAt!==null&&!Number.isFinite(value.questionAt))return null;
 return value;
}
export function newPractice(kind,ids,now=Date.now(),random=()=>crypto.getRandomValues(new Uint32Array(1))[0]/4294967296){
 if(!['audio','scratch'].includes(kind)||ids.length<PRACTICE_COUNT)throw Error('practice-kind');const shuffled=[...ids];for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 return {id:'practice_'+crypto.randomUUID(),kind,qids:shuffled.slice(0,PRACTICE_COUNT),index:0,phase:'ready',questionAt:null,startedAt:now,answers:[],cells:[]};
}
export function practiceAnswer(run,choice,answer,now=Date.now()){
 if(run.phase!=='playing')throw Error('practice-not-playing');const expired=now>=run.questionAt+PRACTICE_MS,correct=!expired&&choice===answer;
 return {...run,phase:'reveal',answers:[...run.answers,{qid:run.qids[run.index],choice:expired?-1:choice,correct,timeout:expired,stars:run.kind==='scratch'?scratchStars(correct,run.cells):0,coverage:run.kind==='scratch'?run.cells.length/GRID_SIZE:0}]};
}
