// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9906f48c1a51.js');self.addEventListener('install',()=>self.skipWaiting());