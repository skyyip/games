// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-149e9bb7655b.js');self.addEventListener('install',()=>self.skipWaiting());