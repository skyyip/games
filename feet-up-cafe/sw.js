// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4a1c291d6df4.js');self.addEventListener('install',()=>self.skipWaiting());