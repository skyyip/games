// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9947d0b1deca.js');self.addEventListener('install',()=>self.skipWaiting());