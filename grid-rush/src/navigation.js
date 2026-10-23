// This classic head script runs before the first rendering opportunity.
// Native page-transition promises may reject when a navigation is skipped.
for (const type of ['pageswap','pagereveal']) {
  window.addEventListener(type,({viewTransition})=>{
    if(!viewTransition)return;
    viewTransition.ready.catch(()=>{});
    viewTransition.finished.catch(()=>{});
    viewTransition.updateCallbackDone.catch(()=>{});
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)viewTransition.skipTransition();
  });
}
