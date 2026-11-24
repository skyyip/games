// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-e21df91cfb29.js');self.addEventListener('install',()=>self.skipWaiting());