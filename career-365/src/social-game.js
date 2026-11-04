export function socialContext(game){const s=game.s;return {runId:s.life.socialRunId??null,name:s.profile.name,career:s.career,retired:s.status==='retired',npcSlots:s.business?.staff??0,skills:Object.entries(s.skills).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k)};}
export function applySocialReceipt(game,receipt,uid){
 const s=game.s;if(!receipt||receipt.assignee!==uid||receipt.runId!==s.life.socialRunId||receipt.status!=='completed'||!Number.isInteger(receipt.score)||receipt.score<70||receipt.score>100||typeof receipt.id!=='string'||!/^[A-Za-z0-9_-]{16,100}$/.test(receipt.id)||!Object.hasOwn(s.skills,receipt.role)||!game.can(1,8))return false;
 const claims=s.life.socialClaims??[];if(claims.includes(receipt.id)||claims.length>=1600)return false;
 game.spend(8);const skill=s.skills[receipt.role];s.skills[receipt.role]=Math.min(100,skill+.8*Math.max(.12,1-skill/110));game.changeStats({contacts:1,reputation:2,jq:.15});s.life.socialClaims=[...claims,receipt.id];
 game.record('work','和另一位玩家，完成一份委託',`${String(receipt.companyName??'合作公司').slice(0,30)}｜${String(receipt.title??'合作委託').slice(0,100)}：交付${receipt.score}/100。合作點已由線上帳本結算；你用一次本月安排，把合作經驗留在這段人生。`);return true;
}
