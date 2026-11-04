export function socialContext(game){const s=game.s;return {runId:s.life.socialRunId??null,name:s.profile.name,career:s.career,retired:s.status==='retired',npcSlots:s.business?.staff??0,skills:Object.entries(s.skills).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k)};}
// Legacy receipt fields remain readable in old saves. Spark never awards local growth.
export function applySocialReceipt(){return false;}
