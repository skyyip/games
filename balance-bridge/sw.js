// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f98922291179.js');self.addEventListener('install',()=>self.skipWaiting());