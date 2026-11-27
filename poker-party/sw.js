// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-09375abe30f5.js');self.addEventListener('install',()=>self.skipWaiting());