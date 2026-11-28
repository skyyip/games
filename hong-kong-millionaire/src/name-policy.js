// Three calendar months in Hong Kong; clamp dates such as January 31 to April 30.
export function nextNameChange(value){
 const ms=value?.toMillis?.()??value;if(!Number.isFinite(ms))return 0;
 const hk=new Date(ms+28800000),month=hk.getUTCMonth()+3,year=hk.getUTCFullYear()+Math.floor(month/12),target=month%12;
 return Date.UTC(year,target,Math.min(hk.getUTCDate(),new Date(Date.UTC(year,target+1,0)).getUTCDate()),hk.getUTCHours(),hk.getUTCMinutes(),hk.getUTCSeconds(),hk.getUTCMilliseconds())-28800000;
}
