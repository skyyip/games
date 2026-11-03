import {ANIMALS,animal,rewardCoins} from './animals.js';
import {PROFILE_KEY,PENDING_KEY,readProfile,normalizeName,buyAnimal,settleLocal} from './profile.js';
import * as cloud from './cloud.js';import {RiverScene} from './scene.js';
import {FROG_COIN,rankBadge} from './badges.js';
const $=id=>document.getElementById(id);
export class RiverPlayers{
 constructor({t,onChange,onPlay}){
  this.t=t;this.onChange=onChange;this.onPlay=onPlay;this.guest=readProfile(null);this.cloudProfile=null;this.identity=null;this.authReady=!cloud.cloudConfigured;this.persistent=true;this.busy=false;this.wantPlay=false;this.board=[];this.boardAt=0;this.pending=null;this.profileFailed=false;this.resetUntil=0;this.resetTimer=0;this.worldRank={key:'',status:'idle',value:null,at:0};this.rankRequest=0;
  for(const icon of document.querySelectorAll('[data-frog-coin]'))icon.innerHTML=FROG_COIN;
  try{this.guest=readProfile(localStorage.getItem(PROFILE_KEY));const pending=JSON.parse(localStorage.getItem(PENDING_KEY));if(pending&&typeof pending.id==='string'&&typeof pending.uid==='string'&&Number.isInteger(pending.score)&&pending.score>=0&&pending.score<=1e6&&(pending.bonusCoins===undefined||Number.isSafeInteger(pending.bonusCoins)&&pending.bonusCoins>=0&&pending.bonusCoins<=pending.score*3))this.pending=pending;}catch{this.persistent=false;}
  for(const button of document.querySelectorAll('[data-close]'))button.addEventListener('click',()=>this.close(button.dataset.close));
  for(const id of ['player-dialog','animal-dialog','leaderboard-dialog'])$(id).addEventListener('cancel',()=>{if(id==='player-dialog'){this.wantPlay=false;this.passwordVisibility(false);}});
  $('player-world-rank').addEventListener('click',()=>this.worldRank.status==='error'?this.syncWorldRank(true):this.openBoard());$('profile-open').addEventListener('click',()=>this.openPlayer());$('animal-open').addEventListener('click',()=>this.openShop());$('leaderboard-open').addEventListener('click',()=>this.openBoard());$('refresh-board').addEventListener('click',()=>this.refreshBoard());$('auth-action').addEventListener('change',()=>this.authView());
  $('guest-form').addEventListener('submit',async e=>{e.preventDefault();if(this.busy)return;try{const {name,key}=normalizeName($('guest-name').value);if(this.identity)await cloud.logout();this.cloudProfile=null;this.guest={...this.guest,name,nameKey:key};this.saveGuest();this.render();this.close('player-dialog');this.onChange?.();if(this.wantPlay){this.wantPlay=false;this.onPlay?.();}}catch(error){this.feedback('account-feedback',error);}});
  $('google-signin').addEventListener('click',()=>this.providerLogin('google'));$('facebook-signin').addEventListener('click',()=>this.providerLogin('facebook'));$('anonymous-signin').addEventListener('click',()=>this.providerLogin('anonymous'));
  $('password-visibility').addEventListener('click',()=>this.passwordVisibility($('player-password').type==='password'));
  $('password-reset').addEventListener('click',()=>this.forgotPassword());$('profile-retry').addEventListener('click',()=>this.retryProfile());
  $('cloud-form').addEventListener('submit',e=>{e.preventDefault();this.authenticate();});$('cloud-logout').addEventListener('click',async()=>{if(this.busy)return;if(this.identity?.isAnonymous&&!window.confirm(this.t('登出匿名帳戶後，未綁定的紀錄可能無法找回。建議先綁定登入方式。仍要登出？','Signing out of an anonymous account may make its progress unrecoverable. Link a sign-in method first. Sign out anyway?')))return;try{await cloud.logout();this.identity=null;this.cloudProfile=null;this.profileFailed=false;this.passwordVisibility(false);$('player-password').value='';this.render();this.authView();this.onChange?.();}catch(error){this.feedback('account-feedback',error);}});
  if(cloud.cloudConfigured)$('guest-form').before($('cloud-form'));
  if(cloud.cloudConfigured)cloud.observeIdentity(async user=>{
   this.identity=user;if(this.busy)return;const uid=user?.uid;
   if(this.cloudProfile?.uid!==uid){this.cloudProfile=null;this.syncWorldRank();this.renderWorldRank();}
   try{
    const profile=user?await cloud.readCloudProfile():null;if(this.identity?.uid!==uid)return;
    this.cloudProfile=profile;this.profileFailed=false;this.authReady=true;this.render();this.authView();this.onChange?.();
    if(user&&!profile)this.openPlayer();
   }catch(error){if(this.identity?.uid!==uid)return;this.profileFailed=!!user;this.authReady=true;this.authView();this.feedback('account-feedback',user?{message:'profile-load-failed',cause:error}:error);}
  }).then(unsubscribe=>this.unsubscribe=unsubscribe).catch(error=>{this.authReady=true;this.authView();this.feedback('account-feedback',error);});
  document.addEventListener('visibilitychange',async()=>{if(document.hidden||!this.cloudProfile||this.busy)return;try{this.cloudProfile=await cloud.readCloudProfile();this.render();this.onChange?.();}catch{/* Keep the last verified cloud snapshot while offline. */}});
  this.render();
 }
 get profile(){return this.cloudProfile??this.guest;}
 error(error){const raw=error?.code??error?.message??'',messages={
  'auth-loading':['正在恢復雲端登入，請稍候再開始。','Restoring your cloud session. Please try again in a moment.'],
  'name-format':['名字請用 2–16 個中文字、英文字母、數字、_ 或 -。','Use 2–16 Chinese characters, letters, numbers, _ or -.'],
  'name-taken':['呢個名字已被使用，請試另一個。','That name is already taken. Please choose another.'],
  'cloud-not-configured':['Firebase 專案尚未建立；登入及世界排行暫未啟用。','Firebase is not configured yet. Cloud accounts and rankings are unavailable.'],
  'not-enough-coins':['青蛙幣未夠，再跳幾局就可以帶佢出發。','Not enough Frog Coins yet. A few more runs will help!'],
  'refresh-cooldown':['等 10 秒再更新，俾河水抖一抖。','Please wait 10 seconds before refreshing again.'],
  'run-replaced':['呢局已在另一部裝置取消，不能再重複結算。','This run was replaced on another device and cannot be settled.'],
  'run-active':['先完成或離開目前一局，再更換動物。','Finish or leave the current run before changing animals.'],
  'auth/popup-closed-by-user':['已取消登入，可以隨時再試。','Sign-in cancelled. You can try again anytime.'],
  'auth/cancelled-popup-request':['已取消登入視窗。','Sign-in window cancelled.'],
  'auth/popup-blocked':['瀏覽器封鎖了登入視窗，請允許彈出視窗再試。','Allow pop-ups for this site and try Google sign-in again.'],
  'auth/account-exists-with-different-credential':['這個 Email 已使用另一種方式註冊，請用原有方式登入以保留存檔。','This email uses another sign-in method. Use that method to keep your existing save.'],
  'auth/operation-not-allowed':['此登入方式尚未啟用，請在 Firebase Authentication 啟用對應供應商。','Enable the selected sign-in provider in Firebase Authentication.'],
  'auth/credential-already-in-use':['此登入方式已屬於另一個帳戶；匿名進度仍保留。若要登入原有帳戶，請先登出。','This sign-in method belongs to another account. Anonymous progress is unchanged. Sign out first to access the existing account.'],
  'auth/provider-already-linked':['這個帳戶已綁定此登入方式。','This account already has this sign-in method linked.'],
  'anonymous-existing-account':['請先綁定登入方式以保留匿名進度；如要改用另一帳戶，請先登出。','Link a sign-in method to keep anonymous progress. To use another account, sign out first.'],
  'already-signed-in':['你已登入，毋須建立新的匿名帳戶。','You are already signed in; no anonymous account is needed.'],
  'auth/unauthorized-domain':['請先在 Firebase Authentication 的授權網域加入此網站。','Add this website to Firebase Authentication authorized domains.'],
  'auth/email-already-in-use':['Email 已有帳戶，請選登入。','This email already has an account. Please sign in.'],
  'auth/invalid-credential':['Email 或密碼唔啱，請再試。','The email or password is incorrect.'],
  'profile-load-failed':['帳戶已登入，但未能讀取雲端存檔。請按「重新讀取雲端存檔」，暫時毋須重新註冊。','You are signed in, but your cloud save could not be loaded. Retry loading it; there is no need to register again.'],
  'auth/too-many-requests':['嘗試次數太多，請稍後再試。','Too many attempts. Please wait before trying again.'],
  'auth/network-request-failed':['連線未完成，請檢查網絡後再試。','The request could not finish. Check your connection and retry.'],
  'auth/web-storage-unsupported':['登入需要瀏覽器儲存空間。請允許網站儲存，並以 Safari 或 Chrome 開啟。','Sign-in needs browser storage. Allow site storage and open this page in Safari or Chrome.'],
  'auth/weak-password':['請使用最少 8 位密碼。','Use a password of at least 8 characters.'],
  'auth/invalid-email':['請填有效 Email。','Please enter a valid email address.'],
  'permission-denied':['雲端規則拒絕這次更新。成績仍保留，請確認 Firebase 設定後重試。','The cloud rejected this update. Your result is kept; check Firebase configuration and retry.'],
  'failed-precondition':['排行榜仍在準備；請確認已建立 Firestore 排序索引。','The leaderboard is not ready. Its Firestore index may still need to be created.'],
  'wrong-player':['這份待同步成績屬於另一個帳戶，請登入原帳戶。','This pending result belongs to another account. Sign in to that account.']};const m=messages[raw],message=m?this.t(...m):this.t('暫時未能連線，請檢查網絡後重試。','Connection unavailable. Check your network and try again.'),code=error?.cause?.code??raw;return message+(/^(auth\/[a-z-]+|permission-denied|unavailable|failed-precondition)$/.test(code)?` (${code})`:'');}
 feedback(id,error){$(id).textContent=error?this.error(error):'';if(error&&$('player-dialog').open)$(id).scrollIntoView({block:'nearest'});}
 saveGuest(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(this.guest));}catch{this.persistent=false;}}
 storePending(){try{if(this.pending)localStorage.setItem(PENDING_KEY,JSON.stringify(this.pending));else localStorage.removeItem(PENDING_KEY);}catch{this.persistent=false;}}
 show(id){if(!$(id).open)$(id).showModal();}
 close(id){if(id==='player-dialog')this.passwordVisibility(false);if($(id).open)$(id).close();}
 openPlayer(wantPlay=false){this.passwordVisibility(false);this.wantPlay=wantPlay;$('guest-name').value=this.guest.name;$('account-feedback').textContent='';this.authView();this.show('player-dialog');}
 passwordVisibility(show){const input=$('player-password'),type=show?'text':'password';if(input.type!==type)input.type=type;$('password-visibility').setAttribute('aria-pressed',String(show));$('password-visibility').setAttribute('aria-label',show?this.t('隱藏密碼','Hide password'):this.t('顯示密碼','Show password'));$('password-visibility-slash').toggleAttribute('hidden',!show);}
 authView(){
  this.passwordVisibility($('player-password').type==='text');$('password-visibility').disabled=this.busy;
  const anonymous=!!this.identity?.isAnonymous,claim=!!this.identity&&!this.cloudProfile&&!this.profileFailed,action=$('auth-action').value,mode=claim?'claim':anonymous?(action==='claim'||action==='signin'?'register':action):action==='claim'?'signin':action;
  for(const id of ['google-signin','facebook-signin']){$(id).hidden=!cloud.cloudConfigured||!!this.identity&&!anonymous;$(id).disabled=this.busy||!this.authReady;}
  $('google-signin').querySelector('b').textContent=anonymous?this.t('綁定 Google，保留進度','Link Google · keep progress'):this.t('使用 Google 登入','Continue with Google');$('facebook-signin').querySelector('b').textContent=anonymous?this.t('綁定 Facebook，保留進度','Link Facebook · keep progress'):this.t('使用 Facebook 登入','Continue with Facebook');
  $('anonymous-signin').hidden=!cloud.cloudConfigured||!!this.identity;$('anonymous-signin').disabled=this.busy||!this.authReady;
  $('anonymous-note').hidden=!anonymous;$('anonymous-note').textContent=this.t('匿名身分保存在目前瀏覽器。綁定 Google、Facebook 或 Email，可保留進度及跨裝置登入。','Your anonymous sign-in is saved in this browser. Link Google, Facebook or email to keep progress and sign in on another device.');
  $('profile-retry').hidden=!this.identity||!this.profileFailed;$('profile-retry').disabled=this.busy;
  $('auth-action').value=mode;$('auth-action').disabled=claim||this.busy;$('auth-action').querySelector('[value=register]').textContent=anonymous?this.t('綁定 Email','Link email'):this.t('建立帳戶','Create account');
  $('auth-action').querySelector('[value=signin]').hidden=anonymous;$('cloud-name-row').hidden=mode==='signin'||anonymous&&!!this.cloudProfile;$('email-row').hidden=mode==='claim';$('password-row').hidden=mode==='claim';
  $('cloud-name').required=!$('cloud-name-row').hidden;$('player-email').required=mode!=='claim';$('player-password').required=mode!=='claim';$('player-password').autocomplete=mode==='register'?'new-password':'current-password';
  $('cloud-form').hidden=!cloud.cloudConfigured||!!this.cloudProfile&&!anonymous||!!this.identity&&this.profileFailed;
  $('cloud-submit').disabled=this.busy;$('cloud-logout').hidden=!this.identity;$('cloud-logout').disabled=this.busy;$('cloud-logout').textContent=anonymous?this.t('登出匿名帳戶','Sign out of anonymous account'):this.t('登出，改用本機試玩','Sign out and play locally');$('guest-form').hidden=!!this.identity;$('guest-form').querySelector('button').disabled=this.busy;
  $('password-reset').hidden=mode!=='signin';$('password-reset').disabled=this.busy||!this.authReady||Date.now()<this.resetUntil;
  $('cloud-status').textContent=!cloud.cloudConfigured?this.t('Firebase 專案尚未建立。可先本機試玩，這個名字不會保留到雲端。','Firebase is not configured. You can play locally; this does not reserve a cloud name.'):this.cloudProfile?anonymous?this.t(`匿名玩家 ${this.cloudProfile.name}；綁定登入方式後可跨裝置保留進度。`,`Playing anonymously as ${this.cloudProfile.name}. Link a sign-in method to keep progress across devices.`):this.t(`已登入 ${this.cloudProfile.name}；青蛙幣與排行可跨裝置同步。`,`Signed in as ${this.cloudProfile.name}; Frog Coins and ranks sync across devices.`):this.profileFailed?this.t('帳戶已登入，雲端紀錄暫時未載入。','You are signed in. Your cloud save has not loaded yet.'):this.t('名字會在雲端唯一保留；同一帳戶可在其他裝置登入。','Reserve a unique player name and sign in on other devices.');
  $('cloud-submit').textContent=anonymous&&this.cloudProfile?this.t('綁定 Email，保留進度 ↗','Link email · keep progress ↗'):mode==='signin'?this.t('登入 ↗','Sign in ↗'):mode==='claim'?this.t('保留這個名字 ↗','Reserve this name ↗'):this.t('建立帳戶並保留名字 ↗','Create account and reserve name ↗');
 }
 resetCooldown(){this.resetUntil=Date.now()+60000;clearTimeout(this.resetTimer);this.resetTimer=setTimeout(()=>this.authView(),60000);}
 async forgotPassword(){
  if(this.busy||Date.now()<this.resetUntil)return;const email=$('player-email');email.value=email.value.trim();
  if(!email.value||!email.checkValidity()){email.focus();email.reportValidity();return;}
  this.busy=true;this.authView();$('password-reset-feedback').textContent=this.t('正在送出重設密碼電郵…','Requesting a password reset email…');
  try{await cloud.resetPassword(email.value,this.t('zh-TW','en'));this.resetCooldown();$('password-reset-feedback').textContent=this.t('如這個 Email 已註冊，你將會收到重設連結。請檢查收件匣及垃圾郵件。','If this email is registered, a reset link will arrive. Check your inbox and spam folder.');}
  catch(error){if(error.code==='auth/too-many-requests')this.resetCooldown();$('password-reset-feedback').textContent=error.code==='auth/operation-not-allowed'?this.t('Email／密碼登入尚未啟用，暫時不能重設密碼。','Email/password sign-in is not enabled, so password reset is unavailable.')+' (auth/operation-not-allowed)':this.error(error);}
  finally{this.busy=false;this.authView();$('password-reset-feedback').scrollIntoView({block:'nearest'});}
 }
 async retryProfile(){
  if(this.busy)return;this.busy=true;this.authView();this.feedback('account-feedback',null);
  try{this.cloudProfile=await cloud.readCloudProfile();this.profileFailed=false;this.render();this.onChange?.();if(this.cloudProfile){this.close('player-dialog');if(this.wantPlay){this.wantPlay=false;this.onPlay?.();}}else $('auth-action').value='claim';}
  catch(cause){this.feedback('account-feedback',{message:'profile-load-failed',cause});}
  finally{this.busy=false;this.authView();}
 }
 async providerLogin(provider){
  if(this.busy)return;this.busy=true;this.authView();this.feedback('account-feedback',null);
  try{const {user,profile}=await (provider==='facebook'?cloud.signInFacebook():provider==='anonymous'?cloud.signInAnonymous():cloud.signInGoogle());this.identity=user;this.cloudProfile=profile;this.profileFailed=false;this.authReady=true;this.render();this.onChange?.();if(!profile){$('auth-action').value='claim';this.authView();$('cloud-name').focus();}else{this.close('player-dialog');if(this.wantPlay){this.wantPlay=false;this.onPlay?.();}}}
  catch(error){if(error?.message==='profile-load-failed'){this.identity=error.user??this.identity;this.cloudProfile=null;this.profileFailed=true;}this.feedback('account-feedback',error);}
  finally{this.busy=false;$('cloud-submit').disabled=false;this.authView();}
 }
 async authenticate(){if(this.busy)return;this.passwordVisibility(false);this.busy=true;this.authView();this.feedback('account-feedback',null);try{const mode=$('auth-action').value,email=$('player-email').value.trim(),password=$('player-password').value;let profile;if(mode==='register'){const name=this.cloudProfile?.name||$('cloud-name').value;normalizeName(name);if(password.length<8)throw Error('auth/weak-password');profile=await cloud.register(email,password,name);}else if(mode==='claim')profile=await cloud.claimName($('cloud-name').value);else profile=await cloud.signIn(email,password);this.authReady=true;this.profileFailed=false;this.cloudProfile=profile;this.identity=profile?{uid:profile.uid,isAnonymous:mode==='claim'&&!!this.identity?.isAnonymous}:this.identity;$('player-password').value='';if(!profile){$('auth-action').value='claim';this.identity=this.identity??{uid:'pending'};this.authView();return;}this.render();this.onChange?.();this.close('player-dialog');if(this.wantPlay){this.wantPlay=false;this.onPlay?.();}}catch(error){if(error?.message==='profile-load-failed'){this.identity=error.user??this.identity;this.cloudProfile=null;this.profileFailed=true;}this.feedback('account-feedback',error);if(error?.message==='name-taken'){this.identity=this.identity??{uid:'pending'};$('auth-action').value='claim';this.authView();}}finally{this.busy=false;$('cloud-submit').disabled=false;this.authView();}}
 render(){const p=this.profile,a=animal(p.selected);const account=$('profile-open');account.setAttribute('aria-label',this.t(this.identity?'玩家帳戶':'玩家登入',this.identity?'Player account':'Player sign in'));account.title=account.getAttribute('aria-label');account.querySelector('[data-copy=profileButton]').textContent=this.t(this.identity?'帳戶':'登入',this.identity?'Account':'Sign in');$('player-name').textContent=p.name||this.t('河岸新朋友','A new river friend');$('player-animal').textContent=a.emoji;$('player-mode').textContent=p.mode==='cloud'?this.identity?.isAnonymous?this.t('匿名玩家 · 世界排行','Anonymous · world rankings'):this.t('已登入 · 世界排行','Signed in · world rankings'):this.t('本機試玩 · 不列入世界排行','Local practice · unranked');$('wallet-coins').textContent=p.coins.toLocaleString();$('shop-coins').textContent=p.coins.toLocaleString();this.syncWorldRank();this.renderWorldRank();}
 rankPlayer(){return this.cloudProfile?.uid===this.identity?.uid?this.cloudProfile:null;}
 async syncWorldRank(force=false){
  const p=this.rankPlayer();
  if(!p){if(this.worldRank.key){this.rankRequest++;this.worldRank={key:'',status:'idle',value:null,at:0};}return;}
  const key=`${p.uid}|${p.best}|${p.bestAt??0}`,current=this.worldRank;
  if(current.key===key&&(current.status==='loading'||!force&&Date.now()-current.at<60000))return;
  const request=++this.rankRequest;
  this.worldRank={key,status:p.best>0?'loading':'unranked',value:null,at:Date.now()};this.renderWorldRank();
  if(p.best<=0)return;
  try{
   const result=await cloud.playerRank();
   if(request!==this.rankRequest||this.rankPlayer()?.uid!==p.uid)return;
   if(result.uid!==p.uid||result.score!==p.best||!Number.isSafeInteger(result.rank)||result.rank<1)throw Error('rank-not-ready');
   this.worldRank={key,status:'ready',value:result.rank,at:Date.now()};
  }catch{if(request!==this.rankRequest||this.rankPlayer()?.uid!==p.uid)return;this.worldRank={key,status:'error',value:null,at:Date.now()};}
  this.renderWorldRank();
 }
 renderWorldRank(){
  const visible=!!this.rankPlayer(),{status,value}=this.worldRank;
  const text=status==='ready'?this.t(`世界排行：第 ${value.toLocaleString()} 名`,`World rank: #${value.toLocaleString()}`):status==='unranked'?this.t('世界排行：未上榜','World rank: unranked'):status==='error'?this.t('世界排行暫未載入 · 重試','World rank unavailable · retry'):this.t('世界排行：讀取中…','Loading world rank…');
  for(const id of ['player-world-rank','personal-world-rank']){const node=$(id);node.hidden=!visible;if(!visible)continue;node.dataset.status=status;node.querySelector('.personal-rank-text').textContent=text;const icon=node.querySelector('.personal-rank-icon'),art=status==='ready'&&value<=10?rankBadge(value):'🌍';if(icon.innerHTML!==art)icon.innerHTML=art;}
  $('player-world-rank').setAttribute('aria-label',status==='error'?this.t('重新讀取我的世界排行','Retry my world rank'):text+this.t('，查看世界排行榜',', view world leaderboard'));
  $('player-world-rank').title=status==='unranked'?this.t('完成一局並取得分數，就可以上榜。','Finish a run with at least one landing to join the rankings.'):text;
 }
 async prepareRun(){if(!this.authReady)throw Error('auth-loading');if(this.identity&&!this.cloudProfile||!this.profile.name){this.openPlayer(true);return null;}if(this.cloudProfile){if(this.pending)await this.retryPending();const run=await cloud.beginCloudRun();return {...run,mode:'cloud',name:this.profile.name};}return {id:crypto.randomUUID(),animal:this.guest.selected,mode:'guest',name:this.guest.name};}
 async settle(run,score,bonusCoins=0){if(run.mode!=='cloud'){const result=settleLocal(this.guest,{...run,score,bonusCoins});this.guest=result.profile;this.saveGuest();this.render();return result;}this.pending={id:run.id,uid:run.uid,score,bonusCoins,animal:run.animal};this.storePending();return this.retryPending();}
 async retryPending(){if(!this.pending)return null;try{const done=await cloud.settleCloudRun(this.pending);this.cloudProfile=done.profile;this.pending=null;this.storePending();this.render();return done;}catch(error){if(['run-replaced','run-missing'].includes(error?.message)){this.pending=null;this.storePending();}throw error;}}
 async abandon(run){if(run?.mode==='cloud')try{await cloud.abandonCloudRun(run.id);}catch{/* A new online run atomically abandons an unfinished one. */}}
 async chooseAnimal(id){if(this.busy)return;this.busy=true;try{this.cloudProfile?this.cloudProfile=await cloud.selectOrBuy(id):this.guest=buyAnimal(this.guest,id);if(!this.cloudProfile)this.saveGuest();this.render();this.renderShop();this.onChange?.();$('shop-feedback').textContent=this.t(`出發！${animal(id).zh} 陪你過河。`,`Let's go! ${animal(id).en} is ready.`);}catch(error){this.feedback('shop-feedback',error);}finally{this.busy=false;}}
 openShop(){this.renderShop();$('shop-feedback').textContent='';this.show('animal-dialog');}
 renderShop(){const p=this.profile,root=$('animal-cards');root.replaceChildren();for(const a of ANIMALS){const card=document.createElement('article');card.dataset.animal=a.id;card.className='animal-card'+(a.id===p.selected?' selected':'');const canvas=document.createElement('canvas');canvas.setAttribute('aria-label',this.t(a.zh,a.en));canvas.setAttribute('role','img');const painter=new RiverScene(canvas);painter.resize(120,120);painter.animal(60,103,1.25,a.id,{});const title=document.createElement('h3');title.textContent=this.t(a.zh,a.en);const skill=document.createElement('span');skill.className='skill-tag';skill.textContent=this.t(a.skillZh,a.skillEn);const text=document.createElement('p');text.textContent=this.t(a.descriptionZh,a.descriptionEn);const button=document.createElement('button');button.type='button';button.textContent=a.id===p.selected?this.t('已選擇 ✓','Selected ✓'):p.owned.includes(a.id)?this.t('使用這位朋友','Use this friend'):this.t(`解鎖 · ${a.price} 青蛙幣`,`Unlock · ${a.price} Frog Coins`);button.disabled=a.id===p.selected||!p.owned.includes(a.id)&&p.coins<a.price;button.addEventListener('click',()=>this.chooseAnimal(a.id));card.append(canvas,title,skill,text,button);root.append(card);}}
 async openBoard(){this.renderBoard();this.show('leaderboard-dialog');if(cloud.cloudConfigured&&Date.now()-this.boardAt>10000)await this.refreshBoard();}
 renderBoard(){const root=$('rank-list');root.replaceChildren();for(const [i,row]of this.board.entries()){const li=document.createElement('li'),rank=document.createElement('span'),art=document.createElement('span'),name=document.createElement('span'),kind=document.createElement('small'),score=document.createElement('strong');rank.className='rank-number';rank.setAttribute('role','img');rank.innerHTML=rankBadge(i+1);rank.setAttribute('aria-label',this.t(`第 ${i+1} 名`, `Rank ${i+1}`));art.className='rank-animal';art.textContent=animal(row.animal).emoji;art.setAttribute('aria-hidden','true');name.className='rank-name';name.textContent=row.name;kind.textContent=this.t(animal(row.animal).zh,animal(row.animal).en);name.append(kind);score.textContent=row.score;li.append(rank,art,name,score);root.append(li);}$('refresh-board').disabled=!cloud.cloudConfigured;$('board-status').textContent=!cloud.cloudConfigured?this.t('Firebase 專案尚未建立，暫未開放世界排名。','Firebase is not configured; world rankings are not available.'):this.board.length?this.t(`已同步 ${this.board.length} 位玩家的個人最佳紀錄。`,`Synced personal bests from ${this.board.length} players.`):this.t('暫時未有玩家紀錄。第一位河岸英雄可能就係你。','No ranked runs yet. You could be the first river hero.');}
 async refreshBoard(){if(!cloud.cloudConfigured){this.renderBoard();return;}$('refresh-board').disabled=true;$('board-status').textContent=this.t('正在讀取世界前十名…','Fetching the world top ten…');try{this.board=await cloud.topTen();this.boardAt=Date.now();this.renderBoard();this.syncWorldRank(true);}catch(error){$('board-status').textContent=this.error(error);}finally{$('refresh-board').disabled=false;}}
 language(){this.render();this.authView();if($('animal-dialog').open)this.renderShop();if($('leaderboard-dialog').open)this.renderBoard();}
}
