// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-b0bafe9a6d3a.js');self.addEventListener('install',()=>self.skipWaiting());