import {readFile,writeFile} from 'node:fs/promises';
import {CITY_LIFE_EXTRA_QUESTIONS} from '../src/city-life-extra-questions.js';
import {CULTURE_LIFE_EXTRA_QUESTIONS} from '../src/culture-life-extra-questions.js';
import {DISTRICT_NATURE_EXTRA_QUESTIONS} from '../src/district-nature-extra-questions.js';
import {QUESTIONS} from '../src/questions.js';
const bank=[...CITY_LIFE_EXTRA_QUESTIONS,...CULTURE_LIFE_EXTRA_QUESTIONS,...DISTRICT_NATURE_EXTRA_QUESTIONS];
let output=`# 香港街坊生活新章：120題（p01–p40、q01–q40、r01–r40）\n\n主題庫共${QUESTIONS.length}題；本批三個難度各40題，語意正解位置A／B／C／D各30題。原有651題內容、ID及次序保留。新題涵蓋城市設施、交通工程、香港文化、藝文體育、地區文物與自然生態，採文字題；不以通用插畫作實景證據。每題附四選一、解說、錦囊提示及來源，畫面選項仍會打亂。\n\n題幹限定事件、作品或設施範圍；不依賴即時票價、班次及營業時間。登入、每題30秒、每日15題、獎金與24小時非即時對戰規則保留。擴充後必須先發布同版完整Firestore規則，再上傳網站；無需清空玩家資產。\n\n`;
for(const q of bank)output+=`## ${q.id} ${q.category}\n\n難度：${['','街坊熱身','地膽進階','壓軸挑戰'][q.tier]}\n\n${q.question}\n\n${q.options.map((o,i)=>`- ${'ABCD'[i]}）${o}`).join('\n')}\n\n**答案：${'ABCD'[q.answer]}）${q.options[q.answer]}**\n\n解說：${q.explanation}\n\n提示：${q.hint}\n\n核對範圍：${q.review}\n\n來源：[${q.source.label}](${q.source.url})\n\n`;
output=output.trimEnd()+'\n';
const target=new URL('../QUESTION-BANK-LOCAL-EXPANSION-120.md',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==output)throw Error('Run npm run review:expansion');console.log('Local expansion 120-question review matches data.');}else{await writeFile(target,output);console.log('Generated local expansion 120-question review.');}
