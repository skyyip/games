import {readFile,writeFile} from 'node:fs/promises';
import {LOCAL_QUESTIONS} from '../src/local-questions.js';
import {QUESTIONS} from '../src/questions.js';
let output=`# 香港本地特色：60題（l01–l60）\n\n2026-11-26新增60題，主題庫共${QUESTIONS.length}題。三個難度各加20題，正確語意索引A／B／C／D各15題；遊戲畫面的選項仍隨機排列。\n\n原有291題保留。新題以文字知識作判斷，沿用合適的主題插畫；文字題不依賴圖片，插畫不是古蹟實景或官方圖則。來源以政府、博物館、營辦商、教育機構及第一方文化資料為主，俗語參考粵典。配方、俗語、信仰、交通及營運資料均限定適用範圍，不把傳說、祝福或店舖做法當成通用保證。\n\n完整題庫及新Firestore抽題／答案表必須一起發布；沿用既有單一題庫標識。\n\n`;
for(const q of LOCAL_QUESTIONS)output+=`## ${q.id} ${q.category}\n\n難度：${['','街坊熱身','地膽進階','壓軸挑戰'][q.tier]}\n\n${q.question}\n\n${q.options.map((o,i)=>`- ${'ABCD'[i]}）${o}`).join('\n')}\n\n**答案：${'ABCD'[q.answer]}）${q.options[q.answer]}**\n\n解說：${q.explanation}\n\n提示：${q.hint}\n\n呈現：${q.textOnly?'文字題':'主題插畫輔助；不考認圖'}\n\n核對範圍：${q.review}\n\n來源：[${q.source.label}](${q.source.url})\n\n`;
output=output.trimEnd()+'\n';const file=new URL('../QUESTION-BANK-LOCAL-60.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==output)throw Error('Local question review is out of date');console.log('60 local questions match their answer/source review.')}else{await writeFile(file,output);console.log('Generated the 60-question local culture review.');}
