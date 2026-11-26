// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-90f682b1d224.js');self.addEventListener('install',()=>self.skipWaiting());