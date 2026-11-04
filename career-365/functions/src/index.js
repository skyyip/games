import {randomUUID} from 'node:crypto';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {onCall,HttpsError} from 'firebase-functions/v2/https';
import {onSchedule} from 'firebase-functions/v2/scheduler';
import {logger} from 'firebase-functions';
import {createSocialService,SocialError,socialActor} from './service.js';
initializeApp();const db=getFirestore();
function query(collection,filters,options={}){let q=db.collection(collection);for(const [key,op,value]of filters)q=q.where(key,op,value);if(options.order)q=q.orderBy(options.order,options.direction??'desc');return q.limit(options.limit??40);}
const store={transaction:work=>db.runTransaction(async tx=>work({async get(path){const s=await tx.get(db.doc(path));return s.exists?s.data():null;},async query(collection,filters,options){return (await tx.get(query(collection,filters,options))).docs.map(d=>d.data());},set:(path,data)=>tx.set(db.doc(path),data)}))};
const service=createSocialService({store,newId:randomUUID});
export const careerSocial=onCall({region:'asia-east1',maxInstances:10,timeoutSeconds:30,memory:'256MiB',enforceAppCheck:process.env.SOCIAL_REQUIRE_APP_CHECK==='true'},async request=>{
 let uid;try{uid=socialActor(request.auth,request.data?.actorUid);}catch(e){throw new HttpsError(e.code==='signin'?'unauthenticated':'failed-precondition',e.code);}
 const {action,input={}}=request.data??{};if(typeof action!=='string'||action.length>40)throw new HttpsError('invalid-argument','invalid-input');
 try{return await service.execute(uid,action,input);}catch(e){if(e instanceof SocialError)throw new HttpsError(e.code==='rate-limit'?'resource-exhausted':'failed-precondition',e.code);logger.error('careerSocial failed',{action,code:e.code??'internal'});throw new HttpsError('internal',e.code===9?'social-index-required':'social-unavailable');}
});
export const careerSocialCleanup=onSchedule({region:'asia-east1',schedule:'every 60 minutes',timeZone:'Asia/Tokyo',maxInstances:1,timeoutSeconds:120},async()=>{
 const rows=await db.collection('career365_tasks').where('status','in',['open','claimed','revision']).where('expiresAt','<=',Date.now()).orderBy('expiresAt').limit(100).get();
 for(const d of rows.docs)await service.expire(d.id);
});
