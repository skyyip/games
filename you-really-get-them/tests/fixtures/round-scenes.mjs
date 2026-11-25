import {BANK,AIR_BANK,MIXED_BANK} from '../../src/questions.js';
import {PICTURE_BANK} from '../../src/picture-questions.js';
import {STORY_ARCS,MESSAGE_SCENES} from '../../src/story-events.js';
export function playableScenes(faction){
 const factions=faction?[faction]:['women','men','dog','cat','duo'];
 return factions.flatMap(f=>[...BANK[f],...AIR_BANK[f],...MIXED_BANK[f],...PICTURE_BANK[f],...(STORY_ARCS[f]?[STORY_ARCS[f].setup,...STORY_ARCS[f].followUps,MESSAGE_SCENES[f]]:[])]);
}
export const findPlayableQuestion=(text,faction)=>playableScenes(faction).find(q=>q.text===text);
