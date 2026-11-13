import {readProgress} from './progress.js';
import {giftItem} from './player-state.js';

// A portable backup may predate an irreversible transfer. Preserve today's
// account inventory for affected items instead of restoring an already-sent use.
export function preserveTransferredItems(backup,current,gifts,exportedAt,now=Date.now()){
 const next=readProgress(JSON.stringify(backup),now),live=readProgress(JSON.stringify(current),now);
 const tokens=new Set(gifts.filter(g=>(g.updatedAt?.toMillis?.()??0)>=exportedAt).map(g=>g.token));
 let protectedItems=0;
 for(const token of tokens){
  const item=giftItem(token);if(!item)continue;protectedItems++;
  if(item.kind==='decor'){
   next.decor[item.id]=live.decor[item.id]??0;
   if(live.decorExpires[item.id])next.decorExpires[item.id]=live.decorExpires[item.id];else delete next.decorExpires[item.id];
  }else{
   const owned=item.kind==='skin'?'ownedSkins':'owned',uses=item.kind==='skin'?'skinUses':'weaponUses';
   next[owned]=next[owned].filter(id=>id!==item.id);
   if(live[owned].includes(item.id))next[owned].push(item.id);
   if(live[uses][item.id])next[uses][item.id]=live[uses][item.id];else delete next[uses][item.id];
  }
 }
 return {state:readProgress(JSON.stringify(next),now),protectedItems};
}
