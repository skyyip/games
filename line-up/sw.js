// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7ed64c86b183.js');self.addEventListener('install',()=>self.skipWaiting());