// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-40a8c926d32a.js');self.addEventListener('install',()=>self.skipWaiting());