// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-646541e6fe1c.js');self.addEventListener('install',()=>self.skipWaiting());