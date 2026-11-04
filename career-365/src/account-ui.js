const $=id=>document.getElementById(id);
export function authMessage(e){return ({'auth/popup-closed-by-user':'Google 登入已取消，可以再試。','auth/cancelled-popup-request':'已有登入視窗，請先完成或關閉它。','auth/popup-blocked':'瀏覽器阻擋了登入視窗，請允許彈出視窗後再試。','auth/unauthorized-domain':'這個網站網域尚未獲 Firebase 授權，請在專案設定加入網站網域。','auth/operation-not-allowed':'這個登入方式尚未在 Firebase 啟用。','auth/invalid-email':'請輸入有效的 Email。','auth/invalid-credential':'Email 或密碼不正確。','auth/wrong-password':'Email 或密碼不正確。','auth/user-not-found':'Email 或密碼不正確。','auth/email-already-in-use':'這個 Email 已有帳戶，請改用登入。','auth/weak-password':'密碼至少需要 8 個字元。','auth/network-request-failed':'暫時連不到登入服務，請檢查網絡後重試。','auth/too-many-requests':'嘗試次數較多，請稍後再試。','auth/credential-already-in-use':'此登入方式已連結其他帳戶。請先備份匿名人生，再登出並登入既有帳戶。','auth/account-exists-with-different-credential':'這個 Email 已使用其他方式註冊，請使用原有登入方式。','auth-disabled':'目前未設定帳戶服務，仍可使用本機遊玩與備份。','auth-loading':'登入服務仍在準備，請稍候。'})[e?.code??e?.message]??'登入暫時未完成，請稍後再試；目前人生仍保存在本機。';}
export class CareerAccount{
 constructor({store,onIdentity,onAdopt,hasCandidate,onRestoring=()=>{},show,notify,load=()=>import('./auth.js')}){
  Object.assign(this,{store,onIdentity,onAdopt,hasCandidate,onRestoring,show,notify,load});this.user=null;this.ready=false;this.busy=false;this.auth=null;this.starting=null;this.revision=0;
  $('account-open').onclick=()=>this.open();$('account-mode').onchange=()=>this.render();
  $('account-form').onsubmit=e=>{e.preventDefault();const email=$('account-email').value.trim(),password=$('account-password').value,register=$('account-mode').value==='register';if(register&&password.length<8){this.feedback('密碼至少需要 8 個字元。');return;}if(!email||!password){this.feedback('請填寫 Email 與密碼。');return;}if(this.user?.isAnonymous&&!register&&!confirm('登入既有帳戶會切換到該玩家的人生。匿名人生會保留在本機，建議先匯出備份。確定繼續？'))return;this.run(()=>register?this.auth.emailRegister(email,password):this.auth.emailSignIn(email,password));};
  $('account-google').onclick=()=>this.run(()=>this.auth.googleSignIn()); // Popup starts in the trusted click.
  $('account-anonymous').onclick=()=>this.run(()=>this.auth.anonymousSignIn());
  $('account-signout').onclick=()=>{if(this.user?.isAnonymous&&!confirm('匿名帳戶登出後可能無法重新取得相同身分。請先綁定 Email／Google 或匯出人生備份。確定登出？'))return;this.run(()=>this.auth.signOut());};
  $('account-reset').onclick=()=>{const email=$('account-email').value.trim();if(!email){this.feedback('先填寫要重設密碼的 Email。');$('account-email').focus();return;}this.run(()=>this.auth.resetPassword(email),'若此 Email 可用，重設密碼的指示已送出。');};
  $('account-adopt').onclick=()=>{this.onAdopt();this.render();};this.render();
  if(store.read('career-365.identity.v1')){this.restoring=true;this.onRestoring(true);this.start().catch(()=>{});}
 }
 feedback(text){$('account-feedback').textContent=text;}
 async start(){
  if(this.ready)return;if(this.starting)return this.starting;
  this.starting=(async()=>{try{this.auth=await this.load();if(!this.auth.configured)throw Error('auth-disabled');await this.auth.observeIdentity(user=>this.identity(user),e=>this.feedback(authMessage(e)));this.ready=true;this.render();}catch(e){if(this.restoring){this.restoring=false;this.onRestoring(false);this.notify('暫時未能還原登入身分。原有存檔已保留，可先使用本機遊玩或重新登入。');}this.feedback(authMessage(e));this.render();throw e;}finally{this.starting=null;}})();return this.starting;
 }
 open(){this.show('account-dialog');this.feedback(this.ready?'':'正在準備登入服務…');this.start().catch(()=>{});this.render();}
 identity(user){
  this.user=user??null;this.revision++;this.store.write('career-365.identity.v1',user?.uid??'');this.onIdentity(this.user);if(this.restoring){this.restoring=false;this.onRestoring(false);}$('account-password').value='';this.render();
 }
 async run(operation,message){
  if(!this.ready||this.busy)return;this.busy=true;this.feedback('處理中…');this.render();const revision=this.revision;
  try{const result=await operation();if(result?.uid&&this.user?.uid===result.uid)this.user=result;
   this.feedback(message??(this.user?'已登入，這個玩家的人生會分開保存在本機。':'已登出，返回本機遊玩。'));
  }catch(e){if(revision===this.revision)this.feedback(authMessage(e));}
  finally{this.busy=false;$('account-password').value='';this.render();}
 }
 render(){
  const u=this.user,registered=!!u&&!u.isAnonymous,disabled=!this.ready||this.busy;
  $('account-open').textContent=u?(u.isAnonymous?'匿名玩家':u.displayName||u.email||'玩家帳戶'):'玩家登入';
  $('account-open').title=u?(u.isAnonymous?'匿名帳戶':u.email||u.displayName||'玩家帳戶'):'玩家登入';
  $('account-status').textContent=u?(u.isAnonymous?'目前以匿名帳戶登入。可綁定 Email 或 Google，保留同一個玩家身分。':`已登入：${u.displayName||u.email||'玩家'}`):'可使用 Email、Google 或匿名帳戶；也可繼續本機遊玩。';
  $('account-form').hidden=registered;$('account-google').hidden=registered;$('account-anonymous').hidden=!!u;$('account-signout').hidden=!u;
  $('account-password').minLength=$('account-mode').value==='register'?8:1;$('account-password').autocomplete=$('account-mode').value==='register'?'new-password':'current-password';$('account-mode').disabled=this.busy;$('account-email').disabled=this.busy;$('account-password').disabled=this.busy;
  $('account-submit').textContent=$('account-mode').value==='register'?(u?.isAnonymous?'綁定 Email，保留匿名身分':'建立 Email 帳戶'):'以 Email 登入';
  $('account-google').textContent=u?.isAnonymous?'綁定 Google，保留匿名身分':'使用 Google 登入';
  for(const id of ['account-submit','account-google','account-anonymous','account-reset','account-signout'])$(id).disabled=disabled;
  $('account-adopt').hidden=!u||!this.hasCandidate();$('account-adopt').disabled=this.busy;
 }
}
