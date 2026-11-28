// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f7af4dd9a3a0.js');self.addEventListener('install',()=>self.skipWaiting());