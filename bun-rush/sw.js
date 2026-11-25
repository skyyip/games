// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-964d64ce1965.js');self.addEventListener('install',()=>self.skipWaiting());