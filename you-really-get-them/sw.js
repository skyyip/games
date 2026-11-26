// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-eb273fe8f3ba.js');self.addEventListener('install',()=>self.skipWaiting());