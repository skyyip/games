import {SOCIAL_REGION} from './social-content.js';
export async function firebaseSocialAdapter(){
 const [{initAuth},{loadFunctionsSDK}]=await Promise.all([import('./auth.js'),import('./firebase-functions-sdk.js')]);
 const [{session},sdk]=await Promise.all([initAuth(),loadFunctionsSDK()]);const client=sdk.getFunctions(session.app,SOCIAL_REGION),call=sdk.httpsCallable(client,'careerSocial');
 return {async call(action,input,uid){if(session.currentUser?.uid!==uid)throw Error('identity-changed');if(session.currentUser.isAnonymous)throw Error('registered-account-required');const result=await call({action,input,actorUid:uid});if(session.currentUser?.uid!==uid)throw Error('identity-changed');return result.data;}};
}
export class SocialSession{
 constructor({load=firebaseSocialAdapter}={}){this.load=load;this.uid=null;this.epoch=0;this.adapter=null;}
 identity(uid){this.uid=uid;this.epoch++;}
 async call(action,input={}){const uid=this.uid,epoch=this.epoch;if(!uid)throw Error('signin');const adapter=this.adapter??await this.load();if(uid!==this.uid||epoch!==this.epoch)throw Error('identity-changed');this.adapter=adapter;const value=await adapter.call(action,input,uid);if(uid!==this.uid||epoch!==this.epoch)throw Error('identity-changed');return value;}
}
export function socialMessage(e){const code=e?.details??e?.message??e?.code;const known={'identity-changed':'玩家已切換，這次操作未套用；請重新整理。','life-required':'先建立或載入一段人生，再開啟玩家合作。','signin':'先登入玩家帳戶，再開啟社交。','registered-account-required':'請先把匿名帳戶綁定 Email 或 Google，再加入玩家合作。','profile-required':'先建立名片；退休人生可保留導師名片及好友。','handle-taken':'這個玩家代號已有人使用。','handle-fixed':'玩家代號建立後固定，名字與介紹仍可更新。','not-found':'找不到公開名片或項目。請核對代號，也可能對方已關閉公開搜尋。','blocked':'這次互動未能進行，請尊重對方的聯絡設定。','insufficient-funds':'合作點不足；委託會先預留完整報酬。','company-full':'公司八個合作席位已滿，請先調整NPC預留或成員。','already-employed':'每位玩家同時參與一間合作公司；可先離職或完成公司交接。','already-claimed':'這份委託剛被其他夥伴接走，請重新整理。','already-resolved':'此項目已處理，沒有重複結算。','company-paused':'公司正在交接或已結束，請先處理交接安排。','role-mismatch':'工種、議定報酬或目前人生與這份委託不符。','life-changed':'人生已更換，舊邀請未套用；可請對方重新邀請。','referral-disabled':'推薦需要好友關係及對方同意，亦不能推薦自己。','invites-disabled':'對方目前不接受邀請或已退休。','duplicate':'已有待處理的同類邀請。','rate-limit':'操作較密，請稍後再試。','invite-limit':'待處理邀請較多，先整理現有邀請。','vacancy-required':'公司需先刊登對應職位。','invalid-input':'請檢查輸入的代號、金額與必填欄位。','forbidden':'你沒有執行這項操作的權限。','social-index-required':'社交服務的資料索引仍在準備，稍後再試。'};
 if(known[code])return known[code];if(/not-found|unavailable|internal|fetch|network/i.test(String(code)))return '社交服務暫時未能連線；請稍後重新整理。本機人生已保留。';return '操作未完成，請重新整理後再試；目前人生不受影響。';
}
