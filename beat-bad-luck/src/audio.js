import {WEAPONS} from './catalog.js';
export class StallAudio{
 constructor(){this.context=null;this.master=null;this.rain=null;this.enabled=true;this.voice=false;this.chimeAt=0;this.ambienceWanted=false;this.musicTimer=null;this.musicBar=0;this.sources=new Set();this.musicSources=new Set();this.burst=false;this.noiseBuffers=new Map();this.rainBuffer=null;this.lastHitSoundAt=-Infinity;this.primed=false;this.mobileBridge=null;}
 get needsUnlock(){return !this.context||this.context.state!=='running'||Boolean(this.mobileBridge?.paused);}
 preparePlayback(){
  const nav=window.navigator??globalThis.navigator;
  // Safari can otherwise route Web Audio through the silent/ambient channel.
  try{if(nav?.audioSession)nav.audioSession.type='playback';}catch{}
  const ios=/iP(hone|ad|od)/.test(nav?.userAgent??'')||(nav?.platform==='MacIntel'&&nav.maxTouchPoints>1);
  if(!ios||typeof window.Audio!=='function'||this.mobileBridge)return;
  try{
   const bytes=new Uint8Array(8044),view=new DataView(bytes.buffer);const word=(offset,text)=>{for(let i=0;i<text.length;i++)bytes[offset+i]=text.charCodeAt(i);};
   word(0,'RIFF');view.setUint32(4,8036,true);word(8,'WAVE');word(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);view.setUint32(24,8000,true);view.setUint32(28,8000,true);view.setUint16(32,1,true);view.setUint16(34,8,true);word(36,'data');view.setUint32(40,8000,true);bytes.fill(128,44);
   const bridge=new window.Audio('data:audio/wav;base64,'+btoa(String.fromCharCode(...bytes)));bridge.loop=true;bridge.preload='auto';bridge.playsInline=true;bridge.setAttribute('playsinline','');this.mobileBridge=bridge;
  }catch{}
 }
 prime(){const c=this.context;if(this.primed&&c.state==='running')return;const source=this.track(c.createBufferSource());source.buffer=c.createBuffer(1,1,c.sampleRate);source.connect(this.master);source.start(0);source.stop(c.currentTime+1/c.sampleRate);this.primed=true;}
 async unlock(){
  try{
   if(this.context?.state==='closed'){this.clearAmbience();this.clearNotes();this.context=null;this.master=null;this.primed=false;this.noiseBuffers.clear();this.rainBuffer=null;this.lastHitSoundAt=-Infinity;}
   if(this.enabled)this.preparePlayback();
   if(!this.context){this.context=new (window.AudioContext||window.webkitAudioContext)();this.context.addEventListener?.('statechange',()=>{if(this.context.state==='running'){this.syncGain();this.updateAmbience();}else{this.clearAmbience();this.clearNotes();}});}
   if(!this.master){this.master=this.context.createGain();this.master.gain.value=this.enabled?.34:0;const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-14;limiter.knee.value=12;limiter.ratio.value=8;limiter.attack.value=.004;limiter.release.value=.16;this.master.connect(limiter);limiter.connect(this.context.destination);this.limiter=limiter;}
   // All activation-sensitive calls happen in the original touch/click stack.
   const resumed=this.context.resume();if(this.enabled){this.prime();try{const playing=this.mobileBridge?.play();playing?.catch(()=>{});}catch{}}
   await resumed;this.syncGain();this.updateAmbience();return this.context.state==='running';
  }catch{return false;}
 }
 pauseBridge(){try{this.mobileBridge?.pause();}catch{}}

 syncGain(){if(this.master&&this.context){const gain=this.master.gain;gain.cancelScheduledValues(this.context.currentTime);gain.setValueAtTime(this.enabled?.34:0,this.context.currentTime);}}
 track(source){this.sources.add(source);source.onended=()=>{this.sources.delete(source);this.musicSources.delete(source);};return source;}
 clearNotes(){for(const source of this.sources){try{source.stop();}catch{}}this.sources.clear();this.musicSources.clear();}

 tone(frequency,duration=.1,type='sine',volume=.12,delay=0){if(!this.enabled||!this.context||this.context.state!=='running')return;const c=this.context,t=c.currentTime+delay,o=this.track(c.createOscillator()),g=c.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,frequency*.7),t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.006);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.01);return o;}
 noise(duration=.1,volume=.1,filter=1600){if(!this.enabled||!this.context||this.context.state!=='running')return;const c=this.context,seconds=Math.max(.02,Math.round(duration*50)/50);let buffer=this.noiseBuffers.get(seconds);if(!buffer){buffer=c.createBuffer(1,Math.ceil(c.sampleRate*seconds),c.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(1-i/data.length);if(this.noiseBuffers.size>=12)this.noiseBuffers.delete(this.noiseBuffers.keys().next().value);this.noiseBuffers.set(seconds,buffer);}const source=this.track(c.createBufferSource()),f=c.createBiquadFilter(),g=c.createGain();source.buffer=buffer;f.type='lowpass';f.frequency.value=filter;g.gain.value=volume;source.connect(f);f.connect(g);g.connect(this.master);source.start();}

 sweep(from,to,duration=.2,volume=.1,type='triangle',delay=0){if(!this.enabled||!this.context||this.context.state!=='running')return;const c=this.context,t=c.currentTime+delay,o=this.track(c.createOscillator()),g=c.createGain();o.type=type;o.frequency.setValueAtTime(from,t);o.frequency.exponentialRampToValueAtTime(to,t+duration);g.gain.setValueAtTime(.001,t);g.gain.linearRampToValueAtTime(volume,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+duration+.02);}
 hit(weapon,heavy,perfect,power=heavy?4:1){if(!this.enabled||!this.context||this.context.state!=='running'||this.context.currentTime-this.lastHitSoundAt<.045)return;this.lastHitSoundAt=this.context.currentTime;const tone=WEAPONS.find(w=>w.id===weapon)?.tone??180,force=Math.max(.1,Math.min(1,power/9));this.tone(tone,.07+force*.14,'triangle',.1+force*.16);this.noise(.04+force*.12,.06+force*.13,weapon==='paper'?2800:1500);this.sweep(180+force*180,65+force*30,.12+force*.15,.05+force*.09,'triangle',.035);if(force>.45)this.sweep(260,440+force*270,.13,.07,'sine',.15);if(perfect)this.tone(920,.1,'sine',.04,.025);}
 chomp(){this.noise(.08,.14,700);this.tone(210,.12,'triangle',.14,.05);this.sweep(350,110,.28,.12,'triangle',.12);this.tone(620,.15,'sine',.05,.35);}

 chime(){for(const [i,f]of [660,880,1100].entries())this.tone(f,.4,'sine',.07,i*.1);}
 ambience(on){this.ambienceWanted=Boolean(on);this.updateAmbience();}
 clearAmbience(){if(this.rain){try{this.rain.stop();}catch{}this.rain=null;}if(this.musicTimer!==null){clearInterval(this.musicTimer);this.musicTimer=null;}}
 updateAmbience(){
  if(!this.ambienceWanted||!this.enabled||!this.context||this.context.state!=='running'){this.clearAmbience();return;}
  if(this.rain)return;
  const c=this.context;let buffer=this.rainBuffer;if(!buffer){buffer=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.rainBuffer=buffer;}
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=550;gain.gain.value=.027;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();this.rain=source;
  this.playMusicBar();this.musicTimer=setInterval(()=>this.playMusicBar(),this.burst?1200:3600);
 }
 setBurst(active){
  active=Boolean(active);if(this.burst===active)return;this.burst=active;
  // Stop only queued music notes: impact sounds may finish naturally across the transition.
  this.clearAmbience();for(const source of this.musicSources){try{source.stop();}catch{}}this.musicSources.clear();this.updateAmbience();
 }
 playMusicBar(){
  if(!this.enabled||!this.ambienceWanted||this.context?.state!=='running')return;
  const note=(...args)=>{const source=this.tone(...args);if(source)this.musicSources.add(source);};
  if(this.burst){
   // 200 BPM minor-key chase: tight bass pulses, climbing arpeggios and offbeat accents.
   const roots=[146.83,130.81,164.81,138.59],root=roots[this.musicBar++%roots.length];
   for(let i=0;i<8;i++){note(root*[1,1.2,1.5,1.6][i%4],.12,'triangle',.045,i*.15);if(i%2===0)note(72,.11,'sine',.09,i*.15);else note(root*2,.045,'square',.008,i*.15);}
   note(root/2,.9,'triangle',.023);return;
  }
  const melodies=[[392,440,523.25,440],[349.23,392,440,329.63],[329.63,392,493.88,440],[293.66,349.23,392,293.66]],notes=melodies[this.musicBar++%melodies.length];
  for(const [index,frequency]of notes.entries())note(frequency,.7,'sine',.026,index*.9);
  note(notes[0]/2,2.8,'triangle',.014);
 }

 speak(text,language){if(!this.voice||!this.enabled||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang=language==='zh-Hant'?'zh-HK':'en-GB';const voices=speechSynthesis.getVoices();const voice=voices.find(v=>language==='zh-Hant'?/zh[-_]HK|yue/i.test(v.lang):/^en[-_]GB/i.test(v.lang));if(voice)utterance.voice=voice;utterance.rate=.95;utterance.pitch=1.04;speechSynthesis.speak(utterance);}catch{}}
 setEnabled(value){this.enabled=Boolean(value);this.syncGain();if(!this.enabled){this.clearNotes();this.pauseBridge();try{speechSynthesis.cancel();}catch{}}this.updateAmbience();}
 stop(){this.burst=false;this.ambience(false);this.clearNotes();this.pauseBridge();try{speechSynthesis.cancel();}catch{}this.context?.suspend().catch(()=>{});}
}
