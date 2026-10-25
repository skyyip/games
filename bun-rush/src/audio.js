// Reuse the tested mobile playback transport; island sounds have no stall logic.
import {StallAudio} from '../../beat-bad-luck/src/audio.js';
export class IslandAudio extends StallAudio{
 updateAmbience(){
  if(!this.ambienceWanted||!this.enabled||this.context?.state!=='running'){this.clearAmbience();return;}if(this.rain)return;
  const c=this.context,length=c.sampleRate*4,buffer=c.createBuffer(1,length,c.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<length;i++)data[i]=(Math.random()*2-1)*(.2+.8*Math.sin(Math.PI*i/length)**2);
  const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=buffer;source.loop=true;filter.type='lowpass';filter.frequency.value=480;gain.gain.value=.075;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();this.rain=source;this.musicTimer=setInterval(()=>this.horn(),20000);
 }
 bun(points){this.tone(points===2?880:660,.17,'sine',.15);this.tone(points===2?1100:880,.23,'sine',.075,.08);}
 step(){this.noise(.035,.025,950);this.tone(120,.04,'triangle',.025);}
 horn(){this.tone(220,1.6,'sine',.035);this.tone(293.66,1.5,'sine',.02,.05);}
 smile(){this.sweep(420,660,.18,.07,'sine');}
}
