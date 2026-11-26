// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2821877646b0.js');self.addEventListener('install',()=>self.skipWaiting());