// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6b69edbd5d45.js');self.addEventListener('install',()=>self.skipWaiting());