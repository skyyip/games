// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fcd808803059.js');self.addEventListener('install',()=>self.skipWaiting());