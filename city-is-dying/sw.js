// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-566fb84162d0.js');self.addEventListener('install',()=>self.skipWaiting());