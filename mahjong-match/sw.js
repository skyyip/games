// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2eb10891e34e.js');self.addEventListener('install',()=>self.skipWaiting());