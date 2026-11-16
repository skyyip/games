// Original Hong Kong snack / street-object doodles. Dark outlines on cream plaques
// remain legible on light, green and vermilion button backgrounds.
export const ICON_INK='#273b36',ICON_PAPER='#fff2cf';
const drawings={
 bao:'<path d="M7 20Q6 10 16 7Q26 10 25 20Q16 26 7 20Z" fill="#f4cf7c"/><path d="m12 9 2 5m4-5-1 5"/><circle cx="12" cy="18" r=".8"/><circle cx="20" cy="18" r=".8"/><path d="M14 21q2 2 4 0"/>',
 tram:'<path d="M8 8h16v17H8z" fill="#91b6a0"/><path d="M8 15h16M16 3v5M11 28v-3m10 3v-3M10 10h4v3h-4zm8 0h4v3h-4zm-8 8h4v3h-4zm8 0h4v3h-4z" fill="#fff2cf"/>',
 lantern:'<path d="M16 3v4m0 18v4M11 7h10m-10 18h10"/><path d="M10 9q-8 9 0 14h12q8-5 0-14Z" fill="#d97557"/><path d="M13 11q-3 6 0 10m6-10q3 6 0 10"/><circle cx="13" cy="17" r=".8"/><circle cx="19" cy="17" r=".8"/>',
 coin:'<circle cx="16" cy="16" r="10" fill="#e0b258"/><rect x="13" y="13" width="6" height="6" rx="1" fill="#fff2cf"/><path d="M11 7l-3 4m16 9-4 4"/>',
 card:'<path d="m9 6 16 3-3 19L6 25Z" fill="#95bba6"/><path d="m12 12 8 1m-10 7 9 1"/><circle cx="17" cy="16" r="2" fill="#f0be62"/>',
 trophy:'<path d="M10 6h12v8q0 8-6 8t-6-8Z" fill="#e0b258"/><path d="M10 8H5q0 10 7 9m10-9h5q0 10-7 9M16 22v4m-6 2h12"/><path d="m14 10 2 1 2-1v4h-4z" fill="#fff2cf"/>',
 tick:'<path d="M7 17l6 6L26 9" stroke-width="3.5"/>',
 close:'<path d="m10 10 12 12m0-12L10 22" stroke-width="3"/>',
 tea:'<path d="M7 11h16v12q-8 6-16 0Z" fill="#dca968"/><path d="M23 13h5q2 9-5 8M6 28h20m-14-20q-2-3 0-5m6 5q-2-3 0-5"/><circle cx="12" cy="18" r=".8"/><circle cx="18" cy="18" r=".8"/>',
 phone:'<path d="M7 7l5-2 4 7-4 3q2 5 6 6l3-4 6 4-2 5Q9 29 5 12Z" fill="#91b6a0"/>',
 people:'<circle cx="11" cy="12" r="4" fill="#e4bf74"/><circle cx="23" cy="12" r="4" fill="#91b6a0"/><path d="M4 26v-4q7-8 14 0v4m0-6q6-6 11 2v4"/>',
 refresh:'<path d="M25 13q-1-8-10-8Q4 6 5 17q0 10 11 10 7-1 9-6M24 5v9h-9"/>',
 back:'<path d="m15 7-9 9 9 9m-9-9h20"/>',
 letter:'<rect x="5" y="8" width="22" height="17" rx="3" fill="#a2c4ad"/><path d="m6 10 10 9 10-9"/>',
 book:'<path d="M4 7q7-3 12 1 5-4 12-1v19q-7-3-12 0-5-3-12 0Z" fill="#e6c47a"/><path d="M16 9v16m-9-13h5m-5 5h5m8-5h5m-5 5h5"/>'
};
export function iconSVG(kind='bao'){return '<svg class="hk-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="1" y="1" width="30" height="30" rx="9" fill="'+ICON_PAPER+'"/><g fill="none" stroke="'+ICON_INK+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(drawings[kind]??drawings.bao)+'</g></svg>';}
const classify=b=>{const known={'account-open':'people','book-open':'book','board-open':'trophy','life-half':'coin','life-phone':'phone','life-audience':'people','arcade-lobby':'back','arcade-retry':'refresh'};if(known[b.id])return known[b.id];const text=(b.getAttribute('aria-label')??'')+' '+b.textContent;
 if(b.classList.contains('close-button'))return 'close';if(/取消|返回|返去|登出|離場|割禾青/.test(text))return 'back';if(/排行|成績|獎金|領取/.test(text))return 'trophy';if(/開房|遊樂場|對戰|熱座|挑戰|開始/.test(text))return 'tram';if(/加入|街坊|觀眾|好友/.test(text))return 'people';if(/電郵|email/i.test(text))return 'letter';if(/重試|核對|同步|重新/.test(text))return 'refresh';if(/朋友|來電/.test(text))return 'phone';if(/確認|確定|保存|收到|明白|套用/.test(text))return 'tick';if(/購買|費|通行|退款/.test(text))return 'coin';if(/收藏|卡|扭蛋|金蛋/.test(text))return 'card';if(/查看|解說|故事|玩法|回顧|稱號/.test(text))return 'book';return 'bao';};
export function installIcons(){
 const make=kind=>{const holder=document.createElement('template');holder.innerHTML=iconSVG(kind);return holder.content.firstChild;};
 function decorate(root){
  const targets=[];if(root.matches?.('button,[data-icon]'))targets.push(root);targets.push(...(root.querySelectorAll?.('button,[data-icon]')??[]));
  for(const node of targets){if(!node.isConnected)continue;if(node.matches('[data-icon]')&&!node.matches('button')){if(!node.querySelector('.hk-icon')){node.replaceChildren(make(node.dataset.icon));}continue;}
   if(node.querySelector('.hk-icon'))continue;if(node.matches('.book-card,.culture-tile,.arcade-entry'))continue;
   const kind=classify(node),svg=make(kind);if(node.classList.contains('close-button')){node.replaceChildren(svg);continue;}
   const special=node.querySelector('.history-copy b');if(special){special.prepend(svg);continue;}
   if(node.classList.contains('nav-button')){node.firstElementChild?.replaceChildren(svg);continue;}
   for(const child of node.childNodes)if(child.nodeType===3)child.textContent=child.textContent.replace(/^[\s🎮🎴✨🏆🚐★☆✦↗☎▥🛒]+/u,'');
   node.prepend(svg);
  }
 }
 decorate(document.body);const pending=new Set();let frame=0;
 const observer=new MutationObserver(records=>{for(const r of records){if(r.target.closest?.('.hk-icon'))continue;const owner=r.target.closest?.('button,[data-icon]');if(owner)pending.add(owner);for(const n of r.addedNodes)if(n.nodeType===1&&!n.matches('svg,.hk-icon'))pending.add(n);}if(pending.size&&!frame)frame=requestAnimationFrame(()=>{frame=0;const nodes=[...pending];pending.clear();for(const n of nodes)decorate(n);});});observer.observe(document.body,{childList:true,subtree:true,characterData:true});return ()=>observer.disconnect();
}
