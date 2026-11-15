export const FANTASY_FRIENDS=new Set(['dawn-hero','stone-dwarf','gentle-priest']);
export function paintFantasyFriend(s,x,y,scale,id,pose={}){
 if(id==='stone-dwarf'||id==='gentle-priest'){paintRiverAdventurer(s,x,y,scale,id,pose);return;}
 const c=s.ctx,ink='#535853',dwarf=id==='stone-dwarf',priest=id==='gentle-priest',body=dwarf?'#b7bcc0':priest?'#f2eddb':'#c6dbe3',hair=dwarf?'#bd765c':priest?'#8ba58c':'#91b8d4';
 const {squat=0,stretch=0,lean=0,fall=0,kick=0,tuck=0,reach=0,blink=0}=pose;c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.14-stretch*.06)*(1-fall*.4),scale*(1-squat*.18+stretch*.08)*(1-fall*.4));
 if(!pose.airborne&&!pose.noShadow)s.ellipse(0,2,24,5,'#31543722');
 if(!priest)s.path(p=>{p.moveTo(-17,-34);p.lineTo(-31,0);p.quadraticCurveTo(0,10,29,0);p.lineTo(16,-34);},dwarf?'#c28d78':'#e5edf1',ink,1.3);
 for(const sign of [-1,1])s.ellipse(sign*(12+kick*7),-2-tuck*7,9,5,dwarf?'#8d8074':'#82949a',ink,1.4);
 s.ellipse(0,-19,dwarf?23:18,22,body,ink,1.6);s.ellipse(0,-43,dwarf?28:25,23,'#f3dfc7',ink,1.6);
 if(dwarf){s.path(p=>{p.moveTo(-28,-44);p.quadraticCurveTo(-35,-74,0,-76);p.quadraticCurveTo(35,-74,28,-44);p.lineTo(21,-58);p.lineTo(-21,-58);p.closePath();},'#b9c4c4',ink,1.7);s.path(p=>{p.moveTo(0,-75);p.lineTo(0,-58);},null,'#dde1d8',3);s.path(p=>{p.moveTo(-26,-39);p.quadraticCurveTo(-30,-6,0,3);p.quadraticCurveTo(30,-6,26,-39);p.lineTo(14,-26);p.lineTo(0,-20);p.lineTo(-14,-26);p.closePath();},hair,ink,1.5);for(const sign of [-1,1])s.path(p=>{p.moveTo(sign*13,-25);p.lineTo(sign*8,-3);},null,'#dfad87',1.4);}
 else{s.path(p=>{p.moveTo(-25,-40);p.quadraticCurveTo(-31,-75,-4,-73);p.quadraticCurveTo(27,-78,26,-39);p.lineTo(19,-52);p.lineTo(9,-48);p.lineTo(-1,-59);p.lineTo(-13,-49);p.lineTo(-23,-49);p.closePath();},hair,ink,1.5);}
 for(const sign of [-1,1]){s.ellipse(sign*9,-43,2.8,Math.max(.8,4*(1-blink)),ink);s.ellipse(sign*16,-35,4,2.5,'#e7b3a3');s.path(p=>{p.moveTo(sign*16,-24);p.lineTo(sign*26,-12-reach*10);},null,body,7);}
 s.path(p=>{p.moveTo(-5,-35);p.quadraticCurveTo(0,-30,5,-35);},null,ink,1.2);
 if(priest){for(const sign of [-1,1])s.ellipse(sign*10,-43,8,7,null,'#7b887d',1.1);s.path(p=>{p.moveTo(-2,-43);p.lineTo(2,-43);},null,'#7b887d',1.1);s.path(p=>{p.moveTo(-8,-26);p.lineTo(-8,-5);p.lineTo(8,-5);p.lineTo(8,-26);},'#d2b776','#8f825e',1);s.path(p=>{p.moveTo(31,-5);p.lineTo(31,-69);},null,'#a38b62',3);s.ellipse(31,-73,8,8,'#f7e4a7',ink,1.3);s.path(p=>{p.moveTo(31,-80);p.lineTo(31,-66);p.moveTo(25,-73);p.lineTo(37,-73);},null,'#b69a60',1.3);}
 else{s.path(p=>{p.moveTo(27,-3);p.lineTo(32,-63);},null,'#8d826d',4);if(dwarf)s.path(p=>{p.moveTo(32,-65);p.quadraticCurveTo(51,-72,45,-49);p.lineTo(31,-52);p.closePath();},'#c4cecc',ink,1.5);else{s.path(p=>{p.moveTo(29,-57);p.lineTo(34,-78);p.lineTo(38,-57);p.lineTo(34,-31);p.closePath();},'#e5eeee',ink,1.2);s.path(p=>{p.moveTo(23,-29);p.lineTo(43,-27);},null,'#c0a575',3);s.ellipse(0,-15,5,5,'#f5d890','#a88a52',1);}}
 c.restore();
}

// Coherent shoulders, hands and necks keep these human adventurers readable at icon size.
function paintRiverAdventurer(s,x,y,scale,id,pose){
 const c=s.ctx,dwarf=id==='stone-dwarf',ink='#55594e',skin='#ecd3b5';
 const {squat=0,stretch=0,lean=0,fall=0,kick=0,tuck=0,reach=0,blink=0}=pose;
 const e=(...args)=>s.ellipse(...args),p=(...args)=>s.path(...args);
 c.save();c.translate(x,y);c.rotate(lean);
 c.scale(scale*(1+squat*.12-stretch*.05)*(1-fall*.4),scale*(1-squat*.16+stretch*.08)*(1-fall*.4));
 if(!pose.airborne&&!pose.noShadow)e(0,3,24,5,'#31543722');
 // Boots and a weighted cape sit behind the torso instead of crossing the face.
 p(q=>{q.moveTo(-17,-33);q.quadraticCurveTo(-23,-19,-25,0);q.quadraticCurveTo(0,8,25,0);q.lineTo(16,-33);q.closePath();},dwarf?'#ae7b62':'#8da087',ink,1.3);
 for(const side of [-1,1])e(side*(dwarf?13:10)+side*kick*6,-1-tuck*5,dwarf?9:7,5,dwarf?'#746954':'#807b61',ink,1.3);
 if(dwarf){
  e(0,-21,22,22,'#99a9a6',ink,1.5);
  p(q=>{q.moveTo(-18,-30);q.quadraticCurveTo(0,-40,18,-30);q.lineTo(16,-12);q.quadraticCurveTo(0,-7,-16,-12);q.closePath();},'#b9c4ba','#6b7970',1.2);
  p(q=>{q.moveTo(-20,-9);q.quadraticCurveTo(0,-5,20,-9);},null,'#7e684d',5);e(0,-7,4,3,'#d8bd7c',ink,1);
 }else{
  p(q=>{q.moveTo(-15,-34);q.quadraticCurveTo(-22,-23,-20,1);q.quadraticCurveTo(0,6,20,1);q.quadraticCurveTo(22,-23,15,-34);q.closePath();},'#eee7d0',ink,1.5);
  p(q=>{q.moveTo(-9,-33);q.lineTo(-12,-1);q.lineTo(-4,-1);q.lineTo(0,-27);q.lineTo(4,-1);q.lineTo(12,-1);q.lineTo(9,-33);},'#83977e','#6b8069',1);
  p(q=>{q.moveTo(0,-20);q.lineTo(0,-4);},null,'#d0c6a9',1);
 }
 // Sleeve, wrist and gripping hand form one uninterrupted line to the tool.
 for(const side of [-1,1]){
  const handX=side*(dwarf?25:24),handY=-13-reach*7;
  p(q=>{q.moveTo(side*17,-28);q.quadraticCurveTo(side*24,-23,handX,handY);},null,dwarf?'#a7b5ad':'#e5dfc7',8);
  e(handX,handY,4.2,4.6,skin,ink,1);
 }
 e(0,-35,7,7,skin,ink,1);
 for(const side of [-1,1])e(side*(dwarf?23:20),-44,4,6,skin,ink,1);
 e(0,-47,dwarf?24:21,22,skin,ink,1.5);
 e(-8,-50,dwarf?11:9,12,'#f6e2c8');
 if(dwarf){
  // The beard begins below the cheekbones; the helmet follows the skull.
  p(q=>{q.moveTo(-23,-40);q.quadraticCurveTo(-22,-18,-10,-10);q.quadraticCurveTo(0,-5,10,-10);q.quadraticCurveTo(22,-18,23,-40);q.lineTo(14,-34);q.lineTo(0,-29);q.lineTo(-14,-34);q.closePath();},'#9f6a4d',ink,1.3);
  for(const side of [-1,1])p(q=>{q.moveTo(side*15,-30);q.quadraticCurveTo(side*14,-19,side*7,-13);},null,'#c5966a',1.2);
  p(q=>{q.moveTo(-25,-46);q.lineTo(-25,-56);q.quadraticCurveTo(-23,-73,0,-74);q.quadraticCurveTo(23,-73,25,-56);q.lineTo(25,-46);q.lineTo(18,-51);q.quadraticCurveTo(0,-57,-18,-51);q.closePath();},'#aabbb6',ink,1.5);
  p(q=>{q.moveTo(0,-73);q.lineTo(0,-55);},null,'#d3ddd1',3);
 }else{
  p(q=>{q.moveTo(-21,-43);q.quadraticCurveTo(-29,-65,-12,-70);q.quadraticCurveTo(9,-80,22,-61);q.lineTo(23,-43);q.lineTo(17,-48);q.lineTo(15,-59);q.quadraticCurveTo(4,-55,-6,-62);q.quadraticCurveTo(-14,-58,-17,-48);q.closePath();},'#83917e',ink,1.3);
  p(q=>{q.moveTo(-14,-65);q.quadraticCurveTo(-4,-70,8,-66);},null,'#adb6a0',2);
  p(q=>{q.moveTo(-9,-32);q.lineTo(0,-26);q.lineTo(9,-32);},'#f9f1db',ink,1);
 }
 for(const side of [-1,1]){
  e(side*8,-46,2.1,Math.max(.7,3.1*(1-blink)),ink);
  p(q=>{q.moveTo(side*5,-52);q.quadraticCurveTo(side*10,-54,side*13,-51);},null,dwarf?'#755841':'#6b7a65',dwarf?2:1.5);
  e(side*14,-39,3,1.8,'#d8a98c');
 }
 e(0,-39,dwarf?4.2:2.5,2.5,'#d8b091',null);
 if(dwarf){for(const side of [-1,1])p(q=>{q.moveTo(0,-36);q.quadraticCurveTo(side*8,-40,side*13,-33);q.quadraticCurveTo(side*7,-31,0,-34);},'#a77352',null);}
 else{
  for(const side of [-1,1])e(side*8,-46,6.7,6.1,null,'#687b6d',1);
  p(q=>{q.moveTo(-1,-46);q.lineTo(1,-46);},null,'#687b6d',1);
  p(q=>{q.moveTo(-4,-34);q.quadraticCurveTo(0,-31,4,-34);},null,ink,1);
 }
 // Wooden handles remain aligned with the palm; axe and staff have natural silhouettes.
 const gripY=-13-reach*7;
 p(q=>{q.moveTo(dwarf?25:24,gripY+12);q.lineTo(dwarf?30:29,-64);},null,'#8f7957',3.4);
 if(dwarf){
  p(q=>{q.moveTo(29,-65);q.lineTo(39,-68);q.quadraticCurveTo(48,-64,43,-49);q.lineTo(29,-54);q.closePath();},'#c3ccc3',ink,1.4);
  p(q=>{q.moveTo(40,-66);q.quadraticCurveTo(45,-60,41,-51);},null,'#e3e6d8',2);
 }else{
  e(29,-70,7,8,'#d8c290',ink,1.2);e(29,-71,3.5,4,'#f6e5b2');
  p(q=>{q.moveTo(24,-61);q.lineTo(34,-61);},null,'#b7a06e',2);
 }
 c.restore();
}
