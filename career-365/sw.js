// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8dde19782bc8.js');self.addEventListener('install',()=>self.skipWaiting());