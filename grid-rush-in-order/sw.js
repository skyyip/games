// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d9902abff5e6.js');self.addEventListener('install',()=>self.skipWaiting());