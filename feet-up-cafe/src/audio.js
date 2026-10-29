// Gesture-unlocked, locally synthesized café ambience; no audio files or autoplay dependency.
export function createAudio() {
  let context, enabled = true, ambience, lastTone = 0, speechAt = -10;
  const get = () => { if (!context) {const Audio=window.AudioContext||window.webkitAudioContext;if(Audio)context=new Audio();}return context; };
  function unlock() {if(!enabled)return;try{const ctx=get();if(ctx?.state==='suspended')ctx.resume().catch(()=>{});}catch{}}
  function tone(frequency,duration=.12,type='sine',volume=.035,slide=0) {
    if(!enabled)return;try{const a=get();if(!a||a.state!=='running')return;const now=a.currentTime;
      if(now-lastTone<.045)return;lastTone=now;
      const o=a.createOscillator(),gain=a.createGain();o.type=type;o.frequency.setValueAtTime(frequency,now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,frequency+slide),now+duration);
      gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(gain);gain.connect(a.destination);o.start(now);o.stop(now+duration+.02);
    }catch{}
  }
  function start() {unlock();stop();if(!enabled)return;ambience=setInterval(()=>tone(Math.random()<.6?660:440,.055,'triangle',.008),1800);}
  function stop() {if(ambience)clearInterval(ambience);ambience=null;try{window.speechSynthesis?.cancel();}catch{}}
  function play(kind,lang) {
    if(!enabled)return;
    const tones={poke:[180,.1,'triangle',.05,130],perfect:[790,.18,'sine',.05,400],splash:[130,.24,'sawtooth',.025,-90],block:[220,.08,'square',.02],incoming:[480,.12,'sine',.05],warning:[480,.12,'sine',.05],eat:[680,.09,'triangle',.04],cramp:[110,.4,'sawtooth',.02,-70],super:[160,.5,'triangle',.06,600],event:[520,.24,'sine',.03,-220],shout:[330,.18,'triangle',.04],roar:[180,.3,'sawtooth',.02,300]};
    tone(...(tones[kind]||tones.poke));
    if((kind==='shout'||kind==='roar'||kind==='incoming')&&performance.now()-speechAt>2500){speechAt=performance.now();try{if('speechSynthesis'in window){const u=new SpeechSynthesisUtterance(lang==='en'?(kind==='roar'?'Lift those fancy shoes!':'Feet up, please!'):(kind==='roar'?'個鞋咁貴就舉高啲啦！':'縮腳呀！唔該！'));u.lang=lang==='en'?'en-GB':'zh-HK';u.rate=1.2;u.volume=.65;const voice=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase()==='zh-hk');if(lang!=='en'&&voice)u.voice=voice;speechSynthesis.speak(u);}}catch{}}
  }
  function set(value){enabled=value;if(!enabled){stop();context?.suspend().catch(()=>{});}else unlock();}
  return {unlock,start,stop,play,set,get enabled(){return enabled;}};
}
