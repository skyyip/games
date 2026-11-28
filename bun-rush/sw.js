// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-5b636c2b0155.js');self.addEventListener('install',()=>self.skipWaiting());