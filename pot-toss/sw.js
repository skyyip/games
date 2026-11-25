// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8a74ec8421cd.js');self.addEventListener('install',()=>self.skipWaiting());