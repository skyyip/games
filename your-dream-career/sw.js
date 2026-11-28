// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a99d5835f7fe.js');self.addEventListener('install',()=>self.skipWaiting());