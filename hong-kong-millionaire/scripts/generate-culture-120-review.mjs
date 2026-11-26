import {readFile,writeFile} from 'node:fs/promises';
import {CITY_CULTURE_QUESTIONS} from '../src/city-culture-questions.js';
import {LOCAL_DISCOVERY_QUESTIONS} from '../src/local-discovery-questions.js';
import {QUESTIONS} from '../src/questions.js';
const bank=[...CITY_CULTURE_QUESTIONS,...LOCAL_DISCOVERY_QUESTIONS];
let output=`# 香港文化與地膽探索：120題（k01–k60、t01–t60）\n\n主題庫共${QUESTIONS.length}題；本批熱身、進階、壓軸各40題，語意正解位置A／B／C／D各30題，畫面選項仍會打亂。原有531題內容、ID及次序保留。每題有四選一、詼諧解說、錦囊提示及來源；新增題均採文字呈現，不以通用插畫冒充實景證據。\n\n年份與事件分開核對，用語按情境理解；不依賴即時票價、航班或營業時間，也不以宗教傳說保證效果。登入、30秒、每日15題、獎金及24小時非即時對戰保留。新網站須與完整Firestore題目／答案／抽題表同步發布，不重設玩家資產。\n\n`;
for(const q of bank)output+=`## ${q.id} ${q.category}\n\n難度：${['','街坊熱身','地膽進階','壓軸挑戰'][q.tier]}\n\n${q.question}\n\n${q.options.map((o,i)=>`- ${'ABCD'[i]}）${o}`).join('\n')}\n\n**答案：${'ABCD'[q.answer]}）${q.options[q.answer]}**\n\n解說：${q.explanation}\n\n提示：${q.hint}\n\n核對範圍：${q.review}\n\n來源：[${q.source.label}](${q.source.url})\n\n`;
output=output.trimEnd()+'\n';const file=new URL('../QUESTION-BANK-CULTURE-120.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(file,'utf8')!==output)throw Error('120-question culture review is out of date');console.log('120 culture questions match their answers and source review.');}else{await writeFile(file,output);console.log('Generated the 120-question culture review.');}
