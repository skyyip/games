// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-897f39bd50e8.js');self.addEventListener('install',()=>self.skipWaiting());