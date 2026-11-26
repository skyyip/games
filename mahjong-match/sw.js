// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-68ceb9e7c08c.js');self.addEventListener('install',()=>self.skipWaiting());