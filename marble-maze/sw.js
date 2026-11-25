// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2c5952de2c70.js');self.addEventListener('install',()=>self.skipWaiting());