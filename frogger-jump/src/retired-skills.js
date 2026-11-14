// Kept only to return the original purchase cost once; these items cannot be equipped.
export const RETIRED_SKILL_PRICES=Object.freeze({double:640,adjust:800,prune:720,anchor:880,shield:960,rescue:1000});
export function retiredSkillCredit(profile){return [...new Set(Array.isArray(profile.ownedSkills)?profile.ownedSkills:[])].reduce((sum,id)=>sum+(Object.hasOwn(RETIRED_SKILL_PRICES,id)?RETIRED_SKILL_PRICES[id]:0),0);}
