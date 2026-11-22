// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5e223d89307f.js');self.addEventListener('install',()=>self.skipWaiting());