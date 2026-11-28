// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8887f934ba03.js');self.addEventListener('install',()=>self.skipWaiting());