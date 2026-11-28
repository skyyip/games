// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-434d6e92ca97.js');self.addEventListener('install',()=>self.skipWaiting());