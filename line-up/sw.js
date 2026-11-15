// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-91ba7017b7da.js');self.addEventListener('install',()=>self.skipWaiting());