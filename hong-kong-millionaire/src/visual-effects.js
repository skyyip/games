import {questionView} from './question-view.js';
export function paintQuestionImage(image,frame,q){
 image.style.cssText='';image.alt=questionView(q).alt;
 image.dataset.mode='original';frame.dataset.visualMode='original';
 return null;
}
