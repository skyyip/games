// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-bd2206f924db.js');self.addEventListener('install',()=>self.skipWaiting());