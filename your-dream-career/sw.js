// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-6c0c6f56f0cd.js');self.addEventListener('install',()=>self.skipWaiting());