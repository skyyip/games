// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-649a204e84d0.js');self.addEventListener('install',()=>self.skipWaiting());