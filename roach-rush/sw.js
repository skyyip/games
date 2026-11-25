// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0c623fa75e9b.js');self.addEventListener('install',()=>self.skipWaiting());