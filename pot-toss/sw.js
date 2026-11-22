// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-98eed7df432d.js');self.addEventListener('install',()=>self.skipWaiting());