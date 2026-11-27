// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-0a90679e4d0d.js');self.addEventListener('install',()=>self.skipWaiting());