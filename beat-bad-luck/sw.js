// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-fd4ab030e836.js');self.addEventListener('install',()=>self.skipWaiting());