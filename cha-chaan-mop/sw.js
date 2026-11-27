// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2c3034aff048.js');self.addEventListener('install',()=>self.skipWaiting());