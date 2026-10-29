// Game timing uses performance.now(); UI work is limited to ten updates/second.
// CSS/WAAPI transforms remain compositor-driven between those updates.
export const UI_TICK_MS=100;
export const WAIT_TICK_MS=250;
export const uiTickDelay=phase=>phase==='beat'?UI_TICK_MS:WAIT_TICK_MS;
// Avoid style invalidation and MutationObserver work when UI state has not changed.
export function setHidden(node,value){value=Boolean(value);if(node.hidden!==value)node.hidden=value;}
export function setData(node,key,value){value=String(value);if(node.dataset[key]!==value)node.dataset[key]=value;}
export function setAttribute(node,name,value){value=String(value);if(node.getAttribute(name)!==value)node.setAttribute(name,value);}
export function createDOMLookup(){const nodes=new Map();return selector=>{if(!/^#[\w-]+$/.test(selector))return document.querySelector(selector);let node=nodes.get(selector);if(!node?.isConnected){node=document.querySelector(selector);if(node)nodes.set(selector,node);}return node;};}
export function observeDecorativeVisibility(){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.dataset.motionVisible=String(entry.isIntersecting);},{rootMargin:'60px'});
 for(const node of document.querySelectorAll('#intro,.fong-intro,.stall-showcase,.stall-wallet,#neighbourhood-hub,.records-card'))observer.observe(node);
 const visibility=()=>document.body.dataset.documentHidden=String(document.hidden);document.addEventListener('visibilitychange',visibility);visibility();
}
