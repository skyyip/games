// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-78ff4ab4a821.js');self.addEventListener('install',()=>self.skipWaiting());