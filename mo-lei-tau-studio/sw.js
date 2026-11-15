// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-708f524f0aea.js');self.addEventListener('install',()=>self.skipWaiting());