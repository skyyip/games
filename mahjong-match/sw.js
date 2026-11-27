// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6c2628d24f91.js');self.addEventListener('install',()=>self.skipWaiting());