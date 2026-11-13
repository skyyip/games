import {WORRIES} from './catalog.js';
const QUIPS={
 work:[['真係最後改一次…掛？','One last revision… probably?'],['份餅畫到自己都肚餓！','All those promises made me hungry!'],['收工申請，我批！','Clocking off? Approved!'],['我宣布：今日唔准加班！','No more overtime today!']],
 stocks:[['我冇跌，只係向下升！','Not falling. Rising downwards!'],['連個圖表都想放假！','Even the chart needs a day off!'],['止蝕？我先止嘴硬！','First stop: my excuses!'],['本金未返，笑聲先返！','My laugh made a comeback first!']],
 teammates:[['我扮瞓，唔好叫我！','I am only pretending to sleep!'],['個鑊太重，甩唔郁！','This blame is too heavy to pass!'],['今次我自己執返！','I will clean up my own mess!'],['合作收工，唔好合作甩鑊！','Teamwork, not blamework!']],
 commute:[['下一班？又下一班！','Next service? Next, next service!'],['塞車塞到拖鞋都打呵欠！','My slippers are yawning in traffic!'],['尾班車都叫我快啲！','Even the last bus says hurry!'],['衰運落車，唔該借借！','Bad luck, your stop is here!']],
 love:[['個心塞咗車！','My heart is stuck in traffic!'],['已讀唔回？我回收自己！','No reply? Taking my time back!'],['心跳有聲，手機靜音！','Heart on. Notifications off!'],['先對自己好啲啦！','Be a little kinder to yourself!']],
 'sleep-deprived':[['瞓覺都要排隊？','A queue for sleep too?'],['個枕頭投訴我太夜返！','My pillow says I am late!'],['今晚同個鬧鐘講和！','Making peace with the alarm!'],['批准早瞓，唔使開會！','Early bedtime approved!']],
 sleep:[['客人永遠啱？我個鬧鐘都唔認同！','The customer is always right? My alarm disagrees!'],['投訴信長過餐牌！','That complaint is longer than the menu!'],['先飲啖水，唔好鬧住！','A sip of water before the next complaint!'],['今日服務：幫你收好啖氣！','Today’s service: a little room to breathe!']],
 study:[['份卷話我哋唔熟！','The exam says we have never met!'],['溫書溫到支筆都識背！','Even my pen knows this by heart!'],['錯題自己排隊返嚟！','The mistakes are queuing for a rematch!'],['學到一樣，都算進步！','One thing learned is still progress!']],
 money:[['個銀包話想去旅行！','My wallet wants a holiday!'],['收據長過我隻手！','This receipt is longer than my arm!'],['慳住笑聲先，唔收息！','Saving laughs. No interest charged!'],['今日先賺返一啖氣！','Today’s profit: a little breathing room!']],
 relationships:[['個群組又開會？','Another group-chat meeting?'],['個鑊有腳，自己行返去！','The blame pot is walking itself home!'],['界線畫好，唔使硬撐！','A boundary drawn. No need to carry it all!'],['有話慢慢講，唔使鬥大聲！','Take your time. No shouting contest needed!']],
 emotions:[['心入面個通知欄又滿！','My inner notification tray is full!'],['內耗小人，請你靜音！','Inner critic, please mute yourself!'],['今日容許自己慢半拍！','Permission to slow down today!'],['休息唔需要交報告！','Rest needs no progress report!']],
 shopping:[['個購物車又識走路！','My shopping cart has wandered off!'],['售罄兩隻字仲快過我！','Sold out got there before I did!'],['抽唔中，都抽返啖氣先！','No lucky draw? Draw a breath first!'],['心頭好未到，笑聲到先！','The item is late. The laugh arrived first!']],
 daily:[['小意外都約埋一齊嚟？','Did all these little mishaps book together?'],['連條充電線都打晒結！','Even the charging cable tied itself up!'],['今日唔順，聽日再傾！','A rough day? Tomorrow gets another try!'],['小事拍散，慢慢行返好！','Little hassles whacked. One step at a time!']],
 health:[['個身體話想放慢啲！','My body would like a slower day!'],['唔使同個鬧鐘鬥快！','No need to race the alarm!'],['先坐低，飲啖水先！','Sit down. Take a sip of water!'],['照顧自己，都值得掌聲！','Taking care of yourself deserves applause!']]

};
const FALLBACK=[['我只係路過㗎！','I was only passing by!'],['嘴硬都硬唔過隻拖鞋！','My excuses cannot beat that slipper!'],['認輸啦，畀你笑返先！','I surrender. You deserve a laugh!'],['衰運收工，好運埋位！','Bad luck clocks off. Good luck steps in!']];
export function reactionQuote(kind,hits=0,zh=true){const group=WORRIES.find(w=>w.id===kind)?.group,list=QUIPS[kind]??QUIPS[({travel:'commute',romance:'love'}[group]??group)]??FALLBACK;return list[Math.min(3,Math.max(0,Math.floor((Number(hits)||0)/24)))][zh?0:1];}
