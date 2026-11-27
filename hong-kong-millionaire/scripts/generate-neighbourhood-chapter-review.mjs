import {readFile,writeFile} from 'node:fs/promises';
import {NEIGHBOURHOOD_CHAPTER_QUESTIONS as bank} from '../src/neighbourhood-chapter-questions.js';
import {QUESTIONS} from '../src/questions.js';
let output=`# 香港街坊新篇：120題（aa01–aa40、bb01–bb40、cc01–cc40）\n\n題庫共${QUESTIONS.length}題。本批三個難度各40題，語意正解位置A／B／C／D各30題；原有771題ID、內容及順序保留。題材涵蓋本地生活、濕地生態、港漫電影、香港製造及歷史建築。新題全為文字題，不把通用插畫當作實景證據。\n\n2026-11-28依各題列明來源核對；年份、原用途、構件及影片版本均在題幹限定。蓮花宮資料對前殿形狀有不同表述，本批避免以該形狀出題；《莊子試妻》的年份存在不同研究，本題只問角色演出，不判定年份或首部地位。重複檢查發現大廟灣紀年朝代與原題相同，已改為青洲舊燈塔開口的實際用途。\n\n每題30秒、每日15題、計分及24小時非即時對戰保留。採用既有單一題庫；上線時選沒有未完成題局／房間的時段，先發布同版完整Firestore Rules，再完整上傳網站，不清空玩家資產。\n\n`;
for(const q of bank)output+=`## ${q.id} ${q.category}\n\n難度：${['','街坊熱身','地膽進階','壓軸挑戰'][q.tier]}\n\n${q.question}\n\n${q.options.map((o,i)=>`- ${'ABCD'[i]}）${o}`).join('\n')}\n\n**答案：${'ABCD'[q.answer]}）${q.options[q.answer]}**\n\n解說：${q.explanation}\n\n提示：${q.hint}\n\n核對範圍：${q.review}\n\n來源：[${q.source.label}](${q.source.url})\n\n`;
output=output.trimEnd()+'\n';const target=new URL('../QUESTION-BANK-NEIGHBOURHOOD-CHAPTER-120.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==output)throw Error('Run npm run review:chapter');console.log('Neighbourhood chapter120 review matches data.');}else{await writeFile(target,output);console.log('Generated neighbourhood chapter120 review.');}
