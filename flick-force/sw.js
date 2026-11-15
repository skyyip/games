// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-99c7d15979e0.js');self.addEventListener('install',()=>self.skipWaiting());