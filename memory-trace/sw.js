// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-93c9fe37d8fc.js');self.addEventListener('install',()=>self.skipWaiting());