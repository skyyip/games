// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1e5055d04be4.js');self.addEventListener('install',()=>self.skipWaiting());