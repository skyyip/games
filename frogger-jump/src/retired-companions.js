// Migration data only. These IDs are no longer purchasable or usable in a run.
import {retiredSkillCredit} from './retired-skills.js';
export const RETIRED_COMPANION_PRICES=Object.freeze({hippo:540,ray:360,crab:200,beaver:260,koi:100,shark:420});
export const RETIRED_PURCHASE_FIELDS=Object.freeze(['ownedSkills','equippedSkill','ownedCompanions','companion']);
export function retiredCompanionCredit(profile){return [...new Set(Array.isArray(profile.ownedCompanions)?profile.ownedCompanions:[])].reduce((sum,id)=>sum+(Object.hasOwn(RETIRED_COMPANION_PRICES,id)?RETIRED_COMPANION_PRICES[id]:0),0);}
export const retiredPurchaseCredit=profile=>retiredSkillCredit(profile)+retiredCompanionCredit(profile);
export const hasRetiredPurchases=profile=>RETIRED_PURCHASE_FIELDS.some(key=>Object.hasOwn(profile,key));
export function withoutRetiredPurchases(profile){return Object.fromEntries(Object.entries(profile).filter(([key])=>!RETIRED_PURCHASE_FIELDS.includes(key)));}
