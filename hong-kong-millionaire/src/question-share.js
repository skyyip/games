// Deliberate question sharing is separate from the spoiler-free daily score card.
export function questionShareText(q,url){
 return `${q.sharePrompt??'呢啲香港日常設計，你又留意過未？'}\n\n${q.question}\n${q.options.map((option,i)=>'ABCD'[i]+'）'+option).join('\n')}\n\n香港百萬富翁・題目分享（不附答案）\n${url}`;
}
function lines(ctx,text,width){
 const result=[];let line='';
 for(const character of text){if(line&&ctx.measureText(line+character).width>width){result.push(line);line='';}line+=character;}
 if(line)result.push(line);return result;
}
export async function createQuestionCard(q,artURL){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw Error('canvas-unavailable');
 const font=size=>`${size}px system-ui, sans-serif`,width=936;
 ctx.font=font(36);const questionLines=lines(ctx,q.question,width);
 ctx.font=font(29);const options=q.options.map((option,i)=>lines(ctx,'ABCD'[i]+'）'+option,width-44));
 const questionY=q.textOnly?222:694;
 canvas.width=1080;canvas.height=questionY+questionLines.length*51+50+options.reduce((height,value)=>height+value.length*43+24,0)+112;
 ctx.fillStyle='#fff5dc';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.strokeStyle='#243335';ctx.lineWidth=7;ctx.strokeRect(25,25,canvas.width-50,canvas.height-50);
 ctx.fillStyle='#d64b38';ctx.fillRect(63,42,954,62);
 const write=(value,x,y,size,color='#293f53')=>{ctx.font=font(size);ctx.fillStyle=color;ctx.fillText(value,x,y);};
 write('香港百萬富翁 · 考考朋友',72,86,43,'#fff5dc');
 write('含題目、不附答案；想留低驚喜，可以明日再分享。',72,137,25,'#526c74');
 if(!q.textOnly){
  const image=new Image();image.src=artURL;await image.decode();
  // Rasterize the whole SVG first: source-rectangle handling for SVGs without
  // explicit width/height differs between browsers and can otherwise crop empty space.
  const raster=document.createElement('canvas');raster.width=800;raster.height=500;
  const rasterContext=raster.getContext('2d');if(!rasterContext)throw Error('canvas-unavailable');
  rasterContext.drawImage(image,0,0,800,500);
  const iw=raster.width,ih=raster.height;
  const cropWidth=Math.sqrt(iw*ih*.1*(936/430)),cropHeight=cropWidth*430/936;
  const x=Math.max(0,Math.min(iw-cropWidth,(q.focus?.x??50)*iw/100-cropWidth/2));
  const y=Math.max(0,Math.min(ih-cropHeight,(q.focus?.y??50)*ih/100-cropHeight/2));
  ctx.drawImage(raster,x,y,cropWidth,cropHeight,72,190,936,430);
  ctx.strokeStyle='#243335';ctx.lineWidth=4;ctx.strokeRect(72,190,936,430);
  write('原創漫畫局部示意',72,653,23,'#526c74');
 }
 let y=questionY;
 for(const line of questionLines){write(line,72,y,36);y+=51;}
 y+=26;
 for(const option of options){
  const h=option.length*43+14;ctx.fillStyle='#fffaf0';ctx.fillRect(72,y-32,936,h);
  ctx.strokeStyle='#53715a';ctx.lineWidth=2;ctx.strokeRect(72,y-32,936,h);
  for(const line of option){write(line,94,y,29);y+=43;}y+=24;
 }
 write('每日一局，挑戰你嘅香港知識。',72,canvas.height-56,27);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('image-unavailable')),'image/png'));
}
