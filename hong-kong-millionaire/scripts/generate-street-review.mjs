import {readFile,writeFile} from 'node:fs/promises';
import {STREET_OBSERVATION_QUESTIONS as bank} from '../src/street-observation-questions.js';
const draft=JSON.parse(await readFile(new URL('../docs/source-street-60-topics.json',import.meta.url)));
let output='# 街角觀察：兩份附件60題整合對照\n\n第一份45題、第二份15題，逐題對應s01–s60。保留每個題材，校正法例、安全、配方、物理及歷史敘述；沒有可靠根據的唯一設計動機不作既定史實。\n\n圖片為原創漫畫教學示意，並非現場照片或官方圖則。模式只在可辨識的線索有實際作用時開放：局部使用逐題審定的來源裁切框；鏡像題明示要還原字樣或方向；模糊題從物件輪廓漸進辨識。沒有視覺線索設計的舊題不再隨機套用這三種效果。答案以固定語意索引驗證，畫面的A–D另行隨機排序。\n\n';
for(const [i,q]of bank.entries()){
 const t=draft.topics[i];if(t.id!==q.id)throw Error('Unmapped topic');
 output+=`## ${t.source}.${t.sourceNumber} ${t.topic}（${q.id}）\n\n完整問法：${q.textQuestion??q.question}\n\n遊戲問法：${q.question}\n\n${q.options.map((v,i)=>'- '+ 'ABCD'[i]+'）'+v).join('\n')}\n\n答案：${'ABCD'[q.answer]}）${q.options[q.answer]}\n\n解說：${q.explanation}\n\n修訂：${q.review}\n\n模式：${q.modes.join('／')}\n\n`;
 if(q.observation){output+=`認圖線索：${q.observation.clue}\n\n`;if(q.modes.includes('partial'))output+=`局部框（800×500來源像素）：${JSON.stringify(q.observation.crop)}\n\n`;if(q.observation.overview)output+=`手機字樣構圖框：${JSON.stringify(q.observation.overview)}\n\n`;if(q.modes.includes('mirrored'))output+=`鏡像問法：${q.observation.mirroredPrompt}\n\n`;}
 output+=`延伸參考：[${q.source.label}](${q.source.url})\n\n`;
}
output=output.trimEnd()+'\n';const file=new URL('../QUESTION-BANK-STREET-60.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==output)throw Error('Street review is out of date');console.log('All 45 + 15 supplied topics match their reviewed records.');}else{await writeFile(file,output);console.log('Generated 60-topic street observation review.');}
