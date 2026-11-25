// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1e67d98519f2.js');self.addEventListener('install',()=>self.skipWaiting());