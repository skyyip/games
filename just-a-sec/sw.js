// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-232af930e401.js');self.addEventListener('install',()=>self.skipWaiting());