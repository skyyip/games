// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-abdb10886a29.js');self.addEventListener('install',()=>self.skipWaiting());