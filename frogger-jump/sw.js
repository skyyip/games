// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d279825a29b1.js');self.addEventListener('install',()=>self.skipWaiting());