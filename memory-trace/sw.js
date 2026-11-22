// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-04515e2ea3c2.js');self.addEventListener('install',()=>self.skipWaiting());