// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-a825355bb934.js');self.addEventListener('install',()=>self.skipWaiting());