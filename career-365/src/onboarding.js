import {MONTHLY_CHOICES} from './monthly-play.js';
// Read-only guidance: navigation never spends an arrangement or makes a choice.
export const STARTER_STEPS=[['選好方向','挑一份職業，或先繼續進修。'],['安排這個月','每月兩次安排；遇到故事先作選擇。'],['查看月結','安排用完後，結算並進入下一個月。']];
export function starterModel(game){
 const s=game.s;
 if(s.status==='retired')return {phase:2,title:'把走過的路，收成一本書',text:'65歲的人生已完成。可以回看成就及漫畫，或匯出這段人生留作紀念。',target:'book',label:'前往人生繪本'};
 if(s.pending?.id==='vocational-task')return {phase:1,title:'先查看線索，再作出處理',text:'看現場線索，免費請教師傅或讀AI輔助教材，再完成觀念練習；答錯可訂正。最後確認做法才花一次安排，之後看回饋與補強方向。',target:'story',label:'前往職業任務'};
 if(s.pending)return {phase:1,title:'先完成眼前的故事',text:'讀一讀背景與每個選項的影響，再選一個回應。故事完成後，才能繼續其他安排或月結；PQ整理思路是可選的。',target:'story',label:'前往故事選項'};
 if(['setup','graduate'].includes(s.status))return {phase:0,title:s.status==='setup'?'第一步，選一個想體驗的方向':'畢業了，下一步由你選',text:'想體驗工作，就先挑職業、選學習路線，再確認入行。首次入行免費；也可以先看看一年制進修的安排。',target:'career',label:'挑一份職業',alternative:{target:'enroll',label:'了解繼續進修'},note:s.cash<6000?'一年制進修需入學費$6,000，目前可先免費入行，存夠學費再讀。':'一年制進修需入學費$6,000、每月學費$1,800，至少12個月及12次課堂。'};
 if(s.ap===0)return {phase:2,title:'本月安排完成了，去看月結吧',text:'按「查看月結」會結算本月生活費、收入與持續習慣，再進入下個月。安排已用完，正常前進不扣每日跳月次數。',target:'month',label:'前往查看月結'};
 if(s.ap<MONTHLY_CHOICES)return {phase:1,title:'還有一次安排，留給你自由選',text:'可以進修、休息、社交或做其他活動。先看看本月可做的事；更多選擇放在「其他人生選擇」。',target:'actions',label:'看看本月可做的事'};
 if(s.stats.energy<(s.status==='student'?14:18)||s.risks.delay||s.risks.captivity)return {phase:1,title:'先照顧目前的狀態',text:'精力不足或正在復原時，可以先休息；若需要醫療或求助，可從「其他人生選擇」查看。',target:'rest',label:'前往休息安排'};
 if(s.status==='student')return {phase:1,title:'這個月，先完成一堂課',text:'「完成進修課堂」會花14精力及一次安排，累積課堂進度。再自由安排一次，最後查看月結；修業需同時達到年期與課堂要求。',target:'study',label:'前往課堂安排'};
 if(['travel','sabbatical','early-retired'].includes(s.status))return {phase:1,title:'這段時間，留給自己的生活',text:'可以先探索、休息或認識新朋友。每月仍有兩次安排，生活費照常結算，所有路線都在65歲回顧。',target:'actions',label:'看看本月可做的事'};
 return {phase:1,title:'先體驗一次工作，再自由安排',text:'先接一個職業任務，查看線索、請教及練習觀念；確認處理才花一次安排與18精力，選項成本另列。收到回饋後可補練或休息。',target:'work',label:'前往職業任務'};
}
