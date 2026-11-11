import {CloudSave,firebaseCloudAdapter,cloudMessage} from './cloud-save.js';
const $=id=>document.getElementById(id);
export class CareerCloud{
 constructor({getGame,getUid,restore,notify,load=firebaseCloudAdapter}){Object.assign(this,{getGame,getUid,restore,notify,load});this.service=null;this.busy=false;this.uid=null;this.revision=0;
  $('cloud-check').onclick=()=>this.run(async()=>{const service=await this.start(),remote=await service.inspect();this.feedback(remote?`雲端：${remote.game.ageLabel}・${remote.game.s.profile.name}・版本 ${remote.revision}；本機：${this.getGame()?.ageLabel??'尚未開局'}。載入前會詢問，兩份進度不會自動合併。`:'雲端尚未有職涯，可上傳目前進度。');});
  $('cloud-upload').onclick=()=>this.run(async()=>{const service=await this.start();if(service.remote===undefined)throw Error('inspect-first');const game=this.getGame();if(!game)throw Error('invalid-save');if(service.remote&&!confirm('上傳會取代已檢查的雲端職涯。建議先匯出 JSON 備份。確定使用目前本機進度？'))return;await service.upload(game.s);this.feedback('已儲存至這個玩家的私人雲端存檔。換裝置後登入同一帳戶，再檢查並載入。');});
  $('cloud-download').onclick=()=>this.run(async()=>{const service=await this.start(),remote=await service.inspect();if(!remote){this.feedback('雲端尚未有職涯。');return;}if(!confirm(`載入 ${remote.game.s.profile.name}（${remote.game.ageLabel}）會取代這個帳戶的本機職涯，先匯出備份可保留目前進度。確定載入？`))return;await this.restore(remote.game);this.feedback('已載入雲端職涯，接下來的選擇會自動保存在本機；可隨時再次上傳。');});this.render();
 }
 identity(uid){this.uid=uid;this.revision++;this.service?.identity(uid);this.feedback(uid?'登入後可檢查、上傳或載入雲端職涯。':'本機遊玩無需帳戶；登入後可使用私人雲端存檔。');this.render();}
 async start(){const uid=this.getUid(),revision=this.revision;if(!uid)throw Error('signin');if(!this.service){const adapter=await this.load();if(revision!==this.revision||uid!==this.getUid())throw Error('identity-changed');this.service=new CloudSave(adapter);this.service.identity(uid);}return this.service;}
 feedback(text){$('cloud-status').textContent=text;}
 async run(fn){if(this.busy)return;this.busy=true;const revision=this.revision;this.render();this.feedback('正在連接雲端…');try{await fn();}catch(e){if(revision===this.revision)this.feedback(cloudMessage(e));}finally{this.busy=false;this.render();}}
 render(){for(const id of ['cloud-check','cloud-upload','cloud-download'])$(id).disabled=this.busy||!this.getUid();}
}
