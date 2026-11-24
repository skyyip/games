// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9b05c6fc2779.js');self.addEventListener('install',()=>self.skipWaiting());