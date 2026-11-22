// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-551d16005007.js');self.addEventListener('install',()=>self.skipWaiting());