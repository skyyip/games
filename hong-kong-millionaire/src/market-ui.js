import {CULTURE_CARDS,cardById} from './economy.js';
import {MARKET_MAX_PRICE,validMarketPrice,marketFee,parseMarketAction} from './market-policy.js';
const money=n=>'$'+Number(n).toLocaleString('en-HK');
const el=(tag,text='',className='')=>{const n=document.createElement(tag);n.textContent=text;if(className)n.className=className;return n;};
const messages={'market-duplicate-required':'每款要留返最後一張，只可出售重複卡。','market-own-listing':'這是你的掛單，可以取消退回卡片。','market-not-seller':'只有賣家可以取消掛單。','market-listing-unavailable':'這張卡已成交或取消，沒有再次扣款。','market-listing-missing':'這張掛單已不存在，請更新市集。','market-price-changed':'掛單價格與確認時不同，請更新後再確認。','market-request-mismatch':'上次操作資料不相符，請重新核對。','insufficient-balance':'可用獎金不足。','market-wallet-not-ready':'請先重新讀取你的收藏。','invalid-market-price':'售價須為1至1,000,000,000的整數。','invalid-market-card':'找不到這張文化卡。'};
const errorText=e=>messages[e?.message]??'市集連線未完成，請稍後核對或重試。';
export function installMarket({cloud,getUid,getState,getBusy,visible,refreshWallet,cardFace,showCard}){
 let root=null,view='browse',items=[],cursor=null,status='',loading=false,busy=false,epoch=0,selected='',price='',intent=null;
 const confirm=document.createElement('dialog');confirm.id='market-confirm';confirm.setAttribute('aria-labelledby','market-confirm-title');confirm.innerHTML='<h2 id="market-confirm-title"></h2><p id="market-confirm-copy"></p><button id="market-confirm-submit" class="primary" type="button">確認</button><button id="market-confirm-cancel" class="outline" type="button">先再看看</button>';document.body.append(confirm);
 confirm.querySelector('#market-confirm-cancel').onclick=()=>confirm.close();confirm.addEventListener('close',()=>intent=null);
 const key=uid=>'sky.hkm.market.pending.'+uid;
 function pending(){try{return getUid()?parseMarketAction(JSON.parse(localStorage.getItem(key(getUid())))):null;}catch{return null;}}
 function clear(uid,id){try{if(JSON.parse(localStorage.getItem(key(uid)))?.requestId===id)localStorage.removeItem(key(uid));}catch{}}
 const current=(uid,version)=>getUid()===uid&&epoch===version;
 const disabled=()=>busy||loading||getBusy();
 function button(text,fn,off=false){const b=el('button',text,'outline');b.type='button';b.disabled=disabled()||off;b.onclick=fn;return b;}
 function ask(action,card){if(disabled()||pending())return;intent={...action,requestId:crypto.randomUUID()};const fee=action.type==='list'?marketFee(action.price):0;
  confirm.querySelector('#market-confirm-title').textContent=(action.type==='list'?'掛出':action.type==='buy'?'購買':'取消')+'「'+card.name+'」'+(action.type==='cancel'?'掛單？':'1張？');
  confirm.querySelector('#market-confirm-copy').textContent=action.type==='list'?'售價 '+money(action.price)+'；成交費5% '+money(fee)+'，實收 '+money(action.price-fee)+'。掛單會先預留1張。':action.type==='buy'?'將扣除 '+money(action.price)+'，卡片直接加入你的卡冊。':'這張卡會退回你的卡冊，不收費。';confirm.showModal();
 }
 confirm.querySelector('#market-confirm-submit').onclick=()=>{const action=intent;confirm.close();if(action)submit(action);};
 async function checkPending(uid,version){const a=pending();if(!a)return;const checked=await cloud.marketStatus(a);if(!current(uid,version))return;
  if(checked.confirmed){clear(uid,a.requestId);status='上次操作已確認。';await refreshWallet();}else status='上次操作尚未確認，可核對或用原操作重試。';
 }
 async function query(more){const page=await cloud.marketListings({mine:view==='mine',after:more?cursor:null});return {items:more?[...new Map([...items,...page.items].map(i=>[i.id,i])).values()]:page.items,cursor:page.cursor};}
 async function load({more=false,refresh=true}={}){if(disabled()||!getUid())return;const uid=getUid(),version=epoch;loading=true;status='正在讀取市集…';render();
  try{if(!more){if(refresh)await refreshWallet();if(!current(uid,version))return;status='';await checkPending(uid,version);}if(!current(uid,version))return;const next=await query(more);if(current(uid,version)){items=next.items;cursor=next.cursor;}}
  catch(error){if(current(uid,version))status=errorText(error);}finally{if(current(uid,version)){loading=false;render();}}
 }
 async function submit(action){if(disabled()||!getUid())return;const uid=getUid(),version=epoch,old=pending();if(old&&old.requestId!==action.requestId)return;busy=true;status='正在核對交易…';try{const saved=JSON.stringify(action);localStorage.setItem(key(uid),saved);if(localStorage.getItem(key(uid))!==saved)throw Error('storage-unavailable');}catch{status='瀏覽器未能保留交易記錄，請允許本機儲存後再試。';busy=false;render();return;}render();
  try{
   let result;try{result=await cloud.marketAction(action);}catch(error){let checked;try{checked=await cloud.marketStatus(action);}catch{}if(!checked?.confirmed)throw error;result=checked.result;}
   if(!current(uid,version))return;clear(uid,action.requestId);status=result.type==='buy'?'已購入「'+(cardById(result.cardId)?.name??'文化卡')+'」。':result.type==='cancel'?'掛單已取消，卡片已退回。':'掛單已確認。';
   try{await refreshWallet();if(!current(uid,version))return;const next=await query(false);if(current(uid,version)){items=next.items;cursor=next.cursor;}}catch{if(current(uid,version))status+=' 請更新餘額及市集。';}
  }catch(error){if(current(uid,version)){if(messages[error.message]&&!['market-request-mismatch','market-wallet-not-ready'].includes(error.message))clear(uid,action.requestId);status=errorText(error)+(pending()?' 可核對或重試上次操作。':'');if(!pending()){if(action.listingId&&['market-listing-unavailable','market-listing-missing'].includes(error.message))items=items.filter(i=>i.id!==action.listingId);try{await refreshWallet();if(current(uid,version)){const next=await query(false);items=next.items;cursor=next.cursor;}}catch{}}}}
  finally{if(current(uid,version)){busy=false;render();}}
 }
 async function recover(){if(disabled()||!getUid())return;const uid=getUid(),version=epoch;loading=true;status='正在核對上次操作…';render();try{await checkPending(uid,version);if(!current(uid,version))return;const next=await query(false);if(current(uid,version)){items=next.items;cursor=next.cursor;}}catch(error){if(current(uid,version))status=errorText(error);}finally{if(current(uid,version)){loading=false;render();}}}
 function render(container){if(container)root=container;if(!root||!visible())return;root.replaceChildren();const toolbar=el('div','','market-controls');toolbar.setAttribute('role','group');toolbar.setAttribute('aria-label','市集分類');
  for(const [id,label]of [['browse','買卡'],['mine','我的掛單']]){const b=button(label,()=>{view=id;items=[];cursor=null;render();load();});b.dataset.marketView=id;b.setAttribute('aria-pressed',String(view===id));b.setAttribute('data-no-icon','');toolbar.append(b);}const refresh=button('更新市集',()=>load());refresh.id='market-refresh';toolbar.append(refresh);root.append(toolbar);
  const note=el('p',status,'status');note.id='market-status';note.setAttribute('role','status');root.append(note);
  const saved=pending();if(saved){const recovery=el('div','','market-recovery');recovery.append(button('核對上次操作',recover),button('重試上次操作',()=>submit(saved)));root.append(recovery);}
  if(view==='mine'){
   const cards=getState()?.wallet?.cards??{},duplicates=CULTURE_CARDS.filter(c=>(cards[c.id]??0)>1);if(duplicates.length){
    const form=el('form','','market-sell'),choice=el('select'),input=el('input'),quote=el('p','','market-quote');choice.id='market-card';input.id='market-price';
    if(!duplicates.some(c=>c.id===selected))selected=duplicates[0].id;for(const c of duplicates){const option=el('option',c.name+' · 可售'+(cards[c.id]-1)+'張');option.value=c.id;choice.append(option);}choice.value=selected;choice.onchange=()=>selected=choice.value;
    const cardLabel=el('label','出售卡片'),priceLabel=el('label','售價');cardLabel.htmlFor=choice.id;priceLabel.htmlFor=input.id;input.type='number';input.min='1';input.max=String(MARKET_MAX_PRICE);input.step='1';input.inputMode='numeric';input.required=true;input.value=price;input.disabled=choice.disabled=disabled()||!!saved;
    const updateQuote=()=>{price=input.value;const n=Number(price);quote.textContent=validMarketPrice(n)?'成交費5% '+money(marketFee(n))+' · 實收 '+money(n-marketFee(n)):'成交收5%手續費，整枚向上取整。';};input.oninput=updateQuote;updateQuote();
    const sell=button('掛出1張',()=>{},!!saved);sell.type='submit';sell.id='market-sell-submit';form.onsubmit=e=>{e.preventDefault();if(form.reportValidity()&&validMarketPrice(Number(input.value)))ask({type:'list',cardId:selected,price:Number(input.value)},cardById(selected));};form.append(cardLabel,choice,priceLabel,input,quote,el('p','掛出期間預留1張，每款會留返最後1張。','quiet'),sell);root.append(form);
   }else root.append(el('p','未有可售重複卡。每款會留返最後一張。','quiet'));
  }
  const grid=el('div','','market-grid');for(const item of items){const card=cardById(item.cardId);if(!card)continue;const own=item.sellerUid===getUid(),box=el('article','','culture-tile owned market-offer'),preview=el('button','','market-preview');preview.type='button';preview.setAttribute('data-no-icon','');preview.append(cardFace(card,true),el('b',card.name));preview.onclick=()=>showCard(card);box.append(preview,el('strong',money(item.price),'reward-price'),el('small',own?'成交可收 '+money(item.price-marketFee(item.price)):item.sellerName));const buy=button(own?'取消掛單':'購買',()=>ask(own?{type:'cancel',listingId:item.id}:{type:'buy',listingId:item.id,price:item.price},card),!!saved||!own&&(getState()?.balance??0)<item.price);buy.dataset.marketListing=item.id;box.append(buy);grid.append(box);}root.append(grid);
  if(!items.length&&!loading)root.append(el('p',view==='mine'?'暫時沒有未成交掛單。':'暫時未有街坊掛出卡片。','empty-book'));
  if(cursor){const more=button('載入更多',()=>load({more:true}));more.id='market-more';root.append(more);}
 }
 return {render,load,reset(){epoch++;root=null;view='browse';items=[];cursor=null;status='';loading=busy=false;selected=price='';intent=null;confirm.close();}};
}
