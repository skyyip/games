import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {firebaseSDKSource} from './fixtures/firebase-sdk.mjs';

let fixtureId=0;
function deferred(){let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no});return {promise,resolve,reject}}
const profile=(data={playerName:'玩家甲',favoriteCards:['w_1']})=>({exists:()=>true,data:()=>data});
const flush=()=>new Promise(resolve=>setImmediate(resolve));
async function loadCloud(t,{user=null,readProfile=async()=>profile(),...extra}={}){
  const state={calls:[],reads:[],writes:[],restore:()=>user,readProfile,...extra};
  globalThis.__yrgtFirebase=state;
  const id=++fixtureId;
  const sdkURL=`data:text/javascript,${encodeURIComponent(firebaseSDKSource)}#${id}`;
  const hook=registerHooks({resolve(specifier,context,next){
    if(specifier.startsWith('https://www.gstatic.com/firebasejs/'))return {url:sdkURL,shortCircuit:true};
    return next(specifier,context);
  }});
  t.after(()=>{hook.deregister();delete globalThis.__yrgtFirebase});
  const cloud=await import(`../src/firebase/cloud.js?auth-test=${id}`);
  return {state,cloud};
}

test('restored identity enables login state while the cloud profile is still pending',async t=>{
  const pending=deferred(),user={uid:'saved-user',displayName:'Saved Player'};
  const {state,cloud}=await loadCloud(t,{user,readProfile:()=>pending.promise});
  const changes=[];
  assert.deepEqual(await cloud.initCloud((...args)=>changes.push(args)),{ready:true,user});
  assert.equal(cloud.getCloudUser(),user);
  assert.equal(changes.length,1);
  assert.equal(changes[0][2].profileLoaded,false);
  assert.deepEqual(state.options.persistence.map(p=>p.type),['LOCAL','SESSION']);
  assert.equal(state.options.popupRedirectResolver,undefined);
  assert.deepEqual(state.writes,[]);
  pending.resolve(profile());await flush();
  assert.equal(changes[1][2].profileLoaded,true);
  assert.equal(cloud.getCloudPlayerName(),'玩家甲');
});

test('Google uses an explicit popup resolver and preserves persistence after reload',async t=>{
  let persisted=null;
  const {state,cloud}=await loadCloud(t,{restore:()=>persisted,persist:user=>{persisted=user}});
  await cloud.initCloud();
  const {user}=await cloud.signInGoogle();await flush();
  assert.equal(state.calls[0].kind,'signIn');
  assert.equal(state.calls[0].resolver.name,'browserPopupRedirectResolver');
  assert.deepEqual(state.calls[0].parameters,{prompt:'select_account'});
  assert.equal(persisted.uid,user.uid);
  // A fresh production module / Auth instance restores the saved identity.
  const {cloud:reloaded}=await loadCloud(t,{restore:()=>persisted});
  assert.equal((await reloaded.initCloud()).user.uid,user.uid);
});

test('anonymous Google upgrade links the original uid instead of creating another account',async t=>{
  const guest={uid:'anonymous-id',isAnonymous:true};
  const {state,cloud}=await loadCloud(t,{user:guest});
  await cloud.initCloud();
  const result=await cloud.signInGoogle();await flush();
  assert.equal(state.calls[0].kind,'link');
  assert.equal(state.calls[0].user.uid,'anonymous-id');
  assert.equal(result.user.uid,'anonymous-id');
  assert.equal(cloud.getCloudUser().isAnonymous,false);
});

for(const code of ['auth/popup-blocked','auth/popup-closed-by-user'])test(`${code} remains retryable without navigating away`,async t=>{
  const {state,cloud}=await loadCloud(t,{popupError:code});
  await cloud.initCloud();
  await assert.rejects(cloud.signInGoogle(),{code});
  assert.equal(cloud.getCloudUser(),null);
  state.popupError=null;
  assert.equal((await cloud.signInGoogle()).user.uid,'google-player');
});

test('unavailable Firestore keeps a restored user signed in without claiming profile success',async t=>{
  const pending=deferred(),user={uid:'saved-user'};
  const {cloud,state}=await loadCloud(t,{user,readProfile:()=>pending.promise});
  const changes=[];await cloud.initCloud((...args)=>changes.push(args));
  pending.reject(Error('unavailable'));await flush();
  assert.equal(cloud.getCloudUser().uid,user.uid);
  assert.equal(changes.at(-1)[2].profileLoaded,false);
  assert.equal(changes.at(-1)[2].profileError.message,'unavailable');
  assert.deepEqual(state.writes,[]);
});

test('late profile reads cannot restore another account name or create its profile after logout',async t=>{
  const first=deferred(),second=deferred();
  const {state,cloud}=await loadCloud(t,{user:{uid:'first'},readProfile:ref=>ref==='users/first'?first.promise:second.promise});
  const changes=[];await cloud.initCloud((...args)=>changes.push(args));
  state.emit({uid:'second'});
  second.resolve(profile({playerName:'玩家乙'}));await flush();
  first.resolve(profile({playerName:'過期名稱'}));await flush();
  assert.equal(cloud.getCloudPlayerName(),'玩家乙');
  assert.equal(changes.at(-1)[0].uid,'second');
  const missing=deferred();state.readProfile=()=>missing.promise;
  state.emit({uid:'third'});await cloud.signOutGoogle();
  missing.resolve({exists:()=>false});await flush();
  assert.equal(cloud.getCloudUser(),null);
  assert.equal(cloud.getCloudPlayerName(),'');
  assert.deepEqual(state.writes,[]);
});

test('a pending new-profile write cannot delay the restored identity',async t=>{
  const pending=deferred();
  const {cloud,state}=await loadCloud(t,{user:{uid:'new-user'},readProfile:async()=>({exists:()=>false}),writeProfile:()=>pending.promise});
  const changes=[];await cloud.initCloud((...args)=>changes.push(args));await flush();
  assert.equal(cloud.getCloudUser().uid,'new-user');
  assert.equal(changes.length,1);
  assert.equal(state.writes[0].ref,'users/new-user');
  pending.resolve();await flush();
  assert.equal(changes[1][2].profileLoaded,true);
});
