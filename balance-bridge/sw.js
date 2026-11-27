// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-516a81cd282c.js');self.addEventListener('install',()=>self.skipWaiting());