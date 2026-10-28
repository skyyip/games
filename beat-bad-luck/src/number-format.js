// Presentation only: scores, income calculations and saved values keep their precision.
const formats=new Map();
export function formatNumber(value,{locale='en',grouping=false}={}){
 const number=Number(value);if(!Number.isFinite(number))return '—';
 const key=locale+':'+grouping;let format=formats.get(key);
 if(!format){format=new Intl.NumberFormat(locale,{useGrouping:grouping,maximumFractionDigits:2});formats.set(key,format);}
 const text=format.format(number);return text==='-0'?'0':text;
}
