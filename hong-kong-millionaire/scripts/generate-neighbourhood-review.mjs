import {readFile,writeFile} from 'node:fs/promises';
import {NEIGHBOURHOOD_QUESTIONS} from '../src/neighbourhood-questions.js';
import {QUESTIONS} from '../src/questions.js';
let output=`# 香港街坊地膽篇：60題（n01–n60）\n\n主題庫共${QUESTIONS.length}題。此批熱身、進階、壓軸各20題；語意正解位置A／B／C／D各15題，畫面選項仍會打亂。原有351題的內容及ID保留，登入要求、30秒倒數、獎金與24小時街坊對戰不變。\n\n涵蓋飲食工藝、交通史、古蹟活化、非遺、自然地理、用語及本地機構。題目依列明來源核對，區分建成／啟用、不同地區傳統及不同地質時期；不把信仰視為效果保證，不依賴即時票價或營業時間。每題附四個選項、解說及錦囊提示。\n\n15題沿用合適的環境主題插畫、45題採文字呈現；插畫不是地點實景、工序圖或官方文件。新網站與完整Firestore抽題及答案表須同步發布，沒有重設玩家資產。\n\n`;
for(const q of NEIGHBOURHOOD_QUESTIONS)output+=`## ${q.id} ${q.category}\n\n難度：${['','街坊熱身','地膽進階','壓軸挑戰'][q.tier]}\n\n${q.question}\n\n${q.options.map((o,i)=>`- ${'ABCD'[i]}）${o}`).join('\n')}\n\n**答案：${'ABCD'[q.answer]}）${q.options[q.answer]}**\n\n解說：${q.explanation}\n\n提示：${q.hint}\n\n呈現：${q.textOnly?'文字題':'主題插畫輔助；不考認圖'}\n\n核對範圍：${q.review}\n\n來源：[${q.source.label}](${q.source.url})\n\n`;
output=output.trimEnd()+'\n';const file=new URL('../QUESTION-BANK-NEIGHBOURHOOD-60.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==output)throw Error('Neighbourhood review is out of date');console.log('60 neighbourhood questions match their answers and source review.');}else{await writeFile(file,output);console.log('Generated the 60-question neighbourhood review.');}
