// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-987f58c2a4c9.js');self.addEventListener('install',()=>self.skipWaiting());