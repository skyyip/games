// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-8a6b1c81eb1e.js');self.addEventListener('install',()=>self.skipWaiting());