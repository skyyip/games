// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-ae40ff2eedc1.js');self.addEventListener('install',()=>self.skipWaiting());