import {createBackup,parseBackupFile,BACKUP_LIMIT} from './backup.js';
import {getLanguage} from '../../grid-rush/src/language.js';
export function createBackupUI({getState,beforeExport,onImport,isPlaying,isPersistent,canImport=()=>true,getImportContext=()=>({key:'local',uid:null,label:''})}){
 const $=s=>document.querySelector(s),dialog=$('#import-dialog'),file=$('#import-save-file');
 let pending=null,busy=false,committing=false,opener=null,requestedOpener=null,selectionContext=null,returnDialog=null,completed=false,readAttempt=0;
 const local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en;
 const put=(id,zh,en)=>{const node=$(id),target=id==='#save-tools-title'?(node.querySelector('.collection-launch-label')??node):node;target.textContent=local(zh,en);};
 const sameTarget=context=>context?.key===getImportContext().key;
 function render(){
  put('#save-tools-title','帶住攤位周圍去','Take your stall with you');
  put('#save-tools-note','可在登入前或登入後匯入 .bblsave。登入後會先確認帳戶及備份摘要，成功儲存到雲端後才套用；兩份進度不會相加。備份後曾互贈的物品保留雲端現有數量，好友及互贈紀錄不變。','Import .bblsave files as a guest or while signed in. Review the account and summary first; account imports apply only after cloud storage succeeds. Progress is replaced, not added. Items transferred since the backup retain their current cloud inventory; friends and gift history stay unchanged.');
  put('#export-save','匯出存檔','Export save');put('#import-save','匯入存檔','Import save');
  put('#bbl-local-import-help','登入後也可匯入 .bblsave，確認後取代目前帳戶進度；備份後曾互贈的物品保留雲端現有數量，好友與互贈紀錄不變。','You can import .bblsave while signed in. Confirm to replace account progress; items transferred since the backup keep their cloud inventory. Friends and gift history stay unchanged.');
  const cloud=!!pending?.context.uid;
  put('#import-title',cloud?'將備份匯入這個帳戶？':'將這個攤位帶過來？',cloud?'Import this backup to your account?':'Bring this stall over?');
  put('#import-warning',cloud?'這會取代目前帳戶的遊戲進度，不會把兩份進度相加。備份後曾互贈的物品保留雲端目前數量及耐用時間，好友、玩家代號、互贈紀錄和每日送禮次數不變。建議先匯出目前進度備份。':'這會取代目前裝置的進度，不會合併。建議先匯出目前存檔備份；擺設耐用時間會照常流逝。',cloud?'This replaces account progress rather than adding two saves. Items transferred since the backup retain their current cloud quantities and durability. Friends, player code, gift history and daily gift quota stay unchanged. Export your current progress first if you want a backup.':'This replaces progress on this device rather than merging. Export your current save first if you want a backup. Decoration durability keeps ageing normally.');
  put('#cancel-import','保留現在的攤位','Keep current stall');
  put('#confirm-import',committing?(cloud?'正在儲存到雲端…':'正在匯入…'):(cloud?'確認取代並同步到帳戶':'取代並載入'),committing?(cloud?'Saving to cloud…':'Importing…'):(cloud?'Replace and sync to account':'Replace and load'));
  if(pending){const s=pending.backup.state,prefix=cloud?local(`登入帳戶：${pending.context.label}\n`,`Account: ${pending.context.label}\n`):'';$('#import-summary').textContent=prefix+local(`${s.coins.toLocaleString(undefined,{maximumFractionDigits:2})} 香油錢 · ${s.merit.toLocaleString(undefined,{maximumFractionDigits:2})} 功德 · ${s.rituals} 次儀式 · ${s.records.length} 項紀錄`,`${s.coins.toLocaleString(undefined,{maximumFractionDigits:2})} oil · ${s.merit.toLocaleString(undefined,{maximumFractionDigits:2})} merit · ${s.rituals} rituals · ${s.records.length} records`);}
  if(pending?.local){
   put('#import-title','上傳登入前的本機紀錄？','Upload your pre-login device progress?');
   put('#import-warning','確認後會取代此帳戶的遊戲進度，不會把金錢或庫存相加。本機原檔保留；曾互贈的物品保留雲端現有數量，好友及每日送禮次數不變。建議先取消並匯出目前帳戶備份。','Confirmation replaces account progress; money and inventory are not added together. The original device save is kept. Previously transferred items retain cloud quantities; friends and gift quota stay unchanged. Cancel and export your current account first if you need a backup.');
   $('#import-summary').textContent=local('登入前的本機紀錄：\n','Pre-login device progress:\n')+$('#import-summary').textContent;const current=getState();$('#import-summary').textContent+=local(`\n目前帳戶：${current.rituals} 次儀式 · ${current.coins.toLocaleString()} 香油錢 · ${current.merit.toLocaleString()} 功德`,`\nCurrent account: ${current.rituals} rituals · ${current.coins.toLocaleString()} oil · ${current.merit.toLocaleString()} merit`);
   if(!committing)put('#confirm-import','確認取代並上傳','Replace and upload');
  }
 }
 function note(zh,en){put('#save-tools-status',zh,en);put('#settings-save-status',zh,en);}
 function working(value){busy=value;for(const id of ['#export-save','#import-save','#settings-export','#settings-import'])$(id).disabled=value||id.includes('import')&&!canImport();$('#confirm-import').disabled=committing||!canImport();$('#cancel-import').disabled=committing;}
 function unavailable(){note('帳戶仍在同步、處理操作或有版本衝突；請先完成同步或載入雲端最新進度，再匯入。','The account is syncing, busy, or has a version conflict. Finish syncing or load the latest cloud progress before importing.');}
 $('#export-save').addEventListener('click',async()=>{
  if(isPlaying()||busy)return;working(true);note('正在加密存檔…','Encrypting your save…');
  try{beforeExport();const raw=await createBackup(getState()),blob=new Blob([raw],{type:'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`beat-bad-luck-${new Date().toISOString().slice(0,10)}.bblsave`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);note('加密存檔已準備下載，可在另一部裝置或登入帳戶後匯入這份 .bblsave。','Your encrypted save is ready to download. Import this .bblsave on another device or while signed in.');}
  catch(error){if(error.message==='backup-sanity')note('存檔資料未通過合理性檢查，未有匯出；目前進度未被修改。','Save data failed validation and was not exported. Your progress is unchanged.');else note(error.message==='backup-crypto'?'無法加密存檔，請以 HTTPS 或支援加密的瀏覽器再試。':'未能匯出加密存檔，請稍後再試；目前進度未改變。',error.message==='backup-crypto'?'Encryption is unavailable. Use HTTPS and an up-to-date browser.':'Unable to export the encrypted save. Your progress is unchanged.');}
  finally{working(false);}
 });
 async function requestLocal(state,from){
  if(!canImport()){unavailable();return;}if(isPlaying()||busy||!getImportContext().uid)return;
  const context=getImportContext(),attempt=++readAttempt;opener=from;returnDialog=from?.closest('dialog')??null;completed=false;
  const backup={state:structuredClone(state),exportedAt:0};if(returnDialog?.open)await returnDialog.close();
  if(attempt!==readAttempt||!sameTarget(context)||!canImport())return;
  pending={backup,context,local:true};$('#import-feedback').textContent='';render();dialog.showModal();$('#cancel-import').focus();
 }
 function requestImport(from){if(!canImport()){unavailable();return;}if(isPlaying()||busy)return;requestedOpener=from;selectionContext=getImportContext();file.click();}
 $('#import-save').addEventListener('click',()=>requestImport($('#import-save')));
 file.addEventListener('change',async()=>{
  const selected=file.files?.[0],context=selectionContext??getImportContext(),attempt=++readAttempt;file.value='';selectionContext=null;
  if(!selected||busy||isPlaying()||!canImport())return;
  if(!sameTarget(context)){note('帳戶已切換，請在目前帳戶重新選擇備份檔。','The account changed. Select the backup again for the current account.');return;}
  working(true);note('正在驗證及解密存檔…','Verifying and decrypting your save…');
  try{
   if(selected.size>BACKUP_LIMIT)throw Error('size');const backup=await parseBackupFile(await selected.text());
   if(attempt!==readAttempt||!sameTarget(context)||isPlaying()||!canImport())return;
   opener=requestedOpener??$('#import-save');requestedOpener=null;returnDialog=opener?.closest('dialog')??($('#settings-dialog').open?$('#settings-dialog'):null);completed=false;
   if(returnDialog?.open)await returnDialog.close();
   if(attempt!==readAttempt||!sameTarget(context)||isPlaying()||!canImport())return;
   pending={backup,context};$('#import-feedback').textContent='';render();dialog.showModal();$('#cancel-import').focus();
  }catch(error){note((error.message==='backup-sanity'?'存檔數據超出允許範圍。':'檔案驗證失敗。')+'請選擇本遊戲匯出的 .bblsave 文件（最多 256 KB）；被修改或損壞的檔案不接受。目前進度未改變。',(error.message==='backup-sanity'?'Save values are outside allowed limits. ':'Save verification failed. ')+'Choose a .bblsave exported by this game (up to 256 KB). Modified or damaged files are not accepted. Your progress is unchanged.');}
  finally{working(false);}
 });
 $('#cancel-import').addEventListener('click',()=>{if(!committing)dialog.close();});
 $('#confirm-import').addEventListener('click',async()=>{
  if(!pending||committing||isPlaying()||!canImport())return;
  const selected=pending;if(!sameTarget(selected.context)){dialog.close();note('帳戶已切換，未有匯入，請重新選擇備份檔。','The account changed. Nothing was imported; select the backup again.');return;}
  committing=true;working(true);render();put('#import-feedback',selected.context.uid?'正在儲存到雲端，請稍候…':'正在載入備份…',selected.context.uid?'Saving to cloud. Please wait…':'Loading your backup…');
  try{
   const result=await onImport(selected.backup.state,selected.context,selected.backup);
   if(!sameTarget(selected.context))return;
   completed=true;await dialog.close();note(selected.context.uid?`備份已匯入並同步到目前帳戶。${result?.protectedItems?'曾互贈的物品已保留雲端現有數量。':''}`:isPersistent()?'存檔已載入，繼續經營你的小攤！':'存檔已載入；目前無法永久儲存，離開前請再匯出備份。',selected.context.uid?'Backup imported and synced to your account. Transferred items retain their current cloud inventory.':isPersistent()?'Save loaded. Your stall is ready!':'Save loaded for this visit. Export again before leaving.');
  }catch(error){if(!sameTarget(selected.context))return;const code=error.code??error.message;put('#import-feedback',code==='save-conflict'?'雲端已有較新的進度，未有匯入。請先關閉此視窗，載入雲端最新進度後再試。':code==='backup-date'?'備份時間晚於目前時間，未有匯入。請確認裝置日期時間後再試。':'未能儲存到雲端，備份尚未套用；目前進度保留，請連線後重試。',code==='save-conflict'?'Newer cloud progress exists. Nothing was imported. Close this dialog, load the latest cloud progress, then try again.':code==='backup-date'?'The backup is dated in the future. Check your device clock and try again.':'Cloud storage failed. The backup was not applied; your current progress is unchanged. Reconnect and retry.');}
  finally{committing=false;working(false);render();}
 });
 dialog.addEventListener('cancel',event=>{if(committing)event.preventDefault();});
 dialog.addEventListener('close',()=>{const context=pending?.context;pending=null;const parent=returnDialog;returnDialog=null;if(context&&sameTarget(context)&&parent?.isConnected&&!(completed&&parent.id==='bbl-adopt-dialog')&&!document.querySelector('dialog[open]'))parent.showModal();if(opener?.getClientRects().length)opener.focus({preventScroll:true});});
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;if(committing){event.preventDefault();return;}const first=$('#cancel-import'),last=$('#confirm-import');if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 document.addEventListener('bbl:identitychange',()=>{readAttempt++;pending=null;returnDialog=null;if(dialog.open)dialog.close();working(busy);});
 document.addEventListener('bbl:accountstate',()=>working(busy));
 render();return {render,requestImport,requestLocal};
}
