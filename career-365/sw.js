// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0fec101d7c9d.js');self.addEventListener('install',()=>self.skipWaiting());