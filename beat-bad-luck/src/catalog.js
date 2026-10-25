export const WORRIES=[
  {id:'work',label:'The eighth revision',name:'The Overtime Gremlin',icon:'screen'},
  {id:'noise',label:'Office gossip',name:'The Gossip Goblin',icon:'megaphone'},
  {id:'sleep',label:'A restless night',name:'The Sleepless Cloud',icon:'cloud'},
  {id:'stocks',label:'Stocks letting you down',name:'The Stock Market Gremlin',icon:'chart'},
  {id:'teammates',label:'Unhelpful teammates',name:'The Teamwork Gremlin',icon:'screen'},
  {id:'kam-friends',label:'Awkward friends',name:'The Gossip Goblin',icon:'megaphone'},
  {id:'work-life',label:'Work-life imbalance!',name:'The Overtime Gremlin',icon:'screen'},
  {id:'family',label:'Family friction',name:'The Family Fuss',icon:'house'},
  {id:'love',label:'Love feeling unlucky',name:'The Love Worry',icon:'heart'},
  {id:'commute',label:'Another delayed train',name:'The Delay Monster',icon:'train'},
];
export const WEAPONS=[
  {id:'bare-hand',name:'Bare hands',merit:0,cost:0,tone:150,starter:true},
  {id:'flipflop',name:'Blue-and-white flip-flop',merit:0,cost:200,tone:180},
  {id:'paper',name:'Rolled-up newspaper',merit:40,cost:245,tone:260},
  {id:'bag',name:'Red-white-blue bag',merit:80,cost:270,tone:130},
  {id:'stool',name:'Folding metal stool',merit:140,cost:310,tone:620},
  {id:'sword',name:'Peachwood sword',merit:220,cost:350,tone:360},
  {id:'stamp',name:'Jujube-wood seal',merit:320,cost:400,tone:95},
  {id:'mace',name:'Spiked mace',merit:360,cost:440,tone:120},
  {id:'record',name:'Lucky vinyl record',merit:440,cost:460,tone:440},
  {id:'pinwheel',name:'Lucky pinwheel',merit:500,cost:520,tone:540},
  {id:'iron-hammer',name:'Big iron hammer',merit:400,cost:550,tone:85},
  {id:'fortune-child',name:'Fortune-turning child',merit:550,cost:550,tone:760},
  {id:'triple-trio',name:'Jockey Club 3T',merit:5000,cost:6000,multiplier:10,tone:480},
  {id:'marksix-snowball',name:'Mark Six Snowball',merit:6000,cost:6500,multiplier:15,tone:880},
  {id:'rebirth-paper',name:'Rebirth paper: Li Ka-shing’s son',merit:10000,cost:10000,multiplier:20,tone:1040},
];
// Ordinary kits add 1% per oil. The three premium kits use fixed configured bonuses.
export const weaponScoreMultiplier=id=>{const weapon=WEAPONS.find(w=>w.id===id);return weapon?.multiplier??1+(weapon?.cost??0)/100;};
export const MAX_DECOR_LEVEL=5;
export const DECOR=[
  {id:'radio',name:'Cassette radio',cost:1190,rate:1},
  {id:'neon',name:'Retro neon sign',cost:1145,rate:2},
  {id:'incense',name:'Incense stand',cost:1155,rate:3},
  {id:'cat',name:'Waving lucky cat',cost:1165,rate:4},
  {id:'tiger',name:'Guardian tiger',cost:1210,rate:5},
  {id:'aquarium',name:'Wealth-attracting feng shui aquarium',cost:6240,rate:6},
  {id:'three-stars',name:'Fu, Lu and Shou',cost:6270,rate:7},
  {id:'money-tree',name:'Lucky money tree',cost:6300,rate:8},
  {id:'amethyst',name:'Amethyst cluster',cost:6340,rate:9},
];
// Level one earns the base rate; later levels add 0.1 each, without float drift.
export const decorHourlyRate=(decor,level)=>level>0?Math.round((decor.rate+(level-1)*.1)*10)/10:0;
export const FRIENDS=[
  {id:'waiter',name:'The Kind Café Waiter',story:'A warm milk tea appears before you even ask. Some kindness needs no reason.',icon:'☕'},
  {id:'driver',name:'The Punctual Minibus Driver',story:'One seat left, just for you. Today, you get home before the soup goes cold.',icon:'🚐'},
  {id:'neighbour',name:'The Thoughtful Neighbour',story:'An umbrella waits at your door. You do not have to weather every storm alone.',icon:'☂'},
];
export const FORTUNES=[
  'You have done enough for today. Leave a little room for yourself.',
  'A late train is a pause, not a verdict on your day.',
  'You can be kind and still say no.',
  'Not every message needs an answer tonight.',
  'One small step counts. So does taking a breather.',
  'Your worth is bigger than your inbox.',
  'There is still time for a warm meal and a softer evening.',
  'Good company is already on its way. Start by being kind to yourself.',
];
export const CHANTS=[
  'Tap away the overtime. Leave room for a pineapple bun.',
  'Gossip out, good company in.',
  'One little whack. One less worry on your back.',
  'Let the gremlin go. Take your evening back.',
];
