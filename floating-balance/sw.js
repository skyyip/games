// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-af3f2726e91b.js');self.addEventListener('install',()=>self.skipWaiting());