import {readFile,writeFile} from 'node:fs/promises';
import {COMIC_QUESTIONS} from '../src/comic-questions.js';
const source=JSON.parse(await readFile(new URL('../docs/source-67-topics.json',import.meta.url),'utf8'));
if(source.topics.length!==67||COMIC_QUESTIONS.length!==67)throw Error('Expected all 67 distinct supplied topics');
let output='# 香港漫畫篇：67題完整整合對照\n\n原稿82筆，移除15筆重複，保留67個不同主題。以下均已加入實際題庫（c01–c67），連同原有104題共171題。\n\n題圖為原創漫畫或教學示意；來源連結供延伸閱讀。本次環境無法完成所有外部頁面的即時查核，因此不宣稱每條連結已通過即時驗證。對未能可靠確立的絕對說法，已採限定、改問用途或辨識限制的方式修訂。\n\n';
for(const q of COMIC_QUESTIONS){
 output+=`## ${q.sourceNumber}. ${source.topics[q.sourceNumber-1]}（${q.id}）\n\n難度：${['','街坊熱身','地膽進階','壓軸挑戰'][q.tier]}｜分類：${q.category}\n\n${q.question}\n\n${q.options.map((option,i)=>`- ${'ABCD'[i]}）${option}`).join('\n')}\n\n**答案：${'ABCD'[q.answer]}）${q.options[q.answer]}**\n\n解說：${q.explanation}\n\n整合處理：${q.review}\n\n延伸閱讀：[${q.source.label}](${q.source.url})\n\n`;
}
output=output.trimEnd()+'\n';
const file=new URL('../QUESTION-BANK-67.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==output)throw Error('67-topic review is out of date');console.log('67-topic review matches the integrated question records.');}
else{await writeFile(file,output);console.log('Generated the complete 67-topic integration review.');}
