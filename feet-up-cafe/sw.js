// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f34e337d69cc.js');self.addEventListener('install',()=>self.skipWaiting());