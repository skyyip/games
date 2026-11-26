// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7c6abee0485a.js');self.addEventListener('install',()=>self.skipWaiting());