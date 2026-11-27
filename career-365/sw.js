// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-123060ad6a41.js');self.addEventListener('install',()=>self.skipWaiting());