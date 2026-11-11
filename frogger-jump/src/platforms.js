// One shared surface model keeps the drawing, rider and landing test in agreement.
export const VARIANT_CHANCE=.12;
export const VARIANTS=Object.freeze(['lotus','turtle','mushroom','duck','ice','spinner','shell']);
export const PLATFORM_COPY=Object.freeze({
 lotus:['開合荷花葉：花心落地合計 +3 青蛙幣','Blooming lotus: centre landing total +3 Frog Coins'],
 turtle:['海龜慢慢游：已自動預瞄落腳處','Drifting turtle: landing is automatically aimed ahead'],
 mushroom:['蘑菇中心落地：下一跳有軟綿保護','Mushroom centre: a softer landing on your next hop'],
 duck:['小鴨會送你一程：滑穩後再蓄力','Duck gives you a lift: charge once the short slide settles'],
 ice:['裂紋冰塊：落地後 3.5 秒內跳走','Cracking ice: leave within 3.5 seconds of landing'],
 spinner:['旋轉葉盤：闊葉轉過來時較易落地','Turning leaf: a wider lobe makes landing easier'],
 shell:['害羞貝殼：正中心落地合計 +5 青蛙幣','Shy shell: centre landing total +5 Frog Coins']
});
export const dangerous=p=>!!(p.sinking||p.thorns||p.angler);
export function surface(p,time){
 let {x,y,r}=p;const phase=time/1000+(p.id||0)*1.7;
 if(p.kind==='turtle')x+=Math.sin(phase*.9)*12;
 if(p.kind==='lotus')r*=.88+.12*Math.sin(phase*1.1);
 if(p.kind==='spinner')r*=.88+.12*Math.cos(phase*.8);
 if(p.slideAt!==undefined){const t=Math.max(0,Math.min(1,(time-p.slideAt)/440)),ease=t*t*(3-2*t);x+=(p.slideX||0)*ease;y+=18*ease;}
 return {...p,x,y,r,phase};
}
