// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-94950a30361a.js');self.addEventListener('install',()=>self.skipWaiting());