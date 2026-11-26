// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3bda743418b0.js');self.addEventListener('install',()=>self.skipWaiting());