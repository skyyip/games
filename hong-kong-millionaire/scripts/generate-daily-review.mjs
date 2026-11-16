import {readFile,writeFile} from 'node:fs/promises';
import {DAILY_DESIGN_QUESTIONS} from '../src/daily-design-questions.js';
import {QUESTIONS} from '../src/questions.js';
const draft=JSON.parse(await readFile(new URL('../docs/source-60-topics.json',import.meta.url),'utf8'));
if(draft.sourceEntries!==60||draft.topics.length!==60||DAILY_DESIGN_QUESTIONS.length!==60)throw Error('Expected all 60 supplied topics');
let output=`# 香港日常細節：60題整合對照\n\n附件60題全部以d01–d60整合，現有完整題庫共${QUESTIONS.length}題。\n\n題材保留，題幹按可確認的資料修訂；每題列出修訂原因與來源。法律題限定適用情境及查核時點，未有可靠佐證的起源、統一尺寸、健康功效或絕對安全承諾改為用途辨識。插畫是原創教學示意，不是照片、官方工程圖、證件或鈔票摹本。\n\n`;
for(const q of DAILY_DESIGN_QUESTIONS){
 const original=draft.topics[q.sourceNumber-1];
 if(original.id!==q.id||!QUESTIONS.includes(q))throw Error('Unmapped supplied topic: '+q.id);
 output+=`## ${q.sourceNumber}. ${original.topic}（${q.id}）\n\n難度：${['','街坊熱身','地膽進階','壓軸挑戰'][q.tier]}｜分類：${q.category}\n\n${q.question}\n\n${q.options.map((option,i)=>`- ${'ABCD'[i]}）${option}`).join('\n')}\n\n**答案：${'ABCD'[q.answer]}）${q.options[q.answer]}**\n\n解說：${q.explanation}\n\n整合處理：${q.review}\n\n延伸閱讀：[${q.source.label}](${q.source.url})\n\n`;
}
output=output.trimEnd()+'\n';
const file=new URL('../QUESTION-BANK-60.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==output)throw Error('60-topic review is out of date');console.log('All 60 supplied topics match the integrated question records.');}
else{await writeFile(file,output);console.log('Generated the complete 60-topic integration review.');}
