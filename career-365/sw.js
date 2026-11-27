// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-9f26eab4ae4d.js');self.addEventListener('install',()=>self.skipWaiting());