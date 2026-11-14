// One primary ability per animal. Prices unlock artwork; role power is shared.
export const ABILITIES=Object.freeze({
 prune:{width:8,zh:'剪道',en:'Thorn clearing',descriptionZh:'清走前方兩個落點的荊棘，下一落點加闊8；不防下沉、燈籠魚或失足。',descriptionEn:'Clear thorns from both upcoming pads and widen the next by 8; sinking, fish and falls remain dangerous.'},
 anchor:{width:8,zh:'固橋',en:'Pad anchor',descriptionZh:'加固腳下與前方第一個落點，目標加闊8；只處理下沉，不移除魚燈或荊棘。',descriptionEn:'Stabilize the current and first upcoming pad against sinking and widen the target by 8; fish and thorns remain.'},
 shield:{width:8,zh:'護盾',en:'Fish shield',descriptionZh:'下一跳擋住一次空中燈籠魚，目標加闊8；不防落水、下沉或荊棘。',descriptionEn:'Block one airborne fish on the next hop and widen the target by 8; falls, sinking and thorns still hurt.'},
 double:{width:0,zh:'跨跳',en:'Double hop',descriptionZh:'下一跳瞄準第二個落點，仍需掌握較遠的蓄力；成功只計1跳，不附帶救援或護盾。',descriptionEn:'Aim at the second pad for the next hop; charge for the longer gap. Count one landing, with no rescue or shield.'},
 adjust:{width:0,zh:'微調',en:'Air adjustment',descriptionZh:'下一跳僅在差距超出落腳範圍時修正最多28；差太遠仍落水，修正落地不獲正中心獎勵。',descriptionEn:'On the next hop, correct a miss by up to 28 only outside the landing area. Larger misses still fail; assisted landings earn no centre bonus.'},
 rescue:{width:0,zh:'救援',en:'Rescue leaf',descriptionZh:'預先啟用一次浮葉救援，失足或下沉時接住你；成功跳躍會保留待命，不防魚嘴與荊棘，救援不加分。',descriptionEn:'Arm one rescue from a fall or sinking pad. It waits through successful hops, does not stop fish or thorns, and gives no landing score.'}
});
const roles={
 prune:['frog','cat','hachiware','hitoha','red-warrior','red-sprout','white-sprout'],
 anchor:['penguin','panda','kurimanju','futaba','black-sprout','ice-sprout','stone-dwarf'],
 shield:['otter','mochi','chiikawa','violet-mage','mage-otter','pink-sprout'],
 double:['bunny','monkey','usagi','bloom-bunny','yellow-sprout','dawn-hero'],
 adjust:['duck','fox','momonga','shisa','elf-mage','purple-sprout'],
 rescue:['capybara','rakko','shimajiro','mermaid','blue-sprout','gentle-priest']
};
export const ANIMAL_ROLES=Object.freeze(Object.fromEntries(Object.entries(roles).flatMap(([type,ids])=>ids.map(id=>[id,type]))));
const names={bunny:['棉花跨跳','Cotton leap'],monkey:['藤蔓跨跳','Vine leap'],duck:['鴨鴨微調','Duck steering'],cat:['貓爪剪道','Paw shears'],fox:['狐尾掌舵','Tail steering'],capybara:['淡定浮葉','Calm rescue'],hachiware:['雙爪剪道','Friendship shears'],kurimanju:['栗子固橋','Chestnut anchor'],rakko:['師傅救援','Master rescue'],momonga:['滑翔微調','Gliding adjustment'],shisa:['獅舞穩跳','Shisa steering'],shimajiro:['大叔浮台','Island raft'],mermaid:['人魚救援','Mermaid rescue'],futaba:['雙葉固橋','Twin-leaf anchor'],'elf-mage':['魔法微調','Magic adjustment'],'red-warrior':['勇者剪道','Brave shears'],'blue-sprout':['藍花救援','Blue rescue'],'yellow-sprout':['黃花跨跳','Yellow leap'],'purple-sprout':['紫花微調','Purple steering'],'ice-sprout':['冰花固橋','Frost anchor'],'bloom-bunny':['花耳跨跳','Bloom leap'],'dawn-hero':['勇者遠躍','Hero leap'],'stone-dwarf':['磐石守橋','Stone anchor'],'gentle-priest':['祈願浮葉','Prayer rescue']};
export function skillFor(id){const type=ANIMAL_ROLES[id]??'prune';return {...ABILITIES[type],type,...(names[id]?{skillZh:names[id][0],skillEn:names[id][1]}:{})};}
