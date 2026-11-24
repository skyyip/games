// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f62239a1e9a.js');self.addEventListener('install',()=>self.skipWaiting());