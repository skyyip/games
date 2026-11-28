// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-f39613045db6.js');self.addEventListener('install',()=>self.skipWaiting());