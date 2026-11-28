// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1d064b102230.js');self.addEventListener('install',()=>self.skipWaiting());