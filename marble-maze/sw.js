// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4fd2f9136960.js');self.addEventListener('install',()=>self.skipWaiting());