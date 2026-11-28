// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f67d7dfd21ba.js');self.addEventListener('install',()=>self.skipWaiting());