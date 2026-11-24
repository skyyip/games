// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-3ee63d560e5c.js');self.addEventListener('install',()=>self.skipWaiting());