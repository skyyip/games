// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0e9c9ae03498.js');self.addEventListener('install',()=>self.skipWaiting());