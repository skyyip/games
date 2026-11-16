// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a045ad843193.js');self.addEventListener('install',()=>self.skipWaiting());