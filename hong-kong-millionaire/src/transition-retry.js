// Bound retries even when a successful request returns the unchanged session.
// A new question/phase receives its own budget; manual reconnect resets it.
export function createTransitionRetry({now=()=>performance.now(),limit=3,delay=1000}={}){
 let current='',attempts=0,retryAt=0;
 return {
  begin(key){if(key!==current){current=key;attempts=0;retryAt=0;}if(attempts>=limit||now()<retryAt)return false;attempts++;retryAt=now()+delay*2**(attempts-1);return true;},
  exhausted:key=>key===current&&attempts>=limit,
  reset(){current='';attempts=0;retryAt=0;}
 };
}
export const timingWait=error=>['room-wait','not-expired','not-ready'].includes(String(error?.code??error?.message??'').replace(/^firestore\//,''));
