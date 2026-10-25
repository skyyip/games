import {WEAPONS} from './catalog.js';
export class StallAudio{
 constructor(){this.context=null;this.master=null;this.rain=null;this.enabled=true;this.voice=false;this.chimeAt=0;this.ambienceWanted=false;this.musicTimer=null;this.musicBar=0;this.sources=new Set();}
 async unlock(){
  try{
   this.context??=new (window.AudioContext||window.webkitAudioContext)();
   if(!this.master){this.master=this.context.createGain();this.master.gain.value=this.enabled?.34:0;const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=12;limiter.ratio.value=8;limiter.attack.value=.004;limiter.release.value=.16;this.master.connect(limiter);limiter.connect(this.context.destination);this.limiter=limiter;}
   await this.context.resume();this.syncGain();this.updateAmbience();return true;
  }catch{return false;}
 }
 syncGain(){if(this.master&&this.context){const gain=this.master.gain;gain.cancelScheduledValues(this.context.currentTime);gain.setValueAtTime(this.enabled?.34:0,this.context.currentTime);}}
 track(source){this.sources.add(source);source.onended=()=>this.sources.delete(source);return source;}
 clearNotes(){for(const source of this.sources){try{source.stop();}catch{}}this.sources.clear();}

 tone(frequency,duration=.1,type='sine',volume=.12,delay=0){if(!this.enabled||!this.context||this.context.state!=='running')return;const c=this.context,t=c.currentTime+delay,o=this.track(c.createOscillator()),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,frequency*.7),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.01);}
 noise(duration=.1,volume=.1,filter=1600){if(!this.enabled||!this.context||this.context.state!=='running')return;const c=this.context,buffer=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);const s=this.track(c.createBufferSource()),f=c.createBiquadFilter(),g=c.createGain();s.buffer=buffer;f.type='lowpass';f.frequency.value=filter;g.gain.value=volume;s.connect(f);f.connect(g);g.connect(this.master);s.start();}
 sweep(from,to,duration=.2,volume=.1,type='triangle',delay=0){if(!this.enabled||!this.context||this.context.state!=='running')return;const c=this.context,t=c.currentTime+delay,o=this.track(c.createOscillator()),g=c.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);}
 hit(weapon,heavy,perfect,power=heavy?4:1){const tone=WEAPONS.find(w=>w.id===weapon)?.tone??180,force=Math.max(.1,Math.min(1,power/9));this.tone(tone,.07+force*.14,'triangle',.1+force*.16);this.noise(.04+force*.12,.06+force*.13,weapon==='paper'?2800:1500);this.sweep(180+force*180,65+force*30,.12+force*.15,.05+force*.09,'triangle',.035);if(force>.45)this.sweep(260,440+force*270,.13,.07,'sine',.15);if(perfect)this.tone(920,.1,'sine',.04,.025);}
 chomp(){this.noise(.08,.14,700);this.tone(210,.12,'triangle',.14,.05);this.sweep(350,110,.28,.12,'triangle',.12);this.tone(620,.15,'sine',.05,.35);}

 chime(){for(const [i,f]of [660,880,1100].entries())this.tone(f,.4,'sine',.07,i*.1);}
 ambience(on){this.ambienceWanted=Boolean(on);this.updateAmbience();}
 clearAmbience(){if(this.rain){try{this.rain.stop();}catch{}this.rain=null;}if(this.musicTimer!==null){clearInterval(this.musicTimer);this.musicTimer=null;}}
 updateAmbience(){
  if(!this.ambienceWanted||!this.enabled||!this.context||this.context.state!=='running'){this.clearAmbience();return;}
  if(this.rain)return;
  const c=this.context,buffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=550;gain.gain.value=.027;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();this.rain=source;
  this.playMusicBar();this.musicTimer=setInterval(()=>this.playMusicBar(),3600);
 }
 playMusicBar(){
  if(!this.enabled||!this.ambienceWanted||this.context?.state!=='running')return;
  const melodies=[[392,440,523.25,440],[349.23,392,440,329.63],[329.63,392,493.88,440],[293.66,349.23,392,293.66]],notes=melodies[this.musicBar++%melodies.length];
  for(const [index,note]of notes.entries())this.tone(note,.7,'sine',.026,index*.9);
  this.tone(notes[0]/2,2.8,'triangle',.014);
 }

 speak(text,language){if(!this.voice||!this.enabled||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=language==='zh-Hant'?'zh-HK':'en-GB';const voices=speechSynthesis.getVoices();const voice=voices.find(v=>language==='zh-Hant'?/zh[-_]HK|yue/i.test(v.lang):/^en[-_]GB/i.test(v.lang));if(voice)utterance.voice=voice;utterance.rate=.95;utterance.pitch=1.04;speechSynthesis.speak(utterance);}catch{}}
 setEnabled(value){this.enabled=Boolean(value);this.syncGain();if(!this.enabled){this.clearNotes();try{speechSynthesis.cancel();}catch{}}this.updateAmbience();}
 stop(){this.ambience(false);this.clearNotes();try{speechSynthesis.cancel();}catch{}this.context?.suspend().catch(()=>{});}
}
