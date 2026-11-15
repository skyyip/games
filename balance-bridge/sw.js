// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-28b189e130a3.js');self.addEventListener('install',()=>self.skipWaiting());