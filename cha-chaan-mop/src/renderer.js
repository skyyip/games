import { W, H, SEATS, dinerSeat, isRaised, activeNPCs } from './game.js';
import { t } from './copy.js';
const C = { ink: '#354337', mint: '#d9e9d6', dark: '#275644', red: '#c84f3e', cream: '#fff5d9', gold: '#efb646' };
const colours = ['#e89947', '#639db0', '#ab7cb7'];
function oval(c,x,y,rx,ry,fill,stroke) { c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=fill; c.fill(); if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();} }
function box(c,x,y,w,h,r,fill,stroke) { c.beginPath(); c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2;c.stroke();} }
function line(c,points,stroke,width=3) { c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=stroke;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke(); }
function label(c,text,x,y,size=20,colour=C.ink,align='center') {c.font=`700 ${size}px "Iansui", "Fredoka", system-ui, sans-serif`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=colour;c.fillText(text,x,y);}
function face(c,x,y,mood='calm',scale=1) {
  c.save();c.translate(x,y);c.scale(scale,scale);
  if(mood==='panic') {oval(c,-9,-2,5,7,C.ink);oval(c,9,-2,5,7,C.ink);oval(c,0,12,6,7,'#bd564b');oval(c,-13,7,3,8,'#65c4e2');}
  else if(mood==='smug') {line(c,[[-14,-3],[-6,-5]],C.ink);line(c,[[6,-5],[14,-3]],C.ink);line(c,[[-6,9],[0,13],[8,7]],C.ink,2);}
  else {oval(c,-10,-2,2.6,3.6,C.ink);oval(c,10,-2,2.6,3.6,C.ink);line(c,[[-4,10],[0,13],[5,9]],C.ink,2);}
  oval(c,-20,7,6,3,'#efaaa0');oval(c,20,7,6,3,'#efaaa0');c.restore();
}
export function sister(c,x,y,time,equipped={},angry=false) {
  const sway=Math.sin(time*10)*2;c.save();c.translate(x,y+sway);
  oval(c,0,25,29,9,'#35433725');
  box(c,-25,5,20,13,6,'#543f38');box(c,7,5,20,13,6,'#543f38');
  const apron=equipped.apron==='armour'?'#779aa5':equipped.apron==='dragon'?'#d7a545':'#db7977';
  box(c,-28,-38,56,49,15,apron,C.ink);
  for(let i=0;i<5;i++) oval(c,-16+i%3*16,-23+Math.floor(i/3)*19,4,4,equipped.apron==='dragon'?'#f8e5a4':'#fff3d0');
  line(c,[[-26,-24],[-41,-8]],'#d9ac88',10);line(c,[[26,-24],[39,-2]],'#d9ac88',10);
  oval(c,0,-58,34,34,'#544d47',C.ink);oval(c,24,-83,16,14,'#544d47',C.ink);
  oval(c,0,-52,31,26,'#f6caa5',C.ink);
  line(c,[[-27,-66],[-10,-76],[12,-72],[26,-62]],'#544d47',12);
  face(c,0,-52,angry?'smug':'calm');
  if(angry) {line(c,[[-15,-64],[-6,-59]],C.ink);line(c,[[6,-59],[15,-64]],C.ink);}
  c.restore();
}
function table(c,p,large=false) {
  const x=p.x,y=p.y-25,s=large?1.6:1;
  oval(c,x,y+22,75*s,31*s,'#35433722');
  box(c,x-61*s,y-15*s,122*s,40*s,13,'#b18859',C.ink);
  box(c,x-65*s,y-32*s,130*s,53*s,13,'#f7d398',C.ink);
  line(c,[[x-52*s,y-20*s],[x+50*s,y-20*s]],'#fff2ce',3);
  // A pineapple bun and a cup of tea, each with a tiny face.
  oval(c,x-22*s,y-4*s,20*s,9*s,'#bd8755');oval(c,x-22*s,y-10*s,19*s,12*s,'#e9a84e',C.ink);
  line(c,[[x-34*s,y-14*s],[x-13*s,y-6*s]],'#ffe1a0',2);line(c,[[x-31*s,y-4*s],[x-14*s,y-17*s]],'#ffe1a0',2);
  box(c,x+18*s,y-22*s,18*s,28*s,5,'#faf2ce',C.ink);oval(c,x+27*s,y-21*s,8*s,4*s,'#ac7650');
  line(c,[[x+32*s,y-32*s],[x+29*s,y-16*s]],'#2c765e',3);
  if(large) face(c,x-22*s,y-9*s,'calm',.35);
}
// Visual easing stays separate from the immediate, authoritative dodge state.
const footPoses=new WeakMap();
function footPose(subject,side,raised,time,reduced) {
  let poses=footPoses.get(subject);if(!poses){poses={};footPoses.set(subject,poses);}
  const target=Number(raised);let pose=poses[side];
  if(!pose)pose=poses[side]={target,from:target,value:target,at:time};
  if(target!==pose.target){pose.from=pose.value;pose.target=target;pose.at=time;}
  const progress=reduced?1:Math.min(1,Math.max(0,(time-pose.at)/(target ? .12 : .1)));
  pose.value=pose.from+(target-pose.from)*(1-(1-progress)**3);
  return pose.value;
}
function shoe(c,x,y,lift,wet,style='sneakers',color=C.red,side=1,maxLift=54) {
  const height=maxLift*lift,footX=x+side*12*lift,footY=y-height;
  oval(c,x,y+20,17-5*lift,6-2*lift,`rgba(53,67,55,${.16-.08*lift})`);
  // Knee bends up and out; the lifted shoe clears the floor by over its own height.
  line(c,[[x,y-88],[x+side*(9+12*lift),y-44-20*lift],[footX,footY]],'#e5ae83',10);
  c.save();c.translate(footX,footY);c.rotate(-side*.25*lift);
  const fill=style==='heels'?'#814665':style==='slippers'?'#f2c263':style==='toes'?'#e6bca6':'#fff7e9';
  if(lift>.05){c.strokeStyle='#fff6d9';c.lineWidth=6;c.beginPath();c.roundRect(-14,-7,28,27,9);c.stroke();}
  box(c,-13,-6,26,25,8,wet?'#b8dce0':fill,lift>.5?C.dark:C.ink);
  if(style==='slippers')line(c,[[-9,0],[0,7],[9,0]],color,3);
  else if(style==='toes')for(let k=0;k<3;k++)line(c,[[-6+k*6,7],[-6+k*6,13]],'#b78d7b',1.5);
  else {line(c,[[-8,5],[8,5]],color,2);line(c,[[-8,10],[8,10]],color,2);}
  c.restore();
  if(lift>.15){const ax=footX+side*24;line(c,[[ax,footY+14],[ax,footY-2],[ax-4,footY+3],[ax,footY-2],[ax+4,footY+3]],C.dark,3);}
}
function npc(c,n,g,lang,reduced) {
  const slipping=g.time<(n.slipUntil||0);
  const lifted=slipping||g.time>=n.reactsAt&&g.time<n.raisedUntil;
  const bounce=g.time<n.flash?Math.sin((g.time-n.flash)*40)*5:0;
  c.save();c.translate(n.x,n.y+bounce);if(slipping)c.rotate(Math.sin(g.time*8)*.2);
  box(c,-40,-70,80,45,16,'#a94037',C.ink);
  const shirt={phone:'#71998c',sneaker:'#e6c267',ol:'#7c799d',uncle:'#c7c2a8'}[n.type];
  box(c,-27,-74,54,49,16,shirt,C.ink);oval(c,0,-90,25,24,'#edc6a2',C.ink);
  if(n.type==='ol')line(c,[[-23,-96],[-17,-113],[5,-118],[24,-97]],'#574a45',10);
  else if(n.type==='uncle'){line(c,[[-13,-105],[-4,-109]],'#999386',5);line(c,[[8,-108],[15,-105]],'#999386',5);}
  else line(c,[[-22,-102],[-5,-112],[16,-107],[23,-101]],'#4d4840',9);
  face(c,0,-90,g.time<n.flash?'panic':n.type==='uncle'?'smug':'calm',.7);
  if(n.type==='phone') {box(c,-12,-49,24,32,5,'#354337');box(c,-8,-45,16,20,2,'#a3e0d3');}
  else if(n.type==='uncle') {box(c,-27,-52,54,31,2,'#fff5db',C.ink);line(c,[[-21,-45],[21,-45]],'#ae8b71',2);}
  if(n.type==='sneaker'){line(c,[[-23,-103],[20,-103]],'#fff7e9',6);label(c,'★',0,-106,10,C.red);}
  if(n.type==='uncle'){oval(c,-9,-91,8,6,'#ffffff20',C.ink);oval(c,9,-91,8,6,'#ffffff20',C.ink);line(c,[[-1,-91],[1,-91]],C.ink,1.5);}
  if(n.type==='ol'){oval(c,24,-109,9,6,'#d38c9a');oval(c,31,-110,7,6,'#d38c9a');}
  c.restore();
  const style=n.type==='ol'?'heels':'sneakers';
  shoe(c,n.x-21,n.y+62,footPose(n,'left',lifted,g.time,reduced),false,style,C.red,-1);shoe(c,n.x+21,n.y+62,footPose(n,'right',lifted,g.time,reduced),false,style,C.red,1);
  if(n.reactsAt>g.time&&n.reactsAt<Infinity) {
    const left=n.reactsAt-g.time;
    box(c,n.x-35,n.y+81,70,9,4,'#c5ccb3');box(c,n.x-35,n.y+81,70*Math.min(1,left/1.1),9,4,left<.24?'#f2bc46':'#71998c');
  }
  if(n.type==='uncle'&&n.hits%3) label(c,`${n.hits%3}/3`,n.x,n.y+100,16,'#825041');
}
function diner(c,d,g,eq,lang,reduced) {
  const p=dinerSeat(g,d.id),isSolo=g.mode==='diner';
  c.save();c.translate(p.x,p.y);
  box(c,-49,-94,98,65,18,colours[d.id],C.ink);
  box(c,-28,-75,56,48,16,colours[d.id],C.ink);
  oval(c,0,-95,29,27,'#f5caa4',C.ink);
  line(c,[[-24,-106],[-10,-120],[12,-115],[25,-106]],'#51483e',9);
  face(c,0,-93,d.wet>=3?'panic':'calm',.85);
  c.restore();
  shoe(c,p.x-25,p.y+65,footPose(d,'left',isRaised(g,d,'left'),g.time,reduced),d.wet>0,eq.shoes,colours[d.id],-1,isSolo?42:54);
  shoe(c,p.x+25,p.y+65,footPose(d,'right',isRaised(g,d,'right'),g.time,reduced),d.wet>1,eq.shoes,colours[d.id],1,isSolo?42:54);
  if(d.block){box(c,p.x-60,p.y-8,120,75,8,'#f9efcb',C.ink);label(c,lang==='en'?'MENU':'是日靚餐',p.x,p.y+16,20,C.dark);label(c,'$ 38',p.x,p.y+43,18,C.red);}
  if(!isSolo) {box(c,p.x-27,p.y+94,54,26,8,colours[d.id]);label(c,`P${d.id+1}`,p.x,p.y+107,17,'#fff');}
  if(g.time<d.crampUntil) label(c,'⚡',p.x,p.y+5,34,'#e49a29');
  if(d.wet>=3) {oval(c,p.x,p.y+80,65,18,'#83bec5aa');label(c,'…',p.x,p.y-139,26);}
}
export function mop(c,x,y,time,equipped={},angle=-.45) {
  c.save();c.translate(x,y);c.rotate(angle);
  line(c,[[0,-12],[0,-102]],'#695c47',10);line(c,[[-2,-14],[-2,-100]],'#c8b37b',4);
  const fill=equipped.mop==='beam'?'#82e9df':equipped.mop==='meteor'?'#b5bac3':'#dce8cb';
  oval(c,0,11,43,12,'#4b71682b');
  box(c,-34,-7,68,24,10,fill,C.ink);
  for(let i=0;i<9;i++)line(c,[[-28+i*7,5],[-30+i*7+Math.sin(time*17+i)*2,23]],equipped.mop==='beam'?'#5ec3d0':'#aabda1',4);
  oval(c,0,-5,12,7,equipped.mop==='meteor'?'#727e8c':'#e3bd65',C.ink);
  if(equipped.mop==='meteor')for(let i=-1;i<=1;i++)line(c,[[i*23,0],[i*27,-14]],'#8993a5',4);
  c.restore();
}
export function createRenderer(canvas) {
  const c=canvas.getContext('2d',{alpha:false});
  const background=document.createElement('canvas');background.width=W;background.height=H;
  const b=background.getContext('2d');
  const dirt=document.createElement('canvas');dirt.width=W;dirt.height=H;const dc=dirt.getContext('2d');let dirtGame=null,dirtCount=-1;const dirtyCells=new Set();
  function buildRoom(lang) {
    b.fillStyle='#cddfc7';b.fillRect(0,0,W,H);
    for(let y=95;y<H;y+=56)for(let x=0;x<W;x+=56){b.fillStyle=(Math.round(x/56)+Math.round(y/56))%2?'#d7e5cf':'#e2ebd6';b.fillRect(x+1,y+1,54,54);}
    box(b,12,88,W-24,H-102,17,'#00000000','#a8bda5');
    b.fillStyle='#315d48';b.fillRect(0,0,W,98);b.fillStyle='#49735a';b.fillRect(0,90,W,10);
    box(b,174,13,252,62,12,'#f6e8bc','#e4bb61');
    label(b,lang==='en'?'FEET UP CAFÉ':'縮腳茶餐廳',300,39,29,C.dark);label(b,lang==='en'?'MILK TEA · NO DRY SHOES':'奶茶夠滑・地板更滑',300,64,15,'#8b664a');
    for(const x of [35,510]) {box(b,x,17,55,57,5,'#c6dbbd','#e5ce99');for(let k=0;k<4;k++)line(b,[[x+10,29+k*10],[x+44,29+k*10]],'#5b8069',2);}
    for(let i=0;i<4;i++){oval(b,43+i*13,681,4,2,'#a1b18b');oval(b,517+i*13,681,4,2,'#a1b18b');}
  }
  let language='',needsResize=true;
  new ResizeObserver(()=>{needsResize=true;}).observe(canvas);
  function resize() {const rect=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,1.75);const width=Math.round(rect.width*dpr),height=Math.round(rect.height*dpr);if(width&&height&&(canvas.width!==width||canvas.height!==height)){canvas.width=width;canvas.height=height;}}
  function draw(g,lang,eq,reduced=false) {
    if(needsResize){resize();needsResize=false;}if(language!==lang){language=lang;buildRoom(lang);}
    c.setTransform(1,0,0,1,0,0);c.fillStyle='#bdceb2';c.fillRect(0,0,canvas.width,canvas.height);const scale=Math.min(canvas.width/W,canvas.height/H);c.setTransform(scale,0,0,scale,(canvas.width-W*scale)/2,(canvas.height-H*scale)/2);c.drawImage(background,0,0);
    const time=reduced?0:g.time;
    // Small opaque puddles read as dirt; cleaned cells restore the original tile.
    if(g.mode!=='diner'){
      if(dirtGame!==g){dc.clearRect(0,0,W,H);dirtyCells.clear();for(const cell of g.cells)if(!cell.clean){dirtyCells.add(cell);oval(dc,cell.x,cell.y,8+(cell.x%3),4,'#947a4b45');if((cell.x+cell.y)%5===0)oval(dc,cell.x+7,cell.y-5,3,2,'#ac795a66');}dirtGame=g;}
      else if(dirtCount!==g.cleanCount)for(const cell of dirtyCells)if(cell.clean){dc.clearRect(cell.x-14,cell.y-12,28,24);dirtyCells.delete(cell);}
      dirtCount=g.cleanCount;
      c.drawImage(dirt,0,0);
    }
    if(g.event?.kind==='rain') {
      for(let i=0;i<12;i++){const x=(i*73+time*60)%600,y=(i*97+time*90)%700;line(c,[[x,y],[x-6,y+16]],'#6b9ca055',2);}
    }
    if(g.soap&&g.time<g.soapUntil){oval(c,g.soap.x,g.soap.y,130,53,'#9bd5c170','#75bda9');for(let i=0;i<8;i++)oval(c,g.soap.x+Math.cos(i)*70,g.soap.y+Math.sin(i*3)*25,5+i%3,5+i%3,'#ffffff99');}
    if(g.mode==='sister') {
      for(const n of activeNPCs(g)) {npc(c,n,g,lang,reduced);if(!n.guest)table(c,n);if(n.type==='phone'){box(c,n.x+38,n.y-64,19,28,4,C.ink);box(c,n.x+41,n.y-61,13,19,2,'#a9dfcd');}}
    } else if(g.mode==='versus') {
      for(const d of g.diners){const p=dinerSeat(g,d.id);diner(c,d,g,eq,lang,reduced);table(c,p);}
    } else {
      box(c,75,150,450,50,16,'#b74c3f',C.ink);line(c,[[90,176],[510,176]],'#d97662',2);
      diner(c,g.diners[0],g,eq,lang,reduced);table(c,dinerSeat(g,0),true);
      const a=g.attack;
      if(a){
        const progress=Math.min(1,(g.time-a.start)/(a.impact-a.start));
        const side=a.kind==='left'?-1:a.kind==='right'?1:0;
        const targetX=300+side*25,targetY=400;
        c.save();c.setLineDash([10,10]);line(c,[[side===0?300:300+side*250,650],[targetX,targetY+15]],'#cd574399',5);c.restore();
        const x=side===0?300:300+side*230*(1-progress), y=625-(625-targetY)*progress;
        if(g.time>=a.impact&&a.kind==='sweep') {mop(c,220+160*((g.time-a.impact)/1.4),410,time,eq,.7);}
        else if(a.kind==='splash'&&g.time>=a.impact)for(let i=0;i<12;i++)oval(c,230+i*13,310+((g.time-a.impact)*260+i*31)%150,4,9,'#74baca');
        else mop(c,x,y,time,eq,side*.9);
        if(g.time<a.impact){box(c,targetX-35,targetY+55,70,34,12,'#fff2bd',C.red);label(c,a.kind==='splash'?'☂':side===0?'↑↑':side<0?'L ↑':'R ↑',targetX,targetY+72,22,C.red);}
      } else {sister(c,480,610,time,eq);mop(c,495,545,time,eq);}
      if(g.food>=100){label(c,'✓',250,300,30,C.dark);}if(g.drink>=100){label(c,'✓',350,300,30,C.dark);}
    }
    if(g.mode!=='diner') {
      sister(c,g.sister.x,g.sister.y,time,eq,g.shoutUntil>g.time);
      line(c,[[g.sister.x+30,g.sister.y-20],[g.mop.x,g.mop.y-70]],'#735d42',7);
      mop(c,g.mop.x,g.mop.y,time,eq,g.time<g.cycloneUntil?time*16:-.35);
      if(g.time<g.cycloneUntil){c.save();c.translate(g.mop.x,g.mop.y);c.rotate(time*6);for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,0,100+i*15,34+i*10,i*.8,.4,4);c.strokeStyle='#7db9bfaa';c.lineWidth=8;c.stroke();}c.restore();}
      if(g.shoutUntil>g.time){box(c,g.sister.x-125,Math.max(107,g.sister.y-163),250,47,18,'#fff3c4',C.ink);label(c,t(g.shoutText==='roar'?'roarLine':'shoutLine',lang),g.sister.x,Math.max(130,g.sister.y-140),lang==='en'?17:22,C.red);}
    }
    for(const e of g.effects) {
      const age=g.time-e.born,f=Math.max(0,1-age/e.life);c.globalAlpha=f;
      const y=e.y-(reduced?0:age*45);const txt=e.kind==='perfect'?`${t('perfect',lang)} +${e.value}`:e.kind==='points'?`+${e.value}`:e.kind==='guard'?t('guard',lang):e.kind==='uncle'?`${e.value}/3`:e.kind==='wet'?'SPLASH!':e.kind==='soaked'?t('soaked',lang):e.kind==='cramp'?'⚡':e.kind==='dodge'?t('dodge',lang):e.kind==='food'?'😋':e.kind==='drink'?'🧋':'';
      if(txt){c.lineWidth=5;c.strokeStyle='#fff8e5';c.font=`700 ${e.kind==='perfect'?24:22}px Iansui,system-ui`;c.textAlign='center';c.textBaseline='middle';c.strokeText(txt,Math.max(110,Math.min(490,e.x)),y);label(c,txt,Math.max(110,Math.min(490,e.x)),y,e.kind==='perfect'?24:22,e.kind==='perfect'?'#a75820':C.red);}
      c.globalAlpha=1;
    }
  }
  function point(clientX,clientY){const r=canvas.getBoundingClientRect(),s=Math.min(r.width/W,r.height/H);return {x:(clientX-r.left-(r.width-W*s)/2)/s,y:(clientY-r.top-(r.height-H*s)/2)/s};}
  return { draw, resize, point };
}
