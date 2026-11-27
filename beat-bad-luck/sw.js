// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-936866173c57.js');self.addEventListener('install',()=>self.skipWaiting());