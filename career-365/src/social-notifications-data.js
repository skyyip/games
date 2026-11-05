const stamp=value=>{try{const n=value?.toMillis?.();return Number.isFinite(n)?n:0;}catch{return 0;}};
export function socialNotifications(uid,links=[],requests=[]){
 const result=[];
 for(const row of links)if(row.to===uid&&row.from!==uid&&row.state==='pending'){const time=stamp(row.updatedAt),id='friend:'+row.id;result.push({id,key:id+':'+time,title:'收到新的好友申請',detail:'查看申請者，再決定是否接受。',time});}
 for(const row of requests){let title='';if(row.candidate===uid&&row.state==='offered')title='收到公司加入邀請';else if(row.candidate===uid&&row.state==='referred')title='好友推薦你加入公司';else if(row.candidate!==uid&&row.parties?.[0]===uid&&row.state==='requested')title='公司收到加入申請／合作條件';if(title){const time=stamp(row.updatedAt),id='request:'+row.id;result.push({id,key:id+':'+row.state+':'+time,title,detail:'前往收件箱查看公司及合作條件。',time});}}
 return [...new Map(result.map(row=>[row.id,row])).values()].sort((a,b)=>b.time-a.time||a.id.localeCompare(b.id));
}
export function readNotificationSeen(store,key){try{const rows=JSON.parse(store.read(key)??'[]');return new Set(Array.isArray(rows)?rows.filter(v=>typeof v==='string'&&v.length<=400).slice(-200):[]);}catch{return new Set();}}
export function writeNotificationSeen(store,key,seen){try{store.write(key,JSON.stringify([...seen].slice(-200)));}catch{/* Memory-only reading remains available when storage is blocked. */}}
export async function watchSocialNotifications(uid,onValue,onError){
 const [{initAuth},{loadFirestoreSDK}]=await Promise.all([import('./auth.js'),import('./firebase-firestore-sdk.js')]),[{session},sdk]=await Promise.all([initAuth(),loadFirestoreSDK()]);
 if(session.currentUser?.uid!==uid||session.currentUser.isAnonymous)throw Error('identity-changed');
 const db=sdk.getFirestore(session.app),rows={links:[],requests:[]},cache={links:true,requests:true},ready=new Set(),stops=[];let active=true;
 const stop=()=>{active=false;for(const fn of stops)fn();};
 const emit=()=>{if(active&&session.currentUser?.uid===uid)onValue({items:socialNotifications(uid,rows.links,rows.requests),cached:cache.links||cache.requests,loading:ready.size<2});};
 const sources={links:sdk.query(sdk.collection(db,'career365_spark_links',uid,'peers'),sdk.orderBy('updatedAt','desc'),sdk.limit(50)),requests:sdk.query(sdk.collection(db,'career365_spark_requests'),sdk.where('parties','array-contains',uid),sdk.orderBy('updatedAt','desc'),sdk.limit(40))};
 try{for(const [kind,query]of Object.entries(sources))stops.push(sdk.onSnapshot(query,{includeMetadataChanges:true},snapshot=>{if(!active||session.currentUser?.uid!==uid)return;rows[kind]=snapshot.docs.map(d=>({...d.data(),id:d.id}));cache[kind]=snapshot.metadata.fromCache;ready.add(kind);emit();},error=>{if(!active)return;stop();onError(error);}));}catch(error){stop();throw error;}
 return stop;
}
