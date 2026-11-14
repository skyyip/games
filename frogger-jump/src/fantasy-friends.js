export const FANTASY_FRIENDS=new Set(['dawn-hero','stone-dwarf','gentle-priest']);
export function paintFantasyFriend(s,x,y,scale,id,pose={}){
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
