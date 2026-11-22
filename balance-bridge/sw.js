// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-715a3830722d.js');self.addEventListener('install',()=>self.skipWaiting());