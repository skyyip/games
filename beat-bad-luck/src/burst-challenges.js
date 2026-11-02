export const BODY_PARTS=[
 {id:'head',name:['頭','Head'],short:['頭','HEAD'],x:.5,y:.3},
 {id:'left-hand',name:['左手','Left hand'],short:['左手','LH'],x:.19,y:.64},
 {id:'right-hand',name:['右手','Right hand'],short:['右手','RH'],x:.81,y:.64},
 {id:'left-foot',name:['左腳','Left foot'],short:['左腳','LF'],x:.38,y:.89},
 {id:'right-foot',name:['右腳','Right foot'],short:['右腳','RF'],x:.62,y:.89},
];
export const TARGET_POINTS=100,TARGET_HIT_INTERVAL_MS=35,RING_ROUND_MS=2000,RING_IDEAL_MS=1600;
export const PULL_POINTS=100,PULL_DISTANCE=40;
export function pullDirection(dx,dy){return Number.isFinite(dx)&&Number.isFinite(dy)&&Math.abs(dy)>=PULL_DISTANCE&&Math.abs(dy)>=Math.abs(dx)*1.4?(dy<0?'pull-up':'pull-down'):null;}
export const BURST_RULES=[
 '88 連擊解鎖 10 秒必殺，不限次數。三種挑戰依序循環：第一次按提示點頭、左手、右手、左腳、右腳，每輪打亂次序，每次 100 分；第二次等外圈縮到金色圈時點擊，Excellence 300 分、Great 200 分、Nice 100 分，每圈 2 秒，在隨機部位出現，只判定一次，太早或太遲不加分；第三次在拉動區向上或向下拉至少 40px，放手得 100 分，點拍、橫拉及短拉不計分。以上套用法寶及小人紙倍率；必殺期間不蓄下一槽，10 秒計入回合時間。',
 '88 combo unlocks a 10-second finisher, with unlimited recharges. Three challenges repeat in order: first, tap the named head, hand or foot for 100 points, with all five shuffled; second, tap when the shrinking ring meets the gold ring for Excellence 300, Great 200 or Nice 100 points, one attempt per 2-second ring at a shuffled body part and zero for too early or late; third, pull up or down at least 40px in the pull area and release for 100 points. Taps, horizontal drags and short pulls score zero. Kit and paper bonuses apply. Finishers do not charge the next meter, and their ten seconds count toward the round.',
];
function drawTarget(state,random){if(!state.bag.length){state.bag=BODY_PARTS.map(p=>p.id);for(let i=state.bag.length-1;i>0;i--){const n=Math.min(i,Math.max(0,Math.floor(random()*(i+1))));[state.bag[i],state.bag[n]]=[state.bag[n],state.bag[i]];}if(state.bag[0]===state.target)[state.bag[0],state.bag[1]]=[state.bag[1],state.bag[0]];}state.target=state.bag.shift();}
export function createBurstChallenge(use,random){const state={mode:['targets','timing','pull'][(use-1)%3],bag:[],target:null,round:0,lastRound:-1,judgement:null};if(state.mode!=='pull')drawTarget(state,random);return state;}
export function syncBurstChallenge(state,elapsed,random){if(state.mode!=='timing')return;const round=Math.floor(elapsed/RING_ROUND_MS);if(state.round!==round){state.round=round;drawTarget(state,random);}}
export function resolveBurstAction(state,action,elapsed,random){
 if(state.mode==='targets'){if(action!==state.target)return null;const part=state.target,result={grade:'Target',points:TARGET_POINTS,part,at:elapsed};drawTarget(state,random);state.judgement=result;return result;}
 if(state.mode==='pull'){if(!['pull-up','pull-down'].includes(action))return null;return state.judgement={grade:'Pull',points:PULL_POINTS,direction:action,at:elapsed};}
 if(action!=='timing')return null;syncBurstChallenge(state,elapsed,random);const round=state.round;if(round===state.lastRound)return null;state.lastRound=round;
 const error=Math.abs(elapsed%RING_ROUND_MS-RING_IDEAL_MS),grade=error<=100?'Excellence':error<=250?'Great':error<=500?'Nice':'Miss',points={Excellence:300,Great:200,Nice:100,Miss:0}[grade];return state.judgement={grade,points,round,at:elapsed};
}
