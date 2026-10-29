// Optional goals reward varied play; a round never requires reading a checklist.
export function shiftGoals(g) {
  if(g.mode==='sister')return [
    {id:'goalPokes',icon:'🩴',value:g.pokes||0,target:12,reward:12},
    {id:'goalPerfect',icon:'✨',value:g.perfects||0,target:3,reward:15},
    {id:'goalSpotlight',icon:'⭐',value:g.spotlightPokes||0,target:2,reward:18},
  ];
  if(g.mode==='diner')return [
    {id:'goalDodges',icon:'👟',value:g.diners?.[0]?.dodges||0,target:6,reward:12},
    {id:'goalLastSecond',icon:'⚡',value:g.perfectDodges||0,target:3,reward:15},
    {id:'goalMeal',icon:'🥐',value:g.food>=100&&g.drink>=100?1:0,target:1,reward:20},
  ];
  return [];
}
export const shiftBonus=g=>shiftGoals(g).reduce((sum,goal)=>sum+(goal.value>=goal.target?goal.reward:0),0);
export const shiftRank=g=>Math.min(3,shiftGoals(g).filter(goal=>goal.value>=goal.target).length);
