// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7fdb7fbbb0f0.js');self.addEventListener('install',()=>self.skipWaiting());