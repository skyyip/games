// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-76c5a18fae2e.js');self.addEventListener('install',()=>self.skipWaiting());