// Game timing uses performance.now(); UI work is limited to twenty updates/second.
// CSS/WAAPI transforms remain compositor-driven between those updates.
export const UI_TICK_MS=50;
export function observeDecorativeVisibility(){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)entry.target.dataset.motionVisible=String(entry.isIntersecting);},{rootMargin:'60px'});
 for(const node of document.querySelectorAll('#intro,.fong-intro,.stall-showcase,.stall-wallet,#neighbourhood-hub,.records-card'))observer.observe(node);
 const visibility=()=>document.body.dataset.documentHidden=String(document.hidden);document.addEventListener('visibilitychange',visibility);visibility();
}
