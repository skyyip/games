// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-88b8edb8eeec.js');self.addEventListener('install',()=>self.skipWaiting());