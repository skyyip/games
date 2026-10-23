export const FAVOURITES_KEY='playground.favourites.v1';

export function readFavourites(storage, ids) {
  const fallback={state:{order:[...ids],favourites:[]},available:Boolean(storage)};
  let raw;
  try{raw=storage?.getItem(FAVOURITES_KEY);}catch{return {...fallback,available:false};}
  if(!raw)return fallback;
  try{
    const saved=JSON.parse(raw);
    if(saved?.version!==1 || !Array.isArray(saved.order) || !Array.isArray(saved.favourites))return fallback;
    const known=new Set(ids),clean=items=>[...new Set(items.filter(id=>known.has(id)))];
    const order=clean([...saved.order,...ids]),favourites=clean(saved.favourites);
    return {state:{order:[...order.filter(id=>favourites.includes(id)),...order.filter(id=>!favourites.includes(id))],favourites},available:true};
  }catch{return fallback;}
}

export function saveFavourites(storage, state) {
  try{storage.setItem(FAVOURITES_KEY,JSON.stringify({version:1,...state}));return true;}
  catch{return false;}
}

export function toggleFavourite(state, id) {
  if(!state.order.includes(id))return state;
  const selected=state.favourites.includes(id);
  const others=state.order.filter(item=>item!==id);
  return {
    order:selected?[...others,id]:[id,...others],
    favourites:selected?state.favourites.filter(item=>item!==id):[id,...state.favourites],
  };
}
