// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d2d18b0b3b33.js');self.addEventListener('install',()=>self.skipWaiting());