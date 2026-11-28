// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-51832e0cad41.js');self.addEventListener('install',()=>self.skipWaiting());