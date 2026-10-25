export class MemoryBoard {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.size=0;}
  resize(){const r=this.canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);this.size=r.width;this.canvas.width=Math.round(r.width*dpr);this.canvas.height=Math.round(r.height*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);}
  draw({target=null,strokes=[],cursor=null,pen=false,color='#ca8d74',layers=[]}={}){
    const c=this.ctx,s=this.size;c.clearRect(0,0,s,s);c.fillStyle='#fcf9ed';c.fillRect(0,0,s,s);
    c.fillStyle='#bfc6ac77';for(let x=s/12;x<s;x+=s/12)for(let y=s/12;y<s;y+=s/12){c.beginPath();c.arc(x,y,.8,0,Math.PI*2);c.fill();}
    c.strokeStyle='#b7bea344';c.lineWidth=1;c.setLineDash([3,8]);c.beginPath();c.moveTo(s/2,15);c.lineTo(s/2,s-15);c.moveTo(15,s/2);c.lineTo(s-15,s/2);c.stroke();c.setLineDash([]);
    const path=points=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x*s,p.y*s):c.moveTo(p.x*s,p.y*s));};
    if(target){path(target);c.fillStyle='#dbe4c344';c.fill();c.strokeStyle='#78946b';c.lineWidth=Math.max(4,s*.011);c.lineCap='round';c.lineJoin='round';c.setLineDash([7,4]);c.stroke();c.setLineDash([]);}
    c.lineWidth=Math.max(2.5,s*.007);c.lineCap='round';c.lineJoin='round';c.strokeStyle=color;
    for(const stroke of strokes){if(!stroke.length)continue;path(stroke);c.stroke();if(stroke.length===1){c.beginPath();c.arc(stroke[0].x*s,stroke[0].y*s,c.lineWidth/2,0,Math.PI*2);c.fillStyle=color;c.fill();}}
    for(const layer of layers){c.strokeStyle=layer.color;c.lineWidth=Math.max(2,s*.006);for(const stroke of layer.strokes){if(!stroke.length)continue;path(stroke);c.stroke();}}
    if(cursor){c.beginPath();c.arc(cursor.x*s,cursor.y*s,pen?4:7,0,Math.PI*2);c.strokeStyle='#466c76';c.lineWidth=1.5;c.stroke();c.fillStyle=pen?'#466c76':'#ffffff77';c.fill();}
  }
}
