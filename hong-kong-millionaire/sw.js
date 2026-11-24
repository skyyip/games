// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-15ad641b35e0.js');self.addEventListener('install',()=>self.skipWaiting());