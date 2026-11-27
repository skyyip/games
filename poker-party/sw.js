// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-870988737906.js');self.addEventListener('install',()=>self.skipWaiting());