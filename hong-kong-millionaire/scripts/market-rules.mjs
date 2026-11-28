import {CULTURE_CARDS} from '../src/economy.js';
export function marketRules(){return String.raw`
  function mkListing(id){return /databases/$(database)/documents/hkm_market_listings/$(id);}
  function mkTrade(id){return /databases/$(database)/documents/hkm_market_trades/$(id);}
  function mkReceipt(uid,id){return /databases/$(database)/documents/hkm_wallets/$(uid)/marketReceipts/$(id);}
  function mkId(id){return id is string&&id.matches('^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$');}
  function mkPrice(n){return n is int&&n>=1&&n<=1000000000;}
  function mkFee(n){return int((n+19) / 20);}
  function mkResult(l,id,kind){let fee=kind=='cancel'?0:mkFee(l.price);return {'type':kind,'listingId':id,'cardId':l.cardId,'price':l.price,'fee':fee,'proceeds':kind=='cancel'?0:l.price-fee,'status':kind=='buy'?'sold':kind=='cancel'?'cancelled':'active'};}
  function mkReceiptLink(w,uid,kind){
   let r=getAfter(mkReceipt(uid,w.receipt)).data;
   let l=getAfter(mkListing(w.item)).data;
   return mkId(w.receipt)&&r.uid==uid&&r.createdAt==request.time&&r.action.type==kind&&r.action.requestId==w.receipt&&r.result==mkResult(l,w.item,kind);
  }
  function mkWalletList(w,o,uid){
   let l=getAfter(mkListing(w.item)).data;
   return rwChanged(w,o,['cards','receipt'])&&mkId(w.item)&&w.receipt==w.item&&!exists(mkListing(w.item))&&l.sellerUid==uid&&l.status=='active'&&l.createdAt==request.time
    &&o.cards.get(l.cardId,0)>=2&&w.cards.diff(o.cards).affectedKeys().hasOnly([l.cardId])&&w.cards[l.cardId] is int&&w.cards[l.cardId]==o.cards.get(l.cardId,0)-1&&mkReceiptLink(w,uid,'list');
  }
  function mkWalletCancel(w,o,uid){
   let l=get(mkListing(w.item)).data;let a=getAfter(mkListing(w.item)).data;
   return rwChanged(w,o,['cards','receipt'])&&mkId(w.item)&&l.sellerUid==uid&&l.status=='active'&&a.status=='cancelled'&&a.updatedAt==request.time
    &&w.cards.diff(o.cards).affectedKeys().hasOnly([l.cardId])&&w.cards[l.cardId] is int&&w.cards[l.cardId]==o.cards.get(l.cardId,0)+1&&w.cards[l.cardId]<=1000000000000&&mkReceiptLink(w,uid,'cancel');
  }
  function mkWalletBuy(w,o,uid){
   let l=get(mkListing(w.item)).data;let a=getAfter(mkListing(w.item)).data;let trade=getAfter(mkTrade(w.item)).data;
   return rwChanged(w,o,['cards','spent','receipt'])&&mkId(w.item)&&l.status=='active'&&l.sellerUid!=uid&&a.status=='sold'&&a.updatedAt==request.time&&trade.buyerUid==uid&&trade.requestId==w.receipt
    &&w.spent==o.spent+l.price&&get(player(uid)).data.total+o.bonus-o.spent>=l.price&&w.cards.diff(o.cards).affectedKeys().hasOnly([l.cardId])
    &&w.cards[l.cardId] is int&&w.cards[l.cardId]==o.cards.get(l.cardId,0)+1&&w.cards[l.cardId]<=1000000000000&&mkReceiptLink(w,uid,'buy');
  }
  function mkBuyerLink(id,requestId){
   let o=get(rwPath(request.auth.uid)).data;let w=getAfter(rwPath(request.auth.uid)).data;
   return w.op=='market-buy'&&w.item==id&&w.receipt==requestId&&w.revision==o.revision+1&&w.updatedAt==request.time;
  }
  function mkSale(w,o,uid){
   let t=getAfter(mkTrade(w.item)).data;
   return request.auth.uid!=uid&&mkId(w.item)&&!exists(mkTrade(w.item))&&t.buyerUid==request.auth.uid&&t.sellerUid==uid&&t.createdAt==request.time
    &&rwChanged(w,o,['bonus'])&&w.op=='market-sale'&&w.updatedAt==request.time&&w.revision is int&&w.revision==o.revision+1
    &&w.bonus is int&&w.bonus==o.bonus+t.proceeds&&w.bonus<=1000000000000&&o.cards.get(t.cardId,0)>=1;
  }
  function mkListingCreate(l,id){
   let w=getAfter(rwPath(request.auth.uid)).data;
   return mkId(id)&&l.keys().hasOnly(['sellerUid','sellerName','cardId','price','status','createdAt','updatedAt'])&&l.sellerUid==request.auth.uid&&l.sellerName==get(player(request.auth.uid)).data.displayName
    &&l.cardId in __MARKET_IDS__&&mkPrice(l.price)&&l.status=='active'&&l.createdAt==request.time&&l.updatedAt==request.time&&w.op=='market-list'&&w.item==id&&w.receipt==id&&w.revision==get(rwPath(request.auth.uid)).data.revision+1;
  }
  function mkListingUpdate(l,o,id){
   return o.status=='active'&&l.updatedAt==request.time&&(
    l.status=='cancelled'?(request.auth.uid==o.sellerUid&&l.diff(o).affectedKeys().hasOnly(['status','updatedAt','cancelledAt'])&&l.cancelledAt==request.time
     &&getAfter(rwPath(request.auth.uid)).data.op=='market-cancel'&&getAfter(rwPath(request.auth.uid)).data.item==id&&getAfter(rwPath(request.auth.uid)).data.revision==get(rwPath(request.auth.uid)).data.revision+1):
    (l.status=='sold'&&request.auth.uid!=o.sellerUid&&l.diff(o).affectedKeys().hasOnly(['status','updatedAt','soldAt'])&&l.soldAt==request.time&&mkBuyerLink(id,getAfter(mkTrade(id)).data.requestId)));
  }
  function mkTradeCreate(t,id){
   let l=get(mkListing(id)).data;let a=getAfter(mkListing(id)).data;let s=get(rwPath(l.sellerUid)).data;let w=getAfter(rwPath(l.sellerUid)).data;
   return t.keys().hasOnly(['listingId','buyerUid','sellerUid','cardId','price','fee','proceeds','requestId','createdAt'])&&t.listingId==id&&t.buyerUid==request.auth.uid&&t.sellerUid==l.sellerUid&&t.buyerUid!=t.sellerUid
    &&l.status=='active'&&a.status=='sold'&&a.updatedAt==request.time&&t.cardId==l.cardId&&t.price==l.price&&t.fee==mkFee(l.price)&&t.proceeds==l.price-t.fee&&t.createdAt==request.time
    &&mkBuyerLink(id,t.requestId)&&w.op=='market-sale'&&w.item==id&&w.revision==s.revision+1&&w.updatedAt==request.time;
  }
  function mkReceiptCreate(r,uid,id){
   let w=getAfter(rwPath(uid)).data;let o=get(rwPath(uid)).data;let l=getAfter(mkListing(w.item)).data;
   return mkId(id)&&r.keys().hasOnly(['uid','action','result','createdAt'])&&r.uid==uid&&r.createdAt==request.time&&w.receipt==id&&w.revision==o.revision+1&&w.updatedAt==request.time
    &&r.action.requestId==id&&r.result==mkResult(l,w.item,r.action.type)&&(
     w.op=='market-list'?(r.action.keys().hasOnly(['type','requestId','cardId','price'])&&r.action.type=='list'&&r.action.cardId==l.cardId&&r.action.price==l.price&&w.item==id):
     w.op=='market-buy'?(r.action.keys().hasOnly(['type','requestId','listingId','price'])&&r.action.type=='buy'&&r.action.listingId==w.item&&r.action.price==l.price):
     (w.op=='market-cancel'&&r.action.keys().hasOnly(['type','requestId','listingId'])&&r.action.type=='cancel'&&r.action.listingId==w.item));
  }
  match /hkm_market_listings/{id}{
   allow get:if signedPlayer();allow list:if signedPlayer()&&request.query.limit!=null&&request.query.limit<=24;
   allow create:if signedPlayer()&&mkListingCreate(request.resource.data,id);
   allow update:if signedPlayer()&&mkListingUpdate(request.resource.data,resource.data,id);allow delete:if false;
  }
  match /hkm_market_trades/{id}{
   allow get:if signedPlayer()&&(resource.data.buyerUid==request.auth.uid||resource.data.sellerUid==request.auth.uid);
   allow create:if signedPlayer()&&mkTradeCreate(request.resource.data,id);allow list,update,delete:if false;
  }
`.replace('__MARKET_IDS__',JSON.stringify(CULTURE_CARDS.map(c=>c.id)));}
