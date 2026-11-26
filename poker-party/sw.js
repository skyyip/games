// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-520a38840b99.js');self.addEventListener('install',()=>self.skipWaiting());