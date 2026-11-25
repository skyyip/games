import {editedMessage} from './story-events.js';
// The thoughts below belong to these fictional comic scenes, not to real people or pets.
export const COMIC_SCENES={
  0:{"said":"冇關係，你玩得開心就好。","good":["你終於發現，時鐘唔係茶餐廳嘅裝飾。","好，先講遲到。遊戲戰績可以留返下集。"],"miss":["小食可以遲啲，先接住遲到嗰半個鐘。",null,"排位賽有原因，約會嘅時鐘亦有返工。","下次準時值得期待，今次感受都要有人聽。"],"accidents":["先用小食處理氣氛，把遲到的交代排到後面。",null,"先解釋遊戲多重要，尚未接住遲到造成的影響。","先談下次承諾，未處理這一次的感受。"],"best":"先承認遲到，成功關閉藉口發佈會。"},
  1:{"said":"冒險開始！","good":["你肯接一句勇者出發，呢條行山徑即刻有主線任務。","樹枝零蚊，隊友肯陪玩：無價。"],"miss":[null,"我喊緊冒險開始，你已經幫支樹枝開產品評測。","名字可以改，先接住我個勇者開場白得唔得？","我準備出主線，唔係準備摸高測試。"],"accidents":[null,"把冒險道具理解成等待功能評估的戶外工具。","先替樹枝安排紀念擺設用途，沒接住冒險台詞。","把角色扮演接成運動測試，兩人的劇本走了岔路。"],"best":"接住對方的想像，成功組成零成本冒險隊。"},
  2:{"said":"喵。","good":["肚皮展覽開放，觸摸申請另行審批。","很好，你明白展示單位不等於任你裝修。"],"miss":["力度輕都要先睇本喵願唔願意，唔係靠手感審批。","我只係展示肚皮，罐頭部唔使自動開單。",null,"我攤低未等於想升空，抱抱申請未批。"],"accidents":["把看似放鬆直接當成可以開始摸肚的同意。","先把姿勢解作要吃，尚未連同其他訊號觀察。",null,"把躺着解作要抱起，未確認接觸意願。"],"best":"尊重貓咪距離，手部保安意識合格。"},
  3:{"said":"汪。","good":["我唔係社交失敗，我只係未按接受邀請。","保持距離，多謝你冇幫我報名陌生人抱抱營。"],"miss":["蹲低係姿勢，唔會自動替我按接受邀請。",null,"我先想留距離，坐下證書可以遲啲考。","零食係零食，唔係社交同意書。"],"accidents":["單靠蹲低及搖尾就安排接觸，忽略繃緊與轉頭。",null,"先用坐下口令處理，尚未滿足退開的距離需要。","用零食推進靠近，未先觀察是否願意互動。"],"best":"觀察全身及距離，保留狗狗選擇權。"},
  4:{"said":"我拎得晒。","good":["人形貨車服務暫停，終於有隊友接更。","分一袋就夠，唔使幫我寫勵志人物專訪。"],"miss":["叫車都好，但我仲未講想唔想提早離場。","幫手之前問一句，就知邊袋最啱交更。",null,"雨傘有照顧到，兩隻手仲等緊你發現。"],"accidents":["未確認需要便替對方結束步行，改動原本行程。","直接接走全部物品，未讓對方選擇需要的分擔。",null,"只處理雨傘，尚未確認提袋或避雨的實際需要。"],"best":"先問再分擔，取消一場不必要的搬運馬拉松。"},
  5:{"said":"冇問題，好輕啫。","good":["嘴巴話輕，手指終於有人代言。","多謝分一袋，我個笑容可以轉返自願模式。"],"miss":["成就感可以保留，手指都想保留。","門開咗多謝，但提把仲未肯放過我。","餸可以慢慢介紹，先替手指安排中場休息。",null],"accidents":["先等完成搬運才稱讚，未回應手指受壓的眼前線索。","只開門催快完成，尚未確認需要分擔或放下。","用聊天轉移負重話題，沒有處理眼前的提袋壓力。",null],"best":"看到手指受壓，及時提供實際幫忙。"},
  6:{"said":"喵……","good":["暫停鍵按得好，遊戲唔需要打到加時。","本喵批准中場休息，雙方牙齒暫不登場。"],"miss":["玩具近咗，但本喵未有申請加時。","慢鏡都係繼續玩，我想先按暫停。","新羽毛唔一定解決我想拉開距離。",null],"accidents":["以縮短追逐距離接續遊戲，未先回應訊號變化。","只減慢玩法，未先提供停止刺激的空間。","先換玩具測試，未確認是否仍願意繼續。",null],"best":"及時暫停遊戲，保住雙方的耐性。"},
  7:{"said":"哈……哈……","good":["中場休息終於排第一，今日唔使加班追波。","飲水服務準時開門，場數統計可以稍後處理。"],"miss":[null,"出口可以等，本汪呢刻想先停低。","獎勵遲啲先食，飲水唔使完成任務先批准。","相機可以等，水碗唔好排喺攝影之後。"],"accidents":[null,"先繼續走到出口，延後了眼前的陰涼休息。","先給零食安排坐定，沒有優先提供清水與觀察。","先拍照才安排休息，次序未回應眼前狀態。"],"best":"先停下補水休息，把眼前狀態放在完成行程之前。"},
  8:{"said":"你想點呀？","good":["答案由本人提供，讀心術終於有官方版本。","同一張餐牌，可以有兩個合理嘅下一格。"],"miss":["我哋睇緊同一張圖，但開咗兩套字幕。","估唔中唔緊要，問返本人就有續集。"]}
};
const speakers={women:'她的內心小劇場',men:'他的內心小劇場',dog:'狗狗字幕組',cat:'貓主子字幕組',duo:'兩個人的字幕組'};
export function comicReveal(q,{choice=null,success=false,faction='women',run=0}={}){
  const scene=COMIC_SCENES[q.picture?.art];
  const selected=choice===null?'時間到，尚未作答':q.message?editedMessage(q,choice).join(' '):q.opts[choice];
  if(q.message&&choice!==null)return {speaker:`${q.message.speaker}的回覆`,said:q.message.replies[choice],thought:success?'只改一句，終於唔似用客服範本關心人。':'每句都似關心，合埋要再睇一次收件人需要。',selected,explanation:q.why};
  const thoughts=(success?scene?.good:scene?.miss?.[choice]?[scene.miss[choice]]:null)||(
    success?['好，呢句有聽入耳。今日可以少開一場解釋記者會。','你有先觀察再回應，字幕組終於唔使加班。']:
    ['你個答案一出，現場即刻需要一位氣氛消防員。','你講完好有自信，我聽完開始整理求生用品。']);
  return {speaker:speakers[faction],said:scene?.said||`你選了：「${selected}」`,thought:choice===null?'你仲喺腦內排練，現場已經進入廣告時間。':thoughts[(run+q.text.length)%thoughts.length],selected,explanation:q.why};
}
export function answerRecord(q,{round,choice=null,success=false,hpLost=0}={}){
  const scene=COMIC_SCENES[q.picture?.art];
  return {...(q.story?{story:{...q.story,choiceIndex:choice}}:{}),round,question:q.text,choice:choice===null?'時間到，尚未作答':q.message?editedMessage(q,choice).join(' '):q.opts[choice],timedOut:choice===null,success,hpLost,
    incident:choice===null?'腦內排練過久，錯過現場回應。':scene?.accidents?.[choice]||'答案搶先出場，現場理解仍在路上。',best:scene?.best||'先看情境再回應，成功減少一場解釋記者會。'};
}
export function buildIncidentReport(records,{faction='women',questionCount=12}={}){
  const misses=records.filter(r=>!r.success),good=records.filter(r=>r.success),timeouts=records.filter(r=>r.timedOut);
  const incident=[...misses].sort((a,b)=>b.hpLost-a.hpLost||a.round-b.round)[0]||null;
  const best=[...good].sort((a,b)=>a.round-b.round)[0]||null;
  const title=timeouts.length?'腦內排練超時王':!misses.length?(faction==='cat'?'貓界邊界感專員':'氣氛消防員'):misses.length>=good.length?'補鑊見習生':'有驚無險調解員';
  return {title,incident,best,completed:records.length,questionCount,
    summary:`本局完成 ${records.length}/${questionCount} 題 · ${good.length} 次判斷達標`,
    verdict:incident?'主要事故已記錄；請攜同這份報告，前往下一局補考。':'本局暫未錄得判斷事故，字幕組準時收工。'};
}
