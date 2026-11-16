// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-842af2d24664.js');self.addEventListener('install',()=>self.skipWaiting());