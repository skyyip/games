// Retry reads only: a failed response must never replay a payment or an answer.
export async function readServer(c,ref){
 for(let attempt=0;;attempt++){
  try{return await c.getDocFromServer(ref);}
  catch(error){
   const code=String(error?.code??'').replace(/^firestore\//,'');
   if(attempt>=2||!['unavailable','deadline-exceeded'].includes(code))throw error;
   await new Promise(resolve=>setTimeout(resolve,attempt===0?250:750));
  }
 }
}
