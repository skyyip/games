// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fdd549416c2b.js');self.addEventListener('install',()=>self.skipWaiting());