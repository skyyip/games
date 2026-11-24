// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-23df397eee99.js');self.addEventListener('install',()=>self.skipWaiting());