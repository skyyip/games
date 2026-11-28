// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3771ecc02b5e.js');self.addEventListener('install',()=>self.skipWaiting());