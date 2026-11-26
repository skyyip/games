// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d9242ce379ae.js');self.addEventListener('install',()=>self.skipWaiting());