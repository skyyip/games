export class CityScene{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.w=600;this.h=380;}
 resize(w,h){const ratio=Math.min(devicePixelRatio||1,2,Math.sqrt(1600000/(w*h)));if(this.w===w&&this.h===h&&this.ratio===ratio)return;this.w=w;this.h=h;this.ratio=ratio;this.canvas.width=Math.round(w*ratio);this.canvas.height=Math.round(h*ratio);this.ctx.setTransform(ratio,0,0,ratio,0,0);}
 polygon(points,fill,stroke){const c=this.ctx;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
 draw(state,soft=false){const c=this.ctx,w=this.w,h=this.h,snow=['snow','dinner'].includes(state.stage),final=['finale','ending'].includes(state.stage);c.clearRect(0,0,w,h);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,snow?'#7e949e':'#172c39');bg.addColorStop(1,snow?'#d0d7d3':'#080f18');c.fillStyle=bg;c.fillRect(0,0,w,h);
  if(snow){
   for(let i=0;i<5;i++){const x=w*(i*.3-.15),peak=h*(.17+i%3*.05);this.polygon([[x,h*.78],[x+w*.32,peak],[x+w*.66,h*.82]],i%2?'#c3d0d1':'#e1e5df');this.polygon([[x+w*.32,peak],[x+w*.66,h*.82],[x+w*.42,h*.75]],'#8b9fa5');}
   this.polygon([[0,h*.72],[w*.66,h*.5],[w,h*.65],[w,h],[0,h]],'#c7d6d9');this.polygon([[w*.24,h*.76],[w*.48,h*.55],[w*.72,h*.77]],'#405b68','#a3b6ba');this.polygon([[w*.48,h*.55],[w*.72,h*.77],[w*.52,h*.79]],'#29434f');
   c.fillStyle='#cf8355';c.beginPath();c.ellipse(w*.4,h*.8,18,5,0,0,Math.PI*2);c.fill();for(let i=0;i<28;i++){const x=(i*71+37)%w,y=(i*43+19)%(h*.7);c.fillStyle='#fff9';c.fillRect(x,y,2,2);}
  }else{
   const scale=Math.min(w/640,h/370),ox=w*.5,oy=h*.27;const iso=(x,y,z=0)=>[ox+(x-y)*37*scale,oy+(x+y)*17*scale-z*scale];
   for(let y=0;y<5;y++)for(let x=0;x<5;x++){const height=35+((x*19+y*37)%65)+(state.prices>60?18:0),p=iso(x-2,y-2),a=iso(x-2+.78,y-2),b=iso(x-2+.78,y-2+.78),d=iso(x-2,y-2+.78);this.polygon([p,a,b,d],'#203342','#32424b');const top=[p,a,b,d].map(([x,y])=>[x,y-height*scale]);this.polygon([top[0],top[1],a,p],'#2d4552','#4a5c62');this.polygon([top[1],top[2],b,a],'#192c3c','#3c4c59');this.polygon(top,'#4c6066','#7b8580');for(let n=0;n<3;n++){const lit=(x+y+n+Math.floor(state.solidarity/20))%4!==0;c.fillStyle=lit?(state.unrest>70?'#c47062':'#d3b680'):'#12232c';c.fillRect(p[0]+8*scale,p[1]-height*scale+12*scale+n*14*scale,5*scale,6*scale);}}
   c.strokeStyle='#b36f5c';c.lineWidth=2;c.beginPath();c.moveTo(w*.1,h*.84);c.lineTo(w*.85,h*.49);c.stroke();c.fillStyle='#df9f73';c.fillRect(w*.15,h*.72,38,19);c.fillStyle='#253640';c.font='bold 10px sans-serif';c.fillText('LIVE',w*.15+5,h*.72+13);
   if(final){c.fillStyle='#c58f65';c.fillRect(w*.28,h*.74,w*.44,12);for(let i=0;i<4;i++){c.strokeStyle=i===3?'#e4c699':'#586c78';c.lineWidth=2;c.strokeRect(w*(.34+i*.1),h*.69,11,16);}}
  }
  const people=snow?3:final?3:1;for(let i=0;i<people;i++){const x=w*(people===1?.52:.38+i*.1),y=h*(snow?.82:.85);c.fillStyle=['#c99a70','#80b7b4','#aca1c5'][people===1?['angus','bowman','ronnie'].indexOf(state.actor):i];c.beginPath();c.arc(x,y-17,5,0,7);c.fill();c.fillRect(x-4,y-11,8,13);c.strokeStyle='#1a2832';c.lineWidth=3;c.beginPath();c.moveTo(x-2,y+2);c.lineTo(x-4,y+9);c.moveTo(x+2,y+2);c.lineTo(x+4,y+9);c.stroke();}
  if(!soft){const p=state.characters[state.actor],amount=Math.max(p.guilt-60,65-p.sanity,0)/100;if(amount>0){const fog=c.createRadialGradient(w/2,h/2,h*.12,w/2,h/2,w*.65);fog.addColorStop(0,'#14182700');fog.addColorStop(1,`rgba(6,9,18,${Math.min(.8,amount+.22)})`);c.fillStyle=fog;c.fillRect(0,0,w,h);}}
 }
}
