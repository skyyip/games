// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1d5207f87cc8.js');self.addEventListener('install',()=>self.skipWaiting());