import {readFile,writeFile} from 'node:fs/promises';
import {WINTER_NEIGHBOURHOOD_QUESTIONS as bank} from '../src/winter-neighbourhood-questions.js';
import {QUESTIONS} from '../src/questions.js';
let output=`# 香港街坊冬日新題：120題（dd01–dd40、ee01–ee40、ff01–ff40）\n\n題庫共${QUESTIONS.length}題。本批三個難度各40題，語意正解位置A／B／C／D各30題；原有891題ID、內容及順序保留。題材涵蓋粵語生活、濕地生態、香港電影、體育、授時科學、地質、表演藝術、博物館及香港文學。新題全為文字題，不把通用插畫當作實景證據。\n\n2026-11-28依各題列明來源核對；年份、原用途、構件及影片版本均在題幹限定。比對原有891題後，把重複的科學館開幕年份及能量穿梭機高度，改為貝茜號與航空公司的關係及圓球直徑。龍落水岩性在官方資料有不同表述，故只問其較抗侵蝕的地貌特性。文學題不引用作品內文，電影題不引用對白。\n\n每題30秒、每日15題、計分及24小時非即時對戰保留。採用既有單一題庫；上線時選沒有未完成題局／房間的時段，先發布同版完整Firestore Rules，再完整上傳網站，不清空玩家資產。\n\n`;
for(const q of bank)output+=`## ${q.id} ${q.category}\n\n難度：${['','街坊熱身','地膽進階','壓軸挑戰'][q.tier]}\n\n${q.question}\n\n${q.options.map((o,i)=>`- ${'ABCD'[i]}）${o}`).join('\n')}\n\n**答案：${'ABCD'[q.answer]}）${q.options[q.answer]}**\n\n解說：${q.explanation}\n\n提示：${q.hint}\n\n核對範圍：${q.review}\n\n來源：[${q.source.label}](${q.source.url})\n\n`;
output=output.trimEnd()+'\n';const target=new URL('../QUESTION-BANK-WINTER-NEIGHBOURHOOD-120.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==output)throw Error('Run npm run review:winter');console.log('Winter neighbourhood120 review matches data.');}else{await writeFile(target,output);console.log('Generated winter neighbourhood120 review.');}
