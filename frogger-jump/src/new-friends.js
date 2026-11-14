import {FANTASY_FRIENDS,paintFantasyFriend} from './fantasy-friends.js';
import {FLOWER_IDS,FLOWERS,paintFlowerFriend} from './flowers.js';
export const NEW_FRIENDS=new Set([...FANTASY_FRIENDS,'elf-mage','violet-mage','red-warrior',...FLOWER_IDS,'bloom-bunny','mage-otter']);
export function paintNewFriend(s,x,y,scale,id,pose={}){
 if(FANTASY_FRIENDS.has(id)){paintFantasyFriend(s,x,y,scale,id,pose);return;}
 if(FLOWERS[id]){paintFlowerFriend(s,x,y,scale,id,pose);return;}
 const c=s.ctx,ink='#51554e',sprout=id==='bloom-bunny',elf=id==='elf-mage'||id==='mage-otter',warrior=id==='red-warrior',violet=id==='violet-mage',bunny=id==='bloom-bunny',otter=id==='mage-otter',color=violet?'#b9a8cf':warrior?'#d99686':bunny?'#eed7a3':otter?'#b2cfc3':'#e4eddb';
 const {squat=0,stretch=0,lean=0,fall=0,kick=0,tuck=0}=pose;c.save();c.translate(x,y);c.rotate(lean);c.scale(scale*(1+squat*.14-stretch*.06)*(1-fall*.4),scale*(1-squat*.18+stretch*.08)*(1-fall*.4));
 if(!pose.airborne&&!pose.noShadow)s.ellipse(0,2,24,5,'#31543722');
 for(const sign of [-1,1]){s.ellipse(sign*(12+kick*8),-2-tuck*7,8,5,color,ink);s.ellipse(sign*(22+kick*3),-22-tuck*7,6,9,color,ink);}
 s.ellipse(0,-22,23,25,color,ink,2);s.ellipse(0,-17,15,16,'#fff4dd');
 if(bunny)for(const sign of [-1,1]){s.ellipse(sign*12,-70,8,22,color,ink,1.5);s.ellipse(sign*12,-71,3,14,'#e9b7af');}
 if(elf)for(const sign of [-1,1])s.path(p=>{p.moveTo(sign*23,-48);p.lineTo(sign*43,-59);p.quadraticCurveTo(sign*40,-40,sign*24,-36);},'#efddc7',ink,1.5);
 s.ellipse(0,-45,29,25,color,ink,2);
 if(!sprout){const hair=violet?'#77678e':warrior?'#b66356':otter?'#8d9f90':'#e6e8df';s.path(p=>{p.moveTo(-28,-45);p.bezierCurveTo(-34,-77,29,-79,29,-44);p.lineTo(22,-56);p.lineTo(11,-52);p.lineTo(3,-60);p.lineTo(-7,-52);p.lineTo(-20,-57);p.closePath();},hair,ink,1.5);if(elf)for(const sign of [-1,1])s.ellipse(sign*25,-23,7,18,hair,ink,1.2);}
 if(sprout){s.path(p=>{p.moveTo(0,-67);p.quadraticCurveTo(8,-81,0,-92);},null,'#6f9469',3);s.path(p=>{p.moveTo(0,-87);p.quadraticCurveTo(-27,-103,-17,-82);p.quadraticCurveTo(-9,-76,0,-87);},'#a9c98c',ink,1.2);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;s.ellipse(3+Math.cos(a)*7,-91+Math.sin(a)*5,5,4,'#fff6dc','#c2a26d',.7);}s.ellipse(3,-91,3,3,'#efcf6e');}
 if(otter)s.ellipse(0,-37,16,10,'#f0e2c6');
 for(const sign of [-1,1]){s.ellipse(sign*10,-45,3,4,'#474e49');s.ellipse(sign*11-1,-47,1,1,'#fff');s.ellipse(sign*19,-36,5,3,'#e8aaa1');}
 s.path(p=>{p.moveTo(-5,-35);p.quadraticCurveTo(0,-30,5,-35);},null,ink,1.4);
 if(warrior){s.path(p=>{p.moveTo(-20,-24);p.lineTo(18,-18);p.lineTo(25,-7);p.lineTo(8,-12);p.lineTo(-21,-16);},'#bc655b',ink,1.2);s.path(p=>{p.moveTo(26,-8);p.lineTo(31,-53);},null,'#776851',4);}
 else if(!sprout){s.path(p=>{p.moveTo(-25,-9);p.lineTo(-28,-52);},null,'#988462',3);s.ellipse(-28,-55,6,7,violet?'#b8a3df':'#a9d0c0',ink,1.1);s.ellipse(-29,-57,2,2,'#fff4de');}
 c.restore();
}
export function paintRiverCompanion(s,x,y,scale,id){const c=s.ctx,ink='#506265';c.save();c.translate(x,y);c.scale(scale,scale);if(['crab','beaver','koi'].includes(id)){
  if(id==='crab'){for(const side of [-1,1]){for(const dy of [0,8,16])s.path(p=>{p.moveTo(side*20,dy-5);p.lineTo(side*37,dy-2);p.lineTo(side*43,dy+5);},null,'#ad766b',3);s.ellipse(side*31,-19,12,10,'#edb29a',ink,1.5);s.path(p=>{p.moveTo(side*34,-28);p.lineTo(side*30,-18);},null,ink,1.5);}s.ellipse(0,1,28,19,'#edb29a',ink,1.8);for(const side of [-1,1])s.ellipse(side*11,-12,7,9,'#f4ccb0',ink,1.2);}
  if(id==='beaver'){s.ellipse(31,12,15,22,'#9e826a',ink,1.5);for(const y of [3,10,17])s.path(p=>{p.moveTo(23,y);p.lineTo(40,y+5);},null,'#bfa486',1);s.ellipse(-3,0,29,26,'#c4a27b',ink,1.8);for(const side of [-1,1])s.ellipse(-3+side*19,-22,8,8,'#b68d69',ink,1.3);s.ellipse(-3,7,20,15,'#efdab8');c.fillStyle='#fff7dd';c.fillRect(-9,8,12,9);s.path(p=>{p.moveTo(-3,8);p.lineTo(-3,17);},null,ink,1);}
  if(id==='koi'){s.path(p=>{p.moveTo(22,0);p.lineTo(44,-18);p.quadraticCurveTo(35,0,44,18);p.closePath();},'#ebba91',ink,1.5);s.ellipse(-5,0,33,19,'#fff0d3',ink,1.7);s.ellipse(-21,-4,11,11,'#e89b7f');s.ellipse(8,4,9,12,'#e7ac83');s.path(p=>{p.moveTo(-4,-14);p.lineTo(9,-26);p.lineTo(15,-12);},'#ecc99b',ink,1.2);s.ellipse(-5,16,11,5,'#e6c994',ink,1);}
  const shift=id==='beaver'?-3:id==='koi'?-17:0;for(const side of [-1,1]){s.ellipse(shift+side*8,-5,2.5,3.5,ink);s.ellipse(shift+side*15,2,4,2,'#e8aaa0');}s.path(p=>{p.moveTo(shift-4,4);p.quadraticCurveTo(shift,8,shift+4,4);},null,ink,1.2);c.restore();return;
 }const color=id==='hippo' ?'#baa9c3':id==='ray'?'#9bc8d2':'#9ab9cd';
 if(id==='ray'){s.path(p=>{p.moveTo(-38,-4);p.quadraticCurveTo(-8,-34,0,-20);p.quadraticCurveTo(10,-34,38,-4);p.quadraticCurveTo(15,13,0,9);p.quadraticCurveTo(-16,13,-38,-4);},color,ink,2);s.path(p=>{p.moveTo(0,8);p.quadraticCurveTo(12,24,5,31);},null,ink,3);}
 else{s.ellipse(0,0,32,21,color,ink,2);if(id==='hippo'){for(const d of [-1,1]){s.ellipse(d*21,-18,8,9,color,ink,1.5);s.ellipse(d*13,-14,8,9,'#e1d3e1',ink,1.2);}s.ellipse(0,5,26,14,'#d4c1d9',ink,1.5);for(const d of [-1,1])s.ellipse(d*12,2,2,3,'#776c80');}else{s.path(p=>{p.moveTo(-4,-17);p.lineTo(6,-34);p.lineTo(16,-16);},color,ink,2);s.path(p=>{p.moveTo(28,0);p.lineTo(43,-13);p.lineTo(40,13);p.closePath();},color,ink,2);s.ellipse(-7,6,21,11,'#e5ece3');}}
 for(const d of [-1,1]){s.ellipse(d*11,-6,2.5,3.5,'#425256');s.ellipse(d*20,3,4,2,'#e7b0b1');}s.path(p=>{p.moveTo(-4,4);p.quadraticCurveTo(0,9,4,4);},null,ink,1.2);c.restore();}
export function paintRiverVisitor(s,x,y,scale,kind){const c=s.ctx;c.save();c.translate(x,y);c.scale(scale,scale);if(kind==='postfrog'){s.ellipse(0,0,16,13,'#a4c682','#526e4b',1.5);for(const d of [-1,1]){s.ellipse(d*8,-11,6,7,'#a4c682','#526e4b',1.1);s.ellipse(d*8,-12,2,3,'#46533e');}s.path(p=>{p.moveTo(-18,-13);p.lineTo(14,-13);p.lineTo(8,-22);p.lineTo(-10,-22);p.closePath();},'#dec28b','#826c4d',1.5);s.path(p=>{p.moveTo(-10,1);p.lineTo(14,1);p.lineTo(14,17);p.lineTo(-10,17);p.closePath();},'#fff2d4','#a18a62',1.3);s.path(p=>{p.moveTo(-10,1);p.lineTo(2,10);p.lineTo(14,1);},null,'#ae9270',1.2);}else{for(const d of [-1,1]){s.ellipse(d*10,-5,12,5,'#e7f2dcbb','#87a9a0',1);if(kind==='dragonfly')s.ellipse(d*9,3,10,4,'#deeee0bb','#87a9a0',1);}s.ellipse(0,0,5,kind==='dragonfly'?14:9,kind==='dragonfly'?'#86b9b0':'#efe49a','#5d8072',1.3);s.ellipse(0,-11,7,6,'#b7ce9a','#5d8072',1.1);for(const d of [-1,1])s.ellipse(d*3,-12,1.4,2,'#405d53');if(kind==='firefly')s.ellipse(0,6,4,5,'#fff4ac');}c.restore();}
