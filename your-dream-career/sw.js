// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3a24bf593f39.js');self.addEventListener('install',()=>self.skipWaiting());