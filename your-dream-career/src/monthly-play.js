import {JOBS} from './content.js';
export const MONTHLY_CHOICES=2;
export const INVESTMENT_PRESETS={
 cash:{name:'現金為主',weights:{bank:20},description:'80%現金、20%銀行定期。保留生活費，模擬回報較低。'},
 balanced:{name:'均衡配置',weights:{bank:30,bonds:20,etf:30},description:'20%現金、30%定期、20%國債、30%ETF。國債有交易成本，ETF仍可下跌。'},
 volatile:{name:'高波動配置',weights:{bank:10,etf:20,stock:20,crypto:30},description:'20%現金、10%定期、20%ETF、20%股票、30%加密貨幣。可能大幅虧損。'}
};
export function featuredJobs(){const names=['星級主廚','水電工','AI代理工程師','YouTuber','護理師','殯儀統籌師','試吃員','神秘顧客'];return names.map(name=>JOBS.find(j=>j.name===name)).filter(Boolean);}
export function claimMonthlyEvent(s){if(s.life.extraEventMonth===s.elapsed)return false;s.life.extraEventMonth=s.elapsed;return true;}
export function monthSnapshot(s){return {pq:s.stats.pq,health:s.stats.health,stress:s.stats.stress,skills:{...s.skills}};}
export function choiceSummary(choice){
 const labels={health:'健康',stress:'壓力',energy:'精力',contacts:'人脈',reputation:'聲望',iq:'理解分析',eq:'溝通能力',pq:'正向心智',jq:'職場判斷',mastery:'出師進度',affection:'感情',dependence:'依賴風險',legal:'法律風險',delay:'復原時間',captivity:'被困時間',scamPercent:'受騙風險'};
 const effects=Object.entries(choice.effects??{}).filter(([,v])=>v!==0).map(([key,value])=>key==='cash'?`${value<0?'支出':'收入'} $${Math.abs(value).toLocaleString('zh-HK')}`:labels[key]?`${labels[key]}${value>0?'↑':'↓'}`:null).filter(Boolean);
 return effects.slice(0,3).join('・')||'按目前情況作出選擇，結果會收進職涯紀錄';
}
