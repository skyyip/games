// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7757297258e1.js');self.addEventListener('install',()=>self.skipWaiting());