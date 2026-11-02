import {createBackup,parseBackup,BACKUP_LIMIT} from './backup.js';
import {getLanguage} from '../../grid-rush/src/language.js';
export function createBackupUI({getState,beforeExport,onImport,isPlaying,isPersistent}){
 const $=s=>document.querySelector(s),dialog=$('#import-dialog'),file=$('#import-save-file');let pending=null,busy=false,opener=null,requestedOpener=null;
 const local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en;
 const put=(id,zh,en)=>{const node=$(id),target=id==='#save-tools-title'?(node.querySelector('.collection-launch-label')??node):node;target.textContent=local(zh,en);};
 function render(){
  put('#save-tools-title','帶住攤位周圍去','Take your stall with you');
  put('#save-tools-note','同一網址及共用儲存空間會自動同步。若手機把瀏覽器與主畫面版本分開儲存，請在原版本匯出存檔，再到另一版本匯入。存檔包括香油錢、功德、法寶剩餘次數、擺設及紀錄；兩份存檔不會合併。匯出文件會自動加密並加上防修改驗證，匯入時不需密碼。','The same URL and shared storage sync automatically. If your phone separates browser and Home Screen storage, export here and import in the other version. Backups include oil, merit, remaining kit uses, decorations and records. Backups replace rather than merge. Exported files are encrypted and checked for modification; no password is needed to import.');
  put('#export-save','匯出存檔','Export save');put('#import-save','匯入存檔','Import save');
  put('#import-title','將這個攤位帶過來？','Bring this stall over?');
  put('#import-warning','這會取代目前版本的進度。建議先匯出現有存檔備份；擺設的耐用時間會照常流逝。','This replaces progress in this version. Export your current save first if you want a backup. Decoration durability keeps ageing normally.');
  put('#cancel-import','保留現在的攤位','Keep current stall');put('#confirm-import','取代並載入','Replace and load');
  if(pending)put('#import-summary',`${pending.coins.toLocaleString(undefined,{maximumFractionDigits:2})} 香油錢 · ${pending.merit.toLocaleString(undefined,{maximumFractionDigits:2})} 功德 · ${pending.rituals} 次儀式 · ${pending.records.length} 項紀錄`,`${pending.coins.toLocaleString(undefined,{maximumFractionDigits:2})} oil · ${pending.merit.toLocaleString(undefined,{maximumFractionDigits:2})} merit · ${pending.rituals} rituals · ${pending.records.length} records`);
 }
 function note(zh,en){put('#save-tools-status',zh,en);if($('#settings-dialog').open)put('#settings-save-status',zh,en);}
 function working(value){busy=value;for(const id of ['#export-save','#import-save','#settings-export','#settings-import'])$(id).disabled=value;}
 $('#export-save').addEventListener('click',async()=>{
  if(isPlaying()||busy)return;working(true);note('正在加密存檔…','Encrypting your save…');
  try{beforeExport();note('正在加密存檔…','Encrypting your save…');const raw=await createBackup(getState()),blob=new Blob([raw],{type:'application/octet-stream'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`beat-bad-luck-${new Date().toISOString().slice(0,10)}.bblsave`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
   note('加密存檔已準備下載。在另一版本按「匯入存檔」，選擇這個 .bblsave 檔案。','Your encrypted save is ready to download. Choose this .bblsave file with Import save in the other version.');
  }catch(error){if(error.message==='backup-sanity'){note('存檔資料未通過合理性檢查，未有匯出；目前進度未被修改。','Save data failed validation and was not exported. Your progress is unchanged.');return;}note(error.message==='backup-crypto'?'無法加密存檔。請以 HTTPS 網址或支援加密的新版本瀏覽器開啟遊戲，再試一次。':'未能匯出加密存檔，請稍後再試；目前進度未改變。',error.message==='backup-crypto'?'Encryption is unavailable. Open the game over HTTPS in an up-to-date browser and try again.':'Unable to export the encrypted save. Try again; your progress is unchanged.');}
  finally{working(false);}
 });
 $('#import-save').addEventListener('click',()=>{if(!isPlaying()&&!busy)file.click();});
 file.addEventListener('change',async()=>{
  const selected=file.files?.[0];file.value='';if(!selected||busy||isPlaying())return;working(true);note('正在驗證及解密存檔…','Verifying and decrypting your save…');
  try{if(selected.size>BACKUP_LIMIT)throw new Error('size');const next=await parseBackup(await selected.text());if(isPlaying())return;if($('#settings-dialog').open)await $('#settings-dialog').close();if(isPlaying())return;pending=next;opener=requestedOpener??$('#import-save');requestedOpener=null;render();dialog.showModal();$('#cancel-import').focus();}
  catch(error){note((error.message==='backup-sanity'?'存檔數據超出允許範圍。':'檔案驗證失敗。')+'讀不到這份加密存檔。請選擇本遊戲匯出的 .bblsave 文件（最多 256 KB）；舊版明文 JSON、被修改或損壞的文件不接受。目前進度未改變。',(error.message==='backup-sanity'?'Save values are outside the allowed limits. ':'Save verification failed. ')+'Unable to read this encrypted save. Choose a .bblsave file exported by this game (up to 256 KB). Plain JSON, modified or damaged files are not accepted. Your progress is unchanged.');}
  finally{working(false);}
 });
 $('#cancel-import').addEventListener('click',()=>dialog.close());
 $('#confirm-import').addEventListener('click',()=>{if(!pending||isPlaying())return;const next=pending;pending=null;dialog.close();onImport(next);note(isPersistent()?'存檔已載入，繼續經營你的小攤！':'存檔已載入；目前無法永久儲存，離開前請再匯出備份。',isPersistent()?'Save loaded. Your stall is ready!':'Save loaded for this visit. Storage is unavailable; export again before leaving.');});
 dialog.addEventListener('close',()=>{pending=null;opener?.focus({preventScroll:true});});
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const first=$('#cancel-import'),last=$('#confirm-import');if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 render();return {render,requestImport(from){if(isPlaying()||busy)return;requestedOpener=from;file.click();}};
}
