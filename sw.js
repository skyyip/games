// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2a2305317147.js');self.addEventListener('install',()=>self.skipWaiting());