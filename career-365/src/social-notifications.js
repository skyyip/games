import {html} from './dom.js';
import {esc} from './comics.js';
import {accountScope} from './account-store.js';
import {readNotificationSeen,writeNotificationSeen,watchSocialNotifications} from './social-notifications-data.js';
const $=id=>document.getElementById(id);
export class SocialNotifications{
 constructor({store,show,openInbox,login,subscribe=watchSocialNotifications}){Object.assign(this,{store,show,openInbox,login,subscribe});this.uid=null;this.epoch=0;this.items=[];this.seen=new Set();this.stop=null;this.error=false;this.cached=false;this.loading=false;
  $('notifications-open').onclick=()=>this.open();$('notifications-retry').onclick=()=>this.restart();$('notifications-inbox').onclick=()=>this.openInbox();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)this.pause();else this.restart();});window.addEventListener('online',()=>this.restart());
  window.addEventListener('storage',e=>{if(this.uid&&e.key===this.key){this.seen=readNotificationSeen(this.store,this.key);this.render();}});this.render();
 }
 identity(user){const uid=user&&!user.isAnonymous?user.uid:null;if(uid===this.uid)return;this.pause();this.uid=uid;this.items=[];this.error=false;this.cached=false;this.loading=false;this.key=uid?'career-365.notifications.v1.'+accountScope(uid):null;this.seen=uid?readNotificationSeen(this.store,this.key):new Set();if($('notifications-dialog').open)$('notifications-dialog').close();this.render();if(uid&&!document.hidden)this.restart();}
 pause(){this.epoch++;this.stop?.();this.stop=null;}
 async restart(){this.pause();if(!this.uid||document.hidden)return;const epoch=this.epoch;this.error=false;this.loading=true;this.render();try{const stop=await this.subscribe(this.uid,value=>{if(epoch!==this.epoch)return;this.items=value.items;this.cached=value.cached;this.loading=value.loading;if($('notifications-dialog').open)this.markSeen();this.render();},()=>{if(epoch!==this.epoch)return;this.error=true;this.loading=false;this.render();});if(epoch!==this.epoch)stop();else this.stop=stop;}catch{if(epoch===this.epoch){this.error=true;this.loading=false;this.render();}}}
 markSeen(){if(!this.uid)return;for(const item of this.items)this.seen.add(item.key);this.seen=new Set([...this.seen].slice(-200));writeNotificationSeen(this.store,this.key,this.seen);}
 open(){if(!this.uid){this.login();return;}this.markSeen();this.render();this.show('notifications-dialog');$('notifications-title').focus({preventScroll:true});}
 render(){const count=this.items.filter(x=>!this.seen.has(x.key)).length,bell=$('notifications-open'),badge=$('notifications-count');badge.hidden=count===0;badge.textContent=count>99?'99+':String(count);bell.setAttribute('aria-label',this.uid?`通知${count?'，'+count+'則未讀':''}`:'登入後查看通知');bell.title=this.error?'通知暫未能更新，點擊查看':this.uid?'好友申請與公司邀請':'登入後查看通知';$('notifications-announcement').textContent=count?`有${count}則未讀社交通知`:'';
  $('notifications-state').textContent=this.error?'通知暫時未能更新，以下保留上次內容。可稍後重試；本機人生不受影響。':this.loading?'正在讀取通知…':this.cached?'離線或仍在連線，顯示已快取的通知。':'好友申請與公司邀請會在此更新。查看不代表接受邀請。';
  $('notifications-retry').hidden=!this.error;$('notifications-inbox').disabled=!this.uid;
  html($('notifications-list'),this.items.length?this.items.map(item=>`<article class="notification-item"><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p>${item.time?`<small>${esc(new Date(item.time).toLocaleString('zh-HK',{timeZone:'Asia/Hong_Kong'}))}</small>`:''}<button type="button" class="quiet" data-notification-view>查看${item.id.startsWith('friend:')?'好友申請':'邀請'} ↗</button></article>`).join(''):this.loading?'':'<p class="notification-empty">目前沒有待處理的好友申請或公司邀請。</p>');for(const button of $('notifications-list').querySelectorAll('[data-notification-view]'))button.onclick=()=>this.openInbox();
 }
}
