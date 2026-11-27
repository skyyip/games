// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-07db604097ff.js');self.addEventListener('install',()=>self.skipWaiting());