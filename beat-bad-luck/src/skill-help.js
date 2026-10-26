import {KIT_SKILLS} from './kit-skills.js';
import {weaponArt} from './art.js';
import {getLanguage} from '../../grid-rush/src/language.js';
const specials={
 'flying-dagger':[['等準星亮起，依次點中第一、二、三張紙。','Wait for each ring, then tap papers one, two and three in order.']],
 flipflop:[['跟亮燈拍子：左 → 右 → 左 → 右。','Follow the lit beat: left → right → left → right.']],
 'plunger-nunchucks':[['按住紙人，拉過左邊再拉過右邊。','Hold the paper and pull to both the left and right.'],['鬆手，將小人彈走。','Release to fling the paper away.']],
 'beauty-fist':[['點拍紙人或「化妝一拳」五次。','Tap the paper or Makeover tap five times.'],['鏡子亮起後，點「照鏡收工」。','When the mirror unlocks, tap Mirror moment.']],
 'solar-torch':[['將電筒拖到左邊陽光，或按「移向陽光」。','Drag the torch into the sunshine on the left, or press Move to sun.'],['充滿後按「照一照」；陰天不會充電。','Press Shine after charging. Clouds pause charging.']],
 'immunity-token':[['拖開免死金牌，再將印章蓋進虛線框。','Move the immunity token aside, then stamp inside the dotted box.'],['覆核申請也要移開牌，再蓋一次印。','Move the appeal token aside and stamp it once more.']]
};
export const skillSteps=id=>KIT_SKILLS[id]?.steps?.map(s=>s.label)??specials[id]??[];
export function createSkillHelp({preferences,pause,resume,isPlaying,isPaused,activate,getWeapon}){
 const $=s=>document.querySelector(s),dialog=$('#skill-help-dialog');let current=null;
 const local=(zh,en)=>getLanguage()==='zh-Hant'?zh:en,put=(id,zh,en)=>{$(id).textContent=local(zh,en);};
 function render(){if(!current)return;const id=current.id,spec=KIT_SKILLS[id];put('#skill-help-title',spec.name[0],spec.name[1]);$('#skill-help-art').innerHTML=weaponArt(id);$('#skill-help-art').dataset.gesture=spec.steps?.[0]?.type??({'plunger-nunchucks':'drag','solar-torch':'drag','immunity-token':'drag'}[id]||'tap');
 $('#skill-help-steps').replaceChildren(...skillSteps(id).map(label=>{const li=document.createElement('li');li.textContent=label[getLanguage()==='zh-Hant'?0:1];return li;}));
 put('#skill-help-note',current.launch?'時間已暫停。按下開始後，才計 7 秒；不會額外扣法寶次數。':'示範不計時、不計分，也不消耗法寶。可用手勢，亦可用畫面內的輔助按鈕。',current.launch?'Time is paused. Your 7 seconds start only after you press Start. No extra kit use is charged.':'This untimed guide gives no score and costs no kit use. Use gestures or the on-screen alternatives.');
 put('#skill-help-go',current.launch?'開始 7 秒招式':'明白了',current.launch?'Start 7s skill':'Got it');put('#skill-help-cancel',current.launch?'先繼續普通擊打':'關閉示範',current.launch?'Keep whacking':'Close guide');
 }
 function finish(go){const pending=current;if(!pending)return;current=null;dialog.close();if(go)preferences.update({learned:[...preferences.value.learned,pending.id]});if(pending.launch){resume();if(go)activate();}else pending.opener?.focus({preventScroll:true});}
 function open(id,{launch=false,opener=document.activeElement}={}){if(!KIT_SKILLS[id]||dialog.open)return false;current={id,launch,opener};if(launch)pause();render();$('#skill-help-title').tabIndex=-1;dialog.showModal();dialog.scrollTop=0;$('#skill-help-title').focus({preventScroll:true});return true;}
 $('#skill-help-go').addEventListener('click',()=>finish(true));$('#skill-help-cancel').addEventListener('click',()=>finish(false));dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});
 dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const a=$('#skill-help-go'),b=$('#skill-help-cancel');if(document.activeElement===$('#skill-help-title')){e.preventDefault();(e.shiftKey?b:a).focus();return;}if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}});
 return {render,open,beforeActivate(){const id=getWeapon();if(preferences.value.learned.includes(id))return true;open(id,{launch:true});return false;}};
}
