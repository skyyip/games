// Only presentation order is randomized. Answer IDs and Firestore scoring stay canonical.
const memory=new Map();
function randomIndex(upper){const values=new Uint32Array(1),limit=Math.floor(4294967296/upper)*upper;if(!globalThis.crypto?.getRandomValues)return Math.floor(Math.random()*upper);do{crypto.getRandomValues(values);}while(values[0]>=limit);return values[0]%upper;}
export function shuffleChoices(pick=randomIndex){const order=[0,1,2,3];for(let i=3;i>0;i--){const j=pick(i+1);if(!Number.isInteger(j)||j<0||j>i)throw Error('invalid-choice-order');[order[i],order[j]]=[order[j],order[i]];}return order;}
const valid=order=>Array.isArray(order)&&order.length===4&&new Set(order).size===4&&order.every(n=>Number.isInteger(n)&&n>=0&&n<4);
export function optionOrder(run,qid,{storage,pick}={}){
 if(storage===undefined)try{storage=globalThis.localStorage;}catch{}
 const key='sky.hkm.options.'+JSON.stringify([run.uid??'guest',run.id??run.day,run.startedAt,run.index,qid]);
 if(memory.has(key))return [...memory.get(key)];let order;try{order=JSON.parse(storage?.getItem(key));}catch{}
 if(!valid(order)){order=shuffleChoices(pick);try{storage?.setItem(key,JSON.stringify(order));}catch{}}
 memory.set(key,order);return [...order];
}
