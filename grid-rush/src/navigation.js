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

// Keep both game clicks while suppressing the browser's double-click zoom action.
document.addEventListener('dblclick',event=>{
 if(!event.target.closest?.('input,textarea,[contenteditable="true"]'))event.preventDefault();
},{passive:false});
