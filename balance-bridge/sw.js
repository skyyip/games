// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-4a6b20c6bafa.js');self.addEventListener('install',()=>self.skipWaiting());