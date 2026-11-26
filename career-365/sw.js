// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1e5173db7d58.js');self.addEventListener('install',()=>self.skipWaiting());