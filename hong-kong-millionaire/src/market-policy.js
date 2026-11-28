// Spark-compatible transactions: Firestore rules independently verify every mutation.
export const MARKET_MAX_PRICE=1000000000;
export const validMarketPrice=n=>Number.isSafeInteger(n)&&n>=1&&n<=MARKET_MAX_PRICE;
export function marketFee(price){if(!validMarketPrice(price))throw Error('invalid-market-price');return Math.ceil(price/20);}
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value);
export function parseMarketAction(data){
 if(!data||typeof data!=='object'||Array.isArray(data)||!uuid(data.requestId))throw Error('invalid-market-request');
 const {type,requestId}=data,keys=type==='list'?['type','requestId','cardId','price']:type==='buy'?['type','requestId','listingId','price']:type==='cancel'?['type','requestId','listingId']:[];
 if(!keys.length||Object.keys(data).length!==keys.length||Object.keys(data).some(k=>!keys.includes(k)))throw Error('invalid-market-request');
 if(type!=='cancel'&&!validMarketPrice(data.price))throw Error('invalid-market-price');
 if(type==='list'){
  if(typeof data.cardId!=='string'||!data.cardId.length||data.cardId.length>100)throw Error('invalid-market-card');
  return {type,requestId,cardId:data.cardId,price:data.price};
 }
 if(!uuid(data.listingId))throw Error('invalid-market-request');
 return {type,requestId,listingId:data.listingId,...(type==='buy'?{price:data.price}:{})};
}
export function sameMarketAction(a,b){try{return JSON.stringify(parseMarketAction(a))===JSON.stringify(parseMarketAction(b));}catch{return false;}}
export function marketResult(action,listing){const fee=action.type==='cancel'?0:marketFee(listing.price);return {type:action.type,listingId:action.type==='list'?action.requestId:action.listingId,cardId:listing.cardId,price:listing.price,fee,proceeds:action.type==='cancel'?0:listing.price-fee,status:action.type==='buy'?'sold':action.type==='cancel'?'cancelled':'active'};}
