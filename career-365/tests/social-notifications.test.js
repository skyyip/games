import test from 'node:test';import assert from 'node:assert/strict';
import {socialNotifications,readNotificationSeen,writeNotificationSeen} from '../src/social-notifications-data.js';
const time=n=>({toMillis:()=>n});
test('only incoming actionable friend requests, offers, referrals and owner applications create notices',()=>{
 const links=[{id:'bob',from:'bob',to:'alice',state:'pending',updatedAt:time(1)},{id:'carol',from:'alice',to:'carol',state:'pending'},{id:'david',from:'david',to:'alice',state:'accepted'},{id:'foreign',from:'bob',to:'carol',state:'pending'}];
 const requests=[{id:'offer',candidate:'alice',parties:['owner','alice'],state:'offered',updatedAt:time(5)},{id:'referral',candidate:'alice',state:'referred',updatedAt:time(4)},{id:'application',candidate:'bob',parties:['alice','bob'],state:'requested',updatedAt:time(3)},{id:'outgoing',candidate:'bob',parties:['alice','bob'],state:'offered'},{id:'my-application',candidate:'alice',parties:['owner','alice'],state:'requested'},{id:'rejected',candidate:'alice',state:'declined'}];
 const rows=socialNotifications('alice',links,requests);assert.deepEqual(rows.map(x=>x.id),['request:offer','request:referral','request:application','friend:bob']);assert.equal(socialNotifications('stranger',links,requests).length,0);assert.equal(socialNotifications('alice',[links[0],links[0]],[]).length,1);
});
test('a re-offered invitation has a different unread version; accepted requests leave the list',()=>{
 const r={id:'same',candidate:'alice',state:'offered',updatedAt:time(1)},first=socialNotifications('alice',[],[r])[0],next=socialNotifications('alice',[],[{...r,updatedAt:time(2)}])[0];assert.equal(first.id,next.id);assert.notEqual(first.key,next.key);assert.equal(socialNotifications('alice',[],[{...r,state:'accepted'}]).length,0);
});
test('read markers are bounded and scoped by the supplied player key, malformed/blocked storage does not throw',()=>{
 const m=new Map(),store={read:k=>m.get(k),write:(k,v)=>m.set(k,v)};writeNotificationSeen(store,'project:alice',new Set(Array.from({length:250},(_,i)=>'item'+i)));assert.equal(readNotificationSeen(store,'project:alice').size,200);assert.equal(readNotificationSeen(store,'project:bob').size,0);m.set('bad','not JSON');assert.equal(readNotificationSeen(store,'bad').size,0);m.set('bad','[1,null,"ok"]');assert.deepEqual([...readNotificationSeen(store,'bad')],['ok']);const broken={read(){throw Error('blocked');},write(){throw Error('blocked');}};assert.equal(readNotificationSeen(broken,'x').size,0);assert.doesNotThrow(()=>writeNotificationSeen(broken,'x',new Set(['one'])));
});
