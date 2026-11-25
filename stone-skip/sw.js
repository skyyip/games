// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0d9e5f505c60.js');self.addEventListener('install',()=>self.skipWaiting());