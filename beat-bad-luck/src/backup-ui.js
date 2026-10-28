import {createBackup,parseBackup,BACKUP_LIMIT} from './backup.js';
import {getLanguage} from '../../grid-rush/src/language.js';
export function createBackupUI({getState,beforeExport,onImport,isPlaying,isPersistent}){
 const $=s=>document.querySelector(s),dialog=$('#import-dialog'),file=$('#import-save-file');let pending=null,busy=false,opener=null,requestedOpener=null;
 const local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en;
 const put=(id,zh,en)=>{$(id).textContent=local(zh,en);};
 function render(){
  put('#save-tools-title','帶住攤位周圍去','Take your stall with you');
  put('#save-tools-note','同一網址及共用儲存空間會自動同步。若手機把瀏覽器與主畫面版本分開儲存，請在原版本匯出存檔，再到另一版本匯入。存檔包括香油錢、功德、法寶剩餘次數、擺設及紀錄；兩份存檔不會合併。','The same URL and shared storage sync automatically. If your phone separates browser and Home Screen storage, export here and import in the other version. Backups include oil, merit, remaining kit uses, decorations and records. Backups replace rather than merge.');
  put('#export-save','匯出存檔','Export save');put('#import-save','匯入存檔','Import save');
  put('#import-title','將這個攤位帶過來？','Bring this stall over?');
  put('#import-warning','這會取代目前版本的進度。建議先匯出現有存檔備份；擺設的耐用時間會照常流逝。','This replaces progress in this version. Export your current save first if you want a backup. Decoration durability keeps ageing normally.');
  put('#cancel-import','保留現在的攤位','Keep current stall');put('#confirm-import','取代並載入','Replace and load');
  if(pending)put('#import-summary',`${pending.coins.toLocaleString(undefined,{maximumFractionDigits:2})} 香油錢 · ${pending.merit.toLocaleString(undefined,{maximumFractionDigits:2})} 功德 · ${pending.rituals} 次儀式 · ${pending.records.length} 項紀錄`,`${pending.coins.toLocaleString(undefined,{maximumFractionDigits:2})} oil · ${pending.merit.toLocaleString(undefined,{maximumFractionDigits:2})} merit · ${pending.rituals} rituals · ${pending.records.length} records`);
 }
 function note(zh,en){put('#save-tools-status',zh,en);}
 $('#export-save').addEventListener('click',()=>{
  if(isPlaying())return;beforeExport();const blob=new Blob([createBackup(getState())],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`beat-bad-luck-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
  note('存檔已準備下載。在另一版本按「匯入存檔」，選擇這個檔案。','Your save is ready to download. Choose this file with Import save in the other version.');
 });
 $('#import-save').addEventListener('click',()=>{if(!isPlaying()&&!busy)file.click();});
 file.addEventListener('change',async()=>{
  const selected=file.files?.[0];file.value='';if(!selected||busy||isPlaying())return;busy=true;$('#import-save').disabled=true;
  try{if(selected.size>BACKUP_LIMIT)throw new Error('size');const next=parseBackup(await selected.text());if(isPlaying())return;pending=next;opener=requestedOpener??$('#import-save');requestedOpener=null;render();dialog.showModal();$('#cancel-import').focus();}
  catch{note('讀不到這份存檔。請選擇由本遊戲匯出的 JSON 存檔（最多 256 KB）；目前進度未改變。','Unable to read this save. Choose a JSON backup exported by this game (up to 256 KB). Your progress is unchanged.');}
  finally{busy=false;$('#import-save').disabled=false;}
 });
 $('#cancel-import').addEventListener('click',()=>dialog.close());
 $('#confirm-import').addEventListener('click',()=>{if(!pending||isPlaying())return;const next=pending;pending=null;dialog.close();onImport(next);note(isPersistent()?'存檔已載入，繼續經營你的小攤！':'存檔已載入；目前無法永久儲存，離開前請再匯出備份。',isPersistent()?'Save loaded. Your stall is ready!':'Save loaded for this visit. Storage is unavailable; export again before leaving.');});
 dialog.addEventListener('close',()=>{pending=null;opener?.focus({preventScroll:true});});
 dialog.addEventListener('keydown',event=>{if(event.key!=='Tab')return;const first=$('#cancel-import'),last=$('#confirm-import');if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
 render();return {render,requestImport(from){if(isPlaying()||busy)return;requestedOpener=from;file.click();}};
}
