// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-c4abebda2f7b.js');self.addEventListener('install',()=>self.skipWaiting());