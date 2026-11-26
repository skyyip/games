// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-52d25078cdd9.js');self.addEventListener('install',()=>self.skipWaiting());