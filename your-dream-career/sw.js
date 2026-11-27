// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d19db9df8603.js');self.addEventListener('install',()=>self.skipWaiting());