// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1d5ee2ec8b19.js');self.addEventListener('install',()=>self.skipWaiting());