// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1b89e340a067.js');self.addEventListener('install',()=>self.skipWaiting());