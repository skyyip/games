// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1ca868280282.js');self.addEventListener('install',()=>self.skipWaiting());