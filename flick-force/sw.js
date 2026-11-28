// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-7ae845b8db49.js');self.addEventListener('install',()=>self.skipWaiting());