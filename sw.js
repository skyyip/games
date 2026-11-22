// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-58cb3a076715.js');self.addEventListener('install',()=>self.skipWaiting());