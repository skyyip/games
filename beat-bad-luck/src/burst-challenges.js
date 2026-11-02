export const BODY_PARTS=[
 {id:'head',name:['頭','Head'],short:['頭','HEAD'],x:.5,y:.3},
 {id:'left-hand',name:['左手','Left hand'],short:['左手','LH'],x:.19,y:.64},
 {id:'right-hand',name:['右手','Right hand'],short:['右手','RH'],x:.81,y:.64},
 {id:'left-foot',name:['左腳','Left foot'],short:['左腳','LF'],x:.38,y:.89},
 {id:'right-foot',name:['右腳','Right foot'],short:['右腳','RF'],x:.62,y:.89},
];
export const TARGET_POINTS=225,TARGET_HIT_INTERVAL_MS=35,RING_ROUND_MS=1300,RING_IDEAL_MS=1040,MAX_RINGS=3;
export const RING_SPAWN_MIN_MS=320,RING_SPAWN_MAX_MS=440;
export const PULL_POINTS=225,PULL_DISTANCE=40;
export function pullDirection(dx,dy){return Number.isFinite(dx)&&Number.isFinite(dy)&&Math.abs(dy)>=PULL_DISTANCE&&Math.abs(dy)>=Math.abs(dx)*1.4?(dy<0?'pull-up':'pull-down'):null;}
export const BURST_RULES=[
 '88 連擊解鎖 12 秒必殺，不限次數。三種挑戰依序循環：第一次按提示點頭、左手、右手、左腳、右腳，每次命中後重新隨機指定下一部位，避免連續重複，每次 225 分；第二次等外圈縮到金色圈時點擊，Excellence 675 分、Great 450 分、Nice 225 分，每圈 1.3 秒，縮圈錯開時間陸續出現，每批隨機 1–3 個，位置隨機分布在打小人區域中央 80% 範圍內，同時最多 3 個，每個圈獨立判定一次，太早或太遲不加分；第三次在拉動區向上或向下拉至少 40px，放手得 225 分，點拍、橫拉及短拉不計分。以上套用法寶及小人紙倍率；必殺期間不蓄下一槽，12 秒計入回合時間。',
 '88 combo unlocks a 12-second finisher, with unlimited recharges. Three challenges repeat in order: first, tap the named head, hand or foot for 225 points, with a fresh random body part after each hit and no consecutive repeat; second, tap when the shrinking ring meets the gold ring for Excellence 675, Great 450 or Nice 225 points, random batches of 1–3 staggered rings within the central 80% of the play area, with up to 3 on screen, each lasting 1.3 seconds with its own single attempt and zero for too early or late; third, pull up or down at least 40px in the pull area and release for 225 points. Taps, horizontal drags and short pulls score zero. Kit and paper bonuses apply. Finishers do not charge the next meter, and their twelve seconds count toward the round.',
];
function drawTarget(state,random){if(!state.bag.length){state.bag=BODY_PARTS.map(p=>p.id);for(let i=state.bag.length-1;i>0;i--){const n=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[state.bag[i],state.bag[n]]=[state.bag[n],state.bag[i]];}if(state.bag[0]===state.target)[state.bag[0],state.bag[1]]=[state.bag[1],state.bag[0]];}state.target=state.bag.shift();}
function randomTarget(state,random){const choices=BODY_PARTS.filter(p=>p.id!==state.target);state.target=choices[Math.min(choices.length-1,Math.max(0,Math.floor(random()*choices.length)))].id;}
function spawnRing(state,at,random){
 const used=new Set(state.rings.map(r=>r.part));do{drawTarget(state,random);}while(used.has(state.target));
 state.rings.push({id:`ring-${state.serial++}`,part:state.target,at,position:{x:random(),y:random()},judged:false,judgement:null});
}
export function createBurstChallenge(use,random){const state={mode:['targets','timing','pull'][(use-1)%3],bag:[],target:null,judgement:null,rings:[],serial:0,nextSpawnAt:0,batchRemaining:0};if(state.mode==='targets')randomTarget(state,random);else if(state.mode==='timing')syncBurstChallenge(state,0,random);return state;}
export function syncBurstChallenge(state,elapsed,random){
 if(state.mode!=='timing')return;
 while(state.nextSpawnAt<=elapsed){
  const at=state.nextSpawnAt;state.rings=state.rings.filter(r=>at-r.at<RING_ROUND_MS);
  if(!state.batchRemaining)state.batchRemaining=1+Math.min(MAX_RINGS-1,Math.max(0,Math.floor(random()*MAX_RINGS)));
  spawnRing(state,at,random);state.batchRemaining--;
  const range=RING_SPAWN_MAX_MS-RING_SPAWN_MIN_MS;
  state.nextSpawnAt+=state.batchRemaining?RING_SPAWN_MIN_MS+Math.min(range,Math.max(0,Math.floor(random()*(range+1)))):RING_ROUND_MS;
 }
 state.rings=state.rings.filter(r=>elapsed-r.at<RING_ROUND_MS);state.target=state.rings[0]?.part??null;
}
export function resolveBurstAction(state,action,elapsed,random){
 if(state.mode==='targets'){if(action!==state.target)return null;const part=state.target,result={grade:'Target',points:TARGET_POINTS,part,at:elapsed};randomTarget(state,random);state.judgement=result;return result;}
 if(state.mode==='pull'){if(!['pull-up','pull-down'].includes(action))return null;return state.judgement={grade:'Pull',points:PULL_POINTS,direction:action,at:elapsed};}
 if(action!=='timing'&&!(typeof action==='string'&&action.startsWith('timing:')))return null;syncBurstChallenge(state,elapsed,random);
 const ring=action==='timing'?state.rings[0]:state.rings.find(r=>r.id===action.slice(7));if(!ring||ring.judged)return null;ring.judged=true;
 const error=Math.abs(elapsed-ring.at-RING_IDEAL_MS),grade=error<=100?'Excellence':error<=250?'Great':error<=500?'Nice':'Miss',points={Excellence:675,Great:450,Nice:225,Miss:0}[grade];
 return state.judgement=ring.judgement={grade,points,ringId:ring.id,part:ring.part,at:elapsed};
}
