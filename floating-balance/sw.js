// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-42a1d7ac7e7b.js');self.addEventListener('install',()=>self.skipWaiting());