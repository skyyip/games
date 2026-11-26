// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d6e676ae89ae.js');self.addEventListener('install',()=>self.skipWaiting());