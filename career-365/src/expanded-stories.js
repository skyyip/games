import {JOBS} from './content.js';
import {workProfile} from './work-experience.js';
import {careerArc,CAREER_ARCS} from './career-arcs.js';
import {industryProfile} from './industry-scenarios.js';
import {STORY_DOMAINS,sectorStation} from './story-domains.js';
const profiles=new Map(),knownIds=new Set(JOBS.map(j=>j.id));
export function expandedStoryProfile(job){
 if(!job||!knownIds.has(job.id))return null;if(profiles.has(job.id))return profiles.get(job.id);
 const d=STORY_DOMAINS[job.category],work=workProfile(job),arc=careerArc(job),industry=industryProfile(job);if(!d||!work||!arc)return null;
 const material=industry?industry.scenarios.map(s=>({title:s.title,text:s.evidence,plans:s.plans})):work.cases.slice(0,3).map(row=>({title:row[0],text:row[1]+' '+row[2],plans:[row[3],row[4],'只交付已核實且獲授權的部分，列明限制並交由合適人員跟進']}));
 const mentor=d.mentor,partner=arc.npc||d.partner,client=d.client,chapters=material.slice(0,3).map((m,i)=>({title:['接手：','跟進：','分歧：'][i]+m.title,text:[`${mentor}帶你接手${job.name}的「${arc.project}」。`,`${partner}帶著上一段的交接紀錄一起確認變化。`,`${client}希望知道下一步，你需要說清楚哪些能做、哪些尚待確認。`][i]+m.text,plans:m.plans}));
 chapters.push({title:'回訪：'+arc.project,text:`${client}回來看這次的結果。${partner}帶著你留下的紀錄，${mentor}讓你先說明「${work.requirements[0]}」與尚未完成的部分，再一起安排後續。`,plans:[`依${work.requirements[0]}覆核實際結果與未解項目`,`與${partner}一起聽取回饋，協商後續責任與日期`,'交付已有依據的成果，明列其餘限制並安排合適跟進']});
 const profile={mentor,partner,client,specs:d.specs,chapters,kind:industry||CAREER_ARCS[job.name]?'職業個案＋行業連載':'行業課程連載',humour:[d.quip,`${partner}把便條整理好：「這次寫清楚，下班後的自己就不用猜了。」`,`${mentor}：「先把知道與不知道的分開，再答應下一步。」`,`${mentor}把紀錄交給你：「今天換你帶著大家覆盤。」`]};profiles.set(job.id,profile);return profile;
}
export function expandedStation(job,index){const station=sectorStation(job,index);if(!station)return null;return {...station,context:workProfile(job).requirements.join('、')};}
