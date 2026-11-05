// Spark-only transport. Every mutation is independently validated by Firestore rules.
import {SOCIAL_ROLES,SOCIAL_AVATARS} from './social-content.js';
import {rewardDay,COOP_LIMIT} from './social-game.js';
const C='career365_spark_',clean=(v,n)=>String(v??'').trim().slice(0,n),check=(yes,code='invalid-input')=>{if(!yes)throw Error(code);};
export function createSparkAdapter({sdk,db,currentUser,newId=()=>crypto.randomUUID()}){
 const ref=(kind,id,...rest)=>sdk.doc(db,C+kind,id,...rest),data=s=>s.exists()?{...s.data(),id:s.id}:null,stamp=()=>sdk.serverTimestamp();
 let actor;
 const guard=()=>{check(currentUser()?.uid===actor,'identity-changed');check(!currentUser().isAnonymous,'registered-account-required');};
 const read=async r=>{guard();const s=await sdk.getDocFromServer(r);guard();return data(s);};
 const list=async(kind,filters=[],limit=30,order='updatedAt',path=[])=>{guard();const c=path.length?sdk.collection(db,C+kind,...path):sdk.collection(db,C+kind),q=sdk.query(c,...filters.map(f=>sdk.where(...f)),...(order?[sdk.orderBy(order,'desc')]:[]),sdk.limit(limit)),s=await sdk.getDocsFromServer(q);guard();return s.docs.map(data);};
 const transaction=fn=>sdk.runTransaction(db,async t=>{guard();const get=async r=>data(await t.get(r));const result=await fn(t,get);guard();return result;});
 const safeCard=async uid=>{try{return await read(ref('profiles',uid));}catch(e){if(e.code==='permission-denied')return {uid,name:'未公開名片',avatar:'🐸',skills:[]};throw e;}};
 async function bootstrap(){
  const [account,profile,links,blocks,notes,requests,board]=await Promise.all([read(ref('accounts',actor)),read(ref('profiles',actor)),list('links',[],50,'updatedAt',[actor,'peers']),list('blocks',[],100,'updatedAt',[actor,'users']),list('inbox',[],30,'updatedAt',[actor,'notes']),list('requests',[['parties','array-contains',actor]],40),list('companies',[['listed','==',true],['status','==','active']],30)]);
  const blocked=blocks.map(x=>x.other),friends=await Promise.all(links.filter(x=>x.state==='accepted').map(x=>x.from===actor?x.to:x.from).filter(u=>!blocked.includes(u)).map(safeCard));let company=null;
  if(account?.companyId){company=await read(ref('companies',account.companyId));if(company){const [members,tasks,companyRequests,handover]=await Promise.all([Promise.all([company.owner,...company.memberIds].map(safeCard)),list('companies',[],30,'updatedAt',[company.id,'tasks']),company.owner===actor?list('requests',[['companyId','==',company.id]],40):Promise.resolve([]),read(ref('companies',company.id,'handover','current'))]);company={...company,cards:members,tasks,requests:companyRequests,handover};}}
  return {mode:'spark',uid:actor,account,profile,friends,links:links.filter(x=>!blocked.includes(x.from===actor?x.to:x.from)),blocked,notes:notes.filter(x=>!blocked.includes(x.from)),requests,board,company};
 }
 async function profile(input){
  const handle=clean(input.handle,16).toLowerCase();check(/^[a-z0-9_]{3,16}$/.test(handle));check(input.context?.runId,'life-required');
  const p={uid:actor,handle,name:clean(input.name,20),avatar:input.avatar,bio:clean(input.bio,100),status:input.status,skills:input.skills,career:input.showCareer?clean(input.context.career,100):'',discoverable:!!input.discoverable,allowInvites:!!input.allowInvites,allowReferrals:!!input.allowReferrals,retired:!!input.context.retired,updatedAt:stamp()};check(p.name&&SOCIAL_AVATARS.includes(p.avatar)&&Array.isArray(p.skills)&&p.skills.length<=3&&p.skills.every(k=>Object.hasOwn(SOCIAL_ROLES,k)));
  return transaction(async(t,get)=>{const [old,a,h]=await Promise.all([get(ref('profiles',actor)),get(ref('accounts',actor)),get(ref('handles',handle))]);check(!old||old.handle===handle,'handle-fixed');check(!h||h.uid===actor,'handle-taken');t.set(ref('profiles',actor),p);if(!h)t.set(ref('handles',handle),{uid:actor,handle});if(!a)t.set(ref('accounts',actor),{uid:actor,companyId:null,runId:input.context.runId,retired:p.retired,updatedAt:stamp()});});
 }
 async function syncLife(input){return transaction(async(t,get)=>{const a=await get(ref('accounts',actor));if(!a)return;const c=a.companyId?await get(ref('companies',a.companyId)):null,p=await get(ref('profiles',actor));const leaving=c&&c.owner!==actor&&(input.runId!==a.runId||input.retired||c.status==='closed');if(c&&c.owner===actor&&(input.runId!==a.runId||input.retired)&&c.status!=='closed')t.update(ref('companies',c.id),{status:'paused',listed:false,updatedAt:stamp()});if(leaving&&c.status!=='closed')t.update(ref('companies',c.id),{memberIds:c.memberIds.filter(u=>u!==actor),updatedAt:stamp()});t.update(ref('accounts',actor),{runId:input.runId,retired:!!input.retired,companyId:leaving||c?.status==='closed'?null:a.companyId,updatedAt:stamp()});if(p)t.update(ref('profiles',actor),{retired:!!input.retired,updatedAt:stamp()});});}
 async function find(handle){const h=await read(ref('handles',clean(handle,16).toLowerCase()));check(h,'not-found');return read(ref('profiles',h.uid));}
 async function friend(input){const other=input.uid??(await find(input.handle))?.uid;check(other&&other!==actor);return transaction(async(t,get)=>{const old=await get(ref('links',actor,'peers',other));let d;if(input.state){check(old,'not-found');d={from:old.from,to:old.to,state:input.state,updatedAt:stamp()};}else d={from:actor,to:other,state:'pending',updatedAt:stamp()};t.set(ref('links',actor,'peers',other),d);t.set(ref('links',other,'peers',actor),d);});}
 async function company(input){const id=newId();return transaction(async(t,get)=>{const a=await get(ref('accounts',actor));check(a&&!a.retired,'profile-required');check(!a.companyId,'already-employed');t.set(ref('companies',id),{id,owner:actor,name:clean(input.name,30),description:clean(input.description,160),listed:!!input.listed,status:'active',roles:['people'],terms:clean(input.terms,160),announcement:'',memberIds:[],createdAt:stamp(),updatedAt:stamp()});t.update(ref('accounts',actor),{companyId:id,updatedAt:stamp()});return id;});}
 async function companyUpdate(input){return transaction(async(t,get)=>{const c=await get(ref('companies',input.company));check(c?.owner===actor,'forbidden');const d={updatedAt:stamp()};for(const k of ['name','description','terms','announcement'])if(input[k]!==undefined)d[k]=clean(input[k],({name:30,description:160,terms:160,announcement:400})[k]);if(input.roles)d.roles=input.roles;if(input.listed!==undefined)d.listed=!!input.listed;if(input.status)d.status=input.status;if(input.status==='closed'){d.listed=false;t.update(ref('accounts',actor),{companyId:null,updatedAt:stamp()});}t.update(ref('companies',c.id),d);});}
 async function request(input){
  const c=await read(ref('companies',input.company));check(c,'not-found');const candidate=input.kind==='application'?actor:input.uid??(await find(input.handle))?.uid;check(candidate,'not-found');const id=c.id+'_'+candidate,kind=input.kind??'invite';
  const d={id,companyId:c.id,candidate,proposer:actor,parties:kind==='referral'?[c.owner,candidate,actor]:[c.owner,candidate],kind,role:input.role,terms:clean(input.terms??c.terms,160),state:kind==='invite'?'offered':kind==='application'?'requested':'referred',updatedAt:stamp()};
  return transaction(async(t,get)=>{const old=await get(ref('requests',id));check(!old||['declined','accepted'].includes(old.state),'duplicate');t.set(ref('requests',id),d);});
 }
 async function respond(input){return transaction(async(t,get)=>{const r=await get(ref('requests',input.id));check(r,'not-found');const c=await get(ref('companies',r.companyId));check(c,'not-found');const state=input.state;if(state==='accepted'){const a=await get(ref('accounts',actor));check(actor===r.candidate&&r.state==='offered','forbidden');check(a&&!a.companyId,'already-employed');check(c.memberIds.length<8,'company-full');t.update(ref('companies',c.id),{memberIds:[...c.memberIds,actor],updatedAt:stamp()});t.update(ref('accounts',actor),{companyId:c.id,updatedAt:stamp()});}const d={state,updatedAt:stamp()};if(input.terms!==undefined)d.terms=clean(input.terms,160);if(input.role)d.role=input.role;t.update(ref('requests',r.id),d);});}
 async function leave(input){return transaction(async(t,get)=>{const c=await get(ref('companies',input.company));check(c,'not-found');const uid=input.uid??actor;check(c.owner!==uid,'handover-required');check(uid===actor||c.owner===actor,'forbidden');if(c.status!=='closed')t.update(ref('companies',c.id),{memberIds:c.memberIds.filter(u=>u!==uid),updatedAt:stamp()});t.update(ref('accounts',uid),{companyId:null,updatedAt:stamp()});});}
 async function handover(input){return transaction(async(t,get)=>{const c=await get(ref('companies',input.company));check(c,'not-found');const hr=ref('companies',c.id,'handover','current'),h=await get(hr);if(!input.state){check(c.owner===actor,'forbidden');t.set(hr,{from:actor,to:input.uid,state:'pending',updatedAt:stamp()});return;}check(h?.state==='pending','not-found');if(input.state==='accepted'){check(h.to===actor,'forbidden');t.update(ref('companies',c.id),{owner:actor,memberIds:c.memberIds.filter(u=>u!==actor),status:'active',updatedAt:stamp()});t.update(ref('accounts',h.from),{companyId:null,updatedAt:stamp()});}t.update(hr,{state:input.state,updatedAt:stamp()});});}
 async function task(input){const id=input.id??newId(),tr=ref('companies',input.company,'tasks',id);return transaction(async(t,get)=>{
  const c=await get(ref('companies',input.company)),old=input.id?await get(tr):null;check(c,'not-found');
  if(!input.id){t.set(tr,{id,companyId:c.id,title:clean(input.title,80),description:clean(input.description,300),role:input.role,status:'open',assignee:null,assigneeRunId:null,delivery:'',feedback:'',createdAt:stamp(),updatedAt:stamp()});return;}
  check(old,'not-found');const d={status:input.status,updatedAt:stamp()};
  if(input.status==='claimed'&&old.status==='open'){const a=await get(ref('accounts',actor));check(a&&!a.retired,'life-required');d.assignee=actor;d.assigneeRunId=a.runId;}
  if(input.delivery!==undefined)d.delivery=clean(input.delivery,300);if(input.feedback!==undefined)d.feedback=clean(input.feedback,200);
  if(input.status==='completed'&&old.assigneeRunId){
   check(c.owner===actor&&old.status==='submitted'&&old.assignee!==actor,'forbidden');
   const [a,reviewer,worker]=await Promise.all([get(ref('accounts',actor)),get(ref('profiles',actor)),get(ref('profiles',old.assignee))]);check(a&&!a.retired&&reviewer&&worker,'life-required');
   const rid=c.id+'_'+id,base={id:rid,companyId:c.id,taskId:id,companyName:c.name,title:old.title,role:old.role,delivery:old.delivery,feedback:d.feedback??old.feedback,state:'pending',createdAt:stamp(),grantedAt:null};
   t.set(ref('rewards',old.assignee,'receipts',rid),{...base,uid:old.assignee,peer:actor,peerName:reviewer.name,runId:old.assigneeRunId,kind:'delivery'});
   t.set(ref('rewards',actor,'receipts',rid),{...base,uid:actor,peer:old.assignee,peerName:worker.name,runId:a.runId,kind:'review'});
  }
  t.update(tr,d);
 });}
 async function history(input={}){
  guard();const constraints=[sdk.orderBy('createdAt','desc'),sdk.orderBy(sdk.documentId(),'desc')];
  if(input.after){const cursor=await sdk.getDocFromServer(ref('rewards',actor,'receipts',input.after));guard();check(cursor.exists(),'not-found');constraints.push(sdk.startAfter(cursor));}
  const result=await sdk.getDocsFromServer(sdk.query(sdk.collection(db,C+'rewards',actor,'receipts'),...constraints,sdk.limit(20)));guard();return result.docs.map(data);
 }
 async function claimReward(input){try{return await transaction(async(t,get)=>{
  const rr=ref('rewards',actor,'receipts',input.id),r=await get(rr),a=await get(ref('accounts',actor));check(r,'not-found');check(a&&!a.retired&&a.runId===r.runId,'reward-life');
  if(r.state==='granted')return r;
  const day=rewardDay(),qr=ref('rewards',actor,'days',String(day)),q=await get(qr);check((q?.count??0)<COOP_LIMIT,'reward-limit');
  t.update(rr,{state:'granted',grantedAt:stamp()});t.set(qr,{count:(q?.count??0)+1,receipt:r.id,updatedAt:stamp()});return {...r,state:'granted'};
 });}catch(error){
  // A competing commit may be rejected by rules after the other grant wins.
  // Re-read the authoritative result; never turn a denied pending claim into growth.
  if(error.code!=='permission-denied')throw error;
  const [r,a]=await Promise.all([read(ref('rewards',actor,'receipts',input.id)),read(ref('accounts',actor))]);
  if(r?.state==='granted'&&a&&!a.retired&&a.runId===r.runId)return r;throw error;
 }}
 const actions={bootstrap,history,claimReward,publishProfile:profile,syncLife,findCard:i=>find(i.handle),friend,createCompany:company,updateCompany:companyUpdate,request,respond,leaveCompany:leave,handover,task,
  async note(i){guard();await sdk.setDoc(ref('inbox',i.uid,'notes',actor),{from:actor,to:i.uid,kind:i.kind,updatedAt:stamp()});},
  async block(i){await transaction(async(t,get)=>{const p=await get(ref('links',actor,'peers',i.uid));t.set(ref('blocks',actor,'users',i.uid),{uid:actor,other:i.uid,updatedAt:stamp()});if(p){const d={from:p.from,to:p.to,state:'closed',updatedAt:stamp()};t.set(ref('links',actor,'peers',i.uid),d);t.set(ref('links',i.uid,'peers',actor),d);}});},
  async unblock(i){guard();await sdk.deleteDoc(ref('blocks',actor,'users',i.uid));},
  async report(i){guard();await sdk.setDoc(ref('reports',actor+'_'+i.uid),{from:actor,to:i.uid,reason:i.reason,updatedAt:stamp()});}
 };
 // Each adapter is bound to a single account. A later account gets a fresh adapter.
 return {async call(action,input={},uid){if(actor&&actor!==uid)throw Error('identity-changed');actor=uid;guard();check(Object.hasOwn(actions,action));const result=await actions[action](input);guard();return result;}};
}
