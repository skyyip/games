// Shared lazy SDK loader; both games use the existing Firebase dependency.
export const loadAuthSDK=()=>Promise.all([import('firebase/app'),import('firebase/auth')]);
