// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9c6499b99f54.js');self.addEventListener('install',()=>self.skipWaiting());