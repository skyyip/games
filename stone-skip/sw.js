// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-676b2803b1c1.js');self.addEventListener('install',()=>self.skipWaiting());