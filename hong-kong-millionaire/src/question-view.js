// Effects are opt-in editorial puzzles: never randomly crop an unreviewed picture.
export function visualModes(q){
 if(q.textOnly)return ['text'];
 const allowed=q.modes??['original','text'];
 return q.observation?allowed:allowed.filter(mode=>mode==='original'||mode==='text');
}
export function visualSpec(q,mode){
 const crop=q.observation?.crop;
 return {mode,partial:mode==='partial'&&crop?crop.width*crop.height/400000:.08,vertical:q.observation?.mirrorAxis==='vertical'};
}
export function questionView(q,mode='original'){
 return {question:mode==='text'?(q.textQuestion??q.question):mode==='mirrored'?(q.observation?.mirroredPrompt??q.question):q.question,
  options:q.options,answer:q.answer,alt:q.observation?.alt??q.imageAlt??'香港文化漫畫題圖',clue:q.observation?.clue??''};
}
// A cropped question always shows exactly the authored source rectangle, including
// on narrow/landscape screens. Letterboxing must not expose neighbouring clues.
export function cropLayout(crop,width,height){
 const scale=Math.min(width/crop.width,height/crop.height);
 return {width:800*scale,height:500*scale,left:(width-crop.width*scale)/2-crop.x*scale,top:(height-crop.height*scale)/2-crop.y*scale,
  clip:`inset(${crop.y/5}% ${(800-crop.x-crop.width)/8}% ${(500-crop.y-crop.height)/5}% ${crop.x/8}%)`};
}

export function chooseVisualMode(q,seed,index){
 const modes=visualModes(q);let h=2166136261;for(const ch of `visual:${seed}:${index}:${q.id}`)h=Math.imul(h^ch.codePointAt(0),16777619);return modes[(h>>>0)%modes.length];
}
