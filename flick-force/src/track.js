import {carY} from './car.js';
const mod=(n,m)=>((n%m)+m)%m;
function rounded(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function ellipse(ctx,x,y,rx,ry,color){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
export class Track {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.width=0;this.height=0;}
  resize(){
    const r=this.canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);
    this.width=r.width;this.height=r.height;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  draw({distance=0,speed=0,direction='up',drag=0,time=0,state='ready',quiet=false}={}){
    const c=this.ctx,w=this.width,h=this.height;if(!w||!h)return;
    const camera=quiet?0:(direction==='up'?distance:-distance)-drag/14;
    const centre=w*.5,road=w*.62,left=centre-road/2,right=centre+road/2;
    c.clearRect(0,0,w,h);
    const grass=c.createLinearGradient(0,0,w,h);grass.addColorStop(0,'#faead6');grass.addColorStop(1,'#f1dbd3');c.fillStyle=grass;c.fillRect(0,0,w,h);
    // Three layers travel at different rates, giving the runway gentle depth.
    for(let i=0;i<14;i++){
      const y=mod(i*67-camera*7,h+90)-45,x=i%2?w*.94:w*.06;
      ellipse(c,x,y,25+(i%3)*9,40,'#e8bfbd44');
      c.strokeStyle='#b0b996';c.lineWidth=1.5;c.lineCap='round';c.beginPath();c.moveTo(x,y+5);c.quadraticCurveTo(x-1,y-4,x-6,y-8);c.moveTo(x,y+5);c.quadraticCurveTo(x+3,y-4,x+7,y-9);c.stroke();
      if(i%3===0){ellipse(c,x+11,y+16,2.5,2.5,'#fff5d7');ellipse(c,x+11,y+16,1,1,'#deb381');}
    }
    c.fillStyle='#8ca77435';c.fillRect(left-5,0,road+10,h);
    const track=c.createLinearGradient(left,0,right,0);track.addColorStop(0,'#caddd4');track.addColorStop(.5,'#e1eee3');track.addColorStop(1,'#caddd4');c.fillStyle=track;c.fillRect(left,0,road,h);
    c.strokeStyle='#fcf6df';c.lineWidth=2;c.beginPath();c.moveTo(left+9,0);c.lineTo(left+9,h);c.moveTo(right-9,0);c.lineTo(right-9,h);c.stroke();
    c.setLineDash([5,15]);c.strokeStyle='#a9c5b477';c.lineWidth=1;c.beginPath();c.moveTo(centre,0);c.lineTo(centre,h);c.stroke();c.setLineDash([]);
    const first=Math.floor((camera-h*.65/14)/5),last=Math.ceil((camera+h*.5/14)/5);
    for(let n=first;n<=last;n++){
      const metres=n*5,y=h*.65+(metres-camera)*14;
      if(n===0){
        c.fillStyle='#f6f1de';c.fillRect(left+10,y-7,road-20,14);
        for(let k=0;k<Math.ceil((road-20)/10);k++)for(let row=0;row<2;row++)if((k+row)%2===0){c.fillStyle='#e8b6b2';c.fillRect(left+10+k*10,y-7+row*7,Math.min(10,right-10-(left+10+k*10)),7);}
      }else{
        c.strokeStyle='#fbf4dfb0';c.lineWidth=n%2===0?2:1;c.beginPath();c.moveTo(left+11,y);c.lineTo(right-11,y);c.stroke();
        c.font=`500 ${w<400?11:12}px 'DM Sans',system-ui,sans-serif`;c.textAlign='center';c.fillStyle='#647951';c.fillText(`${Math.abs(metres)} m`,right+(w-road)*.2,y+4);
        if(n%4===0){c.fillStyle='#87a070';c.fillRect(left-17,y-18,2,22);c.beginPath();c.moveTo(left-15,y-18);c.lineTo(left-1,y-13);c.lineTo(left-15,y-8);c.fillStyle='#e5a7b1';c.fill();}
      }
    }
    // Cloud parallax is slower than the track and the grass.
    c.save();c.globalAlpha=.55;
    for(let i=0;i<3;i++){const y=mod(i*187+45-camera*2.5,h+110)-55,x=i%2?w*.93:w*.06;ellipse(c,x,y,30,9,'#f5f7e9');ellipse(c,x+8,y-6,14,12,'#f5f7e9');}c.restore();
    const moving=!quiet&&state==='coasting',power=Math.min(1,speed/108),cy=carY(h,time),sign=direction==='up'?1:-1;
    if(moving&&power>.08){
      c.save();c.lineCap='round';
      for(let i=0;i<12;i++){
        const phase=mod(time*(.8+power*.6)+i*.137,1),side=i%2?1:-1;
        const x=centre+side*(68+(i%3)*13),y=cy+sign*(-90+phase*210),length=(14+power*55)*(1-phase);
        c.globalAlpha=(1-phase)*power*.85;c.strokeStyle=i%3===0?'#da9ea9':'#fffdf1';c.lineWidth=i%3===0?3.5:2.5;
        c.beginPath();c.moveTo(x,y);c.lineTo(x,y+sign*length);c.stroke();
      }
      for(let i=0;i<6;i++){
        const phase=mod(time*(.6+power*.4)+i/6,1),side=i%2?1:-1;
        c.globalAlpha=(1-phase)*power*.32;ellipse(c,centre+side*(40+phase*32),cy+sign*(55+phase*125),5+phase*15,4+phase*9,'#fff9ee');
      }
      c.restore();
    }
  }
}
