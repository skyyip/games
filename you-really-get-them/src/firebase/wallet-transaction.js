import {CARDS} from '../gacha.js';
import {normalizeCards} from '../wallet-model.js';
// Strict create-only receipts may be denied before a stale Firestore transaction
// receives ABORTED. Re-read the receipt and retry from fresh balances, never replay a debit.
export async function walletTransaction({fs,db,uid,id,kind,assertOwner=()=>{}},commit){
 const walletRef=fs.doc(db,'users',uid,'wallet','main'),opRef=fs.doc(db,'users',uid,'walletOps',id),profileRef=fs.doc(db,'users',uid);
 const replay=(wallet,operation,profile)=>{
  if(operation.kind!==kind)throw Error('流水類型不符，沒有改動SC。');
  return {wallet,operation,cards:normalizeCards(profile?.favoriteCards||[]),...(kind==='draw'?{card:CARDS.find(card=>card.id===operation.cardId),duplicate:operation.duplicate}:{}),applied:false};
 };
 for(let attempt=0;attempt<5;attempt++){
  let revision=-1;
  try{
   return await fs.runTransaction(db,async tx=>{
    const [walletSnap,opSnap,profileSnap]=await Promise.all([tx.get(walletRef),tx.get(opRef),tx.get(profileRef)]);assertOwner();
    if(!walletSnap.exists())throw Error('帳戶SC尚未準備，操作會保留待核對。');
    const wallet=walletSnap.data(),profile=profileSnap.exists()?profileSnap.data():{};revision=wallet.revision;
    if(opSnap.exists())return replay(wallet,opSnap.data(),profile);
    return commit(tx,{walletRef,opRef,profileRef,wallet,profile});
   });
  }catch(error){
   assertOwner();if(revision<0||!['permission-denied','aborted'].includes(error.code))throw error;
   let fresh;
   try{fresh=await Promise.all([fs.getDocFromServer(walletRef),fs.getDocFromServer(opRef),fs.getDocFromServer(profileRef)])}catch{throw error}
   assertOwner();const [walletSnap,opSnap,profileSnap]=fresh;
   if(walletSnap.exists()&&opSnap.exists())return replay(walletSnap.data(),opSnap.data(),profileSnap.exists()?profileSnap.data():{});
   if(attempt<4&&walletSnap.exists()&&(walletSnap.data().revision>revision||attempt===0))continue;
   throw error;
  }
 }
}
