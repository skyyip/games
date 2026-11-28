// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-d594433194e4.js');self.addEventListener('install',()=>self.skipWaiting());