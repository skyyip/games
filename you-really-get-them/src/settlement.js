const endings={women:'今晚睡陽台',men:'被兄弟笑一輩子',dog:'遛狗主導權永久易手',cat:'成為貓抓板',duo:'默契小船原地翻側'};

// Rewards are credited once at settlement, never for individual answers.
export function settleRun(hp,faction,companion=null){
  const companionReward=hp>0&&companion?.kind==='bonus'?20:0;
  const survived=hp>0,base=survived?100:0,hpBonus=survived?hp*2:0,medical=survived?0:10;
  let title,quote,certification='';
  if(!survived){
    title='當場社會性死亡';
    quote=`本次慘劇結局：${endings[faction]}。系統發放 10 SC「醫藥費」，請保重。`;
  }else if(hp>=80){
    title=faction==='women'||faction==='cat'?'端水藝術家':'頂級讀心術大師';
    certification='生物學奇蹟';
    quote='高危現場成功生還，獲得「生物學奇蹟」認證。';
  }else if(hp<30){
    title=faction==='women'||faction==='men'?'沙發邊緣試探者':'急救室常客';
    quote='雖然活了下來，但已經遍體鱗傷。系統建議近期保持低調。';
  }else{
    title='有驚無險生還者';
    quote='成功存活，仍有幾個雷區值得覆盤。下次記得先讀空氣，再開口。';
  }
  return {survived,base,hpBonus,medical,companionReward,coins:base+hpBonus+medical+companionReward,title,quote,certification};
}
