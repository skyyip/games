// Flower friends share a bounded drawing path and keep the original sprout save IDs.
export const FLOWERS=Object.freeze({
 'red-sprout':{petal:'#ed9287',edge:'#ad635c',face:'#fff0d1',count:7},
 'blue-sprout':{petal:'#8dbfe7',edge:'#638fac',face:'#edf6dd',count:6},
 'yellow-sprout':{petal:'#efd56e',edge:'#b39a4d',face:'#fff6d7',count:8},
 'black-sprout':{petal:'#656779',edge:'#434b5b',face:'#f7e4c6',count:6},
 'pink-sprout':{petal:'#efb1cb',edge:'#ba819f',face:'#fff0dd',count:7},
 'white-sprout':{petal:'#fffaf0',edge:'#b6c5b3',face:'#e9efb9',count:8},
 'purple-sprout':{petal:'#b79bd9',edge:'#826b9f',face:'#fff0d0',count:6},
 'ice-sprout':{petal:'#b4e8ed',edge:'#6ca6ba',face:'#f3fcf3',count:6,ice:true}
});
export const FLOWER_IDS=Object.freeze(Object.keys(FLOWERS));
export function paintFlowerFriend(s,x,y,scale,id,pose={}){
 const f=FLOWERS[id],c=s.ctx,ink='#4c6253',{squat=0,stretch=0,lean=0,fall=0,kick=0,tuck=0,reach=0,blink=0}=pose;
 c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.14-stretch*.06)*(1-fall*.4),scale*(1-squat*.18+stretch*.08)*(1-fall*.4));
 if(!pose.airborne&&!pose.noShadow)s.ellipse(0,2,24,5,'#31543722');
 for(const sign of [-1,1]){s.ellipse(sign*(11+kick*7),-2-tuck*7,9,5,'#8daf72',ink,1.5);s.path(p=>{p.moveTo(sign*9,-26);p.quadraticCurveTo(sign*(33+kick*3),-41-reach*9,sign*29,-16-reach*8);p.quadraticCurveTo(sign*17,-11,sign*9,-26);},'#a5cb88',ink,1.5);}
 s.ellipse(0,-19,15,19,'#b1cf8b',ink,1.7);s.ellipse(0,-17,9,12,'#e6edb7');
 for(let i=0;i<f.count;i++){c.save();c.translate(0,-48);c.rotate(i*Math.PI*2/f.count);if(f.ice){s.path(p=>{p.moveTo(0,-42);p.lineTo(11,-26);p.lineTo(4,-10);p.lineTo(-4,-10);p.lineTo(-11,-26);p.closePath();},f.petal,f.edge,1.4);s.path(p=>{p.moveTo(0,-36);p.lineTo(0,-16);},null,'#f3ffff',1.1);}else s.ellipse(0,-24,10,15,f.petal,f.edge,1.4);c.restore();}
 s.ellipse(0,-48,21,21,f.face,f.edge,1.6);
 for(const sign of [-1,1]){s.ellipse(sign*8,-50,2.8,Math.max(.8,4*(1-blink)),ink);if(blink<.6)s.ellipse(sign*8-.7,-51.6,.9,1.1,'#fff');s.ellipse(sign*14,-42,4,2.5,'#e9b1a4');}
 s.path(p=>{p.moveTo(-5,-41);p.quadraticCurveTo(0,-35,5,-41);},null,ink,1.4);
 if(id==='pink-sprout')s.path(p=>{p.moveTo(0,-25);p.bezierCurveTo(-10,-32,-9,-17,0,-15);p.bezierCurveTo(9,-17,10,-32,0,-25);},'#e6a0bd',f.edge,1);
 if(id==='black-sprout')for(const sign of [-1,1])s.ellipse(sign*5,-21,2,2,'#6e7181');
 if(id==='purple-sprout')s.ellipse(0,-23,4,3,'#b49bd5',f.edge,1);
 c.restore();
}
