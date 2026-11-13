import {FIREBASE_CONFIG} from './firebase-settings.js';
import {configured,authClient} from './player-cloud.js';
import {firebasePlayerAPI} from './player-api.js';
import {fresh,readProgress} from './progress.js';
import {scopeKey,PLAYER_PREFIX,playerName} from './player-state.js';
import {setPlayerName} from './player-name.js';
import {createSocialUI} from './social-ui.js';
import {getLanguage} from '../../grid-rush/src/language.js';
const $=id=>document.getElementById(id);
const local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en;
export function playerError(e){return ({'auth-initialization-timeout':'登入服務準備逾時。請按「重試登入服務」；本機進度保留。','auth-module-unavailable':'登入模組未能載入，請重試；若剛更新遊戲，可按「重新載入遊戲」。','auth-build-required':'登入服務尚未部署完成，請稍後再試；本機進度保留。','auth-disabled':'獨立Firebase尚未設定；可繼續本機遊玩。','auth-project-conflict':'請使用打小人自己的Firebase專案。','auth-config-invalid':'Firebase公開設定未填妥。','auth/popup-closed-by-user':'Google登入已取消。','auth/popup-blocked':'請允許Google登入視窗。','auth/operation-not-allowed':'請在Firebase啟用這種登入方式。','auth/unauthorized-domain':'請把網站網域加入Firebase授權網域。','auth/invalid-credential':'Email或密碼不正確。','auth/email-already-in-use':'此Email已有帳戶，請使用登入。','auth/credential-already-in-use':'此登入方式已有另一個帳戶，請先保留匿名進度。','auth/network-request-failed':'暫時無法連線；本機進度保留。','save-conflict':'另一部裝置有較新進度。先備份本機，再載入雲端；不會自動覆蓋。','identity-changed':'帳戶已切換，請重新整理。','gift-limit':'今天已送出10份，香港時間午夜後可再送。','item-unavailable':'這件物品已使用或送出，請重新整理。','inventory-full':'同款物品已達庫存／等級上限，先使用或送出後再領取。','gift-unavailable':'這份禮物已領取、取消或退回。','gift-expired':'禮物已超過7天，寄件人可取回。','item-expired':'這件小攤物件已耗盡耐用度，不能送出。','registered-account-required':'請先把匿名帳戶綁定Email或Google，再使用好友互贈。','profile-required':'請先建立你的玩家名片。','handle-unavailable':'暫時未能分配玩家代號，請稍後再試。','handle-taken':'暫時未能分配玩家代號，請稍後再試。','handle-fixed':'玩家代號建立後固定，名字仍可修改。','not-found':'找不到這個玩家代號。','already-requested':'你們已有好友關係或待處理邀請。','friend-required':'只有雙方接受的好友可以互贈。','permission-denied':'暫時無法完成此操作。請重新整理好友資料後再試；若持續出現，請稍後重試。','failed-precondition':'好友服務正在準備，請稍後重新整理。','friend-cooldown':'這份邀請剛被婉拒或移除，請相隔24小時後再邀請。','friend-unavailable':'這份邀請已處理或好友狀態已變更，請重新整理。','invalid-gift-message':'請選擇預設打氣句。','invalid-friend':'請搜尋其他玩家的代號，不能邀請自己。','unavailable':'暫時離線，進度保存在此裝置。','invalid-profile':'玩家代號需3–16位小寫英文字母、數字或底線，以字母開頭。'})[e?.code??e?.message]??'操作未完成；目前進度仍保存在本機。';}
export function authStartupError(e){
 if(/(?:resolve|resolution|bare|relative).*module specifier|module specifier.*(?:resolve|resolution|bare|relative)/i.test(e?.message??''))return Error('auth-build-required');
 if(/dynamically imported|module script|fetch.*module|importing a module/i.test(e?.message??''))return Error('auth-module-unavailable');
 return e;
}
function defaultStorage(){try{return globalThis.localStorage;}catch{return null;}}
export function createPlayerHub({getState,setState,switchScope,saveLocal,isPlaying,onInterrupt,notice=()=>{},storage=defaultStorage(),loadAuth=authClient,loadAPI=firebasePlayerAPI,cloudEnabled=configured,authTimeoutMs=15000}={}){
 const hub={uid:null,user:null,loading:false,revision:0,dirty:false,blocked:false,ready:false,name:'',epoch:0,api:null,auth:null,authStarting:null,authWarm:null,authReady:false,authLoading:false,authError:null,authAttempt:0,busy:false,importing:false,timer:null,uploading:null,baseRevision:0,stopNotifications:null};
 const project=FIREBASE_CONFIG?.projectId??'local',identityKey=PLAYER_PREFIX+'.identity.'+project;
 let scope=null,adoptCandidate=null,adoptName='',socialData=null,socialRequest=0,socialRefreshing=false,socialUI=null;
 const read=key=>{try{return storage?.getItem(key);}catch{return null;}},write=(key,value)=>{try{storage?.setItem(key,value);}catch{notice('瀏覽器無法永久儲存，請立即匯出備份。');}};
 const metadataKey=()=>PLAYER_PREFIX+'.sync.'+encodeURIComponent(project+':'+(hub.uid??'local'));
 const nameKey=()=>PLAYER_PREFIX+'.name.'+encodeURIComponent(scope??'local');
 function dialog(id){const d=$(id);if(!d.open)d.showModal();d.querySelector('button:not(:disabled),input')?.focus({preventScroll:true});}
 function note(text,id='bbl-account-feedback'){$(id).textContent=text;}
 function status(text){const node=$('bbl-sync-status');if(node)node.textContent=text;}
 function meta(){write(metadataKey(),JSON.stringify({revision:hub.revision,dirty:hub.dirty}));}
 function setName(value){hub.name=playerName(value);setPlayerName(hub.name);write(nameKey(),hub.name);renderAccount();}
 function rememberName(){if(hub.name||isPlaying()||hub.loading||document.querySelector('dialog[open]'))return;$('bbl-player-name-input').value='';dialog('bbl-name-dialog');}
 function cloudSaved(){document.dispatchEvent(new CustomEvent('bbl:cloudsaved'));}
 function apply(remote){hub.revision=remote.revision;hub.dirty=false;hub.blocked=false;setName(remote.name||hub.name||'路人甲');setState(remote.state);saveLocal();meta();status(local('已與雲端同步','Synced to your account'));renderAccount();}
 function conflict(){hub.blocked=true;clearTimeout(hub.timer);meta();status('另一裝置有新版本，請先在帳戶與設定匯出本機備份。');renderAccount();}
 function queue(){clearTimeout(hub.timer);if(!hub.uid||!hub.ready||hub.blocked||hub.importing||!hub.dirty)return;hub.timer=setTimeout(()=>{if(isPlaying()){queue();return;}hub.flush().catch(e=>{if(e.message==='save-conflict')conflict();else status('暫未同步，本機進度保留；可按重試。');});},1000);}
 hub.importContext=()=>({key:project+':'+hub.epoch+':'+(hub.uid??'local'),uid:hub.uid,label:hub.user?.email||hub.user?.displayName||hub.name||'路人甲'});
 hub.canImport=()=>!hub.busy&&!hub.loading&&!isPlaying()&&(!hub.uid||!!hub.api&&hub.authReady&&!hub.blocked&&(hub.ready||!!adoptCandidate));
 hub.importBackup=async(backup,context)=>{
  if(context?.key!==hub.importContext().key||!hub.uid)throw Error('identity-changed');
  if(!hub.canImport())throw Error(hub.blocked?'save-conflict':'import-busy');
  const epoch=hub.epoch,before=JSON.stringify(getState()),previous=hub.uploading;let applied=false,pending;
  hub.busy=true;hub.importing=true;clearTimeout(hub.timer);renderAccount();socialBusy();
  try{
   if(previous)await previous;if(epoch!==hub.epoch)throw Error('identity-changed');
   pending=hub.api.importBackup(backup.state,hub.name||adoptName||'路人甲',hub.revision,backup.exportedAt);hub.uploading=pending;
   const remote=await pending;if(epoch!==hub.epoch)throw Error('identity-changed');
   hub.ready=true;adoptCandidate=null;apply(remote);applied=true;$('bbl-adopt-dialog').close();cloudSaved();return remote;
  }catch(e){if(epoch===hub.epoch&&e.message==='save-conflict')conflict();throw e;}
  finally{if(hub.uploading===pending)hub.uploading=null;if(epoch===hub.epoch){hub.importing=false;hub.busy=false;if(!applied&&hub.ready&&JSON.stringify(getState())!==before){hub.dirty=true;meta();}renderAccount();socialBusy();watchNotifications();if(hub.dirty)queue();}}
 };
 hub.changed=()=>{if(!hub.uid||hub.loading||hub.importing||!hub.ready)return;hub.dirty=true;meta();status('本機已保存，等待雲端同步…');queue();};
 hub.flush=async()=>{if(hub.importing)return hub.uploading;clearTimeout(hub.timer);if(!hub.api||!hub.ready)throw Error('signin');if(hub.blocked)throw Error('save-conflict');if(hub.uploading){await hub.uploading;if(hub.dirty)return hub.flush();return;}if(!hub.dirty)return;const epoch=hub.epoch,raw=JSON.stringify(getState()),name=hub.name,revision=hub.revision;hub.uploading=hub.api.save(JSON.parse(raw),name,revision).then(remote=>{if(epoch!==hub.epoch)return;hub.revision=remote.revision;hub.dirty=JSON.stringify(getState())!==raw||hub.name!==name;meta();cloudSaved();status(hub.dirty?'仍有新變更等待同步…':'已與雲端同步');if(hub.dirty)queue();}).catch(e=>{if(epoch===hub.epoch&&e.message==='save-conflict')conflict();throw e;}).finally(()=>{hub.uploading=null;});return hub.uploading;};
 async function identity(user){const next=user?.uid??null;hub.user=user??null;renderAccount();if(next===hub.uid){hub.loading=false;renderAccount();if(!user)note('請選擇登入方式；也可繼續本機遊玩。');watchNotifications();rememberName();return;}const epoch=++hub.epoch;hub.busy=false;hub.importing=false;++socialRequest;hub.loading=true;hub.ready=false;socialData=null;socialRefreshing=false;socialUI?.reset();$('bbl-social-feedback').textContent='';adoptCandidate=null;$('bbl-social-count').hidden=true;for(const d of document.querySelectorAll('dialog[open]'))if(d.id!=='settings-dialog')d.close();hub.stopNotifications?.();hub.stopNotifications=null;clearTimeout(hub.timer);if(hub.uploading)await hub.uploading.catch(()=>{});if(epoch!==hub.epoch)return;if(isPlaying())onInterrupt?.();adoptName=hub.name;const oldGuest=hub.uid===null?structuredClone(getState()):null;hub.uid=next;document.dispatchEvent(new CustomEvent('bbl:identitychange'));scope=next?project+':'+next:null;switchScope(scope);setName(read(nameKey())??'');hub.api=null;hub.blocked=false;hub.dirty=false;hub.revision=0;write(identityKey,next??'');
  try{if(!next){hub.ready=false;status('本機遊玩・不會上傳心塞內容');return;}const api=await loadAPI();if(epoch!==hub.epoch)return;hub.api=api;const remote=await api.load();if(epoch!==hub.epoch)return;let savedMeta;try{savedMeta=JSON.parse(read(metadataKey()));}catch{}
   if(remote){hub.ready=true;if(savedMeta?.dirty){hub.revision=savedMeta.revision??0;hub.dirty=true;if(hub.revision!==remote.revision)conflict();else queue();}else apply(remote);}
   else{adoptCandidate=oldGuest??readProgress(read(scopeKey(null)));$('bbl-adopt-summary').textContent=`${adoptCandidate.rituals}次儀式・${Math.floor(adoptCandidate.coins).toLocaleString()}香油錢。帶入會複製到新帳戶，原本本機備份保留。`;$('settings-dialog').close();dialog('bbl-adopt-dialog');}
  }catch(e){if(epoch!==hub.epoch)return;note(playerError(e));status('未能讀取雲端；原有資料保留，請重試。');hub.ready=false;}finally{if(epoch===hub.epoch){hub.loading=false;renderAccount();watchNotifications();rememberName();}}
 }
 async function initialize(adopt){if(!hub.api||hub.busy)return;hub.busy=true;const epoch=hub.epoch;try{const state=adopt?adoptCandidate:fresh();const remote=await hub.api.save(state,hub.name||adoptName||'路人甲',0);if(epoch!==hub.epoch)return;hub.ready=true;apply(remote);$('bbl-adopt-dialog').close();adoptCandidate=null;watchNotifications();rememberName();}catch(e){note(playerError(e),'bbl-adopt-feedback');}finally{hub.busy=false;renderAccount();}}
 function warmAuth(retry=false){
  if(retry)hub.authWarm=null;
  if(!hub.authWarm){const pending=Promise.resolve().then(()=>loadAuth({retry})).catch(e=>{if(hub.authWarm===pending)hub.authWarm=null;throw e;});hub.authWarm=pending;}
  return hub.authWarm;
 }
 async function startAuth(retry=false){
  if(hub.auth&&hub.authReady&&!retry)return hub.auth;if(hub.authStarting)return hub.authStarting;
  const attempt=++hub.authAttempt;hub.authLoading=true;hub.authError=null;hub.authReady=false;renderAccount();let timer;
  const prepare=(async()=>{const auth=await warmAuth(retry);if(attempt!==hub.authAttempt)return null;hub.auth=auth;
   return new Promise((resolve,reject)=>{hub.stopAuth?.();hub.stopAuth=auth.onAuthStateChanged(auth.session,user=>{
    if(attempt!==hub.authAttempt)return;if(hub.authLoading&&user)note('登入服務已準備好。');hub.authReady=true;hub.authLoading=false;hub.authError=null;resolve(auth);identity(user);
   },e=>{if(attempt!==hub.authAttempt)return;hub.authReady=false;hub.authLoading=false;hub.authError=e;note(playerError(e));renderAccount();reject(e);});});
  })();
  const timed=new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('auth-initialization-timeout')),authTimeoutMs);});
  hub.authStarting=Promise.race([prepare,timed]).catch(e=>{
   if(attempt===hub.authAttempt){hub.authAttempt++;hub.stopAuth?.();hub.stopAuth=null;hub.auth=null;hub.authReady=false;hub.authLoading=false;hub.loading=false;
    hub.authError=authStartupError(e);
    note(playerError(hub.authError));rememberName();}
   throw e;
  }).finally(()=>{clearTimeout(timer);hub.authStarting=null;renderAccount();});return hub.authStarting;
 }
 async function runAuth(fn){if(!hub.auth||hub.busy)return;hub.busy=true;renderAccount();note('處理中…');try{const result=await fn();if(result?.user?.uid===hub.uid){hub.user=result.user;renderAccount();}note('已完成，進度按玩家帳戶分開保存。');}catch(e){note(playerError(e));}finally{hub.busy=false;$('bbl-password').value='';renderAccount();watchNotifications();}}
 function renderAccount(){const u=hub.user,enabled=!!hub.auth&&hub.authReady&&!hub.busy,registered=!!u&&!u.isAnonymous;$('settings-open').disabled=isPlaying();$('bbl-social-open').disabled=isPlaying();const scoreButton=$('bbl-scores-open');if(scoreButton)scoreButton.disabled=isPlaying();let label=$('settings-open-label');if(!label){label=document.createElement('span');label.id='settings-open-label';$('settings-open').append(label);}label.textContent=local('帳戶與設定','Account & settings');$('settings-open').setAttribute('aria-label',local('玩家帳戶、小攤設定與存檔','Player account, settings and saves'));for(const id of ['settings-import','import-save'])if($(id))$(id).disabled=!hub.canImport();$('bbl-account-state').textContent=u?u.isAnonymous?'匿名帳戶：綁定Email或Google後可跨裝置登入及互贈。':`已登入：${u.email||u.displayName||hub.name}`:'免登入也可本機遊玩。登入後保存進度及結交好友。';$('bbl-auth-status').hidden=!hub.authLoading;$('bbl-auth-status').textContent=local('正在準備登入服務，完成後便可登入…','Preparing sign-in. Login becomes available when ready…');$('bbl-auth-retry').hidden=!hub.authError||!cloudEnabled;$('bbl-auth-reload').hidden=!hub.authError||!cloudEnabled;$('bbl-auth-retry').disabled=hub.authLoading||hub.busy;$('bbl-google').textContent=hub.authLoading?local('正在準備 Google 登入…','Preparing Google sign-in…'):local('使用 Google 登入／綁定','Sign in / link with Google');if(hub.authLoading)$('bbl-google').setAttribute('aria-describedby','bbl-auth-status');else $('bbl-google').removeAttribute('aria-describedby');$('bbl-account-form').hidden=registered;$('bbl-google').hidden=registered;$('bbl-anonymous').hidden=!!u;$('bbl-signout').hidden=!u;for(const id of ['bbl-google','bbl-anonymous','bbl-email-submit','bbl-reset','bbl-signout'])$(id).disabled=!enabled;$('bbl-account-mode').disabled=hub.busy;$('bbl-password').minLength=$('bbl-account-mode').value==='register'?8:1;$('bbl-password').autocomplete=$('bbl-account-mode').value==='register'?'new-password':'current-password';$('bbl-cloud-pull').disabled=!hub.uid||hub.busy;$('bbl-cloud-retry').disabled=!hub.uid||!hub.ready||hub.blocked||hub.busy;$('bbl-cloud-conflict').hidden=!hub.blocked;$('bbl-import-local').hidden=!adoptCandidate;document.dispatchEvent(new CustomEvent('bbl:accountstate'));}
 $('settings-open').onclick=()=>{if(isPlaying())return;dialog('settings-dialog');note(!cloudEnabled?'獨立Firebase尚未設定；本機遊玩與名字可正常使用。':hub.auth?hub.user?'帳戶已登入，可在下方管理同步及備份。':'請選擇登入方式；也可繼續本機遊玩。':'正在準備登入…');startAuth().catch(()=>{});};
 $('bbl-auth-retry').onclick=()=>{note('正在重新準備登入服務…');startAuth(true).catch(()=>{});};
 $('bbl-auth-reload').onclick=()=>location.reload();
 $('bbl-account-form').onsubmit=e=>{e.preventDefault();const email=$('bbl-email').value.trim(),password=$('bbl-password').value,register=$('bbl-account-mode').value==='register',a=hub.auth;if(!a)return;if(hub.user?.isAnonymous&&!register){note('請選建立／綁定帳戶，保留同一UID與原進度。');return;}runAuth(()=>register?hub.user?.isAnonymous?a.linkWithCredential(a.session.currentUser,a.EmailAuthProvider.credential(email,password)):a.createUserWithEmailAndPassword(a.session,email,password):a.signInWithEmailAndPassword(a.session,email,password));};
 $('bbl-account-mode').onchange=renderAccount;
 $('bbl-google').onclick=()=>{const a=hub.auth;if(!a)return;runAuth(()=>{const provider=new a.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});return hub.user?.isAnonymous?a.linkWithPopup(a.session.currentUser,provider,a.browserPopupRedirectResolver):a.signInWithPopup(a.session,provider,a.browserPopupRedirectResolver);});};
 $('bbl-anonymous').onclick=()=>runAuth(()=>hub.auth.signInAnonymously(hub.auth.session));
 $('bbl-signout').onclick=async()=>{if(hub.user?.isAnonymous&&!confirm('匿名帳戶登出後可能無法找回。建議先綁定Email或Google。仍要登出？'))return;try{if(hub.dirty)await hub.flush();await runAuth(()=>hub.auth.signOut(hub.auth.session));}catch(e){note(playerError(e));}};
 $('bbl-reset').onclick=()=>{const email=$('bbl-email').value.trim();if(!email){note('先填寫Email。');return;}runAuth(async()=>{try{await hub.auth.sendPasswordResetEmail(hub.auth.session,email);}catch(e){if(e.code!=='auth/user-not-found')throw e;}});};
 $('bbl-cloud-retry').onclick=()=>hub.flush().catch(e=>note(playerError(e)));
 $('bbl-cloud-pull').onclick=async()=>{if(!hub.uid)return;try{if((hub.dirty||hub.blocked)&&!confirm('載入雲端會取代這個帳戶在此裝置的進度。建議先按匯出保留本機備份。確定載入？'))return;const epoch=hub.epoch,api=hub.api??await loadAPI();if(epoch!==hub.epoch)return;hub.api=api;const remote=await api.load();if(epoch!==hub.epoch)return;if(remote){hub.ready=true;apply(remote);watchNotifications();}else{adoptCandidate=readProgress(read(scopeKey(null)));$('bbl-adopt-summary').textContent='這個帳戶尚未有雲端進度。選擇帶入本機小攤，或重新開始。';$('settings-dialog').close();dialog('bbl-adopt-dialog');}}catch(e){note(playerError(e));}};

 $('bbl-adopt-dialog').addEventListener('cancel',e=>e.preventDefault());
 $('bbl-adopt').onclick=()=>initialize(true);$('bbl-fresh').onclick=()=>initialize(false);$('bbl-import-local').onclick=()=>{if(adoptCandidate)dialog('bbl-adopt-dialog');};
 $('bbl-name-open').onclick=()=>{$('bbl-player-name-input').value=hub.name;dialog('bbl-name-dialog');};
 $('bbl-player-name-form').onsubmit=e=>{e.preventDefault();const value=playerName($('bbl-player-name-input').value);if(!value)return;setName(value);hub.changed();$('bbl-name-dialog').close();};
 $('bbl-name-skip').onclick=()=>{setName(hub.name||'路人甲');hub.changed();$('bbl-name-dialog').close();};$('bbl-name-dialog').addEventListener('cancel',e=>{e.preventDefault();$('bbl-name-skip').click();});
 function registered(){return !!hub.uid&&!hub.user?.isAnonymous&&hub.ready;}
 function socialFeedback(message,tone='info'){$('bbl-social-feedback').textContent=message;$('bbl-social-feedback').dataset.tone=tone;}
 function socialBusy(){
  const root=$('bbl-social-content');root.setAttribute('aria-busy',String(hub.busy));$('bbl-social-refresh').disabled=hub.busy||socialRefreshing;$('bbl-social-refresh').hidden=!registered();
  const label=$('bbl-social-refresh-label');if(label)label.textContent=socialRefreshing?local('更新中…','Updating…'):local('更新','Refresh');
  for(const button of root.querySelectorAll('button')){if(hub.busy){if(!button.disabled){button.disabled=true;button.dataset.socialBusy='true';}}else if(button.dataset.socialBusy){delete button.dataset.socialBusy;button.disabled=false;}}
 }
 async function refreshSocial(){
  if(!registered())return false;const epoch=hub.epoch,request=++socialRequest;socialRefreshing=true;socialBusy();socialFeedback(local('正在更新好友和禮物…','Updating friends and gifts…'));
  try{const [card,friends,gifts,quota]=await Promise.all([hub.api.card(),hub.api.friends(),hub.api.gifts(),hub.api.quota()]);if(epoch!==hub.epoch||request!==socialRequest)return false;let challenges=[],challengeError=null;try{await hub.api.syncChallenges?.();challenges=await hub.api.challenges?.()??[];}catch(e){challengeError=e;}if(epoch!==hub.epoch||request!==socialRequest)return false;socialData={card,friends,gifts,quota,challenges,challengeError};renderSocial();socialFeedback(local('好友和禮物已更新。','Friends and gifts are up to date.'),'success');return true;}
  catch(e){if(epoch===hub.epoch&&request===socialRequest){if(!socialData||socialData.error)socialData={error:e};renderSocial();socialFeedback(playerError(e),'error');}return false;}
  finally{if(epoch===hub.epoch&&request===socialRequest){socialRefreshing=false;socialBusy();}}
 }
 async function socialAction(fn,withSave=false,control=null,options={}){
  if(hub.busy||!registered())return false;hub.busy=true;socialRefreshing=false;++socialRequest;const epoch=hub.epoch,oldLabel=control?.textContent;
  const row=control?.closest('article');row?.querySelector('.bbl-friend-action-feedback')?.remove();const feedback=row?document.createElement('p'):null;
  if(feedback){feedback.className='bbl-friend-action-feedback';feedback.setAttribute('role','status');row.append(feedback);feedback.textContent=control.dataset.friendAction==='accepted'?'正在接受好友邀請…':'正在更新…';}
  if(control)control.textContent=control.dataset.friendAction==='accepted'?local('接受中…','Accepting…'):local('處理中…','Working…');
  socialBusy();socialFeedback(local('正在處理，稍等一下…','Working on it. Just a moment…'));
  try{
   if(withSave)await hub.flush();if(epoch!==hub.epoch)return false;
   const result=await fn();if(epoch!==hub.epoch)return false;if(result?.state)apply(result);
   if(result?.friend&&socialData&&!socialData.error)socialData={...socialData,friends:socialData.friends.map(f=>f.id===result.friend.id?result.friend:f)};
   if(options.patch&&socialData&&!socialData.error)socialData=options.patch(socialData,result);
   renderSocial();const refreshed=await refreshSocial();if(epoch!==hub.epoch)return false;
   const message=result?.friend?(result.friend.status==='accepted'?local('已接受邀請！好友已加入名單，現在可以互贈。','Invitation accepted! You can now exchange gifts.'):result.friend.status==='removed'?local('已移除好友。','Friend removed.'):local('已婉拒邀請。','Invitation declined.')):options.success;
   if(message)socialFeedback(message+(refreshed===false?local('其他資料暫未更新，請稍後重新整理。',' Other data could not refresh. Please try again later.'):''),'success');return true;
  }catch(e){if(e.message==='save-conflict')conflict();if(epoch===hub.epoch){const message=playerError(e);socialFeedback(message,'error');if(feedback?.isConnected)feedback.textContent=message;}return false;}
  finally{if(epoch===hub.epoch){hub.busy=false;if(control?.isConnected)control.textContent=oldLabel;socialBusy();renderAccount();}}
 }
 function renderSocial(){socialUI?.render();socialBusy();}
 $('bbl-social-open').onclick=()=>{if(isPlaying())return;dialog('bbl-social-dialog');socialUI.open();socialBusy();refreshSocial();};$('bbl-social-refresh').onclick=refreshSocial;
 socialUI=createSocialUI({root:$('bbl-social-content'),getData:()=>socialData,getState,getName:()=>hub.name,getUID:()=>hub.uid,isRegistered:registered,isBusy:()=>hub.busy,refresh:refreshSocial,feedback:socialFeedback,login:()=>{$('bbl-social-dialog').close();$('settings-open').click();},perform:(action,withSave,control,options)=>socialAction(()=>action({...hub.api,send:(id,token,message='')=>hub.api.send(id,token,hub.revision,{message}),claim:id=>hub.api.claim(id,hub.revision),cancel:id=>hub.api.cancel(id,hub.revision)}),withSave,control,options)});
 function watchNotifications(){hub.stopNotifications?.();hub.stopNotifications=null;if(!registered()||document.hidden||!hub.api.watchNotifications)return;const epoch=hub.epoch;hub.stopNotifications=hub.api.watchNotifications(count=>{if(epoch!==hub.epoch)return;const badge=$('bbl-social-count');badge.hidden=count===0;badge.textContent=String(Math.min(count,99));$('bbl-social-open').setAttribute('aria-label',`好友與禮物${count?'，'+count+'份待處理':''}`);},()=>{});}
 document.addEventListener('visibilitychange',async()=>{if(document.hidden){hub.stopNotifications?.();hub.stopNotifications=null;return;}watchNotifications();if(!hub.api||!hub.ready||isPlaying())return;const epoch=hub.epoch;try{const remote=await hub.api.load();if(epoch!==hub.epoch||!remote)return;if(remote.revision!==hub.revision){if(hub.dirty)conflict();else apply(remote);}else if(hub.dirty)queue();}catch{status('暫時離線，本機進度保留。');}});
 document.addEventListener('languagechange',()=>{renderAccount();if($('bbl-social-dialog').open)renderSocial();});
 for(const b of document.querySelectorAll('[data-bbl-close]'))b.onclick=()=>$(b.dataset.bblClose).close();
 setName(read(nameKey())??'');renderAccount();status('本機遊玩・未登入');if(cloudEnabled&&read(identityKey)){hub.loading=true;startAuth().catch(()=>{hub.loading=false;rememberName();});}else{queueMicrotask(rememberName);if(cloudEnabled){const preload=()=>startAuth().catch(()=>{});if('requestIdleCallback'in window)requestIdleCallback(preload,{timeout:1200});else setTimeout(preload,250);}}
 hub.contributeChallenges=async()=>{if(!registered())return;await hub.flush();await hub.api.syncChallenges?.();};
 hub.render=renderAccount;hub.getName=()=>hub.name;hub.isRegistered=registered;hub.rememberName=rememberName;return hub;
}
