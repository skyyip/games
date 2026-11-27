// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7881cfee218d.js');self.addEventListener('install',()=>self.skipWaiting());