// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7ca8e563eb0b.js');self.addEventListener('install',()=>self.skipWaiting());