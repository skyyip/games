// A seeded plan gives each cue one scoring window and enough opportunities for a 100-hit run.
export const BEAT_INTERVAL=60000/108,RHYTHM_WINDOW=190,RHYTHM_PERFECT=95;
export const RHYTHM_GESTURES=['tap','heavy','rub','circle','pinch'];
export function buildRhythmPlan(random=Math.random,duration=68000){
 const unit=()=>Math.max(0,Math.min(.999999,Number(random())||0));
 const plan=[],specials=['rub','circle','pinch'];let at=BEAT_INTERVAL,ordinary=0,nextSpecial=8+Math.floor(unit()*5),count=0,bag=[];
 while(true){let type='tap';const complex=ordinary>=nextSpecial&&count<8;
  if(complex){if(!bag.length){bag=[...specials];for(let i=bag.length-1;i>0;i--){const j=Math.floor(unit()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}type=bag.pop();ordinary=0;nextSpecial=8+Math.floor(unit()*5);count++;}else{type=plan.length&&(ordinary===4||unit()>.65)?'heavy':'tap';ordinary++;}
  const start=plan.length?plan.at(-1).ends:0;at+=(complex?2:1)*BEAT_INTERVAL;if(at+RHYTHM_WINDOW>duration)break;
  plan.push({id:plan.length,type,at,start,opens:at-RHYTHM_WINDOW,ends:at+RHYTHM_WINDOW,matched:false,progress:0,required:1});
 }
 return plan;
}
