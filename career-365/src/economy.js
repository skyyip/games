// Frozen HKD reference snapshot; role estimates are explicitly separated from observations.
export const SALARY_SOURCES=[
 {id:'industry',title:'香港政府統計處：2025年12月工資及薪金總額按季統計報告，表2.4',period:'2025-12',released:'2026-03-27',url:'https://www.censtatd.gov.hk/wbr/B1050009/B10500092025QQ04/att/en/B10500092025QQ04.pdf',scope:'主管級及以下選定職業的行業平均月薪；不等同每個職位的平均數'},
 {id:'occupation',title:'香港政府統計處：2025年收入及工時按年統計調查，表3.1',period:'2025-05/06',released:'2026-03-23',url:'https://www.censtatd.gov.hk/wbr/B1050014/B10500142025AN25/att/en/B10500142025AN25.pdf',scope:'全職僱員職業組別工資中位數；並非算術平均數'},
];
const REFERENCE={funeral:[24724,'industry','個人服務業平均'],experience:[16500,'occupation','服務及銷售全職中位數'],food:[17995,'industry','餐飲住宿行業平均'],hardware:[18629,'industry','製造業平均'],transport:[26300,'industry','運輸業平均'],commerce:[22372,'industry','進出口批發零售業平均'],finance:[26546,'industry','金融保險業平均'],service:[24724,'industry','個人服務業平均'],trades:[25700,'occupation','工藝及機器操作全職中位數'],nature:[15400,'occupation','非技術全職中位數']};
export function salaryReference(category,name){
 const [reference,source,basis]=REFERENCE[category]??[33000,'occupation','經理／專業及輔助專業全職中位數'];
 // No claim that a source publishes individual averages for all roles.
 return {salary:reference,salaryInfo:{reference,source,basis,kind:'行業／職業組別參考值',estimatedRole:true,note:`${name}使用組別代理值，並非該職位的官方平均月薪。`}};
}
export const ASSET_INFO={
 bank:{name:'銀行定期',icon:'🏦',hint:'每月模擬 +0.2%',minimum:100,fee:0},
 bonds:{name:'國債',icon:'📜',hint:'每月模擬 +0.3%',minimum:100,fee:0},
 stock:{name:'股票',icon:'📈',hint:'虛構新聞與市場波動',minimum:100,fee:0},
 etf:{name:'ETF',icon:'🧺',hint:'分散模擬，仍可下跌',minimum:100,fee:0},
 crypto:{name:'加密貨幣',icon:'🪙',hint:'高波動，沒有保證',minimum:100,fee:0},
 property:{name:'出租房地產持份',icon:'🏘️',hint:'最低 $10,000・買賣各3%成本・租金扣維修後每月0.17%，危機時減租',minimum:10000,fee:.03},
 cards:{name:'Pokémon卡等收藏卡',icon:'🃏',hint:'市場組合估值・每次買賣12%價差／鑑定成本・行情冷卻可大跌',minimum:100,fee:.12},
 derivatives:{name:'三倍市場衍生產品',icon:'📉',hint:'模擬每日重設產品的月度簡化・股票變幅×3，另扣1%耗損；本金可歸零・無額外追繳',minimum:100,fee:.01},
};
export const RISK_ASSETS=['stock','etf','crypto','property','cards','derivatives'];
export const WORLD_EVENTS=[
 {id:'war',title:'地緣衝突：能源與運輸成本上升',stock:-.12,etf:-.07,crypto:-.15,property:-.03,cards:-.1,living:1.15,income:.9,rent:.7,months:4},
 {id:'crash',title:'全球股災：資金撤出高風險市場',stock:-.3,etf:-.2,crypto:-.45,property:-.1,cards:-.25,living:1,income:.85,rent:.8,months:3},
 {id:'disaster',title:'自然災害：社區修復與供應中斷',stock:-.07,etf:-.04,crypto:-.08,property:-.06,cards:-.05,living:1.12,income:.9,rent:.5,months:3},
];
