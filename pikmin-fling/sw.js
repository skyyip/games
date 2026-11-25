// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9d24ad58a639.js');self.addEventListener('install',()=>self.skipWaiting());