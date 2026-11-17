// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-78ce32666489.js');self.addEventListener('install',()=>self.skipWaiting());