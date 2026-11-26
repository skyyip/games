export const BOND_STAGES=[
 {level:0,at:0,name:'初次拍檔',sticker:''},
 {level:1,at:3,name:'熟悉面孔',sticker:'有啲默契'},
 {level:2,at:10,name:'默契拍檔',sticker:'自己友'},
 {level:3,at:25,name:'生死之交',sticker:'陪你補鑊'}
];
export function bondStage(value=0){
 const count=Number.isSafeInteger(value)&&value>0?value:0;
 const stage=[...BOND_STAGES].reverse().find(stage=>count>=stage.at);
 return {...stage,count,next:BOND_STAGES[stage.level+1]?.at??null};
}
export function advanceProgress(wallet,{completed,companionId}){
 const bonds={...(wallet.bonds||{})};
 if(completed===12&&companionId)bonds[companionId]=(bonds[companionId]||0)+1;
 return {bonds};
}

const bondMessages={
 w:['你今次有聽入耳，我就陪你再試一局。','有啲默契喇，唔使每次都開解釋記者會。','你負責諗，我負責陪你補鑊。'],
 m:['收到，今次有聽完先覆。','我未必識讀心，但會記得先問你需要。','最後一場可以講少啲，答應咗你就做。'],
 d:['本汪開始記得你條散步路。','你有留意我，本汪有記低。','有你喺度，本汪先自己決定行唔行近。'],
 c:['朕准你坐近少少。','你識得等，朕考慮畀你做長期隊友。','今日自願陪你，唔係罐頭合約要求。']
};
export function bondMessage(cardId,count){const stage=bondStage(count);return stage.level?bondMessages[cardId?.[0]]?.[stage.level-1]||'一齊行過幾局，繼續陪你試。':''}
