// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7e1a9c2e5123.js');self.addEventListener('install',()=>self.skipWaiting());