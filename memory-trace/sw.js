// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-74a0443a8d1a.js');self.addEventListener('install',()=>self.skipWaiting());