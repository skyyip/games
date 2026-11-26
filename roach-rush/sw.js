// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3b8df65c7838.js');self.addEventListener('install',()=>self.skipWaiting());