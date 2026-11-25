// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-163cd2e56a65.js');self.addEventListener('install',()=>self.skipWaiting());