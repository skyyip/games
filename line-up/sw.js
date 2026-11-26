// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-92d2774a3787.js');self.addEventListener('install',()=>self.skipWaiting());