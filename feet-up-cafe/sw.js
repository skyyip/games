// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d08c2b90a8bb.js');self.addEventListener('install',()=>self.skipWaiting());