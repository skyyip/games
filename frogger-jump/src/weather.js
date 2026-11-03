// Cosmetic weather has one boundary timer and never consumes the platform RNG.
const randomWeather=()=>globalThis.crypto?.getRandomValues(new Uint32Array(1))[0]/2**32||.5;
export class RiverWeather{
 constructor(root,{now=()=>performance.now(),random=randomWeather,setTimer=(fn,delay)=>setTimeout(fn,delay),clearTimer=id=>clearTimeout(id)}={}){
  Object.assign(this,{root,now,random,setTimer,clearTimer});this.timer=null;this.running=false;this.paused=true;this.phase='clear';this.remaining=0;
 }
 range(min,max){return min+Math.max(0,Math.min(1,this.random()))*(max-min);}
 start(){this.stop();this.running=true;this.remaining=this.range(12000,22000);this.resume();}
 stop(){if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;this.running=false;this.paused=true;this.phase='clear';this.root.dataset.weather='clear';this.root.dataset.active='false';}
 pause(){if(!this.running||this.paused)return;this.remaining=Math.max(0,this.deadline-this.now());if(this.timer!==null)this.clearTimer(this.timer);this.timer=null;this.paused=true;this.root.dataset.active='false';}
 resume(){if(!this.running||!this.paused)return;this.paused=false;this.root.dataset.active='true';this.schedule(this.remaining);}
 schedule(delay){this.remaining=delay;this.deadline=this.now()+delay;this.timer=this.setTimer(()=>{this.timer=null;if(this.running&&!this.paused)this.advance();},delay);}
 advance(){
  let duration;
  if(this.phase==='clear'){this.phase=this.random()<.7?'rain':'sun';duration=this.phase==='rain'?this.range(5000,7000):this.range(5000,8000);}
  else if(this.phase==='rain'){this.phase='rainbow';duration=this.range(4000,6000);}
  else if(this.phase==='rainbow'){this.phase='sun';duration=this.range(4000,7000);}
  else{this.phase='clear';duration=this.range(15000,25000);}
  this.root.dataset.weather=this.phase;this.schedule(duration);
 }
}
