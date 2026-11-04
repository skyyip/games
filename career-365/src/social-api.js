export async function firebaseSocialAdapter(){
 const [{initAuth},{loadFirestoreSDK},{createSparkAdapter}]=await Promise.all([import('./auth.js'),import('./firebase-firestore-sdk.js'),import('./social-firestore.js')]);
 const [{session},sdk]=await Promise.all([initAuth(),loadFirestoreSDK()]);
 return createSparkAdapter({sdk,db:sdk.getFirestore(session.app),currentUser:()=>session.currentUser});
}
export class SocialSession{
 constructor({load=firebaseSocialAdapter}={}){this.load=load;this.uid=null;this.epoch=0;this.adapter=null;}
 identity(uid){this.uid=uid;this.epoch++;this.adapter=null;}
 async call(action,input={}){const uid=this.uid,epoch=this.epoch;if(!uid)throw Error('signin');const adapter=this.adapter??await this.load();if(uid!==this.uid||epoch!==this.epoch)throw Error('identity-changed');this.adapter=adapter;const value=await adapter.call(action,input,uid);if(uid!==this.uid||epoch!==this.epoch)throw Error('identity-changed');return value;}
}
export function socialMessage(e){const code=e?.code??e?.message;return {
 'identity-changed':'玩家已切換，請重新整理後再操作。',signin:'先登入玩家帳戶。','registered-account-required':'請先把匿名帳戶綁定 Email 或 Google。','life-required':'先建立或載入人生。','profile-required':'先建立玩家名片。','handle-taken':'這個玩家代號已有人使用。','handle-fixed':'玩家代號建立後固定。','not-found':'找不到項目，或對方未公開名片。',duplicate:'已有待處理邀請。','already-employed':'請先離開原公司或完成交接。','company-full':'公司八個合作席位已滿。','handover-required':'負責人需先交接或結束公司。','invalid-input':'請檢查必填欄位與專長數量。',forbidden:'你沒有這項操作的權限。','permission-denied':'操作未獲允許。請檢查對方設定、邀請狀態及社交規則是否已部署；快捷訊息需相隔60秒，同一邀請或舉報需相隔24小時。','failed-precondition':'社交索引可能仍在建立，請檢查 Firestore 索引。','resource-exhausted':'Firestore 配額已用盡，請等候配額重設。本機人生仍可繼續。',unavailable:'目前未能連線；本機人生已保留。'
 }[code]??'操作未完成，請重新整理後再試。本機人生不受影響。';}
