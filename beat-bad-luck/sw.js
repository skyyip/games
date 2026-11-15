// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-75c9baee310e.js');self.addEventListener('install',()=>self.skipWaiting());