// One shared surface model keeps the drawing, rider and landing test in agreement.
export const VARIANT_CHANCE=.12;
export const VARIANTS=Object.freeze(['lotus','turtle','mushroom','duck','ice','spinner','shell','hermit','firefly','beaver']);
export const PLATFORM_COPY=Object.freeze({
 lotus:['開合荷花葉：花心落地合計 +3 青蛙幣','Blooming lotus: centre landing total +3 Frog Coins'],
 turtle:['海龜慢慢游：已自動預瞄落腳處','Drifting turtle: landing is automatically aimed ahead'],
 mushroom:['蘑菇中心落地：下一跳有軟綿保護','Mushroom centre: a softer landing on your next hop'],
 duck:['小鴨會送你一程：滑穩後再蓄力','Duck gives you a lift: charge once the short slide settles'],
 ice:['裂紋冰塊：落地後 3.5 秒內跳走','Cracking ice: leave within 3.5 seconds of landing'],
 spinner:['旋轉葉盤：闊葉轉過來時較易落地','Turning leaf: a wider lobe makes landing easier'],
 shell:['害羞貝殼：正中心落地合計 +5 青蛙幣','Shy shell: centre landing total +5 Frog Coins'],
 hermit:['移居寄居蟹：左右慢慢搬家，落點會自動預瞄','Moving hermit crab: a gentle sidestep, with the landing aimed ahead'],
 firefly:['螢光睡蓮：亮起時正中心落地額外 +1 青蛙幣','Firefly lily: +1 Frog Coin for a centre landing while glowing'],
 beaver:['河狸浮橋：正中心落地，加固下一個落點','Beaver bridge: a centre landing anchors the next pad']
});
export const dangerous=p=>!!(p.sinking||p.thorns||p.angler);
export function surface(p,time){
 let {x,y,r}=p;const phase=(p.anchoredAt??time)/1000+(p.id||0)*1.7;
 if(p.kind==='turtle')x+=Math.sin(phase*.9)*12;
 if(p.kind==='lotus')r*=.88+.12*Math.sin(phase*1.1);
 if(p.kind==='spinner')r*=.88+.12*Math.cos(phase*.8);
 if(p.kind==='hermit'){x+=Math.sin(phase*.65)*14;y+=Math.sin(phase*.4)*4;}
 if(p.slideAt!==undefined){const t=Math.max(0,Math.min(1,(time-p.slideAt)/440)),ease=t*t*(3-2*t);x+=(p.slideX||0)*ease;y+=18*ease;}
 return {...p,x,y,r,phase,glowing:p.kind==='firefly'&&Math.sin(time/1000*1.4+(p.id||0)*1.7)>.25};
}
