export const WISHES=Object.freeze([
 {id:'on-time',name:'Leave on time bun',stamp:'收工',points:1,color:'#c47860'},
 {id:'no-ot',name:'No more OT bun',stamp:'拒OT',points:1,color:'#af7866'},
 {id:'no-overthinking',name:'No overthinking bun',stamp:'自在',points:1,color:'#b77775'},
 {id:'sleep-in',name:'Wake up naturally bun',stamp:'好眠',points:1,color:'#9a7f99'},
 {id:'good-health',name:'All-green health bun',stamp:'健康',points:2,color:'#638f72'},
 {id:'lucky-streak',name:'A lucky streak bun',stamp:'行運',points:2,color:'#bc914c'},
 {id:'happy-days',name:'Happy days bun',stamp:'開心',points:2,color:'#c27e78'},
 {id:'carefree',name:'Carefree bun',stamp:'無憂',points:2,color:'#698f9b'},
].map(Object.freeze));
export const ACTORS=Object.freeze([
 {id:'apprentice',name:'The island apprentice',cost:0,laughs:0,color:'#729c96'},
 {id:'overtime-hero',name:'The ten-screen overtime superhero',cost:45,laughs:2,color:'#cc886e'},
 {id:'inbox-ninja',name:'The inbox ninja',cost:70,laughs:3,color:'#918ba9'},
 {id:'slow-captain',name:'Captain Slow Life',cost:90,laughs:4,color:'#81a6ad'},
 {id:'health-guardian',name:'The all-green guardian',cost:120,laughs:5,color:'#90ac77'},
].map(Object.freeze));
export const PROPS=Object.freeze([
 {id:'bun-flag',name:'Little peace-bun flag',cost:0,laughs:0},
 {id:'screen-cape',name:'Ten-screen cape',cost:20,laughs:1},
 {id:'no-ot-banner',name:'Off-duty banner',cost:35,laughs:2},
 {id:'sleepy-cloud',name:'Sleep-in cloud',cost:50,laughs:3},
 {id:'bun-crown',name:'Golden peace-bun crown',cost:65,laughs:4},
].map(Object.freeze));
export const PARADE_PIECES=[...ACTORS.map(x=>({...x,kind:'actor'})),...PROPS.map(x=>({...x,kind:'prop'}))];
export const FORTUNES=[
 'A little higher. A little lighter. Dinner is still on time.',
 'Your pace belongs to you. Take the sea breeze home.',
 'One peaceful bun is already a good reason to smile.',
 'There is room for good luck, good rest and a warm meal.',
];
