// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-925095a5f8ab.js');self.addEventListener('install',()=>self.skipWaiting());