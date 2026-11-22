// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1e44b503faee.js');self.addEventListener('install',()=>self.skipWaiting());