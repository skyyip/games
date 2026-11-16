// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-26b27c745b6b.js');self.addEventListener('install',()=>self.skipWaiting());