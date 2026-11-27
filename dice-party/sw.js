// Upgrade bridge for previously installed service workers. Application assets use content hashes.
importScripts('./sw-1749e54b2c29.js');self.addEventListener('install',()=>self.skipWaiting());