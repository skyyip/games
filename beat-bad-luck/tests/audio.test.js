import test from 'node:test';
import assert from 'node:assert/strict';
import {StallAudio} from '../src/audio.js';
class Param{constructor(){this.value=0;}setValueAtTime(value){this.value=value;}cancelScheduledValues(){}exponentialRampToValueAtTime(){}linearRampToValueAtTime(){}}
class AudioNode{constructor(){this.gain=new Param();this.frequency=new Param();this.threshold=new Param();this.knee=new Param();this.ratio=new Param();this.attack=new Param();this.release=new Param();this.stopped=false;}connect(){}start(){}stop(at){if(at!==undefined)return;this.stopped=true;this.onended?.();}}
class Context{constructor(){this.state='suspended';this.sampleRate=32;this.currentTime=0;this.destination={};}async resume(){this.state='running';}async suspend(){this.state='suspended';}createGain(){return new AudioNode();}createDynamicsCompressor(){return new AudioNode();}createOscillator(){return new AudioNode();}createBiquadFilter(){return new AudioNode();}createBufferSource(){return new AudioNode();}createBuffer(channels,size){return {getChannelData:()=>new Float32Array(size)};}}
function setup(t,AudioContext=Context){const timers=new Set();t.mock.method(globalThis,'setInterval',()=>{const id={};timers.add(id);return id;});t.mock.method(globalThis,'clearInterval',id=>timers.delete(id));const previous=Object.getOwnPropertyDescriptor(globalThis,'window');Object.defineProperty(globalThis,'window',{value:{AudioContext},configurable:true});t.after(()=>{if(previous)Object.defineProperty(globalThis,'window',previous);else delete globalThis.window;});return timers;}
test('sound defaults on, a gesture unlocks one music loop, and repeated unlocks never stack loops',async t=>{
 const timers=setup(t),audio=new StallAudio();assert.equal(audio.enabled,true);assert.equal(audio.context,null);audio.ambience(true);assert.equal(audio.rain,null);
 assert.equal(await audio.unlock(),true);assert.equal(audio.context.state,'running');assert.ok(audio.rain);assert.equal(timers.size,1);const rain=audio.rain,bar=audio.musicBar;
 await audio.unlock();audio.ambience(true);assert.equal(audio.rain,rain);assert.equal(audio.musicBar,bar);assert.equal(timers.size,1);audio.stop();assert.equal(timers.size,0);
});
test('mute stops music and scheduled effects immediately; unmute and pause/resume work repeatedly',async t=>{
 const timers=setup(t),audio=new StallAudio();await audio.unlock();audio.ambience(true);audio.hit('paper',true,true);const old=[...audio.sources];assert.ok(old.length>5);
 audio.setEnabled(false);assert.equal(audio.master.gain.value,0);assert.equal(timers.size,0);assert.equal(audio.rain,null);assert.ok(old.every(n=>n.stopped));assert.equal(audio.sources.size,0);
 audio.setEnabled(true);assert.ok(audio.rain);assert.equal(timers.size,1);assert.equal(audio.master.gain.value,.34);audio.stop();assert.equal(audio.context.state,'suspended');assert.equal(timers.size,0);
 await audio.unlock();audio.ambience(true);assert.ok(audio.rain);assert.equal(timers.size,1);audio.stop();
});
test('muting before context creation or during a pending unlock stays silent',async t=>{
 let release;class DelayedContext extends Context{resume(){return new Promise(resolve=>{release=()=>{this.state='running';resolve();};});}}
 const timers=setup(t,DelayedContext),audio=new StallAudio();audio.setEnabled(false);audio.ambience(true);const unlock=audio.unlock();assert.equal(audio.master.gain.value,0);audio.setEnabled(true);audio.setEnabled(false);release();await unlock;
 assert.equal(audio.enabled,false);assert.equal(audio.master.gain.value,0);assert.equal(audio.rain,null);assert.equal(timers.size,0);audio.stop();
});
test('an autoplay restriction preserves the on preference and can be retried on the next gesture',async t=>{
 let denied=true;class RestrictedContext extends Context{async resume(){if(denied)throw new Error('gesture required');this.state='running';}}
 const timers=setup(t,RestrictedContext),audio=new StallAudio();audio.ambience(true);assert.equal(await audio.unlock(),false);assert.equal(audio.enabled,true);assert.equal(timers.size,0);denied=false;assert.equal(await audio.unlock(),true);assert.ok(audio.rain);assert.equal(timers.size,1);audio.stop();
});

test('iPhone playback primes Web Audio and the silent media route synchronously, respecting mute and pause',async t=>{
 const timers=setup(t);let active=true,played=0,started=0;const nav={userAgent:'iPhone',audioSession:{type:'auto'}},media=[];
 class MobileContext extends Context{resume(){assert.equal(active,true);this.state='running';return Promise.resolve();}createBufferSource(){const node=super.createBufferSource();node.start=()=>{assert.equal(active,true);started++;};return node;}}
 class Media{constructor(src){this.src=src;this.paused=true;media.push(this);}setAttribute(){}play(){assert.equal(active,true);this.paused=false;played++;return Promise.resolve();}pause(){this.paused=true;}}
 window.navigator=nav;window.Audio=Media;window.AudioContext=MobileContext;const audio=new StallAudio();
 const pending=audio.unlock();assert.ok(started>0);assert.equal(played,1);assert.equal(nav.audioSession.type,'playback');active=false;await pending;
 assert.equal(audio.needsUnlock,false);assert.equal(media[0].loop,true);assert.equal(media[0].playsInline,true);const data=Buffer.from(media[0].src.split(',')[1],'base64');assert.equal(data.toString('ascii',0,4),'RIFF');assert.equal(data.readUInt32LE(40),8000);assert.ok([...data.subarray(44)].every(n=>n===128));
 audio.setEnabled(false);assert.equal(media[0].paused,true);assert.equal(timers.size,0);audio.setEnabled(true);active=true;await audio.unlock();assert.equal(played,2);assert.equal(media.length,1);audio.stop();assert.equal(media[0].paused,true);
});
test('an interrupted or closed mobile context can recover on a later gesture without stale loops',async t=>{
 const timers=setup(t);class Interruptible extends Context{addEventListener(name,handler){this.changed=handler;}}
 window.AudioContext=Interruptible;const audio=new StallAudio();await audio.unlock();audio.ambience(true);const original=audio.context;assert.equal(timers.size,1);
 original.state='interrupted';original.changed();assert.equal(audio.rain,null);assert.equal(timers.size,0);assert.equal(audio.needsUnlock,true);await audio.unlock();assert.equal(audio.context,original);assert.equal(timers.size,1);
 original.state='closed';await audio.unlock();assert.notEqual(audio.context,original);assert.equal(timers.size,1);audio.stop();
});
