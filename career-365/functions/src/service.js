import {SOCIAL_ROLES,SOCIAL_STATUS,SOCIAL_AVATARS,QUICK_NOTES} from '../../src/social-content.js';
import {JOBS} from '../../src/content.js';
import {SCENARIOS} from './scenarios.js';
const A=id=>`career365_social_accounts/${id}`,P=id=>`career365_cards/${id}`,C=id=>`career365_companies/${id}`,I=id=>`career365_invites/${id}`,T=id=>`career365_tasks/${id}`;
const DAY=86400000,OPEN=['open','claimed','revision'];
export class SocialError extends Error{constructor(code){super(code);this.code=code;}}
const need=(yes,code='invalid-input')=>{if(!yes)throw new SocialError(code);};
export function socialActor(auth,expectedUid){need(auth&&typeof auth.uid==='string'&&auth.uid.length>0,'signin');const identity=auth.token?.firebase?.identities??{},linked=['email','google.com'].some(key=>Array.isArray(identity[key])&&identity[key].length>0);need(auth.token?.firebase?.sign_in_provider!=='anonymous'||linked,'registered-account-required');need(expectedUid===auth.uid,'identity-changed');return auth.uid;}
const text=(v,max=80)=>{need(typeof v==='string'&&v.trim().length>0&&v.trim().length<=max);return v.trim();};
const id=v=>{need(typeof v==='string'&&/^[A-Za-z0-9_-]{1,128}$/.test(v));return v;};
const integer=(v,min,max)=>{need(Number.isSafeInteger(v)&&v>=min&&v<=max);return v;};
const handle=v=>{const h=text(v,16).toLowerCase();need(/^[a-z0-9_]{3,16}$/.test(h));return h;};
const role=v=>{need(Object.hasOwn(SOCIAL_ROLES,v));return v;};
const append=(list,value,max=50)=>[...list.filter(x=>x!==value),value].slice(-max);
function card(p,a){return p?{uid:p.uid,handle:p.handle,name:p.name,avatar:p.avatar,bio:p.bio,career:p.showCareer?p.career:null,skills:p.skills,status:p.retired?'mentor':p.status,retired:p.retired,allowInvites:p.allowInvites,allowReferrals:p.allowReferrals,reputation:a?.reputation??0,completed:a?.completed??0}:null;}
function taskDTO(t,viewer){if(!t)return null;return {id:t.id,companyId:t.companyId,companyName:t.companyName,role:t.role,title:t.title,context:t.context,priority:t.priority,reward:t.reward,status:t.status,assignee:t.assignee,runId:t.assignee===viewer?t.runId:null,expiresAt:t.expiresAt,attempts:t.attempts,score:t.score??null,feedback:t.feedback??null,questions:t.questions.map(([prompt,options])=>({prompt,options})),createdAt:t.createdAt};}
// Stage all writes until every Firestore transaction read has completed.
function unit(raw){const pending=new Map(),cache=new Map();return {async get(path){if(pending.has(path))return structuredClone(pending.get(path));if(!cache.has(path))cache.set(path,Promise.resolve(raw.get(path)));return structuredClone(await cache.get(path));},query:(...a)=>raw.query(...a),set:(path,data)=>pending.set(path,structuredClone(data)),async flush(){for(const [path,data]of pending)raw.set(path,data);}};}
export function createSocialService({store,now=()=>Date.now(),newId}){
 async function execute(uid,action,input={}){
  need(typeof uid==='string'&&uid.length>0,'signin');need(input&&typeof input==='object'&&!Array.isArray(input));need(JSON.stringify(input).length<=12000);
  await store.transaction(async raw=>{const tx=unit(raw),time=now();let account=await tx.get(A(uid));
   if(!account){account={uid,balance:5000,reputation:0,completed:0,friends:[],blocked:[],receipts:[],ownedCompany:null,memberCompany:null,companyHistory:[],rateStart:time,rateCount:0};tx.set(`career365_social_ledger/start_${uid}`,{kind:'starter',uid,amount:5000,at:time});}
   if(time-account.rateStart>=60000){account.rateStart=time;account.rateCount=0;}need(account.rateCount<40,'rate-limit');account.rateCount++;tx.set(A(uid),account);await tx.flush();});
  return store.transaction(async raw=>{const tx=unit(raw),time=now(),account=await tx.get(A(uid));
   const mine=await tx.get(P(uid));
   const getAccount=async who=>{const a=await tx.get(A(who));need(a,'not-found');return a;};
   const pair=async other=>{const a=await getAccount(other);need(other!==uid&&!account.blocked.includes(other)&&!a.blocked.includes(uid),'blocked');return a;};
   const find=async code=>{const h=await tx.get(`career365_handles/${handle(code)}`);need(h,'not-found');const p=await tx.get(P(h.uid));need(p,'not-found');const a=await pair(p.uid);need(p.discoverable||account.friends.includes(p.uid),'not-found');return {p,a};};
   const activeProfile=()=>need(mine&&!mine.retired,'profile-required');
   const company=async companyId=>{const c=await tx.get(C(id(companyId)));need(c,'not-found');return c;};
   const owned=async companyId=>{const c=await company(companyId);need(c.owner===uid,'forbidden');return c;};
   const activeCompany=c=>{activeProfile();need(c.status==='active'&&c.runId===mine.runId,'company-paused');};
   const finishTask=async(t,c,status)=>{if(!OPEN.includes(t.status))return;t.status=status;t.finishedAt=time;c.fund+=t.reward;c.tasks=c.tasks.filter(k=>k!==t.id);c.historyTasks=append(c.historyTasks,t.id,30);tx.set(T(t.id),t);tx.set(`career365_social_ledger/refund_${t.id}`,{kind:'refund',companyId:c.id,amount:t.reward,taskId:t.id,at:time});};
   const cancelMemberTasks=async(c,who=null)=>{for(const key of c.tasks){const t=await tx.get(T(key));if(t&&(!who||t.assignee===who))await finishTask(t,c,'cancelled');}};
   const suspendLife=async(p,runId,retired)=>{
    if(p.runId===runId&&p.retired===retired)return;
    if(account.memberCompany){const c=await company(account.memberCompany);await cancelMemberTasks(c,uid);c.members=c.members.filter(m=>m.uid!==uid);tx.set(C(c.id),c);account.companyHistory=append(account.companyHistory,c.id,20);account.memberCompany=null;}
    if(account.ownedCompany){const c=await owned(account.ownedCompany);if(c.status!=='closed'){await cancelMemberTasks(c);c.status='handover';c.vacancies=[];tx.set(C(c.id),c);}}
    p.runId=runId;p.retired=retired;p.status='settled';tx.set(P(uid),p);tx.set(A(uid),account);
   };
   const makeInvite=async({kind,candidate,owner=uid,companyId=null,jobRole=null,minReward=500,referrer=null})=>{
    if(kind==='friend')need(mine,'profile-required');else activeProfile();const target=await tx.get(P(candidate));need(target&&(!target.retired||kind==='friend')&&(kind==='application'||target.allowInvites),'invites-disabled');const other=candidate===uid?account:await pair(candidate);need(!other.ownedCompany&&!other.memberCompany||kind==='friend','already-employed');
    const parties=[...new Set([uid,candidate,owner,referrer].filter(Boolean))],recent=await tx.query('career365_invites',[['parties','array-contains',uid]],{order:'createdAt',limit:40});
    need(!recent.some(r=>['pending','review','countered'].includes(r.status)&&r.kind===kind&&r.candidate===candidate&&r.companyId===companyId&&r.owner===owner&&(kind==='friend'||r.targetRun===target.runId)&&r.expiresAt>time),'duplicate');
    need(recent.filter(r=>['pending','review','countered'].includes(r.status)&&r.expiresAt>time).length<20,'invite-limit');
    const invite={id:newId(),kind,sender:uid,candidate,owner,companyId,role:jobRole,minReward,referrer,targetRun:target.runId,next:kind==='application'?owner:candidate,status:'pending',parties,createdAt:time,expiresAt:time+14*DAY};tx.set(I(invite.id),invite);return {inviteId:invite.id};
   };
   let result;
   if(action==='bootstrap'){
    const privateCompanies=[];for(const key of [...new Set([account.ownedCompany,account.memberCompany].filter(Boolean))]){
     const c=await company(key);const roster=await Promise.all(c.members.map(async m=>{const [p,a]=await Promise.all([tx.get(P(m.uid)),tx.get(A(m.uid))]);return {uid:m.uid,role:m.role,minReward:m.minReward,completed:m.completed??0,card:card(p,a)};}));
     const tasks=[];let expired=false;const loadedTasks=await Promise.all([...new Set([...c.tasks,...c.historyTasks.slice(-12)])].map(key=>tx.get(T(key))));for(const t of loadedTasks){if(t){if(OPEN.includes(t.status)&&t.expiresAt<=time){await finishTask(t,c,'expired');expired=true;}tasks.push(taskDTO(t,uid));}}if(expired)tx.set(C(c.id),c);
     const {runId:privateRun,...visibleCompany}=c;privateCompanies.push({...visibleCompany,ownerCard:card(await tx.get(P(c.owner)),await tx.get(A(c.owner))),members:roster,tasks:tasks.sort((a,b)=>b.createdAt-a.createdAt)});
    }
    const invitations=(await tx.query('career365_invites',[['parties','array-contains',uid]],{order:'createdAt',limit:40})).filter(i=>i.parties.every(p=>!account.blocked.includes(p))).map(i=>({...i,expired:i.expiresAt<=time}));
    await Promise.all(invitations.map(async i=>{const [sender,candidate,company]=await Promise.all([tx.get(P(i.sender)),tx.get(P(i.candidate)),i.companyId?tx.get(C(i.companyId)):null]);if(['pending','review','countered'].includes(i.status)&&(i.expiresAt<=time||i.kind!=='friend'&&(!candidate||candidate.retired||candidate.runId!==i.targetRun||!company||company.status==='closed'||company.owner!==i.owner))){i.status='expired';tx.set(I(i.id),i);}i.senderName=sender?.name??'玩家';i.candidateName=candidate?.name??'玩家';i.companyName=company?.name??'';delete i.targetRun;}));
    const friends=await Promise.all(account.friends.map(async other=>{const [a,p]=await Promise.all([tx.get(A(other)),tx.get(P(other))]);return a&&!a.blocked.includes(uid)&&!account.blocked.includes(other)?card(p,a):null;}));
    const board=(await tx.query('career365_companies',[['listed','==',true],['status','==','active']],{order:'createdAt',limit:30})).filter(c=>!account.blocked.includes(c.owner)).map(c=>({id:c.id,name:c.name,description:c.description,owner:c.owner,freeSlots:8-c.npcSlots-c.members.length,reputation:c.reputation??0,vacancies:c.vacancies}));
    const notes=(await tx.query('career365_notes',[['parties','array-contains',uid]],{order:'createdAt',limit:30})).filter(n=>!account.blocked.includes(n.from));
    const receipts=(await Promise.all(account.receipts.slice(-30).map(key=>tx.get(T(key))))).filter(t=>t?.status==='completed'&&t.assignee===uid).map(t=>taskDTO(t,uid));
    const blockedNames=Object.fromEntries(await Promise.all(account.blocked.map(async other=>[other,(await tx.get(P(other)))?.name??'已封鎖玩家'])));
    result={uid,balance:account.balance,reputation:account.reputation,completed:account.completed,profile:mine?{...card(mine,account),runId:mine.runId,discoverable:mine.discoverable,showCareer:mine.showCareer}:null,friends:friends.filter(Boolean),blocked:account.blocked,blockedNames,invitations,companies:privateCompanies,board,notes,receipts,catalog:Object.entries(SOCIAL_ROLES).map(([key,name])=>({id:key,name,title:SCENARIOS[key].title}))};
   }else if(action==='publishProfile'){
    const h=handle(input.handle),runId=text(input.runId,64);need(/^[a-zA-Z0-9_-]{16,64}$/.test(runId));need(SOCIAL_AVATARS.includes(input.avatar));need(Object.hasOwn(SOCIAL_STATUS,input.status));need(Array.isArray(input.skills)&&input.skills.length>0&&input.skills.length<=3&&new Set(input.skills).size===input.skills.length);input.skills.forEach(role);need(input.career===null||JOBS.some(j=>j.id===input.career));need(['discoverable','allowInvites','allowReferrals','showCareer','retired'].every(k=>typeof input[k]==='boolean'));
    need(!mine||mine.handle===h,'handle-fixed');const registry=await tx.get(`career365_handles/${h}`);need(!registry||registry.uid===uid,'handle-taken');if(mine)await suspendLife(mine,runId,input.retired);
    const p={uid,handle:h,runId,name:text(input.name,20),avatar:input.avatar,bio:typeof input.bio==='string'?input.bio.trim().slice(0,100):'',career:input.career,skills:input.skills,status:input.status,retired:input.retired,discoverable:input.discoverable,allowInvites:input.allowInvites,allowReferrals:input.allowReferrals,showCareer:input.showCareer,updatedAt:time};tx.set(P(uid),p);tx.set(`career365_handles/${h}`,{uid});result={saved:true};
   }else if(action==='syncLife'){
    need(mine,'profile-required');need(typeof input.retired==='boolean');const runId=text(input.runId,64);need(/^[a-zA-Z0-9_-]{16,64}$/.test(runId));await suspendLife(mine,runId,input.retired);result={synced:true};
   }else if(action==='lookup'){
    const {p,a}=await find(input.handle);result=card(p,a);
   }else if(action==='friend'){
    const {p}=await find(input.handle);need(!account.friends.includes(p.uid),'already-friends');result=await makeInvite({kind:'friend',candidate:p.uid});
   }else if(action==='removeFriend'){
    const target=id(input.uid),other=await getAccount(target);account.friends=account.friends.filter(k=>k!==target);other.friends=other.friends.filter(k=>k!==uid);tx.set(A(target),other);tx.set(A(uid),account);result={removed:true};
   }else if(action==='createCompany'){
    activeProfile();need(!account.ownedCompany&&!account.memberCompany,'already-employed');const npcSlots=integer(input.npcSlots,0,8),deposit=integer(input.deposit,500,5000);need(account.balance>=deposit,'insufficient-funds');need(typeof input.listed==='boolean');const c={id:newId(),owner:uid,runId:mine.runId,name:text(input.name,30),description:text(input.description,160),listed:input.listed,status:'active',npcSlots,members:[],vacancies:[],fund:deposit,tasks:[],historyTasks:[],announcements:[],followups:[],reputation:0,createdAt:time};account.balance-=deposit;account.ownedCompany=c.id;tx.set(A(uid),account);tx.set(C(c.id),c);tx.set(`career365_social_ledger/fund_${c.id}`,{kind:'fund',uid,companyId:c.id,amount:deposit,at:time});result={companyId:c.id};
   }else if(action==='fundCompany'){
    const c=await owned(input.companyId);activeCompany(c);const amount=integer(input.amount,100,100000);need(account.balance>=amount,'insufficient-funds');account.balance-=amount;c.fund+=amount;tx.set(A(uid),account);tx.set(C(c.id),c);tx.set(`career365_social_ledger/fund_${newId()}`,{kind:'fund',uid,companyId:c.id,amount,at:time});result={fund:c.fund};
   }else if(action==='vacancy'){
    const c=await owned(input.companyId);activeCompany(c);role(input.role);need(c.members.length+c.npcSlots<8,'company-full');const v={role:input.role,title:text(input.title,30),minReward:integer(input.minReward,100,2500),terms:'合作委託制，按完成成果結算；保留原有主職業'};c.vacancies=[...c.vacancies.filter(x=>x.role!==v.role),v].slice(0,8);tx.set(C(c.id),c);result={published:true};
   }else if(action==='npcSlots'){
    const c=await owned(input.companyId);activeCompany(c);const count=integer(input.count,0,8);need(c.members.length+count<=8,'company-full');c.npcSlots=count;tx.set(C(c.id),c);result={saved:true};
   }else if(action==='inviteMember'||action==='refer'||action==='apply'){
    activeProfile();const c=await company(input.companyId);need(c.status==='active','company-paused');need(c.members.length+c.npcSlots<8,'company-full');role(input.role);const vacancy=c.vacancies.find(v=>v.role===input.role);need(vacancy,'vacancy-required');
    if(action==='apply'){need(!account.ownedCompany&&!account.memberCompany,'already-employed');await pair(c.owner);result=await makeInvite({kind:'application',candidate:uid,owner:c.owner,companyId:c.id,jobRole:input.role,minReward:vacancy.minReward});}
    else{const {p}=await find(input.handle);if(action==='inviteMember')need(c.owner===uid,'forbidden');else need(account.friends.includes(p.uid)&&p.allowReferrals&&c.owner!==uid&&p.uid!==c.owner,'referral-disabled');await pair(c.owner===uid?p.uid:c.owner);result=await makeInvite({kind:action==='refer'?'referral':'company',candidate:p.uid,owner:c.owner,companyId:c.id,jobRole:input.role,minReward:vacancy.minReward,referrer:action==='refer'?uid:null});}
   }else if(action==='replyInvite'){
    const i=await tx.get(I(id(input.inviteId)));need(i&&i.next===uid,'forbidden');need(['pending','review','countered'].includes(i.status),'already-resolved');if(i.expiresAt<=time){i.status='expired';tx.set(I(i.id),i);result={status:'expired'};}
    else if(input.decision==='decline'){i.status='declined';tx.set(I(i.id),i);result={status:i.status};}
    else if(input.decision==='counter'){
     need(i.kind!=='friend'&&i.kind!=='handover'&&uid===i.candidate,'forbidden');i.minReward=integer(input.minReward,100,2500);i.status='countered';i.next=i.owner;tx.set(I(i.id),i);result={status:i.status};
    }else{need(input.decision==='accept');for(const other of i.parties.filter(k=>k!==uid))await pair(other);
     if(i.kind==='friend'){const other=await getAccount(i.sender);need(account.friends.length<50&&other.friends.length<50,'friend-limit');account.friends=append(account.friends,i.sender);other.friends=append(other.friends,uid);tx.set(A(i.sender),other);tx.set(A(uid),account);i.status='accepted';}
     else{const c=await company(i.companyId),candidate=await tx.get(P(i.candidate)),a=await getAccount(i.candidate);if(!candidate||candidate.retired||candidate.runId!==i.targetRun){i.status='expired';tx.set(I(i.id),i);await tx.flush();return {status:'expired'};}need(c.owner===i.owner&&c.status!=='closed','company-paused');
      if(i.kind==='handover'){need(c.members.some(m=>m.uid===uid)&&!account.ownedCompany,'forbidden');await cancelMemberTasks(c,uid);const previous=await getAccount(c.owner);previous.ownedCompany=null;previous.companyHistory=append(previous.companyHistory,c.id,20);tx.set(A(c.owner),previous);c.members=c.members.filter(m=>m.uid!==uid);c.owner=uid;c.runId=candidate.runId;c.status='active';account.memberCompany=null;account.ownedCompany=c.id;tx.set(A(uid),account);i.status='accepted';}
      else if(i.status==='countered'){need(uid===c.owner,'forbidden');i.status='pending';i.next=i.candidate;}
      else if(i.kind==='referral'&&uid===i.candidate){i.status='review';i.next=c.owner;}
      else{need(c.status==='active'&&!a.ownedCompany&&!a.memberCompany,'already-employed');need(c.members.length+c.npcSlots<8,'company-full');c.members.push({uid:i.candidate,runId:candidate.runId,role:i.role,minReward:i.minReward,referrer:i.referrer,referralCredited:false,completed:0,joinedAt:time});a.memberCompany=c.id;tx.set(A(i.candidate),a);i.status='accepted';}
      tx.set(C(c.id),c);
     }tx.set(I(i.id),i);result={status:i.status};
    }
   }else if(action==='createTask'){
    const c=await owned(input.companyId);activeCompany(c);const key=role(input.role),reward=integer(input.reward,100,2500),priority=integer(input.priority,0,2),followup=input.followupId?(c.followups??[]).find(f=>f.id===input.followupId):null;if(input.followupId)need(followup&&followup.role===key&&followup.availableAt<=time,'not-found');need(c.fund>=reward,'insufficient-funds');need(c.tasks.length<20,'task-limit');const template=SCENARIOS[key],t={id:newId(),companyId:c.id,companyName:c.name,role:key,title:template.title,context:template.context,priority,reward,status:'open',assignee:null,runId:null,attempts:0,questions:structuredClone(template.questions),createdAt:time,expiresAt:time+14*DAY};if(followup){t.title='回頭客｜'+t.title;t.context+=' 上次合作帶來新的委託，這次要保留交接與改進紀錄。';c.followups=c.followups.filter(f=>f.id!==followup.id);}c.fund-=reward;c.tasks.push(t.id);tx.set(C(c.id),c);tx.set(T(t.id),t);tx.set(`career365_social_ledger/reserve_${t.id}`,{kind:'reserve',companyId:c.id,taskId:t.id,amount:reward,at:time});result={taskId:t.id};
   }else if(action==='claimTask'||action==='submitTask'||action==='cancelTask'){
    const t=await tx.get(T(id(input.taskId)));need(t,'not-found');const c=await company(t.companyId);need(c.owner===uid||c.members.some(m=>m.uid===uid),'forbidden');
    if(OPEN.includes(t.status)&&t.expiresAt<=time){await finishTask(t,c,'expired');tx.set(C(c.id),c);result={status:'expired'};}
    else if(action==='cancelTask'){need(c.owner===uid||t.assignee===uid,'forbidden');need(OPEN.includes(t.status),'already-resolved');await finishTask(t,c,'cancelled');tx.set(C(c.id),c);result={status:t.status};}
    else{activeProfile();need(c.status==='active','company-paused');await pair(c.owner);const m=c.members.find(m=>m.uid===uid);need(m&&m.runId===mine.runId&&m.role===t.role&&t.reward>=m.minReward,'role-mismatch');
     if(action==='claimTask'){need(t.status==='open','already-claimed');t.status='claimed';t.assignee=uid;t.runId=mine.runId;tx.set(T(t.id),t);result=taskDTO(t,uid);}
     else{need(t.assignee===uid&&t.runId===mine.runId&&['claimed','revision'].includes(t.status),'already-resolved');need(Array.isArray(input.answers)&&input.answers.length===3);input.answers.forEach(n=>integer(n,0,2));const approach=integer(input.approach,0,2);const correct=t.questions.reduce((n,q,k)=>n+(input.answers[k]===q[2]?1:0),0);t.score=correct*25+(approach===t.priority?25:10);t.attempts++;t.feedback=t.questions.map(q=>q[3]);
      if(t.score>=70){t.status='completed';t.finishedAt=time;account.balance+=t.reward;account.completed++;m.completed=(m.completed??0)+1;c.reputation=(c.reputation??0)+1;c.announcements=append(c.announcements,`${mine.name}完成「${t.title}」，合作成果已記入公司紀錄。`,12);c.followups=[...(c.followups??[]),{id:newId(),sourceTask:t.id,role:t.role,title:'合作口碑帶來新的委託',availableAt:time+2*DAY}].slice(-8);account.reputation+=t.score===100?3:2;account.receipts=append(account.receipts,t.id,50);tx.set(A(uid),account);c.tasks=c.tasks.filter(k=>k!==t.id);c.historyTasks=append(c.historyTasks,t.id,30);tx.set(`career365_social_ledger/task_${t.id}`,{kind:'task',companyId:c.id,uid,amount:t.reward,at:time});if(m.referrer&&!m.referralCredited){const referrer=await getAccount(m.referrer);referrer.reputation++;m.referralCredited=true;tx.set(A(m.referrer),referrer);}}
      else if(t.attempts<2)t.status='revision';else await finishTask(t,c,'failed');tx.set(T(t.id),t);tx.set(C(c.id),c);result=taskDTO(t,uid);
     }
    }
   }else if(action==='leaveCompany'||action==='removeMember'){
    const c=await company(input.companyId),target=action==='leaveCompany'?uid:id(input.uid);need(action==='leaveCompany'||c.owner===uid,'forbidden');need(c.members.some(m=>m.uid===target),'not-found');await cancelMemberTasks(c,target);c.members=c.members.filter(m=>m.uid!==target);const a=await getAccount(target);a.memberCompany=null;a.companyHistory=append(a.companyHistory,c.id,20);tx.set(A(target),a);tx.set(C(c.id),c);result={left:true};
   }else if(action==='handover'){
    const c=await owned(input.companyId),target=id(input.uid),p=await tx.get(P(target));need(p&&!p.retired&&p.allowInvites&&c.members.some(m=>m.uid===target),'not-found');await pair(target);const invite={id:newId(),kind:'handover',sender:uid,candidate:target,owner:uid,companyId:c.id,role:null,minReward:0,referrer:null,targetRun:p.runId,next:target,status:'pending',parties:[uid,target],createdAt:time,expiresAt:time+14*DAY};tx.set(I(invite.id),invite);result={inviteId:invite.id};
   }else if(action==='closeCompany'){
    const c=await owned(input.companyId);need(c.status!=='closed','already-resolved');await cancelMemberTasks(c);tx.set(`career365_social_ledger/close_${c.id}`,{kind:'close',uid,companyId:c.id,amount:c.fund,at:time});account.balance+=c.fund;c.fund=0;c.status='closed';c.listed=false;c.vacancies=[];for(const m of c.members){const a=await getAccount(m.uid);a.memberCompany=null;a.companyHistory=append(a.companyHistory,c.id,20);tx.set(A(m.uid),a);}c.members=[];account.ownedCompany=null;account.companyHistory=append(account.companyHistory,c.id,20);tx.set(A(uid),account);tx.set(C(c.id),c);result={closed:true};
   }else if(action==='dismissFollowup'){const c=await owned(input.companyId);c.followups=(c.followups??[]).filter(f=>f.id!==input.followupId);tx.set(C(c.id),c);result={dismissed:true};
   }else if(action==='announcement'){
    const c=await owned(input.companyId);need(c.status!=='closed','company-paused');c.announcements=append(c.announcements,text(input.text,160),12);tx.set(C(c.id),c);result={sent:true};
   }else if(action==='note'){
    const target=id(input.uid),other=await pair(target);need(Object.hasOwn(QUICK_NOTES,input.kind));let together=false;if(account.ownedCompany||account.memberCompany){const c=await company(account.ownedCompany??account.memberCompany);together=[c.owner,...c.members.map(m=>m.uid)].includes(target);}need(account.friends.includes(target)||together,'friends-required');const note={id:newId(),from:uid,to:other.uid,fromName:mine?.name??'夥伴',toName:(await tx.get(P(target)))?.name??'夥伴',kind:input.kind,parties:[uid,target],createdAt:time};tx.set(`career365_notes/${note.id}`,note);result={sent:true};
   }else if(action==='block'||action==='unblock'){
    const target=id(input.uid);need(target!==uid);const other=await getAccount(target);if(action==='block'){need(account.blocked.length<100,'block-limit');account.blocked=append(account.blocked,target,100);account.friends=account.friends.filter(k=>k!==target);other.friends=other.friends.filter(k=>k!==uid);tx.set(A(target),other);}else account.blocked=account.blocked.filter(k=>k!==target);tx.set(A(uid),account);result={saved:true};
   }else if(action==='report'){
    need(['spam','harassment','scam','other'].includes(input.reason));const target=id(input.uid);need(target!==uid);await getAccount(target);const key=newId();tx.set(`career365_social_reports/${key}`,{id:key,reporter:uid,target,reason:input.reason,details:typeof input.details==='string'?input.details.slice(0,300):'',status:'open',createdAt:time});result={reportId:key};
   }else throw new SocialError('unknown-action');
   await tx.flush();return result;
  });
 }
 async function expire(taskId){return store.transaction(async raw=>{const tx=unit(raw),t=await tx.get(T(id(taskId)));if(!t||!OPEN.includes(t.status)||t.expiresAt>now())return false;const c=await tx.get(C(t.companyId));need(c&&c.status!=='closed','company-paused');c.fund+=t.reward;c.tasks=c.tasks.filter(k=>k!==t.id);c.historyTasks=append(c.historyTasks,t.id,30);t.status='expired';t.finishedAt=now();tx.set(C(c.id),c);tx.set(T(t.id),t);tx.set(`career365_social_ledger/refund_${t.id}`,{kind:'refund',companyId:c.id,taskId:t.id,amount:t.reward,at:now()});await tx.flush();return true;});}
 return {execute,expire};
}
