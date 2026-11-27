// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4ac1063de388.js');self.addEventListener('install',()=>self.skipWaiting());