// Small hand-drawn portraits share the game's cached pose/animation pipeline.
export const ISLAND_HEAD_HEIGHT=Object.freeze({kurimanju:72,rakko:78,momonga:78,shisa:80,shimajiro:76,mermaid:80,hitoha:82,futaba:82});
export function paintIslandFriend(scene,x,y,scale,kind,{squat=0,stretch=0,kick=0,tuck=0,reach=0,blink=0,lean=0,fall=0,airborne=false,noShadow=false}={}){
 const c=scene.ctx,e=(...a)=>scene.ellipse(...a),p=(...a)=>scene.path(...a),ink='#65565a';
 const kuri=kind==='kurimanju',rakko=kind==='rakko',momo=kind==='momonga',shisa=kind==='shisa',uncle=kind==='shimajiro',mermaid=kind==='mermaid',leaf=kind==='hitoha'||kind==='futaba';
 const body=leaf?'#b6bdc3':shisa?'#ffe9b5':momo?'#fffaf6':uncle?'#f6e6cf':rakko?'#fffdf5':kuri?'#fff1db':'#fff8ee';
 c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.16-stretch*.06)*(1-fall*.55),scale*(1-squat*.21+stretch*.1)*(1-fall*.55));
 if(!airborne&&!noShadow)e(0,2,uncle?29:24,5,'#31543722');
 if(momo){
  p(q=>{q.moveTo(12,-5);q.bezierCurveTo(55,10,60,-45,36,-50);q.bezierCurveTo(18,-54,15,-34,26,-26);q.bezierCurveTo(36,-14,22,-15,12,-5);q.closePath();},'#c2d4e5',ink,1.5);
  p(q=>{q.moveTo(25,-6);q.bezierCurveTo(44,-4,48,-30,36,-36);},null,'#f8fcff',8);
 }
 if(rakko){p(q=>{q.moveTo(-16,-31);q.quadraticCurveTo(-25,-20,-32,-5);q.quadraticCurveTo(-18,2,-9,-3);q.quadraticCurveTo(0,8,10,-3);q.quadraticCurveTo(22,3,31,-5);q.lineTo(17,-32);q.closePath();},'#fffdf5',ink,1.4);p(q=>{q.moveTo(-22,-20);q.lineTo(-27,-7);q.moveTo(22,-20);q.lineTo(26,-7);},null,'#dcd9d0',1.2);}
 if(mermaid){
  p(q=>{q.moveTo(-16,-18);q.quadraticCurveTo(-24,3,-7,7);q.quadraticCurveTo(2,12,8,2);q.lineTo(26,10);q.quadraticCurveTo(24,-6,12,-8);q.quadraticCurveTo(8,-20,16,-22);q.closePath();},'#e99b9d',ink,1.6);
  for(const a of [-9,0,9])p(q=>{q.moveTo(a-4,-10);q.quadraticCurveTo(a,-4,a+4,-10);},null,'#c77987',1);
 }else for(const side of [-1,1])e(side*(uncle?15:11)+side*(kick*7-tuck*4),kick*11-tuck*4,uncle?10:7,4,body,ink,1.3);
 e(0,-16,uncle?27:leaf?18:18,uncle?24:21,body,ink,1.7);
 if(momo)for(const side of [-1,1])p(q=>{q.moveTo(side*9,-29);q.quadraticCurveTo(side*(31+reach*3),-31,side*(27+kick*3),-12-reach*9);q.lineTo(side*13,0);q.closePath();},'#c5d9e8',ink,1.2);
 else for(const side of [-1,1])p(q=>{q.moveTo(side*(uncle?23:17),-20);q.quadraticCurveTo(side*(uncle?37:28),-16-reach*9,side*(uncle?28:22),-8+kick*5-reach*12);},null,body,uncle?8:6);
 if(!leaf&&!mermaid)for(const side of [-1,1]){
  if(momo)p(q=>{q.moveTo(side*13,-45);q.lineTo(side*26,-62);q.quadraticCurveTo(side*32,-50,side*25,-36);q.closePath();},'#c1d4e4',ink,1.5);
  else if(!uncle)e(side*(shisa?23:20),shisa?-43:-49,shisa?10:7,shisa?11:8,shisa?'#dea05f':rakko?'#b18b65':kuri?'#a97854':body,ink,1.4);
 }
 if(shisa)for(let i=0;i<9;i++){const a=Math.PI*.05+i*Math.PI*.225;e(Math.cos(a)*27,-35+Math.sin(a)*23,9,9,'#e9af6a',ink,1.2);}
 if(mermaid)for(const side of [-1,1])p(q=>{q.moveTo(side*19,-46);q.bezierCurveTo(side*32,-69,side*43,-53,side*31,-42);q.quadraticCurveTo(side*24,-36,side*19,-46);q.closePath();},'#e7a1a7',ink,1.4);
 e(0,-35,uncle?30:leaf?27:27,leaf?24:23,body,ink,1.8);
 if(kuri){p(q=>{q.moveTo(-27,-36);q.bezierCurveTo(-28,-66,28,-65,27,-36);q.quadraticCurveTo(14,-45,0,-44);q.quadraticCurveTo(-14,-45,-27,-36);q.closePath();},'#a97f5e',ink,1.4);}
 if(rakko){
  // White face framed by the brown otter cap and angular white forehead tuft.
  p(q=>{q.moveTo(-27,-36);q.bezierCurveTo(-32,-65,30,-67,27,-35);q.lineTo(22,-41);q.lineTo(15,-44);q.lineTo(8,-43);q.lineTo(3,-49);q.lineTo(-2,-43);q.lineTo(-7,-49);q.lineTo(-13,-43);q.lineTo(-22,-41);q.closePath();},'#ba906a',ink,1.3);
  for(const side of [-1,1])e(side*21,-48,3.6,4.6,'#e7c7a5');
  p(q=>{q.moveTo(-21,-48);q.lineTo(-15,-42);q.moveTo(-15,-48);q.lineTo(-21,-42);},null,'#725546',1.5);
 }

 if(momo){e(0,-31,23,20,'#fffdf7');e(-20,-43,8,9,'#c2d4e5');e(20,-43,8,9,'#c2d4e5');}
 if(uncle){p(q=>{q.moveTo(-29,-41);q.lineTo(-25,-57);q.lineTo(25,-57);q.lineTo(29,-41);q.lineTo(15,-46);q.lineTo(-15,-46);q.closePath();},'#836b59',ink,1.5);}
 if(mermaid){p(q=>{q.moveTo(-27,-39);q.bezierCurveTo(-25,-68,25,-68,27,-39);q.lineTo(17,-31);q.lineTo(12,-45);q.lineTo(0,-51);q.lineTo(-12,-45);q.lineTo(-17,-31);q.closePath();},'#706271',ink,1.3);}
 if(leaf){
  // The island pair are deliberately faceless; the leaf count distinguishes them.
  p(q=>{q.moveTo(0,-58);q.quadraticCurveTo(-3,-67,kind==='futaba'?1:-2,-70);},null,'#618562',1.8);
  const signs=kind==='futaba'?[-1,1]:[1];for(const side of signs)p(q=>{q.moveTo(0,-66);q.quadraticCurveTo(side*2,-83,side*17,-76);q.quadraticCurveTo(side*17,-62,0,-66);q.closePath();},kind==='futaba'?'#9dc990':'#a9cc91',ink,1.1);
  e(-9,-36,9,12,'#d5dadd33');
 }else{
  for(const side of [-1,1]){
   const eye=side*(uncle?11:10),ey=-35;
   if(kuri){p(q=>{q.moveTo(eye-3,ey);q.lineTo(eye+3,ey);},null,ink,1.5);}
   else{e(eye,ey,momo?5:mermaid?4:3,Math.max(.8,(momo?6:mermaid?5:4)*(1-blink)),mermaid?'#9b536a':ink);if(blink<.6)e(eye-1,ey-2,momo?1.8:1,1.5,'#fff');}
   e(side*19,-27,4.5,2.7,'#e9b1b0');
   if(rakko||uncle)p(q=>{q.moveTo(eye-side*4,-44);q.lineTo(eye+side*4,-42);},null,ink,uncle?2.8:1.7);
   if(shisa){p(q=>{q.moveTo(eye-5,-43);q.bezierCurveTo(eye-8,-49,eye+4,-51,eye+4,-44);q.quadraticCurveTo(eye+3,-41,eye,-44);},null,'#b7804d',2);}
  }
  e(0,-28,kuri?5:uncle?4:2.8,kuri?3.6:2,ink);
  if(uncle){for(const side of [-1,1])p(q=>{q.moveTo(0,-23);q.quadraticCurveTo(side*9,-31,side*17,-21);q.quadraticCurveTo(side*9,-16,0,-23);},'#836b59');e(0,-14,6,3,'#836b59');}
  else p(q=>{q.moveTo(-5,-23);q.quadraticCurveTo(0,-17,5,-23);},null,ink,1.3);
  if(shisa)for(const side of [-1,1])p(q=>{q.moveTo(side*3,-22);q.lineTo(side*5,-17);q.lineTo(side*7,-22);q.closePath();},'#fffdf1',ink,.7);
 }
 if(kuri){
  // A clear handled beer mug with amber liquid, foam and glass highlights.
  p(q=>{q.moveTo(21,-18);q.bezierCurveTo(34,-20,34,-3,22,-4);},null,ink,3);
  p(q=>{q.moveTo(21,-16);q.bezierCurveTo(29,-17,29,-6,22,-6);},null,'#fff4d8',1.4);
  p(q=>{q.moveTo(7,-20);q.lineTo(23,-20);q.lineTo(22,-1);q.quadraticCurveTo(15,3,8,-1);q.closePath();},'#f3bc4c',ink,1.2);
  p(q=>{q.moveTo(10,-15);q.lineTo(10,-4);},null,'#fff9dc',2);
  for(const [fx,fy,rx]of [[10,-20,4],[16,-22,5],[22,-20,4]])e(fx,fy,rx,3.5,'#fffdf2',null);
  e(18,-9,1,1.4,'#ffe8a0');e(15,-4,1,1,'#ffe8a0');
 }
 if(rakko){
  p(q=>{q.moveTo(-17,-13);q.quadraticCurveTo(0,-6,16,-13);},null,'#fffdf5',5);e(0,-10,3,3,'#dab35b',ink,.8);p(q=>{q.moveTo(-15,-7);q.lineTo(16,1);},null,'#847158',2.5);
  p(q=>{q.moveTo(15,-4);q.lineTo(35,-34);q.lineTo(38,-32);q.lineTo(20,-1);q.closePath();},'#d9e0df',ink,1.1);p(q=>{q.moveTo(14,-7);q.lineTo(25,0);},null,'#b58d54',2.5);
 }
 if(uncle){c.fillStyle='#fff9ec';c.fillRect(-19,-17,38,21);p(q=>{q.moveTo(-19,-16);q.lineTo(-19,4);q.lineTo(19,4);q.lineTo(19,-16);},null,'#a8896b',1.3);c.font='700 9px system-ui';c.textAlign='center';c.fillStyle='#705746';c.fillText('味自慢',0,-2);}
 c.restore();
}
