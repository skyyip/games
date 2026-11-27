// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-66a3719db9fa.js');self.addEventListener('install',()=>self.skipWaiting());