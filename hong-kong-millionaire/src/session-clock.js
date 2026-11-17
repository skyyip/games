// Server write acknowledgements anchor extra-mode deadlines to a monotonic clock.
// Device wall-clock changes must never skip questions or create retry storms.
export function createSessionClock({wall=()=>Date.now(),mono=()=>performance.now()}={}){
 let epoch=null,anchor=0,uncertainty=0;
 return {lowerBound:()=>epoch===null?wall():epoch+mono()-anchor-uncertainty,now:()=>epoch===null?wall():epoch+mono()-anchor,
  observe(stamp,sent,received){const value=stamp?.toMillis?.()??stamp;if(!Number.isFinite(value)||!Number.isFinite(sent)||received<sent)return;epoch=value;anchor=(sent+received)/2;uncertainty=(received-sent)/2+2;},
  reset(){epoch=null;anchor=0;uncertainty=0;},get ready(){return epoch!==null;}};
}
export const sessionClock=createSessionClock();
