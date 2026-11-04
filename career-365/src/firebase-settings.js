// Reuse the site's public Firebase project; Career365 has a separate Auth app/session.
import {FIREBASE_CONFIG as projectConfig} from '../../frogger-jump/src/firebase-settings.js';
export const FIREBASE_CONFIG=globalThis.CAREER_FIREBASE_CONFIG===undefined?projectConfig:globalThis.CAREER_FIREBASE_CONFIG;
