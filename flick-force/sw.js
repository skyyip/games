// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9f0bd571ecb0.js');self.addEventListener('install',()=>self.skipWaiting());