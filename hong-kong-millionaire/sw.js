// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2b67ce90f487.js');self.addEventListener('install',()=>self.skipWaiting());