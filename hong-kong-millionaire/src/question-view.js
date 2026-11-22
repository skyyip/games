// Question wording and difficulty no longer depend on picture transformations.
export const visualModes=q=>[q.textOnly?'text':'original'];
export const visualSpec=q=>({mode:q.textOnly?'text':'original'});
export const chooseVisualMode=q=>visualModes(q)[0];
export function questionView(q){
 return {question:q.textQuestion??q.question,options:q.options,answer:q.answer,
  alt:q.imageAlt??q.observation?.alt??'香港文化漫畫插畫',clue:''};
}
