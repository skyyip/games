// 50 random bits; the database transaction reserves the code uniquely.
const alphabet='23456789abcdefghijkmnpqrstuvwxyz';
export function createPlayerHandle(crypto=globalThis.crypto){
 if(typeof crypto?.getRandomValues!=='function')throw Error('handle-unavailable');
 const bytes=new Uint8Array(10);crypto.getRandomValues(bytes);
 return 'p_'+Array.from(bytes,b=>alphabet[b&31]).join('');
}
