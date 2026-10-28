import {mkdir,readFile,writeFile} from 'node:fs/promises';

const {chromium}=await import(process.env.GRID_RUSH_PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});
const output=new URL('../assets/icons/',import.meta.url);
const source='data:image/png;base64,'+(await readFile(new URL('../../grid-rush/assets/icons/icon-512.png',import.meta.url))).toString('base64');
try{
 const page=await browser.newPage();
 await mkdir(output,{recursive:true});
 for(const size of [64,180,192,512]){
  const png=await page.evaluate(async({source,size})=>{
   const image=new Image();image.src=source;await image.decode();
   const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
   const context=canvas.getContext('2d');context.scale(size/192,size/192);
   if(size!==64){context.fillStyle='#192e32';context.fillRect(0,0,192,192);}
    context.translate(8,10);context.scale(.92,.92);
   context.drawImage(image,0,0,192,192);
   context.fillStyle='#fff2cf';context.strokeStyle='#26241b';context.lineWidth=3.5;context.lineCap=context.lineJoin='round';
   const horn=new Path2D('M80 36Q86 9 96-8Q106 9 112 36Z');context.fill(horn);context.stroke(horn);
   context.strokeStyle='#b78350';context.lineWidth=2.8;context.stroke(new Path2D('M91 6q5 3 10 0M87 18q9 5 18 0M84 29q12 6 24 0'));
   return canvas.toDataURL('image/png').split(',')[1];
  },{source,size});
  await writeFile(new URL(`website-logo-${size}.png`,output),Buffer.from(png,'base64'));
  console.log(`Website logo: ${size} x ${size}`);
 }
}finally{await browser.close();}