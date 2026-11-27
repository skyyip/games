// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5d6f91a134fa.js');self.addEventListener('install',()=>self.skipWaiting());