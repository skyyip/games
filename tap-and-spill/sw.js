// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f24432fe1bee.js');self.addEventListener('install',()=>self.skipWaiting());