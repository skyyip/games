// Accept the original single-result save as well as the per-account queue.
export class PendingResults {
 constructor(raw=null){
  let saved;try{saved=JSON.parse(raw);}catch{saved=null;}
  this.runs=[];this.inFlight=new Map();
  for(const run of Array.isArray(saved)?saved:[saved]){
   if(run&&typeof run.id==='string'&&run.id&&typeof run.uid==='string'&&run.uid&&Number.isSafeInteger(run.score)&&run.score>=0&&run.score<=1e6&&(run.bonusCoins===undefined||Number.isSafeInteger(run.bonusCoins)&&run.bonusCoins>=0&&run.bonusCoins<=run.score*3)&&!this.runs.some(r=>r.id===run.id&&r.uid===run.uid))this.runs.push({id:run.id,uid:run.uid,score:run.score,animal:run.animal,...(run.bonusCoins===undefined?{}:{bonusCoins:run.bonusCoins})});
  }
 }
 get(uid){return this.runs.find(run=>run.uid===uid)??null;}
 add(run){if(!this.runs.some(r=>r.id===run.id&&r.uid===run.uid))this.runs.push({...run});}
 settle(uid,send){
  const run=this.get(uid);if(!run)return Promise.resolve(null);
  if(this.inFlight.has(run))return this.inFlight.get(run);
  const remove=()=>{this.runs=this.runs.filter(r=>r!==run);};
  const request=Promise.resolve().then(()=>send({...run})).then(done=>{remove();return done;},error=>{
   if(['run-replaced','run-missing'].includes(error?.message))remove();
   throw error;
  }).finally(()=>this.inFlight.delete(run));
  this.inFlight.set(run,request);return request;
 }
}
