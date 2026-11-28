// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4950c165870c.js');self.addEventListener('install',()=>self.skipWaiting());