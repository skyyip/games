// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-53b1d4db2ea9.js');self.addEventListener('install',()=>self.skipWaiting());