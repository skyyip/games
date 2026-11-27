// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4a9d3a1525ac.js');self.addEventListener('install',()=>self.skipWaiting());