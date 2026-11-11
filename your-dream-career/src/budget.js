import {progressiveTax} from './life-design.js';
// Same monthly assumptions as the focused engine; no assets or family expenses.
export function budgetForecast(g,months=12){const rows=[];let cash=g.s.cash,debt=g.s.debt;for(let i=0;i<Math.max(0,Math.min(12,months,780-g.s.month));i++){
 const gross=g.s.status==='apprentice'?g.apprenticeSalary:g.salary,mpf=gross<7100?0:Math.min(1500,gross*.05),tax=Math.round(progressiveTax((gross-mpf)*12)/12),income=gross-mpf-tax,necessary=Math.round(4000*1.02**Math.floor((g.s.elapsed+i)/12)),alreadyReceived=i===0?g.s.life.flow.regularNet:0,net=income-necessary,remainingNet=net-alreadyReceived;
 if(remainingNet>=0)cash+=remainingNet;else{const paid=Math.min(cash,-remainingNet);cash-=paid;debt+=-remainingNet-paid;}
 rows.push({month:i+1,gross,mpf,tax,income,necessary,alreadyReceived,net,remainingNet,cash,debt,interest:0});
 }return {rows,first:rows[0]??{income:0,necessary:0,net:0},cash:Math.round(cash*100)/100,debt:Math.round(debt*100)/100,assumption:'按目前職位及基本開支預估，不含主動選擇的工單成本、轉職、加薪或升職。'};}
