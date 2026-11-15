// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-db3e49e0bdec.js');self.addEventListener('install',()=>self.skipWaiting());