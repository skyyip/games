// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5e2b3a48623f.js');self.addEventListener('install',()=>self.skipWaiting());