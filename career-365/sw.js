// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3419a0a564d9.js');self.addEventListener('install',()=>self.skipWaiting());