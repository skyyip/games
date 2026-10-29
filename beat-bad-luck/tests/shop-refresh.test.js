import test from 'node:test';import assert from 'node:assert/strict';
import {fresh,buyWeapon,buySkin,upgrade,purchasePrice,bestPurchasePrice,couponChoices,selectedCoupon,readProgress,DECOR_LIFETIME} from '../src/progress.js';
import {CINEMA_DECOR,CINEMA_TITLES,CINEMA_SECRET_KITS,CINEMA_SECRET_DECOR} from '../src/cinema-expansion.js';
import {SECRET_WEAPONS,SECRET_DECOR} from '../src/ritual-rewards.js';import {DECOR} from '../src/catalog.js';import {skinArt} from '../src/skins.js';
import {finishNeighbourhood,freshNeighbourhood} from '../src/neighbourhood.js';import {createBackup,parseBackup} from '../src/backup.js';
const weak={patron:'bun-aunt',discount:.05,uses:1},strong={patron:'star-master',discount:.15,uses:1};
const initial=()=>({...fresh(0),coins:10000,merit:10000,coupons:[weak,strong]});
test('no coupon is the default for paper, kit and decor purchases; all tickets are retained',()=>{
 for(const buy of [s=>buySkin(s,'duck'),s=>buyWeapon(s,'flipflop'),s=>upgrade(s,'neon',0)]){const s=initial(),n=buy(s);assert(n);assert.deepEqual(n.coupons,[weak,strong]);}
 const s=initial();assert.equal(purchasePrice(s,200),200);assert.equal(bestPurchasePrice(s,200),170);assert.equal(buyWeapon(s,'flipflop').coins,9800);
});
test('the player can choose a weaker ticket while saving the stronger one; the displayed quote is the charge',()=>{
 const s=initial(),ticket=couponChoices(s)[0],quote=purchasePrice(s,245,ticket),n=buyWeapon(s,'paper',{coupon:ticket});assert.equal(quote,233);assert.equal(s.coins-n.coins,quote);assert.deepEqual(n.coupons,[strong]);assert.deepEqual(s.coupons,[weak,strong]);
});
test('the selected discount applies to new paper and decor upgrades and consumes exactly that ticket',()=>{
 for(const [base,buy]of [[1120,(s,c)=>buySkin(s,'duck',{coupon:c})],[845,(s,c)=>upgrade(s,'neon',0,{coupon:c})]]){const s=initial(),c=couponChoices(s)[1],n=buy(s,c);assert.equal(s.coins-n.coins,Math.ceil(base*.85));assert.deepEqual(n.coupons,[weak]);}
});
test('stale, altered or missing tickets reject the purchase without substituting another coupon',()=>{
 const s=initial(),c=couponChoices(s)[1];for(const bad of [{...c,index:9},{...c,discount:.05},{...c,patron:'missing'}]){assert.equal(selectedCoupon(s,bad),null);assert.equal(buySkin(s,'duck',{coupon:bad}),null);assert.equal(buyWeapon(s,'paper',{coupon:bad}),null);assert.equal(upgrade(s,'neon',0,{coupon:bad}),null);}assert.equal(buyWeapon({...s,coupons:[strong]},'paper',{coupon:c}),null);
});
test('failed purchases and free re-equipping never consume a selected ticket',()=>{
 const s=initial(),coupon=couponChoices(s)[1];assert.equal(buyWeapon({...s,coins:0},'paper',{coupon}),null);assert.equal(buyWeapon({...s,merit:0},'paper',{coupon}),null);assert.deepEqual(buyWeapon(s,'bare-hand',{coupon}).coupons,s.coupons);assert.deepEqual(s.coupons,[weak,strong]);
});
test('new cinema props and hidden finds survive save and backup with levels, titles and altar order',()=>{
 let s=initial();for(const item of CINEMA_DECOR){const d=DECOR.find(d=>d.id===item.id);assert.equal(d.cost,item.cost-300);assert.equal(d.rate,Math.round(item.rate*.32*1e6)/1e6);assert.match(skinArt('paper'),/paper-head/);s.decor[item.id]=2;s.decorExpires[item.id]=DECOR_LIFETIME;}
 s.altarDecor=CINEMA_DECOR.slice(0,5).map(i=>i.id);s.discovered=[...CINEMA_SECRET_KITS,...CINEMA_SECRET_DECOR].map(i=>i[0]);s.neighbourhood.challenges=CINEMA_TITLES.map(i=>i.id);s.neighbourhood.title=CINEMA_TITLES[0].id;
 for(const copy of [readProgress(JSON.stringify(s),0),parseBackup(createBackup(s,0),0)]){assert.deepEqual(copy.altarDecor,s.altarDecor);assert.deepEqual(copy.discovered,s.discovered);assert.deepEqual(copy.neighbourhood.challenges,s.neighbourhood.challenges);assert.equal(copy.neighbourhood.title,s.neighbourhood.title);}assert.equal(SECRET_WEAPONS.length+SECRET_DECOR.length,42);
});
test('each new cinema title has a reachable specific challenge and does not unlock from an empty ritual',()=>{
 const base={score:100,hits:0,weapon:'bare-hand',kind:'work',moves:{},fed:false,blessed:false};const cases={
 'cinema-chef':{moves:{heavy:12},fed:true},'cinema-landlady':{perfect:25},'cinema-agent':{weapon:'pork-cleaver',hits:30},
 'cinema-scholar':{moves:{tap:1,heavy:1,rub:1,circle:1,pinch:1},bestCombo:50},'cinema-moonlight':{moves:{circle:12}},'cinema-court':{bestCombo:88},'cinema-prank':{moves:{rub:12,pinch:6}},'cinema-kungfu':{hits:100,fed:true,blessed:true}};
 for(const title of CINEMA_TITLES){const out=finishNeighbourhood(freshNeighbourhood(),{...base,...cases[title.id]},{id:title.id,now:1});assert(out.earned.includes(title.id),title.id);const empty=finishNeighbourhood(freshNeighbourhood(),base,{id:'empty-'+title.id,now:1});assert(!empty.earned.includes(title.id),title.id);}
});
test('paid paper art is distinct while the free paper keeps its ordinary mascot and all combat face hooks',()=>{
 assert.notEqual(skinArt('paper'),skinArt('plain'));for(const id of ['paper','plain'])for(const hook of ['paper-head','paper-arm-left','paper-leg-right','paper-cry-face','paper-neutral-face'])assert(skinArt(id).includes(hook));
});
