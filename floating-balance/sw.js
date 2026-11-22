// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-2f6de2b97f9d.js');self.addEventListener('install',()=>self.skipWaiting());