import {workProfile} from './work-experience.js';
import {careerArc,CAREER_ARCS} from './career-arcs.js';
import {questionsFor,questionById} from './professional-knowledge.js';

export const TRAINING_STAGES=['跟著觀察','協助準備','受督導實作','檢討與補練','整合評核'];
const course=(skills,lessons)=>({skills,lessons});
export const VOCATIONAL_COURSES={
 '星級主廚':course(['食安與過敏原','備料與標準配方','出餐與協作','成本與品質驗收'],[
  '跟師傅核對訂單、過敏原與食材標示，分清不能承諾的要求。','協助整理替代食材、備料份量及分區工作表。','在督導下完成一批出餐，核對一致性與交接。','根據損耗、等候和客人回饋修訂流程。','說明如何從接單、驗收、出餐到結算保留食安及紀錄。']),
 '水電工':course(['風險與授權辨識','故障判斷與紀錄','報價與工期溝通','驗收及保固交接'],[
  '跟何師傅辨認委託範圍、現場限制與需要合資格人員處理的部分。','協助整理現勘紀錄、材料清單及分項報價。','在授權與督導範圍內比對線索，不能把猜測當成故障原因。','回看返工或異常紀錄，分清原工程與新增問題。','交代判斷依據、變更同意、驗收紀錄與合資格轉介。']),
 'AI代理工程師':course(['需求及工具權限','資料與輸出核實','失敗測試與回退','成本與交付紀錄'],[
  '觀察營運任務，分清可讀資料、可用工具及必須人工確認的步驟。','協助整理代表性測試、失敗例子與資料使用權。','在沙盒中驗證工作流程，遇到越權要求停止並交由負責人覆核。','檢討錯誤、重試成本與人工接手，補上可重現測試。','用完成率、失敗處理、權限及成本證明試點可交付。']),
 'YouTuber':course(['選題與資料查證','拍攝剪輯及授權','觀眾與合作溝通','成效及製作成本'],[
  '跟剪輯夥伴看腳本，分清事實、意見、觀眾需要與安全界線。','協助整理拍攝同意、素材授權、收音及字幕清單。','完成受覆核的短片，保留必要的查證、私隱與合作揭露。','用留存、回饋及工時檢討內容，避免只追單次流量。','交付一支有依據、可發布且成本可持續的影片與更正方案。']),
 '護理師':course(['身分同意與紀錄','受督導觀察與回報','跨班交接與協作','私隱及專業界線'],[
  '在帶教下理解身分、同意、最新紀錄與職務界線。','協助準備交接清單，發現矛盾時向合適專業人員核實。','依督導安排完成情境練習，不自行診斷或超越授權。','如實檢討近失及交接缺漏，找出可以改善的流程。','向督導說明觀察依據、回報、交接與私隱安排；另須完成認可訓練及考核。']),
 '殯儀統籌師':course(['意願與委託授權','文件及流程核對','悲傷溝通與協調','透明報價及交付'],[
  '跟同事聆聽家屬，確認有效意願、委託權與文化需要。','協助整理流程版本、聯絡名單與必要／可選費用。','在負責人覆核下協調場地與團隊，保護尊嚴及私隱。','檢討流程變更與收費疑問，核對同意及服務紀錄。','完成從需求、報價、文件到儀式後交接的整合說明。']),
 '試吃員':course(['參與條件與過敏原','盲測及樣本條件','獨立感官紀錄','限制與結果表達'],[
  '先看研究規程及參與條件，未知成分不能因份量少便忽略。','協助核對盲碼、呈現次序與休息安排。','依一致條件品評並獨立記錄；出現不適或資料缺漏便停止相關部分。','檢討感官疲勞、品牌暗示及同伴影響，安排合適補測。','把個人感受、觀察事實與研究限制分開交付，不外推整體市場喜好。']),
 '神秘顧客':course(['委託指標與界線','合法觀察及私隱','時序與客觀證據','報告及利益衝突'],[
  '閱讀委託情境、指標與預算，分清不能誘導或越權的要求。','協助建立觀察表、時序與憑據清單，先申報利益衝突。','以一般顧客方式觀察，在授權範圍留下可核實紀錄。','對照分歧及缺漏，分清事實、感受與未能證明的推測。','交付有證據及限制的報告，不能因好惡改分或補造紀錄。']),
};
export const PRESSURES=[
 {id:'quality',name:'依據與品質',detail:'本次交付需要較完整的核對依據，仍可協商縮小範圍。',fit:'check'},
 {id:'people',name:'協作與信任',detail:'各方對需求或紀錄有不同理解，需要確認責任與共同安排。',fit:'talk'},
 {id:'deadline',name:'有限時間與產能',detail:'原定範圍超出這次可用時間，可以清楚縮小承諾並安排後續。',fit:'rush'},
];
const CORE_QUESTIONS={
 '星級主廚':['food.4','food.2','food.5','food.1'],
 '水電工':['trades.6','trades.3','trades.4','trades.5'],
 'AI代理工程師':['ai.5','ai.4','ai.3','era.ai.1'],
 'YouTuber':['media.3','media.5','media.4','media.6'],
 '護理師':['health.3','health.1','health.5','health.6'],
 '殯儀統籌師':['funeral.3','funeral.5','funeral.1','funeral.2'],
 '試吃員':['experience.6','experience.1','experience.2','experience.3'],
 '神秘顧客':['experience.6','experience.5','experience.4','experience.3'],
};
const profiles=new Map();
export function vocationalCourse(job){
 if(!job)return null;if(profiles.has(job.id))return profiles.get(job.id);
 const work=workProfile(job),authored=VOCATIONAL_COURSES[job.name],arc=careerArc(job),own=questionsFor(job).filter(q=>q.jobs?.includes(job.name)),questions=[...own,...questionsFor(job).filter(q=>!own.includes(q))];
 const value={...authored,skills:authored?.skills??[...work.requirements,'交付溝通與檢討'].slice(0,4),lessons:authored?.lessons??['觀察工作流程，辨識授權、安全及資料需求。','協助整理材料、文件、時程與驗收條件。','在合適督導下處理工作問題，保留依據及交接。','找出失誤、影響與補強方法，修訂交付安排。','以完整實作說明判斷、溝通及職務界線。'],mentor:arc?.npc??'帶教同事',project:arc?.project??'本職業的實作委託',cases:work.cases,questions:CORE_QUESTIONS[job.name]?.map(questionById)??questions,depth:authored?'完整學徒與工作章節':CAREER_ARCS[job.name]?'領域課程＋專屬工作連載':'領域課程與共通情境'};
 profiles.set(job.id,value);return value;
}
