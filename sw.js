// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-953448075d41.js');self.addEventListener('install',()=>self.skipWaiting());