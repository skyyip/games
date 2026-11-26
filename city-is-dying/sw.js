// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7d7f55a5d80b.js');self.addEventListener('install',()=>self.skipWaiting());