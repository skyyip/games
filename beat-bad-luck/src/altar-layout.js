import {DECOR} from './catalog.js';
export const ALTAR_LIMIT=5;
const known=new Set(DECOR.map(item=>item.id));
const unique=value=>[...new Set(Array.isArray(value)?value.filter(id=>typeof id==='string'&&known.has(id)):[])];
export function canPlaceOnAltar(state,id,now=Date.now()){
 const at=Math.max(state.lastSeen??0,now),expires=state.decorExpires?.[id];
 return known.has(id)&&(state.decor?.[id]??0)>0&&(!Number.isFinite(expires)||expires>at);
}
export function altarSelection(state,now=Date.now()){return unique(state.altarDecor).filter(id=>canPlaceOnAltar(state,id,now)).slice(0,ALTAR_LIMIT);}
export function pruneAltar(state,now=Date.now()){
 const requested=unique(state.altarDecor).slice(0,ALTAR_LIMIT),selected=altarSelection(state,now),removed=requested.filter(id=>!selected.includes(id));
 return {...state,altarDecor:selected,altarMissing:unique([...(Array.isArray(state.altarMissing)?state.altarMissing:[]),...removed]).slice(-ALTAR_LIMIT)};
}
export function setAltarDecor(state,ids,now=Date.now()){
 if(!Array.isArray(ids)||ids.length>ALTAR_LIMIT||new Set(ids).size!==ids.length||ids.some(id=>!canPlaceOnAltar(state,id,now)))return null;
 return {...state,altarDecor:[...ids],altarMissing:[]};
}
export const altarGags=[
 {id:'meatball-rescue',requires:['beef-balls','cat'],line:['牛丸偷偷衝向香爐，招財貓：「呢粒唔係供品呀！」','The meatball rolls toward the burner. Cat: “That is NOT an offering!”']},
 {id:'tiger-snack',requires:['beef-balls','tiger'],line:['虎爺望實粒牛丸：「拜完神先開飯，我忍到！」','Tiger eyes the meatball: “Prayers first, snacks later. I can wait!”']},
 {id:'royal-cat',requires:['dragon-throne','cat'],line:['招財貓向龍椅鞠躬：「皇上，香油錢可唔可以加薪？」','Cat bows to the throne: “Your Majesty, any chance of a pay rise?”']},
 {id:'bubble-truce',requires:['aquarium','tiger'],line:['魚仔吹個心形泡泡，虎爺即刻扮斯文：「我今日食齋。」','A heart bubble floats past. Tiger: “I am vegetarian today. Honest.”']}
];
export function availableAltarGags(ids){return altarGags.filter(gag=>gag.requires.every(id=>ids.includes(id)));}
export function altarPositions(ids){
 const slots={0:[],1:['back-center'],2:['back-left','back-right'],3:['back-left','back-center','back-right'],4:['back-left','back-right','front-left','front-right'],5:['back-left','back-center','back-right','front-left','front-right']};
 return ids.slice(0,ALTAR_LIMIT).map((id,index)=>({id,slot:slots[Math.min(ids.length,ALTAR_LIMIT)][index]}));
}
