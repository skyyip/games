// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e3b4ee7a3c9.js');self.addEventListener('install',()=>self.skipWaiting());