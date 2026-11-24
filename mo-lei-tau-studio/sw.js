// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d36b73fc5591.js');self.addEventListener('install',()=>self.skipWaiting());