// This game's own lazy Firebase SDK entry point.
export const loadAuthSDK=()=>Promise.all([import('firebase/app'),import('firebase/auth')]);
